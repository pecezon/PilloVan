import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getCurrentUserOrThrow, userByTokenIdentifier } from "./lib/users";
import type { Doc } from "./_generated/dataModel";
import { UserStatus, UserRoles, genderValidator } from "../shared/enums";

const DEFAULT_USER_ROLES: UserRoles[] = ["TOURIST"];
const DEFAULT_USER_STATUS: UserStatus = "NEEDS_ONBOARDING";
const MIN_AGE = 1;
const MAX_AGE = 150;
const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 50;

export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return user;
  },
});

export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not signed in");

    const existing = await userByTokenIdentifier(ctx, identity.tokenIdentifier);
    const now = Date.now();

    const authFields = {
      email: identity.email!,
      updatedAt: now,
      // add fields when needed if updated on clerk user object
      // firstName: identity.givenName,
      // lastName: identity.familyName,
    };

    if (existing) {
      const patch: Partial<Doc<"users">> = {};
      if (existing.email !== authFields.email) patch.email = authFields.email;
      // if (existing.firstName !== authFields.firstName) patch.firstName = authFields.firstName
      // if (existing.lastName !== authFields.lastName) patch.lastName = authFields.lastName

      if (Object.keys(patch).length > 0) {
        patch.updatedAt = now;
        await ctx.db.patch(existing._id, patch);
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      ...authFields,
      status: DEFAULT_USER_STATUS,
      roles: DEFAULT_USER_ROLES,
    });
  },
});

export const onboardUser = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    phoneAlt: v.optional(v.string()),
    age: v.number(),
    gender: genderValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // check if user not onboarded already
    if (user.status === "ONBOARDED") throw new ConvexError("User already onboarded");

    // v.* only validates shape, not content — enforce required/range here
    const firstName = args.firstName.trim();
    const lastName = args.lastName.trim();
    const phone = args.phone.trim();
    const phoneAlt = args.phoneAlt?.trim() || undefined;

    if (!firstName || !lastName || !phone) {
      throw new ConvexError("First name, last name, and phone are required");
    }

    if (firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
      throw new ConvexError(`Names must be ${MAX_NAME_LENGTH} characters or fewer`);
    }

    if (
      phone.length > MAX_PHONE_LENGTH ||
      (phoneAlt !== undefined && phoneAlt.length > MAX_PHONE_LENGTH)
    ) {
      throw new ConvexError(`Phone numbers must be ${MAX_PHONE_LENGTH} characters or fewer`);
    }

    if (!Number.isInteger(args.age) || args.age < MIN_AGE || args.age > MAX_AGE) {
      throw new ConvexError("Age out of range");
    }

    await ctx.db.patch(user._id, {
      firstName,
      lastName,
      phone,
      phoneAlt,
      age: args.age,
      gender: args.gender,
      status: "ONBOARDED",
      updatedAt: Date.now(),
    });
  },
});
