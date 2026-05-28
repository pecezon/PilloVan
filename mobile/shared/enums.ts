import { v, type Infer } from "convex/values"

export const userStatus = v.union(
  v.literal("NEEDS_ONBOARDING"),
  v.literal("ONBOARDED"),
)
export type UserStatus = Infer<typeof userStatus>

export const userRolesValidator = v.union(
  v.literal("TOURIST"),
  v.literal("WORKER"),
  v.literal("COMPANY"),
  v.literal("ADMIN"),
)
export type UserRoles = Infer<typeof userRolesValidator>

export const genderValidator = v.union(
  v.literal("MALE"),
  v.literal("FEMALE"),
  v.literal("OTHER"),
)
export type Gender = Infer<typeof genderValidator>
