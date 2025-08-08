import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uvsqpmaejmaelmgtyjax.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function getSupabaseWithUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    throw new Error('No authorization header')
  }
  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new Error('Invalid token: ' + (error?.message || 'No user found'))
  }
  const supabaseWithAuth = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
  
  return { user, supabase: supabaseWithAuth }
}