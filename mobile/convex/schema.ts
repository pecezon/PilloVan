import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { userStatus, genderValidator, userRolesValidator } from "../shared/enums"

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
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

})
