import { convexTest } from "convex-test"
import { describe, expect, test } from "vitest"
import { api } from "./_generated/api"
import schema from "./schema"
import { modules } from "./test.setup"
import type { ChatKind, UserRoles } from "../shared/enums"
import type { Id } from "./_generated/dataModel"

const companyIdentity = {
  tokenIdentifier: "https://clerk.test|company_1",
  subject: "company_1",
  issuer: "https://clerk.test",
  email: "company@example.com",
}

const touristIdentity = {
  tokenIdentifier: "https://clerk.test|tourist_1",
  subject: "tourist_1",
  issuer: "https://clerk.test",
  email: "tourist@example.com",
}

const outsiderIdentity = {
  tokenIdentifier: "https://clerk.test|outsider_1",
  subject: "outsider_1",
  issuer: "https://clerk.test",
  email: "outsider@example.com",
}

function createTestBackend() {
  return convexTest(schema, modules)
}

async function seedUser(
  t: ReturnType<typeof createTestBackend>,
  identity: { tokenIdentifier: string; email: string },
  roles: UserRoles[]
) {
  const asUser = t.withIdentity(identity)
  const userId = (await asUser.mutation(api.users.ensureUser, {})) as Id<"users">
  await t.run(async (ctx) => {
    await ctx.db.patch(userId, { roles })
  })
  return userId
}

// Seeds a company + tourist + a trip the tourist is a member of, then ensures chats.
async function seedTripWithChats(t: ReturnType<typeof createTestBackend>) {
  await seedUser(t, companyIdentity, ["COMPANY"])
  await seedUser(t, touristIdentity, ["TOURIST"])

  const tourId = (await t
    .withIdentity(companyIdentity)
    .mutation(api.tours.createTour, {
      name: "Cenote tour",
      place: "Tulum",
      occupancy: 12,
    })) as Id<"tours">

  const tripId = (await t.withIdentity(companyIdentity).mutation(api.trips.createTrip, {
    tourId,
    pickupTime: Date.now() + 3_600_000,
    partySize: 2,
    pickupLocation: "Cancun Airport",
    dropoffLocation: "Tulum Centro",
    participantEmails: [touristIdentity.email],
  })) as Id<"trips">

  await t.withIdentity(companyIdentity).mutation(api.chats.ensureTripChats, { tripId })

  return { tripId }
}

async function chatByKind(
  t: ReturnType<typeof createTestBackend>,
  tripId: Id<"trips">,
  kind: ChatKind
) {
  return await t.run(async (ctx) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_tripId_and_kind", (q) =>
        q.eq("tripId", tripId).eq("kind", kind)
      )
      .unique()
    return chat!._id
  })
}

const firstPage = { numItems: 50, cursor: null }

describe("chats.ensureTripChats", () => {
  test("creates one GENERAL and one WORKERS chat", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)

    const chats = await t.run(async (ctx) =>
      ctx.db
        .query("chats")
        .withIndex("by_tripId", (q) => q.eq("tripId", tripId))
        .collect()
    )

    const kinds = chats.map((chat) => chat.kind).sort()
    expect(kinds).toEqual(["GENERAL", "WORKERS"])
  })

  test("is idempotent", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)

    await t.withIdentity(companyIdentity).mutation(api.chats.ensureTripChats, { tripId })

    const chats = await t.run(async (ctx) =>
      ctx.db
        .query("chats")
        .withIndex("by_tripId", (q) => q.eq("tripId", tripId))
        .collect()
    )
    expect(chats).toHaveLength(2)
  })

  test("rejects non-members", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)
    await seedUser(t, outsiderIdentity, ["TOURIST"])

    await expect(
      t.withIdentity(outsiderIdentity).mutation(api.chats.ensureTripChats, { tripId })
    ).rejects.toThrow("Not a member of this trip")
  })
})

