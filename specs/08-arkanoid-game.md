---
id: 08-arkanoid-game
title: Juego Arkanoid
state: aprobado
date: 2026-07-01
depends_on: [06-data-infrastructure]
objective: Portar el juego Arkanoid (canvas HTML5 vanilla, con assets de imagen/sonido y 5 niveles) a una página Next.js en /juegos/arkanoid, integrarlo al flujo de publicación de score y enlazarlo desde /biblioteca.
---

## Alcance

### Dentro

- Página `app/juegos/arkanoid/page.tsx` (`'use client'`) con la shell arcade: refs puente
  (`canvasRef`, `pausedRef`, `forceEndRef`, `restartRef`), estado React (`score`, `lives`,
  `level`, `paused`, `over`, `finalScore`, `nickname`, `saved`, `publishing`, `publishError`).
- Lógica del juego portada desde `references/started-games/04-arkanoid/game.js` (más
  `levels.js` y `assets/spritesheet.js`) mediante `useEffect`, siguiendo las 7 reglas de
  adaptación, **con estas excepciones explícitas para este juego**:
  - El HUD (score, nivel, vidas) se mantiene dibujado dentro del canvas vía `ctx.fillText`,
    tal como en el original — no se migra a `.player-hud` de React.
  - Se elimina el sistema de pausa nativo del juego (tecla P/Escape, overlay con botones
    de selección de nivel por clic). La pausa se controla exclusivamente vía el botón
    `PAUSA` del HUD de React y `pausedRef`, igual que en Asteroides.
  - Se elimina el listener `mousemove` sobre el canvas que controlaba la paleta. El
    control de la paleta queda solo por `ArrowLeft`/`ArrowRight`.
  - El estado `'win'` (5 niveles completados) se trata igual que `'gameover'` a efectos
    de React: dispara el mismo overlay de fin de partida con el score final y permite
    publicar el score.
- Assets movidos a `public/arkanoid/`: `spritesheet-breakout.png`, `ball-bounce.mp3`,
  `break-sound.mp3`. Rutas corregidas en `game.js` y `assets/spritesheet.js`.
- `app/juegos/arkanoid/actions.ts` — `publishScore` copiado verbatim de Asteroides,
  cambiando el `gameSlug` por defecto a `'arkanoid'`.
- Migración Supabase: `INSERT INTO games(slug, name, description, path)` con
  `slug: 'arkanoid'`, `name: 'Arkanoid'`, `description: 'Rompe bloques, sobrevive 5 niveles.'`,
  `path: '/juegos/arkanoid'`.
- `app/(main)/biblioteca/biblioteca-client.tsx`: entrada `arkanoid: 'cover-ladrillos'` en
  `COVER_MAP`, más la clase CSS `.cover-ladrillos` (y su `::after`) en `app/globals.css`
  siguiendo el patrón visual de `.cover-rocas` / `.cover-bloques`.
- `app/data/index.ts`: entrada en `GAMES[]` para Arkanoid (`cat: 'ARCADE'`,
  `cover: 'cover-ladrillos'`, `href: '/juegos/arkanoid'`).

### Fuera

- Selector de nivel por clic durante la pausa — se descarta, no se reimplementa en React.
- HUD como DOM React — se mantiene dibujado en canvas para este juego.
- Control de paleta por mouse — se elimina, solo teclado.
- Controles touch / botones on-screen.
- RLS (Row Level Security) en `games`/`scores` — ya está fuera de alcance desde spec 06.
- Autenticación requerida para jugar.
- Leaderboard en tiempo real o página `/salon` específica para Arkanoid.
- Reescritura de la lógica del juego en TypeScript tipado (se mantiene JS vanilla dentro
  del `useEffect`, salvo las excepciones ya listadas).

## Plan de implementación

1. Verificar que `app/juegos/layout.tsx` ya inyecta `<Nav />` para todas las rutas
   `/juegos/*` (ya existe desde spec 05/07 — sin cambio).
   ✓ Verificable: `app/juegos/layout.tsx` existe y no requiere edición.

2. Mover assets del juego a `public/arkanoid/`: `spritesheet-breakout.png`,
   `ball-bounce.mp3`, `break-sound.mp3`. Corregir las rutas relativas en
   `assets/spritesheet.js` (carga de imagen) y en `game.js` (`new Audio(...)`)
   para apuntar a `/arkanoid/...`.
   ✓ Verificable: los tres archivos existen en `public/arkanoid/`; no quedan
   referencias a rutas relativas antiguas (`assets/...`) en el código portado.

3. Crear `app/juegos/arkanoid/page.tsx` con la shell arcade y el `useEffect` que
   porta `game.js` + `levels.js` + `assets/spritesheet.js`:
   - Canvas vía `canvasRef.current`, sin `getElementById`.
   - Listeners nombrados `onKeyDown`/`onKeyUp` para `ArrowLeft`/`ArrowRight`
     (se elimina el listener `mousemove` de control de paleta).
   - Se elimina el toggle de pausa por teclado (P/Escape) y el overlay de
     selección de nivel por clic; el loop respeta `pausedRef.current` como en
     Asteroides.
   - El HUD (`Score:`, `Nivel:`, vidas) se mantiene dibujado en el canvas vía
     `ctx.fillText` — no se reproduce en JSX.
   - El estado del juego (`gameState`) trata `'win'` igual que `'gameover'`:
     ambos disparan `setFinalScore(score)` + `setOver(true)` en el loop.
   - HUD de React (`.player-hud`) muestra solo lo que ya vive fuera del canvas:
     botones PAUSA / FIN / SALIR (sin score/vidas/nivel duplicados, ya que
     viven en el canvas).
   - Cleanup: `cancelAnimationFrame(rafId)` + `removeEventListener` de teclado.
     ✓ Verificable: `/juegos/arkanoid` carga, el canvas renderiza el juego, la
     paleta responde a las flechas, y no hay overlay de pausa con selector de
     nivel.

