import { convexTest } from "convex-test"
import { describe, expect, test } from "vitest"
import { api } from "./_generated/api"
import schema from "./schema"
import { modules } from "./test.setup"
import type { Id } from "./_generated/dataModel"
import type { UserRoles } from "../shared/enums"

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

const tourArgs = {
  name: "Cenote tour",
  place: "Tulum",
  occupancy: 12,
  description: "A relaxing cenote dive",
}

describe("tours.createTour", () => {
  test("rejects unauthenticated callers", async () => {
    const t = createTestBackend()
    await expect(t.mutation(api.tours.createTour, tourArgs)).rejects.toThrow(
      "Not signed in"
    )
  })

  test("rejects tourists", async () => {
    const t = createTestBackend()
    await seedUser(t, touristIdentity, ["TOURIST"])

    await expect(
      t.withIdentity(touristIdentity).mutation(api.tours.createTour, tourArgs)
    ).rejects.toThrow("Not authorized")
  })

  test("creates a tour for a company user", async () => {
    const t = createTestBackend()
    const companyId = await seedUser(t, companyIdentity, ["COMPANY"])
    const asCompany = t.withIdentity(companyIdentity)

    const tourId = await asCompany.mutation(api.tours.createTour, tourArgs)

    const tour = await t.run(async (ctx) => ctx.db.get(tourId))
    expect(tour).toMatchObject({
      name: tourArgs.name,
      place: tourArgs.place,
      occupancy: tourArgs.occupancy,
      companyId,
    })
  })

  test("rejects duplicate tour names for the same company", async () => {
    const t = createTestBackend()
    await seedUser(t, companyIdentity, ["COMPANY"])
    const asCompany = t.withIdentity(companyIdentity)

    await asCompany.mutation(api.tours.createTour, tourArgs)

    await expect(
      asCompany.mutation(api.tours.createTour, {
        ...tourArgs,
        name: "  cenote tour  ",
      })
    ).rejects.toThrow("already have a tour with that name")
  })

  test("rejects blank required fields", async () => {
    const t = createTestBackend()
    await seedUser(t, companyIdentity, ["COMPANY"])

    await expect(
      t.withIdentity(companyIdentity).mutation(api.tours.createTour, {
        ...tourArgs,
        name: "   ",
      })
    ).rejects.toThrow("Tour name and place are required")
  })

  test("rejects non-positive occupancy", async () => {
    const t = createTestBackend()
    await seedUser(t, companyIdentity, ["COMPANY"])

    await expect(
      t.withIdentity(companyIdentity).mutation(api.tours.createTour, {
        ...tourArgs,
        occupancy: 0,
      })
    ).rejects.toThrow("Occupancy must be a positive whole number")
  })
})

describe("tours.listMyCompanyTours", () => {
  test("rejects tourists", async () => {
    const t = createTestBackend()
    await seedUser(t, touristIdentity, ["TOURIST"])

    await expect(
      t.withIdentity(touristIdentity).query(api.tours.listMyCompanyTours, {})
    ).rejects.toThrow("Not authorized")
  })

  test("returns only the caller company's tours", async () => {
    const t = createTestBackend()
    await seedUser(t, companyIdentity, ["COMPANY"])
    const asCompany = t.withIdentity(companyIdentity)
    await asCompany.mutation(api.tours.createTour, tourArgs)

    const otherCompany = {
      tokenIdentifier: "https://clerk.test|company_2",
      subject: "company_2",
      issuer: "https://clerk.test",
      email: "company2@example.com",
    }
    await seedUser(t, otherCompany, ["COMPANY"])
    await t
      .withIdentity(otherCompany)
      .mutation(api.tours.createTour, { ...tourArgs, name: "Other tour" })

    const tours = await asCompany.query(api.tours.listMyCompanyTours, {})
    expect(tours).toHaveLength(1)
    expect(tours[0]).toMatchObject({ name: tourArgs.name })
  })
})
