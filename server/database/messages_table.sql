-- Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- Add last_seen column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample messages for testing (optional)
-- Uncomment the following lines if you want to add sample data

/*
INSERT INTO messages (sender_id, receiver_id, content) VALUES
(1, 2, 'Hey, how are you doing?'),
(2, 1, 'I''m doing great, thanks for asking!'),
(1, 2, 'That''s awesome! How about your project?'),
(2, 1, 'It''s coming along really well. Almost done!'),
(1, 3, 'Hi Carol! Can you review my project?'),
(3, 1, 'Of course! I''d be happy to help.'),
(1, 4, 'Great work on the presentation!'),
(4, 1, 'Thank you! I worked really hard on it.'),
(1, 5, 'Let''s meet tomorrow to discuss the project'),
(5, 1, 'Perfect! What time works for you?');
*/ 