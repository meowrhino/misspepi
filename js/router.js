// ════════════════════════════════════════════════════════════════
//  ROUTER  ·  rutas hash (#/photo, #/contact…) + ciclo de vida de vistas
//
//  Una VISTA es un objeto { mount(container), unmount() }:
//    - mount(container): pinta la vista dentro de container y devuelve una
//      promesa que se resuelve cuando está LISTA (datos cargados y primeras
//      imágenes decodificadas). El menú cortina espera esa promesa antes de
//      retirarse — por eso importa que no se resuelva antes de tiempo.
//    - unmount(): limpia timers/listeners/animaciones propios.
//  mount puede llamarse varias veces (re-entrar en la misma ruta = remontar),
//  así que debe ser idempotente.
// ════════════════════════════════════════════════════════════════

const routes = new Map();
let currentPath = null;
let currentView = null;

// '#/photo/' → 'photo' · '#/' o '' → '' (welcome)
const parse = hash => (hash || "").replace(/^#\/?/, "").replace(/\/+$/, "");

export function register(path, view) {
  routes.set(path, view);
}

// Navega a una ruta: desmonta la vista actual, monta la nueva y se resuelve
// cuando la nueva está lista. Si la ruta no existe, cae al welcome.
export async function go(path) {
  const view = routes.get(path) ?? routes.get("");
  if (!routes.has(path)) path = "";

  currentView?.unmount?.();

  const container = document.getElementById("app-view");
  container.innerHTML = "";
  container.hidden = path === "";   // el welcome vive en su propio #welcome-view
  // ocultar el welcome también cuando se entra DIRECTO por hash a otra ruta
  // (si nunca se montó, su unmount no ha podido esconderlo)
  document.getElementById("welcome-view").hidden = path !== "";

  currentPath = path;
  currentView = view;

  // sincroniza la barra de direcciones sin re-disparar la navegación
  // (el listener de hashchange ignora la ruta ya activa)
  const wantedHash = "#/" + path;
  if (parse(location.hash) !== path) location.hash = wantedHash;

  await view.mount(container);
}

export function start() {
  window.addEventListener("hashchange", () => {
    const path = parse(location.hash);
    if (path !== currentPath) go(path);
  });
  return go(parse(location.hash));
}
