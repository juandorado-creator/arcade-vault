---
name: spec-game
description: Diseña el spec para portar/crear un juego canvas y su leaderboard en Arcade Vault. Pregunta por la fuente del juego y construye el spec sección por sección. No escribe código. Úsalo antes de implementar un juego nuevo.
disable-model-invocation: true
argument-hint: 'nombre o slug del juego (opcional)'
---

# /spec-game — Diseñador de specs de juegos + leaderboard

Este skill produce el spec de un juego nuevo en Arcade Vault. **No escribe código.**
Su salida es un único archivo `specs/NN-<slug>.md` en estado `Borrador`, listo para
revisión y para luego implementar con `/spec-impl`.

Sigue el mismo estilo de casa que los specs 05 y 06: frontmatter YAML en español,
secciones Alcance / Plan / Criterios / Decisiones.

La **fuente de verdad para las reglas de escritura de un spec** es el skill `/spec`
(`.agents/skills/spec/SKILL.md` y `.agents/skills/spec/template.md`). Léelos en
la Fase 1 — este skill hereda todas sus reglas y solo añade el conocimiento de
dominio de Arcade Vault encima.

## Contexto del dominio que este skill conoce

Arcade Vault integra juegos canvas vanilla como páginas Next.js `'use client'`
en `/juegos/<slug>`. El patrón está completamente probado en Asteroides (specs 05 + 06).
Todo juego nuevo debe implementar **seis piezas** en este orden:

1. **`app/juegos/<slug>/page.tsx`** — shell arcade reutilizable:
   - Refs puente React↔loop: `canvasRef`, `pausedRef`, `forceEndRef`, `restartRef`.
   - Estado React: `score`, `lives`, `level`, `paused`, `over`, `finalScore`,
     `nickname`, `saved`, `publishing`, `publishError`.
   - `useEffect([])` que porta el `game.js` vanilla según **7 reglas de adaptación**:
     - Canvas vía `canvasRef.current` — no `getElementById`.
     - Tipos TypeScript en las variables del juego (sin reescribir la lógica).
     - Listeners nombrados (`onKeyDown`, `onKeyUp`) para poder removerlos en cleanup.
     - Estado del juego como `let` dentro del effect (no módulo global).
     - HUD y overlays fuera del canvas — son DOM React, no se dibujan en el canvas.
     - Loop sincroniza a React por detección de cambio (`if (score !== lastScore) setScore(score)`).
     - Reinicio vía `restartRef.current?.()` — no tecla Space dentro del loop.
   - Cleanup: `cancelAnimationFrame(rafId)` + `removeEventListener` en el `return`.
   - JSX: `.player-hud` (score/vidas/nivel + botones pausa/fin/salir), shell `.crt`,
     aviso móvil `md:hidden` ("Este juego requiere teclado"), overlay de pausa,
     modal Game Over con input apodo (max 20, uppercase) + "Publicar score" + "Jugar de nuevo".
2. **`app/juegos/<slug>/actions.ts`** — `publishScore({ nickname, score, gameSlug })`:
   valida apodo/score en servidor, resuelve `game_id` por slug, inserta en `scores`.
   Es genérico — se copia verbatim de Asteroides cambiando solo el slug por defecto.
3. **Migración Supabase** (paso del plan, no del skill): `INSERT INTO games(slug, name,
description, path)`. Las tablas `games` y `scores` ya existen desde spec 06; solo
   se agrega la fila del juego nuevo vía MCP `apply_migration`.
4. **`app/(main)/biblioteca/biblioteca-client.tsx`** — añadir entrada en `COVER_MAP`
   (`{ <slug>: 'cover-<nombre>' }`) y la clase CSS `cover-<nombre>` correspondiente.
   La lectura de `games` desde Supabase ya es genérica; no cambia el servidor.
5. **`app/data/index.ts`** (opcional) — entrada en el array `GAMES[]` con cover,
   categoría y descripción larga para la página de detalle `/juego/[id]`.
6. **`app/juegos/layout.tsx`** — ya inyecta `<Nav />` para todos los juegos.
   **Sin cambios** por juego.

Archivos de referencia que el spec generado debe citar:

- `app/juegos/asteroides/page.tsx` — patrón de port completo
- `app/juegos/asteroides/actions.ts` — patrón de Server Action
- `app/(main)/biblioteca/biblioteca-client.tsx` — `COVER_MAP` y CSS covers
- `lib/supabase/server.ts` — siempre `await createClient()`
- `specs/05-asteroids-game.md`, `specs/06-data-infrastructure.md`

RLS: está deshabilitado en `games` y `scores` (heredado de spec 06). El spec
generado lo marca como fuera de alcance hasta que exista auth real.

## Flujo del comando

Responde siempre en el mismo idioma del prompt inicial. Sigue las cuatro fases en
orden. **No te saltes fases.**

