# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**Arcade Vault** — an online gaming platform where users play and compete for points. Uses Spec Driven Design (via `/spec` and `/spec-impl` skills from [Klerith/fernando-skills](https://github.com/Klerith/fernando-skills)).

No test runner is configured yet.

## Skill

Usa siempre /frontend-design para diseña la interfaz de usuario.

## Stack

- **Next.js 16.2.9** with App Router — **this version has breaking changes vs training data**. Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`. For quick navigation nav to docs, there is `index.md` + subdirs `01-app/`, `02-pages/`, `03-architecture/`.
- **React 19.2.4**
- **TypeScript** (strict mode, path alias `@/*` → project root)
- **Tailwind CSS v4** — config is entirely in CSS via `@theme inline {}` blocks in `app/globals.css`. No `tailwind.config.js`. Use `@import "tailwindcss"` (not the v3 `@tailwind base/components/utilities` directives).
- PostCSS uses `@tailwindcss/postcss` plugin (not `tailwindcss` directly).

## Architecture

This is an App Router project. All routes live under `app/`. The root layout (`app/layout.tsx`) sets up Geist fonts as CSS variables and a flex-column body. Global styles and Tailwind theme tokens are in `app/globals.css`.

There are no additional routes, components, or data layers yet — this is a fresh scaffold.
