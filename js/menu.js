// ════════════════════════════════════════════════════════════════
//  MENÚ CORTINA  ·  overlay con tiras que entran alternando lados
//
//  CONTRATO (lo usan welcome.js, gallery.js y pages.js):
//    initMenu()  — construye el DOM dentro de #menu-overlay (una vez, al boot)
//    openMenu()  — despliega la cortina (tiras alternas izq/der, escalonadas)
//
//  Al clicar un ítem: la cortina SE QUEDA tapando la pantalla, se navega con
//  router.go(item.route) (que resuelve cuando la vista destino está lista) y
//  solo entonces las tiras salen por donde entraron, en orden inverso.
//
//  Ítems/orden: MENU_ITEMS (config.js). Color de cada categoría: var CSS
//  --c-<id> (css/base.css); una letra AL AZAR de cada palabra se pinta de
//  ese color al renderizar. Tiempos: MENU.stripMs / MENU.staggerMs.
// ════════════════════════════════════════════════════════════════
import { MENU, MENU_ITEMS } from "./config.js";
import { go } from "./router.js";

// ── estado del módulo ────────────────────────────────────────────
// overlay: el contenedor #menu-overlay. strips: las 6 tiras <button> en
// orden de MENU_ITEMS. busy: cerrojo mientras la cortina anima (bloquea
// clicks repetidos y reentradas de openMenu).
let overlay = null;
let strips  = [];
let busy    = false;

// La dirección de entrada alterna por índice: par (0,2,4) desde la
// izquierda, impar (1,3,5) desde la derecha. La salida usa la misma.
const enterFromLeft = i => i % 2 === 0;

// ── construcción del DOM (una sola vez, al boot) ─────────────────
// Cada tira es un <button> con la palabra dentro. La estética (fondos,
// bordes, tamaño de letra) y las transiciones viven en css/menu.css; aquí
// solo pasamos los TIEMPOS como custom properties inline, para no duplicar
// los números de config.js en el CSS.
export function initMenu() {
  overlay = document.getElementById("menu-overlay");
  overlay.innerHTML = "";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "menú");
  overlay.setAttribute("aria-modal", "true");

  // los tiempos de config.js gobiernan la animación CSS
  overlay.style.setProperty("--strip-ms",   MENU.stripMs + "ms");
  overlay.style.setProperty("--stagger-ms", MENU.staggerMs + "ms");

  strips = MENU_ITEMS.map((item, i) => {
    const strip = document.createElement("button");
    strip.type = "button";
    strip.className = "menu-strip";
    strip.dataset.side = enterFromLeft(i) ? "left" : "right";
    strip.style.setProperty("--i", i);                 // para el escalonado
    strip.style.setProperty("--c", `var(--c-${item.id})`);

    const word = document.createElement("span");
    word.className = "menu-word";
    strip.appendChild(word);

    strip.addEventListener("click", () => onPick(item));
    overlay.appendChild(strip);
    return { strip, word, item };
  });
}

// Pinta la palabra de una tira con UNA letra al azar coloreada. Se llama en
// cada apertura, así la letra elegida cambia entre aperturas. Reconstruye
// el <span> con un <b> alrededor de la letra sorteada (el color lo aplica
// el CSS con la custom property --c de la tira).
function renderWord({ word, item }) {
  const label = item.label;
  const pick = Math.floor(Math.random() * label.length);
  word.textContent = "";
  for (let n = 0; n < label.length; n++) {
    if (n === pick) {
      const b = document.createElement("b");
      b.className = "menu-letter";
      b.textContent = label[n];
      word.appendChild(b);
    } else {
      word.appendChild(document.createTextNode(label[n]));
    }
  }
}

// Espera a que TERMINE la transición de transform de un elemento. El
// transitionend puede no dispararse (elemento oculto, transición idéntica,
// etc.), así que añadimos un timeout de seguridad = duración + colchón.
function afterTransform(el, ms) {
  return new Promise(resolve => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener("transitionend", onEnd);
      clearTimeout(timer);
      resolve();
    };
    const onEnd = e => { if (e.propertyName === "transform") finish(); };
    el.addEventListener("transitionend", onEnd);
    const timer = setTimeout(finish, ms + 80);   // colchón anti-cuelgue
  });
}

// Momento en que la ÚLTIMA tira acaba de animar, contando su retardo
// escalonado + la duración de la propia tira (+ colchón de seguridad).
// Lo usamos para esperar a toda la cortina de una vez.
const totalMs = () =>
  (strips.length - 1) * MENU.staggerMs + MENU.stripMs + 80;

// ── apertura: despliegue de la cortina ───────────────────────────
// Muestra el overlay, sortea las letras, deja que el navegador registre el
// estado "fuera de pantalla" (doble rAF) y luego añade .is-open para que
// las tiras entren con su transición escalonada. Al terminar, roba el foco
// a la primera tira.
export async function openMenu() {
  if (busy) return;                 // ya está abierta o animando: no reentrar
  if (!overlay.hidden) return;
  busy = true;

  strips.forEach(renderWord);
  overlay.hidden = false;
  overlay.classList.remove("is-closing");

  // forzamos un reflow para partir del estado cerrado antes de animar
  await nextFrame();
  overlay.classList.add("is-open");

  await Promise.all(strips.map(({ strip }) => afterTransform(strip, MENU.stripMs)));

  strips[0]?.strip.focus();
  busy = false;
}

// ── clic en una tira: navegar y luego retirar la cortina ─────────
// La cortina se queda tapando mientras router.go monta la vista destino.
// Cuando esa promesa resuelve (vista lista, imágenes incluidas) las tiras
// salen por donde entraron, en ORDEN INVERSO. Si go() rechaza, cerramos
// igual y dejamos el error en consola.
async function onPick(item) {
  if (busy) return;                 // ignora clicks repetidos durante la anim
  busy = true;

  try {
    await go(item.route);
  } catch (err) {
    console.error("[menú] fallo al navegar a", item.route, err);
  }

  await closeCurtain();
  busy = false;
}

// Retira la cortina en orden inverso: la última tira que entró es la
// primera en salir. Reasignamos el índice de escalonado (--i) para
// invertir el orden de los retardos sin tocar el CSS, disparamos la salida
// con .is-closing y esperamos a que toda la cortina termine.
async function closeCurtain() {
  const last = strips.length - 1;
  strips.forEach(({ strip }, i) => strip.style.setProperty("--i", last - i));

  overlay.classList.remove("is-open");
  overlay.classList.add("is-closing");

  await new Promise(resolve => setTimeout(resolve, totalMs()));

  overlay.classList.remove("is-closing");
  overlay.hidden = true;
  // restauramos el índice original para la próxima apertura
  strips.forEach(({ strip }, i) => strip.style.setProperty("--i", i));
}

// Dos rAF encadenados: garantiza que el estado inicial (tiras fuera) se ha
// pintado antes de aplicar la clase que dispara la transición de entrada.
function nextFrame() {
  return new Promise(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
}
