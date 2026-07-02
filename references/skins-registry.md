# Registro de Skins — To-Do

Memoria persistente del agente `skin-designer`. Cada entrada representa un
juego de `app/juegos/<slug>/page.tsx` y el estado de sus 3 skins obligatorias:
`clasico` (default, colores actuales sin cambio visual), `neon` (acentos
brillantes alineados a los tokens de `app/globals.css`) y `retro` (paleta
apagada tipo CRT/fósforo). Estado `[ ]` = skins incompletas o sin implementar
en código; `[x]` = las 3 skins están definidas, aplicadas en `page.tsx` y
seleccionables desde el HUD.

**Patrón de UI del selector**: usar un `<select>` nativo (no botones), ya que
la lista de skins puede crecer más allá de 3 en el futuro. Ver
`app/juegos/asteroides/page.tsx` como referencia de implementación.

**Fondo asumido para contraste**: la app es siempre oscura, sin modo claro.
Todo color de primer plano de `neon` y `retro` se valida contra
`var(--bg) ≈ #0a0a0f` (ver `app/globals.css`). No hay `prefers-color-scheme`
ni `.dark` que contemplar — un solo fondo oscuro fijo.

<!--
Formato de cada entrada:

- [ ] **JUEGO** (slug)
  - clasico: bg #… · primary #… · accent #…
  - neon:    bg #… · primary #… · accent #…
  - retro:   bg #… · primary #… · accent #…
  - notas: <limitaciones, p. ej. sprites desde PNG, o "pendiente de implementar en código">
-->

- [x] **ASTEROIDES** (asteroides)
  - clasico: bg #000000 · ship #ffffff · asteroid #ffffff · bullet #ffffff · particle rgb(255,255,255) · powerUp #00ffff · thrust rgba(255,130,0,0.85)
  - neon: bg #05050a · ship #00f5ff (cyan) · asteroid #ff006e (magenta) · bullet #f5ff00 (yellow) · particle rgb(0,245,255) · powerUp #00ff88 (green) · thrust rgba(255,0,110,0.9)
  - retro: bg #020a02 (CRT verde) · ship #4dff7a · asteroid #2e8f52 · bullet #9dffb0 · particle rgb(77,255,122) · powerUp #ffb347 (ámbar) · thrust rgba(255,179,71,0.8)
  - notas: implementado en `app/juegos/asteroides/page.tsx` — `SKINS` + `skinRef` leído desde el loop de canvas, selector `<select>` nativo en `.player-hud`, persistencia en `localStorage['arcade-skin']`. Vector line-art puro (sin spritesheet), skin completa sin limitaciones.

- [x] **TETRIS** (tetris)
  - clasico: piezas #4dd0e1 (I) · #ffd54f (O) · #ba68c8 (T) · #81c784 (S) · #e57373 (Z) · #90caf9 (J) · #ffb74d (L) · #9e9e9e (N/tuerca) · highlight rgba(255,255,255,0.12) · grid rgba(255,255,255,0.06)
  - neon: piezas #00f5ff (I, cyan) · #f5ff00 (O, yellow) · #ff006e (T, magenta) · #00ff88 (S, green) · #ff3b3b (Z, red) · #3b82ff (J, blue) · #ff8c00 (L, orange) · #c0c0d0 (N/tuerca) · highlight rgba(0,245,255,0.18) · grid rgba(0,245,255,0.08)
  - retro: piezas #4dff7a (I) · #ffb347 (O) · #6fcf97 (T) · #2e8f52 (S) · #d98c3d (Z) · #9dffb0 (J) · #c97a2b (L) · #7a9c7a (N/tuerca, CRT fósforo verde/ámbar) · highlight rgba(77,255,122,0.15) · grid rgba(77,255,122,0.07)
  - notas: implementado en `app/juegos/tetris/page.tsx` — `SKINS` + `skinRef` leído desde `drawBlock`/`drawGrid` en el loop de canvas, selector `<select>` nativo en `.player-hud`, persistencia en `localStorage['arcade-skin']` compartida con Asteroides. Estado inicial vía `getInitialSkin()` (lazy `useState` init) en vez de `setState` dentro de un `useEffect`, para cumplir la regla de lint `react-hooks/set-state-in-effect`. Skin completa sin limitaciones (canvas puro, sin spritesheet).

- [x] **ARKANOID** (arkanoid)
  - clasico: bg #000000 · hudText #ffffff · overlayBg rgba(0,0,0,0.6) · overlayText #ffffff · (ladrillos/pala/bola: spritesheet sin recolorear)
  - neon: bg #05050a · hudText #00f5ff (cyan) · overlayBg rgba(255,0,110,0.35) · overlayText #ff006e (magenta, coherente con el `color: magenta` del juego en `implemented-games.md`)
  - retro: bg #0a0500 (CRT ámbar) · hudText #d9a441 · overlayBg rgba(20,10,0,0.65) · overlayText #f0c060
  - notas: **skin parcial por diseño** — ladrillos/pala/bola se pintan vía `drawImage` desde `/arkanoid/spritesheet-breakout.png` y no se recolorean (fuera de alcance de "solo paleta de colores"). Solo el fondo (`ctx.fillStyle` de `draw()`) y los overlays de texto (HUD en juego + pantallas de game over/win) son reskineables. Implementado en `app/juegos/arkanoid/page.tsx` — `SKINS` + `skinRef` leído desde el loop de canvas, `skin` inicializado con lazy `useState` initializer leyendo `localStorage` (evita el lint `react-hooks/set-state-in-effect` de setState síncrono en un efecto), selector `<select>` nativo en `.player-hud`, persistencia compartida en `localStorage['arcade-skin']`.

- [x] **SERPIENTE** (serpiente)
  - clasico: bg #14161a · grid rgba(255,255,255,0.04) · head #8bd450 · body #4caf50
  - neon: bg #05050a · grid rgba(0,245,255,0.08) (cyan) · head #00ff88 (green) · body #00cc6a
  - retro: bg #020a02 (CRT verde) · grid rgba(77,255,122,0.06) · head #4dff7a · body #2e8f52
  - notas: implementado en `app/juegos/serpiente/page.tsx` — `SKINS` + `skinRef` leído desde el loop de canvas, selector `<select>` nativo en `.player-hud`, persistencia en `localStorage['arcade-skin']` (compartida con Asteroides). **Skin parcial por diseño**: la fruta se pinta vía `drawFruit` desde el spritesheet `/serpiente/sprites.js` (`w.drawFruit`) y no se recolorea; el tablero (fondo, grid) y la serpiente (cabeza/cuerpo) sí son reskineables. `neon` usa green (#00ff88) como color primario para ser coherente con el `color: green` asignado en `implemented-games.md`, con acentos de grid en cyan.
