const express = require("express");
const router = express.Router();

// Initialize Prisma Client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get All Users
router.get("/get-all-users", async (req, res) => {
  try {
    const getUsers = await prisma.user.findMany();

    return res.status(200).json(getUsers);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get User by ID
router.get("/get-user/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const getUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!getUser) {
      return res.sendStatus(404).json({ message: "User not found" });
    }

    return res.status(200).json(getUser);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Create a new User
router.post("/create-user", async (req, res) => {
  const { firstName, lastName, phone, mail, phoneAlt, age, gender, role } =
    req.body;

  try {
    // Check for required fields
    if (!firstName || !lastName || !phone || !mail) {
      return res.status(400).json({
        message: "Missing required fields.",
      });
    }

    // Verify if a User with the same mail already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        mail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists.",
      });
    }

    // Create new User
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        mail,
        phoneAlt,
        age,
        gender,
        role,
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Delete User by ID
router.delete("/delete-user/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return res.status(200).json(deletedUser);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Update User by ID
router.put("/update-user/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  const { firstName, lastName, phone, mail, phoneAlt, age, gender, role } =
    req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName,
        lastName,
        phone,
        mail,
        phoneAlt,
        age,
        gender,
        role,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (erorr) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Export the router
module.exports = router;
