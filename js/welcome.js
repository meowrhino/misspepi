// ════════════════════════════════════════════════════════════════
//  WELCOME  ·  espiral + piernas + disparadores del menú
//  (los valores salen de js/config.js — única fuente de verdad)
//
//  Vista con { mount, unmount } para el router. Además exporta
//  rebuildWelcome() para que el devpanel previsualice en caliente.
// ════════════════════════════════════════════════════════════════
import { MENU, isMobile, activeSpiral, activeLegs } from "./config.js";
import { renderSpiral, SPIRAL_GEOMETRY } from "./spiral.js";
import { openMenu } from "./menu.js";

// ANCHOR_PCT: punto de la imagen de piernas (en % de su ancho) que se
// alinea con anchorX en escritorio. 83% = pie derecho. Es propio del
// asset: si cambias la imagen, recalcúlalo (50 = centro, 18 = pie izq).
const ANCHOR_PCT = 83;

let spinAnim = null;
let sweepAnim = null;
let menuTimer = null;
let mounted = false;

// El wrap de la espiral es un círculo inscrito en un cuadrado; para que
// nunca se vea la esquina blanca hace falta que las BANDAS (no solo el
// disco de fondo) alcancen la esquina de pantalla más lejana al centro.
// worstBandsRadius calcula el radio que las bandas alcanzan EN EL PEOR
// ÁNGULO (ver spiral.js); se recalcula en cada resize y cambio del panel.
function spiralDiameterPx(cfg) {
  const W = window.innerWidth, H = window.innerHeight;
  const cx = (cfg.centerX / 100) * W;
  const cy = (cfg.centerY / 100) * H;
  const corners = [[0, 0], [W, 0], [0, H], [W, H]];
  const farthest = Math.max(...corners.map(([x, y]) => Math.hypot(cx - x, cy - y)));
  const bandsRatio = SPIRAL_GEOMETRY.worstBandsRadius(cfg) / SPIRAL_GEOMETRY.discR;
  const SAFETY = 1.05; // margen pequeño, solo para redondeos/antialiasing
  return ((farthest * SAFETY) / bandsRatio) * 2;
}

// Coloca espiral, ojo clicable y piernas según la config ACTIVA del
// breakpoint actual. Idempotente: el panel la llama en cada slider y el
// resize en cada cambio de tamaño.
function applyLayout() {
  const spiral = activeSpiral();
  const wrap = document.getElementById("spiralWrap");
  const eye  = document.getElementById("spiralEye");
  const legs = document.querySelector("#welcome-view .legs");

  const d = spiralDiameterPx(spiral);
  wrap.style.width  = d + "px";
  wrap.style.height = d + "px";
  wrap.style.left = spiral.centerX + "dvw";
  wrap.style.top  = spiral.centerY + "dvh";

  // ojo clicable: círculo centrado en el ojo de la espiral, al menos 44px
  // (área mínima táctil) aunque el hueco dibujado sea más pequeño
  const eyeD = Math.max(44, (spiral.hole / SPIRAL_GEOMETRY.discR) * d);
  eye.style.width  = eyeD + "px";
  eye.style.height = eyeD + "px";
  eye.style.left = spiral.centerX + "dvw";
  eye.style.top  = spiral.centerY + "dvh";

  applyLegs(legs);
}

// Piernas: en escritorio de pie sobre el borde inferior (ancladas por el
// pie derecho); en móvil cuelgan del borde superior y el vaivén las lleva
// de lado a lado (la animación la pone applySweep).
function applyLegs(legs) {
  const cfg = activeLegs();
  legs.style.height = cfg.size + "dvh";
  if (isMobile()) {
    legs.style.top    = "0";
    legs.style.bottom = "auto";
    legs.style.left   = "0";                 // el vaivén manda vía transform
    legs.style.transform = "none";
  } else {
    legs.style.top    = "auto";
    legs.style.bottom = cfg.bottom + "dvh";
    legs.style.left   = cfg.anchorX + "dvw";
    legs.style.transform = "translateX(-" + ANCHOR_PCT + "%)";
  }
  applySweep(legs, cfg);
}

// (Re)inicia el vaivén móvil por GPU; en escritorio lo apaga.
function applySweep(legs, cfg) {
  if (sweepAnim) { sweepAnim.cancel(); sweepAnim = null; }
  if (!isMobile()) return;
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) {
    legs.style.left = "50dvw";
    legs.style.transform = "translateX(-50%)";
    return;
  }
  sweepAnim = legs.animate(
    [
      { left: cfg.sweepMin + "dvw", transform: "translateX(-50%)" },
      { left: cfg.sweepMax + "dvw", transform: "translateX(-50%)" },
    ],
    {
      duration:  cfg.sweepSeconds * 1000,
      iterations: Infinity,
      direction: "alternate",
      easing:    "ease-in-out",
    }
  );
}

// (Re)inicia el giro por GPU con la duración/sentido actuales.
function applySpin() {
  if (spinAnim) spinAnim.cancel();
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const spiral = activeSpiral();
  const g = document.getElementById("spiralGroup");
  spinAnim = g.animate(
    [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
    {
      duration:  spiral.spinSeconds * 1000,
      iterations: Infinity,
      easing:    "linear",
      direction: spiral.reverse ? "reverse" : "normal",
    }
  );
}

// Redibuja todo (espiral + capas + animaciones) desde la config actual.
// La reutiliza el panel de ajustes tras cada cambio.
export function rebuildWelcome() {
  renderSpiral(activeSpiral());
  applyLayout();
  applySpin();
}

function armMenuTimer() {
  clearTimeout(menuTimer);
  menuTimer = setTimeout(openMenu, MENU.autoOpenSeconds * 1000);
}

window.addEventListener("resize", () => { if (mounted) rebuildWelcome(); });

document.getElementById("spiralEye").addEventListener("click", () => {
  clearTimeout(menuTimer);
  openMenu();
});

export const welcomeView = {
  async mount() {
    document.getElementById("welcome-view").hidden = false;
    mounted = true;
    rebuildWelcome();
    armMenuTimer();
  },
  unmount() {
    mounted = false;
    clearTimeout(menuTimer);
    if (spinAnim)  { spinAnim.cancel();  spinAnim = null; }
    if (sweepAnim) { sweepAnim.cancel(); sweepAnim = null; }
    document.getElementById("welcome-view").hidden = true;
  },
};
