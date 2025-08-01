-- Create messages table for the Whisper feature
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood TEXT DEFAULT '#tender',
  likes INTEGER DEFAULT 0,
  post_reference JSONB, -- Store post reference as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages table
-- Users can read messages they sent or received
CREATE POLICY "Users can read their own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can insert messages
CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- Users can update their own messages (for likes)
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (
    auth.uid() = sender_id
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Stores messages for the Whisper feature';
COMMENT ON COLUMN messages.sender_id IS 'ID of the user who sent the message';
COMMENT ON COLUMN messages.receiver_id IS 'ID of the user who received the message (optional for general messages)';
COMMENT ON COLUMN messages.content IS 'The message content';
COMMENT ON COLUMN messages.mood IS 'Mood tag associated with the message';
COMMENT ON COLUMN messages.likes IS 'Number of likes on the message';
COMMENT ON COLUMN messages.post_reference IS 'JSON object containing post reference when replying to a post'; 