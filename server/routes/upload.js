import express from "express";
import cloudinary from "../utils/cloudinary.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload_stream(
      { folder: "events" }, // Optional: Change folder name
      (error, result) => {
        if (error) return res.status(500).json({ message: error.message });

        res.json({ url: result.secure_url });
      }
    ).end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
