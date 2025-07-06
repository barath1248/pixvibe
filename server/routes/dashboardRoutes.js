import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import authenticateToken from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false
});

router.use(authenticateToken);

// Start a session
router.post('/session/start', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    // End any previous open session
    await pool.query(
      `UPDATE user_sessions SET logout_time = $1, duration_seconds = EXTRACT(EPOCH FROM ($1 - login_time))::int
       WHERE user_id = $2 AND logout_time IS NULL`,
      [now, userId]
    );
    // Start new session
    const result = await pool.query(
      'INSERT INTO user_sessions (user_id, login_time) VALUES ($1, $2) RETURNING id',
      [userId, now]
    );
    res.json({ sessionId: result.rows[0].id });
  } catch (err) {
    console.error('Error starting session:', err);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// End a session
router.post('/session/end', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    // End the latest open session
    const result = await pool.query(
      `UPDATE user_sessions SET logout_time = $1, duration_seconds = EXTRACT(EPOCH FROM ($1 - login_time))::int
       WHERE user_id = $2 AND logout_time IS NULL RETURNING id`,
      [now, userId]
    );
    res.json({ sessionId: result.rows[0]?.id });
  } catch (err) {
    console.error('Error ending session:', err);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Get average session time for current user
router.get('/average-session', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT AVG(duration_seconds) as avg_seconds
       FROM user_sessions
       WHERE user_id = $1 AND duration_seconds IS NOT NULL`,
      [userId]
    );
    res.json({ averageSeconds: Math.round(result.rows[0].avg_seconds || 0) });
  } catch (err) {
    console.error('Error fetching average session:', err);
    res.status(500).json({ error: 'Failed to fetch average session' });
  }
});

// Get total session time for current user
router.get('/total-session', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT SUM(duration_seconds) as total_seconds
       FROM user_sessions
       WHERE user_id = $1 AND duration_seconds IS NOT NULL`,
      [userId]
    );
    res.json({ totalSeconds: Math.round(result.rows[0].total_seconds || 0) });
  } catch (err) {
    console.error('Error fetching total session:', err);
    res.status(500).json({ error: 'Failed to fetch total session' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    // Get current user's stats
    const userStatsResult = await pool.query(
      'SELECT videos_watched, ai_interactions, posts_created, resumes_screened, total_chats FROM users WHERE id = $1',
      [req.user.id]
    );

    const userStats = userStatsResult.rows[0] || {
      videos_watched: 0,
      ai_interactions: 0,
      posts_created: 0,
      resumes_screened: 0,
      total_chats: 0
    };

    // Get global stats
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const chatsResult = await pool.query('SELECT COUNT(*) FROM messages');
    
    // Get total videos watched across all users
    const totalVideosResult = await pool.query('SELECT SUM(videos_watched) FROM users');
    const totalVideosWatched = parseInt(totalVideosResult.rows[0].sum) || 0;

    // Get total AI interactions across all users
    const totalAIResult = await pool.query('SELECT SUM(ai_interactions) FROM users');
    const totalAIInteractions = parseInt(totalAIResult.rows[0].sum) || 0;

    // Get total posts created across all users
    const totalPostsResult = await pool.query('SELECT SUM(posts_created) FROM users');
    const totalPostsCreated = parseInt(totalPostsResult.rows[0].sum) || 0;

    // Get total resumes screened across all users
    const totalResumesResult = await pool.query('SELECT SUM(resumes_screened) FROM users');
    const totalResumesScreened = parseInt(totalResumesResult.rows[0].sum) || 0;

    res.json({
      // Global stats
      totalUsers: parseInt(usersResult.rows[0].count) || 0,
      totalChats: parseInt(chatsResult.rows[0].count) || 0,
      totalVideosWatched,
      totalAIInteractions,
      totalPostsCreated,
      totalResumesScreened,
      
      // User-specific stats
      videosWatched: userStats.videos_watched || 0,
      aiInteractions: userStats.ai_interactions || 0,
      postsCreated: userStats.posts_created || 0,
      resumeScreened: userStats.resumes_screened || 0,
      totalChats: userStats.total_chats || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router; 