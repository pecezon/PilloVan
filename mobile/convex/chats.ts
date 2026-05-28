import { mutation, query } from "./_generated/server"
import { ConvexError, v } from "convex/values"
import { paginationOptsValidator } from "convex/server"
import { getCurrentUserOrThrow } from "./lib/users"
import { assertChatAccess, tripMembershipOrThrow } from "./lib/chats"
import type { ChatKind, UserRoles } from "../shared/enums"
import type { Doc, Id } from "./_generated/dataModel"

const MAX_MESSAGE_LENGTH = 4000
const CHAT_KINDS: ChatKind[] = ["GENERAL", "WORKERS"]

export const ensureTripChats = mutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    await tripMembershipOrThrow(ctx, args.tripId, user._id)

    for (const kind of CHAT_KINDS) {
      const existing = await ctx.db
        .query("chats")
        .withIndex("by_tripId_and_kind", (q) =>
          q.eq("tripId", args.tripId).eq("kind", kind)
        )
        .unique()
      if (!existing) {
        await ctx.db.insert("chats", {
          tripId: args.tripId,
          kind,
          updatedAt: Date.now(),
        })
      }
    }

    return null
  },
})

export const listMyTripChats = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const membership = await tripMembershipOrThrow(ctx, args.tripId, user._id)

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect()

    const visible = chats.filter(
      (chat) => chat.kind === "GENERAL" || membership.role !== "TOURIST"
    )

    return {
      memberRole: membership.role,
      chats: visible,
    }
  },
})

export const listMessages = query({
  args: { chatId: v.id("chats"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const chat = await ctx.db.get(args.chatId)
    if (!chat) throw new ConvexError("Chat not found")
    await assertChatAccess(ctx, user, chat)

    const result = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .paginate(args.paginationOpts)

    const userCache = new Map<Id<"users">, Doc<"users"> | null>()
    const roleCache = new Map<Id<"users">, UserRoles | null>()

    const page = []
    for (const message of result.page) {
      let sender = userCache.get(message.senderId)
      if (sender === undefined) {
        sender = await ctx.db.get(message.senderId)
        userCache.set(message.senderId, sender)
      }

      let role = roleCache.get(message.senderId)
      if (role === undefined) {
        const membership = await ctx.db
          .query("tripMembers")
          .withIndex("by_tripId_and_userId", (q) =>
            q.eq("tripId", chat.tripId).eq("userId", message.senderId)
          )
          .unique()
        role = membership?.role ?? null
        roleCache.set(message.senderId, role)
      }

      page.push({
        ...message,
        sender: sender
          ? { firstName: sender.firstName, lastName: sender.lastName, role }
          : null,
      })
    }

    return { ...result, page }
  },
})

export const sendMessage = mutation({
  args: { chatId: v.id("chats"), body: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const chat = await ctx.db.get(args.chatId)
    if (!chat) throw new ConvexError("Chat not found")
    await assertChatAccess(ctx, user, chat)

    const body = args.body.trim()
    if (!body) throw new ConvexError("Message cannot be empty")
    if (body.length > MAX_MESSAGE_LENGTH) {
      throw new ConvexError(
        `Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer`
      )
    }

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: user._id,
      body,
    })

    await ctx.db.patch(args.chatId, { updatedAt: Date.now() })

    return messageId
  },
})
