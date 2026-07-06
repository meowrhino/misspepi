// ════════════════════════════════════════════════════════════════
//  PANEL DE AJUSTES (solo para uso en local/desarrollo)
//  Pulsa la BARRA ESPACIADORA para abrir/cerrar.
//  Mueve los controles para previsualizar en caliente, y usa
//  "copiar config.js" para pegar los valores finales en el archivo.
//  MODULAR: para quitarlo, borra su <script> de index.html y este archivo.
// ════════════════════════════════════════════════════════════════
import { SPIRAL, LEGS } from "./config.js";
import { rebuildWelcome } from "./welcome.js";

(function () {
  // campo -> { obj, key, min, max, step, label, kind }
  // Los valores por breakpoint apuntan a su bloque (desktop/mobile): lo que
  // toques aquí es EXACTAMENTE lo que quedará en config.js al copiar.
  const FIELDS = [
    { obj: SPIRAL.desktop, key: "centerX", label: "espiral · centro X · ESCRITORIO (dvw)", kind: "range", min: 0, max: 100, step: 1 },
    { obj: SPIRAL.desktop, key: "centerY", label: "espiral · centro Y · ESCRITORIO (dvh)", kind: "range", min: 0, max: 100, step: 1 },
    { obj: SPIRAL.mobile,  key: "centerX", label: "espiral · centro X · MÓVIL (dvw)",      kind: "range", min: 0, max: 100, step: 1 },
    { obj: SPIRAL.mobile,  key: "centerY", label: "espiral · centro Y · MÓVIL (dvh)",      kind: "range", min: 0, max: 100, step: 1 },
    { obj: SPIRAL, key: "turns",       label: "vueltas por brazo",        kind: "range", min: 2, max: 14, step: 1 },
    { obj: SPIRAL, key: "arms",        label: "nº de brazos",             kind: "range", min: 1, max: 6,  step: 1 },
    { obj: SPIRAL, key: "hole",        label: "hueco central",            kind: "range", min: 0, max: 120, step: 1 },
    { obj: SPIRAL, key: "thickness",   label: "grosor de banda",          kind: "range", min: 0.2, max: 0.9, step: 0.01 },
    { obj: SPIRAL, key: "taper",       label: "largo de la punta",        kind: "range", min: 0, max: 1, step: 0.01 },
    { obj: SPIRAL, key: "spinSeconds", label: "velocidad (seg/vuelta)",   kind: "range", min: 4, max: 90, step: 1 },
    { obj: SPIRAL, key: "reverse",     label: "girar al revés",           kind: "bool" },
    { obj: SPIRAL, key: "color",       label: "color espiral",            kind: "color" },
    { obj: SPIRAL, key: "background",  label: "color fondo",              kind: "color" },
    { obj: LEGS.desktop, key: "size",    label: "piernas ESCRITORIO · alto (dvh)",     kind: "range", min: 40, max: 220, step: 1 },
    { obj: LEGS.desktop, key: "bottom",  label: "piernas ESCRITORIO · sep. fondo (dvh)", kind: "range", min: 0, max: 60, step: 1 },
    { obj: LEGS.desktop, key: "anchorX", label: "piernas ESCRITORIO · anclaje X (dvw)", kind: "range", min: 0, max: 100, step: 1 },
    { obj: LEGS.mobile,  key: "size",         label: "piernas MÓVIL · alto (dvh)",       kind: "range", min: 5, max: 60, step: 1 },
    { obj: LEGS.mobile,  key: "sweepSeconds", label: "piernas MÓVIL · vaivén (seg)",     kind: "range", min: 2, max: 30, step: 1 },
    { obj: LEGS.mobile,  key: "sweepMin",     label: "piernas MÓVIL · vaivén desde (dvw)", kind: "range", min: 0, max: 100, step: 1 },
    { obj: LEGS.mobile,  key: "sweepMax",     label: "piernas MÓVIL · vaivén hasta (dvw)", kind: "range", min: 0, max: 100, step: 1 },
  ];

  // Layout en columna (etiqueta encima, control debajo a todo lo ancho).
  // Un solo layout que cabe en cualquier ancho — menos código y cero
  // roturas al probar el responsive.
  function fieldRow(f, onChange) {
    const row = document.createElement("div");
    row.style.cssText = "padding:7px 0;font-size:12px;";

    const labelRow = document.createElement("div");
    labelRow.style.cssText = "display:flex;justify-content:space-between;gap:8px;color:#ccc;margin-bottom:4px;";
    const label = document.createElement("span");
    label.textContent = f.label;
    labelRow.appendChild(label);
    let out;
    if (f.kind === "range") {
      out = document.createElement("output");
      out.textContent = f.obj[f.key];
      out.style.cssText = "color:#1f5cff;font-variant-numeric:tabular-nums;flex:0 0 auto;";
      labelRow.appendChild(out);
    }
    row.appendChild(labelRow);

    let input;
    if (f.kind === "bool") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.checked = !!f.obj[f.key];
      input.addEventListener("change", () => { f.obj[f.key] = input.checked; onChange(); });
    } else if (f.kind === "color") {
      input = document.createElement("input");
      input.type = "color";
      input.value = f.obj[f.key];
      input.style.cssText = "width:100%;height:26px;border:none;background:none;cursor:pointer;";
      input.addEventListener("input", () => { f.obj[f.key] = input.value; onChange(); });
    } else {
      input = document.createElement("input");
      input.type = "range";
      input.min = f.min; input.max = f.max; input.step = f.step;
      input.value = f.obj[f.key];
      input.style.cssText = "width:100%;accent-color:#1f5cff;";
      input.addEventListener("input", () => {
        f.obj[f.key] = parseFloat(input.value);
        out.textContent = f.obj[f.key];
        onChange();
      });
    }
    row.appendChild(input);
    return row;
  }

  function buildCopyText() {
    const s = SPIRAL, l = LEGS;
    return `const SPIRAL = {\n`
      + `  color:       "${s.color}",\n`
      + `  background:  "${s.background}",\n\n`
      + `  turns:       ${s.turns},\n`
      + `  arms:        ${s.arms},\n`
      + `  hole:        ${s.hole},\n`
      + `  thickness:   ${s.thickness},\n`
      + `  taper:       ${s.taper},\n\n`
      + `  spinSeconds: ${s.spinSeconds},\n`
      + `  reverse:     ${s.reverse},\n\n`
      + `  desktop: { centerX: ${s.desktop.centerX}, centerY: ${s.desktop.centerY} },\n`
      + `  mobile:  { centerX: ${s.mobile.centerX}, centerY: ${s.mobile.centerY} },\n`
      + `};\n\n`
      + `const LEGS = {\n`
      + `  desktop: {\n`
      + `    size:    ${l.desktop.size},\n`
      + `    bottom:  ${l.desktop.bottom},\n`
      + `    anchorX: ${l.desktop.anchorX},\n`
      + `  },\n`
      + `  mobile: {\n`
      + `    size:         ${l.mobile.size},\n`
      + `    sweepSeconds: ${l.mobile.sweepSeconds},\n`
      + `    sweepMin:     ${l.mobile.sweepMin},\n`
      + `    sweepMax:     ${l.mobile.sweepMax},\n`
      + `  },\n`
      + `};`;
  }

  function build() {
    const panel = document.createElement("div");
    panel.id = "devpanel";
    panel.style.cssText =
      "position:fixed;top:0;right:0;bottom:0;width:min(360px,86vw);z-index:9999;" +
      "background:rgba(15,15,18,.94);color:#eee;font-family:ui-monospace,monospace;" +
      "padding:16px;overflow-y:auto;transform:translateX(100%);transition:transform .25s ease;" +
      "box-shadow:-8px 0 24px rgba(0,0,0,.35);";

    const title = document.createElement("div");
    title.textContent = "ajustes (local) · [espacio] abre/cierra";
    title.style.cssText = "font-size:13px;color:#e8b04a;margin-bottom:6px;";
    panel.appendChild(title);

    // Tamaño de pantalla actual + qué breakpoint es (mismo corte de 768px
    // que usa config.js/CSS). Así, si haces una captura mientras pruebas
    // el responsive, queda claro EN QUÉ tamaño se vio ese ajuste.
    const viewport = document.createElement("div");
    viewport.style.cssText = "font-size:11px;color:#8ab4ff;margin-bottom:10px;";
    panel.appendChild(viewport);
    function breakpointName(w) { return w < 768 ? "móvil" : w < 1024 ? "tablet" : "escritorio"; }
    function updateViewport() {
      viewport.textContent = window.innerWidth + " × " + window.innerHeight + " px · " + breakpointName(window.innerWidth);
    }
    updateViewport();
    window.addEventListener("resize", updateViewport);

    // Bloque de datos SIEMPRE visible con los valores actuales, en texto.
    // Pensado para salir en una captura de pantalla: cuando la clienta deje
    // la espiral como le guste y haga captura, la imagen ya lleva los
    // números exactos para reproducirlo.
    const readout = document.createElement("pre");
    readout.style.cssText =
      "font-size:10.5px;line-height:1.5;background:#000;color:#8f8;padding:10px;" +
      "border-radius:6px;white-space:pre-wrap;user-select:all;margin-bottom:12px;";
    panel.appendChild(readout);
    function updateReadout() { readout.textContent = buildCopyText(); }

    function onChange() { rebuildWelcome(); updateReadout(); }
    FIELDS.forEach(f => panel.appendChild(fieldRow(f, onChange)));
    updateReadout();

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "copiar config.js";
    copyBtn.style.cssText =
      "margin-top:14px;width:100%;padding:9px;background:#1f5cff;color:#fff;border:none;" +
      "border-radius:6px;font-size:12px;cursor:pointer;font-family:inherit;";
    copyBtn.addEventListener("click", async () => {
      const text = buildCopyText();
      try { await navigator.clipboard.writeText(text); copyBtn.textContent = "¡copiado!"; }
      catch { copyBtn.textContent = "no se pudo copiar (mira la consola)"; console.log(text); }
      setTimeout(() => (copyBtn.textContent = "copiar config.js"), 1600);
    });
    panel.appendChild(copyBtn);

    const hint = document.createElement("div");
    hint.textContent = "pulsa [espacio] para cerrar";
    hint.style.cssText = "margin-top:10px;font-size:11px;color:#777;";
    panel.appendChild(hint);

    document.body.appendChild(panel);
    return panel;
  }

  const panel = build();
  let open = false;
  function setOpen(v) { open = v; panel.style.transform = open ? "translateX(0)" : "translateX(100%)"; }

  // Solo barra espaciadora (ignorando cuando escribes en un input),
  // para que ningún click "normal" de la web lo abra por accidente.
  document.addEventListener("keydown", e => {
    if (e.code !== "Space") return;
    const t = e.target;
    if (t instanceof Element && t.matches("input, textarea, select, [contenteditable]")) return;
    e.preventDefault(); // que no scrollee la página
    setOpen(!open);
  });
})();
