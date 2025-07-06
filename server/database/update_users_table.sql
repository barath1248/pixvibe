-- Add videos_watched column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS videos_watched INTEGER DEFAULT 0;

-- Add other stats columns for dashboard
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_interactions INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS posts_created INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS resumes_screened INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_chats INTEGER DEFAULT 0;

-- Create video_history table for tracking watched videos
CREATE TABLE IF NOT EXISTS video_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_history_user_id ON video_history(user_id);
CREATE INDEX IF NOT EXISTS idx_video_history_watched_at ON video_history(watched_at);

-- Create chat_interactions table for tracking chat activity
CREATE TABLE IF NOT EXISTS chat_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'message_sent', 'ai_chat', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for chat interactions
CREATE INDEX IF NOT EXISTS idx_chat_interactions_user_id ON chat_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_type ON chat_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_created_at ON chat_interactions(created_at); 