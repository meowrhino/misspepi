// ════════════════════════════════════════════════════════════════
//  ARRANQUE  ·  dibuja la espiral y la anima
//  (giro por GPU + aceleración suave al pasar el ratón por "entrar")
// ════════════════════════════════════════════════════════════════
(function () {
  renderSpiral(SPIRAL);

  // Respeta a quien pide menos movimiento: espiral quieta.
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;

  const g = document.getElementById("spiralGroup");
  const spin = g.animate(
    [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
    {
      duration: SPIRAL.spinSeconds * 1000,
      iterations: Infinity,
      easing: "linear",
      direction: SPIRAL.reverse ? "reverse" : "normal",
    }
  );

  // Acelera/frena suavemente. El bucle solo corre durante la transición y luego para.
  let target = 1, raf = null;
  function ease() {
    const next = spin.playbackRate + (target - spin.playbackRate) * 0.08;
    if (Math.abs(target - next) > 0.01) {
      spin.playbackRate = next;
      raf = requestAnimationFrame(ease);
    } else {
      spin.playbackRate = target;
      raf = null;
    }
  }
  function go(t) { target = t; if (!raf) raf = requestAnimationFrame(ease); }

  const entrar = document.getElementById("entrar");
  entrar.addEventListener("mouseenter", () => go(SPIRAL.hoverBoost));
  entrar.addEventListener("mouseleave", () => go(1));
  entrar.addEventListener("focus",      () => go(SPIRAL.hoverBoost));
  entrar.addEventListener("blur",       () => go(1));
})();
