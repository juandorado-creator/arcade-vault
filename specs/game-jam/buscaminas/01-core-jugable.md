---
id: buscaminas-01-core-jugable
title: Buscaminas — Núcleo jugable
state: borrador
date: 2026-07-02
depends_on: [06-data-infrastructure]
objective: Construir la página /juegos/buscaminas con un tablero de buscaminas clásico (grilla 16×16, revelar/marcar celdas, primer clic seguro) que sube de dificultad por niveles y termina la partida al detonar una mina.
---

## Alcance

### Dentro

- Página `app/juegos/buscaminas/page.tsx` (`'use client'`) con la shell arcade: refs
  puente (`canvasRef`, `pausedRef`, `forceEndRef`, `restartRef`), estado React
  (`score`, `level`, `minesLeft`, `elapsedSeconds`, `paused`, `over`, `finalScore`,
  `nickname`, `saved`, `publishing`, `publishError`) — **sin `lives`**, ya que
  Buscaminas termina la partida al primer error (no hay vidas que restar).
- Lógica del juego (generación del tablero, flood-fill, detección de fin de partida)
  dentro de un `useEffect`, manejando su propio estado local (`let board`, `let
revealed`, `let flagged`, `let level`, `let score`, `let mineCount`, `let firstClick`,
  `let timerId`) sin librerías externas.
- `<canvas ref={canvasRef} width={480} height={480}>` — grilla fija de **16 columnas ×
  16 filas**, celda de 30px. El tamaño del tablero **no cambia entre niveles**; lo que
  aumenta es la cantidad de minas.
- Generación del tablero: nivel 1 empieza con 30 minas repartidas al azar sobre las 256
  celdas. Cada vez que el jugador despeja un tablero completo, sube de nivel y el número
  de minas aumenta en 10 (`mineCount = min(30 + 10 * (level - 1), 180)`), respetando el
  tope de 180 para dejar siempre celdas seguras jugables.
- **Regla de primer clic seguro**: las minas se colocan recién en el primer clic/tecla
  de revelado de cada nivel, excluyendo la celda elegida y sus 8 vecinas inmediatas —
  así el primer movimiento nunca detona una mina ni deja un "1" aislado sin espacio.
- **Flood-fill**: revelar una celda con 0 minas adyacentes revela automáticamente (de
  forma recursiva/iterativa) todas sus celdas vecinas hasta llegar a celdas con número
  ≥ 1, igual que el buscaminas clásico.
- Controles duales, ambos habilitados simultáneamente:
  - **Mouse**: clic izquierdo sobre una celda revela su contenido (ignorado si la celda
    está marcada con bandera); clic derecho (`contextmenu` prevenido con
    `preventDefault()`) alterna la bandera de esa celda.
  - **Teclado**: `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight` mueven un cursor
    resaltado (borde amarillo) sobre la grilla; `Space` o `Enter` revela la celda bajo
    el cursor; `F` alterna la bandera de la celda bajo el cursor; `P`/`Escape` alternan
    pausa (sincronizado con `pausedRef`).
- Al revelar una celda segura: `+10 * level` puntos por celda (cada celda destapada por
  flood-fill cuenta individualmente). Al despejar el tablero completo (todas las celdas
  sin mina reveladas): bono único de `max(0, 3000 - elapsedSeconds * 5)` puntos, sube de
  nivel, resetea `elapsedSeconds` a 0 y regenera el tablero (mismo tamaño, más minas).
- Al revelar una celda con mina: fin de partida inmediato. Se revelan todas las minas
  del tablero (sin banderas incorrectas penalizadas), se detiene el cronómetro, y
  `finalScore` queda fijado en el `score` acumulado hasta ese momento.
- HUD (`.player-hud`) con: `score`, `level`, `minesLeft` (`mineCount - banderasColocadas`,
  puede ser negativo si el jugador marca de más), y `elapsedSeconds` formateado `mm:ss`.
- Cronómetro: un `setInterval` de 1000ms incrementa `elapsedSeconds` mientras
  `!paused && !over`; se limpia en cleanup y al pausar.
- Aviso `md:hidden`: "Este juego requiere mouse y teclado (no disponible en móvil)" —
  redacción adaptada porque Buscaminas necesita clic derecho además de teclado.
- Overlay de pausa (mismo patrón visual que Asteroides/Tetris/Serpiente) que oculta el
  tablero y detiene clics/teclas mientras `paused === true`.
- Modal de Game Over con input de apodo (`maxLength={20}`, `uppercase` vía CSS o
  `.toUpperCase()` al guardar), botón "Publicar score" (deshabilitado si el apodo está
  vacío) y botón "Jugar de nuevo" que invoca `restartRef.current()`.
- Cleanup del `useEffect`: `clearInterval` del cronómetro, remoción de los listeners de
  `window` (`keydown`) y del canvas (`click`, `contextmenu`).

