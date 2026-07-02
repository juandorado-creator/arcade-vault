---
id: 09-serpiente-game
title: Juego Serpiente
state: aprobado
date: 2026-07-01
depends_on: [06-data-infrastructure]
objective: Portar el juego Serpiente (canvas HTML5 vanilla con HUD DOM y spritesheet de frutas) a una página Next.js en /juegos/serpiente, integrada al leaderboard y a /biblioteca.
---

## Alcance

### Dentro

- Página `app/juegos/serpiente/page.tsx` (`'use client'`) con la shell arcade: refs puente (`canvasRef`, `pausedRef`, `forceEndRef`, `restartRef`), estado React (`score`, `level`, `paused`, `over`, `finalScore`, `nickname`, `saved`, `publishing`, `publishError`) — **sin `lives`**, ya que Serpiente no tiene ese concepto.
- Lógica del juego portada desde `references/started-games/05-snake/game.js` mediante `useEffect`, siguiendo las 7 reglas de adaptación (canvas vía ref, tipos TS en variables, listeners nombrados, estado `let` local al effect, HUD fuera del canvas, sincronización por detección de cambio, reinicio vía `restartRef`).
- `<canvas ref={canvasRef} width={600} height={600}>` — grid 30×30, celda 20px, sin cambios de lógica de colisión/movimiento.
- Mover `assets/fruits.png` → `public/serpiente/fruits.png` y `assets/sprites.js` → cargarse como `<script src="/serpiente/sprites.js">` (o import equivalente) antes de que el `useEffect` use `window.SPRITE_ATLAS` / `window.FRUIT_NAMES` / `loadFruitSheet` / `drawFruit`. Corregir en `sprites.js` la ruta `sources.fruits: 'assets/fruits.png'` → `'/serpiente/fruits.png'`.
- Listeners de teclado en `window` con función nombrada (`onKeyDown`), incluye `KeyP`/`Escape` para pausa y flechas/WASD para dirección — igual que el original.
- `app/juegos/serpiente/actions.ts` — `publishScore` copiado de Asteroides, cambiando el slug por defecto a `serpiente`.
- Migración Supabase: `INSERT INTO games(slug, name, description, path)` con `slug: 'serpiente'`, `name: 'Serpiente'`, `description: 'Come frutas, crece y evita chocar contigo mismo.'`, `path: '/juegos/serpiente'`.
- Entrada en `COVER_MAP` de `app/(main)/biblioteca/biblioteca-client.tsx`: `{ serpiente: 'cover-fruta' }` + clase CSS `.cover-fruta` nueva.
- Entrada obligatoria en `app/data/index.ts` → `GAMES[]` con `id: 'serpiente'`, necesaria para que `/juego/serpiente` no haga `notFound()` (aprendido de spec 07, donde este paso resultó no ser opcional).
- Cleanup del `useEffect`: `cancelAnimationFrame` + remover el listener de `window`.
- Aviso "requiere teclado" en `md:hidden`, igual que Asteroides/Tetris.

### Fuera

- RLS en `games`/`scores` — pendiente de auth real (heredado de spec 06).
- Controles touch / botones on-screen.
- Autenticación requerida para jugar.
- Leaderboard en tiempo real o vista `/salon` dedicada a Serpiente.
- Reescritura del juego en TypeScript real (los tipos se añaden solo a las variables del `useEffect`, no se reescribe la lógica).
- Otros juegos del directorio `references/started-games/` (Arkanoid ya implementado; no aplica más).
- Cambios al aumento de dificultad (`moveInterval` por nivel) — se porta tal cual.

## Plan de implementación

1. Verificar que `app/juegos/layout.tsx` ya inyecta `<Nav />` para todas las rutas `/juegos/*` — ya existe, sin cambio.
   ✓ Verificable: `/juegos/serpiente` mostrará la Nav sin tocar ese archivo.

