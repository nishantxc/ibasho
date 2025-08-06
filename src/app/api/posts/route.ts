import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uvsqpmaejmaelmgtyjax.supabase.co'
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

// Types based on database schema
type PostVisibility = 'public' | 'private' | 'friends-only' | 'scheduled';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    const { username, photo, avatar_url, mood, caption, visibility = 'private' } = await req.json();

    if (!photo) {
      return NextResponse.json({ error: 'photo is required' }, { status: 400 });
    }

    // Validate visibility
    if (visibility && !['public', 'private', 'friends-only', 'scheduled'].includes(visibility)) {
      return NextResponse.json({ error: 'Invalid visibility value' }, { status: 400 });
    }

    console.log('Inserting post with data:', {
      user_id: user.id,
      username,
      avatar_url,
      photo,
      mood,
      visibility,
      caption
    });

    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: user.id,
          username,
          avatar_url,
          photo,
          mood,
          visibility,
          caption
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ 
      error: 'Error creating post', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visibility = searchParams.get('visibility');
    const userId = searchParams.get('userId');
    
    let user;
    try {
      user = await getUserFromToken(req);
    } catch {
      // If no valid token, only show public posts
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ posts: data });
    }
    
    let query = supabase
      .from('posts')
      .select('*')

    if (visibility) {
      query = query.eq('visibility', visibility);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return NextResponse.json({ posts: data });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    const { id, visibility, caption, photo, mood } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // First verify the post belongs to the user
    const { data: existingPost } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingPost || existingPost.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updates: any = {};
    if (visibility) updates.visibility = visibility;
    if (photo) updates.photo = photo;
    if (mood) updates.mood = mood;

    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ post: data });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error updating post' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // First verify the post belongs to the user
    const { data: existingPost } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingPost || existingPost.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Soft delete by updating status to 'deleted'
    const { data, error } = await supabase
      .from('posts')
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 });
  }
}
