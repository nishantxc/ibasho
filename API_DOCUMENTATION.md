# Sthir API Documentation

This document describes the REST API endpoints for the Sthir application, which uses Supabase as the backend database.

## Base URL

All API endpoints are relative to your Next.js application base URL:
```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using a Bearer token. Include the token in the Authorization header:

```
Authorization: Bearer <your-supabase-jwt-token>
```

## Environment Variables

Make sure to set these environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## API Endpoints

### Authentication

#### POST /api/auth
Handle user authentication operations.

**Request Body:**
```json
{
  "action": "signup" | "signin",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Signup):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Response (Signin):**
```json
{
  "message": "Signed in successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### GET /api/auth?action=user
Get current user information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Messages

#### GET /api/messages
Get messages for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `sender_id` (optional): Filter by sender ID
- `receiver_id` (optional): Filter by receiver ID
- `limit` (optional): Number of messages to return (default: 50)
- `offset` (optional): Number of messages to skip (default: 0)

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "receiver_id": "uuid",
      "content": "Hello world!",
      "mood": "#tender",
      "likes": 5,
      "post_reference": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/messages
Create a new message.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content": "Hello world!",
  "receiver_id": "uuid",
  "mood": "#tender",
  "post_reference": {
    "post_id": "uuid",
    "type": "reply"
  }
}
```

**Response:**
```json
{
  "message": {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "content": "Hello world!",
    "mood": "#tender",
    "likes": 0,
    "post_reference": {
      "post_id": "uuid",
      "type": "reply"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/messages
Update a message (e.g., update likes).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "id": "uuid",
  "likes": 10
}
```

**Response:**
```json
{
  "message": {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "content": "Hello world!",
    "mood": "#tender",
    "likes": 10,
    "post_reference": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### DELETE /api/messages?id=uuid
Delete a message.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Message deleted successfully"
}
```

### Users

#### GET /api/users
Get user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `user_id` (optional): Specific user ID to fetch (defaults to authenticated user)

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "bio": "User bio",
    "avatar_url": "https://example.com/avatar.jpg",
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/users
Create or update user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "username": "new_username",
  "bio": "Updated bio",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "new_username",
    "bio": "Updated bio",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/users
Update user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "username": "updated_username",
  "bio": "New bio",
  "avatar_url": "https://example.com/avatar.jpg",
  "preferences": {
    "theme": "light",
    "notifications": false
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "updated_username",
    "bio": "New bio",
    "avatar_url": "https://example.com/avatar.jpg",
    "preferences": {
      "theme": "light",
      "notifications": false
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Journal

#### GET /api/journal
Get journal entries for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `date` (optional): Filter by specific date (YYYY-MM-DD format)
- `limit` (optional): Number of entries to return (default: 50)
- `offset` (optional): Number of entries to skip (default: 0)

**Response:**
```json
{
  "entries": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "caption": "Today was a great day!",
      "mood": "happy",
      "mood_score": 8,
      "images": ["https://example.com/image1.jpg"],
      "created_at": "2024-01-01T00:00:00Z",
    }
  ]
}
```

#### POST /api/journal
Create a new journal entry.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content": "Today was a great day!",
  "mood": "happy",
  "mood_score": 8,
  "tags": ["grateful", "productive"],
  "images": ["https://example.com/image1.jpg"]
}
```

**Response:**
```json
{
  "entry": {
    "id": "uuid",
    "user_id": "uuid",
    "content": "Today was a great day!",
    "mood": "happy",
    "mood_score": 8,
    "tags": ["grateful", "productive"],
    "images": ["https://example.com/image1.jpg"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/journal
Update a journal entry.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "id": "uuid",
  "content": "Updated content",
  "mood": "calm",
  "mood_score": 7,
  "tags": ["reflection", "peaceful"],
  "images": ["https://example.com/image2.jpg"]
}
```

**Response:**
```json
{
  "entry": {
    "id": "uuid",
    "user_id": "uuid",
    "content": "Updated content",
    "mood": "calm",
    "mood_score": 7,
    "tags": ["reflection", "peaceful"],
    "images": ["https://example.com/image2.jpg"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### DELETE /api/journal?id=uuid
Delete a journal entry.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Entry deleted successfully"
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (user doesn't have permission)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Frontend Usage

Use the provided API utility functions in `src/utils/api.ts`:

```typescript
import { api } from '@/utils/api'

// Authentication
const signup = await api.auth.signup('user@example.com', 'password123')
const signin = await api.auth.signin('user@example.com', 'password123')
const user = await api.auth.getCurrentUser()

// Messages
const messages = await api.messages.getMessages({ limit: 10 })
const newMessage = await api.messages.createMessage({ content: 'Hello!' })

// Users
const profile = await api.users.getUser()
const updatedProfile = await api.users.updateUser({ bio: 'New bio' })

// Journal
const entries = await api.journal.getEntries({ date: '2024-01-01' })
const newEntry = await api.journal.createEntry({ content: 'Today was great!' })
```

## Database Setup

Run the SQL files in your Supabase SQL editor:

1. `supabase/messages_table.sql`
2. `supabase/users_table.sql`
3. `supabase/journal_entry_table.sql`

These will create the necessary tables with proper indexes, RLS policies, and triggers. 