'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { publishScore } from './actions';
type SkinId = 'clasico' | 'neon' | 'retro';
type Palette = {
  bg: string;
  hudText: string;
  overlayBg: string;
  overlayText: string;
};
const SKINS: Record<SkinId, Palette> = {
  clasico: {
    bg: '#000000',
    hudText: '#ffffff',
    overlayBg: 'rgba(0, 0, 0, 0.6)',
    overlayText: '#ffffff',
  },
  neon: {
    bg: '#05050a',
    hudText: '#00f5ff',
    overlayBg: 'rgba(255, 0, 110, 0.35)',
    overlayText: '#ff006e',
  },
  retro: {
    bg: '#0a0500',
    hudText: '#d9a441',
    overlayBg: 'rgba(20, 10, 0, 0.65)',
    overlayText: '#f0c060',
  },
};
const SKIN_STORAGE_KEY = 'arcade-skin';
export default function ArkanoidPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const forceEndRef = useRef(false);
  const restartRef = useRef<(() => void) | null>(null);
  const [skin, setSkin] = useState<SkinId>(() => {
    if (typeof window === 'undefined') return 'clasico';
    const stored = window.localStorage.getItem(
      SKIN_STORAGE_KEY,
    ) as SkinId | null;
    return stored && stored in SKINS ? stored : 'clasico';
  });
  const skinRef = useRef<Palette>(SKINS[skin]);
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [nickname, setNickname] = useState('');
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const handleSkinChange = useCallback((next: SkinId) => {
    setSkin(next);
    skinRef.current = SKINS[next];
    window.localStorage.setItem(SKIN_STORAGE_KEY, next);
  }, []);
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
    setLives(3);
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
      gameSlug: 'arkanoid',
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
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = 800;
    const H = 600;
    // ── Constants ────────────────────────────────────────────────────────────
    const PADDLE_SPEED = 400;
    const BLOCK_COLS = 10;
    const BLOCK_W = 64;
    const BLOCK_H = 24;
    const BLOCKS_ORIGIN_X = (W - BLOCK_COLS * BLOCK_W) / 2;
    const BLOCKS_ORIGIN_Y = 80;
    const BASE_BALL_VX = 200;
    const BASE_BALL_VY = -300;
    const EXPLOSION_DURATION = 150;
    // ── Spritesheet ──────────────────────────────────────────────────────────
    type Sprite = { sx: number; sy: number; sw: number; sh: number };
    type Block = {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      alive: boolean;
    };
    type Explosion = {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      elapsed: number;
    };
    const SPRITES: {
      paddle: Sprite;
      ball: Sprite;
      blocks: Record<string, Sprite>;
    } = {
      paddle: { sx: 32, sy: 112, sw: 162, sh: 14 },
      ball: { sx: 32, sy: 32, sw: 16, sh: 16 },
      blocks: {
        gray: { sx: 32, sy: 288, sw: 32, sh: 16 },
        red: { sx: 32, sy: 176, sw: 32, sh: 16 },
        yellow: { sx: 32, sy: 240, sw: 32, sh: 16 },
        cyan: { sx: 32, sy: 192, sw: 32, sh: 16 },
        magenta: { sx: 32, sy: 224, sw: 32, sh: 16 },
        hotpink: { sx: 32, sy: 256, sw: 32, sh: 16 },
        green: { sx: 32, sy: 208, sw: 32, sh: 16 },
      },
    };
    const EXPLOSION_FRAMES: Record<string, Sprite[]> = {
      red: [
        { sx: 256, sy: 176, sw: 32, sh: 16 },
        { sx: 288, sy: 176, sw: 32, sh: 16 },
        { sx: 320, sy: 176, sw: 32, sh: 16 },
        { sx: 352, sy: 176, sw: 32, sh: 16 },
      ],
      cyan: [
        { sx: 256, sy: 192, sw: 32, sh: 16 },
        { sx: 288, sy: 192, sw: 32, sh: 16 },
        { sx: 320, sy: 192, sw: 32, sh: 16 },
        { sx: 352, sy: 192, sw: 32, sh: 16 },
      ],
      green: [
        { sx: 256, sy: 208, sw: 32, sh: 16 },
        { sx: 288, sy: 208, sw: 32, sh: 16 },
        { sx: 320, sy: 208, sw: 32, sh: 16 },
        { sx: 352, sy: 208, sw: 32, sh: 16 },
      ],
      magenta: [
        { sx: 256, sy: 224, sw: 32, sh: 16 },
        { sx: 288, sy: 224, sw: 32, sh: 16 },
        { sx: 320, sy: 224, sw: 32, sh: 16 },
        { sx: 352, sy: 224, sw: 32, sh: 16 },
      ],
      yellow: [
        { sx: 256, sy: 240, sw: 32, sh: 16 },
        { sx: 288, sy: 240, sw: 32, sh: 16 },
        { sx: 320, sy: 240, sw: 32, sh: 16 },
        { sx: 352, sy: 240, sw: 32, sh: 16 },
      ],
      hotpink: [
        { sx: 256, sy: 256, sw: 32, sh: 16 },
        { sx: 288, sy: 256, sw: 32, sh: 16 },
        { sx: 320, sy: 256, sw: 32, sh: 16 },
        { sx: 352, sy: 256, sw: 32, sh: 16 },
      ],
      gray: [
        { sx: 256, sy: 176, sw: 32, sh: 16 },
        { sx: 288, sy: 176, sw: 32, sh: 16 },
        { sx: 320, sy: 176, sw: 32, sh: 16 },
        { sx: 352, sy: 176, sw: 32, sh: 16 },
      ],
    };
    let ssImg: HTMLCanvasElement | null = null;
    let ssLoaded = false;
    function loadSpritesheet(cb: () => void) {
      const rawImg = new Image();
      rawImg.onload = () => {
        const oc = document.createElement('canvas');
        oc.width = rawImg.width;
        oc.height = rawImg.height;
        const octx = oc.getContext('2d')!;
        octx.drawImage(rawImg, 0, 0);
        ssImg = oc;
        ssLoaded = true;
        cb();
      };
      rawImg.onerror = () => console.error('Failed to load spritesheet');
      rawImg.src = '/arkanoid/spritesheet-breakout.png';
    }
    function drawFrame(
      context: CanvasRenderingContext2D,
      frame: Sprite,
      x: number,
      y: number,
      w: number,
      h: number,
    ) {
      if (!ssLoaded || !ssImg) return;
      context.drawImage(
        ssImg,
        frame.sx,
        frame.sy,
        frame.sw,
        frame.sh,
        x,
        y,
        w,
        h,
      );
    }
    function drawSprite(
      context: CanvasRenderingContext2D,
      name: string,
      x: number,
      y: number,
      w: number,
      h: number,
    ) {
      if (!ssLoaded || !ssImg) return;
      let sp: Sprite | undefined;
      if (name.startsWith('block_')) {
        sp = SPRITES.blocks[name.slice(6)];
      } else {
        sp = name === 'paddle' ? SPRITES.paddle : SPRITES.ball;
      }
      if (!sp) return;
      context.drawImage(ssImg, sp.sx, sp.sy, sp.sw, sp.sh, x, y, w, h);
    }
    // ── Levels ───────────────────────────────────────────────────────────────
    type LevelBlock = { col: number; row: number; color: string };
    type Level = { speed: number; blocks: LevelBlock[] };
    const LEVELS: Level[] = (() => {
      const rowColors1 = [
        'red',
        'yellow',
        'cyan',
        'magenta',
        'hotpink',
        'green',
      ];
      const rowColors2 = [
        'gray',
        'cyan',
        'hotpink',
        'yellow',
        'magenta',
        'green',
      ];
      const rowColors4 = [
        'cyan',
        'magenta',
        'green',
        'yellow',
        'hotpink',
        'red',
      ];
      const l1: LevelBlock[] = [];
      for (let row = 0; row < 6; row++)
        for (let col = 0; col < 10; col++)
          l1.push({ col, row, color: rowColors1[row] });
      const l2: LevelBlock[] = [];
      const pyStart = [4, 3, 2, 1, 0, 0];
      const pyEnd = [5, 6, 7, 8, 9, 9];
      for (let row = 0; row < 6; row++)
        for (let col = pyStart[row]; col <= pyEnd[row]; col++)
          l2.push({ col, row, color: rowColors2[row] });
      const l3: LevelBlock[] = [];
      for (let row = 0; row < 6; row++)
        for (let col = 0; col < 10; col++)
          if ((col + row) % 2 === 0)
            l3.push({ col, row, color: row < 3 ? 'yellow' : 'magenta' });
      const gaps4 = [
        [2, 5, 8],
        [0, 4, 7, 9],
        [1, 3, 6],
        [2, 5, 8, 9],
        [0, 4, 7],
        [1, 3, 6, 9],
      ];
      const l4: LevelBlock[] = [];
      for (let row = 0; row < 6; row++)
        for (let col = 0; col < 10; col++)
          if (!gaps4[row].includes(col))
            l4.push({ col, row, color: rowColors4[row] });
      const l5: LevelBlock[] = [];
      for (let row = 0; row < 6; row++)
        for (let col = 0; col < 10; col++) {
          const isFrame = col === 0 || col === 9 || row === 0 || row === 5;
          const isCross = col === 4 || row === 2;
          if (isFrame || isCross)
            l5.push({
              col,
              row,
              color: isCross && !isFrame ? 'hotpink' : 'cyan',
            });
        }
      return [
        { speed: 1.0, blocks: l1 },
        { speed: 1.1, blocks: l2 },
        { speed: 1.21, blocks: l3 },
        { speed: 1.33, blocks: l4 },
        { speed: 1.46, blocks: l5 },
      ];
    })();
    // ── Estado del juego ─────────────────────────────────────────────────────
    type Paddle = { x: number; y: number; w: number; h: number };
    type Ball = {
      x: number;
      y: number;
      w: number;
      h: number;
      vx: number;
      vy: number;
    };
    const paddle: Paddle = { x: 0, y: 560, w: 81, h: 14 };
    const ball: Ball = { x: 0, y: 0, w: 16, h: 16, vx: 200, vy: -300 };
    const bounceSound = new Audio('/arkanoid/ball-bounce.mp3');
    const breakSound = new Audio('/arkanoid/break-sound.mp3');
    let blocks: Block[] = [];
    let explosions: Explosion[] = [];
    let lives = 3;
    let score = 0;
    let gameState: 'playing' | 'gameover' | 'win' = 'playing';
    let currentLevel = 1;
    const keys: Record<string, boolean> = {
      ArrowLeft: false,
      ArrowRight: false,
    };
    function initPaddle() {
      paddle.x = (W - paddle.w) / 2;
    }
    function initBall() {
      const speed = LEVELS[currentLevel - 1].speed;
      ball.x = paddle.x + (paddle.w - ball.w) / 2;
      ball.y = paddle.y - ball.h;
      ball.vx = BASE_BALL_VX * speed;
      ball.vy = BASE_BALL_VY * speed;
    }
    function loadLevel(n: number) {
      currentLevel = n;
      const lvl = LEVELS[n - 1];
      blocks = lvl.blocks.map((b: LevelBlock) => ({
        x: BLOCKS_ORIGIN_X + b.col * BLOCK_W,
        y: BLOCKS_ORIGIN_Y + b.row * BLOCK_H,
        w: BLOCK_W,
        h: BLOCK_H,
        color: b.color,
        alive: true,
      }));
      explosions = [];
      initBall();
    }
    function collideAABB(block: Block) {
      return (
        ball.x < block.x + block.w &&
        ball.x + ball.w > block.x &&
        ball.y < block.y + block.h &&
        ball.y + ball.h > block.y
      );
    }
    // ── Input ────────────────────────────────────────────────────────────────
    function onKeyDown(e: KeyboardEvent) {
      if (e.key in keys) keys[e.key] = true;
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key in keys) keys[e.key] = false;
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    // ── Update ───────────────────────────────────────────────────────────────
    function update(dt: number) {
      if (gameState !== 'playing') return;
      if (keys.ArrowLeft) paddle.x = Math.max(0, paddle.x - PADDLE_SPEED * dt);
      if (keys.ArrowRight)
        paddle.x = Math.min(W - paddle.w, paddle.x + PADDLE_SPEED * dt);
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      let bounced = false;
      if (ball.x <= 0) {
        ball.x = 0;
        ball.vx = Math.abs(ball.vx);
        bounced = true;
      }
      if (ball.x + ball.w >= W) {
        ball.x = W - ball.w;
        ball.vx = -Math.abs(ball.vx);
        bounced = true;
      }
      if (ball.y <= 0) {
        ball.y = 0;
        ball.vy = Math.abs(ball.vy);
        bounced = true;
      }
      if (
        ball.vy > 0 &&
        ball.x + ball.w > paddle.x &&
        ball.x < paddle.x + paddle.w &&
        ball.y + ball.h >= paddle.y &&
        ball.y + ball.h <= paddle.y + paddle.h + 8
      ) {
        ball.y = paddle.y - ball.h;
        ball.vy = -Math.abs(ball.vy);
        bounced = true;
      }
      // Un solo bounceSound por frame, aunque coincidan varios rebotes (p. ej. esquina)
      if (bounced) (bounceSound.cloneNode(true) as HTMLAudioElement).play();
      for (const block of blocks) {
        if (!block.alive) continue;
        if (collideAABB(block)) {
          block.alive = false;
          explosions.push({
            x: block.x,
            y: block.y,
            w: block.w,
            h: block.h,
            color: block.color,
            elapsed: 0,
          });
          score += 10;
          ball.vy = -ball.vy;
          (breakSound.cloneNode(true) as HTMLAudioElement).play();
          if (blocks.every((b: Block) => !b.alive)) {
            if (currentLevel < 5) loadLevel(currentLevel + 1);
            else gameState = 'win';
          }
          break; // one block per frame
        }
      }
      for (const exp of explosions) exp.elapsed += dt * 1000;
      explosions = explosions.filter(
        (exp: Explosion) => exp.elapsed < EXPLOSION_DURATION,
      );
      if (ball.y > H) {
        lives--;
        if (lives <= 0) {
          lives = 0;
          gameState = 'gameover';
        } else {
          initBall();
        }
      }
    }
    // ── Draw ─────────────────────────────────────────────────────────────────
    function drawOverlay(message: string) {
      ctx.fillStyle = skinRef.current.overlayBg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = skinRef.current.overlayText;
      ctx.font = 'bold 64px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(message, W / 2, H / 2);
    }
    function draw() {
      ctx.fillStyle = skinRef.current.bg;
      ctx.fillRect(0, 0, W, H);
      for (const block of blocks) {
        if (block.alive)
          drawSprite(
            ctx,
            'block_' + block.color,
            block.x,
            block.y,
            block.w,
            block.h,
          );
      }
      for (const exp of explosions) {
        const frameIndex = Math.min(
          Math.floor((exp.elapsed / EXPLOSION_DURATION) * 4),
          3,
        );
        drawFrame(
          ctx,
          EXPLOSION_FRAMES[exp.color][frameIndex],
          exp.x,
          exp.y,
          exp.w,
          exp.h,
        );
      }
      drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
      drawSprite(ctx, 'ball', ball.x, ball.y, ball.w, ball.h);
      if (gameState === 'playing') {
        ctx.fillStyle = skinRef.current.hudText;
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Score: ' + score, 10, 10);
        ctx.textAlign = 'center';
        ctx.fillText('Nivel: ' + currentLevel, W / 2, 10);
        const ballSize = 16;
        const ballSpacing = 4;
        for (let i = 0; i < lives; i++) {
          const bx = W - 10 - (lives - i) * (ballSize + ballSpacing);
          drawSprite(ctx, 'ball', bx, 10, ballSize, ballSize);
        }
      }
      if (gameState === 'gameover') drawOverlay('GAME OVER');
      if (gameState === 'win') drawOverlay('¡Completaste el juego!');
    }
    // ── Loop principal ───────────────────────────────────────────────────────
    let lastTime: number | null = null;
    let rafId: number;
    let lastScore = 0;
    let lastLives = 3;
    let lastLevel = 1;
    function loop(ts: number) {
      const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
      lastTime = ts;
      if (forceEndRef.current && gameState === 'playing') {
        gameState = 'gameover';
      }
      if (!pausedRef.current) update(dt);
      draw();
      // Sync to React — setState is a no-op when value is unchanged (React.is)
      if (score !== lastScore) {
        setScore(score);
        lastScore = score;
      }
      if (lives !== lastLives) {
        setLives(lives);
        lastLives = lives;
      }
      if (currentLevel !== lastLevel) {
        setLevel(currentLevel);
        lastLevel = currentLevel;
      }
      if (gameState === 'gameover' || gameState === 'win') {
        setFinalScore(score);
        setOver(true);
      }
      rafId = requestAnimationFrame(loop);
    }
    function init() {
      blocks = [];
      explosions = [];
      lives = 3;
      score = 0;
      gameState = 'playing';
      currentLevel = 1;
      lastTime = null;
      lastScore = 0;
      lastLives = 3;
      lastLevel = 1;
      initPaddle();
      loadLevel(1);
    }
    let cancelled = false;
    loadSpritesheet(() => {
      // El spritesheet carga de forma asíncrona (evento onload de <img>): si el
      // efecto ya se desmontó (p. ej. doble-montaje de React StrictMode en dev)
      // antes de que termine, no arrancamos un loop huérfano que seguiría
      // sonando y sincronizando estado sobre el componente ya reemplazado.
      if (cancelled) return;
      init();
      restartRef.current = init;
      rafId = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);
  return (
    <div className="av-player fade-in">
      {/* ── HUD ────────────────────────────────────────────────────────────── */}
      <div className="player-hud">
        <span className="sr-only" aria-live="polite">
          Puntuación: {score}. Vidas: {lives}. Nivel: {level}.
        </span>
        <div className="hud-actions" style={{ alignItems: 'center' }}>
          <select
            className="btn ghost"
            aria-label="Selector de skin"
            value={skin}
            onChange={(e) => {
              handleSkinChange(e.target.value as SkinId);
              e.target.blur();
            }}
            style={{
              padding: '8px 10px',
              fontSize: 8,
              cursor: 'pointer',
              color: 'var(--cyan)',
              borderColor: 'var(--cyan)',
            }}
          >
            {(['neon', 'retro', 'clasico'] as SkinId[]).map((id) => (
              <option
                key={id}
                value={id}
                style={{ background: 'var(--bg)', color: 'var(--ink)' }}
              >
                {id.toUpperCase()}
              </option>
            ))}
          </select>
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
            width={800}
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
          <span>ARKANOID · CRT-S3 · 60 HZ</span>
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
