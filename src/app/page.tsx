import { redirect } from 'next/navigation';
import { supabase } from '../../supabase/Supabase';

export default async function Home() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  } else {
    redirect('/home');
  }
}
