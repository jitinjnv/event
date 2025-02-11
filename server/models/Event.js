import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ["general", "tech", "business", "social", "education"],
  },
  capacity: { type: Number, required: true, min: 1 },
  imageUrl: { type: String ,required:false},
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", eventSchema);
export default Event; // ✅ Use `export default` instead of `module.exports`
