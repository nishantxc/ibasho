# Whisper Feature Setup Guide

## Overview
The Whisper feature allows users to send messages to each other, with support for referencing posts from the MoodBoard. Messages are stored in Supabase and include features like likes, mood tags, and post references.

## Database Setup

### 1. Create the Messages Table
Run the SQL commands in `supabase/messages_table.sql` in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of supabase/messages_table.sql
```

This will create:
- A `messages` table with proper relationships
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

### 2. Table Schema
The messages table includes:
- `id`: Unique message identifier
- `sender_id`: User who sent the message
- `receiver_id`: User who received the message (optional)
- `content`: Message text
- `mood`: Mood tag (e.g., '#tender', '#grateful')
- `likes`: Number of likes
- `post_reference`: JSON object with post details when replying to a post
- `created_at`: Timestamp
- `updated_at`: Last update timestamp

## Features Implemented

### 1. Dynamic Message Loading
- Messages are fetched from Supabase in real-time
- User messages appear on the right side
- Other users' messages appear on the left side
- Messages include sender names, timestamps, and mood tags

### 2. Post Reference Integration
- Click the send icon on any MoodBoard post
- Automatically switches to Whisper tab
- Shows post reference header with image and caption
- Message includes post context

### 3. Message Features
- Send messages with mood tags
- Like messages (with database persistence)
- Real-time timestamp formatting
- Character limit (280 characters)
- Anonymous usernames for privacy

### 4. Navigation
- Seamless switching between MoodBoard and Whisper
- Back button to return to community
- Post reference can be dismissed

## Usage

### From MoodBoard to Whisper
1. Browse posts in the Community tab
2. Click the send icon (📤) on any post
3. Automatically navigates to Whisper with post context
4. Type your message and send
5. Use the × button to return to community

### Direct Whisper Access
1. Navigate to the Whisper tab
2. View all messages in the community
3. Send general messages without post reference
4. Like messages from other users

## Technical Implementation

### Components Updated
- `Whisper.tsx`: Main messaging component with Supabase integration
- `MoodBoard.tsx`: Added send message functionality
- `page.jsx`: Added navigation state management
- `types.ts`: Added Message and User type definitions

### Key Features
- **Real-time messaging**: Messages are stored and retrieved from Supabase
- **Post references**: JSON storage for post context
- **User positioning**: Own messages on right, others on left
- **Mood integration**: Messages include mood tags
- **Like system**: Persistent likes with database updates
- **Anonymous names**: Generated usernames for privacy

### Security
- Row Level Security (RLS) enabled
- Users can only read/write their own messages
- Proper authentication checks
- Input validation and sanitization

## Troubleshooting

### Common Issues
1. **Messages not loading**: Check Supabase connection and RLS policies
2. **Send button not working**: Verify user authentication
3. **Post reference not showing**: Check JSON structure in post_reference field

### Database Queries
To manually check messages:
```sql
SELECT * FROM messages ORDER BY created_at DESC;
```

To check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

## Future Enhancements
- Real-time message updates with Supabase subscriptions
- Message threading and replies
- File/image sharing in messages
- Message search functionality
- User blocking and moderation features 