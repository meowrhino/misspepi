// ════════════════════════════════════════════════════════════════
//  GALERÍAS  ·  photo / graphic / video  (mokakopa invertido)
//
//  CONTRATO (lo usa main.js):
//    createGalleryView(category) → vista { mount(container), unmount() }
//      · category: "photo" | "graphic" | "video" (clave en data.json)
//      · mount devuelve una promesa que se resuelve cuando la vista está
//        LISTA (datos cargados, DOM pintado y la PRIMERA imagen del primer
//        proyecto decodificada) — el menú cortina espera esa promesa antes
//        de retirar la cortina.
//      · mount es idempotente: remontar = re-render limpio.
//
//  Diseño (el porqué de cada cosa está junto al código):
//    · Cada proyecto es una COLUMNA de 100dvw × 100dvh. El contenedor
//      scrollea en HORIZONTAL con scroll-snap x mandatory: un gesto/rueda
//      pasa de proyecto. Dentro de cada columna se scrollea en VERTICAL:
//      las imágenes apiladas y, al final, la ficha técnica (título +
//      caption) con un botón que reabre el menú.
//    · LOOP INFINITO: clonamos el último proyecto al principio y el primero
//      al final. Cuando el scroll aterriza sobre un clon, recolocamos
//      scrollLeft (sin animación) a la columna real equivalente, así el
//      salto es invisible. Con 0 o 1 proyectos no hay loop ni clones.
// ════════════════════════════════════════════════════════════════
import { loadData } from "./data.js";
import { openMenu } from "./menu.js";

// Timeout de seguridad para el decode de la primera imagen: si una imagen
// tarda o falla, no queremos colgar la cortina indefinidamente.
const READY_TIMEOUT_MS = 2500;
// Fallback de "scrollend" para navegadores sin el evento (Safari): tras este
// silencio de scroll damos por terminada la inercia y comprobamos el aterrizaje.
const SCROLLEND_FALLBACK_MS = 150;

