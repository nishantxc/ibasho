import { NextResponse } from 'next/server';
import { supabase } from '../../../../supabase/Supabase';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user?.id) {
      // Check if user exists in the "users" table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', data.user.id)
        .single();
      
      if (!userError && userData) {
        // User exists in table, redirect to home
        return NextResponse.redirect(`${requestUrl.origin}/home`);
      } else {
        // User doesn't exist in table, redirect to onboarding
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
      }
    }
  }

  // Fallback redirect to home if something goes wrong
  return NextResponse.redirect(`${requestUrl.origin}/home`);
}