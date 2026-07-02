---
id: buscaminas-03-biblioteca-catalogo
title: Buscaminas — Biblioteca y cover art
state: borrador
date: 2026-07-02
depends_on: [buscaminas-01-core-jugable]
objective: Añadir la cover art propia de Buscaminas al catálogo de /biblioteca mediante una nueva clase CSS .cover-minas registrada en COVER_MAP.
---

## Alcance

### Dentro

- Entrada `buscaminas: 'cover-minas'` en `COVER_MAP` de
  `app/(main)/biblioteca/biblioteca-client.tsx`, siguiendo el mismo patrón que
  `asteroides: 'cover-rocas'`, `tetris: 'cover-bloques'`, `arkanoid: 'cover-ladrillos'`
  y `serpiente: 'cover-fruta'`.
- Clase CSS `.cover-minas` (más sus pseudo-elementos `::before`/`::after`) en
  `app/globals.css`, siguiendo el patrón visual de las covers existentes: fondo oscuro
  con gradiente, una grilla de celdas tenue dibujada con gradientes repetidos, algunos
  puntos rojos que evocan minas ocultas y un ícono central de bandera amarilla.
- Verificación visual de que la card de Buscaminas en `/biblioteca` muestra nombre,
  descripción corta y la cover `cover-minas` distinguible del resto de covers de la
  plataforma.

### Fuera

- Rediseño del componente `GameCard` o del layout general de `/biblioteca` — se reutiliza
  tal cual.
- Animaciones o efectos hover propios de esta cover distintos a los ya existentes
  (`tiltRef`/`onMove`/`onLeave` en `GameCard`, compartidos por todas las cards).
- Ilustración con imagen rasterizada (PNG/SVG) — la cover se construye 100% con
  gradientes CSS, igual que el resto de covers del catálogo.
- Cambios a `CATS` o a los filtros de categoría de `/biblioteca` — `PUZZLE` ya existe
  como categoría filtrable.

## Plan de implementación

1. Añadir `buscaminas: 'cover-minas'` al objeto `COVER_MAP` en
   `app/(main)/biblioteca/biblioteca-client.tsx`, junto a las entradas existentes de
   `asteroides`, `tetris`, `arkanoid` y `serpiente`.
   ✓ Verificable: `COVER_MAP['buscaminas']` devuelve `'cover-minas'`.

2. Definir en `app/globals.css`, junto a las reglas `.cover-rocas`/`.cover-bloques`/
   `.cover-ladrillos`/`.cover-fruta` ya existentes:

   - `.cover-minas`: fondo con `linear-gradient` oscuro (tonos grises/azulados, en línea
     con la paleta neón del resto del sitio).
   - `.cover-minas::after`: una grilla tenue de celdas dibujada con
     `repeating-linear-gradient` horizontal y vertical superpuestos, más 3-4 puntos
     rojos (`radial-gradient`) distribuidos que evocan minas ocultas bajo celdas sin
     revelar.
   - `.cover-minas::before`: un ícono central (por ejemplo el carácter `⚑` o un pseudo
     triángulo/rombo) en `var(--yellow)` con `text-shadow`/`box-shadow` de resplandor,
     igual que el `▲` de `.cover-rocas` o la pala de `.cover-ladrillos`.
     ✓ Verificable: la clase renderiza un fondo distinto (grilla + puntos rojos + ícono
     amarillo central) visualmente diferenciable de `.cover-bloques` y `.cover-fruta`.

3. Confirmar en `/biblioteca` que la card de Buscaminas (una vez migrada la fila en
   `games` según `02-score-leaderboard.md`) usa `cover-minas` y no cae al valor por
   defecto (`cover-rocas`) del fallback `COVER_MAP[game.slug] ?? 'cover-rocas'`.
   ✓ Verificable: inspeccionar la card de Buscaminas en `/biblioteca` muestra la clase
   `cover-minas` aplicada, no `cover-rocas`.

## Criterios de aceptación

- [ ] `COVER_MAP` en `biblioteca-client.tsx` incluye `buscaminas: 'cover-minas'`
- [ ] `app/globals.css` define `.cover-minas` con fondo, grilla tenue y puntos rojos vía `::after`
- [ ] `app/globals.css` define `.cover-minas::before` con un ícono central en `var(--yellow)` y resplandor
- [ ] `/biblioteca` muestra la card de Buscaminas con nombre, descripción corta y la cover `cover-minas`
- [ ] La cover de Buscaminas es visualmente distinguible de `cover-bloques`, `cover-ladrillos` y `cover-fruta`
- [ ] Las cards de los demás juegos (Asteroides, Tetris, Arkanoid, Serpiente) conservan su cover original sin regresiones

## Decisiones tomadas y descartadas

| Decisión               | Elegida                                                                 | Descartada                                                             | Motivo                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Nombre de la clase     | `.cover-minas`                                                          | `.cover-buscaminas`                                                    | Consistente con el patrón corto ya usado (`cover-rocas`, `cover-fruta`), evita nombres redundantes con el `id` del juego |
| Composición visual     | Grilla tenue + puntos rojos (minas) + ícono central de bandera amarilla | Reutilizar el patrón de bloques de `.cover-bloques`/`.cover-ladrillos` | Diferenciar visualmente a Buscaminas de los demás juegos de grilla ya existentes en el catálogo                          |
| Color del ícono        | `var(--yellow)`                                                         | `var(--cyan)`                                                          | Coherente con el `color: 'yellow'` asignado al juego en `GAMES[]` (spec `02-score-leaderboard.md`)                       |
| Técnica de ilustración | 100% gradientes CSS (sin imagen rasterizada)                            | PNG/SVG dedicado                                                       | Mismo patrón que el resto de covers de `/biblioteca`; evita gestionar un asset estático nuevo                            |
