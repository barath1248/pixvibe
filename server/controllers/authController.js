import bcrypt from 'bcryptjs';
import db from '../config/db.js'; // Assuming db is your PostgreSQL pool
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});


export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const checkResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists. Try logging in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );

    console.log('User registered successfully.');
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { username, email, password } = req.body;

  console.log('Logging in user:', { email, username, password });

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1 AND username = $2', [email, username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;

      const isMatch = await bcrypt.compare(password, storedPassword);

      if (isMatch) {
        res.json({ message: 'Login successful!', user });
      } else {
        res.status(401).json({ error: 'Incorrect Password' });
      }
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await db.query('UPDATE users SET reset_token = $1 WHERE email = $2', [token, email]);

    const resetLink = `http://localhost:5173/resetpassword/${token}`; // Vite port 5173
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({ message: 'Password reset email sent!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.query('SELECT * FROM users WHERE email = $1', [decoded.email]);

    if (user.rows.length === 0) return res.status(400).json({ message: 'Invalid token' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = $1, reset_token = NULL WHERE email = $2', [
      hashedPassword,
      decoded.email,
    ]);

    res.json({ message: 'Password successfully updated!' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

export const authController = { register, login, forgotPassword, resetPassword };