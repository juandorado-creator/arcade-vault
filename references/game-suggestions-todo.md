# Sugerencias de juegos — To-Do

Memoria persistente del agente `game-planner`. Cada entrada representa un
juego sugerido para implementar en Arcade Vault. Estado `[ ]` = pendiente de
implementar (aún no tiene spec/código); `[x]` = ya implementado (ver también
`references/implemented-games.md`).

<!--
Formato de cada entrada:

- [ ] **NOMBRE** — CATEGORÍA · color · _AAAA-MM-DD_
  - Mecánica: <cómo se juega, en una frase>
  - Por qué encaja: <justificación citando el/los criterios aplicados>
-->

- [ ] **COMBATE DE TANQUES** — VERSUS · yellow · _2026-07-02_
  - Mecánica: dos tanques en una arena con obstáculos se enfrentan en local (2 jugadores o vs CPU), maniobrando y disparando proyectiles que rebotan en las paredes hasta impactar al rival.
  - Por qué encaja: VERSUS es hoy la única categoría sin ningún juego jugable (`duelo-pixel` está en el catálogo pero sin `href`), así que cubre el hueco de categoría más urgente; es un clásico retro reconocible (Combat/Tank de Atari) con estética neón afín a la plataforma; es viable como client component autocontenido con canvas (input de dos jugadores, colisiones simples de proyectil-pared y proyectil-tanque); y aporta una mecánica distinta a las ya cubiertas (no es paleta+bola como arkanoid/duelo-pixel, ni snake como serpiente, ni encaje de piezas como tetris, ni disparo contra oleadas como asteroides/invasores, sino puntería y control de un vehículo en combate directo jugador contra jugador).

- [ ] **ESCALADOR** — ARCADE · yellow · _2026-07-02_
  - Mecánica: sube por plataformas y escaleras esquivando barriles rodantes que caen desde arriba, hasta alcanzar la cima del nivel.
  - Por qué encaja: clásico retro icónico (Donkey Kong) con estética neón de plataformas verticales; viable como client component con canvas manejando gravedad simple, colisiones plataforma/escalera y barriles con physics básica; mecánica de plataformeo y esquiva vertical no cubierta por ningún juego existente ni sugerido.

- [ ] **EXCAVADOR** — ARCADE · cyan · _2026-07-02_
  - Mecánica: cava túneles a través de la tierra en una grilla, infla a los enemigos con una bomba de aire hasta que explotan y esquiva o aplasta con rocas que caen al remover el terreno de debajo.
  - Por qué encaja: clásico retro reconocible (Dig Dug) con paleta neón fácilmente adaptable; viable como canvas 2D con grilla destructible y estado simple de "inflado" por enemigo; aporta una mecánica de excavación/destrucción de terreno totalmente distinta al resto del catálogo.

- [ ] **SALTARÍN CÓSMICO** — ARCADE · magenta · _2026-07-02_
  - Mecánica: salta en diagonal sobre una pirámide de casillas para cambiar su color hasta cubrirlas todas, esquivando enemigos que también saltan y evitando caer por los bordes.
  - Por qué encaja: clásico retro icónico (Q*bert) con estética de grilla neón muy afín a la plataforma; viable como canvas con proyección isométrica simple y lógica de salto discreto casilla a casilla; mecánica de "pintar/cambiar estado de casillas saltando" distinta a todo lo existente.

- [ ] **BOMBARDERO** — ARCADE · green · _2026-07-02_
  - Mecánica: coloca bombas en un laberinto de bloques destructibles para abrir camino, recolectar power-ups y atrapar/eliminar enemigos, cuidando no quedar atrapado en tu propia explosión.
  - Por qué encaja: clásico retro muy reconocible (Bomberman) con estética neón de laberinto de bloques; viable como client component con grilla estática, temporizador de explosión y propagación en cruz; mecánica de colocación de trampas con temporizador y destrucción de terreno única frente al resto del catálogo.

- [ ] **BUSCAMINAS** — PUZZLE · green · _2026-07-02_
  - Mecánica: grilla de celdas ocultas donde el jugador revela casillas evitando minas; los números indican cuántas minas rodean cada celda, y se pueden marcar con bandera las sospechosas hasta despejar todo el tablero.
  - Por qué encaja: clásico retro icónico de deducción lógica muy asociado a la era de los PCs de los 90, encaja con la estética neón si se recolorea el tablero; viable como client component con canvas/grid y un generador aleatorio de minas + flood-fill; mecánica de deducción por números no solapada con nada existente.

