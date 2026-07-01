---
id: 06-data-infrastructure
title: Infraestructura de datos de juegos y scores
state: aprobado
date: 2026-06-30
depends_on: [05-asteroids-game]
objective: Crear las tablas `games` y `scores` en Supabase, migrar `/biblioteca` a leer juegos desde la base de datos, y añadir el flujo de publicación de score al terminar una partida de Asteroides.
---

## Alcance

### Dentro

- Migración de Supabase: tabla `games` con los campos mínimos para describir un juego
- Migración de Supabase: tabla `scores` con apodo, puntaje, referencia a juego y fecha
- Seed inicial: un registro en `games` para Asteroides
- `/biblioteca` pasa a ser un Server Component que lee juegos desde `games` en Supabase
- Flujo de fin de partida en `/juegos/asteroides`:
  - Al llegar al Game Over, aparece un modal/overlay con el score final
  - El jugador escribe su apodo (max 20 caracteres)
  - Botón "Publicar score" que inserta el registro en `scores`
  - Confirmación visual tras publicar (ej. "¡Score publicado!")
  - Botón "Jugar de nuevo" que reinicia la partida

### Fuera

- RLS (Row Level Security) en las tablas — se define cuando haya autenticación real
- Validación de apodos (anti-spam, moderación) — spec futuro
- Editar o eliminar scores — spec futuro
- Página `/salon` y leaderboard inline en el juego — spec 07
- Otros juegos más allá de Asteroides — se agregan cuando existan
- Autenticación — spec separado

## Modelo de datos

### Tabla `games`

| Columna       | Tipo          | Restricciones                   | Notas                              |
| ------------- | ------------- | ------------------------------- | ---------------------------------- |
| `id`          | `uuid`        | PK, default `gen_random_uuid()` |                                    |
| `slug`        | `text`        | NOT NULL, UNIQUE                | Ej. `"asteroides"` — usado en URLs |
| `name`        | `text`        | NOT NULL                        | Ej. `"Asteroides"`                 |
| `description` | `text`        |                                 | Descripción corta para la card     |
| `path`        | `text`        | NOT NULL                        | Ej. `"/juegos/asteroides"`         |
| `created_at`  | `timestamptz` | NOT NULL, default `now()`       |                                    |

### Tabla `scores`

| Columna      | Tipo          | Restricciones                             | Notas               |
| ------------ | ------------- | ----------------------------------------- | ------------------- |
| `id`         | `uuid`        | PK, default `gen_random_uuid()`           |                     |
| `game_id`    | `uuid`        | NOT NULL, FK → `games.id`                 |                     |
| `nickname`   | `text`        | NOT NULL, max 20 chars (check constraint) |                     |
| `score`      | `integer`     | NOT NULL, >= 0 (check constraint)         |                     |
| `created_at` | `timestamptz` | NOT NULL, default `now()`                 | Fecha de la partida |

### Seed inicial

```sql
INSERT INTO games (slug, name, description, path)
VALUES (
  'asteroides',
  'Asteroides',
  'Destruye asteroides, sobrevive el espacio.',
  '/juegos/asteroides'
);
```

## Plan de implementación

1. **Crear migración de Supabase — tablas `games` y `scores`**
   Aplicar via MCP `apply_migration` con el SQL que crea ambas tablas y el seed
   de Asteroides en `games`.
   ✓ Verificable: `list_tables` muestra `games` y `scores`; `games` tiene 1 fila.

2. **Actualizar `/biblioteca` para leer desde Supabase**
   Convertir `app/biblioteca/page.tsx` en Server Component (si no lo es ya).
   Usar `createServerClient` desde `lib/supabase/server.ts` para hacer
   `select * from games order by created_at asc`.
   Renderizar las cards con los datos devueltos por la BD en lugar de los datos
   hardcodeados.
   ✓ Verificable: `/biblioteca` carga y muestra la card de Asteroides con los
   datos que vienen de Supabase.

