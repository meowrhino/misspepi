// ════════════════════════════════════════════════════════════════
//  PÁGINAS  ·  contact y about (mínimas)
//
//  CONTRATO (lo usa main.js):
//    contactView / aboutView — vistas { mount(container), unmount() }
//      · mount resuelve cuando la página está pintada (el menú cortina
//        espera esa promesa antes de retirarse) y es idempotente.
//
//  contact: solo el mail, centrado vertical y horizontalmente (mailto).
//  about:   descripción + contacto. Textos desde data.json (loadData de
//  data.js → claves "about" y "contact"), con fallback si faltan.
// ════════════════════════════════════════════════════════════════
import { loadData } from "./data.js";
import { openMenu } from "./menu.js";

const FALLBACK_EMAIL = "hello@misspepi.com";

// Botón "menu" discreto, igual en ambas vistas (misma esquina siempre).
function menuButton() {
  const btn = document.createElement("button");
  btn.className = "page-menu-btn";
  btn.type = "button";
  btn.textContent = "menu";
  btn.addEventListener("click", () => openMenu());
  return btn;
}

// Enlace mailto, compartido por ambas vistas.
function mailLink(email, extraClass) {
  const a = document.createElement("a");
  a.href = "mailto:" + email;
  a.textContent = email;
  a.className = extraClass;
  return a;
}

// Enlace a instagram, discreto. Devuelve null si no hay dato.
function instagramLink(handleOrUrl, extraClass) {
  if (!handleOrUrl) return null;
  const isUrl = /^https?:\/\//.test(handleOrUrl);
  const url = isUrl ? handleOrUrl : `https://instagram.com/${handleOrUrl.replace(/^@/, "")}`;
  const label = isUrl ? handleOrUrl : `@${handleOrUrl.replace(/^@/, "")}`;
  const a = document.createElement("a");
  a.href = url;
  a.textContent = label;
  a.target = "_blank";
  a.rel = "noopener";
  a.className = extraClass;
  return a;
}

// Con los datos ya cargados (o el fallback si loadData falla), extrae
// email/instagram con valores por defecto amables.
function readContact(data) {
  const contact = data?.contact ?? {};
  return {
    email: contact.email || FALLBACK_EMAIL,
    instagram: contact.instagram || null,
  };
}

export const contactView = {
  async mount(container) {
    container.innerHTML = "";
    container.classList.add("page-view", "page-view--contact");

    let contact;
    try {
      const data = await loadData();
      contact = readContact(data);
    } catch {
      contact = readContact(null);
    }

    const wrap = document.createElement("div");
    wrap.className = "contact-center";

    wrap.appendChild(mailLink(contact.email, "contact-mail"));

    const ig = instagramLink(contact.instagram, "contact-instagram");
    if (ig) wrap.appendChild(ig);

    container.appendChild(wrap);
    container.appendChild(menuButton());
  },
  unmount() {},
};

export const aboutView = {
  async mount(container) {
    container.innerHTML = "";
    container.classList.add("page-view", "page-view--about");

    let textos, contact;
    try {
      const data = await loadData();
      textos = data?.about?.textos;
      contact = readContact(data);
    } catch {
      contact = readContact(null);
    }
    if (!Array.isArray(textos) || textos.length === 0) {
      textos = ["Miss Pepi."];
    }

    const scroller = document.createElement("div");
    scroller.className = "about-scroll";

    const col = document.createElement("div");
    col.className = "about-column";

    textos.forEach(parrafo => {
      const p = document.createElement("p");
      p.className = "about-text";
      p.textContent = parrafo;
      col.appendChild(p);
    });

    const contactBlock = document.createElement("div");
    contactBlock.className = "about-contact";
    contactBlock.appendChild(mailLink(contact.email, "about-mail"));
    const ig = instagramLink(contact.instagram, "about-instagram");
    if (ig) contactBlock.appendChild(ig);
    col.appendChild(contactBlock);

    scroller.appendChild(col);
    container.appendChild(scroller);
    container.appendChild(menuButton());
  },
  unmount() {},
};
