// ════════════════════════════════════════════════════════════════
//  ARRANQUE  ·  registra las vistas, monta el menú y enciende el router
// ════════════════════════════════════════════════════════════════
import { register, start } from "./router.js";
import { welcomeView } from "./welcome.js";
import { createGalleryView } from "./gallery.js";
import { contactView, aboutView } from "./pages.js";
import { initMenu } from "./menu.js";

register("",        welcomeView);
register("photo",   createGalleryView("photo"));
register("graphic", createGalleryView("graphic"));
register("video",   createGalleryView("video"));
register("contact", contactView);
register("about",   aboutView);

initMenu();
start();
