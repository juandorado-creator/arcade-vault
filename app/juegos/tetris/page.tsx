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
    const ctx = canvas.getContext('2d')!;
    const nextCtx = nextCanvas.getContext('2d')!;
    // ── Constants ────────────────────────────────────────────────────────────
    const COLS = 10;
    const ROWS = 20;
    const BLOCK = 30;
    const COLORS: (string | null)[] = [
      null,
      '#4dd0e1', // I - cyan
      '#ffd54f', // O - yellow
      '#ba68c8', // T - purple
      '#81c784', // S - green
      '#e57373', // Z - red
      '#90caf9', // J - pale blue
      '#ffb74d', // L - orange
      '#9e9e9e', // N - tuerca (gris metálico)
    ];
    const PIECES: number[][][] = [
      [],
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ], // I
      [
        [2, 2],
        [2, 2],
      ], // O
      [
        [0, 3, 0],
        [3, 3, 3],
        [0, 0, 0],
      ], // T
      [
        [0, 4, 4],
        [4, 4, 0],
        [0, 0, 0],
      ], // S
      [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0],
      ], // Z
      [
        [6, 0, 0],
        [6, 6, 6],
        [0, 0, 0],
      ], // J
      [
        [0, 0, 7],
        [7, 7, 7],
        [0, 0, 0],
      ], // L
      [
        [8, 8, 8],
        [8, 0, 8],
        [8, 8, 8],
      ], // N (tuerca)
    ];
    const LINE_SCORES = [0, 100, 300, 500, 800];
    // ── Estado del juego ─────────────────────────────────────────────────────
    type Piece = { type: number; shape: number[][]; x: number; y: number };
    let board: number[][];
    let current: Piece;
    let next: Piece;
    let score = 0;
    let lines = 0;
    let level = 1;
    let gameOver = false;
    let dropAccum = 0;
    let dropInterval = 1000;
    let animId = 0;
    let lastTime: number | null = null;
    function createBoard(): number[][] {
      return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
    }
    function randomPiece(): Piece {
      const type = Math.floor(Math.random() * 8) + 1;
      const shape = PIECES[type].map((row) => [...row]);
      return {
        type,
        shape,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0,
      };
    }
    function collide(shape: number[][], ox: number, oy: number): boolean {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue;
          const nx = ox + c;
          const ny = oy + r;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
          if (ny >= 0 && board[ny][nx]) return true;
        }
      }
      return false;
    }
    function rotateCW(shape: number[][]): number[][] {
      const rows = shape.length;
      const cols = shape[0].length;
      const result = Array.from({ length: cols }, () =>
        new Array(rows).fill(0),
      );
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) result[c][rows - 1 - r] = shape[r][c];
      return result;
    }
    function tryRotate() {
      const rotated = rotateCW(current.shape);
      const kicks = [0, -1, 1, -2, 2];
      for (const kick of kicks) {
        if (!collide(rotated, current.x + kick, current.y)) {
          current.shape = rotated;
          current.x += kick;
          return;
        }
      }
    }
    function merge() {
      for (let r = 0; r < current.shape.length; r++)
        for (let c = 0; c < current.shape[r].length; c++)
          if (current.shape[r][c])
            board[current.y + r][current.x + c] = current.shape[r][c];
    }
    function clearLines() {
      let cleared = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every((v) => v !== 0)) {
          board.splice(r, 1);
          board.unshift(new Array(COLS).fill(0));
          cleared++;
          r++;
        }
      }
      if (cleared) {
        lines += cleared;
        score += (LINE_SCORES[cleared] || 0) * level;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 90);
      }
    }
    function ghostY(): number {
      let gy = current.y;
      while (!collide(current.shape, current.x, gy + 1)) gy++;
      return gy;
    }
    function hardDrop() {
      const gy = ghostY();
      score += (gy - current.y) * 2;
      current.y = gy;
      lockPiece();
    }
    function softDrop() {
      if (!collide(current.shape, current.x, current.y + 1)) {
        current.y++;
        score += 1;
      } else {
        lockPiece();
      }
    }
    function lockPiece() {
      merge();
      clearLines();
      spawn();
    }
    function spawn() {
      current = next;
      next = randomPiece();
      if (collide(current.shape, current.x, current.y)) {
        endGame();
      }
      drawNext();
    }
    function drawBlock(
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      colorIndex: number,
      size: number,
      alpha?: number,
    ) {
      if (!colorIndex) return;
      const color = COLORS[colorIndex]!;
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = color;
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      context.fillStyle = 'rgba(255,255,255,0.12)';
      context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
      context.globalAlpha = 1;
    }
    function drawGrid() {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      for (let c = 1; c < COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * BLOCK, 0);
        ctx.lineTo(c * BLOCK, ROWS * BLOCK);
        ctx.stroke();
      }
      for (let r = 1; r < ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * BLOCK);
        ctx.lineTo(COLS * BLOCK, r * BLOCK);
        ctx.stroke();
      }
    }
    function draw() {
      ctx.clearRect(0, 0, COLS * BLOCK, ROWS * BLOCK);
      drawGrid();
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++) drawBlock(ctx, c, r, board[r][c], BLOCK);
      const gy = ghostY();
      for (let r = 0; r < current.shape.length; r++)
        for (let c = 0; c < current.shape[r].length; c++)
          if (current.shape[r][c])
            drawBlock(
              ctx,
              current.x + c,
              gy + r,
              current.shape[r][c],
              BLOCK,
              0.2,
            );
      for (let r = 0; r < current.shape.length; r++)
        for (let c = 0; c < current.shape[r].length; c++)
          drawBlock(
            ctx,
            current.x + c,
            current.y + r,
            current.shape[r][c],
            BLOCK,
          );
    }
    function drawNext() {
      const NB = 30;
      nextCtx.clearRect(0, 0, NB * 4, NB * 4);
      const shape = next.shape;
      const offX = Math.floor((4 - shape[0].length) / 2);
      const offY = Math.floor((4 - shape.length) / 2);
      for (let r = 0; r < shape.length; r++)
        for (let c = 0; c < shape[r].length; c++)
          drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);
    }
    function endGame() {
      gameOver = true;
      setFinalScore(score);
      setOver(true);
    }
    // ── Input ────────────────────────────────────────────────────────────────
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'KeyP') {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
        return;
      }
      if (pausedRef.current || gameOver) return;
      switch (e.code) {
        case 'ArrowLeft':
          if (!collide(current.shape, current.x - 1, current.y)) current.x--;
          break;
        case 'ArrowRight':
          if (!collide(current.shape, current.x + 1, current.y)) current.x++;
          break;
        case 'ArrowDown':
          softDrop();
          break;
        case 'ArrowUp':
        case 'KeyX':
          tryRotate();
          break;
        case 'Space':
          e.preventDefault();
          hardDrop();
          break;
      }
    }
    document.addEventListener('keydown', onKeyDown);
    // ── Loop principal ───────────────────────────────────────────────────────
    let lastScore = 0;
    let lastLines = 0;
    let lastLevel = 1;
    function loop(ts: number) {
      const dt = lastTime === null ? 0 : ts - lastTime;
      lastTime = ts;
      if (forceEndRef.current && !gameOver) {
        endGame();
      }
      if (!pausedRef.current && !gameOver) {
        dropAccum += dt;
        if (dropAccum >= dropInterval) {
          dropAccum = 0;
          if (!collide(current.shape, current.x, current.y + 1)) {
            current.y++;
          } else {
            lockPiece();
          }
        }
      }
      draw();
      // Sync to React — setState is a no-op when value is unchanged (React.is)
      if (score !== lastScore) {
        setScore(score);
        lastScore = score;
      }
      if (lines !== lastLines) {
        setLines(lines);
        lastLines = lines;
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
      board = createBoard();
      score = 0;
      lines = 0;
      level = 1;
      gameOver = false;
      dropInterval = 1000;
      dropAccum = 0;
      lastTime = null;
      lastScore = 0;
      lastLines = 0;
      lastLevel = 1;
      next = randomPiece();
      spawn();
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(loop);
    }
    init();
    restartRef.current = init;
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('keydown', onKeyDown);
    };
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