2. Mover assets: copiar `references/started-games/05-snake/assets/fruits.png` a `public/serpiente/fruits.png`. Copiar `assets/sprites.js` a `public/serpiente/sprites.js` corrigiendo `sources.fruits` a `/serpiente/fruits.png`.
   ✓ Verificable: `public/serpiente/fruits.png` y `public/serpiente/sprites.js` existen; abrir la URL de la imagen directamente en el navegador la muestra.

3. Crear `app/juegos/serpiente/page.tsx` con la shell arcade adaptada:
   - `.player-hud` con `score`, `level` (sin `lives`) + botones pausa/fin/salir.
   - `<canvas ref={canvasRef} width={600} height={600}>` para el tablero.
   - Carga de `sprites.js` vía `<script src="/serpiente/sprites.js">` en el propio JSX (o `next/script` con `strategy="beforeInteractive"` si aplica), de forma que `window.SPRITE_ATLAS`/`loadFruitSheet`/`drawFruit` estén disponibles antes de que el `useEffect` los use.
   - Aviso móvil `md:hidden` ("Este juego requiere teclado") + overlay de pausa + modal Game Over con input de apodo (max 20, uppercase), "Publicar score" y "Jugar de nuevo".
     ✓ Verificable: `/juegos/serpiente` compila y muestra el layout con el canvas y el HUD.

4. Portar `game.js` dentro del `useEffect` según las 7 reglas de adaptación:
   - Reemplazar `document.getElementById('board')` por `canvasRef.current`.
   - Eliminar referencias a `scoreEl`/`levelEl`/`overlay`/`overlayTitle`/`overlayScore`/`restartBtn` del DOM original — se sustituyen por estado React.
   - Tipar las variables de estado del juego (`snake`, `direction`, `nextDirection`, `food`, `foodType`, `score`, `level`, `fruitsEaten`, `paused`, `gameOver`, `moveInterval`, `moveAccum`, `animId`) como `let` local al effect.
   - Listener de teclado en `window` con función nombrada (`onKeyDown`) para poder removerlo en cleanup; conservar `preventDefault()` en teclas de dirección y el atajo `KeyP`/`Escape` para pausa (sincronizado con `pausedRef`).
   - `updateHud()` deja de escribir en `#score`/`#level` del DOM; el loop compara contra el último valor sincronizado y llama a `setScore`/`setLevel` de React solo cuando cambian.
   - `endGame()` deja de manipular `#overlay` del DOM; en su lugar setea `over(true)` y `finalScore` vía React.
   - `reset()` se asigna a `restartRef.current` para que el botón "Jugar de nuevo" del modal lo invoque.
     ✓ Verificable: la serpiente se mueve, come frutas (dibujadas con `drawFruit`), crece, sube de nivel cada 5 frutas y acelera `moveInterval`.

5. Crear `app/juegos/serpiente/actions.ts` copiando `publishScore` de `app/juegos/asteroides/actions.ts` verbatim, cambiando el slug por defecto a `serpiente`.
   ✓ Verificable: llamar a la acción con un `gameSlug` inválido devuelve error de validación; con `serpiente` inserta correctamente.

6. Migración Supabase vía MCP `apply_migration`:

   ```sql
   INSERT INTO games (slug, name, description, path)
   VALUES ('serpiente', 'Serpiente', 'Come frutas, crece y evita chocar contigo mismo.', '/juegos/serpiente');
   ```

   ✓ Verificable: `list_tables`/`execute_sql` muestra la fila nueva en `games`.

7. Actualizar `app/(main)/biblioteca/biblioteca-client.tsx`: añadir `serpiente: 'cover-fruta'` a `COVER_MAP` y la clase CSS `.cover-fruta` en los estilos de covers existentes.
   ✓ Verificable: `/biblioteca` muestra la card de Serpiente con un fondo distinto a las demás.

8. Actualizar `app/data/index.ts`: añadir entrada a `GAMES[]` con `id: 'serpiente'`, `title: 'SERPIENTE'`, `short`/`long` acordes, `cover: 'cover-fruta'`.
   ✓ Verificable: navegar a `/juego/serpiente` desde la card de `/biblioteca` no da 404 y muestra el detalle con leaderboard.

