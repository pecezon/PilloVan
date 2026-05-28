import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getCurrentCompanyUserOrThrow } from "./lib/users";

const MAX_NAME_LENGTH = 100;
const MAX_PLACE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_OCCUPANCY = 1000;

export const createTour = mutation({
  args: {
    name: v.string(),
    place: v.string(),
    occupancy: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentCompanyUserOrThrow(ctx);

    const name = args.name.trim();
    const place = args.place.trim();
    const description = args.description?.trim() || undefined;

    if (!name || !place) {
      throw new ConvexError("Tour name and place are required");
    }

    if (name.length > MAX_NAME_LENGTH || place.length > MAX_PLACE_LENGTH) {
      throw new ConvexError("Tour name or place is too long");
    }

    if (description !== undefined && description.length > MAX_DESCRIPTION_LENGTH) {
      throw new ConvexError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`);
    }

    if (!Number.isInteger(args.occupancy) || args.occupancy < 1 || args.occupancy > MAX_OCCUPANCY) {
      throw new ConvexError("Occupancy must be a positive whole number");
    }

    const companyTours = await ctx.db
      .query("tours")
      .withIndex("by_companyId", (q) => q.eq("companyId", user._id))
      .collect();

    const hasDuplicate = companyTours.some(
      (tour) => tour.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (hasDuplicate) {
      throw new ConvexError("You already have a tour with that name");
    }

    return await ctx.db.insert("tours", {
      name,
      place,
      occupancy: args.occupancy,
      description,
      companyId: user._id,
      updatedAt: Date.now(),
    });
  },
});

export const listMyCompanyTours = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentCompanyUserOrThrow(ctx);

    return await ctx.db
      .query("tours")
      .withIndex("by_companyId", (q) => q.eq("companyId", user._id))
      .order("desc")
      .collect();
  },
});
