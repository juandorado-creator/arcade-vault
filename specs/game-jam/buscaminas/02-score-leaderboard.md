---
id: buscaminas-02-score-leaderboard
title: Buscaminas — Score y leaderboard
state: borrador
date: 2026-07-02
depends_on: [buscaminas-01-core-jugable]
objective: Publicar el score de Buscaminas en Supabase mediante un server action `publishScore`, registrar el juego en `games` y en `GAMES[]`, y confirmar que `/juego/buscaminas` lee el leaderboard correctamente.
---

## Alcance

### Dentro

- `app/juegos/buscaminas/actions.ts` con un server action `publishScore` que replica la
  firma y validaciones ya usadas en Asteroides/Tetris/Arkanoid/Serpiente: recibe
  `nickname` (string) y `score` (number), con `gameSlug` por defecto `'buscaminas'`.
  Valida que el apodo no esté vacío y tenga como máximo 20 caracteres, y que `score` sea
  un número entero ≥ 0. Busca el juego en la tabla `games` por `slug`, y si existe,
  inserta la fila en `scores` con el `game_id` correspondiente.
- Migración Supabase (vía MCP `apply_migration`):
  `INSERT INTO games(slug, name, description, path) VALUES ('buscaminas', 'Buscaminas', 'Despeja la grilla evitando las minas. Un clic en falso y todo termina.', '/juegos/buscaminas');`
- Entrada obligatoria en `app/data/index.ts → GAMES[]` con `id: 'buscaminas'`,
  `title: 'BUSCAMINAS'`, `cat: 'PUZZLE'`, `color: 'yellow'`, `cover: 'cover-minas'`,
  `href: '/juegos/buscaminas'`, y textos `short`/`long` describiendo la mecánica de
  revelar celdas y evitar minas — paso indispensable, ya documentado en spec 07/09:
  sin esta entrada, `/juego/buscaminas` responde `notFound()`.
- Confirmación de que `/juego/buscaminas` (página de detalle existente, que lee de
  Supabase vía `lib/supabase/server.ts`) puede resolver el juego por `slug` y listar su
  leaderboard (`scores` ordenado por `score` descendente) sin cambios adicionales al
  componente de detalle, ya que este consume la misma tabla `games`/`scores` que el
  resto de juegos de la plataforma.

### Fuera

- RLS (Row Level Security) en `games`/`scores` — pendiente de auth real, heredado de
  spec 06.
- Autenticación requerida para publicar un score.
- Leaderboard en tiempo real (suscripciones de Supabase) o vista `/salon` dedicada a
  Buscaminas.
- Validación anti-cheat del score en el servidor (recalcular la partida) — se confía en
  el cliente, igual que en el resto de juegos de la plataforma.
- Historial de partidas por jugador (solo se guarda el mejor score enviado, como en el
  resto de juegos).

## Plan de implementación

1. Crear `app/juegos/buscaminas/actions.ts` copiando la estructura de `publishScore` de
   `app/juegos/serpiente/actions.ts`, cambiando el `gameSlug` por defecto a
   `'buscaminas'`. Mantener la validación de apodo (no vacío, ≤20 caracteres) y de score
   (`Number.isInteger(score) && score >= 0`).
   ✓ Verificable: invocar la acción con un `nickname` vacío devuelve un error de
   validación sin llegar a insertar en Supabase.

2. Migración Supabase vía MCP `apply_migration`:

   ```sql
   INSERT INTO games (slug, name, description, path)
   VALUES ('buscaminas', 'Buscaminas', 'Despeja la grilla evitando las minas. Un clic en falso y todo termina.', '/juegos/buscaminas');
   ```

   ✓ Verificable: `list_tables`/`execute_sql` muestra la fila nueva en `games` con
   `slug = 'buscaminas'`.

