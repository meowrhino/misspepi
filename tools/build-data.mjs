#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════
//  BUILD-DATA  ·  escanea las carpetas de contenido y genera
//  data.json en la raíz del proyecto.
//
//  Qué hace:
//    - Recorre PHOTOGRAPHY/, GRAPHIC DESIGN/ y VIDEO/ (si existe).
//    - Cada subcarpeta de esas carpetas es un "proyecto": sus imágenes
//      (webp/jpg/jpeg/png/gif) forman la galería, y un caption.txt
//      opcional aporta el pie de foto.
//    - Las carpetas sin imágenes se omiten (con aviso por consola).
//    - "about" y "contact" son contenido MANUAL: si ya existen en el
//      data.json actual se preservan tal cual; si no, se escriben
//      placeholders que hay que editar a mano.
//
//  Cómo se usa: `node tools/build-data.mjs` desde donde sea (usa
//  import.meta.url para encontrar la raíz del proyecto, no el cwd).
//  Tras añadir o quitar contenido, vuelve a correr este script y
//  commitea el data.json resultante.
// ════════════════════════════════════════════════════════════════

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// raíz del proyecto = carpeta que contiene tools/
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// categorías → carpeta de contenido en disco
const CATEGORIES = [
  { key: "photo", folder: "PHOTOGRAPHY" },
  { key: "graphic", folder: "GRAPHIC DESIGN" },
  { key: "video", folder: "VIDEO" },
];

const IMAGE_EXT = new Set([".webp", ".jpg", ".jpeg", ".png", ".gif"]);

// ── helpers ────────────────────────────────────────────────────

// true si el nombre no es un archivo oculto ni el .DS_Store de macOS
function isVisible(name) {
  return name !== ".DS_Store" && !name.startsWith(".");
}

function isImageFile(name) {
  return IMAGE_EXT.has(path.extname(name).toLowerCase());
}

// slug kebab-case: sin acentos, sin espacios, solo [a-z0-9-]
function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos/diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// orden natural: los números dentro del nombre se comparan como números,
// no como texto (para que "2.webp" vaya antes que "10.webp")
function naturalCompare(a, b) {
  const chunk = (s) => s.match(/\d+|\D+/g) ?? [];
  const partsA = chunk(a);
  const partsB = chunk(b);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const pa = partsA[i] ?? "";
    const pb = partsB[i] ?? "";
    const na = Number(pa);
    const nb = Number(pb);
    const bothNumeric = pa !== "" && pb !== "" && !Number.isNaN(na) && !Number.isNaN(nb);
    if (bothNumeric) {
      if (na !== nb) return na - nb;
    } else if (pa !== pb) {
      return pa < pb ? -1 : 1;
    }
  }
  return 0;
}

// busca un archivo caption.txt case-insensitive dentro de una lista de nombres
function findCaptionName(names) {
  return names.find((n) => n.toLowerCase() === "caption.txt");
}

// lee un proyecto (subcarpeta); devuelve null si no tiene imágenes
async function readProject(categoryFolder, projectName) {
  const projectPath = path.join(ROOT, categoryFolder, projectName);
  const entries = await readdir(projectPath, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => e.name).filter(isVisible);

  const imageNames = files.filter(isImageFile).sort(naturalCompare);

  if (imageNames.length === 0) {
    console.warn(`  ⚠ omitida (sin imágenes): ${categoryFolder}/${projectName}`);
    return null;
  }

  let caption = "";
  const captionName = findCaptionName(files);
  if (captionName) {
    const raw = await readFile(path.join(projectPath, captionName), "utf8");
    caption = raw.trim();
  }

  const folder = `${categoryFolder}/${projectName}`;
  return {
    slug: slugify(projectName),
    title: projectName,
    folder,
    images: imageNames.map((img) => `${folder}/${img}`),
    caption,
  };
}

// escanea una categoría completa; devuelve [] si la carpeta no existe
async function readCategory(categoryFolder) {
  let dirents;
  try {
    dirents = await readdir(path.join(ROOT, categoryFolder), { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn(`  (sin carpeta "${categoryFolder}" todavía → categoría vacía)`);
      return [];
    }
    // la carpeta existe pero no se puede leer (permisos, etc.): esto sí es un error real
    console.error(`✖ No se pudo leer la carpeta "${categoryFolder}": ${err.message}`);
    process.exit(1);
  }

  const projectNames = dirents
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter(isVisible)
    .sort((a, b) => a.localeCompare(b, "es"));

  const projects = [];
  for (const name of projectNames) {
    const project = await readProject(categoryFolder, name);
    if (project) projects.push(project);
  }

  // orden alfabético por título dentro de la categoría
  projects.sort((a, b) => a.title.localeCompare(b.title, "es"));
  return projects;
}

// intenta cargar el data.json existente, para preservar about/contact
async function readExistingManualSections() {
  try {
    const raw = await readFile(path.join(ROOT, "data.json"), "utf8");
    const json = JSON.parse(raw);
    return { about: json.about, contact: json.contact };
  } catch {
    return { about: undefined, contact: undefined };
  }
}

// ── main ───────────────────────────────────────────────────────

async function main() {
  console.log("Escaneando contenido…");

  const categories = {};
  for (const { key, folder } of CATEGORIES) {
    console.log(`\n· ${key} (${folder})`);
    categories[key] = await readCategory(folder);
    console.log(`  → ${categories[key].length} proyecto(s)`);
  }

  const existing = await readExistingManualSections();

  const about = existing.about ?? {
    textos: [
      "[texto provisional] Miss Pepi es fotógrafa y diseñadora gráfica. Este párrafo es un placeholder: edítalo a mano en data.json.",
      "[texto provisional] Segundo párrafo de ejemplo, para probar el layout de la página about. Sustitúyelo por el texto real.",
    ],
  };

  const contact = existing.contact ?? {
    email: "hello@misspepi.com",
    instagram: "https://instagram.com/misspepi",
  };

  const data = {
    categories,
    about,
    contact,
  };

  const outPath = path.join(ROOT, "data.json");
  await writeFile(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");

  console.log(`\ndata.json escrito en: ${outPath}`);
  for (const { key } of CATEGORIES) {
    const projects = categories[key];
    const totalImages = projects.reduce((sum, p) => sum + p.images.length, 0);
    console.log(`  ${key}: ${projects.length} proyecto(s), ${totalImages} imagen(es)`);
  }
}

main().catch((err) => {
  console.error("✖ build-data falló:", err);
  process.exit(1);
});
