'use client'

import { useState, useEffect } from 'react'
import { api } from '@/utils/api'
import { getCurrentUser } from '../../supabase/Supabase'

interface Message {
  id: string
  content: string
  mood: string
  likes: number
  created_at: string
}

interface JournalEntry {
  id: string
  caption: string
  mood: string
  mood_score: number
  created_at: string
  rotation: number
  images: string
}

interface User {
  id: string
  username: string
  bio: string
  avatar_url: string
}

export default function ApiExample() {
  const [messages, setMessages] = useState<Message[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Example: Get current user
  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getCurrentUser()
      console.log('Current User:', response);
      setUser(response.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user')
    } finally {
      setLoading(false)
    }
  }

  // Example: Get messages
  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.messages.getMessages({ limit: 10 })
      setMessages(response.messages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  // Example: Create a new message
  const createMessage = async () => {
    try {
      setLoading(true)
      setError(null)
      const newMessage = await api.messages.createMessage({
        content: 'Hello from the API example!',
        mood: '#tender'
      })
      setMessages(prev => [newMessage.message, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create message')
    } finally {
      setLoading(false)
    }
  }

  // Example: Get journal entries
  const fetchJournalEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.journal.getEntries({ limit: 5 })
      setJournalEntries(response.entries)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch journal entries')
    } finally {
      setLoading(false)
    }
  }

  // Example: Create a journal entry
  const createJournalEntry = async () => {
    try {
      setLoading(true)
      setError(null)
      const newEntry = await api.journal.createEntry({
        caption: 'Today I learned about REST APIs with Supabase!',
        mood: 'excited',
        mood_score: 8,
        
        user_id: user.id
      })
      setJournalEntries(prev => [newEntry.entry, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create journal entry')
    } finally {
      setLoading(false)
    }
  }

  // Example: Update user profile
  const updateUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const updatedUser = await api.users.updateUser({
        bio: 'Updated bio from API example component',
        // preferences: {
        //   theme: 'dark',
        //   notifications: true
        // }
      })
      setUser(updatedUser.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        REST API Examples with Supabase
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* User Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">User Profile</h2>
        <div className="space-y-4">
          <button
            onClick={fetchUser}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Current User'}
          </button>
          
          <button
            onClick={updateUserProfile}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-2"
          >
            {loading ? 'Loading...' : 'Update Profile'}
          </button>

          {user && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold">{user.email}</h3>
              <p className="text-gray-600">{user.id}</p>
              {user.user_metadata?.avatar_url && (
                <img 
                  src={user.user_metadata?.avatar_url} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Messages'}
            </button>
            
            <button
              onClick={createMessage}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Create Message'}
            </button>
          </div>

          {messages.length > 0 && (
            <div className="space-y-2">
              {messages.map((message) => (
                <div key={message.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{message.content}</p>
                  <div className="flex gap-2 text-sm text-gray-500 mt-1">
                    <span>{message.mood}</span>
                    <span>•</span>
                    <span>{message.likes} likes</span>
                    <span>•</span>
                    <span>{new Date(message.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Journal Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Journal Entries</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={fetchJournalEntries}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Journal Entries'}
            </button>
            
            <button
              onClick={createJournalEntry}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Create Journal Entry'}
            </button>
          </div>

          {journalEntries.length > 0 && (
            <div className="space-y-2">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{entry.caption}</p>
                  <div className="flex gap-2 text-sm text-gray-500 mt-1">
                    <span>Mood: {entry.mood}</span>
                    <span>•</span>
                    <span>Score: {entry.mood_score}/10</span>
                    <span>•</span>
                    <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-gray-600 text-sm">
        <p>This component demonstrates how to use the REST API endpoints.</p>
        <p>Make sure you're authenticated and have the proper environment variables set up.</p>
      </div>
    </div>
  )
} 