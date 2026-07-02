'use client';
import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
export interface DbGame {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  path: string;
}
const COVER_MAP: Record<string, string> = {
  asteroides: 'cover-rocas',
  tetris: 'cover-bloques',
  arkanoid: 'cover-ladrillos',
  serpiente: 'cover-fruta',
};
function GameCard({ game }: { game: DbGame }) {
  const router = useRouter();
  const tiltRef = useRef<HTMLDivElement>(null);
  const coverClass = COVER_MAP[game.slug] ?? 'cover-rocas';
  const onMove = (e: React.MouseEvent) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
  };
  const onLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = '';
  };
  return (
    <div
      ref={tiltRef}
      className="card"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => router.push(`/juego/${game.slug}`)}
    >
      <div className="cover">
        <div className={'cover-bg ' + coverClass}></div>
      </div>
      <div className="meta">
        <div className="title">{game.name}</div>
        <div className="desc">{game.description}</div>
        <div className="row">
          <button
            className="btn"
            onClick={(e) => {
              e.stopPropagation();
              router.push(game.path);
            }}
          >
            JUGAR
          </button>
        </div>
      </div>
    </div>
  );
}
export default function BibliotecaClient({ games }: { games: DbGame[] }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(
    () => games.filter((g) => g.name.toLowerCase().includes(q.toLowerCase())),
    [q, games],
  );
  return (
    <div className="fade-in">
      <section className="av-hero">
        <h1 className="flicker">ARCADE VAULT</h1>
        <div className="sub">
          INSERTA UNA MONEDA PARA JUGAR <span className="blink">_</span>
        </div>
      </section>
      <div className="av-filters">
        <div className="av-search">
          <span className="ico">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar un juego por nombre…"
          />
        </div>
      </div>
      <div className="av-grid">
        {filtered.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: 80,
              color: 'var(--ink-faint)',
            }}
          >
            <div
              className="pixel"
              style={{
                fontSize: 14,
                color: 'var(--magenta)',
                marginBottom: 12,
              }}
            >
              NO HAY RESULTADOS
            </div>
            <div>Intenta otra búsqueda.</div>
          </div>
        )}
      </div>
    </div>
  );
}
