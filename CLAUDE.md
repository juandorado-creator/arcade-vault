# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**Arcade Vault** — an online gaming platform where users play retro-style arcade games and compete on leaderboards. Built with Spec Driven Design: each feature is specced in `specs/NN-*.md` (via the `/spec` and `/spec-impl` skills from [Klerith/fernando-skills](https://github.com/Klerith/fernando-skills)) before implementation.

No test runner is configured yet.

## Skills

- Usa siempre **/frontend-design** para diseñar la interfaz de usuario.
- **/spec** genera la especificación de una feature en `specs/`; **/spec-impl** la implementa. Ambas están fijadas en `skills-lock.json`.

## Agentes

- **`game-planner`** (`.claude/agents/game-planner.md`) — decide qué juego nuevo encaja en la plataforma (huecos de categoría, clásicos retro, viabilidad técnica, variedad de mecánica) y registra la sugerencia en `references/game-suggestions-todo.md`, su memoria persistente para no repetir ideas. No genera specs ni código; el siguiente paso manual es `/spec`.

## Stack

- **Next.js 16.2.9** with App Router — **this version has breaking changes vs training data**. Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`. For quick navigation, there is `index.md` + subdirs `01-app/`, `02-pages/`, `03-architecture/`.
- **React 19.2.4**
- **TypeScript** (strict mode, path alias `@/*` → project root)
- **Tailwind CSS v4** — config is entirely in CSS via `@theme inline {}` blocks in `app/globals.css`. No `tailwind.config.js`. Use `@import "tailwindcss"` (not the v3 `@tailwind base/components/utilities` directives). PostCSS uses the `@tailwindcss/postcss` plugin (not `tailwindcss` directly).
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`) — auth and the `games` / `scores` data layer.
- **Resend** — transactional email for the contact form.

## Architecture

App Router project; all routes live under `app/`.

- **`app/layout.tsx`** — root layout: Geist fonts as CSS variables, flex-column body. Global styles and Tailwind theme tokens in `app/globals.css`.
- **`app/(main)/`** — route group for the site chrome (shares `layout.tsx`). Pages: `page.tsx` (home), `about`, `auth`, `biblioteca` (game catalog), `salon` (leaderboards / salón de la fama), `juego/[id]` (game detail) and `juego/[id]/jugar` (play view), plus `api/contact/route.ts` (POST → Resend email).
- **`app/juegos/`** — the playable games, each a self-contained client component with a `page.tsx` and a `actions.ts` server action (`publishScore`). Games implemented: **asteroides**, **tetris**, **arkanoid**, **serpiente** and more... (see `references/implemented-games.md`) when you need to check which games are implemented and how to implement new ones. Its own `layout.tsx` renders the shared `Nav`.
- **`components/Nav.tsx`** — shared navigation.

### Data layer

- **`app/data/index.ts`** — static game metadata (`GAMES`, `CATS`, types `Game` / `GameColor` / `GameCategory` / `ScoreRow`) and the `seededScores()` helper for placeholder leaderboards.
- **Supabase tables** `games` and `scores` — Server Components (`biblioteca`, `salon`, `juego/[id]`) read from them via `lib/supabase/server.ts`. Score publishing is a server action that looks up the game by `slug`, validates the nickname (≤20 chars, non-empty) and score, then inserts into `scores`.
- **`lib/supabase/client.ts`** (browser) and **`lib/supabase/server.ts`** (RSC/server actions, plus `getUser()`). Both read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from env.
- **`middleware.ts`** — refreshes the Supabase auth session on every request (calls `supabase.auth.getUser()`), excluding static assets and images.

## Tooling

- **Supabase MCP server** — configured in `.mcp.json` (HTTP, scoped to a project ref). Prefer `list_tables` / `get_advisors` / `get_logs` before schema changes; use `apply_migration` for DDL (it goes straight to the remote project).
- **PostToolUse hook** (`.claude/hooks/format-and-lint.sh`) — runs automatically after every Write/Edit: Prettier formats the file, blank lines are stripped from source files, and ESLint auto-fixes then fails (exit 2) if unfixable errors/warnings remain.
- **Env** — see `.env.template`. Requires the Supabase URL + publishable key, `RESEND_API_KEY`, and `CONTACT_EMAIL`.
- **`references/`** — design mockups (JSX/CSS/HTML) used as visual reference when building pages.
