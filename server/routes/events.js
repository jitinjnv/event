import express from "express";
import Event from "../models/Event.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get all events
router.get("/", auth, async (req, res) => {
  try {
    const { category, date, search } = req.query;
    let query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (date === "upcoming") {
      query.date = { $gte: new Date() };
    } else if (date === "past") {
      query.date = { $lt: new Date() };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query)
      .populate("organizer", "name")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create event
router.post("/", auth, async (req, res) => {
    try {
      const io = req.app.get("io"); // ✅ Ensure `io` is available
      if (!io) {
        console.error("Socket.io instance is missing!");
        return res.status(500).json({ message: "Socket.io not initialized" });
      }
  
      const event = new Event({
        ...req.body,
        organizer: req.user.userId
      });
  
      await event.save();
      await event.populate("organizer", "name");
  
      io.emit("eventCreated", event); // ✅ Emit event properly
  
      res.status(201).json(event);
    } catch (error) {
      console.error("Create Event Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
 


// Update event
router.put("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(event, req.body);
    await event.save();
    await event.populate("organizer", "name");

    req.app.get("io").emit("eventUpdated", event);
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete event
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await event.deleteOne();

    req.app.get("io").emit("eventDeleted", req.params.id);
    
    res.json({ message: "Event removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Attend event
router.post("/:id/attend", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const attendeeIndex = event.attendees.indexOf(req.user.userId);
    
    if (attendeeIndex === -1) {
      if (event.attendees.length >= event.capacity) {
        return res.status(400).json({ message: "Event is at capacity" });
      }
      event.attendees.push(req.user.userId);
    } else {
      event.attendees.splice(attendeeIndex, 1);
    }

    await event.save();

    req.app.get("io").emit("attendeeUpdated", {
      eventId: event._id,
      attendeeCount: event.attendees.length,
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
