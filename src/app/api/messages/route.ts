import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseWithUser } from '@/utils/userFromSb'

// GET /api/messages - Get messages
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await getSupabaseWithUser(request)
    const { searchParams } = new URL(request.url)

    const chatId = searchParams.get('chat_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!chatId) {
      return NextResponse.json({ error: 'chat_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

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
    const { user, supabase } = await getSupabaseWithUser(request)
    const { content, chat_id, username } = await request.json()

    if (!content || !chat_id) {
      return NextResponse.json({ error: 'content and chat_id are required' }, { status: 400 })
    }

    // Ensure chat is accepted before sending
    const { data: chatRow, error: chatErr } = await supabase
      .from('chat_participants')
      .select('chat_id, user_id, sender_id, request_status')
      .eq('chat_id', chat_id)
      .maybeSingle()

    if (chatErr || !chatRow) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }
    if (chatRow.request_status !== 'accepted') {
      return NextResponse.json({ error: 'Chat request not accepted yet' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        username: username || 'Anonymous',
        content,
        chat_id,
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

// PUT /api/messages - No updatable fields in current schema; return 405
export async function PUT() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 405 })
}

// DELETE /api/messages - Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const { user, supabase } = await getSupabaseWithUser(request)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    // First check if the user owns this message
    const { data: existingMessage, error: fetchError } = await supabase
      .from('messages')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (existingMessage.user_id !== user.id) {
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