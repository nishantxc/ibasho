// API utility functions for making calls to our REST endpoints

import { Post } from '@/types/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

// Helper function to get auth token from Supabase
const getAuthToken = async () => {
  if (typeof window !== 'undefined') {
    try {
      // Import Supabase client and get current session
      const { supabase } = await import('../../supabase/Supabase')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('Current session:', session);
      console.log('Session error:', error);
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      
      return session?.access_token || null;
    } catch (error) {
      console.error('Error importing Supabase or getting session:', error);
      return null;
    }
  }
  return null
}

// Helper function to make API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`

  console.log('Request URL:', url);
  console.log('Authorization Token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    throw new Error('No authentication token available. Please log in.');
  }

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    // Log response details for debugging
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    console.log('Response data:', data);

    if (!response.ok) {
      console.error('API error response:', data)
      throw new Error(data.details || data.error || `API request failed with status ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API request error:', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// Authentication API calls
export const authAPI = {
  signup: async (email: string, password: string) => {
    return apiRequest('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'signup', email, password }),
    })
  },

  signin: async (email: string, password: string) => {
    return apiRequest('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'signin', email, password }),
    })
  },

  getCurrentUser: async () => {
    return apiRequest('/api/auth?action=user', {
      method: 'GET',
    })
  },
}

// Messages API calls
export const messagesAPI = {
  getMessages: async (params: {
    chat_id: string
    limit?: number
    offset?: number
  }) => {
    const searchParams = new URLSearchParams()
    searchParams.append('chat_id', params.chat_id)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())

    const queryString = searchParams.toString()
    const endpoint = `/api/messages${queryString ? `?${queryString}` : ''}`
    
    return apiRequest(endpoint, { method: 'GET' }) as Promise<{ messages: any[] }>
  },

  createMessage: async (data: { content: string; chat_id: string }) => {
    return apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<{ message: any }>
  },

  deleteMessage: async (id: string) => {
    return apiRequest(`/api/messages?id=${id}`, {
      method: 'DELETE',
    }) as Promise<{ message: string }>
  },
}

// Users API calls
export const usersAPI = {
  getUser: async (userId?: string) => {
    const endpoint = userId ? `/api/users?user_id=${userId}` : '/api/users'
    return apiRequest(endpoint, { method: 'GET' })
  },

  createUser: async (data: {
    user_id: string
    username: string
    bio?: string
    avatar?: string
  }) => {
    return apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateUser: async (data: {
    username?: string
    bio?: string
    avatar?: string
  }) => {
    return apiRequest('/api/users', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// Journal API calls
export const journalAPI = {
  getEntries: async (params?: {
    date?: string
    limit?: number
    offset?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.append('date', params.date)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())

    const queryString = searchParams.toString()
    const endpoint = `/api/journal${queryString ? `?${queryString}` : ''}`
    
    return apiRequest(endpoint, { method: 'GET' })
  },

  createEntry: async (data: {
    caption: string
    mood?: string
    mood_score?: number
    images?: string | null
    rotation?: number
    user_id?: string
  }) => {
    return apiRequest('/api/journal', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateEntry: async (id: string, data: {
    caption?: string
    mood?: string
    mood_score?: number
    images?: string[]
  }) => {
    return apiRequest('/api/journal', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
  },

  deleteEntry: async (id: string) => {
    return apiRequest(`/api/journal?id=${id}`, {
      method: 'DELETE',
    })
  },
}

// Types for Posts
type PostVisibility = 'public' | 'private' | 'friends-only' | 'scheduled';

// Posts API calls
export const postsAPI = {
  getPosts: async (params?: {
    visibility?: PostVisibility
    userId?: string
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.visibility) searchParams.append('visibility', params.visibility)
    if (params?.userId) searchParams.append('userId', params.userId)
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const queryString = searchParams.toString()
    const endpoint = `/api/posts${queryString ? `?${queryString}` : ''}`
    
    return apiRequest(endpoint, { method: 'GET' }) as Promise<{ posts: Post[] }>
  },

  createPost: async (data: {
    username: string
    avatar_url?: string
    photo: string
    mood?: string
    visibility?: PostVisibility
    caption?: string
  }) => {
    return apiRequest('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<Post>
  },

  updatePost: async (id: string, data: {
    visibility?: PostVisibility
    caption?: string
    photo?: string
    mood?: string
  }) => {
    return apiRequest('/api/posts', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...data }),
    }) as Promise<{ post: Post }>
  },

  deletePost: async (id: string) => {
    return apiRequest(`/api/posts?id=${id}`, {
      method: 'DELETE',
    }) as Promise<{ message: string }>
  },
}

export const chatParticipantsAPI = {
  getChatParticipants: async (params?: {
    chat_id?: string
    user_id?: string
    request_status?: string
    limit?: number
    offset?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.chat_id) searchParams.append('chat_id', params.chat_id)
    if (params?.user_id) searchParams.append('user_id', params.user_id)
    if (params?.request_status) searchParams.append('request_status', params.request_status)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    const queryString = searchParams.toString()
  
    const endpoint = `/api/chat_participants${queryString ? `?${queryString}` : ''}`
    return apiRequest(endpoint, { method: 'GET' }) as Promise<{ chat_participants: any[] }>
  },

  createChatParticipant: async (data: {
    username: string
    avatar?: string
    chat_id: string
    user_id: string
    sender_id: string
    request_status?: 'pending' | 'accepted' | 'declined'
  }) => {
    return apiRequest('/api/chat_participants', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<{ chat_participant: any }>
  },

  updateChatParticipantStatus: async (data: {
    chat_id: string
    request_status: 'pending' | 'accepted' | 'declined'
  }) => {
    return apiRequest('/api/chat_participants', {
      method: 'PUT',
      body: JSON.stringify(data),
    }) as Promise<{ chat_participant: any }>
  },
}

export const api = {
  auth: authAPI,
  messages: messagesAPI,
  users: usersAPI,
  journal: journalAPI,
  posts: postsAPI,
  chatParticipants: chatParticipantsAPI,
}