- [ ] **CAJAS DE NEÓN** — PUZZLE · magenta · _2026-07-02_
  - Mecánica: el jugador mueve un personaje por una grilla empujando cajas de un solo paso hasta colocarlas todas sobre las marcas objetivo, sin poder tirar de ellas ni empujarlas contra una pared o esquina sin salida.
  - Por qué encaja: es el clásico atemporal Sokoban, con estética de neón fácil de aplicar a cajas y marcas brillantes; técnicamente viable como client component con grid 2D, colisiones simples de empuje y detección de niveles resueltos; introduce planificación espacial de movimientos reversibles/irreversibles, distinta a todo lo existente.

- [ ] **APAGA LUCES** — PUZZLE · yellow · _2026-07-02_
  - Mecánica: grilla de celdas iluminadas donde al pulsar una casilla se invierte su estado y el de sus vecinas ortogonales; el objetivo es apagar todas las luces del tablero en el menor número de pulsaciones.
  - Por qué encaja: es el clásico retro "Lights Out", visualmente perfecto para la estética neón de la plataforma; viable como client component simple con una matriz de estados booleanos y un handler de click que invierte vecinos; mecánica de puzzle de toggle/paridad completamente distinta a lo existente.

- [ ] **GEMAS COMBO** — PUZZLE · cyan · _2026-07-02_
  - Mecánica: grilla de gemas de colores donde el jugador intercambia dos gemas adyacentes para alinear 3 o más del mismo color; las coincidencias desaparecen, las gemas superiores caen para rellenar los huecos y se generan nuevas gemas aleatorias desde arriba.
  - Por qué encaja: es el clásico de puzzle tipo match-3 (estilo Bejeweled) reinterpretado en neón con gemas cromáticas afines a la paleta de la plataforma; viable como client component con grid, detección de coincidencias y animación simple de caída/relleno; mecánica de intercambio-y-combinación claramente distinta al resto del catálogo.

- [ ] **ESCUADRÓN CARMESÍ** — SHOOTER · magenta · _2026-07-02_
  - Mecánica: nave con scroll vertical continuo hacia arriba; formaciones enemigas descienden en patrones que se separan para bombardear en picado mientras el jugador esquiva y dispara verticalmente, con jefe final cada oleada.
  - Por qué encaja: es un clásico retro icónico (Galaga/1942) con estética neón afín a la plataforma; viable como client component con canvas (scroll de fondo, spawns con patrones de movimiento, colisiones proyectil-enemigo); mecánica distinta a invasores (scroll vertical continuo con dive-bombing, no grilla horizontal fija) y a asteroides/rocas (sin gravedad cero).

- [ ] **GALERÍA DE TIRO** — SHOOTER · yellow · _2026-07-02_
  - Mecánica: shooter on-rails con mira de cursor (tipo pistola de luz / Duck Hunt): objetivos y siluetas hostiles aparecen en escenarios fijos que se suceden automáticamente, el jugador apunta y hace clic/tap para disparar antes de que el tiempo se agote, con penalización por civiles o señuelos.
  - Por qué encaja: recupera un clásico arcade muy reconocible que aporta variedad de input (apuntar con cursor/tap en vez de mover una nave); viable como client component con canvas dibujando sprites estáticos por escena y detección de clics sobre hitboxes; sin movimiento del jugador ni proyectiles que viajan, distinto a todo lo demás.

- [ ] **VANGUARDIA ESTELAR** — SHOOTER · cyan · _2026-07-02_
  - Mecánica: scroll lateral tipo Defender; la nave vuela libremente en horizontal y vertical sobre un terreno con un minimapa que muestra toda la franja del nivel, debe rescatar/escoltar unidades aliadas en tierra mientras dispara a naves enemigas que intentan capturarlas.
  - Por qué encaja: es un clásico retro influyente (Defender) poco representado frente a los shmups típicos; viable técnicamente con canvas (cámara que sigue a la nave, minimapa simple, IA básica de captura); mecánica distinta por el movimiento libre bidireccional con reversa y el objetivo de rescate, no solo disparo o esquiva.

- [ ] **COMANDO MISIL** — SHOOTER · green · _2026-07-02_
  - Mecánica: el jugador no controla una nave sino una mira de artillería fija en la parte inferior de la pantalla; debe hacer clic/tap para lanzar contra-misiles que detonan en el punto marcado y generan una onda expansiva que intercepta misiles balísticos enemigos antes de que destruyan las ciudades defendidas, con munición y ciudades limitadas.
  - Por qué encaja: recrea el clásico Missile Command, un arcade emblemático de la era dorada con estética de neón sobre fondo oscuro muy acorde a la plataforma; viable como client component con canvas (trayectorias parabólicas, colisión por radio de explosión, contador de ciudades); mecánica totalmente distinta a las demás (posicionamiento de un punto de impacto y gestión de recursos limitados, no nave que dispara en línea recta).

