const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get All Tours
router.get("/get-all-tours", async (req, res) => {
  try {
    const getTours = await prisma.tour.findMany();

    return res.status(200).json(getTours);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

//Get Tours by Company ID
router.get("/get-tours-by-company/:companyId", async (req, res) => {
  const companyId = req.params.companyId;

  try {
    const getTours = await prisma.tour.findMany({
      where: {
        companyId: companyId,
      },
    });

    return res.status(200).json(getTours);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get Tour by ID
router.get("/get-tour/:id", async (req, res) => {
  const tourId = parseInt(req.params.id);

  try {
    const getTour = await prisma.tour.findUnique({
      where: {
        id: tourId,
      },
    });

    if (!getTour) {
      return res.sendStatus(404).json({ message: "Tour not found" });
    }

    return res.status(200).json(getTour);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Create a new Tour
router.post("/create-tour", async (req, res) => {
  const { name, place, occupancy, description, companyId } = req.body;

  try {
    // Check for required fields
    if (!name || !place || !occupancy || !companyId) {
      return res.status(400).json({
        message: "Missing required fields.",
      });
    }

    // Verify if a Tour with the same name already exists for a company
    const existingTour = await prisma.tour.findFirst({
      where: {
        name,
        companyId,
      },
    });

    if (existingTour) {
      return res.status(409).json({
        message: "A tour with this name already exists for this company.",
        existingTour,
      });
    }

    // Create the new Tour
    const newTour = await prisma.tour.create({
      data: {
        name,
        place,
        occupancy,
        description,
        companyId,
      },
    });

    return res.status(201).json(newTour);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Delete a Tour by ID
router.delete("/delete-tour/:id", async (req, res) => {
  const tourId = parseInt(req.params.id, 10);

  try {
    const deletedTour = await prisma.tour.delete({
      where: {
        id: tourId,
      },
    });

    return res.status(200).json(deletedTour);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Update a Tour by ID
router.put("/update-tour/:id", async (req, res) => {
  const tourId = parseInt(req.params.id, 10);

  try {
    const updatedTour = await prisma.tour.update({
      where: {
        id: tourId,
      },
      data: req.body,
    });

    return res.status(200).json(updatedTour);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Export the router
module.exports = router;
