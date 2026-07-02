# Arcade Vault

Plataforma para jugar juegos arcade retro online y competir por la mayor cantidad de puntos en tablas de clasificación.

## Juegos disponibles

- **Asteroides** — dispara y esquiva en el espacio.
- **Tetris** — encaja piezas y limpia líneas.
- **Arkanoid** — rebota la pelota y destruye muros de bloques.
- **Serpiente** — crece sin morder tu propia cola.

Cada juego publica el score final en Supabase; el **Salón de la fama** (`/salon`) muestra las mejores puntuaciones y la **Biblioteca** (`/biblioteca`) el catálogo de juegos.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** (config en CSS, sin `tailwind.config.js`)
- **Supabase** (`@supabase/ssr`) — auth y datos (`games`, `scores`)
- **Resend** — email del formulario de contacto

## Spec Driven Design

Cada feature se especifica en `specs/NN-*.md` antes de implementarse, usando `/spec` y `/spec-impl`.
Basado en las buenas prácticas de https://github.com/Klerith/fernando-skills

```bash
npx skills@latest add Klerith/fernando-skills
```

## Configuración

Copia `.env.template` a `.env.local` y completa:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `RESEND_API_KEY` y `CONTACT_EMAIL`

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # start production server
npm run lint     # ESLint (eslint-config-next/core-web-vitals + typescript)
npm run format   # Prettier --write .
```
