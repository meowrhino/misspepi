// ════════════════════════════════════════════════════════════════
//  ARRANQUE  ·  dibuja la espiral, coloca las capas y la anima
//  (todos los valores salen de js/config.js — única fuente de verdad)
// ════════════════════════════════════════════════════════════════
(function () {
  const group = document.getElementById("spiralGroup");
  const wrap  = document.getElementById("spiralWrap");
  const legs  = document.querySelector(".legs");

  // 1) dibuja la espiral (color, fondo, vueltas, brazos, hueco, grosor)
  renderSpiral(SPIRAL);

  // 2) coloca la espiral: su centro va a (centerX dvw, centerY dvh)
  wrap.style.left = SPIRAL.centerX + "dvw";
  wrap.style.top  = SPIRAL.centerY + "dvh";

  // 3) coloca las piernas: tamaño + separación del fondo + anclaje horizontal.
  //    ANCHOR_PCT = punto de la imagen (en % de su ancho) que se alinea con anchorX.
  //    83% = pie derecho → las piernas quedan a la derecha igual en móvil y desktop.
  //    (Es propio del asset: si cambias la imagen, recalcúlalo. 50 = centro, 18 = pie izq.)
  const ANCHOR_PCT = 83;
  legs.style.height    = LEGS.size   + "dvh";
  legs.style.bottom    = LEGS.bottom + "dvh";
  legs.style.left      = LEGS.anchorX + "dvw";
  legs.style.right     = "auto";
  legs.style.transform = "translateX(-" + ANCHOR_PCT + "%)";

  // 4) gira por GPU (respeta a quien pide menos movimiento)
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  group.animate(
    [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
    {
      duration:  SPIRAL.spinSeconds * 1000,
      iterations: Infinity,
      easing:    "linear",
      direction: SPIRAL.reverse ? "reverse" : "normal",
    }
  );
})();
