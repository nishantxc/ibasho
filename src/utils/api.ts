// API utility functions for making calls to our REST endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

// Helper function to get auth token from Supabase
const getAuthToken = async () => {
  if (typeof window !== 'undefined') {
    // Try to get token from localStorage first
    const storedToken = localStorage.getItem('supabase.auth.token')
    if (storedToken) {
      try {
        const parsed = JSON.parse(storedToken)
        return parsed.currentSession?.access_token || parsed.access_token
      } catch (e) {
        // If parsing fails, try to get from Supabase client
        const { supabase } = await import('../../supabase/Supabase')
        const { data: { session } } = await supabase.auth.getSession()
        return session?.access_token
      }
    } else {
      // If no stored token, try to get from Supabase client
      const { supabase } = await import('../../supabase/Supabase')
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token
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

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'API request failed')
    }

    return data
  } catch (error) {
    console.error('API request error:', error)
    throw error
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
  getMessages: async (params?: {
    sender_id?: string
    receiver_id?: string
    limit?: number
    offset?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.sender_id) searchParams.append('sender_id', params.sender_id)
    if (params?.receiver_id) searchParams.append('receiver_id', params.receiver_id)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())

    const queryString = searchParams.toString()
    const endpoint = `/api/messages${queryString ? `?${queryString}` : ''}`
    
    return apiRequest(endpoint, { method: 'GET' })
  },

  createMessage: async (data: {
    content: string
    receiver_id?: string
    mood?: string
    post_reference?: any
  }) => {
    return apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateMessage: async (id: string, data: { likes?: number }) => {
    return apiRequest('/api/messages', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
  },

  deleteMessage: async (id: string) => {
    return apiRequest(`/api/messages?id=${id}`, {
      method: 'DELETE',
    })
  },
}

// Users API calls
export const usersAPI = {
  getUser: async (userId?: string) => {
    const endpoint = userId ? `/api/users?user_id=${userId}` : '/api/users'
    return apiRequest(endpoint, { method: 'GET' })
  },

  createUser: async (data: {
    username: string
    bio?: string
    avatar?: string
    // preferences?: any
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
    // preferences?: any
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
    images?: string[]
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

// Export all APIs
export const api = {
  auth: authAPI,
  messages: messagesAPI,
  users: usersAPI,
  journal: journalAPI,
} 