import express from 'express';
import dotenv from 'dotenv';
import authenticateToken from '../middleware/auth.js';
import pool from '../config/db.js';

dotenv.config();

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(authenticateToken);

// Get all users for chat
router.get('/users', async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.profile_picture,
        u.created_at,
        CASE 
          WHEN u.last_seen > NOW() - INTERVAL '5 minutes' THEN true 
          ELSE false 
        END as is_online,
        (
          SELECT m.content 
          FROM messages m 
          WHERE (m.sender_id = u.id AND m.receiver_id = $1) 
             OR (m.sender_id = $1 AND m.receiver_id = u.id)
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT m.created_at 
          FROM messages m 
          WHERE (m.sender_id = u.id AND m.receiver_id = $1) 
             OR (m.sender_id = $1 AND m.receiver_id = u.id)
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.sender_id = u.id 
            AND m.receiver_id = $1 
            AND m.is_read = false
        ) as unread_count
      FROM users u 
      WHERE u.id != $1
      ORDER BY last_message_time DESC NULLS LAST, u.username
    `;
    
    const result = await pool.query(query, [currentUserId]);
    
    const users = result.rows.map(user => ({
      id: user.id,
      username: user.username,
      fullName: user.username, // You can add a full_name field to users table
      avatar: user.profile_picture,
      isOnline: user.is_online,
      lastMessage: user.last_message,
      lastMessageTime: user.last_message_time ? 
        new Date(user.last_message_time).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : null,
      unreadCount: parseInt(user.unread_count) || 0
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get messages between two users
router.get('/messages/:userId', async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    
    const query = `
      SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.is_read,
        m.created_at
      FROM messages m
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `;
    
    const result = await pool.query(query, [currentUserId, otherUserId]);
    
    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false',
      [otherUserId, currentUserId]
    );
    
    const messages = result.rows.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      timestamp: new Date(msg.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isRead: msg.is_read
    }));
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/messages', async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }
    
    const query = `
      INSERT INTO messages (sender_id, receiver_id, content, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, created_at
    `;
    
    const result = await pool.query(query, [currentUserId, receiverId, content]);
    
    const newMessage = {
      id: result.rows[0].id,
      senderId: currentUserId,
      receiverId: receiverId,
      content: content,
      timestamp: new Date(result.rows[0].created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isRead: false
    };
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Update user's last seen
router.put('/last-seen', async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    await pool.query(
      'UPDATE users SET last_seen = NOW() WHERE id = $1',
      [currentUserId]
    );
    
    res.json({ message: 'Last seen updated' });
  } catch (error) {
    console.error('Error updating last seen:', error);
    res.status(500).json({ error: 'Failed to update last seen' });
  }
});

// Get unread message count
router.get('/unread-count', async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    const query = `
      SELECT COUNT(*) as unread_count
      FROM messages
      WHERE receiver_id = $1 AND is_read = false
    `;
    
    const result = await pool.query(query, [currentUserId]);
    
    res.json({ unreadCount: parseInt(result.rows[0].unread_count) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router; 