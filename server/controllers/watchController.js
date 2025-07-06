import fetch from 'node-fetch';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

dotenv.config();

export const getyoutubevideos = async (req, res) => {
  try {
    const query = req.query.q ;
    const pageToken = req.query.pageToken || '';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${encodeURIComponent(query)}&pageToken=${pageToken}&key=${process.env.YOUTUBE_API_KEY}&type=video`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch the video!" });
  }
};

export const trackVideoView = async (req, res) => {
  try {
    // Verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { videoId, videoTitle, watchedAt } = req.body;

    // First, check if user exists and get current video stats
    const userResult = await db.query(
      "SELECT id, videos_watched FROM users WHERE id = $1",
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const currentVideosWatched = user.videos_watched || 0;
    const newVideosWatched = currentVideosWatched + 1;

    // Update user's video watching stats
    await db.query(
      "UPDATE users SET videos_watched = $1 WHERE id = $2",
      [newVideosWatched, decoded.id]
    );

    // Add video to video history table (create if doesn't exist)
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS video_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          video_id VARCHAR(255) NOT NULL,
          title TEXT NOT NULL,
          watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.query(
        "INSERT INTO video_history (user_id, video_id, title, watched_at) VALUES ($1, $2, $3, $4)",
        [decoded.id, videoId, videoTitle, new Date(watchedAt)]
      );

      // Keep only last 50 videos for each user
      await db.query(`
        DELETE FROM video_history 
        WHERE user_id = $1 
        AND id NOT IN (
          SELECT id FROM video_history 
          WHERE user_id = $1 
          ORDER BY watched_at DESC 
          LIMIT 50
        )
      `, [decoded.id]);

    } catch (historyError) {
      console.error('Error updating video history:', historyError);
      // Continue even if history update fails
    }

    res.status(200).json({ 
      message: 'Video view tracked successfully',
      videosWatched: newVideosWatched 
    });
  } catch (err) {
    console.error('Error tracking video view:', err);
    res.status(500).json({ error: "Failed to track video view!" });
  }
};
