---
id: 01-mvp-visual
title: MVP Visual — Todas las Pantallas
state: Implementado
date: 2026-06-27
depends_on: []
objective: Implementar en Next.js las 5 pantallas visuales de Arcade Vault (Biblioteca, Detalle, Reproductor, Auth, Salón de la Fama) y la Nav compartida, fielmente al diseño de las plantillas de referencia, sin lógica de juego real.
---

## Alcance

### Dentro
- Componente `Nav` (desktop + panel móvil con backdrop)
- Pantalla `Biblioteca` (`/`) — hero, buscador, filtros por categoría, grid de tarjetas con efecto tilt
- Pantalla `Detalle` (`/juego/[id]`) — portada, info, estadísticas, leaderboard simulado
- Pantalla `Reproductor` (`/juego/[id]/jugar`) — HUD, pantalla CRT con animación decorativa CSS, overlay de pausa, modal de Game Over
- Pantalla `Auth` (`/auth`) — tabs Login/Registro, formularios, botones sociales
- Pantalla `Salón de la Fama` (`/salon`) — podio, tabs por juego, tabla completa
- Módulo de datos mock en `app/data/index.ts` con tipos TypeScript

### Fuera
- Lógica real de juego (ningún juego funcional)
- Backend, base de datos ni autenticación real
- Guardado persistente de puntuaciones (el modal de Game Over muestra el flujo visual pero no persiste)
- Internacionalización
- Tests

## Modelo de datos

Ubicación: `app/data/index.ts`

### Tipos

```ts
type GameColor = "cyan" | "magenta" | "yellow" | "green"

interface Game {
  id: string
  title: string
  short: string
  long: string
  cat: GameCategory
  cover: string        // clase CSS para el fondo de portada
  color: GameColor
  best: number
  plays: string
}

type GameCategory = "TODOS" | "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS"

interface ScoreRow {
  rank: number
  name: string
  score: number
  date: string
}
```

### Constantes exportadas
- `GAMES: Game[]` — los 8 juegos de la plantilla
- `CATS: GameCategory[]` — lista de categorías
- `PLAYERS: string[]` — nombres de jugadores ficticios
- `seededScores(seed: number, count?: number): ScoreRow[]` — generador determinístico de puntuaciones

## Plan de implementación

1. Crear `app/data/index.ts` con los tipos, constantes y `seededScores`.
   ✓ Verificable: importar desde cualquier página sin errores de TS.

2. Crear `components/Nav.tsx` (`'use client'`) portando `nav.jsx`.
   Usar `usePathname` de Next.js para detectar ruta activa en lugar del prop `route`.
   ✓ Verificable: se renderiza en todas las pantallas con links funcionales.

3. Añadir `<Nav />` al layout raíz `app/layout.tsx`.
   ✓ Verificable: Nav aparece en todas las rutas.

4. Implementar `app/page.tsx` (`'use client'`) — Biblioteca.
   Portando `biblioteca.jsx`: hero, búsqueda, chips de categoría, grid de GameCards con tilt.
   ✓ Verificable: grid muestra 8 juegos; búsqueda y filtros reducen resultados; tilt funciona.

5. Implementar `app/juego/[id]/page.tsx` (`'use client'`) — Detalle.
   Portando `detalle.jsx`: portada, tags, título, descripción, stat-strip, leaderboard lateral.
   ✓ Verificable: cada juego muestra su data correcta y leaderboard simulado.

6. Implementar `app/juego/[id]/jugar/page.tsx` (`'use client'`) — Reproductor.
   Portando `reproductor.jsx`: HUD, pantalla CRT animada (CSS puro), overlay de pausa,
   modal de Game Over. Sin lógica de juego real; el score sube automáticamente como en la plantilla.
   ✓ Verificable: pausa/reanudar funciona; modal Game Over aparece al pulsar FIN.

7. Implementar `app/auth/page.tsx` (`'use client'`) — Auth.
   Portando `auth.jsx`: tabs Login/Registro, campos, botones sociales.
   ✓ Verificable: el tab alterna y aparece el campo de email al registrarse.

