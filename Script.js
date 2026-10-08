/* ===== CONFIGURATION (à modifier ici) ===== */
const CONFIG = {
  whatsappNumber: "243990816740",                 // format international, sans + ni espaces
  facebookUrl: "https://www.facebook.com/",       // TODO : remplacer par l'URL exacte de la page « halisi tech solution »
  mapsEmbedUrl: "",                               // TODO : coller ici l'URL d'intégration Google Maps (« Partager > Intégrer une carte »)
  mapsSearch: "Rond-point Vukaka, Quartier Bwinongo, Butembo, RDC",
  msgInfo: "Bonjour halisi_TECH_SOLUTION, je voudrais avoir des informations sur vos services.",
  msgHelp: "Bonjour halisi_TECH_SOLUTION, j'aimerais demander une assistance pour mon appareil.",
  msgQuote: "Bonjour halisi_TECH_SOLUTION, je voudrais demander un devis."
};

document.documentElement.classList.add("js");

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const waLink = text => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

/* ===== Liens WhatsApp, Facebook, carte ===== */
$$("[data-wa]").forEach(a => (a.href = waLink(CONFIG.msgInfo)));
$$("[data-wa-help]").forEach(a => (a.href = waLink(CONFIG.msgHelp)));
$$("[data-wa-quote]").forEach(a => (a.href = waLink(CONFIG.msgQuote)));
$$("[data-fb]").forEach(a => (a.href = CONFIG.facebookUrl));
$$("[data-map-link]").forEach(a => (a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.mapsSearch)));
if (CONFIG.mapsEmbedUrl) {
  const map = $("[data-map]");
  map.innerHTML = `<iframe src="${CONFIG.mapsEmbedUrl}" title="Carte de l'atelier" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
}

/* ===== Menu hamburger ===== */
const burger = $("#burger");
const menu = $("#menu");
function setMenu(open) {
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
}
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
window.addEventListener("resize", () => { if (innerWidth >= 1000) setMenu(false); });

/* ===== Navigation fluide (le défilement doux est géré en CSS ; ici : lien actif) ===== */
const links = $$(".menu a");
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

/* ===== Header au scroll + bouton retour en haut ===== */
const header = $("#header");
const toTop = $("#toTop");
function onScroll() {
  header.classList.toggle("scrolled", scrollY > 10);
  toTop.hidden = scrollY < 600;
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

/* ===== Animations d'apparition ===== */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
} else {
  $$(".reveal").forEach(el => el.classList.add("visible"));
}

/* ===== Formulaire -> message WhatsApp ===== */
const form = $("#form");
const hint = $("#hint");
const rules = {
  nom: v => v.trim().length >= 2 || "Entrez votre nom.",
  tel: v => /^[+\d][\d\s().-]{7,}$/.test(v.trim()) || "Entrez un numéro de téléphone valide.",
  service: v => v !== "" || "Choisissez un service.",
  message: v => v.trim().length >= 5 || "Décrivez brièvement votre problème."
};
form.addEventListener("submit", e => {
  e.preventDefault();
  let ok = true;
  Object.keys(rules).forEach(name => {
    const field = form.elements[name];
    const res = rules[name](field.value);
    const err = $(`[data-err="${name}"]`, form);
    field.classList.toggle("invalid", res !== true);
    err.textContent = res === true ? "" : res;
    if (res !== true) ok = false;
  });
  if (!ok) { hint.textContent = "Corrigez les champs en rouge pour continuer."; return; }
  const d = Object.fromEntries(new FormData(form));
  const text =
    `Bonjour halisi_TECH_SOLUTION,\n\n` +
    `Nom : ${d.nom.trim()}\n` +
    `Téléphone : ${d.tel.trim()}\n` +
    `Service souhaité : ${d.service}\n` +
    `Message : ${d.message.trim()}`;
  window.open(waLink(text), "_blank", "noopener");
  hint.textContent = "WhatsApp s'ouvre avec votre demande. Appuyez sur Envoyer dans WhatsApp pour la transmettre.";
  form.reset();
});
$$("input,select,textarea", form).forEach(f =>
  f.addEventListener("input", () => { f.classList.remove("invalid"); $(`[data-err="${f.name}"]`, form).textContent = ""; })
);
