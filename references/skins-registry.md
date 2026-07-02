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

- [ ] **TETRIS** (tetris)
  - clasico: piezas #4dd0e1 (I) · #ffd54f (O) · #ba68c8 (T) · #81c784 (S) · #e57373 (Z) · #90caf9 (J) · #ffb74d (L) · #9e9e9e (N/tuerca) · highlight rgba(255,255,255,0.12) · grid rgba(255,255,255,0.06)
  - neon: pendiente de definir
  - retro: pendiente de definir
  - notas: es el único juego con un array de colores ya centralizado (`app/juegos/tetris/page.tsx`), el más fácil de convertir en `SKINS`. Pendiente de implementar el sistema de skins en código.

- [ ] **ARKANOID** (arkanoid)
  - clasico: colores derivados del spritesheet `/arkanoid/spritesheet-breakout.png` (gray, red, yellow, cyan, magenta, hotpink, green) · overlay de texto #ffffff / #000000
  - neon: pendiente de definir (solo aplicable a overlays/fondo, no a los sprites)
  - retro: pendiente de definir (solo aplicable a overlays/fondo, no a los sprites)
  - notas: **skin parcial por diseño** — ladrillos/pala/bola se pintan vía `drawImage` desde un PNG y no se recolorean (fuera de alcance de "solo paleta de colores"). Solo el fondo y los overlays de texto son reskineables. Pendiente de implementar en código.

- [ ] **SERPIENTE** (serpiente)
  - clasico: bg #14161a · grid rgba(255,255,255,0.04) · head #8bd450 · body #4caf50
  - neon: pendiente de definir
  - retro: pendiente de definir
  - notas: colores actuales extraídos de `app/juegos/serpiente/page.tsx`. Pendiente de implementar el sistema de skins en código.
