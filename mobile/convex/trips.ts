import { mutation, query } from "./_generated/server"
import { ConvexError, v } from "convex/values"
import {
  getCurrentCompanyUserOrThrow,
  getCurrentUserOrThrow,
  userByEmail,
} from "./lib/users"
import { tripStatusValidator } from "../shared/enums"
import type { Doc } from "./_generated/dataModel"
import type { UserRoles } from "../shared/enums"

const MAX_LOCATION_LENGTH = 300
const MAX_PARTY_SIZE = 1000
const MAX_LINK_LENGTH = 500

function companyMemberRole(roles: UserRoles[]): UserRoles {
  return roles.includes("COMPANY") ? "COMPANY" : "ADMIN"
}

export const createTrip = mutation({
  args: {
    tourId: v.id("tours"),
    pickupTime: v.number(),
    partySize: v.number(),
    pickupLocation: v.string(),
    dropoffLocation: v.string(),
    participantEmails: v.array(v.string()),
    whaGroupLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentCompanyUserOrThrow(ctx)

    const tour = await ctx.db.get(args.tourId)
    if (!tour) throw new ConvexError("Tour not found")
    if (tour.companyId !== user._id) {
      throw new ConvexError("You can only create trips for your own tours")
    }

    const pickupLocation = args.pickupLocation.trim()
    const dropoffLocation = args.dropoffLocation.trim()
    const whaGroupLink = args.whaGroupLink?.trim() || undefined

    if (!pickupLocation || !dropoffLocation) {
      throw new ConvexError("Pickup and dropoff locations are required")
    }

    if (
      pickupLocation.length > MAX_LOCATION_LENGTH ||
      dropoffLocation.length > MAX_LOCATION_LENGTH
    ) {
      throw new ConvexError("Pickup or dropoff location is too long")
    }

    if (whaGroupLink !== undefined && whaGroupLink.length > MAX_LINK_LENGTH) {
      throw new ConvexError("Group link is too long")
    }

    if (!Number.isFinite(args.pickupTime) || args.pickupTime <= 0) {
      throw new ConvexError("Pickup time is invalid")
    }

    if (
      !Number.isInteger(args.partySize) ||
      args.partySize < 1 ||
      args.partySize > MAX_PARTY_SIZE
    ) {
      throw new ConvexError("Party size must be a positive whole number")
    }

    if (args.partySize > tour.occupancy) {
      throw new ConvexError(
        `Party size exceeds the tour occupancy of ${tour.occupancy}`
      )
    }

    // Resolve participants up front so we fail before inserting the trip.
    const uniqueEmails = [
      ...new Set(
        args.participantEmails
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email.length > 0)
      ),
    ]

    const participants: Doc<"users">[] = []
    const missingEmails: string[] = []
    for (const email of uniqueEmails) {
      const participant = await userByEmail(ctx, email)
      if (!participant) {
        missingEmails.push(email)
      } else {
        participants.push(participant)
      }
    }

    if (missingEmails.length > 0) {
      throw new ConvexError(
        `No account found for: ${missingEmails.join(", ")}`
      )
    }

    const tripId = await ctx.db.insert("trips", {
      tourId: args.tourId,
      pickupTime: args.pickupTime,
      partySize: args.partySize,
      pickupLocation,
      dropoffLocation,
      status: "PENDING",
      whaGroupLink,
    })

    await ctx.db.insert("tripMembers", {
      tripId,
      userId: user._id,
      role: companyMemberRole(user.roles),
    })

    for (const participant of participants) {
      if (participant._id === user._id) continue
      await ctx.db.insert("tripMembers", {
        tripId,
        userId: participant._id,
        role: "TOURIST",
      })
    }

    return tripId
  },
})

export const listMyTrips = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx)

    const memberships = await ctx.db
      .query("tripMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    const trips = []
    for (const membership of memberships) {
      const trip = await ctx.db.get(membership.tripId)
      if (!trip) continue
      const tour = await ctx.db.get(trip.tourId)
      trips.push({ ...trip, tour, memberRole: membership.role })
    }

    trips.sort((a, b) => b.pickupTime - a.pickupTime)
    return trips
  },
})

export const updateTripStatus = mutation({
  args: {
    tripId: v.id("trips"),
    status: tripStatusValidator,
  },
  handler: async (ctx, args) => {
    await getCurrentCompanyUserOrThrow(ctx)

    const trip = await ctx.db.get(args.tripId)
    if (!trip) throw new ConvexError("Trip not found")

    await ctx.db.patch(args.tripId, { status: args.status })
    return null
  },
})
