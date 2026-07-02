'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { publishScore } from './actions';
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
    setPublishing(true);
    setPublishError('');
    const result = await publishScore({
      nickname,
      score: finalScore,
      gameSlug: 'serpiente',
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
    if (!spritesReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;
    type SnakeWindow = Window & {
      FRUIT_NAMES: string[];
      loadFruitSheet: (cb: () => void) => void;
      drawFruit: (
        ctx: CanvasRenderingContext2D,
        name: string,
        x: number,
        y: number,
        w: number,
        h: number,
      ) => void;
    };
    const w = window as unknown as SnakeWindow;
    // ── Constants ────────────────────────────────────────────────────────────
    const COLS = 30;
    const ROWS = 30;
    const CELL = 20;
    const START_LENGTH = 3;
    const BASE_MOVE_INTERVAL = 150; // ms entre movimientos en nivel 1
    const MIN_MOVE_INTERVAL = 60;
    const MOVE_INTERVAL_STEP = 10; // ms que se reduce por nivel
    const FRUITS_PER_LEVEL = 5;
    const SCORE_PER_FRUIT = 10;
    type Dir = 'up' | 'down' | 'left' | 'right';
    const DIRS: Record<Dir, { x: number; y: number }> = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    const KEY_TO_DIR: Record<string, Dir> = {
      ArrowUp: 'up',
      KeyW: 'up',
      ArrowDown: 'down',
      KeyS: 'down',
      ArrowLeft: 'left',
      KeyA: 'left',
      ArrowRight: 'right',
      KeyD: 'right',
    };
    // ── Estado del juego ─────────────────────────────────────────────────────
    type Cell = { x: number; y: number };
    let snake: Cell[];
    let direction: Dir;
    let nextDirection: Dir;
    let food: Cell;
    let foodType: string;
    let score = 0;
    let level = 1;
    let fruitsEaten = 0;
    let paused = false;
    let gameOver = false;
    let moveInterval = BASE_MOVE_INTERVAL;
    let moveAccum = 0;
    let animId = 0;
    let lastTime: number | null = null;
    function randomEmptyCell(): Cell {
      let cell: Cell;
      do {
        cell = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS),
        };
      } while (snake.some((s) => s.x === cell.x && s.y === cell.y));
      return cell;
    }
    function spawnFood() {
      food = randomEmptyCell();
      foodType =
        w.FRUIT_NAMES[Math.floor(Math.random() * w.FRUIT_NAMES.length)];
    }
    function reset() {
      const cy = Math.floor(ROWS / 2);
      snake = [];
      for (let i = START_LENGTH - 1; i >= 0; i--) {
        snake.push({ x: i, y: cy });
      }
      direction = 'right';
      nextDirection = 'right';
      score = 0;
      level = 1;
      fruitsEaten = 0;
      paused = false;
      gameOver = false;
      moveAccum = 0;
      moveInterval = BASE_MOVE_INTERVAL;
      spawnFood();
    }
    function changeDirection(dir: Dir) {
      const opposite: Record<Dir, Dir> = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
      };
      if (dir === opposite[direction]) return; // no se puede invertir sobre sí misma
      nextDirection = dir;
    }
    function step() {
      direction = nextDirection;
      const d = DIRS[direction];
      const head = { x: snake[0].x + d.x, y: snake[0].y + d.y };
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        return endGame();
      }
      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        return endGame();
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += SCORE_PER_FRUIT * level;
        fruitsEaten += 1;
        if (fruitsEaten % FRUITS_PER_LEVEL === 0) {
          level += 1;
          moveInterval = Math.max(
            MIN_MOVE_INTERVAL,
            BASE_MOVE_INTERVAL - (level - 1) * MOVE_INTERVAL_STEP,
          );
        }
        spawnFood();
      } else {
        snake.pop();
      }
    }
    function endGame() {
      gameOver = true;
      setFinalScore(score);
      setOver(true);
    }
    function draw() {
      ctx.fillStyle = '#14161a';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL, 0);
        ctx.lineTo(x * CELL, ROWS * CELL);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL);
        ctx.lineTo(COLS * CELL, y * CELL);
        ctx.stroke();
      }
      w.drawFruit(ctx, foodType, food.x * CELL, food.y * CELL, CELL, CELL);
      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#8bd450' : '#4caf50';
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
      });
    }
    // ── Input ────────────────────────────────────────────────────────────────
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      )
        return;
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (!gameOver) {
          pausedRef.current = !pausedRef.current;
          setPaused(pausedRef.current);
        }
        return;
      }
      const dir = KEY_TO_DIR[e.code];
      if (dir) {
        e.preventDefault();
        changeDirection(dir);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    // ── Loop principal ───────────────────────────────────────────────────────
    let lastScore = 0;
    let lastLevel = 1;
    function loop(ts: number) {
      if (lastTime === null) lastTime = ts;
      const delta = ts - lastTime;
      lastTime = ts;
      paused = pausedRef.current;
      if (forceEndRef.current && !gameOver) {
        endGame();
      }
      if (!paused && !gameOver) {
        moveAccum += delta;
        while (moveAccum >= moveInterval) {
          moveAccum -= moveInterval;
          step();
          if (gameOver) break;
        }
      }
      draw();
      // Sync to React — setState is a no-op when value is unchanged (React.is)
      if (score !== lastScore) {
        setScore(score);
        lastScore = score;
      }
      if (level !== lastLevel) {
        setLevel(level);
        lastLevel = level;
      }
      if (!gameOver) {
        animId = requestAnimationFrame(loop);
      }
    }
    function init() {
      reset();
      lastTime = null;
      lastScore = 0;
      lastLevel = 1;
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(loop);
    }
    restartRef.current = init;
    w.loadFruitSheet(() => {
      init();
    });
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
    };
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
