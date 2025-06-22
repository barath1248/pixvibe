import pool from '../config/db.js';

export const uploadProfile = async (req, res) => {
  try {
    // Validate request
    if (!req.body.username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // File validation
    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Only JPEG, PNG, or GIF images are allowed' });
      }
      if (req.file.size > 2 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size exceeds 2MB limit' });
      }
    }

    const { username, bio } = req.body;
    const profile_picture = req.file?.filename || null;

    // Verify user exists
    const userExists = await pool.query(
      'SELECT 1 FROM users WHERE username = $1',
      [username]
    );
    
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or update profile
    const result = await pool.query(
      `INSERT INTO profile (username, bio, profile_picture)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) 
       DO UPDATE SET 
         bio = EXCLUDED.bio,
         profile_picture = COALESCE(EXCLUDED.profile_picture, profile.profile_picture)
       RETURNING *`,
      [username, bio || null, profile_picture]
    );

    res.status(200).json({
      success: true,
      profile: result.rows[0]
    });

  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Check if user exists first
    const userCheck = await pool.query(
      'SELECT username FROM users WHERE username = $1',
      [username]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get profile data
    const profileResult = await pool.query(
      `SELECT p.* FROM profile p
       WHERE p.username = $1`,
      [username]
    );

    // Return empty profile if none exists
    if (profileResult.rows.length === 0) {
      return res.status(200).json({
        username,
        bio: null,
        profile_picture: null
      });
    }

    res.status(200).json(profileResult.rows[0]);

  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
};