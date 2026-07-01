'use server';
import { createClient } from '@/lib/supabase/server';
export async function publishScore({
  nickname,
  score,
  gameSlug,
}: {
  nickname: string;
  score: number;
  gameSlug: string;
}): Promise<{ error?: string }> {
  const trimmed = nickname.trim();
  if (!trimmed) return { error: 'El apodo no puede estar vacío.' };
  if (trimmed.length > 20)
    return { error: 'El apodo no puede superar 20 caracteres.' };
  if (score < 0) return { error: 'El score no puede ser negativo.' };
  const supabase = await createClient();
  const { data: game, error: gameErr } = await supabase
    .from('games')
    .select('id')
    .eq('slug', gameSlug)
    .single();
  if (gameErr || !game) return { error: 'Juego no encontrado.' };
  const { error: insertErr } = await supabase
    .from('scores')
    .insert({ game_id: game.id, nickname: trimmed, score });
  if (insertErr)
    return { error: 'Error al guardar el score. Inténtalo de nuevo.' };
  return {};
}
