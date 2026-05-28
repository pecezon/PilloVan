import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";
import type { Id } from "./_generated/dataModel";
import type { UserRoles } from "../shared/enums";

const companyIdentity = {
  tokenIdentifier: "https://clerk.test|company_1",
  subject: "company_1",
  issuer: "https://clerk.test",
  email: "company@example.com",
};

const touristIdentity = {
  tokenIdentifier: "https://clerk.test|tourist_1",
  subject: "tourist_1",
  issuer: "https://clerk.test",
  email: "tourist@example.com",
};

const outsiderIdentity = {
  tokenIdentifier: "https://clerk.test|outsider_1",
  subject: "outsider_1",
  issuer: "https://clerk.test",
  email: "outsider@example.com",
};

function createTestBackend() {
  return convexTest(schema, modules);
}

async function seedUser(
  t: ReturnType<typeof createTestBackend>,
  identity: { tokenIdentifier: string; email: string },
  roles: UserRoles[],
) {
  const asUser = t.withIdentity(identity);
  const userId = (await asUser.mutation(api.users.ensureUser, {})) as Id<"users">;
  await t.run(async (ctx) => {
    await ctx.db.patch(userId, { roles });
  });
  return userId;
}

async function seedCompanyWithTour(t: ReturnType<typeof createTestBackend>) {
  const companyId = await seedUser(t, companyIdentity, ["COMPANY"]);
  const tourId = (await t.withIdentity(companyIdentity).mutation(api.tours.createTour, {
    name: "Cenote tour",
    place: "Tulum",
    occupancy: 12,
  })) as Id<"tours">;
  return { companyId, tourId };
}

function tripArgs(tourId: Id<"tours">, overrides: Record<string, unknown> = {}) {
  return {
    tourId,
    pickupTime: Date.now() + 3_600_000,
    partySize: 2,
    pickupLocation: "Cancun Airport",
    dropoffLocation: "Tulum Centro",
    participantEmails: [touristIdentity.email],
    ...overrides,
  };
}

describe("trips.createTrip", () => {
  test("rejects unauthenticated callers", async () => {
    const t = createTestBackend();
    const { tourId } = await seedCompanyWithTour(t);

    await expect(t.mutation(api.trips.createTrip, tripArgs(tourId))).rejects.toThrow(
      "Not signed in",
    );
  });

  test("rejects tourists", async () => {
    const t = createTestBackend();
    const { tourId } = await seedCompanyWithTour(t);
    await seedUser(t, touristIdentity, ["TOURIST"]);

    await expect(
      t.withIdentity(touristIdentity).mutation(api.trips.createTrip, tripArgs(tourId)),
    ).rejects.toThrow("Not authorized");
  });

  test("creates a trip with company + participant memberships", async () => {
    const t = createTestBackend();
    const { companyId, tourId } = await seedCompanyWithTour(t);
    const touristId = await seedUser(t, touristIdentity, ["TOURIST"]);

    const tripId = await t
      .withIdentity(companyIdentity)
      .mutation(api.trips.createTrip, tripArgs(tourId));

    const trip = await t.run(async (ctx) => ctx.db.get(tripId));
    expect(trip).toMatchObject({ status: "PENDING", tourId });

    const members = await t.run(async (ctx) =>
      ctx.db
        .query("tripMembers")
        .withIndex("by_tripId", (q) => q.eq("tripId", tripId))
        .collect(),
    );
    const byUser = new Map(members.map((m) => [m.userId, m.role]));
    expect(byUser.get(companyId)).toBe("COMPANY");
    expect(byUser.get(touristId)).toBe("TOURIST");
    expect(members).toHaveLength(2);
  });

  test("rejects a tour owned by another company", async () => {
    const t = createTestBackend();
    const { tourId } = await seedCompanyWithTour(t);

    const otherCompany = {
      tokenIdentifier: "https://clerk.test|company_2",
      subject: "company_2",
      issuer: "https://clerk.test",
      email: "company2@example.com",
    };
    await seedUser(t, otherCompany, ["COMPANY"]);

    await expect(
      t
        .withIdentity(otherCompany)
        .mutation(api.trips.createTrip, tripArgs(tourId, { participantEmails: [] })),
    ).rejects.toThrow("your own tours");
  });

  test("rejects unknown participant emails", async () => {
    const t = createTestBackend();
    const { tourId } = await seedCompanyWithTour(t);

    await expect(
      t
        .withIdentity(companyIdentity)
        .mutation(
          api.trips.createTrip,
          tripArgs(tourId, { participantEmails: ["ghost@example.com"] }),
        ),
    ).rejects.toThrow("No account found for: ghost@example.com");
  });

  test("rejects party size larger than tour occupancy", async () => {
    const t = createTestBackend();
    const { tourId } = await seedCompanyWithTour(t);

    await expect(
      t
        .withIdentity(companyIdentity)
        .mutation(api.trips.createTrip, tripArgs(tourId, { partySize: 99, participantEmails: [] })),
    ).rejects.toThrow("exceeds the tour occupancy");
  });
});

describe("trips.listMyTrips", () => {
  test("a participant sees the trip with its embedded tour", async () => {
    const t = createTestBackend();
    const { tourId } = await seedCompanyWithTour(t);
    await seedUser(t, touristIdentity, ["TOURIST"]);
    await t.withIdentity(companyIdentity).mutation(api.trips.createTrip, tripArgs(tourId));

    const trips = await t.withIdentity(touristIdentity).query(api.trips.listMyTrips, {});

    expect(trips).toHaveLength(1);
    expect(trips[0]).toMatchObject({
      status: "PENDING",
      memberRole: "TOURIST",
    });
    expect(trips[0].tour).toMatchObject({ name: "Cenote tour" });
  });

  test("a non-member does not see the trip", async () => {
    const t = createTestBackend();
    const { tourId } = await seedCompanyWithTour(t);
    await seedUser(t, touristIdentity, ["TOURIST"]);
    await seedUser(t, outsiderIdentity, ["TOURIST"]);
    await t.withIdentity(companyIdentity).mutation(api.trips.createTrip, tripArgs(tourId));

    const trips = await t.withIdentity(outsiderIdentity).query(api.trips.listMyTrips, {});

    expect(trips).toHaveLength(0);
  });
});

describe("trips.updateTripStatus", () => {
  test("a company user updates trip status", async () => {
    const t = createTestBackend();
    const { tourId } = await seedCompanyWithTour(t);
    await seedUser(t, touristIdentity, ["TOURIST"]);
    const tripId = await t
      .withIdentity(companyIdentity)
      .mutation(api.trips.createTrip, tripArgs(tourId));

    await t
      .withIdentity(companyIdentity)
      .mutation(api.trips.updateTripStatus, { tripId, status: "IN_PROGRESS" });

    const trips = await t.withIdentity(touristIdentity).query(api.trips.listMyTrips, {});
    expect(trips[0].status).toBe("IN_PROGRESS");
  });

  test("rejects tourists", async () => {
    const t = createTestBackend();
    const { tourId } = await seedCompanyWithTour(t);
    await seedUser(t, touristIdentity, ["TOURIST"]);
    const tripId = await t
      .withIdentity(companyIdentity)
      .mutation(api.trips.createTrip, tripArgs(tourId));

    await expect(
      t
        .withIdentity(touristIdentity)
        .mutation(api.trips.updateTripStatus, { tripId, status: "CANCELLED" }),
    ).rejects.toThrow("Not authorized");
  });
});