### Fuera

- Modo "flag obligatorio para ganar" (marcar todas las minas) — el buscaminas clásico
  solo exige revelar todas las celdas seguras; las banderas son una ayuda visual
  opcional para el jugador, no una condición de victoria.
- Dificultad seleccionable manualmente por el jugador (fácil/intermedio/experto) — la
  dificultad sube automáticamente por nivel, no hay selector de tablero.
- Controles touch / long-press para marcar bandera en móvil.
- Deshacer un clic o un "safe click" que revele una celda al azar como ayuda.
- Animaciones de explosión elaboradas (partículas, shake de cámara) — se dibuja la mina
  detonada con un color distinto (rojo) y el resto de minas con el ícono estándar.
- Sonido.
- Persistencia de la partida en curso entre recargas de página.
- Vidas o "reintentos" tras detonar una mina — un solo error termina la partida.

## Plan de implementación

1. Verificar que `app/juegos/layout.tsx` ya inyecta `<Nav />` para todas las rutas
   `/juegos/*` — ya existe, sin cambio.
   ✓ Verificable: `/juegos/buscaminas` mostrará la Nav sin tocar ese archivo.

2. Crear `app/juegos/buscaminas/page.tsx` con la shell arcade: `.player-hud` con
   `score`, `level`, `minesLeft`, `elapsedSeconds` (`mm:ss`) + botones pausa/fin/salir;
   `<canvas ref={canvasRef} width={480} height={480}>`; aviso `md:hidden`; overlay de
   pausa; modal de Game Over con input de apodo.
   ✓ Verificable: `/juegos/buscaminas` compila y muestra el layout con el canvas y el
   HUD, aunque el tablero todavía esté vacío.

3. Implementar la generación del tablero dentro del `useEffect`: estructura de datos
   `board: { isMine: boolean; adjacent: number; revealed: boolean; flagged: boolean }[][]`
   de 16×16, función `placeMines(excludeR, excludeC, count)` que coloca minas evitando la
   celda excluida y sus 8 vecinas, y función `computeAdjacents()` que calcula el número
   de minas vecinas por celda.
   ✓ Verificable: al loguear el tablero generado tras el primer clic, la celda clicada y
   sus vecinas nunca son minas.

4. Implementar `revealCell(r, c)` con flood-fill iterativo (pila/cola explícita, no
   recursión sin límite) que revela la celda y, si `adjacent === 0`, encola sus vecinas
   no reveladas y no marcadas con bandera.
   ✓ Verificable: al hacer clic en una celda con 0 minas adyacentes rodeada de zona
   vacía, se revela un área conexa completa de una sola vez.

5. Implementar el renderizado del canvas: celdas ocultas (gris), celdas reveladas
   (fondo claro con el número coloreado según convención clásica: 1 azul, 2 verde, 3
   rojo, etc.), celdas con bandera (ícono de bandera), cursor de teclado (borde
   amarillo resaltado sobre la celda activa), y minas reveladas al perder (ícono de
   mina, la detonada en rojo).
   ✓ Verificable: el canvas dibuja correctamente los 4 estados de celda (oculta,
   revelada con número, con bandera, mina) en una partida de prueba.

6. Cablear los listeners: `click` y `contextmenu` (con `preventDefault()`) en el
   canvas para mouse; `keydown` nombrado (`onKeyDown`) en `window` para el cursor de
   teclado, revelado (`Space`/`Enter`), bandera (`F`) y pausa (`P`/`Escape`,
   sincronizado con `pausedRef`). El listener de teclado ignora eventos cuyo `target`
   sea `INPUT`/`TEXTAREA` (para no interferir con el input de apodo del modal).
   ✓ Verificable: clic izquierdo revela, clic derecho marca bandera, flechas mueven el
   cursor amarillo, `Space` revela la celda del cursor, `F` la marca.

7. Implementar la condición de victoria de nivel (todas las celdas sin mina reveladas):
   sumar el bono de tiempo, incrementar `level`, resetear `elapsedSeconds`, regenerar el
   tablero con `mineCount` aumentado, y limpiar banderas/estado de revelado.
   ✓ Verificable: al despejar manualmente un tablero de prueba con pocas minas, el nivel
   sube, el score aumenta con el bono, y aparece un tablero nuevo del mismo tamaño.

8. Implementar la condición de derrota (clic o `Space` sobre una mina): revelar todas
   las minas, detener el `setInterval` del cronómetro, `setOver(true)` y
   `setFinalScore(score)`.
   ✓ Verificable: al detonar una mina de prueba, el modal de Game Over aparece con el
   score acumulado hasta ese momento.

