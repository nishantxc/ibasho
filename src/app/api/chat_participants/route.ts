import { getSupabaseWithUser } from "@/utils/userFromSb";
import { NextRequest, NextResponse } from "next/server";

// GET /api/chat_participants
export async function GET(request: NextRequest) {

    console.log(request, "i dont even know what up");
    
    try {
        const {user, supabase} = await getSupabaseWithUser(request)
        console.log(user);
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('user_id') || user.id
        const chatId = searchParams.get('chat_id')
        const requestStatus = searchParams.get('request_status')

        // Fetch chats where current user participates as requester or recipient
        let baseQuery = supabase
            .from('chat_participants')
            .select('*')
            .or(`user_id.eq.${userId},sender_id.eq.${userId}`)


        if (chatId) {
          baseQuery = baseQuery.eq('chat_id', chatId)
        }
        if (requestStatus) {
          baseQuery = baseQuery.eq('request_status', requestStatus)
        }

        const { data: rows, error } = await baseQuery
        console.log(rows, "rows");

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        // Enrich with user profiles for requester (user_id) and recipient (sender_id)
        const ids = Array.from(new Set((rows || []).flatMap(r => [r.user_id, r.sender_id]).filter(Boolean)))
        let profilesMap: Record<string, any> = {}
        if (ids.length > 0) {
          const { data: profiles, error: profErr } = await supabase
            .from('users')
            .select('user_id, username, avatar')
            .in('user_id', ids)
          if (profErr) {
            return NextResponse.json({ error: profErr.message }, { status: 400 })
          }
          profilesMap = (profiles || []).reduce((acc: any, p: any) => { acc[p.user_id] = p; return acc }, {})
        }

        const enriched = (rows || []).map((r: any) => ({
          ...r,
          requester: profilesMap[r.user_id] || null,
          recipient: profilesMap[r.sender_id] || null,
        }))

        return NextResponse.json({ chat_participants: enriched })

    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


// POST /api/chat_participants
export async function POST(request: NextRequest) {
  try {
    const {user, supabase} = await getSupabaseWithUser(request)
    const { chat_id, user_id, sender_id, username, avatar, request_status, initial_post_reference } = await request.json();

    console.log(chat_id, user_id, sender_id, "asdasdasd");
    

    // Validate that both users exist
    const { data: user1 } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', user_id)

    // console.log(user1, "user1");
    
    // const { data: user2 } = await supabase
    //   .from('users')
    //   .select('*')
    //   .eq('user_id', sender_id)


    // console.log(user2, "user2");

    // if (!user1 || !user2) {
    //   return NextResponse.json({ 
    //     error: 'Both users must exist in the users table' 
    //   }, { status: 400 });
    // }

    // Enforce single row per chat_id
    const { data: existing } = await supabase
      .from('chat_participants')
      .select('*')
      .eq('chat_id', chat_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ chat_participant: existing });
    }

    // Create inviter row (the caller) as pending by default
    const inviterStatus = request_status || 'pending'
    const { data: inviterRow, error: inviterError } = await supabase
      .from('chat_participants')
      .insert({
        chat_id: chat_id,
        user_id: user_id,
        sender_id: sender_id,
        username: username ?? null,
        avatar: avatar ?? null,
        request_status: inviterStatus,
        initial_post_reference: initial_post_reference,
      })
      .select()
      .single();

    if (inviterError) {
      return NextResponse.json({ error: inviterError.message }, { status: 400 });
    }

    return NextResponse.json({ chat_participant: inviterRow }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/chat_participants - update current user's request_status for a chat
export async function PUT(request: NextRequest) {
  try {
    const { user, supabase } = await getSupabaseWithUser(request)
    const { chat_id, request_status } = await request.json()

    if (!chat_id || !request_status) {
      return NextResponse.json({ error: 'chat_id and request_status are required' }, { status: 400 })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('chat_participants')
      .select('*')
      .eq('chat_id', chat_id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Only recipient can accept/decline
    if (existing.sender_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('chat_participants')
      .update({ request_status })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ chat_participant: data })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}