export function createGalleryView(category) {
  // ── estado propio de esta vista (vive en el closure entre mount/unmount) ──
  let root = null;         // el nodo raíz que inyectamos en el container
  let track = null;        // el contenedor horizontal con scroll-snap
  let realCount = 0;       // nº de proyectos reales (sin contar clones)
  let hasLoop = false;     // ¿hay clones? (solo con 2+ proyectos)
  const listeners = [];    // [{ target, type, fn }] para limpiar en unmount
  let scrollDebounce = null;
  let resizeDebounce = null;

  // Registra un listener y lo apunta para poder retirarlo en unmount.
  function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    listeners.push({ target, type, fn, opts });
  }

  function cleanup() {
    for (const { target, type, fn, opts } of listeners) {
      target.removeEventListener(type, fn, opts);
    }
    listeners.length = 0;
    if (scrollDebounce) { clearTimeout(scrollDebounce); scrollDebounce = null; }
    if (resizeDebounce) { clearTimeout(resizeDebounce); resizeDebounce = null; }
    root = track = null;
    realCount = 0;
    hasLoop = false;
  }

  // ── construir una columna (proyecto) ──────────────────────────────
  // Devuelve la <section> con las imágenes apiladas + ficha técnica.
  function buildColumn(project) {
    const col = document.createElement("section");
    col.className = "gallery__col";

    const stack = document.createElement("div");
    stack.className = "gallery__stack";

    for (const src of project.images || []) {
      const img = document.createElement("img");
      img.className = "gallery__img";
      // Las rutas llevan espacios y paréntesis reales → encodeURI.
      img.src = encodeURI(src);
      img.alt = project.title || "";
      img.loading = "lazy";
      img.decoding = "async";
      // fade-in individual al cargar (como mokakopa)
      if (img.complete && img.naturalWidth) img.classList.add("loaded");
      else on(img, "load", () => img.classList.add("loaded"), { once: true });
      stack.appendChild(img);
    }

    // ── ficha técnica (al final del scroll vertical) ──
    const card = document.createElement("footer");
    card.className = "gallery__card";

    const h = document.createElement("h2");
    h.className = "gallery__title";
    h.textContent = project.title || project.slug || "";
    card.appendChild(h);

    if (project.caption) {
      const p = document.createElement("p");
      p.className = "gallery__caption";
      p.textContent = project.caption;
      card.appendChild(p);
    }

    const btn = document.createElement("button");
    btn.className = "gallery__menu-btn";
    btn.type = "button";
    btn.textContent = "menu";
    on(btn, "click", openMenu);
    card.appendChild(btn);

    col.appendChild(stack);
    col.appendChild(card);
    return col;
  }

  // ── placeholder para categorías sin proyectos (video hoy) ─────────
  function buildEmpty() {
    const wrap = document.createElement("div");
    wrap.className = "gallery__empty";

    const p = document.createElement("p");
    p.className = "gallery__empty-text";
    p.textContent = `${category} · coming soon`;
    wrap.appendChild(p);

    const btn = document.createElement("button");
    btn.className = "gallery__menu-btn";
    btn.type = "button";
    btn.textContent = "menu";
    on(btn, "click", openMenu);
    wrap.appendChild(btn);

    return wrap;
  }

  function buildError() {
    const wrap = document.createElement("div");
    wrap.className = "gallery__empty";

    const p = document.createElement("p");
    p.className = "gallery__empty-text";
    p.textContent = "no se pudieron cargar los datos";
    wrap.appendChild(p);

    const btn = document.createElement("button");
    btn.className = "gallery__menu-btn";
    btn.type = "button";
    btn.textContent = "menu";
    on(btn, "click", openMenu);
    wrap.appendChild(btn);

    return wrap;
  }

  // ── LOOP: recolocar scrollLeft cuando el scroll aterriza en un clon ──
  // Columnas: [clon(último), real0, real1, …, realN-1, clon(primero)]
  //           índice 0 = clon del último · índices 1..N = reales · N+1 = clon del primero
  // Si aterrizamos en 0 → saltar a N (mismo contenido, columna real).
  // Si aterrizamos en N+1 → saltar a 1.
  function relocateIfOnClone() {
    if (!hasLoop || !track) return;
    const w = track.clientWidth;
    if (!w) return;
    // índice de columna más cercano a la posición actual (redondeo por snap)
    const idx = Math.round(track.scrollLeft / w);
    if (idx <= 0) {
      // clon del último → real último (índice realCount)
      track.scrollTo({ left: realCount * w, behavior: "auto" });
    } else if (idx >= realCount + 1) {
      // clon del primero → real primero (índice 1)
      track.scrollTo({ left: 1 * w, behavior: "auto" });
    }
  }

  // ── centrado de la PRIMERA imagen de cada columna (mokakopa invertido) ──
  // mokakopa centra la primera imagen del scroll horizontal con un padding
  // lateral dinámico; aquí es lo mismo en vertical: padding-top para que la
  // primera imagen aparezca centrada en el viewport. Cada imagen tiene una
  // altura distinta, así que se calcula por columna cuando su primera
  // imagen carga, y se recalcula en resize.
  function centerColumn(col) {
    const stack = col.querySelector(".gallery__stack");
    const img = stack?.querySelector(".gallery__img");
    if (!stack) return;
    if (!img || !img.clientHeight) { stack.style.paddingTop = ""; return; }
    const pad = Math.max(20, (col.clientHeight - img.clientHeight) / 2);
    stack.style.paddingTop = pad + "px";
  }

  function wireCentering() {
    if (!track) return;
    track.querySelectorAll(".gallery__col").forEach(col => {
      const img = col.querySelector(".gallery__img");
      if (!img) return;
      if (img.complete && img.naturalWidth) centerColumn(col);
      else on(img, "load", () => centerColumn(col), { once: true });
    });
    on(window, "resize", () => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        track?.querySelectorAll(".gallery__col").forEach(centerColumn);
      }, 150);
    });
  }

  // scrollend nativo si existe; si no, debounce tras el silencio de scroll.
  function wireLoopListeners() {
    if (!hasLoop || !track) return;
    const supportsScrollend = "onscrollend" in window;
    if (supportsScrollend) {
      on(track, "scrollend", relocateIfOnClone);
    } else {
      on(track, "scroll", () => {
        if (scrollDebounce) clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(relocateIfOnClone, SCROLLEND_FALLBACK_MS);
      }, { passive: true });
    }
  }

  // ── promesa "listo": primera imagen del primer proyecto REAL decodificada ──
  // Con loop, la primera .gallery__col del DOM es el clon del último proyecto;
  // por eso apuntamos a la primera columna que NO sea clon.
  // Con timeout de seguridad para no colgar la cortina si el decode tarda/falla.
  function firstImageReady() {
    const firstReal = track?.querySelector(
      ".gallery__col:not(.gallery__col--clone)"
    );
    const firstImg = firstReal?.querySelector(".gallery__img");
    if (!firstImg) return Promise.resolve();

    const decoded = firstImg.complete && firstImg.naturalWidth
      ? Promise.resolve()
      : firstImg.decode().catch(() => {
          // decode() puede rechazar (imagen rota, aún sin src resuelto…):
          // esperamos al load/error como red de seguridad.
          return new Promise(res => {
            firstImg.addEventListener("load", res, { once: true });
            firstImg.addEventListener("error", res, { once: true });
          });
        });

    const timeout = new Promise(res => setTimeout(res, READY_TIMEOUT_MS));
    return Promise.race([decoded, timeout]);
  }

  return {
    async mount(container) {
      // Remontar = re-render limpio: soltamos cualquier estado anterior.
      cleanup();

      const accent = `var(--c-${category})`;

      const data = await loadData().catch(() => null);
      const projects = data?.categories?.[category] ?? null;

      // ── construir el DOM raíz ──
      root = document.createElement("div");
      root.className = "gallery";
      root.style.setProperty("--accent", accent);

      if (!data) {
        // fetch fallido: mensaje simple + salida por el menú.
        root.appendChild(buildError());
        container.replaceChildren(root);
        return; // nada que decodificar; la cortina puede retirarse ya
      }

      realCount = projects?.length ?? 0;

      if (realCount === 0) {
        // categoría vacía (video): placeholder "coming soon".
        root.appendChild(buildEmpty());
        container.replaceChildren(root);
        return;
      }

      // ── track horizontal con las columnas ──
      track = document.createElement("div");
      track.className = "gallery__track";

      hasLoop = realCount >= 2;

      const columns = projects.map(buildColumn);

      if (hasLoop) {
        // Clonamos el último al principio y el primero al final (clones de
        // DOM: cloneNode conserva src/loading/decoding, no rompe el decode).
        // Los clones son decorativos → aria-hidden y sin foco en su botón.
        const cloneLast = columns[realCount - 1].cloneNode(true);
        const cloneFirst = columns[0].cloneNode(true);
        markClone(cloneLast);
        markClone(cloneFirst);
        track.appendChild(cloneLast);
        columns.forEach(c => track.appendChild(c));
        track.appendChild(cloneFirst);
      } else {
        columns.forEach(c => track.appendChild(c));
      }

      root.appendChild(track);
      container.replaceChildren(root);

      // Con loop, arrancamos en la primera columna REAL (índice 1), no en
      // el clon. Lo hacemos tras pintar, cuando ya hay ancho medible.
      if (hasLoop) {
        const w = track.clientWidth || window.innerWidth;
        track.scrollTo({ left: w, behavior: "auto" });
      }

      wireLoopListeners();
      wireCentering();

      // La vista está lista cuando la primera imagen del primer proyecto
      // se ha decodificado (o salta el timeout de seguridad). El clon del
      // último va antes en el DOM, así que apuntamos a la columna real: en
      // hasLoop la primera .gallery__col es el clon → buscamos la real.
      await firstImageReady();
    },

    unmount() {
      cleanup();
    },
  };

  // ── util: marca una columna como clon (accesibilidad + no foco) ──
  function markClone(col) {
    col.classList.add("gallery__col--clone");
    col.setAttribute("aria-hidden", "true");
    // el botón "menu" clonado no debe recibir foco por tabulación
    const btn = col.querySelector(".gallery__menu-btn");
    if (btn) btn.tabIndex = -1;
  }
}
