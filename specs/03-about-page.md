---
id: 03-about-page
title: About Page + Envío de Correo
state: implementado
date: 2026-06-28
depends_on: [02-home-page]
objective: Crear la página `/about` con la sección "Acerca de" y el formulario de contacto que envía correos reales mediante Resend.
---

## Alcance

### Dentro
- Página `app/about/page.tsx` (`'use client'`) portando `about.jsx` de la referencia
- Sección hero "Acerca de" con los 3 highlight cards (HEART, BROWSER, PLANT)
- Divisor animado de píxeles
- Sección "Contacto" con el formulario (nombre, email, mensaje)
- Estado de éxito: terminal animado "VAULT-OS // TERMINAL"
- Estado de error: mensaje de error inline bajo el botón de envío
- API Route `app/api/contact/route.ts` que recibe el POST y envía el correo via Resend
- Integración del SDK `resend` (nuevo paquete)
- Variables de entorno: `RESEND_API_KEY` y `CONTACT_EMAIL`
- Estilos CSS necesarios en `app/globals.css` (clases de `about.jsx` + `styles.css` de la referencia)
- La Nav ya incluye el link "Acerca de" → `/about` (definido en spec 02, sin cambios adicionales)

### Fuera
- Dominio verificado en Resend (se usa `onboarding@resend.dev`; funcional solo en desarrollo)
- Rate limiting del formulario
- Almacenamiento de mensajes en base de datos
- Tests
- Internacionalización

## Modelo de datos

No se introduce ninguna estructura persistida. El formulario usa estado local de React:

```ts
// Estado del formulario (cliente)
{ name: string; email: string; msg: string }

// Estado de UI
sent: string | null   // nombre del remitente si el envío fue exitoso
error: string | null  // mensaje de error si Resend falla
shake: boolean        // animación de validación

// Payload POST → /api/contact
{ name: string; email: string; msg: string }

// Respuesta de la API Route
{ ok: true } | { error: string }
```

## Plan de implementación

1. Instalar el SDK de Resend.
   ```bash
   npm install resend
   ```
   ✓ Verificable: `resend` aparece en `package.json` > dependencies.

2. Añadir variables de entorno en `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   CONTACT_EMAIL=juanpaborado@gmail.com
   ```
   ✓ Verificable: el archivo existe y tiene ambas variables.

3. Crear `app/api/contact/route.ts`:
   - Recibe POST con `{ name, email, msg }`
   - Valida que los tres campos no estén vacíos (devuelve 400 si fallan)
   - Llama a `resend.emails.send()` con `from: "onboarding@resend.dev"`,
     `to: process.env.CONTACT_EMAIL`, subject y body HTML simple
   - Devuelve `{ ok: true }` (200) o `{ error: string }` (500)
   ✓ Verificable: `curl -X POST /api/contact` con payload válido devuelve 200.

4. Crear `app/about/page.tsx` (`'use client'`) portando `about.jsx`:
   - Componente `About` con estado local (`form`, `sent`, `error`, `shake`)
   - `useEffect` con `IntersectionObserver` para animaciones `.reveal`
   - `onSubmit` hace `fetch('/api/contact', { method: 'POST', body: JSON.stringify(form) })`
     — si responde ok → `setSent(form.name)`
     — si responde error → `setError(mensaje)`
   - Sección hero con los 3 `HighlightIcon` (HEART, BROWSER, PLANT) portados a TSX
   - Divisor animado de píxeles
   - Sección contacto con el formulario y el terminal de éxito
   - Mensaje de error inline bajo el botón si `error !== null`
   ✓ Verificable: `/about` renderiza sin errores de TypeScript.

5. Añadir estilos en `app/globals.css`:
   - Clases de `about.jsx` y `styles.css` de la referencia que no existan aún:
     `.about`, `.about-hero`, `.about-title`, `.about-mission`, `.highlight-row`,
     `.highlight`, `.about-divider`, `.about-contact`, `.contact-grid`,
     `.contact-intro`, `.contact-title`, `.contact-sub`, `.contact-tips`,
     `.tip`, `.tip-led`, `.contact-form`, `.terminal-success`, `.term-bar`,
     `.term-body`, `.term-title`, `.dot`, `.line`, `.prompt`, `.caret`, `.shake`
   ✓ Verificable: ningún elemento de `/about` aparece sin estilo.

## Criterios de aceptación

- [ ] `/about` renderiza sin errores de TypeScript ni de compilación
- [ ] La sección hero muestra el título, la misión y los 3 highlight cards (HEART, BROWSER, PLANT)
- [ ] Los elementos con clase `.reveal` aparecen con animación al hacer scroll
- [ ] El divisor animado de píxeles se renderiza entre las dos secciones
- [ ] El formulario muestra shake animation si se intenta enviar con campos vacíos
- [ ] Al enviar con datos válidos, se hace POST a `/api/contact`
- [ ] Si el envío es exitoso, se muestra el terminal "VAULT-OS // TERMINAL" con el nombre del remitente
- [ ] El botón "ENVIAR OTRO MENSAJE" limpia el formulario y vuelve al estado inicial
- [ ] Si el envío falla, se muestra un mensaje de error inline bajo el botón
- [ ] La API Route valida los tres campos y devuelve 400 si alguno está vacío
- [ ] La API Route envía el correo a `CONTACT_EMAIL` usando `onboarding@resend.dev` como remitente
- [ ] El diseño es fiel a la referencia (`references/home-about/about.jsx` + `styles.css`)
- [ ] El link "Acerca de" de la Nav activa el estado activo cuando la ruta es `/about`

## Decisiones tomadas y descartadas

| Decisión | Elegida | Descartada | Motivo |
|----------|---------|------------|--------|
| Destino del correo | `CONTACT_EMAIL` en `.env.local` (valor fijo) | Variable configurable por UI | Simplicidad; no hay panel de administración |
| Remitente (from) | `onboarding@resend.dev` (sandbox Resend) | Dominio propio verificado | No hay dominio verificado disponible aún; funciona en desarrollo |
| Estado de error | Mensaje inline bajo el botón de envío | No manejar errores | UX mínima necesaria para no dejar al usuario sin feedback |
| Ruta | `/about` | `/acerca-de` | Convención estándar de Next.js en inglés |
| Almacenamiento de mensajes | Ninguno — solo envío por correo | Base de datos | Fuera de alcance; no hay capa de datos aún en el proyecto |
| Rate limiting | No implementado | Middleware de rate limit | Fuera de alcance para este spec; el volumen esperado es bajo |
| Validación en cliente | Shake + bloqueo de submit si campos vacíos | Validación HTML5 nativa | Consistente con el comportamiento de la referencia |
