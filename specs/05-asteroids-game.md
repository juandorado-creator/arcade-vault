---
id: 05-asteroids-game
title: Juego Asteroides
state: aprobado
date: 2026-06-29
depends_on: [04-supabase-setup]
objective: Portar el juego Asteroides (canvas HTML5 vanilla) a una página Next.js standalone en /juegos/asteroides y enlazarlo desde /biblioteca.
---

## Alcance

### Dentro

- Página `app/juegos/asteroides/page.tsx` (`'use client'`) con un `<canvas>` 800×600
- Lógica del juego portada desde `references/started-games/02-asteroids/game.js`
  mediante `useEffect` — sin reescritura, sin TypeScript en la lógica del juego
- Cancelación del `requestAnimationFrame` en el cleanup del `useEffect` (sin memory leaks)
- Layout sin Nav global: la página gestiona su propio encabezado o ninguno
- Aviso "Juega desde escritorio" visible solo en pantallas < 768px (el canvas se oculta)
- Card de Asteroides en la página `/biblioteca` existente que enlaza a `/juegos/asteroides`

### Fuera

- Guardar el score en Supabase — spec separado
- Autenticación requerida para jugar — spec separado
- Controles touch / botones on-screen — spec separado
- Canvas responsivo / escalado dinámico — spec separado
- Reescritura del juego en TypeScript — spec separado
- Leaderboard o historial de partidas — spec separado

## Plan de implementación

1. Verificar si la Nav global está en `app/layout.tsx` o se incluye página a página.
   Si está en el root layout, crear `app/juegos/layout.tsx` que la omita.
   ✓ Verificable: `/juegos/asteroides` no muestra Nav; el resto de páginas sí.

2. Crear `app/juegos/asteroides/page.tsx` (`'use client'`):
   - Render: un `<canvas ref={canvasRef} width={800} height={600}` centrado en pantalla,
     con `overflow-x: auto` en el contenedor para pantallas menores a 800px.
   - Aviso mobile: un `<div>` visible solo en `< 768px` con mensaje
     "Este juego requiere teclado. Ábrelo desde un escritorio."
     El canvas se oculta en esa misma breakpoint.
   - `useEffect`: copia la lógica de `game.js` adaptada para recibir el canvas via ref
     en lugar de `document.getElementById('c')`. Retorna un cleanup que llama a
     `cancelAnimationFrame(rafId)`.
     ✓ Verificable: navegar a `/juegos/asteroides` muestra el canvas con el juego corriendo.

3. Adaptar `game.js` para funcionar dentro del `useEffect`:
   - Reemplazar `document.getElementById('c')` por el `canvasRef.current` recibido como parámetro.
   - Los `addEventListener` de teclado se añaden sobre `window` (sin cambio) y se
     remueven en el cleanup.
   - El `requestAnimationFrame` se guarda en una variable `rafId` para poder cancelarlo.
   - No se modifica ninguna otra lógica del juego.
     ✓ Verificable: el juego arranca, los asteroides se mueven, los controles responden.

4. Añadir card de Asteroides en la página `/biblioteca`:
   - Nombre: "Asteroides", descripción breve, enlace a `/juegos/asteroides`.
   - El diseño de la card sigue el patrón visual de las cards existentes en esa página.
     ✓ Verificable: `/biblioteca` muestra la card y el enlace navega correctamente.

## Criterios de aceptación

- [ ] `/juegos/asteroides` carga sin errores de compilación ni de consola
- [ ] El canvas 800×600 renderiza el juego inmediatamente al entrar a la página
- [ ] Los controles de teclado (←→ rotar, ↑ propulsar, Espacio disparar) funcionan
- [ ] Los asteroides se parten en fragmentos más pequeños al ser destruidos
- [ ] El score y las vidas se actualizan correctamente durante la partida
- [ ] Al perder todas las vidas, aparece la pantalla de Game Over con el score final
- [ ] Al salir de la página, el loop `requestAnimationFrame` se cancela (sin memory leaks)
- [ ] Los `addEventListener` de teclado se remueven en el cleanup del `useEffect`
- [ ] En pantallas < 768px el canvas se oculta y aparece el aviso de escritorio
- [ ] La Nav global no aparece en `/juegos/asteroides`
- [ ] `/biblioteca` muestra una card de Asteroides que enlaza a `/juegos/asteroides`

## Decisiones tomadas y descartadas

| Decisión                   | Elegida                                  | Descartada                             | Motivo                                                                             |
| -------------------------- | ---------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| Estrategia de port         | `useEffect` con lógica vanilla dentro    | Reescritura en TypeScript/clases React | Mínima fricción; la lógica del juego ya funciona y no necesita cambios             |
| Tamaño del canvas          | Fijo 800×600 con overflow en contenedor  | Canvas responsivo con escalado         | La lógica de colisión usa coordenadas absolutas; escalar requeriría ajustar inputs |
| Integración de score       | Standalone — solo se muestra en pantalla | Guardar en Supabase                    | Fuera de alcance; no hay tablas ni modelo de puntos definido aún                   |
| Autenticación              | No requerida — cualquiera puede jugar    | Ruta protegida con redirect a login    | No hay UI de auth todavía; bloquear el juego sería regresión de UX                 |
| Controles móvil            | Aviso "usa escritorio" en < 768px        | Botones touch on-screen                | Los botones touch son complejidad desproporcionada para este spec                  |
| Chrome de la página        | Sin Nav global                           | Nav global como el resto de páginas    | El juego debe ocupar toda la atención; la Nav es distracción en una sala de juego  |
| Acceso desde la plataforma | Card en `/biblioteca`                    | Sin enlace — URL directa solamente     | El juego debe ser descubrible desde la plataforma sin conocer la URL               |
