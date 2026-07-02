# misspepi

Web de Miss Pepi — portfolio de fotografía y diseño gráfico.

## Welcome

Pantalla de entrada (`index.html`): espiral hipnótica en SVG generada por código que gira
sobre su centro fijo, con el logo manuscrito, el enlace **entrar** (que acelera la espiral
al pasar el ratón) y las piernas en primer plano. Mobile-first.

### Editar la espiral

Toca **solo** `js/config.js`. Ahí están todas las variables (color, fondo, vueltas, brazos,
hueco central, grosor, velocidad, sentido de giro y cuánto acelera al hover).

## Estructura

- `index.html` — welcome
- `css/welcome.css` — estilos (mobile-first)
- `js/config.js` — **config de la espiral (edita aquí)**
- `js/spiral.js` — generador de la espiral (matemáticas)
- `js/welcome.js` — arranque y animación
- `pruebas.html` — laboratorio para afinar la espiral con sliders
- `ASSETS/` — logo y recursos (incluye `piernas/` con la animación)
- `GRAPHIC DESIGN/`, `PHOTOGRAPHY/` — trabajos del portfolio

## Desarrollo local

Cualquier servidor estático sirve. Por ejemplo: `python3 -m http.server` y abrir `index.html`.