8. Implementar `app/salon/page.tsx` (`'use client'`) — Salón de la Fama.
   Portando `salon.jsx`: podio top 3, tabs por juego, tabla completa.
   ✓ Verificable: cambiar tab actualiza podio y tabla.

9. Revisar clases CSS faltantes en `globals.css` y añadir las que no estén migradas
   (comparar con `references/templates/styles.css`).
   ✓ Verificable: ninguna pantalla tiene elementos sin estilo o rotos.

## Criterios de aceptación

- [ ] `app/data/index.ts` exporta `GAMES`, `CATS`, `PLAYERS` y `seededScores` con tipos TypeScript sin errores
- [ ] La Nav aparece en todas las rutas; el link activo se resalta correctamente
- [ ] La Nav móvil abre y cierra el panel lateral con backdrop
- [ ] `/` muestra el hero, el buscador y los 8 juegos en el grid
- [ ] El filtro por categoría y la búsqueda por nombre reducen el grid en tiempo real
- [ ] Las tarjetas tienen efecto tilt al mover el ratón
- [ ] `/juego/[id]` muestra la info correcta para cada uno de los 8 juegos
- [ ] `/juego/[id]` muestra un leaderboard simulado de 10 entradas
- [ ] `/juego/[id]/jugar` muestra HUD con puntuación, vidas y nivel
- [ ] El botón PAUSA muestra el overlay; REANUDAR lo oculta
- [ ] El botón FIN abre el modal de Game Over con la puntuación final
- [ ] `/auth` alterna entre las tabs Login y Registro; el campo email aparece solo en Registro
- [ ] `/salon` muestra el podio top 3 y la tabla completa
- [ ] Cambiar el tab de juego en `/salon` actualiza podio y tabla
- [ ] Ninguna pantalla tiene errores de TypeScript ni de compilación
- [ ] El diseño es fiel a las plantillas de referencia (colores, tipografía, efectos neón)

## Decisiones tomadas y descartadas

| Decisión | Elegida | Descartada | Motivo |
|----------|---------|------------|--------|
| Routing | Rutas reales de App Router (`/juego/[id]`) | Hash-routing de la plantilla | Next.js App Router es el estándar del proyecto |
| Estilos | Portar CSS de la plantilla a `globals.css` + Tailwind v4 para lo nuevo | Reescribir todo en Tailwind | El CSS ya está migrado; reescribir no aporta valor en el MVP |
| Datos mock | `app/data/index.ts` con tipos TS | JSON estático | Permite tipar y eventualmente reemplazar por llamadas a API |
| Lógica de juego en Reproductor | Animación CRT decorativa (CSS puro, score automático) | Pantalla "Próximamente" | Aporta sensación de producto terminado sin complejidad extra |
| Auth | Solo visual, sin contexto global de sesión | Integrar con Next-Auth u otro proveedor | Es MVP visual; la auth real es trabajo de otra spec |
| Estado de usuario | No persiste entre rutas en este MVP | localStorage como en la plantilla | Evita complejidad de contexto global; se aborda en spec futura |

## Riesgos identificados

- **Clases CSS faltantes en globals.css:** La plantilla tiene ~970 líneas de estilos; puede haber clases
  específicas de alguna pantalla que no estén migradas. Mitigación: en el paso 9 del plan se hace
  una revisión explícita comparando con `references/templates/styles.css`.

- **Componentes Client en App Router:** Todas las pantallas usan hooks (`useState`, `useEffect`),
  por lo que requieren `'use client'`. El riesgo es intentar usarlos como Server Components por
  defecto. Mitigación: declarar `'use client'` en cada página y componente que use hooks.

- **`usePathname` vs prop `route`:** La Nav de la plantilla recibe `route` como prop. En Next.js
  se usa `usePathname()`, que tiene un comportamiento ligeramente distinto en rutas dinámicas.
  Mitigación: definir la lógica `isActive` basada en `pathname.startsWith()`.