3. **Añadir overlay de Game Over en `/juegos/asteroides`**
   En `app/juegos/asteroides/page.tsx`, añadir estado React `gameOver: boolean`
   y `finalScore: number`. Cuando el juego termina, la lógica vanilla llama a un
   callback expuesto en `window` (ej. `window.__onGameOver(score)`) que actualiza
   ese estado. Renderizar un overlay centrado encima del canvas que muestre:
   - Score final
   - Input de texto para el apodo (max 20 caracteres, requerido)
   - Botón "Publicar score" (deshabilitado si el input está vacío)
   - Botón "Jugar de nuevo"
     ✓ Verificable: al perder todas las vidas, el overlay aparece con el score correcto.

4. **Implementar la acción de publicar score**
   Crear Server Action `app/juegos/asteroides/actions.ts` que recibe
   `{ nickname, score, gameSlug }`, busca el `game_id` por slug en `games`, e
   inserta en `scores`. Validar en servidor: `nickname` no vacío y max 20 chars,
   `score >= 0`.
   Desde el overlay, al pulsar "Publicar score", llamar a la Server Action.
   Tras éxito: mostrar mensaje "¡Score publicado!" y dejar visible el botón
   "Jugar de nuevo". Tras error: mostrar mensaje de error sin cerrar el overlay.
   ✓ Verificable: publicar un score inserta una fila en `scores` visible desde
   Supabase.

5. **Implementar "Jugar de nuevo"**
   El botón "Jugar de nuevo" en el overlay oculta el overlay y reinicia la
   lógica del juego (llamando a la misma función de inicialización del
   `useEffect`, o desmontando y remontando el componente via key prop).
   ✓ Verificable: tras publicar o saltar el leaderboard, el juego reinicia
   correctamente sin recargar la página.

## Criterios de aceptación

- [ ] Las tablas `games` y `scores` existen en Supabase con los campos definidos en el modelo de datos
- [ ] `games` tiene exactamente 1 fila al finalizar la migración (Asteroides)
- [ ] `scores.nickname` rechaza valores de más de 20 caracteres (check constraint)
- [ ] `scores.score` rechaza valores negativos (check constraint)
- [ ] `/biblioteca` carga los juegos desde Supabase (sin datos hardcodeados)
- [ ] `/biblioteca` muestra la card de Asteroides con nombre, descripción y enlace correctos tal como están en la BD
- [ ] Al perder todas las vidas en Asteroides, el overlay de Game Over aparece con el score final correcto
- [ ] El botón "Publicar score" está deshabilitado si el input de apodo está vacío
- [ ] Al publicar un score válido, se inserta una fila en `scores` en Supabase
- [ ] Tras publicar, el overlay muestra "¡Score publicado!" sin cerrarse
- [ ] El botón "Jugar de nuevo" reinicia la partida sin recargar la página
- [ ] El juego de Asteroides sigue funcionando igual que antes (sin regresiones)
- [ ] `/biblioteca` sigue funcionando igual que antes (sin regresiones visuales)

## Decisiones tomadas y descartadas

| Decisión                     | Elegida                                  | Descartada                           | Motivo                                                                                 |
| ---------------------------- | ---------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| Comunicación juego → React   | Callback en `window.__onGameOver(score)` | Reescribir lógica del juego en React | La lógica vanilla no se toca (spec 05); el callback es el puente mínimo necesario      |
| Publicar score               | Botón explícito "Publicar score"         | Guardar automáticamente al Game Over | El jugador decide si quiere aparecer en el leaderboard; reduce scores accidentales     |
| Server Action vs API Route   | Server Action en `actions.ts`            | Route Handler en `/api/scores`       | App Router favorece Server Actions para mutaciones; menos boilerplate                  |
| Identificación de jugador    | Apodo escrito al publicar                | UUID anónimo en localStorage         | El apodo es parte de la experiencia arcade clásica; el UUID es invisible e impersonal  |
| RLS en tablas                | Fuera de scope                           | Configurar políticas ahora           | No hay autenticación real todavía; RLS se define cuando exista el modelo de auth       |
| Thumbnail / imagen del juego | Fuera de scope (no hay campo en `games`) | Campo `thumbnail_url` en la tabla    | No hay assets preparados; se añade cuando se diseñe la card con imagen                 |
| Leaderboard UI               | Spec 07 separado                         | Incluir `/salon` aquí                | Separar infraestructura de datos de presentación facilita iterar cada una por separado |
