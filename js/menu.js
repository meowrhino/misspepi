// ════════════════════════════════════════════════════════════════
//  MENÚ  ·  solo texto, alineado a la izquierda, sobre velo blanco
//
//  CONTRATO (lo usan welcome.js, gallery.js y pages.js):
//    initMenu()  — construye el DOM dentro de #menu-overlay (una vez, al boot)
//    openMenu()  — despliega el menú
//
//  La transición va en dos tiempos (tiempos en MENU, config.js):
//    abrir  → aparecen las PALABRAS escalonadas (flotando sobre la página)
//             y después el FONDO blanco se cierra detrás.
//    elegir → se navega con router.go (que resuelve cuando la vista destino
//             está lista); entonces el FONDO se retira primero (el contenido
//             nuevo asoma detrás) y las palabras se van las últimas, en
//             orden inverso al de llegada.
//
//  Cada apertura sortea, por palabra: un tamaño ligeramente distinto
//  (MENU.sizeMin..sizeMax rem) y UNA letra pintada con el color de su
//  categoría (var CSS --c-<id>, css/base.css).
// ════════════════════════════════════════════════════════════════
import { MENU, MENU_ITEMS } from "./config.js";
import { go } from "./router.js";

// ── estado del módulo ────────────────────────────────────────────
// overlay: #menu-overlay · words: los <button> en orden de MENU_ITEMS ·
// busy: cerrojo mientras anima (bloquea clicks repetidos y reentradas).
let overlay = null;
let words   = [];
let busy    = false;

// ── construcción del DOM (una sola vez, al boot) ─────────────────
export function initMenu() {
  overlay = document.getElementById("menu-overlay");
  overlay.innerHTML = "";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "menú");
  overlay.setAttribute("aria-modal", "true");
  overlay.tabIndex = -1;   // focalizable al abrir, sin anillo de foco visible

  // los tiempos de config.js gobiernan las transiciones CSS
  overlay.style.setProperty("--word-ms",    MENU.wordMs + "ms");
  overlay.style.setProperty("--bg-ms",      MENU.bgMs + "ms");
  overlay.style.setProperty("--stagger-ms", MENU.staggerMs + "ms");

  words = MENU_ITEMS.map((item, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu-word";
    btn.style.setProperty("--i", i);                 // para el escalonado
    btn.style.setProperty("--c", `var(--c-${item.id})`);
    btn.addEventListener("click", () => onPick(item));
    overlay.appendChild(btn);
    return { btn, item };
  });
}

// Sortea la palabra: tamaño ligeramente distinto en cada apertura y una
// letra al azar pintada con el color de la categoría (el CSS usa --c).
function renderWord({ btn, item }) {
  const size = MENU.sizeMin + Math.random() * (MENU.sizeMax - MENU.sizeMin);
  btn.style.fontSize = size.toFixed(2) + "rem";

  const label = item.label;
  const pick = Math.floor(Math.random() * label.length);
  btn.textContent = "";
  for (let n = 0; n < label.length; n++) {
    if (n === pick) {
      const b = document.createElement("b");
      b.className = "menu-letter";
      b.textContent = label[n];
      btn.appendChild(b);
    } else {
      btn.appendChild(document.createTextNode(label[n]));
    }
  }
}

// esperas por tiempo (las transiciones CSS duran exactamente esto;
// el colchón absorbe redondeos del navegador)
const wait = ms => new Promise(res => setTimeout(res, ms));
const wordsTotalMs = () => (words.length - 1) * MENU.staggerMs + MENU.wordMs + 60;

// Dos rAF encadenados: garantiza que el estado inicial (palabras
// invisibles) se ha pintado antes de disparar la transición de entrada.
// Con red de seguridad: en una pestaña oculta rAF no dispara (p. ej. si
// el timer de 10s salta en segundo plano) y sin timeout el menú se
// quedaría a medio abrir con el cerrojo puesto.
const nextFrame = () =>
  new Promise(res => {
    const t = setTimeout(res, 120);
    requestAnimationFrame(() => requestAnimationFrame(() => { clearTimeout(t); res(); }));
  });

// ── apertura: palabras primero, fondo después ────────────────────
export async function openMenu() {
  if (busy || !overlay.hidden) return;   // ya abierto o animando: no reentrar
  busy = true;

  words.forEach(renderWord);
  overlay.hidden = false;

  await nextFrame();
  overlay.classList.add("words-in");     // las palabras flotan sobre la página
  await wait(wordsTotalMs());

  // desde que las palabras están puestas ya se puede clicar: el velo
  // blanco se cierra detrás sin bloquear (si eliges antes de que acabe,
  // simplemente deshace el fade desde donde esté)
  busy = false;
  overlay.classList.add("bg-in");
  overlay.focus({ preventScroll: true });   // Tab entra directo a las palabras
}

// ── clic en una palabra: navegar y retirar el menú a la inversa ──
async function onPick(item) {
  if (busy) return;                      // ignora clicks durante la animación
  busy = true;

  try {
    await go(item.route);                // resuelve con la vista destino LISTA
  } catch (err) {
    console.error("[menú] fallo al navegar a", item.route, err);
  }

  // inversa de la llegada: el fondo se va primero (asoma el contenido
  // nuevo), las palabras se despiden después, la última en llegar primero
  overlay.classList.remove("bg-in");
  await wait(MENU.bgMs);

  const last = words.length - 1;
  words.forEach(({ btn }, i) => btn.style.setProperty("--i", last - i));
  overlay.classList.remove("words-in");
  await wait(wordsTotalMs());

  overlay.hidden = true;
  words.forEach(({ btn }, i) => btn.style.setProperty("--i", i)); // restaurar
  busy = false;
}
