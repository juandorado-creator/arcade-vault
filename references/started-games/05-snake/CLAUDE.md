# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Juego de Snake en HTML, CSS y JavaScript puro — sin dependencias, cero frameworks. Se abre directamente en el navegador (`open index.html`).

## Desarrollo

No hay paso de build ni servidor requerido. Para probar cambios: `open index.html`.

## Arquitectura

### Archivos principales

| Archivo             | Rol                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `index.html`        | Punto de entrada; HUD en DOM (`#score`, `#level`), `<canvas>` de 600×600 px y overlay de game over |
| `game.js`           | Toda la lógica del juego (estado, loop, colisiones, render, HUD, overlay)                          |
| `assets/sprites.js` | Define `SPRITE_ATLAS.fruits` y expone `loadFruitSheet` / `drawFruit`                               |

### Assets

- **`assets/fruits.png`** — spritesheet con 22 frutas, fondo transparente

### API de `assets/sprites.js`

```js
loadFruitSheet(cb); // carga la imagen; llama cb al terminar
drawFruit(ctx, name, x, y, w, h); // dibuja una fruta del atlas por nombre
// Constantes exportadas: SPRITE_ATLAS, FRUIT_NAMES
```

### Estado del juego (en `game.js`)

```js
snake; // [{ x, y }] en coordenadas de grid (30×30), snake[0] es la cabeza
direction; // 'up' | 'down' | 'left' | 'right'
nextDirection; // dirección en cola, aplicada en el siguiente step()
food; // { x, y } en coordenadas de grid
foodType; // nombre de la fruta actual (key de SPRITE_ATLAS.fruits)
score; // number
level; // number (sube cada 5 frutas; reduce moveInterval)
paused; // boolean
gameOver; // boolean
moveInterval; // ms entre movimientos de la serpiente (baja con el nivel)
```

El movimiento no usa `setInterval`: el loop de `requestAnimationFrame` acumula
`delta` en `moveAccum` y llama a `step()` cada vez que se supera `moveInterval`
(mismo patrón de acumulador que Tetris usa para `dropInterval`).

## Flujo de trabajo spec-driven

Este proyecto usa desarrollo guiado por specs. **No escribir código sin spec aprobada.**

### Comandos

| Comando               | Acción                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| `/spec [descripción]` | Diseña una spec nueva haciendo preguntas primero. Guarda en `specs/NN-slug.md` con estado `Draft`. |
| `/spec-impl NN-slug`  | Implementa la spec aprobada paso a paso, creando rama `spec-NN-slug` y pausando tras cada paso.    |

### Ciclo de vida de una spec

```
Draft → Approved → Implementado
               ↘ Obsoleto
```

El estado se cambia **manualmente** antes de ejecutar `/spec-impl`. Nunca implementar una spec en estado `Draft`.

### Specs existentes

Ninguna todavía. El primer spec de este proyecto standalone sería `01-...`.

Nota: este juego vive dentro de Arcade Vault como referencia para `/spec-game`,
que lo porta a `app/juegos/snake/` en el proyecto Next.js. El flujo de specs de
_este_ subproyecto (`references/started-games/05-snake/`) es independiente del
de Arcade Vault.
