'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
export default function SerpientePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const forceEndRef = useRef(false);
  const restartRef = useRef<(() => void) | null>(null);
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [nickname, setNickname] = useState('');
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [spritesReady, setSpritesReady] = useState(false);
  const togglePause = useCallback(() => {
    setPaused((p) => {
      pausedRef.current = !p;
      return !p;
    });
  }, []);
  const handleFin = useCallback(() => {
    forceEndRef.current = true;
  }, []);
  const handleRestart = useCallback(() => {
    forceEndRef.current = false;
    setScore(0);
    setLevel(1);
    setOver(false);
    setNickname('');
    setSaved(false);
    setPublishing(false);
    setPublishError('');
    pausedRef.current = false;
    setPaused(false);
    restartRef.current?.();
  }, []);
  const handlePublish = useCallback(async () => {
    // Se conecta a app/juegos/serpiente/actions.ts en el paso 5
  }, []);
  useEffect(() => {
    if (!spritesReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    // La lógica del juego se porta desde game.js en el paso 4
    ctx.fillStyle = '#14161a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return () => {};
  }, [spritesReady]);
  return (
    <>
      <Script
        src="/serpiente/sprites.js"
        strategy="afterInteractive"
        onReady={() => setSpritesReady(true)}
      />
      <div className="av-player fade-in">
        {/* ── HUD ────────────────────────────────────────────────────────────── */}
        <div className="player-hud">
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div className="hud-stat">
              <div className="l">Jugador</div>
              <div className="v" style={{ color: 'var(--ink)' }}>
                INVITADO
              </div>
            </div>
            <div className="hud-stat">
              <div className="l">Puntuación</div>
              <div className="v">{score.toLocaleString('es-ES')}</div>
            </div>
            <div className="hud-stat level">
              <div className="l">Nivel</div>
              <div className="v">{String(level).padStart(2, '0')}</div>
            </div>
          </div>
          <div className="hud-actions">
            <button className="btn yellow" onClick={togglePause}>
              {paused ? 'REANUDAR' : 'PAUSA'}
            </button>
            <button className="btn magenta" onClick={handleFin}>
              FIN
            </button>
            <button
              className="btn ghost"
              onClick={() => router.push('/biblioteca')}
            >
              SALIR
            </button>
          </div>
        </div>
        {/* ── CRT ────────────────────────────────────────────────────────────── */}
        <div className="crt">
          <div className="crt-screen">
            {/* Canvas — oculto en móvil */}
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="hidden md:block"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
              }}
            />
            {/* Aviso móvil */}
            <div
              className="md:hidden absolute inset-0 flex flex-col items-center justify-center"
              style={{ gap: 16 }}
            >
              <div
                className="pixel"
                style={{ fontSize: 12, color: 'var(--cyan)' }}
              >
                🕹
              </div>
              <div
                className="pixel"
                style={{
                  fontSize: 9,
                  color: 'var(--ink-dim)',
                  letterSpacing: '0.12em',
                  lineHeight: 2,
                }}
              >
                ESTE JUEGO REQUIERE TECLADO
                <br />
                ÁBRELO DESDE UN ESCRITORIO
              </div>
            </div>
            {/* Pausa overlay */}
            {paused && (
              <div
                className="crt-content"
                style={{ background: 'rgba(0,0,0,0.6)', zIndex: 5 }}
              >
                <div>
                  <div className="pixel neon-yellow" style={{ fontSize: 22 }}>
                    EN PAUSA
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: 'var(--ink-dim)',
                      marginTop: 10,
                      letterSpacing: '0.16em',
                    }}
                  >
                    PULSA REANUDAR PARA CONTINUAR
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="crt-bottom">
            <span className="led">SEÑAL OK</span>
            <span>SERPIENTE · CRT-S3 · 60 HZ</span>
            <span>CARGA · 1MB</span>
          </div>
        </div>
        {/* ── Modal game over ─────────────────────────────────────────────────── */}
        {over && (
          <div className="modal-bd">
            <div className="modal">
              <h2>FIN DEL JUEGO</h2>
              <div className="final-label">PUNTUACIÓN FINAL</div>
              <div className="final">{finalScore.toLocaleString('es-ES')}</div>
              {!saved ? (
                <div className="input-row">
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.toUpperCase())}
                    placeholder="TU APODO"
                    maxLength={20}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button
                    className="btn yellow"
                    disabled={!nickname.trim() || publishing}
                    onClick={handlePublish}
                  >
                    {publishing ? 'PUBLICANDO…' : 'PUBLICAR SCORE'}
                  </button>
                  {publishError && (
                    <div
                      style={{
                        color: 'var(--magenta)',
                        fontSize: 11,
                        marginTop: 6,
                      }}
                    >
                      {publishError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="toast-saved">¡Score publicado!</div>
              )}
              <div className="actions">
                <button className="btn" onClick={handleRestart}>
                  JUGAR DE NUEVO
                </button>
                <button
                  className="btn magenta"
                  onClick={() => router.push('/biblioteca')}
                >
                  VOLVER AL VAULT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
