import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GAMES } from '@/app/data';
import { createClient } from '@/lib/supabase/server';
function fmt(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
export default async function Detalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();
  const supabase = await createClient();
  const { data: dbGame } = await supabase
    .from('games')
    .select('id')
    .eq('slug', id)
    .single();
  let scores: { nickname: string; score: number; created_at: string }[] = [];
  let playCount = 0;
  let bestScore = 0;
  if (dbGame) {
    const [{ data: rows }, { count }] = await Promise.all([
      supabase
        .from('scores')
        .select('nickname, score, created_at')
        .eq('game_id', dbGame.id)
        .order('score', { ascending: false })
        .limit(10),
      supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', dbGame.id),
    ]);
    scores = rows ?? [];
    playCount = count ?? 0;
    bestScore = scores[0]?.score ?? 0;
  }
  return (
    <div className="av-detail fade-in">
      <div>
        <div className="detail-cover">
          <div className={'cover-bg ' + game.cover}></div>
        </div>
        <div style={{ marginTop: 20 }} className="detail-info">
          <div className="detail-tags">
            <span>{game.cat}</span>
            <span>1 JUGADOR</span>
            <span>TECLADO / TÁCTIL</span>
            <span>RETRO 1985</span>
          </div>
          <h2 className="neon-cyan">{game.title}</h2>
          <p>{game.long}</p>
          <div className="stat-strip">
            <div>
              <div className="l">Partidas</div>
              <div className="v">{playCount.toLocaleString('es-ES')}</div>
            </div>
            <div>
              <div className="l">Mejor global</div>
              <div
                className="v"
                style={{
                  color: 'var(--magenta)',
                  textShadow: '0 0 6px rgba(255,0,110,0.5)',
                }}
              >
                {bestScore.toLocaleString('es-ES')}
              </div>
            </div>
            <div>
              <div className="l">Dificultad</div>
              <div
                className="v"
                style={{
                  color: 'var(--yellow)',
                  textShadow: '0 0 6px rgba(245,255,0,0.5)',
                }}
              >
                ★ ★ ★ ☆ ☆
              </div>
            </div>
          </div>
          <div className="detail-actions">
            <Link href={game.href ?? `/juego/${game.id}/jugar`}>
              <button className="btn xl pulse">▶ JUGAR AHORA</button>
            </Link>
            <Link href="/">
              <button className="btn ghost lg">VOLVER AL VAULT</button>
            </Link>
          </div>
        </div>
      </div>
      <aside>
        <div className="leaderboard">
          <h3>MEJORES PUNTUACIONES</h3>
          {scores.length === 0 ? (
            <div
              style={{
                padding: '32px 0',
                textAlign: 'center',
                color: 'var(--ink-faint)',
                fontSize: 11,
                letterSpacing: '0.12em',
              }}
            >
              SIN PUNTUACIONES AÚN
              <br />
              <span
                style={{ color: 'var(--cyan)', marginTop: 6, display: 'block' }}
              >
                ¡SÉ EL PRIMERO!
              </span>
            </div>
          ) : (
            scores.map((r, i) => (
              <div
                key={r.nickname + i}
                className={
                  'lb-row' +
                  (i === 0
                    ? ' top1'
                    : i === 1
                      ? ' top2'
                      : i === 2
                        ? ' top3'
                        : '')
                }
              >
                <div className="rk">#{String(i + 1).padStart(2, '0')}</div>
                <div className="pl">
                  {r.nickname}
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--ink-faint)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {fmt(r.created_at)}
                  </div>
                </div>
                <div className="sc">{r.score.toLocaleString('es-ES')}</div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
