---
id: 02-home-page
title: Home Page — Landing Page
state: implementado
date: 2026-06-28
depends_on: [01-mvp-visual]
objective: Implementar la landing page de Arcade Vault en la ruta raíz `/`, mover la Biblioteca a `/biblioteca`, y actualizar la Nav para reflejar la estructura de navegación de la referencia.
---

## Alcance

### Dentro
- Componente `Home` (`/`) — hero con siluetas flotantes, sección "¿Por qué Arcade Vault?",
  mini-rail de 6 juegos, bloque de stats, actividad en vivo + top jugadores del día,
  sección de precios + FAQ, CTA final
- Mover la Biblioteca de `/` a `/biblioteca`
- Actualizar `components/Nav.tsx` para incluir links "Inicio" (`/`) y "Biblioteca" (`/biblioteca`),
  ajustar lógica `isActive` acorde

### Fuera
- Datos reales de actividad o puntuaciones (la sección "Actividad en vivo" usa datos hardcoded)
- Animaciones de scroll más allá del `IntersectionObserver` ya definido en la referencia
- Internacionalización
- Tests
- Lógica de autenticación (el botón "Crear Cuenta" navega a `/auth`, nada más)

## Plan de implementación

1. Mover `app/page.tsx` (Biblioteca) a `app/biblioteca/page.tsx`.
   ✓ Verificable: `/biblioteca` muestra el grid de juegos; `/` devuelve 404 temporalmente.

2. Crear `app/page.tsx` (`'use client'`) portando `home.jsx`:
   - `FloatingSilhouettes` con los 8 SVGs pixel
   - `FeatureIcon` con los 4 iconos pixel
   - `MiniCard` para el mini-rail
   - `Home` con las 6 secciones: hero, why, games preview, stats, actividad, pricing, CTA final
   - Navegación con `<Link>` de Next.js en lugar de `onClick(() => navigate(...))`
   ✓ Verificable: `/` renderiza la landing completa sin errores de TS.

3. Actualizar `components/Nav.tsx`:
   - Añadir link "Inicio" → `/`
   - Cambiar link "Biblioteca" → `/biblioteca`
   - Ajustar `isActive` para que `/biblioteca` y `/juego/[id]` activen el link Biblioteca
   ✓ Verificable: link activo se resalta correctamente en cada ruta.

4. Revisar `app/globals.css` y añadir las clases CSS de `home.jsx` que falten
   (`.home-hero`, `.home-silos`, `.silo`, `.mini-card`, `.mini-rail`, `.home-stats`,
   `.activity-card`, `.ticker`, `.top-list`, `.price-card`, `.home-final`, etc.)
   comparando con `references/home-about/styles.css`.
   ✓ Verificable: ninguna sección del Home tiene elementos sin estilo o rotos.

## Criterios de aceptación

- [ ] `/` renderiza la landing page completa sin errores de TypeScript ni de compilación
- [ ] `/biblioteca` muestra la Biblioteca (antes en `/`) con grid, búsqueda y filtros funcionales
- [ ] La Nav muestra los links "Inicio", "Biblioteca", "Salón de la Fama" y "Acerca de"
- [ ] El link activo de la Nav se resalta correctamente en cada ruta
- [ ] El link "Biblioteca" se activa también en `/juego/[id]` y `/juego/[id]/jugar`
- [ ] El hero muestra las 8 siluetas flotantes animadas
- [ ] El mini-rail muestra 6 juegos de `GAMES` con `MiniCard`; cada card navega a `/juego/[id]`
- [ ] El botón "EXPLORAR JUEGOS" navega a `/biblioteca`
- [ ] El botón "CREAR CUENTA" y "EMPEZAR GRATIS" navegan a `/auth`
- [ ] El botón "VER SALÓN →" navega a `/salon`
- [ ] Las secciones con clase `.reveal` aparecen con animación al hacer scroll
- [ ] La sección de pricing muestra el plan único con lista de beneficios y FAQ
- [ ] El diseño es fiel a la referencia (`references/home-about/home.jsx` + `styles.css`)

## Decisiones tomadas y descartadas

| Decisión | Elegida | Descartada | Motivo |
|----------|---------|------------|--------|
| Ruta del Home | `/` como landing page; Biblioteca → `/biblioteca` | Biblioteca sigue en `/` | El Home es la entrada natural del producto |
| Navegación en Home | `<Link href="...">` de Next.js | `onClick(() => navigate(...))` de la referencia | La referencia usa hash-routing; App Router usa `<Link>` |
| Datos de actividad | Arrays hardcoded en el componente | Moverlos a `app/data/index.ts` | Son datos decorativos/mock; no justifican una abstracción |
| Nav actualizada | Actualizar `Nav.tsx` en este spec | Spec separado para la Nav | Es un cambio pequeño y necesario para que el Home funcione |
