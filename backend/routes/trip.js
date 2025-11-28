const express = require("express");
const router = express.Router();
const {
  createGroup,
  getGroupInvite,
  ensureContacts,
} = require("../utils/createWhatsAppGroup");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get all trips
router.get("/get-trips", async (req, res) => {
  try {
    const trips = await prisma.trip.findMany();

    return res.status(200).json(trips);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// get all trips for a certain tour
router.get("/get-trips-by-tour/:tourId", async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    const tripList = await prisma.trip.findMany({
      where: {
        tourId: tourId,
      },
    });

    if (tripList.length === 0) {
      return res.status(404).json({ error: "No trips found for this tour" });
    }

    return res.status(200).json(tripList);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error retriving trips for the specified tour.",
      details: error.message,
    });
  }
});

// get trip by id
router.get("/get-trip/:id", async (req, res) => {
  try {
    const tripId = parseInt(req.params.id);

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    return res.status(200).json(trip);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error retriving the specified trip.",
      details: error.message,
    });
  }
});

router.get("/get-active-trips-by-user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const trips = await prisma.trip.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
        status: { in: ["IN_PROGRESS", "PENDING"] },
      },
      include: {
        users: {
          select: {
            user: true,
          },
        },
        tour: true,
      },
      orderBy: {
        pickup_time: "asc",
      },
    });

    return res.status(200).json(trips);
  } catch (error) {
    return res.status(500).json({
      error:
        "Internal server error retriving active trips for the specified user.",
      details: error.message,
    });
  }
});

router.get("/get-inactive-trips-by-user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const trips = await prisma.trip.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
        status: { in: ["COMPLETED", "CANCELLED"] },
      },
      include: {
        users: true,
        tour: true,
      },
    });

    return res.status(200).json(trips);
  } catch (error) {
    return res.status(500).json({
      error:
        "Internal server error retriving inactive trips for the specified user.",
      details: error.message,
    });
  }
});

// create new trip
router.post("/create-trip", async (req, res) => {
  try {
    const {
      tour_id,
      pickup_time,
      party_size,
      pickup_location,
      dropoff_location,
      status = "SCHEDULED",
      participants_emails = [],
      whatsApp_group_link = "",
      companyId,
    } = req.body;

    if (!companyId)
      return res.status(400).json({ error: "companyId is required" });

    // FIND PARTICIPANTS
    const participants = await prisma.users.findMany({
      where: { email: { in: participants_emails } },
      select: {
        auth_id: true,
      },
    });

    const missingUsers = participants_emails.filter(
      (email) => !participants.find((u) => u.email === email)
    );

    //CREATE TRIP
    const newTrip = await prisma.trip.create({
      data: {
        pickup_time,
        party_size,
        pickup_location,
        dropoff_location,
        status,
        whatsApp_group_link,

        users: {
          create: [
            ...participants.map((p) => ({
              userId: p.auth_id,
              role: "TOURIST",
            })),
            {
              userId: companyId,
              role: "COMPANY",
            },
          ],
        },

        tour: { connect: { id: parseInt(tour_id) } },
      },
      include: { users: { include: { user: true } } },
    });

    // create contacts and get IDs
    // const createdContacts = await ensureContacts([
    //   ...participants.map((p) => ({ phone: p.phone, name: p.name })),
    //   { phone: company.phone, name: company.name },
    // ]);

    // console.log("Created contacts:", createdContacts);

    // // extract only their WHAPI IDs
    // const contactIds = createdContacts.map((c) => c.id);

    // // Create group
    // const group = await createGroup(
    //   `Trip #${newTrip.id} - ${pickup_location}`,
    //   contactIds
    // );

    // // Get invite link
    // const inviteLink = await getGroupInvite(group.id);

    // //UPDATE TRIP WITH WA LINK
    // const updatedTrip = await prisma.trip.update({
    //   where: { id: newTrip.id },
    //   data: { whatsApp_group_link: inviteLink },
    // });

    return res.status(201).json({
      message: "Trip created successfully",
      trip: newTrip,
      missingUsers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error during trip creation.",
      details: error.message,
    });
  }
});

// update trip
router.put("/update-trip/:id", async (req, res) => {
  try {
    const tripId = parseInt(req.params.id);

    const updatedTrip = await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: req.body,
    });

    return res.status(200).json(updatedTrip);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error updating trip.",
      details: error.message,
    });
  }
});

// delete trip by id
router.delete("/delete-trip/:id", async (req, res) => {
  try {
    const tripId = parseInt(req.params.id);

    const deletedTrip = await prisma.trip.delete({
      where: {
        id: tripId,
      },
    });

    return res.status(204).json({ message: "Trip deleted correctly" });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error deleting specified trip",
      details: error.message,
    });
  }
});

module.exports = router;
