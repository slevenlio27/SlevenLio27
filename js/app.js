/* Portafolio · renderizador multipágina.
   El contenido vive en contenido.js (lo genera admin.html). Cada página HTML
   indica cuál es con <body data-page="...">. */
(() => {
  "use strict";
  const PAGES = { inicio: "index.html", sobre: "sobre-mi.html", proyectos: "proyectos.html", habilidades: "habilidades.html", experiencia: "experiencia.html", contacto: "contacto.html" };
  const ORDER = ["inicio", "sobre", "proyectos", "habilidades", "experiencia"];
  const page = (document.body.dataset.page in PAGES) ? document.body.dataset.page : "inicio";

  const BASE = {
    name: "", brand: { es: "", en: "" }, role: { es: "", en: "" }, hello: { es: "", en: "" }, about: { es: "", en: "" },
    footer: { es: "", en: "" }, share: { es: "", en: "" },
    photos: { profile: "", about: "" },
    socials: [],
    contact: { email: "", cv: "", cvName: "", text: { es: "", en: "" } },
    projects: [], experience: [],
    skills: { tech: { title: { es: "", en: "" }, items: [] }, tools: { title: { es: "", en: "" }, items: [] }, soft: { title: { es: "", en: "" }, items: [] } },
    sections: { sobre: true, proyectos: true, habilidades: true, experiencia: true, contacto: true },
    ui: {
      es: {
        nav: { inicio: "Inicio", sobre: "Sobre mí", proyectos: "Proyectos", habilidades: "Habilidades", experiencia: "Experiencia", contacto: "Contacto" },
        levels: ["Básico", "Intermedio", "Avanzado", "Experto"], yearOne: "año", yearMany: "años",
        demo: "Visitar sitio", repo: "Ver código", mail: "Escribir correo", copy: "Copiar correo", copied: "Correo copiado", cv: "Descargar CV",
        tapHint: "",
        heroTitle: "Construyo la web, el sistema o la app que tu negocio necesita.",
        heroLead: "Me encargo de todo el proyecto, de la primera conversación a la publicación. Trabajo desde Estelí, Nicaragua.",
        wa: "Escríbeme por WhatsApp", seeWork: "Ver proyectos", live: "En línea",
        servicesTitle: "Qué puedo hacer por tu negocio",
        services: [
          { t: "Sitio web o tienda en línea", d: "Una página que muestra tus productos o servicios, recibe pedidos y te conecta con tus clientes por WhatsApp." },
          { t: "Sistema con panel de administración", d: "Citas, inventario, usuarios o reportes en un sistema web que tú mismo administras desde el navegador." },
          { t: "App Android", d: "Una aplicación móvil con inicio de sesión y datos en la nube, conectada a tu sistema." }
        ],
        workTitle: "Proyectos recientes", workLead: "", allWork: "Ver en detalle",
        processTitle: "Cómo trabajamos",
        process: [
          { t: "Conversamos", d: "Me cuentas qué necesitas y definimos juntos el alcance y el costo." },
          { t: "Diseño", d: "Te muestro cómo se verá antes de empezar a programar." },
          { t: "Construyo", d: "Desarrollo el sitio o el sistema y te enseño los avances." },
          { t: "Publico", d: "Lo dejo en línea y te explico cómo usarlo y actualizarlo." }
        ],
        ctaTitle: "¿Tienes un proyecto en mente?", ctaBtn: "Hablemos de tu proyecto",
        aboutTitle: "Sobre mí", aboutLead: "Desarrollador web y móvil en Estelí, Nicaragua.", traits: "Cualidades", photoCaption: "Hackathon Nicaragua",
        projectsTitle: "Proyectos", projectsLead: "Trabajos publicados y en uso. Abre cada uno para verlo funcionando.", built: "Tecnologías",
        skillsTitle: "Habilidades", skillsLead: "Las herramientas con las que construyo cada proyecto.",
        expTitle: "Experiencia", expLead: "Dónde he trabajado y qué he construido.",
        contactTitle: "Hablemos de tu proyecto", contactAlt: "Otras formas de contacto",
        brief: "Para empezar, cuéntame:", briefItems: ["A qué se dedica tu negocio.", "Qué quieres lograr con la web, el sistema o la app.", "Si tienes una fecha en mente."],
        menu: "Menú", close: "Cerrar menú", themeDark: "Activar modo oscuro", themeLight: "Activar modo claro", langSwitch: "View in English", sections: "Secciones",
        empty: "Pronto agregaré contenido aquí.", noWa: "Escríbeme por correo"
      },
      en: {
        nav: { inicio: "Home", sobre: "About", proyectos: "Projects", habilidades: "Skills", experiencia: "Experience", contacto: "Contact" },
        levels: ["Beginner", "Intermediate", "Advanced", "Expert"], yearOne: "year", yearMany: "years",
        demo: "Visit site", repo: "View code", mail: "Send email", copy: "Copy email", copied: "Email copied", cv: "Download CV",
        tapHint: "",
        heroTitle: "I build the website, system or app your business needs.",
        heroLead: "I handle the whole project, from the first conversation to launch. Based in Estelí, Nicaragua.",
        wa: "Message me on WhatsApp", seeWork: "See projects", live: "Live",
        servicesTitle: "What I can build for your business",
        services: [
          { t: "Website or online store", d: "A site that shows your products or services, takes orders and connects you with customers on WhatsApp." },
          { t: "System with an admin panel", d: "Appointments, inventory, users or reports in a web system you manage yourself from the browser." },
          { t: "Android app", d: "A mobile app with sign-in and cloud data, connected to your system." }
        ],
        workTitle: "Recent projects", workLead: "", allWork: "See details",
        processTitle: "How we work",
        process: [
          { t: "We talk", d: "You tell me what you need and we agree on scope and cost." },
          { t: "Design", d: "I show you how it will look before writing code." },
          { t: "Build", d: "I develop the site or system and share progress with you." },
          { t: "Launch", d: "I put it online and show you how to use and update it." }
        ],
        ctaTitle: "Have a project in mind?", ctaBtn: "Let's talk about your project",
        aboutTitle: "About me", aboutLead: "Web and mobile developer in Estelí, Nicaragua.", traits: "Strengths", photoCaption: "Hackathon Nicaragua",
        projectsTitle: "Projects", projectsLead: "Published work in real use. Open each one to see it running.", built: "Built with",
        skillsTitle: "Skills", skillsLead: "The tools I use to build each project.",
        expTitle: "Experience", expLead: "Where I've worked and what I've built.",
        contactTitle: "Let's talk about your project", contactAlt: "Other ways to reach me",
        brief: "To get started, tell me:", briefItems: ["What your business does.", "What you want the website, system or app to achieve.", "Whether you have a date in mind."],
        menu: "Menu", close: "Close menu", themeDark: "Switch to dark mode", themeLight: "Switch to light mode", langSwitch: "Ver en español", sections: "Sections",
        empty: "Content coming soon.", noWa: "Email me"
      }
    }
  };
  const merge = (base, over) => {
    if (Array.isArray(base)) return Array.isArray(over) && over.length ? over : base;
    if (base && typeof base === "object") {
      if (over && typeof over === "object" && !Array.isArray(over)) {
        const out = {};
        for (const k of new Set([...Object.keys(base), ...Object.keys(over)])) out[k] = k in base ? merge(base[k], over[k]) : over[k];
        return out;
      }
      return base;
    }
    return over === undefined || over === null || over === "" ? base : over;
  };
  const normalize = raw => {
    const s = JSON.parse(JSON.stringify(raw || {}));
    if (s.links && !s.socials) s.socials = Object.keys(s.links).map(type => ({ type, url: s.links[type] || "" }));
    delete s.links;
    // Los textos de botones antiguos del admin no deben pisar los nuevos por defecto si están vacíos.
    return merge(BASE, s);
  };

  let state = normalize({}), assetMap = {}, ratios = {};
  let lang = "es";
  try { lang = localStorage.getItem("lang") || ""; } catch (e) {}
  if (lang !== "es" && lang !== "en") lang = (navigator.language || "es").toLowerCase().startsWith("en") ? "en" : "es";
  const t = f => (f && typeof f === "object") ? (String(f[lang] || "").trim() || String(f.es || "").trim()) : String(f || "").trim();
  const tOnly = f => (f && typeof f === "object") ? String(f[lang] || "").trim() : String(f || "").trim();
  const ui = () => merge(BASE.ui[lang], (state.ui || {})[lang]);

  /* ---------- helpers ---------- */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = u => (u && !/^\s*(javascript|vbscript|data:text)/i.test(u)) ? String(u).trim() : "";
  const src = u => assetMap[u] || safeUrl(u);
  const initials = n => (n || "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
  const paras = s => s.split(/\n+/).map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join("");
  const on = k => k === "inicio" || state.sections[k] !== false;
  const svg = (d, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra || ""}>${d}</svg>`;
  const ICONS = {
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>',
    github: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
    instagram: svg('<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.2"/><path d="M16.5 7.5v.01"/>'),
    linkedin: svg('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 11v5"/><path d="M8 8v.01"/><path d="M12 16v-5"/><path d="M16 16v-3a2 2 0 0 0-4 0"/>'),
    facebook: svg('<path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2H7"/>'),
    x: svg('<path d="M4 4l11.7 16H20L8.3 4z"/><path d="M4 20l6.8-6.8m2.4-2.4L20 4"/>'),
    youtube: svg('<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/>'),
    tiktok: svg('<path d="M21 7.9v4a10 10 0 0 1-5-1.9v4.5a6.5 6.5 0 1 1-8-6.3v4.3a2.5 2.5 0 1 0 4 2V3h4.1A6 6 0 0 0 21 7.9z"/>'),
    web: svg('<circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8"/><path d="M3.6 15h16.8"/><path d="M11.5 3a17 17 0 0 0 0 18"/><path d="M12.5 3a17 17 0 0 1 0 18"/>'),
    email: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
    down: svg('<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>'),
    out: svg('<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    moon: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    x2: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    pin: svg('<path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    check: svg('<path d="m5 12 4.5 4.5L19 7"/>'),
    arrow: svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>')
  };
  const LABELS = { whatsapp: "WhatsApp", github: "GitHub", instagram: "Instagram", linkedin: "LinkedIn", facebook: "Facebook", x: "X", youtube: "YouTube", tiktok: "TikTok", web: "Web", email: "Email" };
  const socialUrl = s => {
    let url = safeUrl(s.url);
    if (s.type === "email" && url && !/^mailto:/i.test(url)) url = "mailto:" + url;
    return url;
  };
  const waLink = () => { const s = state.socials.find(x => x.type === "whatsapp" && safeUrl(x.url)); return s ? safeUrl(s.url) : ""; };
  const email = () => (state.contact.email || "").trim();

  /* Acción principal de contacto: WhatsApp si existe, si no, correo; si no, la página de contacto. */
  const primaryCta = (label, cls) => {
    const u = ui(), wa = waLink(), em = email();
    if (wa) return `<a class="btn btn-cta ${cls || ""}" href="${esc(wa)}" target="_blank" rel="noopener">${ICONS.whatsapp}<span>${esc(label || u.wa)}</span></a>`;
    if (em) return `<a class="btn btn-cta ${cls || ""}" href="mailto:${esc(em)}">${ICONS.email}<span>${esc(label || u.noWa)}</span></a>`;
    return `<a class="btn btn-cta ${cls || ""}" href="${PAGES.contacto}"><span>${esc(label || u.ctaBtn)}</span></a>`;
  };

  /* ---------- marcos de capturas ---------- */
  const isPortrait = url => (ratios[url] || 0) > 1.15;
  const shot = (p, opts) => {
    const img = src(p.image), title = t(p.title), demo = safeUrl(p.demo), o = opts || {};
    const alt = (lang === "es" ? "Captura de " : "Screenshot of ") + title;
    const media = img ? `<img src="${esc(img)}" alt="${esc(alt)}" loading="${o.eager ? "eager" : "lazy"}" decoding="async" onerror="this.remove()">` : "";
    const fallback = `<span class="shot-initials" aria-hidden="true">${esc(initials(title))}</span>`;
    if (img && isPortrait(img)) return `<figure class="device phone ${o.cls || ""}"><div class="phone-screen">${fallback}${media}</div></figure>`;
    return `<figure class="device browser ${o.cls || ""}">
      <div class="browser-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host(demo) || title)}</span></div>
      <div class="browser-screen"${img && ratios[img] ? ` style="--r:${Math.max(.42, Math.min(.75, ratios[img])).toFixed(3)}"` : ""}>${fallback}${media}</div></figure>`;
  };

  /* ---------- piezas compartidas ---------- */
  const header = () => {
    const u = ui(), dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    const tools = `<button class="icon-btn" type="button" data-lang aria-label="${esc(u.langSwitch)}"><span class="lang-code">${lang === "es" ? "EN" : "ES"}</span></button>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="${esc(dark ? u.themeLight : u.themeDark)}">${dark ? ICONS.sun : ICONS.moon}</button>`;
    const links = ORDER.filter(on).map(k => `<li><a href="${PAGES[k]}"${k === page ? ' aria-current="page"' : ""}>${esc(u.nav[k])}</a></li>`).join("");
    return `<header class="site-header" id="header">
  <div class="wrap header-row">
    <a class="brand" href="${PAGES.inicio}" aria-label="${esc(state.name)}, ${esc(u.nav.inicio)}">
      <span class="brand-mark" aria-hidden="true">${esc(initials(state.name))}</span>
      <span class="brand-name">${esc(state.name)}</span>
    </a>
    <nav class="nav" id="nav" aria-label="${esc(u.sections)}">
      <ul>${links}</ul>
      <a class="btn btn-cta btn-sm nav-cta" href="${PAGES.contacto}"${page === "contacto" ? ' aria-current="page"' : ""}>${esc(u.nav.contacto)}</a>
      <div class="nav-tools">${tools}</div>
    </nav>
    <div class="header-tools">
      <div class="desk-tools">${tools}</div>
      <a class="btn btn-cta btn-sm mobile-cta" href="${PAGES.contacto}"${page === "contacto" ? ' aria-current="page"' : ""}>${esc(u.nav.contacto)}</a>
      <button class="icon-btn menu-btn" type="button" data-menu aria-expanded="false" aria-controls="nav" aria-label="${esc(u.menu)}">${ICONS.menu}</button>
    </div>
  </div>
</header>`;
  };
  const pageHead = (title, lead) => `<header class="page-head wrap"><h1>${esc(title)}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ""}</header>`;
  const ctaBand = () => {
    if (page === "contacto") return "";
    const u = ui();
    return `<section class="cta-band" aria-labelledby="cta-title"><div class="wrap cta-inner">
      <h2 id="cta-title">${esc(u.ctaTitle)}</h2>
      <div class="cta-actions">${primaryCta()}</div>
    </div></section>`;
  };
  const socials = cls => state.socials.filter(s => socialUrl(s)).length ? `<ul class="socials ${cls || ""}">${state.socials.filter(s => socialUrl(s)).map(s => {
    const url = socialUrl(s), lbl = LABELS[s.type] || "Web";
    return `<li><a href="${esc(url)}" aria-label="${lbl}"${/^mailto:/i.test(url) ? "" : ' target="_blank" rel="noopener"'}>${ICONS[s.type] || ICONS.web}</a></li>`;
  }).join("")}</ul>` : "";
  const footer = () => {
    const list = socials();
    return list ? `<footer class="site-footer"><div class="wrap footer-row">${list}</div></footer>` : "";
  };

  /* ---------- vistas ---------- */
  const withImage = () => state.projects.filter(p => src(p.image));
  const views = {
    inicio() {
      const u = ui(), shots = withImage();
      const wide = shots.find(p => !isPortrait(src(p.image))), tall = shots.filter(p => p !== wide).slice(0, 2);
      const collage = shots.length ? `<div class="collage" aria-hidden="false">
          ${wide ? shot(wide, { cls: "c-wide", eager: true }) : ""}
          ${tall.map((p, i) => shot(p, { cls: "c-tall c-tall-" + (i + 1), eager: true })).join("")}
        </div>` : "";
      return `
<section class="hero wrap">
  <div class="hero-copy">
    <p class="hero-who"><span class="avatar">${src(state.photos.profile) ? `<img src="${esc(src(state.photos.profile))}" alt="" onerror="this.remove()">` : ""}</span><span><strong>${esc(state.name)}</strong><span>${esc(t(state.role))}</span></span></p>
    <h1>${esc(u.heroTitle)}</h1>
    <p class="lead">${esc(u.heroLead)}</p>
    <div class="hero-actions">${primaryCta()}${on("proyectos") ? `<a class="btn btn-ghost" href="${PAGES.proyectos}">${esc(u.seeWork)}</a>` : ""}</div>
  </div>
  ${collage}
</section>
<section class="block wrap" aria-labelledby="svc-title">
  <h2 id="svc-title" class="block-title">${esc(u.servicesTitle)}</h2>
  <ul class="services">${u.services.map(s => `<li><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join("")}</ul>
</section>
${on("proyectos") && state.projects.length ? `<section class="block wrap" aria-labelledby="work-title">
  <div class="block-head"><h2 id="work-title" class="block-title">${esc(u.workTitle)}</h2><a class="text-link" href="${PAGES.proyectos}">${esc(u.allWork)}</a></div>
  <ul class="work-list">${state.projects.map(p => `<li>
    <a href="${PAGES.proyectos}#${slug(p)}"><h3>${esc(t(p.title))}</h3><p>${esc(t(p.desc))}</p>${ICONS.arrow}</a>
  </li>`).join("")}</ul>
</section>` : ""}
<section class="block wrap" aria-labelledby="proc-title">
  <h2 id="proc-title" class="block-title">${esc(u.processTitle)}</h2>
  <ol class="process">${u.process.map(s => `<li><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join("")}</ol>
</section>`;
    },

    sobre() {
      const u = ui(), hello = t(state.hello), about = tOnly(state.about), soft = state.skills.soft.items;
      const pic = src(state.photos.about) || src(state.photos.profile);
      return `${pageHead(u.aboutTitle)}
<section class="wrap about">
  <div class="about-text">${hello ? paras(hello) : ""}${about ? paras(about) : ""}${!hello && !about ? `<p class="muted">${esc(u.empty)}</p>` : ""}
  </div>
  ${pic ? `<figure class="about-photo"><img src="${esc(pic)}" alt="${esc(state.name)}" onerror="this.closest('figure').remove()"></figure>` : ""}
</section>
${soft.length ? `<section class="block wrap" aria-labelledby="traits-title">
  <h2 id="traits-title" class="block-title">${esc(u.traits)}</h2>
  <ul class="traits">${soft.map(s => `<li>${ICONS.check}<span><strong>${esc(t(s.n))}</strong>${t(s.note) ? `<small>${esc(t(s.note))}</small>` : ""}</span></li>`).join("")}</ul>
</section>` : ""}`;
    },

    proyectos() {
      const u = ui();
      return `${pageHead(u.projectsTitle, u.projectsLead)}
<section class="wrap cases">${state.projects.length ? state.projects.map((p, i) => {
        const demo = safeUrl(p.demo), repo = safeUrl(p.repo);
        const stack = (p.stack || "").split(",").map(x => x.trim()).filter(Boolean);
        return `<article class="case${i % 2 ? " flip" : ""}" id="${slug(p)}">
    <div class="case-media">${shot(p)}</div>
    <div class="case-body">
      ${demo ? `<p class="case-live"><span class="dot" aria-hidden="true"></span><span>${esc(u.live)}</span></p>` : ""}
      <h2>${esc(t(p.title))}</h2>
      ${t(p.desc) ? `<p class="case-desc">${esc(t(p.desc))}</p>` : ""}
      ${stack.length ? `<h3 class="case-label">${esc(u.built)}</h3><ul class="tags">${stack.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      ${demo || repo ? `<div class="case-links">${demo ? `<a class="btn btn-primary" href="${esc(demo)}" target="_blank" rel="noopener">${esc(u.demo)}${ICONS.out}</a>` : ""}${repo ? `<a class="btn btn-ghost" href="${esc(repo)}" target="_blank" rel="noopener">${ICONS.github}${esc(u.repo)}</a>` : ""}</div>` : ""}
    </div>
  </article>`;
      }).join("") : `<p class="muted">${esc(u.empty)}</p>`}</section>`;
    },

    habilidades() {
      const u = ui(), S = state.skills;
      const group = k => {
        const G = S[k]; if (!G.items.length) return "";
        return `<section class="skill-group" aria-labelledby="sg-${k}"><h2 id="sg-${k}" class="block-title">${esc(t(G.title))}</h2>
          <ul class="skill-list">${G.items.map(s => {
          const lvl = Math.max(1, Math.min(4, Number(s.lvl) || 1)), y = Number(s.years), lv = u.levels[lvl - 1] || "";
          const meta = `<span>${esc(lv)}</span>${y ? `<span>${y} ${y === 1 ? u.yearOne : u.yearMany}</span>` : ""}`;
          return `<li class="skill"><div class="skill-top"><strong>${esc(t(s.n))}</strong><span class="skill-meta">${meta}</span></div>
            <div class="meter" role="meter" aria-valuenow="${lvl}" aria-valuemin="1" aria-valuemax="4" aria-label="${esc(t(s.n))}: ${esc(lv)}">${[1, 2, 3, 4].map(n => `<i${n <= lvl ? ' class="on"' : ""}></i>`).join("")}</div>
            ${t(s.note) ? `<p class="skill-note">${esc(t(s.note))}</p>` : ""}</li>`;
        }).join("")}</ul></section>`;
      };
      return `${pageHead(u.skillsTitle, u.skillsLead)}
<div class="wrap skills">${group("tech")}${group("tools")}</div>
`;
    },

    experiencia() {
      const u = ui(), items = state.experience.filter(e => t(e.role) || t(e.desc));
      return `${pageHead(u.expTitle, u.expLead)}
<section class="wrap">${items.length ? `<ol class="timeline">${items.map(e => `<li>
  <p class="tl-period">${esc(t(e.period))}</p>
  <div class="tl-body"><h2>${esc(t(e.role))}</h2>${t(e.place) ? `<p class="tl-place">${esc(t(e.place))}</p>` : ""}${t(e.desc) ? `<p>${esc(t(e.desc))}</p>` : ""}</div>
</li>`).join("")}</ol>` : `<p class="muted">${esc(u.empty)}</p>`}</section>`;
    },

    contacto() {
      const u = ui(), em = email(), cv = src(state.contact.cv), wa = waLink(), txt = t(state.contact.text);
      return `<section class="wrap contact">
  <div class="contact-main">
    <h1>${esc(u.contactTitle)}</h1>
    ${txt ? `<p class="lead">${esc(txt)}</p>` : ""}
    <div class="contact-actions">${primaryCta(null, "btn-lg")}</div>
    ${em ? `<div class="email-row">${wa ? `<p class="contact-alt">${esc(u.contactAlt)}</p>` : ""}
      <a class="email-link" href="mailto:${esc(em)}">${ICONS.email}<span>${esc(em)}</span></a>
      <button class="btn btn-ghost btn-sm" type="button" data-copy>${ICONS.copy}<span>${esc(u.copy)}</span></button>
      <span class="visually-hidden" role="status" aria-live="polite" data-copy-status></span>
    </div>` : ""}
    ${cv ? `<ul class="contact-more"><li><a href="${esc(cv)}" download="${esc(state.contact.cvName || "CV.pdf")}">${ICONS.down}<span>${esc(u.cv)}</span></a></li></ul>` : ""}
  </div>
  <aside class="brief" aria-labelledby="brief-title">
    <h2 id="brief-title">${esc(u.brief)}</h2>
    <ol>${u.briefItems.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
  </aside>
</section>`;
    }
  };
  const slug = p => "p-" + (t(p.title) || "proyecto").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  /* ---------- render ---------- */
  function render() {
    const u = ui();
    document.documentElement.lang = lang;
    const navName = page === "inicio" ? "" : u.nav[page];
    document.title = [navName, state.name].filter(Boolean).join(" · ") || document.title;
    const md = document.querySelector('meta[name="description"]');
    if (md && t(state.share)) md.setAttribute("content", t(state.share));
    const skip = document.querySelector(".skip");
    if (skip) skip.textContent = lang === "es" ? "Saltar al contenido" : "Skip to content";
    document.getElementById("root").innerHTML = `${header()}<main id="main" class="page page-${page}">${views[page]()}</main>${ctaBand()}${footer()}`;
    wire();
  }

  /* ---------- comportamiento ---------- */
  function wire() {
    const head = document.getElementById("header");
    head.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => {
      lang = lang === "es" ? "en" : "es";
      try { localStorage.setItem("lang", lang); } catch (e) {}
      render();
    }));
    head.querySelectorAll("[data-theme-toggle]").forEach(b => b.addEventListener("click", () => {
      const root = document.documentElement;
      const isDark = root.dataset.theme === "dark" || (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
      root.dataset.theme = isDark ? "light" : "dark";
      try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
      render();
      const again = [...document.querySelectorAll("[data-theme-toggle]")].find(x => x.offsetParent);
      if (again) again.focus();
    }));
    const menuBtn = head.querySelector("[data-menu]"), nav = document.getElementById("nav");
    const setMenu = open => {
      head.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? ui().close : ui().menu);
      menuBtn.innerHTML = open ? ICONS.x2 : ICONS.menu;
    };
    menuBtn.addEventListener("click", () => setMenu(!head.classList.contains("menu-open")));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && head.classList.contains("menu-open")) { setMenu(false); menuBtn.focus(); } });
    nav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });

    const copyBtn = document.querySelector("[data-copy]");
    if (copyBtn) copyBtn.addEventListener("click", async () => {
      const label = copyBtn.querySelector("span"), status = document.querySelector("[data-copy-status]");
      try { await navigator.clipboard.writeText(email()); label.textContent = ui().copied; if (status) status.textContent = ui().copied; }
      catch (e) { const r = document.createRange(); r.selectNodeContents(document.querySelector(".email-link span")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      setTimeout(() => { label.textContent = ui().copy; if (status) status.textContent = ""; }, 2000);
    });
    onScroll();
  }
  const onScroll = () => { const h = document.getElementById("header"); if (h) h.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (!document.documentElement.dataset.theme) render(); });

  /* Mide la proporción de las capturas para elegir marco de teléfono o de navegador. */
  const measure = () => Promise.all(state.projects.map(p => src(p.image)).filter(Boolean).map(url => new Promise(res => {
    if (ratios[url]) return res();
    const im = new Image();
    const done = () => { if (im.naturalWidth) ratios[url] = im.naturalHeight / im.naturalWidth; res(); };
    im.onload = done; im.onerror = () => res(); im.src = url;
    setTimeout(res, 2500);
  })));

  /* ---------- arranque ---------- */
  const preview = /[?&]preview=1/.test(location.search) && window.parent !== window;
  const boot = data => {
    state = normalize(data);
    measure().then(() => {
      render();
      const h = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (h) h.scrollIntoView();
      document.documentElement.classList.add("ready");
    });
  };
  if (preview) {
    window.addEventListener("message", e => {
      if (e.source !== window.parent || !e.data || e.data.type !== "portfolio-state") return;
      assetMap = e.data.assets || {};
      if (e.data.lang && e.data.lang !== lang) lang = e.data.lang;
      const y = window.scrollY;
      state = normalize(e.data.state);
      measure().then(() => { render(); window.scrollTo(0, y); document.documentElement.classList.add("ready"); });
    });
    window.parent.postMessage({ type: "portfolio-ready" }, "*");
  } else {
    // contenido.js se carga sin caché para mostrar siempre la última versión publicada
    const sc = document.createElement("script");
    sc.src = "contenido.js?v=" + Date.now();
    sc.onload = () => boot(window.SITE);
    sc.onerror = () => boot({});
    document.head.appendChild(sc);
  }
})();
