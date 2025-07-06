// Vercel serverless function for auth routes
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// NOTE: You must use a cloud database connection here
// import db from '../../server/config/db.js';
// import pool from '../../server/config/db.js';

// NOTE: For email, use a service like SendGrid or Mailgun in production
// import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    if (req.url.endsWith('/register')) {
      // Registration logic
      const { username, email, password } = req.body;
      // TODO: Connect to your cloud DB and check if user exists, then insert
      // const hashedPassword = await bcrypt.hash(password, 10);
      // ...
      return res.status(200).json({ message: 'Stub: User registered successfully (implement DB logic)' });
    }
    if (req.url.endsWith('/login')) {
      // Login logic
      const { username, email, password } = req.body;
      // TODO: Connect to your cloud DB and verify user
      // const isMatch = await bcrypt.compare(password, user.password);
      // ...
      // const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return res.status(200).json({ message: 'Stub: Login successful (implement DB logic)', token: 'fake-jwt-token', username });
    }
    if (req.url.endsWith('/forgotpassword')) {
      // Forgot password logic
      const { email } = req.body;
      // TODO: Generate reset token, update DB, send email using a cloud email service
      return res.status(200).json({ message: 'Stub: Password reset email sent (implement email logic)' });
    }
  }
  res.status(404).json({ error: 'Not found' });
} 