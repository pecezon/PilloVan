import { convexTest } from "convex-test"
import { describe, expect, test } from "vitest"
import { api } from "./_generated/api"
import schema from "./schema"
import { modules } from "./test.setup"

const identity = {
  tokenIdentifier: "https://clerk.test|user_123",
  subject: "user_123",
  issuer: "https://clerk.test",
  email: "sarah@example.com",
}

const onboardingArgs = {
  firstName: "Sarah",
  lastName: "Vega",
  phone: "+15555550100",
  phoneAlt: "+15555550101",
  age: 34,
  gender: "FEMALE" as const,
}

function createTestBackend() {
  return convexTest(schema, modules)
}

describe("users.onboardUser", () => {
  test("rejects unauthenticated users", async () => {
    const t = createTestBackend()

    await expect(
      t.mutation(api.users.onboardUser, onboardingArgs)
    ).rejects.toThrow("Not signed in")
  })

  test("rejects authenticated users without a user record", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    await expect(
      asUser.mutation(api.users.onboardUser, onboardingArgs)
    ).rejects.toThrow("User not found")
  })

  test("patches profile fields and marks the user onboarded", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    const userId = await asUser.mutation(api.users.ensureUser, {})

    await asUser.mutation(api.users.onboardUser, onboardingArgs)

    const user = await asUser.query(api.users.me, {})

    expect(user).toMatchObject({
      _id: userId,
      ...onboardingArgs,
      status: "ONBOARDED",
    })
  })

  test("preserves auth-owned fields and roles", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    await asUser.mutation(api.users.ensureUser, {})
    await asUser.mutation(api.users.onboardUser, onboardingArgs)

    const user = await asUser.query(api.users.me, {})

    expect(user).toMatchObject({
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      roles: ["TOURIST"],
    })
  })

  test("rejects already onboarded users", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    await asUser.mutation(api.users.ensureUser, {})
    await asUser.mutation(api.users.onboardUser, onboardingArgs)

    await expect(
      asUser.mutation(api.users.onboardUser, onboardingArgs)
    ).rejects.toThrow("User already onboarded")
  })

  test("rejects ages outside the supported range", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    await asUser.mutation(api.users.ensureUser, {})

    await expect(
      asUser.mutation(api.users.onboardUser, {
        ...onboardingArgs,
        age: 151,
      })
    ).rejects.toThrow("Age out of range")
  })

  test("rejects non-integer ages", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    await asUser.mutation(api.users.ensureUser, {})

    await expect(
      asUser.mutation(api.users.onboardUser, {
        ...onboardingArgs,
        age: 34.5,
      })
    ).rejects.toThrow("Age out of range")
  })

  test("rejects blank required fields", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    await asUser.mutation(api.users.ensureUser, {})

    await expect(
      asUser.mutation(api.users.onboardUser, {
        ...onboardingArgs,
        firstName: "   ",
      })
    ).rejects.toThrow("First name, last name, and phone are required")
  })

  test("rejects names longer than 100 characters", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    await asUser.mutation(api.users.ensureUser, {})

    await expect(
      asUser.mutation(api.users.onboardUser, {
        ...onboardingArgs,
        firstName: "a".repeat(101),
      })
    ).rejects.toThrow("Names must be 100 characters or fewer")
  })

  test("rejects phone numbers longer than 50 characters", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    await asUser.mutation(api.users.ensureUser, {})

    await expect(
      asUser.mutation(api.users.onboardUser, {
        ...onboardingArgs,
        phoneAlt: "1".repeat(51),
      })
    ).rejects.toThrow("Phone numbers must be 50 characters or fewer")
  })

  test("trims profile fields before persisting", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    await asUser.mutation(api.users.ensureUser, {})
    await asUser.mutation(api.users.onboardUser, {
      ...onboardingArgs,
      firstName: "  Sarah  ",
      phoneAlt: "   ",
    })

    const user = await asUser.query(api.users.me, {})

    expect(user).toMatchObject({
      firstName: "Sarah",
      status: "ONBOARDED",
    })
    expect(user.phoneAlt).toBeUndefined()
  })
})

describe("users.ensureUser", () => {
  test("creates a new user from the authenticated identity", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    const userId = await asUser.mutation(api.users.ensureUser, {})
    const user = await asUser.query(api.users.me, {})

    expect(user).toMatchObject({
      _id: userId,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      status: "NEEDS_ONBOARDING",
      roles: ["TOURIST"],
    })
  })

  test("returns the existing user id when the identity already exists", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    const firstUserId = await asUser.mutation(api.users.ensureUser, {})
    const secondUserId = await asUser.mutation(api.users.ensureUser, {})

    expect(secondUserId).toBe(firstUserId)
  })

  test("updates the stored email when the auth identity changes it", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)
    const asRenamedUser = t.withIdentity({
      ...identity,
      email: "new-sarah@example.com",
    })

    const userId = await asUser.mutation(api.users.ensureUser, {})
    const existingUser = await asUser.query(api.users.me, {})

    await asRenamedUser.mutation(api.users.ensureUser, {})
    const updatedUser = await asRenamedUser.query(api.users.me, {})

    expect(updatedUser).toMatchObject({
      _id: userId,
      email: "new-sarah@example.com",
      tokenIdentifier: identity.tokenIdentifier,
      status: existingUser.status,
      roles: existingUser.roles,
    })
    expect(updatedUser.updatedAt).toBeGreaterThanOrEqual(existingUser.updatedAt)
  })

  test("rejects unauthenticated calls", async () => {
    const t = createTestBackend()

    await expect(t.mutation(api.users.ensureUser, {})).rejects.toThrow(
      "Not signed in"
    )
  })
})

describe("users.me", () => {
  test("rejects authenticated users without a user record", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    await expect(asUser.query(api.users.me, {})).rejects.toThrow(
      "User not found"
    )
  })

  test("returns the current user for the authenticated identity", async () => {
    const t = createTestBackend()
    const asUser = t.withIdentity(identity)

    const userId = await asUser.mutation(api.users.ensureUser, {})
    const user = await asUser.query(api.users.me, {})

    expect(user._id).toBe(userId)
  })
})
