import { createClient } from '@/lib/supabase/server';
import SalonClient, { type DbGame, type ScoreRow } from './salon-client';
export default async function Salon() {
  const supabase = await createClient();
  const { data: games } = await supabase
    .from('games')
    .select('id, slug, name')
    .order('created_at', { ascending: true });
  const allGames: DbGame[] = games ?? [];
  const scoresPerGame: Record<string, ScoreRow[]> = {};
  await Promise.all(
    allGames.map(async (game) => {
      const { data } = await supabase
        .from('scores')
        .select('nickname, score, created_at')
        .eq('game_id', game.id)
        .order('score', { ascending: false })
        .limit(12);
      scoresPerGame[game.slug] = data ?? [];
    }),
  );
  return <SalonClient games={allGames} scoresPerGame={scoresPerGame} />;
}