9. Asignar `reset()` a `restartRef.current`: reinicia `level` a 1, `score` a 0,
   `elapsedSeconds` a 0, `mineCount` a 30, genera un tablero nuevo y limpia
   `over`/`finalScore`.
   ✓ Verificable: el botón "Jugar de nuevo" del modal reinicia la partida sin recargar
   la página.

10. Cleanup del `useEffect`: `clearInterval` del cronómetro y remoción de los listeners
    de `window` y del canvas.
    ✓ Verificable: al desmontar la página (navegar fuera de `/juegos/buscaminas`) no
    quedan timers ni listeners activos (verificable inspeccionando que el cronómetro no
    siga corriendo tras salir).

## Criterios de aceptación

- [ ] `/juegos/buscaminas` carga sin errores de compilación ni de consola
- [ ] El canvas 480×480 renderiza una grilla de 16×16 celdas ocultas al entrar a la página
- [ ] El primer clic/tecla de revelado de cada nivel nunca detona una mina ni sus 8 vecinas
- [ ] Revelar una celda con 0 minas adyacentes despeja el área conexa completa (flood-fill)
- [ ] Clic derecho sobre una celda alterna su bandera sin revelarla
- [ ] Las flechas de teclado mueven un cursor visible; `Space`/`Enter` revela la celda del cursor; `F` alterna su bandera
- [ ] `P`/`Escape` alternan la pausa y detienen tanto el cronómetro como los clics/teclas de juego
- [ ] El HUD muestra `score`, `level`, `minesLeft` y el cronómetro en formato `mm:ss` actualizados en tiempo real
- [ ] Al despejar todas las celdas seguras del tablero, sube el nivel, se suma el bono de tiempo y aparece un tablero nuevo con más minas
- [ ] Al revelar una mina, el modal de Game Over aparece con el score final correcto y se revelan todas las minas del tablero
- [ ] El botón "Publicar score" está deshabilitado si el apodo está vacío
- [ ] "Jugar de nuevo" reinicia la partida (nivel 1, 30 minas, score 0, cronómetro en 0) sin recargar la página
- [ ] El cleanup del `useEffect` detiene el `setInterval` y remueve los listeners de `window` y del canvas
- [ ] En pantallas < 768px el canvas se oculta y aparece el aviso de "requiere mouse y teclado"
- [ ] El listener de teclado ignora pulsaciones cuando el foco está en el input de apodo del modal

## Decisiones tomadas y descartadas

| Decisión                           | Elegida                                                                    | Descartada                                                              | Motivo                                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Tamaño del tablero                 | Fijo 16×16, sube solo el número de minas por nivel                         | Tablero creciente (9×9 → 16×16 → 24×24) al estilo dificultades clásicas | Un canvas de tamaño fijo simplifica el render y el layout de la shell arcade; la dificultad sigue subiendo de forma perceptible |
| Progresión de dificultad           | `mineCount = min(30 + 10*(level-1), 180)`                                  | Dificultad fija (solo un nivel, sin progresión)                         | Da sentido al campo `level` del HUD y mantiene el patrón de "sube de nivel" ya usado en Tetris/Serpiente/Arkanoid               |
| Vidas                              | Sin `lives`, un solo error termina la partida                              | 3 vidas con "safe reveal" de cortesía tras el primer error              | Fidelidad al buscaminas clásico: un clic en una mina siempre termina el juego                                                   |
| Controles                          | Mouse (clic izq/der) + teclado (flechas/Space/F) simultáneos               | Solo teclado                                                            | Buscaminas es un juego de precisión posicional; forzar solo teclado degradaría la experiencia sin beneficio real                |
| Regla de primer clic               | Minas se colocan tras el primer clic, excluyendo esa celda y sus 8 vecinas | Minas fijas desde el inicio del nivel (riesgo de perder al primer clic) | Estándar de facto del buscaminas moderno; evita partidas injustas                                                               |
| Bandera como condición de victoria | No es obligatoria; solo revelar todas las celdas seguras gana el nivel     | Exigir marcar todas las minas para avanzar                              | Simplifica la lógica de "victoria" a una sola condición (celdas seguras reveladas) y es la regla clásica más extendida          |
| Bono de tiempo                     | `max(0, 3000 - elapsedSeconds*5)` sumado al despejar el tablero            | Sin bono de tiempo (solo puntos por celda)                              | Incentiva jugar rápido además de con precisión, dándole más profundidad al leaderboard                                          |
| Flood-fill                         | Iterativo con pila/cola explícita                                          | Recursión directa en JS                                                 | Evita overflow de stack en tableros con grandes áreas vacías conectadas                                                         |
| Aviso móvil                        | Texto adaptado ("requiere mouse y teclado")                                | Reutilizar texto genérico "requiere teclado" de otros juegos            | Buscaminas depende también del clic derecho del mouse, no solo del teclado; el aviso debe reflejarlo con precisión              |
