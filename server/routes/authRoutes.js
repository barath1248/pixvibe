import express from "express";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import pool from "../config/db.js";


dotenv.config();
const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });


router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    console.log("========== REGISTER REQUEST ==========");
    console.log("Request Body:", req.body);

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email and password are required",
      });
    }

    const checkResult = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        error: "Email already exists. Try logging in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );

    console.log("User inserted successfully:");
    console.log(result.rows[0]);

    return res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });

  } catch (err) {
    console.error("\n========== REGISTER ERROR ==========");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("Detail:", err.detail);
    console.error("Table:", err.table);
    console.error("Column:", err.column);
    console.error("Constraint:", err.constraint);
    console.error("Stack:", err.stack);
    console.error("=====================================\n");

    return res.status(500).json({
      error: err.message,
      code: err.code,
      detail: err.detail,
      table: err.table,
      column: err.column,
      constraint: err.constraint,
    });
  }
});


router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;

  console.log("Logging in user:", { email, username, password });

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1 AND username = $2",
      [email, username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Send token and username to frontend
    return res.status(200).json({
      message: "Login successful!",
      token,
      username: user.username
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Save token to DB (make sure 'reset_token' column exists)
    await pool.query("UPDATE users SET reset_token = $1 WHERE email = $2", [token, email]);

    // Use your deployed frontend URL for the reset link
    const resetLink = `${process.env.FRONTEND_URL}/resetpassword/${token}`;
   
    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL, // Must match authenticated sender in your transporter
        to: email,
        subject: "Password Reset",
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
      });

      return res.json({ message: "Password reset email sent!" });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return res.status(500).json({ message: "Failed to send email" });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