## Criterios de aceptación

- [ ] `/juegos/serpiente` carga sin errores de compilación ni de consola
- [ ] El canvas 600×600 renderiza el juego (grid, serpiente, fruta) al entrar a la página
- [ ] Los controles de teclado responden: flechas/WASD mueven, `P`/`Escape` pausa
- [ ] La serpiente crece al comer fruta y el score aumenta según `SCORE_PER_FRUIT * level`
- [ ] Cada 5 frutas comidas sube de nivel y el `moveInterval` se acelera (hasta el mínimo definido)
- [ ] Las frutas se dibujan con el spritesheet (`drawFruit`) sin errores de carga de imagen
- [ ] Al chocar contra el borde o contra sí misma, el modal de Game Over aparece con el score final correcto
- [ ] El botón "Publicar score" está deshabilitado si el apodo está vacío
- [ ] Al publicar un score válido, se inserta una fila en `scores` con `game_id` correspondiente a `serpiente` en Supabase
- [ ] Tras publicar, el modal muestra confirmación sin cerrarse
- [ ] "Jugar de nuevo" reinicia la partida sin recargar la página
- [ ] El cleanup del `useEffect` cancela el RAF y remueve el listener de teclado de `window`
- [ ] En pantallas < 768px el canvas se oculta y aparece el aviso de escritorio
- [ ] `/biblioteca` muestra la card de Serpiente con nombre, descripción y cover `cover-fruta` correctos
- [ ] `/juego/serpiente` no da 404 y muestra el detalle con leaderboard leyendo de Supabase
- [ ] Los juegos de Asteroides, Tetris y Arkanoid siguen funcionando (sin regresiones)

## Decisiones tomadas y descartadas

| Decisión             | Elegida                                                                                                                      | Descartada                                                                     | Motivo                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Slug                 | `serpiente`                                                                                                                  | `snake`                                                                        | Coherencia con nombres en español del resto del sitio (decisión explícita del usuario)             |
| Estrategia de port   | `useEffect` con lógica vanilla dentro, siguiendo las 7 reglas                                                                | Reescritura en TypeScript/clases React                                         | Mismo patrón probado en Asteroides/Tetris; minimiza fricción y riesgo                              |
| HUD                  | Campos propios `score`, `level` en JSX (sin `lives`)                                                                         | Mantener overlay/divs HTML del original                                        | Serpiente no tiene vidas; el molde `.player-hud` del shell arcade ya soporta HUD variable          |
| Assets de sprites    | `public/serpiente/` + `sprites.js` cargado como `<script>` propio, usando `window.SPRITE_ATLAS`/`loadFruitSheet`/`drawFruit` | Portar el contenido de `sprites.js` a funciones locales dentro del `useEffect` | `sprites.js` ya usa globals en `window`; mínima fricción, coherente con cómo el original lo diseñó |
| Overlay de Game Over | Modal estándar del shell arcade (igual que Asteroides/Tetris)                                                                | Mantener el overlay HTML/CSS original                                          | Consistencia visual entre juegos de la plataforma                                                  |
| Reinicio             | `reset()` expuesto vía `restartRef.current`                                                                                  | Botón HTML original con `addEventListener` directo                             | Patrón estándar ya usado en Asteroides y Tetris                                                    |
| Entrada en `GAMES[]` | Paso obligatorio del plan                                                                                                    | Paso opcional (como sugiere el skill por defecto)                              | Aprendido de spec 07: sin esta entrada, `/juego/serpiente` responde `notFound()`                   |
| Cover art            | Clase nueva `cover-fruta`                                                                                                    | `cover-jardin`                                                                 | Ligada visualmente a las frutas del spritesheet del propio juego                                   |
| Listener de teclado  | En `window`, como el original                                                                                                | Forzar `document` como Tetris                                                  | El juego original ya funciona así; no hay razón funcional para cambiarlo                           |
| RLS en tablas        | Fuera de alcance                                                                                                             | Configurar políticas ahora                                                     | Heredado de spec 06; se define cuando exista auth real                                             |
