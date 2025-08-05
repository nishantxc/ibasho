import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uvsqpmaejmaelmgtyjax.supabase.co'
// Use service role key for server-side operations
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new Error('Invalid token')
  }

  return user
}

// GET /api/users - Get user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id') || user.id

    // Get user profile from users table
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: profile })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/users - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    const { username, bio, avatar } = await request.json()

    // Check if user profile already exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('users')
        .update({
          username: username || existingProfile.username,
          bio: bio || existingProfile.bio,
          avatar: avatar || existingProfile.avatar,
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ user: data })
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          user_id: user.id,
          username: username || user.email?.split('@')[0],
          bio: bio || '',
          avatar: avatar || '',
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ user: data }, { status: 201 })
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/users - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    const { username, bio, avatar } = await request.json()

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar
    // if (preferences !== undefined) updateData.preferences = preferences

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 