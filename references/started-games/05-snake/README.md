# Snake

Juego de Snake en HTML, CSS y JavaScript puro — sin dependencias, cero frameworks.

## Jugar

Abre `index.html` directamente en el navegador. No requiere servidor ni build.

## Controles

| Acción               | Tecla / Input       |
| -------------------- | ------------------- |
| Mover                | Flechas o WASD      |
| Pausar / reanudar    | P o Escape          |
| Reiniciar tras morir | Botón en el overlay |

## Características

- Canvas 600×600 px, grid de 30×30 celdas (20 px por celda)
- Comida representada con sprites de fruta reales (`assets/fruits.png`, 22 variantes aleatorias)
- La serpiente crece un segmento por cada fruta comida
- Score: 10 puntos × nivel actual por fruta
- Nivel sube cada 5 frutas comidas; la velocidad aumenta con el nivel
- Game over al chocar contra el borde del tablero o contra el propio cuerpo
- HUD con score y nivel actual (elementos DOM, fuera del canvas)
- Overlay de pausa dibujado sobre el canvas
- Overlay de Game Over con score final y botón "Jugar de nuevo"

## Estructura del proyecto

```
index.html          # punto de entrada; HUD en DOM + canvas + overlay
game.js             # lógica del juego (estado, loop, colisiones, render)
assets/
  fruits.png         # spritesheet de frutas (fondo transparente)
  sprites.js          # SPRITE_ATLAS + loadFruitSheet/drawFruit
```
