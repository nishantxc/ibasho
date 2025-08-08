import { getSupabaseWithUser } from '@/utils/userFromSb';
import { NextRequest, NextResponse } from 'next/server'

// GET /api/users - Get user profile
export async function GET(request: NextRequest) {
  try {    
    const { user, supabase } = await getSupabaseWithUser(request);

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('user_id');
    const userId = requestedUserId || user.id;

    const { data: profiles, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Database error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (profiles && profiles.length > 0) {
      return NextResponse.json({ user: profiles[0] });
    } else {
      return NextResponse.json({ 
        user: null, 
        message: "No user profile found",
        debug: {
          queriedUserId: userId,
          authenticatedUserId: user.id,
          profilesFound: profiles?.length || 0
        }
      }, { status: 404 });
    }
  } catch (error) {
    console.error('GET /api/users error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/users - Starting request');
    
    const { user, supabase } = await getSupabaseWithUser(request);
    console.log('Authenticated user ID:', user.id);
    
    const requestBody = await request.json()
    console.log('Request body:', requestBody);
    
    const { username, bio, avatar } = requestBody

    // Validate required fields
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Check if user profile already exists
    console.log('Checking for existing profile...');
    const { data: existingProfile, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle() // Use maybeSingle instead of single to avoid throwing on no results

    console.log('Existing profile check - error:', checkError);
    console.log('Existing profile:', existingProfile ? 'Found' : 'Not found');

    if (checkError) {
      console.error('Error checking existing profile:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 400 });
    }

    if (existingProfile) {
      console.log('Updating existing profile');
      
      // Update existing profile
      const { data, error } = await supabase
        .from('users')
        .update({
          username: username || existingProfile.username,
          bio: bio !== undefined ? bio : existingProfile.bio,
          avatar: avatar !== undefined ? avatar : existingProfile.avatar,
          // updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      console.log('Profile updated successfully');
      return NextResponse.json({ user: data[0] })
    } else {
      console.log('Creating new profile');
      
      // Create new profile
      const insertData = {
        user_id: user.id,
        username: username,
        bio: bio || '',
        avatar: avatar || '',
        created_at: new Date().toISOString(),
        // updated_at: new Date().toISOString()
      }
      
      console.log('Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('users')
        .insert(insertData)
        .select()

      if (error) {
        console.error('Insert error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json({ 
          error: error.message, 
          details: error.details,
          hint: error.hint,
          code: error.code 
        }, { status: 400 })
      }

      console.log('Profile created successfully:', data);
      return NextResponse.json({ user: data[0] }, { status: 201 })
    }
  } catch (error) {
    console.error('POST /api/users error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/users - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { user, supabase } = await getSupabaseWithUser(request);
    const { username, bio, avatar } = await request.json()

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar

    console.log('Updating user with data:', updateData);

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('PUT error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'User not found or no changes made' }, { status: 404 })
    }

    return NextResponse.json({ user: data[0] })
  } catch (error) {
    console.error('PUT /api/users error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}