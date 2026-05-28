import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  userStatus,
  genderValidator,
  userRolesValidator,
  tripStatusValidator,
  chatKindValidator,
} from "../shared/enums";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneAlt: v.optional(v.string()),
    age: v.optional(v.number()),
    gender: v.optional(genderValidator),
    whapiId: v.optional(v.string()),
    status: userStatus,
    roles: v.array(userRolesValidator),
    updatedAt: v.number(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_email", ["email"]),
  tours: defineTable({
    name: v.string(),
    place: v.string(),
    occupancy: v.number(),
    description: v.optional(v.string()),
    companyId: v.id("users"),
    updatedAt: v.number(),
  }).index("by_companyId", ["companyId"]),
  trips: defineTable({
    tourId: v.id("tours"),
    pickupTime: v.number(),
    partySize: v.number(),
    pickupLocation: v.string(),
    dropoffLocation: v.string(),
    status: tripStatusValidator,
    whaGroupLink: v.optional(v.string()),
  }).index("by_tourId", ["tourId"]),
  tripMembers: defineTable({
    tripId: v.id("trips"),
    userId: v.id("users"),
    role: userRolesValidator,
  })
    .index("by_userId", ["userId"])
    .index("by_tripId", ["tripId"])
    .index("by_tripId_and_userId", ["tripId", "userId"]),
  chats: defineTable({
    tripId: v.id("trips"),
    kind: chatKindValidator,
    updatedAt: v.number(),
  })
    .index("by_tripId", ["tripId"])
    .index("by_tripId_and_kind", ["tripId", "kind"]),
  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    body: v.string(),
  }).index("by_chatId", ["chatId"]),
});
