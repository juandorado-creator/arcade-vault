'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { publishScore } from './actions';
export default function TetrisPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const forceEndRef = useRef(false);
  const restartRef = useRef<(() => void) | null>(null);
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [nickname, setNickname] = useState('');
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
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
    setLines(0);
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
    setPublishing(true);
    setPublishError('');
    const result = await publishScore({
      nickname,
      score: finalScore,
      gameSlug: 'tetris',
    });
    if (result.error) {
      setPublishError(result.error);
      setPublishing(false);
    } else {
      setSaved(true);
      setPublishing(false);
    }
  }, [nickname, finalScore]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const nextCanvas = nextCanvasRef.current;
    if (!canvas || !nextCanvas) return;
    return () => {};
  }, []);
  return (
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
          <div className="hud-stat">
            <div className="l">Líneas</div>
            <div className="v">{lines}</div>
          </div>
          <div className="hud-stat level">
            <div className="l">Nivel</div>
            <div className="v">{String(level).padStart(2, '0')}</div>
          </div>
        </div>
        <canvas
          ref={nextCanvasRef}
          width={120}
          height={120}
          className="hidden md:block"
        />
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
            width={300}
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
          <span>TETRIS · CRT-S3 · 60 HZ</span>
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
  );
}
