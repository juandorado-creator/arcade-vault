---
id: 07-tetris-game
title: Juego Tetris
state: implementado
date: 2026-06-30
depends_on: [06-data-infrastructure]
objective: Portar el juego Tetris (canvas HTML5 vanilla con HUD DOM y next-piece) a una página Next.js en /juegos/tetris, integrada al leaderboard y a /biblioteca.
---

## Alcance

### Dentro

- Página `app/juegos/tetris/page.tsx` (`'use client'`) con la shell arcade: refs puente (`canvasRef`, `pausedRef`, `forceEndRef`, `restartRef`), estado React (`score`, `lines`, `level`, `paused`, `over`, `finalScore`, `nickname`, `saved`, `publishing`, `publishError`) — **sin `lives`**, ya que Tetris no tiene ese concepto.
- Lógica del juego portada desde `references/started-games/03-tetris/game.js` mediante `useEffect`, siguiendo las 7 reglas de adaptación (canvas vía ref, tipos TS en variables, listeners nombrados, estado `let` local al effect, HUD fuera del canvas, sincronización por detección de cambio, reinicio vía `restartRef`).
- Segundo `<canvas ref={nextCanvasRef}>` (120×120) para la previsualización de la siguiente pieza, con `drawNext()` portado sin cambios de lógica.
- Listeners de teclado en `document` (no `window`, a diferencia de Asteroides) — incluye `Space` con `preventDefault()` para el hard drop.
- Atajo de teclado `P` para pausa, además del botón de pausa del `.player-hud`.
- `app/juegos/tetris/actions.ts` — `publishScore` copiado de Asteroides, cambiando el slug por defecto a `tetris`.
- Migración Supabase: `INSERT INTO games(slug, name, description, path)` con `slug: 'tetris'`, `name: 'Tetris'`, `description: 'Encaja las piezas, despeja líneas.'`, `path: '/juegos/tetris'`.
- Entrada en `COVER_MAP` de `app/(main)/biblioteca/biblioteca-client.tsx`: `{ tetris: 'cover-bloques' }` + clase CSS `cover-bloques` nueva.
- Entrada obligatoria en `app/data/index.ts` → `GAMES[]` con `id: 'tetris'` (sin tocar la entrada ficticia preexistente `id: 'caida'`), necesaria para que `/juego/tetris` no haga `notFound()`.
- Cleanup del `useEffect`: `cancelAnimationFrame` + remover listeners de `document`.
- Aviso "requiere teclado" en `md:hidden`, igual que Asteroides.

### Fuera

- RLS en `games`/`scores` — pendiente de auth real (heredado de spec 06).
- Toggle de tema claro/oscuro del juego original — se omite, tema oscuro fijo de la plataforma.
- Controles touch / botones on-screen.
- Autenticación requerida para jugar.
- Leaderboard en tiempo real o vista `/salon` dedicada a Tetris.
- Eliminar o consolidar la entrada ficticia `caida` en `app/data/index.ts`.
- Reescritura del juego en TypeScript real (los tipos se añaden solo a las variables del `useEffect`, no se reescribe la lógica).
- Otros juegos del directorio `references/started-games/` (Arkanoid, etc.).

## Plan de implementación

1. Verificar que `app/juegos/layout.tsx` ya inyecta `<Nav />` para todas las rutas `/juegos/*` — ya existe, sin cambio.
   ✓ Verificable: `/juegos/tetris` mostrará la Nav sin tocar ese archivo.

2. Crear `app/juegos/tetris/page.tsx` con la shell arcade adaptada:
   - `.player-hud` con `score`, `lines`, `level` (sin `lives`) + botones pausa/fin/salir.
   - `<canvas ref={canvasRef} width={300} height={600}>` para el tablero.
   - `<canvas ref={nextCanvasRef} width={120} height={120}>` para la pieza siguiente, dentro del HUD.
   - Aviso móvil `md:hidden` ("Este juego requiere teclado") + overlay de pausa + modal Game Over con input de apodo (max 20, uppercase), "Publicar score" y "Jugar de nuevo".
     ✓ Verificable: `/juegos/tetris` compila y muestra el layout con ambos canvas y el HUD lateral.

3. Portar `game.js` dentro del `useEffect` según las 7 reglas de adaptación:
   - Reemplazar `document.getElementById('board')` / `getElementById('next-canvas')` por `canvasRef.current` / `nextCanvasRef.current`.
   - Tipar las variables de estado del juego (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, `dropInterval`, `dropAccum`, `animId`) como `let` local al effect.
   - Listeners de teclado en `document` con funciones nombradas (`onKeyDown`) para poder removerlas en cleanup; conservar `preventDefault()` en `Space` y el atajo `P` para pausa.
   - Quitar el toggle de tema (`theme-toggle`, `localStorage`, `light-mode`) — no se porta.
   - `updateHUD()` deja de escribir en `#score/#lines/#level` del DOM y en su lugar el loop compara contra el último valor sincronizado y llama a `setScore`/`setLines`/`setLevel` de React solo cuando cambian.
   - `endGame()` deja de manipular `#overlay` del DOM; en su lugar setea `over(true)` y `finalScore` vía React.
   - `togglePause()` sincroniza con `pausedRef` en vez de mostrar/ocultar el overlay HTML directamente.
     ✓ Verificable: las piezas caen, rotan con wall-kicks, `Space` hace hard drop, `P` pausa, y el next-canvas muestra la pieza siguiente.

