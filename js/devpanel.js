// ════════════════════════════════════════════════════════════════
//  PANEL DE AJUSTES (solo para uso en local/desarrollo)
//  Clica en cualquier parte de la página para abrir/cerrar.
//  Mueve los controles para previsualizar en caliente, y usa
//  "copiar config.js" para pegar los valores finales en el archivo.
// ════════════════════════════════════════════════════════════════
(function () {
  // campo -> { obj, key, min, max, step, label, kind }
  const FIELDS = [
    { obj: SPIRAL, key: "centerX",     label: "espiral · centro X (dvw)", kind: "range", min: 0, max: 100, step: 1 },
    { obj: SPIRAL, key: "centerY",     label: "espiral · centro Y (dvh)", kind: "range", min: 0, max: 100, step: 1 },
    { obj: SPIRAL, key: "turns",       label: "vueltas por brazo",        kind: "range", min: 2, max: 14, step: 1 },
    { obj: SPIRAL, key: "arms",        label: "nº de brazos",             kind: "range", min: 1, max: 6,  step: 1 },
    { obj: SPIRAL, key: "hole",        label: "hueco central",            kind: "range", min: 0, max: 120, step: 1 },
    { obj: SPIRAL, key: "thickness",   label: "grosor de banda",          kind: "range", min: 0.2, max: 0.9, step: 0.01 },
    { obj: SPIRAL, key: "taper",       label: "largo de la punta",        kind: "range", min: 0, max: 1, step: 0.01 },
    { obj: SPIRAL, key: "spinSeconds", label: "velocidad (seg/vuelta)",   kind: "range", min: 4, max: 90, step: 1 },
    { obj: SPIRAL, key: "reverse",     label: "girar al revés",           kind: "bool" },
    { obj: SPIRAL, key: "color",       label: "color espiral",            kind: "color" },
    { obj: SPIRAL, key: "background",  label: "color fondo",              kind: "color" },
    { obj: LEGS,   key: "size",        label: "piernas · alto (dvh)",     kind: "range", min: 40, max: 220, step: 1 },
    { obj: LEGS,   key: "bottom",      label: "piernas · sep. al fondo (dvh)", kind: "range", min: 0, max: 60, step: 1 },
    { obj: LEGS,   key: "anchorX",     label: "piernas · anclaje X (dvw)", kind: "range", min: 0, max: 100, step: 1 },
  ];

  function fieldRow(f) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:8px;padding:5px 0;font-size:12px;";

    const label = document.createElement("label");
    label.textContent = f.label;
    label.style.cssText = "flex:0 0 168px;color:#ccc;";
    row.appendChild(label);

    let input, out;
    if (f.kind === "bool") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.checked = !!f.obj[f.key];
      input.addEventListener("change", () => { f.obj[f.key] = input.checked; rebuildWelcome(); });
    } else if (f.kind === "color") {
      input = document.createElement("input");
      input.type = "color";
      input.value = f.obj[f.key];
      input.style.cssText = "width:40px;height:24px;border:none;background:none;cursor:pointer;";
      input.addEventListener("input", () => { f.obj[f.key] = input.value; rebuildWelcome(); });
    } else {
      input = document.createElement("input");
      input.type = "range";
      input.min = f.min; input.max = f.max; input.step = f.step;
      input.value = f.obj[f.key];
      input.style.cssText = "flex:1;accent-color:#1f5cff;";
      out = document.createElement("output");
      out.textContent = f.obj[f.key];
      out.style.cssText = "flex:0 0 44px;text-align:right;color:#1f5cff;font-variant-numeric:tabular-nums;";
      input.addEventListener("input", () => {
        f.obj[f.key] = parseFloat(input.value);
        out.textContent = f.obj[f.key];
        rebuildWelcome();
      });
    }
    row.appendChild(input);
    if (out) row.appendChild(out);
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
      + `  centerX:     ${s.centerX},\n`
      + `  centerY:     ${s.centerY},\n\n`
      + `  spinSeconds: ${s.spinSeconds},\n`
      + `  reverse:     ${s.reverse},\n`
      + `};\n\n`
      + `const LEGS = {\n`
      + `  size:    ${l.size},\n`
      + `  bottom:  ${l.bottom},\n`
      + `  anchorX: ${l.anchorX},\n`
      + `};`;
  }

  function build() {
    const panel = document.createElement("div");
    panel.id = "devpanel";
    panel.style.cssText =
      "position:fixed;top:0;right:0;bottom:0;width:min(320px,86vw);z-index:9999;" +
      "background:rgba(15,15,18,.94);color:#eee;font-family:ui-monospace,monospace;" +
      "padding:16px;overflow-y:auto;transform:translateX(100%);transition:transform .25s ease;" +
      "box-shadow:-8px 0 24px rgba(0,0,0,.35);";
    panel.addEventListener("click", e => e.stopPropagation()); // no cerrar al tocar dentro

    const title = document.createElement("div");
    title.textContent = "ajustes (local)";
    title.style.cssText = "font-size:13px;color:#e8b04a;margin-bottom:10px;";
    panel.appendChild(title);

    FIELDS.forEach(f => panel.appendChild(fieldRow(f)));

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
    hint.textContent = "clica fuera del panel para cerrar";
    hint.style.cssText = "margin-top:10px;font-size:11px;color:#777;";
    panel.appendChild(hint);

    document.body.appendChild(panel);
    return panel;
  }

  const panel = build();
  let open = false;
  function setOpen(v) { open = v; panel.style.transform = open ? "translateX(0)" : "translateX(100%)"; }
  document.addEventListener("click", () => setOpen(!open));
})();
