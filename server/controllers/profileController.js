import pool from '../config/db.js';

// POST: Upload or update profile
export const uploadProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const profile_picture = req.file?.filename || null;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Ensure username exists in 'users' table
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Username not found in users table' });
    }

    // Check if profile already exists
    const existing = await pool.query('SELECT * FROM profile WHERE username = $1', [username]);

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        'UPDATE profile SET bio = $1, profile_picture = COALESCE($2, profile_picture) WHERE username = $3 RETURNING *',
        [bio, profile_picture, username]
      );
    } else {
      result = await pool.query(
        'INSERT INTO profile (username, bio, profile_picture) VALUES ($1, $2, $3) RETURNING *',
        [username, bio, profile_picture]
      );
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving profile:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET: Fetch profile by username
export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query('SELECT * FROM profile WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: err.message });
  }
};
