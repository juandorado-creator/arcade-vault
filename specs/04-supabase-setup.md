---
id: 04-supabase-setup
title: Integración base de Supabase
state: implementado
date: 2026-06-29
depends_on: [03-about-page]
objective: Instalar y configurar @supabase/ssr como infraestructura base de la app, incluyendo clientes de servidor y cliente, middleware de sesión, y Supabase Auth habilitado — sin UI de autenticación.
---

## Alcance

### Dentro

- Instalar `@supabase/ssr` y `@supabase/supabase-js`
- Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`
- Cliente para Server Components / Route Handlers / Server Actions: `lib/supabase/server.ts`
- Cliente para Client Components: `lib/supabase/client.ts`
- Middleware `middleware.ts` en la raíz que refresca el token de sesión en cada request
- Helper `getUser()` en `lib/supabase/server.ts` que devuelve el usuario autenticado o `null`
- Verificación de conexión: una Server Component de prueba que llama a `getUser()` y loguea el resultado

### Fuera

- Página `/auth` (login / registro / logout) — spec separado
- Tablas en base de datos — spec separado
- Supabase Realtime — spec futuro
- Edge Functions — spec futuro
- Row Level Security (RLS) — se configura cuando haya tablas
- OAuth providers — se añaden cuando exista la UI de auth

## Plan de implementación

1. Instalar dependencias.

   ```bash
   npm install @supabase/ssr @supabase/supabase-js
   ```

   ✓ Verificable: ambos paquetes aparecen en `package.json` > dependencies.

2. Añadir variables de entorno en `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

   ✓ Verificable: el archivo existe y tiene ambas variables.

3. Crear `lib/supabase/server.ts` — cliente para Server Components, Route Handlers y
   Server Actions, usando `createServerClient` de `@supabase/ssr` con cookies de Next.js.
   Exporta también `getUser()` que llama a `supabase.auth.getUser()` y devuelve
   `{ user } | { user: null }`.
   ✓ Verificable: el archivo no tiene errores de TypeScript.

4. Crear `lib/supabase/client.ts` — cliente para Client Components, usando
   `createBrowserClient` de `@supabase/ssr`.
   ✓ Verificable: el archivo no tiene errores de TypeScript.

5. Crear `middleware.ts` en la raíz del proyecto que intercepta todas las rutas,
   refresca el token de sesión con `createServerClient` y hace `supabase.auth.getUser()`
   para mantener la cookie actualizada. Configurar `matcher` para excluir assets estáticos.
   ✓ Verificable: el servidor arranca sin errores; las rutas responden normalmente.

6. Añadir verificación de conexión en `app/page.tsx` (Server Component):
   importar `getUser()` desde `lib/supabase/server.ts`, llamarlo y loguear
   `[Supabase] user:` + resultado en consola del servidor.
   ✓ Verificable: al cargar `/`, la terminal del servidor muestra `[Supabase] user: null`
   (sin sesión activa) sin lanzar errores.

## Criterios de aceptación

- [x] `@supabase/ssr` y `@supabase/supabase-js` están en `package.json` > dependencies
- [x] `.env.local` contiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (se usó publishable key en lugar de anon key)
- [x] `lib/supabase/server.ts` exporta un cliente de servidor y `getUser()` sin errores de TypeScript
- [x] `lib/supabase/client.ts` exporta `createBrowserClient` sin errores de TypeScript
- [x] `middleware.ts` existe en la raíz, refresca el token en cada request y excluye assets estáticos
- [x] El servidor arranca sin errores tras añadir el middleware
- [x] Al cargar `/`, la consola del servidor muestra `[Supabase] user: null` sin lanzar excepciones
- [x] Ninguna ruta existente (`/`, `/biblioteca`, `/about`) se rompe tras la integración

## Decisiones tomadas y descartadas

| Decisión                  | Elegida                                       | Descartada                      | Motivo                                                                                                |
| ------------------------- | --------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Paquete de integración    | `@supabase/ssr`                               | `@supabase/supabase-js` solo    | `@supabase/ssr` es el estándar para App Router; gestiona cookies correctamente en Server Components   |
| Cliente de servidor       | `createServerClient` con cookies de Next.js   | Cliente único isomórfico        | App Router requiere clientes separados para server y client; compartir uno rompe el manejo de sesión  |
| Realtime / Edge Functions | Sin andamiaje en este spec                    | Helpers vacíos pre-configurados | La configuración base ya es compatible; el andamiaje anticipado añade complejidad sin valor inmediato |
| UI de autenticación       | Fuera de scope — spec separado                | Incluir `/auth` aquí            | La infraestructura y la UI son responsabilidades distintas; separarlas facilita iterar cada una       |
| RLS                       | Fuera de scope                                | Configurar políticas ahora      | No hay tablas propias todavía; RLS se define cuando exista un modelo de datos                         |
| Verificación de conexión  | Log en consola del servidor en `app/page.tsx` | Endpoint `/api/health` dedicado | Mínimo suficiente para confirmar que la integración funciona; no justifica una ruta extra             |