4. Crear `app/juegos/tetris/actions.ts` copiando `publishScore` de `app/juegos/asteroides/actions.ts` verbatim, cambiando el slug por defecto a `tetris`.
   ✓ Verificable: llamar a la acción con un `gameSlug` inválido devuelve error de validación; con `tetris` inserta correctamente.

5. Migración Supabase vía MCP `apply_migration`:

   ```sql
   INSERT INTO games (slug, name, description, path)
   VALUES ('tetris', 'Tetris', 'Encaja las piezas, despeja líneas.', '/juegos/tetris');
   ```

   ✓ Verificable: `list_tables`/`execute_sql` muestra la fila nueva en `games`.

6. Actualizar `app/(main)/biblioteca/biblioteca-client.tsx`: añadir `tetris: 'cover-bloques'` a `COVER_MAP` y la clase CSS `.cover-bloques` en los estilos de covers existentes.
   ✓ Verificable: `/biblioteca` muestra la card de Tetris con un fondo distinto al de Asteroides.

7. Actualizar `app/data/index.ts`: añadir entrada a `GAMES[]` con `id: 'tetris'`, `title: 'TETRIS'`, `short`/`long` acordes, `cover: 'cover-bloques'`, sin tocar la entrada `caida` existente.
   ✓ Verificable: navegar a `/juego/tetris` desde la card de `/biblioteca` no da 404 y muestra el detalle con leaderboard.

## Criterios de aceptación

- [x] `/juegos/tetris` carga sin errores de compilación ni de consola
- [x] Ambos canvas (tablero 300×600 y next-piece 120×120) renderizan el juego al entrar a la página
- [x] Los controles de teclado responden: `←→` mover, `↑`/`X` rotar (con wall-kicks), `↓` soft drop, `Space` hard drop, `P` pausa
- [x] El HUD (`score`, `lines`, `level`) se actualiza correctamente durante la partida
- [x] Al limpiar líneas, el score y el nivel se recalculan según `LINE_SCORES` y `dropInterval` se acelera
- [x] Al perder (pieza nueva colisiona al spawnear), el overlay de Game Over aparece con el score final correcto
- [x] El botón "Publicar score" está deshabilitado si el apodo está vacío
- [x] Al publicar un score válido, se inserta una fila en `scores` con `game_id` correspondiente a `tetris` en Supabase
- [x] Tras publicar, el overlay muestra confirmación sin cerrarse
- [x] "Jugar de nuevo" reinicia la partida sin recargar la página
- [x] El cleanup del `useEffect` cancela el RAF y remueve los listeners de teclado de `document`
- [x] En pantallas < 768px el canvas se oculta y aparece el aviso de escritorio
- [x] `/biblioteca` muestra la card de Tetris con nombre, descripción y cover `cover-bloques` correctos
- [x] `/juego/tetris` no da 404 y muestra el detalle con leaderboard leyendo de Supabase
- [x] El juego de Asteroides sigue funcionando (sin regresiones)

## Decisiones tomadas y descartadas

| Decisión                 | Elegida                                                       | Descartada                                        | Motivo                                                                                         |
| ------------------------ | ------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Estrategia de port       | `useEffect` con lógica vanilla dentro, siguiendo las 7 reglas | Reescritura en TypeScript/clases React            | Mismo patrón probado en Asteroides; minimiza fricción y riesgo                                 |
| HUD                      | Campos propios `score`, `lines`, `level` (sin `lives`)        | HUD genérico con `lives` oculto/fijo              | Tetris no tiene vidas; forzar el molde de Asteroides sería un campo falso sin significado      |
| Next-piece preview       | Segundo `<canvas ref>` de 120×120 portado tal cual            | Omitir la previsualización                        | Es parte visible del HUD original; quitarla degrada la experiencia sin ahorro real de esfuerzo |
| Toggle de tema           | Omitido — tema oscuro fijo de la plataforma                   | Portar el toggle con `localStorage`               | Evita introducir un sistema de temas paralelo al de Arcade Vault                               |
| Listeners de teclado     | En `document`, como el original                               | Forzar `window` como Asteroides                   | El juego original ya funciona así; no hay razón funcional para cambiarlo                       |
| Atajo de pausa           | Tecla `P` + botón del `.player-hud`                           | Solo botón del shell                              | Es gratis mantenerlo y es coherente con el juego original                                      |
| Entrada en `GAMES[]`     | Paso obligatorio del plan                                     | Paso opcional (como sugiere el skill por defecto) | Sin esta entrada, `/juego/tetris` responde `notFound()` al navegar desde `/biblioteca`         |
| Entrada ficticia `caida` | Se deja intacta                                               | Eliminarla al agregar `tetris`                    | No es de este spec tocar contenido ajeno; queda redundante pero no rompe nada                  |
| Cover art                | Clase nueva `cover-bloques`                                   | Reutilizar `cover-rocas`                          | Diferencia visualmente Tetris de Asteroides en `/biblioteca`                                   |
| RLS en tablas            | Fuera de alcance                                              | Configurar políticas ahora                        | Heredado de spec 06; se define cuando exista auth real                                         |
