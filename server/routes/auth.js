import express from "express";
import jwt from "jsonwebtoken";

import bcrypt from "bcryptjs"; // Add bcrypt for password hashing
import User from "../models/User.js";

const router = express.Router();

// Register Route
// Register Route
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        //console.log("Before Saving to DB (Plain Password):", password); // ✅ Log plain password

        user = new User({ name, email, password }); // ❌ Do NOT hash manually
        await user.save();

       // console.log("Stored Hash in DB:", user.password); // ✅ Log stored hashed password

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Login Route
// Login Route
// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login Request:", { email, password });

        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found in DB");
            return res.status(400).json({ message: "Invalid credentials - User not found" });
        }

    //    console.log("Stored Hash in DB:", user.password); // ✅ Check DB-stored hash
      //  console.log("Entered Password:", password); // ✅ Check entered password

        // ❌ Make sure you are NOT hashing again in login
        // const hashedPassword = await bcrypt.hash(password, 10); // 🚨 WRONG (Don't do this)

        const isMatch = await bcrypt.compare(password, user.password);
      //  console.log("Hash Comparison Result:", isMatch); // ✅ Should be true

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials - Incorrect password" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