4. Crear `app/juegos/arkanoid/actions.ts` copiando verbatim
   `app/juegos/asteroides/actions.ts`, sin más cambio que el nombre del archivo
   (el `gameSlug` se sigue pasando como parámetro desde `page.tsx`, con
   `'arkanoid'` como valor por defecto en la llamada a `publishScore`).
   ✓ Verificable: publicar un score desde `/juegos/arkanoid` inserta una fila en
   `scores` con el `game_id` correcto.

5. Migración Supabase vía MCP `apply_migration`:

   ```sql
   INSERT INTO games (slug, name, description, path)
   VALUES ('arkanoid', 'Arkanoid', 'Rompe bloques, sobrevive 5 niveles.', '/juegos/arkanoid');
   ```

   ✓ Verificable: `list_tables`/`execute_sql` muestra la fila nueva en `games`.

6. Actualizar `app/(main)/biblioteca/biblioteca-client.tsx`: añadir
   `arkanoid: 'cover-ladrillos'` a `COVER_MAP`. Añadir la clase `.cover-ladrillos`
   (base + `::after` con gradientes de "ladrillos") en `app/globals.css`,
   siguiendo el patrón de `.cover-rocas` / `.cover-bloques`.
   ✓ Verificable: `/biblioteca` muestra la card de Arkanoid con su propia cover
   visual, distinta de Asteroides y Tetris.

7. (Opcional) Actualizar `app/data/index.ts`: añadir entrada para Arkanoid en
   `GAMES[]` con `cover: 'cover-ladrillos'`, `cat: 'ARCADE'`,
   `href: '/juegos/arkanoid'`, `short` descriptivo para la página de detalle.
   ✓ Verificable: `/juego/arkanoid` (detalle) muestra la información correcta
   si esa ruta consume `GAMES[]`.

## Criterios de aceptación

- [ ] `/juegos/arkanoid` carga sin errores de compilación ni de consola
- [ ] El canvas 800×600 renderiza el juego (paleta, pelota, bloques) al entrar a la página
- [ ] Los controles de teclado (←→ mover paleta) responden correctamente
- [ ] La tecla P/Escape ya NO alterna pausa dentro del canvas — solo el botón PAUSA del HUD
- [ ] El score, nivel y vidas se actualizan y se ven correctamente dibujados en el canvas
- [ ] Al romper todos los bloques de un nivel, avanza al siguiente nivel (hasta 5)
- [ ] Al completar el nivel 5 (`gameState === 'win'`), aparece el overlay de fin de partida
      con el score final, igual que en un Game Over real
- [ ] Al perder todas las vidas, aparece el overlay de fin de partida con el score final correcto
- [ ] El botón "Publicar score" está deshabilitado si el apodo está vacío
- [ ] Al publicar un score válido (en win o en gameover), se inserta una fila en `scores` en Supabase
- [ ] Tras publicar, el overlay muestra confirmación sin cerrarse
- [ ] "Jugar de nuevo" reinicia la partida (nivel 1, score 0, vidas 3) sin recargar la página
- [ ] El cleanup del `useEffect` cancela el RAF y remueve los listeners de teclado
- [ ] El listener `mousemove` de control de paleta ya no existe en el código portado
- [ ] En pantallas < 768px el canvas se oculta y aparece el aviso de escritorio
- [ ] Los assets (spritesheet PNG, MP3s) se sirven desde `/arkanoid/...` en `public/` sin 404s
- [ ] `/biblioteca` muestra la card de Arkanoid con nombre, descripción, cover propia
      (`cover-ladrillos`) y enlace correctos
- [ ] Los juegos de Asteroides y Tetris siguen funcionando (sin regresiones)

## Decisiones tomadas y descartadas

| Decisión                   | Elegida                                        | Descartada                                              | Motivo                                                                                                                                             |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| HUD (score/nivel/vidas)    | Dibujado dentro del canvas (`ctx.fillText`)    | Migrado a `.player-hud` de React                        | El juego original ya lo dibuja con precisión visual (posiciones, íconos de vida); replicarlo en JSX es esfuerzo redundante sin beneficio funcional |
| Sistema de pausa           | Solo botón `PAUSA` de React + `pausedRef`      | Tecla P/Escape + overlay con selector de nivel por clic | Consistencia con Asteroides/Tetris; el selector de nivel secreto es una feature de desarrollo, no de producto                                      |
| Control de paleta          | Solo teclado (`ArrowLeft`/`ArrowRight`)        | Mouse (`mousemove`) + teclado                           | Consistencia con el resto de la plataforma, que asume teclado y muestra aviso "requiere teclado" en móvil                                          |
| Estado `'win'`             | Tratado igual que `'gameover'` (mismo overlay) | Estado separado sin overlay de publicar score           | Completar el juego es un logro tan válido como perder; el jugador debería poder publicar su score en ambos casos                                   |
| Slug                       | `arkanoid`                                     | `arkanoide`                                             | Nombre propio de marca/género, no se traduce; consistente con el nombre de la carpeta de referencia                                                |
| Assets (spritesheet, MP3s) | Movidos a `public/arkanoid/`, rutas corregidas | Referenciados desde su ubicación original               | Next.js solo sirve estáticos en producción desde `public/`                                                                                         |
| Cover art                  | Clase nueva `.cover-ladrillos`                 | Reutilizar `.cover-bloques` (Tetris)                    | Diferencia visualmente a Arkanoid de Tetris en `/biblioteca` pese a ser ambos juegos de bloques                                                    |
