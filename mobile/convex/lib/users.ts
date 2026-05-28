import { ConvexError } from "convex/values"
import type { MutationCtx, QueryCtx } from "../_generated/server"

export async function userByTokenIdentifier(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string
) {
  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", tokenIdentifier)
    )
    .unique()
}

export async function getCurrentUserOrThrow(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new ConvexError("Not signed in")

  const user = await userByTokenIdentifier(ctx, identity.tokenIdentifier)
  if (!user) throw new ConvexError("User not found")

  return user
}

export async function userByEmail(
  ctx: QueryCtx | MutationCtx,
  email: string
) {
  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique()
}

export async function getCurrentCompanyUserOrThrow(
  ctx: QueryCtx | MutationCtx
) {
  const user = await getCurrentUserOrThrow(ctx)
  const isCompanyOrAdmin =
    user.roles.includes("COMPANY") || user.roles.includes("ADMIN")
  if (!isCompanyOrAdmin) throw new ConvexError("Not authorized")
  return user
}
