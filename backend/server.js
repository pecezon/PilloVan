const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const tourRoutes = require("./routes/tour");
const userRoutes = require("./routes/user");

// Test Route
app.get("/", (req, res) => {
  res.send("PilloVan Backend is running!");
});

// Use Routes
app.use("/tour", tourRoutes);
app.use("/user", userRoutes);

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
