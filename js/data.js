// ════════════════════════════════════════════════════════════════
//  DATOS  ·  carga (una sola vez) el data.json generado por
//  tools/build-data.mjs. Todas las vistas leen de aquí.
// ════════════════════════════════════════════════════════════════

let cache = null;

export function loadData() {
  cache ??= fetch("data.json").then(r => {
    if (!r.ok) throw new Error(`data.json → HTTP ${r.status}`);
    return r.json();
  });
  return cache;
}
