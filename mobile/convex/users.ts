
import { mutation, query } from "./_generated/server"
import { ConvexError, v } from "convex/values"
import { getCurrentUserOrThrow, userByTokenIdentifier } from "./lib/users"
import type { Doc } from "./_generated/dataModel"
import { UserStatus, UserRoles } from "@/shared/enums"

const DEFAULT_USER_ROLES: UserRoles[] = ["TOURIST"]
const DEFAULT_USER_STATUS: UserStatus = "NEEDS_ONBOARDING"

export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx)
    return user
  },
});


export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Not signed in")

    const existing = await userByTokenIdentifier(ctx, identity.tokenIdentifier)
    const now = Date.now()

    const authFields = {
      email: identity.email!,
      updatedAt: now,
      // add fields when needed if updated on clerk user object
      // firstName: identity.givenName,
      // lastName: identity.familyName,
    }

    if (existing) {
      const patch: Partial<Doc<"users">>= {}
      if (existing.email !== authFields.email) patch.email = authFields.email
      // if (existing.firstName !== authFields.firstName) patch.firstName = authFields.firstName
      // if (existing.lastName !== authFields.lastName) patch.lastName = authFields.lastName

      if (Object.keys(patch).length > 0) {
        patch.updatedAt = now
        await ctx.db.patch(existing._id, patch)
      }
      return existing._id
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      ...authFields,
      status: DEFAULT_USER_STATUS,
      roles: DEFAULT_USER_ROLES,
    })
  },
});
