import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseWithUser } from '@/utils/userFromSb'

// async function getSupabaseWithUser(request: NextRequest) {
//   const authHeader = request.headers.get('authorization')
  
//   if (!authHeader) {
//     throw new Error('No authorization header')
//   }
//   const token = authHeader.replace('Bearer ', '')
//   const supabase = createClient(supabaseUrl, supabaseKey)
//   const { data: { user }, error } = await supabase.auth.getUser(token)

//   if (error || !user) {
//     throw new Error('Invalid token: ' + (error?.message || 'No user found'))
//   }
//   const supabaseWithAuth = createClient(supabaseUrl, supabaseKey, {
//     global: {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     }
//   })
  
//   return { user, supabase: supabaseWithAuth }
// }

// GET /api/journal - Get journal entries
export async function GET(request: NextRequest) {
  try {
    const { user , supabase} = await getSupabaseWithUser(request)
    const { searchParams } = new URL(request.url)
    
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('journal_entry')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      query = query
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ entries: data })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/journal - Create a new journal entry
export async function POST(request: NextRequest) {
  try {
    const { user , supabase} = await getSupabaseWithUser(request)
    const { caption, mood, mood_score, images, rotation } = await request.json()

    if (!caption) {
      return NextResponse.json({ error: 'caption is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('journal_entry')
      .insert({
        user_id: user.id,
        caption,
        mood: mood || 'neutral',
        mood_score: mood_score || 5,
        images: images || [],
        rotation: rotation || 0,
        created_at: new Date().toISOString(),
        // updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ entry: data }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/journal - Update a journal entry
export async function PUT(request: NextRequest) {
  try {
    const { user , supabase} = await getSupabaseWithUser(request)
    const { id, caption, mood, mood_score, images } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    // First check if the user owns this entry
    const { data: existingEntry, error: fetchError } = await supabase
      .from('journal_entry')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (existingEntry.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (caption !== undefined) updateData.caption = caption
    if (mood !== undefined) updateData.mood = mood
    if (mood_score !== undefined) updateData.mood_score = mood_score
    if (images !== undefined) updateData.images = images

    const { data, error } = await supabase
      .from('journal_entry')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ entry: data })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/journal - Delete a journal entry
export async function DELETE(request: NextRequest) {
  try {
    const { user , supabase} = await getSupabaseWithUser(request)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    // First check if the user owns this entry
    const { data: existingEntry, error: fetchError } = await supabase
      .from('journal_entry')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (existingEntry.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabase
      .from('journal_entry')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Entry deleted successfully' })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 