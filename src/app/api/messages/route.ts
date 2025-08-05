import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uvsqpmaejmaelmgtyjax.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2c3FwbWFlam1hZWxtZ3R5amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NTAyNDUsImV4cCI6MjA2ODMyNjI0NX0.I4PtgWzFq_x-uKu8idA7zdfgeC3OY0mBc2LekIjYKzE'

const supabase = createClient(supabaseUrl, supabaseKey)

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

// GET /api/messages - Get messages
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    const { searchParams } = new URL(request.url)
    
    const senderId = searchParams.get('sender_id')
    const receiverId = searchParams.get('receiver_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (senderId) {
      query = query.eq('sender_id', senderId)
    }
    if (receiverId) {
      query = query.eq('receiver_id', receiverId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ messages: data })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/messages - Create a new message
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    const { content, receiver_id, mood, post_reference } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiver_id || null,
        content,
        mood: mood || '#tender',
        post_reference: post_reference || null
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: data }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/messages - Update a message (for likes)
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    const { id, likes } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    // First check if the user owns this message
    const { data: existingMessage, error: fetchError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (existingMessage.sender_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updateData: any = {}
    if (likes !== undefined) {
      updateData.likes = likes
    }

    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: data })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/messages - Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    // First check if the user owns this message
    const { data: existingMessage, error: fetchError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (existingMessage.sender_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Message deleted successfully' })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 