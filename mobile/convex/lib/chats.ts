import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export async function tripMembershipOrThrow(
  ctx: QueryCtx | MutationCtx,
  tripId: Id<"trips">,
  userId: Id<"users">,
) {
  const membership = await ctx.db
    .query("tripMembers")
    .withIndex("by_tripId_and_userId", (q) => q.eq("tripId", tripId).eq("userId", userId))
    .unique();
  if (!membership) throw new ConvexError("Not a member of this trip");
  return membership;
}

export async function assertChatAccess(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"users">,
  chat: Doc<"chats">,
) {
  const membership = await tripMembershipOrThrow(ctx, chat.tripId, user._id);
  if (chat.kind === "WORKERS" && membership.role === "TOURIST") {
    throw new ConvexError("Not authorized");
  }
  return membership;
}
