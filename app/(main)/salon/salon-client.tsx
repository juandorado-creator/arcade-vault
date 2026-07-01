'use client';
import { useState } from 'react';
import Link from 'next/link';
export interface DbGame {
  id: string;
  slug: string;
  name: string;
}
export interface ScoreRow {
  nickname: string;
  score: number;
  created_at: string;
}
function fmt(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
export default function SalonClient({
  games,
  scoresPerGame,
}: {
  games: DbGame[];
  scoresPerGame: Record<string, ScoreRow[]>;
}) {
  const [tab, setTab] = useState(games[0]?.slug ?? '');
  const rows = scoresPerGame[tab] ?? [];
  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>
      <div className="hall-tabs">
        {games.map((g) => (
          <button
            key={g.slug}
            className={'chip' + (tab === g.slug ? ' active' : '')}
            onClick={() => setTab(g.slug)}
          >
            {g.name.toUpperCase()}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: 'var(--ink-faint)',
            fontSize: 12,
            letterSpacing: '0.12em',
          }}
        >
          <div
            className="pixel"
            style={{ fontSize: 14, color: 'var(--cyan)', marginBottom: 12 }}
          >
            SIN PUNTUACIONES AÚN
          </div>
          ¡Juega y sé el primero en el salón!
        </div>
      ) : (
        <>
          <div className="podium">
            {rows[1] && (
              <div className="podium-slot silver">
                <div className="rank-num">02</div>
                <div className="name">{rows[1].nickname}</div>
                <div className="score">
                  {rows[1].score.toLocaleString('es-ES')}
                </div>
                <div className="date">{fmt(rows[1].created_at)}</div>
              </div>
            )}
            {rows[0] && (
              <div className="podium-slot gold">
                <div
                  className="pixel"
                  style={{
                    fontSize: 9,
                    color: 'var(--gold)',
                    letterSpacing: '0.18em',
                  }}
                >
                  CAMPEÓN
                </div>
                <div
                  className="rank-num"
                  style={{ fontSize: 36, marginTop: 4 }}
                >
                  01
                </div>
                <div className="name">{rows[0].nickname}</div>
                <div className="score" style={{ fontSize: 20 }}>
                  {rows[0].score.toLocaleString('es-ES')}
                </div>
                <div className="date">{fmt(rows[0].created_at)}</div>
              </div>
            )}
            {rows[2] && (
              <div className="podium-slot bronze">
                <div className="rank-num">03</div>
                <div className="name">{rows[2].nickname}</div>
                <div className="score">
                  {rows[2].score.toLocaleString('es-ES')}
                </div>
                <div className="date">{fmt(rows[2].created_at)}</div>
              </div>
            )}
          </div>
          <div className="hall-table">
            <div className="th">
              <div>RANGO</div>
              <div>JUGADOR</div>
              <div>PUNTUACIÓN</div>
              <div>FECHA</div>
            </div>
            {rows.map((r, i) => (
              <div
                key={r.nickname + i}
                className={
                  'tr' +
                  (i === 0
                    ? ' top1'
                    : i === 1
                      ? ' top2'
                      : i === 2
                        ? ' top3'
                        : '')
                }
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="rk">#{String(i + 1).padStart(2, '0')}</div>
                <div className="pl">{r.nickname}</div>
                <div className="sc">{r.score.toLocaleString('es-ES')}</div>
                <div className="dt">{fmt(r.created_at)}</div>
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link href="/">
          <button className="btn lg">VOLVER A LA BIBLIOTECA</button>
        </Link>
      </div>
    </div>
  );
}