- [ ] **HOCKEY DE AIRE** — VERSUS · cyan · _2026-07-02_
  - Mecánica: dos jugadores controlan mazos que se mueven libremente en su mitad de una mesa y golpean un disco de neón para marcar goles en la portería rival, en local a 2 jugadores o vs CPU.
  - Por qué encaja: cubre el hueco de categoría VERSUS; es un clásico retro de recreativa muy reconocible con estética neón; viable como client component con canvas (física simple de colisión disco-mazo-paredes y detección de gol); mecánica distinta de duelo-pixel/combate de tanques porque el mazo se mueve libremente en 2D y el objetivo es anotar goles, no eliminar al rival.

- [ ] **CICLOS DE LUZ** — VERSUS · magenta · _2026-07-02_
  - Mecánica: dos motos de luz dejan una estela sólida permanente mientras se mueven por una arena; el primero en chocar contra cualquier estela (propia, ajena o el borde) pierde, en local a 2 jugadores o vs CPU.
  - Por qué encaja: refuerza el hueco de VERSUS con otro clásico retro icónico (Tron); técnicamente viable con canvas y una grilla de colisión de estelas; aunque comparte el concepto de "trail" con serpentina/serpiente, es un duelo de control de territorio cabeza a cabeza en tiempo real, distinto de crecer comiendo fruta.

- [ ] **DUELO DE REFLEJOS** — VERSUS · yellow · _2026-07-02_
  - Mecánica: dos jugadores esperan inmóviles una señal visual aleatoria ("¡FUEGO!") y deben pulsar su botón lo más rápido posible tras la señal; pulsar antes de tiempo descalifica la ronda, y gana quien acumule más rondas de una serie corta (mejor de 5).
  - Por qué encaja: aporta un juego jugable más a VERSUS con una mecánica de pura velocidad de reacción que ningún otro juego del catálogo cubre; formato clásico de recreativa/duelo del oeste fácil de reconocer y muy viable técnicamente (temporizador aleatorio, detección de input y comparación de tiempos, sin física compleja).

- [ ] **FORCEJEO DE BLOQUES** — VERSUS · green · _2026-07-02_
  - Mecánica: dos jugadores pulsan repetidamente su tecla de acción para empujar un bloque central hacia el lado del rival a lo largo de una barra horizontal; gana quien logre empujar el bloque hasta el extremo contrario antes de que se acabe el tiempo.
  - Por qué encaja: suma otra opción jugable a VERSUS con una mecánica de "tira y afloja" (button-mashing) que no existe en ningún otro juego del catálogo ni en las sugerencias pendientes; formato clásico y reconocible de las recreativas de forcejeo; trivial de implementar como client component autocontenido (barra 1D, contador de pulsaciones por jugador y temporizador).

- [ ] **TERRITORIO QIX** — PUZZLE · magenta · _2026-07-02_
  - Mecánica: un cursor traza líneas desde el borde de un campo vacío hacia el interior; al cerrar un trazo se rellena esa región como territorio conquistado, mientras una entidad hostil recorre el área libre e intenta cortar la línea antes de que se complete.
  - Por qué encaja: es un clásico retro icónico (Qix, 1981) muy poco cubierto frente a los shooters/plataformas habituales; su mecánica de trazar y cerrar territorio bajo amenaza es completamente distinta de todo lo ya implementado o sugerido; viable como client component con canvas dibujando polígonos y detectando colisión línea-entidad.

- [ ] **ASCENSO VERTICAL** — ARCADE · yellow · _2026-07-02_
  - Mecánica: el jugador trepa un rascacielos de neón piso a piso, esquivando objetos que caen desde ventanas y plataformas que se abren, mientras la cámara avanza hacia arriba con un límite de tiempo por planta.
  - Por qué encaja: rescata un clásico raro (Crazy Climber, 1980) casi nunca cubierto en catálogos indie, distinto de Ranaria porque el desplazamiento es vertical continuo con obstáculos que caen desde arriba en vez de cruce de carriles horizontales; viable con canvas y scroll vertical simple, spawns de obstáculos y colisión AABB.

- [ ] **SECUENCIA NEÓN** — PUZZLE · cyan · _2026-07-02_
  - Mecánica: cuatro cuadrantes de color se iluminan y suenan en una secuencia que crece cada ronda; el jugador debe repetir el patrón completo tocando los cuadrantes en el mismo orden antes de que se acabe el tiempo, sumando una ronda más cada acierto.
  - Por qué encaja: recupera un clásico atípico dentro del arcade (Simon, 1978) centrado en memoria y ritmo en vez de reflejos de puntería o esquive, algo que ningún juego del catálogo ni de las sugerencias pendientes cubre todavía; trivialmente viable como client component sin canvas complejo (solo estado de secuencia, input y temporizador), aportando la mecánica de "memoria de patrones" que falta por completo en la plataforma.
