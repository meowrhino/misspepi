// ════════════════════════════════════════════════════════════════
//  ARRANQUE  ·  dibuja la espiral, coloca las capas y la anima
//  (todos los valores salen de js/config.js — única fuente de verdad)
// ════════════════════════════════════════════════════════════════

// ANCHOR_PCT: punto de la imagen de piernas (en % de su ancho) que se
// alinea con LEGS.anchorX. 83% = pie derecho → quedan a la derecha
// igual en móvil y desktop. Es propio del asset: si cambias la imagen,
// recalcúlalo (50 = centro, 18 = pie izquierdo).
const ANCHOR_PCT = 83;

let spinAnim = null;

// Coloca la espiral y las piernas según el estado ACTUAL de SPIRAL/LEGS.
// Se puede llamar tantas veces como haga falta (el panel de ajustes la usa
// en cada cambio de slider para previsualizar en caliente).
function applyLayout() {
  const wrap = document.getElementById("spiralWrap");
  const legs = document.querySelector(".legs");

  wrap.style.left = SPIRAL.centerX + "dvw";
  wrap.style.top  = SPIRAL.centerY + "dvh";

  legs.style.height    = LEGS.size   + "dvh";
  legs.style.bottom    = LEGS.bottom + "dvh";
  legs.style.left      = LEGS.anchorX + "dvw";
  legs.style.right     = "auto";
  legs.style.transform = "translateX(-" + ANCHOR_PCT + "%)";
}

// (Re)inicia el giro por GPU con la duración/sentido actuales.
function applySpin() {
  if (spinAnim) spinAnim.cancel();
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const g = document.getElementById("spiralGroup");
  spinAnim = g.animate(
    [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
    {
      duration:  SPIRAL.spinSeconds * 1000,
      iterations: Infinity,
      easing:    "linear",
      direction: SPIRAL.reverse ? "reverse" : "normal",
    }
  );
}

// Redibuja todo (espiral + capas + giro) desde el estado actual de la config.
// Es la función que reutiliza el panel de ajustes tras cada cambio.
function rebuildWelcome() {
  renderSpiral(SPIRAL);
  applyLayout();
  applySpin();
}

rebuildWelcome();