3. Actualizar `app/data/index.ts`: añadir entrada a `GAMES[]` con `id: 'buscaminas'`,
   `title: 'BUSCAMINAS'`, `short: 'Revela celdas seguras y evita las minas ocultas.'`,
   `long` describiendo la mecánica de flood-fill, banderas y progresión de niveles,
   `cat: 'PUZZLE'`, `cover: 'cover-minas'`, `color: 'yellow'`, `best: 0`, `plays: '0'`,
   `href: '/juegos/buscaminas'`.
   ✓ Verificable: navegar a `/juego/buscaminas` desde `/biblioteca` no da 404 y muestra
   el detalle con el nombre, descripción y leaderboard correctos.

4. Conectar el botón "Publicar score" del modal de Game Over (definido en
   `01-core-jugable.md`) a `publishScore(nickname, finalScore)`, gestionando los
   estados `publishing` y `publishError` ya presentes en el componente.
   ✓ Verificable: al publicar un score válido desde `/juegos/buscaminas`, se inserta una
   fila en `scores` con el `game_id` correspondiente a `buscaminas` en Supabase.

5. Verificar manualmente que `/juego/buscaminas` lista el leaderboard leyendo de
   Supabase (mismo patrón de Server Component que Asteroides/Tetris/Serpiente, sin
   requerir cambios en ese archivo compartido).
   ✓ Verificable: tras publicar dos scores distintos desde partidas separadas, ambos
   aparecen en `/juego/buscaminas` ordenados de mayor a menor.

## Criterios de aceptación

- [ ] `app/juegos/buscaminas/actions.ts` existe y exporta `publishScore` con `gameSlug` por defecto `'buscaminas'`
- [ ] Llamar a `publishScore` con un apodo vacío o de más de 20 caracteres devuelve un error de validación sin insertar en Supabase
- [ ] Llamar a `publishScore` con un score negativo o no entero devuelve un error de validación sin insertar en Supabase
- [ ] La tabla `games` contiene una fila con `slug = 'buscaminas'`, `path = '/juegos/buscaminas'`
- [ ] `app/data/index.ts → GAMES[]` contiene una entrada con `id: 'buscaminas'`
- [ ] `/juego/buscaminas` no responde `notFound()` y muestra el detalle del juego
- [ ] Publicar un score válido desde `/juegos/buscaminas` inserta una fila en `scores` con el `game_id` correcto
- [ ] `/juego/buscaminas` lista el leaderboard leyendo de Supabase, ordenado por score descendente
- [ ] Los juegos de Asteroides, Tetris, Arkanoid y Serpiente siguen funcionando (sin regresiones)

## Decisiones tomadas y descartadas

| Decisión              | Elegida                                                        | Descartada                                                  | Motivo                                                                                                               |
| --------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Slug                  | `buscaminas`                                                   | `minesweeper`                                               | Coherencia con nombres en español del resto del sitio, igual que la decisión tomada para `serpiente`                 |
| Validación anti-cheat | Fuera de alcance, se confía en el score enviado por el cliente | Recalcular la partida server-side antes de aceptar el score | Ningún otro juego de la plataforma lo hace; añadirlo aquí rompería la consistencia sin un pedido explícito           |
| Entrada en `GAMES[]`  | Paso obligatorio del plan                                      | Paso opcional                                               | Aprendido de spec 07/09: sin esta entrada, `/juego/buscaminas` responde `notFound()`                                 |
| Categoría (`cat`)     | `PUZZLE`                                                       | `ARCADE`                                                    | Buscaminas es un juego de lógica/deducción, coherente con Tetris (`caida`), no de reflejos como Asteroides/Serpiente |
| Color                 | `yellow`                                                       | `magenta`                                                   | El amarillo evoca la bandera clásica de advertencia del buscaminas y diferencia la card de Tetris (`cyan`)           |
| RLS en tablas         | Fuera de alcance                                               | Configurar políticas ahora                                  | Heredado de spec 06; se define cuando exista auth real                                                               |
