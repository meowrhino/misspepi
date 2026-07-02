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

// El wrap de la espiral es un círculo inscrito en un cuadrado; para que
// nunca se vea la esquina blanca hace falta que las BANDAS (no solo el
// disco de fondo) alcancen la esquina de pantalla más lejana al centro
// (SPIRAL.centerX/centerY puede estar en cualquier sitio, incluso pegado
// a un borde). worstBandsRadius calcula el radio que las bandas alcanzan
// EN EL PEOR ÁNGULO (ver spiral.js) para las vueltas/brazos/hueco actuales;
// se recalcula en cada resize y cada cambio del panel.
function spiralDiameterPx() {
  const W = window.innerWidth, H = window.innerHeight;
  const cx = (SPIRAL.centerX / 100) * W;
  const cy = (SPIRAL.centerY / 100) * H;
  const corners = [[0, 0], [W, 0], [0, H], [W, H]];
  const farthest = Math.max(...corners.map(([x, y]) => Math.hypot(cx - x, cy - y)));
  const bandsRatio = SPIRAL_GEOMETRY.worstBandsRadius(SPIRAL) / SPIRAL_GEOMETRY.discR;
  const SAFETY = 1.05; // margen pequeño, solo para redondeos/antialiasing
  const discRadius = (farthest * SAFETY) / bandsRatio;
  return discRadius * 2;
}

// Coloca la espiral y las piernas según el estado ACTUAL de SPIRAL/LEGS.
// Se puede llamar tantas veces como haga falta (el panel de ajustes la usa
// en cada cambio de slider para previsualizar en caliente, y el resize
// para que la espiral siga cubriendo toda la pantalla).
function applyLayout() {
  const wrap = document.getElementById("spiralWrap");
  const legs = document.querySelector(".legs");

  const d = spiralDiameterPx() + "px";
  wrap.style.width  = d;
  wrap.style.height = d;
  wrap.style.left = SPIRAL.centerX + "dvw";
  wrap.style.top  = SPIRAL.centerY + "dvh";

  legs.style.height    = LEGS.size   + "dvh";
  legs.style.bottom    = LEGS.bottom + "dvh";
  legs.style.left      = LEGS.anchorX + "dvw";
  legs.style.right     = "auto";
  legs.style.transform = "translateX(-" + ANCHOR_PCT + "%)";
}

window.addEventListener("resize", applyLayout);

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