describe("chats.listMyTripChats", () => {
  test("a tourist sees only the general chat", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)

    const result = await t
      .withIdentity(touristIdentity)
      .query(api.chats.listMyTripChats, { tripId })

    expect(result.memberRole).toBe("TOURIST")
    expect(result.chats.map((c) => c.kind)).toEqual(["GENERAL"])
  })

  test("a company member sees both chats", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)

    const result = await t
      .withIdentity(companyIdentity)
      .query(api.chats.listMyTripChats, { tripId })

    expect(result.memberRole).toBe("COMPANY")
    expect(result.chats.map((c) => c.kind).sort()).toEqual(["GENERAL", "WORKERS"])
  })
})

describe("chats.sendMessage", () => {
  test("a member posts to the general chat", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)
    const generalId = await chatByKind(t, tripId, "GENERAL")

    const messageId = await t
      .withIdentity(touristIdentity)
      .mutation(api.chats.sendMessage, { chatId: generalId, body: "  Hello!  " })

    const message = await t.run(async (ctx) => ctx.db.get(messageId))
    expect(message).toMatchObject({ chatId: generalId, body: "Hello!" })
  })

  test("a tourist cannot post to the workers chat", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)
    const workersId = await chatByKind(t, tripId, "WORKERS")

    await expect(
      t
        .withIdentity(touristIdentity)
        .mutation(api.chats.sendMessage, { chatId: workersId, body: "hi" })
    ).rejects.toThrow("Not authorized")
  })

  test("a non-member cannot post", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)
    await seedUser(t, outsiderIdentity, ["TOURIST"])
    const generalId = await chatByKind(t, tripId, "GENERAL")

    await expect(
      t
        .withIdentity(outsiderIdentity)
        .mutation(api.chats.sendMessage, { chatId: generalId, body: "hi" })
    ).rejects.toThrow("Not a member of this trip")
  })

  test("rejects blank messages", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)
    const generalId = await chatByKind(t, tripId, "GENERAL")

    await expect(
      t
        .withIdentity(companyIdentity)
        .mutation(api.chats.sendMessage, { chatId: generalId, body: "   " })
    ).rejects.toThrow("Message cannot be empty")
  })

  test("rejects over-long messages", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)
    const generalId = await chatByKind(t, tripId, "GENERAL")

    await expect(
      t.withIdentity(companyIdentity).mutation(api.chats.sendMessage, {
        chatId: generalId,
        body: "a".repeat(4001),
      })
    ).rejects.toThrow("4000 characters or fewer")
  })
})

describe("chats.listMessages", () => {
  test("returns messages newest-first with sender info and role", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)
    const generalId = await chatByKind(t, tripId, "GENERAL")

    await t
      .withIdentity(companyIdentity)
      .mutation(api.chats.sendMessage, { chatId: generalId, body: "first" })
    await t
      .withIdentity(touristIdentity)
      .mutation(api.chats.sendMessage, { chatId: generalId, body: "second" })

    const result = await t
      .withIdentity(touristIdentity)
      .query(api.chats.listMessages, { chatId: generalId, paginationOpts: firstPage })

    expect(result.page.map((m) => m.body)).toEqual(["second", "first"])
    expect(result.page[1].sender).toMatchObject({ role: "COMPANY" })
  })

  test("a tourist cannot read the workers chat", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)
    const workersId = await chatByKind(t, tripId, "WORKERS")

    await expect(
      t
        .withIdentity(touristIdentity)
        .query(api.chats.listMessages, { chatId: workersId, paginationOpts: firstPage })
    ).rejects.toThrow("Not authorized")
  })

  test("a non-member cannot read", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)
    await seedUser(t, outsiderIdentity, ["TOURIST"])
    const generalId = await chatByKind(t, tripId, "GENERAL")

    await expect(
      t
        .withIdentity(outsiderIdentity)
        .query(api.chats.listMessages, { chatId: generalId, paginationOpts: firstPage })
    ).rejects.toThrow("Not a member of this trip")
  })

  test("rejects unauthenticated callers", async () => {
    const t = createTestBackend()
    const { tripId } = await seedTripWithChats(t)
    const generalId = await chatByKind(t, tripId, "GENERAL")

    await expect(
      t.query(api.chats.listMessages, { chatId: generalId, paginationOpts: firstPage })
    ).rejects.toThrow("Not signed in")
  })
})