---

### Fase 1 — Contexto

Antes de hacer ninguna pregunta, reúne el contexto del proyecto. Ejecuta estos
pasos en orden; no omitas ninguno:

1. Lee `.agents/skills/spec/SKILL.md` — las reglas de escritura de un spec
   (fases, disciplina de preguntas, reglas duras, tono). Este skill las hereda todas.
2. Lee `.agents/skills/spec/template.md` — la estructura canónica de secciones
   y el estilo de cada una. Es la referencia que debes respetar al escribir cada
   sección del spec del juego.
3. Lee `CLAUDE.md` y/o `AGENTS.md` para conocer el stack y convenciones del proyecto.
4. Lista `specs/` para ver qué specs existen y cuál es el siguiente número secuencial.
5. Lee los specs 05 y 06 (`specs/05-asteroids-game.md`, `specs/06-data-infrastructure.md`)
   para calibrar el estilo de la casa: frontmatter YAML en español, secciones en
   español, líneas `✓ Verificable:`, tabla de decisiones.
6. Lista el contenido de `references/started-games/` para saber qué juegos vanilla
   están disponibles localmente.

Si `$ARGUMENTS` tiene valor, úsalo como slug o nombre inicial sugerido. Si está
vacío, pide una descripción de una frase de lo que se quiere portar o crear.

---

### Fase 2 — Preguntas de aclaración

Haz preguntas en bloques de 3 a 5. Marca cuál es tu recomendación en cada una.
Espera la respuesta antes de continuar.

**Preguntas obligatorias del primer bloque:**

1. **Fuente del juego.** ¿Viene de `references/started-games/`? Si es así, ¿cuál
   carpeta? Si no, pega el `game.js` y dime: el `id` del `<canvas>`, sus dimensiones,
   y si hay assets (imágenes o sonidos). El skill no inventa la lógica del juego.

2. **Slug y ruta.** ¿Cuál es el slug en kebab-case? (Recomendación: derivarlo del
   nombre — p. ej. "Tetris" → `tetris`, ruta `/juegos/tetris`.)

3. **HUD acoplado al DOM.** ¿El juego muestra score, vidas o niveles en elementos
   HTML fuera del canvas (como Tetris), o todo va dentro del canvas (como Asteroides)?
   Impacta el esfuerzo de port.

**Segundo bloque (si aplica según las respuestas anteriores):**

4. **Assets externos.** ¿Hay imágenes o sonidos que deban moverse a `public/` y
   tener sus rutas corregidas? Si es Arkanoid, por ejemplo, hay spritesheet y MP3.

5. **Metadatos de la card.** `name` (texto en la card de `/biblioteca`) y
   `description` (una línea corta para la fila en la tabla `games`).

6. **Cover art.** ¿Qué clase CSS `cover-*` usará en `COVER_MAP`? ¿Usamos una
   existente (actualmente: `cover-rocas` para Asteroides) o creamos una nueva?

7. **Controles.** ¿El juego requiere teclado? (Recomendación: sí → mostrar aviso
   "usa escritorio" en pantallas < 768px y ocultar el canvas, igual que Asteroides.)

**Cuándo parar de preguntar:** cuando puedas responder sin asumir nada:

- ¿Qué archivos van a aparecer o cambiar?
- ¿Cuál es el primer paso ejecutable y cuál el último?
- ¿Cómo verifico que el juego está integrado?

---

### Fase 3 — Construir el spec sección por sección

Una sección a la vez. Muéstrala en markdown. Pregunta: "¿Esta sección queda así o
quieres ajustar algo?" Solo avanza cuando el usuario confirme.

Orden estricto:

1. **Frontmatter YAML en español**

   ```yaml
   ---
   id: NN-<slug>
   title: <Nombre del juego>
   state: Borrador
   date: <fecha de hoy>
   depends_on: [06-data-infrastructure]
   objective: <una frase>
   ---
   ```

   El `objective` describe en una frase qué se porta y dónde termina integrado.
   Si no cabe en una frase, la feature es demasiado grande — propón dividirla.

2. **Alcance**
   Dos sub-secciones explícitas:
   - `### Dentro` — las seis piezas del checklist que aplican a este juego,
     más cualquier adaptación específica (assets, HUD DOM, etc.).
   - `### Fuera` — RLS, auth requerida para jugar, controles touch, leaderboard
     en tiempo real, port de otros juegos, y cualquier cosa que haya salido en
     la conversación pero se descarte.

