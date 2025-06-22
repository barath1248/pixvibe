import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Step 1: Check user by email and username
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND username = $2',
      [email, username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Step 2: Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Step 3: Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Step 4: Send token and username to frontend
    return res.status(200).json({
      message: 'Login successful!',
      token,
      username: user.username
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
