import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";  // ✅ Import HTTP Server
import { Server } from "socket.io";  // ✅ Import Socket.io

import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js"; // ✅ Ensure this is correct
import uploadRoutes from "./routes/upload.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP Server and Socket.io
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // ✅ Allow frontend connections
});

// Store `io` in app locals
app.set("io", io);

// Routes
app.use("/auth", authRoutes);
app.use("/events", eventRoutes); // ✅ Ensure events route is registered
app.use("/upload", uploadRoutes);


// Test Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
