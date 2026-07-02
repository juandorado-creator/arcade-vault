'use strict';
const COLS = 30;
const ROWS = 30;
const CELL = 20;
const START_LENGTH = 3;
const BASE_MOVE_INTERVAL = 150; // ms entre movimientos en nivel 1
const MIN_MOVE_INTERVAL = 60;
const MOVE_INTERVAL_STEP = 10; // ms que se reduce por nivel
const FRUITS_PER_LEVEL = 5;
const SCORE_PER_FRUIT = 10;
const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const KEY_TO_DIR = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
let snake, direction, nextDirection, food, foodType, score, level, fruitsEaten;
let paused, gameOver, lastTime, moveAccum, moveInterval, animId;
function randomEmptyCell() {
  let cell;
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
    window.FRUIT_NAMES[Math.floor(Math.random() * window.FRUIT_NAMES.length)];
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
  updateHud();
  overlay.style.display = 'none';
}
function updateHud() {
  scoreEl.textContent = score.toLocaleString();
  levelEl.textContent = level;
}
function changeDirection(dir) {
  const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
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
  updateHud();
}
function endGame() {
  gameOver = true;
  overlayTitle.textContent = 'Game Over';
  overlayScore.textContent = `Puntuación: ${score.toLocaleString()}`;
  overlay.style.display = 'flex';
}
function draw() {
  ctx.fillStyle = '#14161a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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
  drawFruit(ctx, foodType, food.x * CELL, food.y * CELL, CELL, CELL);
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#8bd450' : '#4caf50';
    ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
  });
  if (paused && !gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSA', canvas.width / 2, canvas.height / 2);
  }
}
function loop(time) {
  if (lastTime === undefined) lastTime = time;
  const delta = time - lastTime;
  lastTime = time;
  if (!paused && !gameOver) {
    moveAccum += delta;
    while (moveAccum >= moveInterval) {
      moveAccum -= moveInterval;
      step();
      if (gameOver) break;
    }
  }
  draw();
  animId = requestAnimationFrame(loop);
}
function onKeyDown(e) {
  const dir = KEY_TO_DIR[e.code];
  if (dir) {
    e.preventDefault();
    changeDirection(dir);
    return;
  }
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (!gameOver) paused = !paused;
  }
}
window.addEventListener('keydown', onKeyDown);
restartBtn.addEventListener('click', reset);
loadFruitSheet(() => {
  reset();
  animId = requestAnimationFrame(loop);
});
