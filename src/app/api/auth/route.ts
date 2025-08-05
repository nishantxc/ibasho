import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uvsqpmaejmaelmgtyjax.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2c3FwbWFlam1hZWxtZ3R5amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NTAyNDUsImV4cCI6MjA2ODMyNjI0NX0.I4PtgWzFq_x-uKu8idA7zdfgeC3OY0mBc2LekIjYKzE'

// Create a Supabase client with the same credentials as the existing setup
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { action, email, password } = await request.json()

    switch (action) {
      case 'signup':
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (signupError) {
          return NextResponse.json({ error: signupError.message }, { status: 400 })
        }
        
        return NextResponse.json({ 
          message: 'User created successfully', 
          user: signupData.user 
        })

      case 'signin':
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (signinError) {
          return NextResponse.json({ error: signinError.message }, { status: 400 })
        }
        
        return NextResponse.json({ 
          message: 'Signed in successfully', 
          user: signinData.user,
          session: signinData.session 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'user') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
      }

      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }

      return NextResponse.json({ user })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 