3. **Plan de implementación**
   Pasos numerados. Cada paso deja el sistema funcional y tiene una línea
   `✓ Verificable:` que describe cómo comprobar que el paso está completo.
   Estructura mínima (adaptar según el juego):

   1. Verificar si `app/juegos/layout.tsx` ya existe (ya existe — sin cambio).
   2. Crear `app/juegos/<slug>/page.tsx` con la shell arcade + `useEffect` que porta
      `game.js` según las 7 reglas.
      _(Si hay assets: añadir sub-paso de mover a `public/<slug>/` y corregir rutas.)_
      _(Si hay HUD DOM: añadir sub-paso de reproducir el HUD en JSX.)_
   3. Crear `app/juegos/<slug>/actions.ts` — `publishScore` copiado de Asteroides.
   4. Migración Supabase: `INSERT INTO games(slug, name, description, path)` vía
      MCP `apply_migration`. Las tablas ya existen.
   5. Actualizar `app/(main)/biblioteca/biblioteca-client.tsx`: entrada en `COVER_MAP`
      y clase CSS `cover-<nombre>`.
   6. (Opcional) Actualizar `app/data/index.ts` con la entrada en `GAMES[]`.

4. **Criterios de aceptación**
   Checklist booleano. Ejemplos obligatorios a incluir:
   - `/juegos/<slug>` carga sin errores de compilación ni de consola
   - El canvas renderiza el juego al entrar a la página
   - Los controles de teclado responden correctamente
   - Al perder, el overlay de Game Over aparece con el score final correcto
   - El botón "Publicar score" está deshabilitado si el apodo está vacío
   - Al publicar un score válido, se inserta una fila en `scores` en Supabase
   - Tras publicar, el overlay muestra confirmación sin cerrarse
   - "Jugar de nuevo" reinicia la partida sin recargar la página
   - El cleanup del `useEffect` cancela el RAF y remueve los listeners de teclado
   - En pantallas < 768px el canvas se oculta y aparece el aviso de escritorio
   - `/biblioteca` muestra la card del juego con nombre, descripción y enlace correctos
   - El juego de Asteroides sigue funcionando (sin regresiones)

5. **Decisiones tomadas y descartadas**
   Tabla markdown con columnas: Decisión | Elegida | Descartada | Motivo.
   Captura al menos: estrategia de port, HUD canvas vs DOM, control del reinicio,
   comunicación juego→React (refs vs `window.__callback`), RLS, assets (si aplica).

---

### Fase 4 — Guardar el spec

Cuando todas las secciones estén confirmadas:

1. Determina el siguiente número secuencial en `specs/`.
2. Propón el nombre de archivo: `specs/NN-<slug>.md`. Confirma con el usuario antes
   de escribir.
3. Crea el archivo con todas las secciones aprobadas. Estado: `Borrador`.
4. Confirma al usuario:
   - Ruta del archivo creado.
   - Recordatorio: el spec está en `Borrador`. Cámbialo a `Aprobado` cuando hayas
     releído y estés conforme.
   - Próximo paso: una vez aprobado, corre `/spec-impl NN-<slug>` para implementarlo.
5. **Para aquí.** No propongas implementar, no escribas código, no tomes más acciones.

---

## Reglas duras

- **Nunca escribir código durante este comando.** Solo el archivo `.md` al final.
- **Nunca proponer implementar el spec** después de guardarlo. Tu trabajo termina
  cuando el archivo está escrito.
- **Nunca generar el spec completo de un tiro.** Sección por sección, con confirmación.
- **No asumir la lógica del juego.** Si no hay fuente vanilla, pedirla. No inventar.
- **No asumir decisiones que el usuario no confirmó.** Si falta información, preguntar.
- Si la feature es demasiado grande (el objetivo no cabe en una frase, toca más de
  tres áreas, requiere decisiones en cuatro o más dominios): propón dividirla en dos
  specs antes de continuar.

## Tono al preguntar

Directo y específico. No te disculpes por preguntar. Usa preguntas concretas con
opciones numeradas; marca tu recomendación y el motivo.

Ejemplo de bloque bien formado:

> Antes de escribir el plan necesito aclarar tres cosas:
>
> 1. **Assets.** Arkanoid usa un spritesheet PNG y dos MP3. ¿Los movemos a
>    `public/arkanoid/` y corregimos las rutas en `game.js`? (Recomendación: sí —
>    es la única forma de que Next.js los sirva en producción.)
> 2. **HUD DOM.** Tetris tiene `<canvas id="next-canvas">` y divs `#score #lines
#level`. ¿Los reproducimos en JSX dentro del shell arcade, o creamos un layout
>    HTML separado? (Recomendación: JSX — mantiene todo en un componente React.)
> 3. **Cover art.** ¿Creamos una clase nueva `cover-ladrillo` para Arkanoid, o
>    reutilizamos `cover-rocas`? (Recomendación: clase nueva — diferencia visualmente
>    los juegos en `/biblioteca`.)

## Argumentos

Si el usuario invocó `/spec-game tetris`, usa `tetris` como slug sugerido pero
confírmalo en Fase 2.

Si invocó `/spec-game` sin argumentos, empieza Fase 1 y luego pide la descripción
de una frase.
