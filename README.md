# misspepi

Web de Miss Pepi — portfolio de fotografía y diseño gráfico. Es una SPA estática (vanilla
JS, ES modules, sin build ni frameworks) desplegada en GitHub Pages: un menú de cortina
lleva a las galerías (`photo`, `graphic`, `video`), a `contact` y a `about`, todo montado
sobre la misma `index.html`.

## Welcome

Pantalla de entrada: espiral hipnótica en SVG generada por código que gira sobre su centro
fijo, con el logo manuscrito, el enlace **entrar** (que acelera la espiral al pasar el
ratón) y las piernas en primer plano. Mobile-first. Pasados unos segundos el menú se abre
solo (ver `MENU.autoOpenSeconds` en `js/config.js`).

### Editar la espiral y el resto de ajustes

Toca **solo** `js/config.js`. Ahí están todas las variables (color, fondo, vueltas, brazos,
hueco central, grosor, velocidad, sentido de giro, cuánto acelera al hover, timings del
menú…). En pantalla también hay un panel de ajustes en vivo: se abre y cierra con la
**barra espaciadora**, útil para tantear valores antes de dejarlos fijos en `config.js`.

## Contenido

Las imágenes del portfolio **no se editan a mano en el HTML/JS**: se generan a partir de
las carpetas de contenido mediante un script.

- Carpetas de contenido (en la raíz del proyecto): `PHOTOGRAPHY/` → categoría `photo`,
  `GRAPHIC DESIGN/` → categoría `graphic`, `VIDEO/` → categoría `video` (aún no existe;
  mientras tanto esa categoría sale vacía sin romper nada).
- Cada subcarpeta dentro de esas carpetas es un **proyecto**. Sus imágenes (webp, jpg,
  jpeg, png o gif) forman la galería; se ordenan de forma natural (2 antes que 10) y no se
  renombran. Las subcarpetas sin imágenes se omiten.
- Un `caption.txt` opcional dentro de la carpeta del proyecto (nombre case-insensitive)
  aporta el pie de foto; si no existe, el caption queda vacío.
- Todo esto se vuelca en **`data.json`** (raíz del proyecto), que es lo que consume la web
  en tiempo de ejecución (`js/data.js`). Las claves `about` y `contact` de ese mismo
  `data.json` son **contenido manual**: se editan directamente ahí (textos de la página
  about, email e instagram de contacto) y el script las respeta, no las pisa.
- Tras añadir, quitar o renombrar contenido dentro de esas carpetas, hay que regenerar el
  fichero y commitearlo:

  ```
  node tools/build-data.mjs
  ```

  (requiere Node ≥18, no tiene dependencias). El script avisa por consola de qué
  subcarpetas ha omitido por no tener imágenes.

## Estructura

- `index.html` — punto de entrada único de la SPA
- `css/` — estilos (mobile-first)
- `js/config.js` — **config editable** (espiral, piernas, menú)
- `js/spiral.js` — generador de la espiral (matemáticas)
- `js/welcome.js` — arranque y animación de la pantalla de entrada
- `js/data.js` — carga `data.json`
- `js/gallery.js`, `js/pages.js` — vistas de galería, contact y about
- `tools/build-data.mjs` — genera `data.json` a partir de las carpetas de contenido
- `data.json` — datos consumidos por la web (generado; ver sección Contenido)
- `pruebas.html` — laboratorio para afinar la espiral con sliders
- `ASSETS/` — logo y recursos (incluye `piernas/` con la animación)
- `GRAPHIC DESIGN/`, `PHOTOGRAPHY/` — trabajos del portfolio (contenido fuente)

## Desarrollo local

Cualquier servidor estático sirve. Por ejemplo: `python3 -m http.server` y abrir `index.html`.
