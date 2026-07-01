import { createClient } from '@/lib/supabase/server';
import BibliotecaClient, { type DbGame } from './biblioteca-client';
export default async function Biblioteca() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('games')
    .select('id, slug, name, description, path')
    .order('created_at', { ascending: true });
  return <BibliotecaClient games={(data ?? []) as DbGame[]} />;
}
