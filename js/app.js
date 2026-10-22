/* Portafolio · renderizador. El contenido vive en contenido.js (lo genera admin.html). */
(() => {
  "use strict";
  const SECTIONS = ["inicio", "sobre", "proyectos", "habilidades", "experiencia", "contacto"];
  const IDS = { inicio: "inicio", sobre: "sobre-mi", proyectos: "proyectos", habilidades: "habilidades", experiencia: "experiencia", contacto: "contacto" };
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
      es: { nav: { inicio: "Inicio", sobre: "Sobre mí", proyectos: "Proyectos", habilidades: "Habilidades", experiencia: "Experiencia", contacto: "Contacto" },
            levels: ["Básico", "Intermedio", "Avanzado", "Experto"], yearOne: "año", yearMany: "años",
            demo: "Ver demo", repo: "Código", mail: "Escribir correo", copy: "Copiar correo", copied: "Copiado", cv: "Descargar CV",
            tapHint: "Pasa el cursor o toca una habilidad para ver más." },
      en: { nav: { inicio: "Home", sobre: "About", proyectos: "Projects", habilidades: "Skills", experiencia: "Experience", contacto: "Contact" },
            levels: ["Beginner", "Intermediate", "Advanced", "Expert"], yearOne: "year", yearMany: "years",
            demo: "Live demo", repo: "Code", mail: "Send email", copy: "Copy email", copied: "Copied", cv: "Download CV",
            tapHint: "Hover or tap a skill to see more." }
    },
    palettes: {
      inicio:      { bg: "#ffffff", panel: "#333333", ink: "#333333", soft: "#bababa", on: "#ffffff" },
      sobre:       { bg: "#f2f5f0", panel: "#2f5d45", ink: "#22382b", soft: "#c9d9cd", on: "#ffffff" },
      proyectos:   { bg: "#fbf7ec", panel: "#8f6410", ink: "#3d2c0b", soft: "#ecdcb5", on: "#ffffff" },
      habilidades: { bg: "#f1f4f9", panel: "#2b4c7e", ink: "#1e2f4a", soft: "#c8d3e4", on: "#ffffff" },
      experiencia: { bg: "#f8f2f3", panel: "#7a3346", ink: "#43202b", soft: "#e4cdd3", on: "#ffffff" },
      contacto:    { bg: "#1e2630", panel: "#f0b941", ink: "#eef1f4", soft: "#33404d", on: "#1e2630" }
    }
  };
  const merge = (base, over) => {
    if (Array.isArray(base)) return Array.isArray(over) ? over : base;
    if (base && typeof base === "object") {
      if (over && typeof over === "object" && !Array.isArray(over)) {
        const out = {};
        for (const k of new Set([...Object.keys(base), ...Object.keys(over)])) out[k] = k in base ? merge(base[k], over[k]) : over[k];
        return out;
      }
      return base;
    }
    return over === undefined || over === null ? base : over;
  };
  const normalize = raw => {
    const s = JSON.parse(JSON.stringify(raw || {}));
    if (s.links && !s.socials) s.socials = Object.keys(s.links).map(type => ({ type, url: s.links[type] || "" }));
    delete s.links;
    return merge(BASE, s);
  };

  let state = normalize({}), assetMap = {};
  let lang = "es";
  try { lang = localStorage.getItem("lang") || ""; } catch (e) {}
  if (lang !== "es" && lang !== "en") lang = (navigator.language || "es").toLowerCase().startsWith("en") ? "en" : "es";
  const t = f => (f && typeof f === "object") ? (f[lang] || f.es || "") : (f || "");
  const ui = () => merge(BASE.ui[lang], (state.ui || {})[lang]);

  /* ---------- color ---------- */
  const hex = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); const n = m ? parseInt(m[1], 16) : 0; return [n >> 16, (n >> 8) & 255, n & 255]; };
  const toHex = rgb => "#" + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, k) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * k)); };
  const lum = h => { const [r, g, b] = hex(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const darkOf = p => {
    if (lum(p.bg) < .2) return { bg: p.bg, ink: p.ink, panel: p.panel, soft: p.soft, on: p.on, fill: p.panel };
    const bg = mix(p.panel, "#0f0f0f", .84);
    return { bg, ink: mix(p.bg, "#ffffff", .25), panel: mix(p.panel, "#ffffff", .08), soft: mix(p.soft, bg, .72), on: p.on, fill: mix(p.panel, "#ffffff", .5) };
  };
  const palVars = p => {
    const d = darkOf(p);
    return [`--bg-l:${p.bg}`, `--ink-l:${p.ink}`, `--panel-l:${p.panel}`, `--soft-l:${p.soft}`, `--on-l:${p.on}`, `--fill-l:${p.panel}`,
      `--bg-d:${d.bg}`, `--ink-d:${d.ink}`, `--panel-d:${d.panel}`, `--soft-d:${d.soft}`, `--on-d:${d.on}`, `--fill-d:${d.fill}`].join(";");
  };

  /* ---------- helpers ---------- */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = u => (u && !/^\s*(javascript|vbscript|data:text)/i.test(u)) ? u : "";
  const src = u => assetMap[u] || safeUrl(u);
  const initials = n => (n || "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const photo = (u, alt) => `<div class="photo"><span class="initials" aria-hidden="true">${esc(initials(state.name))}</span>${src(u) ? `<img src="${esc(src(u))}" alt="${esc(alt)}" onerror="this.remove()">` : ""}</div>`;
  const svg = (d, fill) => `<svg viewBox="0 0 24 24" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${d}</svg>`;
  const ICONS = {
    whatsapp: svg('<path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>'),
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
    down: svg('<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>')
  };
  const LABELS = { whatsapp: "WhatsApp", github: "GitHub", instagram: "Instagram", linkedin: "LinkedIn", facebook: "Facebook", x: "X", youtube: "YouTube", tiktok: "TikTok", web: "Web", email: "Email" };
  const socials = () => state.socials.length ? `<div class="socials">${state.socials.map(s => {
    let url = safeUrl(s.url);
    if (s.type === "email" && url && !/^mailto:/i.test(url)) url = "mailto:" + url;
    return `<a href="${esc(url || "#")}" aria-label="${LABELS[s.type] || "Web"}"${url ? ' target="_blank" rel="noopener"' : ""}>${ICONS[s.type] || ICONS.web}</a>`;
  }).join("")}</div>` : "";

  const skillItem = s => {
    const u = ui(), lvl = Math.max(1, Math.min(4, Number(s.lvl) || 1));
    const y = Number(s.years);
    const bits = [y ? `${y} ${y === 1 ? u.yearOne : u.yearMany}` : "", t(s.note)].filter(Boolean);
    const lvName = u.levels[lvl - 1] || "";
    return `<li><button type="button" class="skill${bits.length ? " has-detail" : ""}" aria-expanded="false">
      <span class="skill-row"><span class="skill-name">${esc(t(s.n))}</span><span class="skill-lvl">${esc(lvName)}</span></span>
      <span class="meter" role="meter" aria-valuenow="${lvl}" aria-valuemin="1" aria-valuemax="4" aria-label="${esc(t(s.n))}: ${esc(lvName)}">${[1, 2, 3, 4].map(k => `<i class="${k <= lvl ? "on" : ""}" style="--k:${k}"></i>`).join("")}</span>
      <span class="skill-detail"><span>${bits.length ? `<p>${esc(bits.join(" · "))}</p>` : ""}</span></span>
    </button></li>`;
  };
  const project = p => {
    const img = src(p.image), demo = safeUrl(p.demo), repo = safeUrl(p.repo), u = ui();
    const stack = (p.stack || "").split(",").map(x => x.trim()).filter(Boolean);
    return `<article class="project">
      <div class="project-media"><span class="mono" aria-hidden="true">${esc(initials(t(p.title)))}</span>${img ? `<img src="${esc(img)}" alt="${esc(t(p.title))}" onerror="this.remove()">` : ""}</div>
      <div class="project-body">
        <h3>${esc(t(p.title))}</h3>
        ${t(p.desc) ? `<p>${esc(t(p.desc))}</p>` : ""}
        ${stack.length ? `<ul class="stack">${stack.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        ${demo || repo ? `<div class="project-links">${demo ? `<a class="chip-link solid" href="${esc(demo)}" target="_blank" rel="noopener">${esc(u.demo)}</a>` : ""}${repo ? `<a class="chip-link" href="${esc(repo)}" target="_blank" rel="noopener">${esc(u.repo)}</a>` : ""}</div>` : ""}
      </div>
    </article>`;
  };
  const skillGroup = (g, cls) => {
    const G = state.skills[g];
    return G.items.length ? `<div class="${cls || ""}"><h2 class="uline">${esc(t(G.title))}</h2><ul>${G.items.map(skillItem).join("")}</ul></div>` : "";
  };

  /* ---------- render ---------- */
  let skillsShown = false;
  const on = k => k === "inicio" || state.sections[k] !== false;
  function render() {
    const P = state.palettes, u = ui();
    document.documentElement.lang = lang;
    document.title = [state.name, t(state.brand)].filter(Boolean).join(" · ");
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", t(state.share));
    document.body.style.setProperty("--body-bg", P.contacto.bg);
    document.body.style.setProperty("--body-bg-d", darkOf(P.contacto).bg);
    const S = state.skills, email = (state.contact.email || "").trim(), cv = src(state.contact.cv);
    const soft = S.soft.items;
    document.getElementById("root").innerHTML = `
<header class="site-header pal" id="header" style="${palVars(P.inicio)}">
  <a class="brand-tab" href="#inicio">${esc(state.name)}</a>
  <nav class="nav" aria-label="${lang === "es" ? "Secciones" : "Sections"}">
    ${SECTIONS.filter(on).map(k => `<a href="#${IDS[k]}" data-sec="${k}">${esc(u.nav[k])}</a>`).join("")}
    <button class="lang-btn" type="button" data-lang aria-label="${lang === "es" ? "View in English" : "Ver en español"}">${lang === "es" ? "EN" : "ES"}</button>
  </nav>
</header>
<main>
  <section class="hero pal" id="inicio" data-pal="inicio" style="${palVars(P.inicio)}">
    <div class="hero-col"><h1>${esc(t(state.brand))}</h1></div>
    <div class="portrait"><div class="portrait-inner">${photo(state.photos.profile, state.name)}</div></div>
    <div class="hero-text"><div class="block">
      <h2 class="hero-name uline">${esc(state.name)}</h2>
      <p class="hero-role">${esc(t(state.role))}</p>
      ${socials()}
    </div></div>
  </section>
  ${on("sobre") ? `<section class="section pal" id="sobre-mi" data-pal="sobre" style="${palVars(P.sobre)}">
    <div class="about">
      <div>
        <h2 class="section-title uline">${esc(u.nav.sobre)}</h2>
        <p class="about-hello">${esc(t(state.hello)).replace(/\n/g, "<br>")}</p>
        <p class="about-body">${esc(t(state.about))}</p>
      </div>
      <div class="about-photo">${photo(state.photos.about, state.name)}</div>
    </div>
  </section>` : ""}
  ${on("proyectos") ? `<section class="section pal" id="proyectos" data-pal="proyectos" style="${palVars(P.proyectos)}">
    <div class="projects-head"><h2 class="section-title uline">${esc(u.nav.proyectos)}</h2></div>
    <div class="projects">${state.projects.map(project).join("")}</div>
  </section>` : ""}
  ${on("habilidades") ? `<section class="section pal" id="habilidades" data-pal="habilidades" style="${palVars(P.habilidades)}">
    <div class="skills${skillsShown ? " in" : ""}" id="skills">
      ${skillGroup("tech")}${skillGroup("tools")}
      ${soft.length ? `<div class="soft"><h2 class="uline">${esc(t(S.soft.title))}</h2>
        <div class="soft-chips">${soft.map((s, i) => `<button type="button" class="soft-chip" data-i="${i}" aria-pressed="false">${esc(t(s.n))}</button>`).join("")}</div>
        <p class="soft-note" aria-live="polite">${soft.some(s => t(s.note)) ? esc(u.tapHint) : ""}</p>
      </div>` : ""}
    </div>
  </section>` : ""}
  ${on("experiencia") ? `<section class="section pal" id="experiencia" data-pal="experiencia" style="${palVars(P.experiencia)}">
    <div class="exp">
      <h2 class="section-title"><span class="uline">${esc(u.nav.experiencia)}</span></h2>
      <ol class="timeline">${state.experience.filter(e => t(e.role) || t(e.desc)).map(e => `<li class="tl-item">
        ${t(e.period) ? `<span class="tl-period">${esc(t(e.period))}</span>` : ""}
        <h3 class="tl-role">${esc(t(e.role))}</h3>
        ${t(e.place) ? `<span class="tl-place">${esc(t(e.place))}</span>` : ""}
        ${t(e.desc) ? `<p class="tl-desc">${esc(t(e.desc))}</p>` : ""}
      </li>`).join("")}</ol>
    </div>
  </section>` : ""}
  <section class="section pal" id="contacto" data-pal="contacto" style="${palVars(P.contacto)}">
    <div class="contact">
      ${on("contacto") ? `<h2 class="section-title uline">${esc(u.nav.contacto)}</h2>
      ${t(state.contact.text) ? `<p class="contact-text">${esc(t(state.contact.text))}</p>` : ""}
      ${email ? `<a class="contact-email" href="mailto:${esc(email)}" target="_blank" rel="noopener">${esc(email)}</a>` : ""}
      <div class="contact-actions">
        ${email ? `<a class="btn-c solid" href="mailto:${esc(email)}" target="_blank" rel="noopener">${ICONS.email}${esc(u.mail)}</a><button class="btn-c" type="button" data-copy>${ICONS.copy}<span>${esc(u.copy)}</span></button>` : ""}
        ${cv ? `<a class="btn-c${email ? "" : " solid"}" href="${esc(cv)}" download="${esc(state.contact.cvName || "CV.pdf")}">${ICONS.down}${esc(u.cv)}</a>` : ""}
      </div>
      ${socials()}` : ""}
      <footer class="site-footer">${esc(t(state.footer))}</footer>
    </div>
  </section>
</main>`;
    wire();
  }

  /* ---------- behaviour ---------- */
  let observers = [], currentKey = "inicio";
  function wire() {
    observers.forEach(o => o.disconnect()); observers = [];
    const header = document.getElementById("header");
    const links = header.querySelectorAll(".nav a");
    if (!document.querySelector(`[data-pal="${currentKey}"]`)) currentKey = "inicio";
    const setActive = key => {
      links.forEach(l => l.setAttribute("aria-current", l.dataset.sec === key ? "true" : "false"));
      header.setAttribute("style", palVars(state.palettes[key]));
      header.classList.toggle("show-tab", key !== "inicio");
    };
    setActive(currentKey);
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { currentKey = e.target.dataset.pal; setActive(currentKey); } });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("[data-pal]").forEach(s => io.observe(s));
    observers.push(io);

    header.querySelector("[data-lang]").addEventListener("click", () => {
      lang = lang === "es" ? "en" : "es";
      try { localStorage.setItem("lang", lang); } catch (e) {}
      render();
    });

    const skills = document.getElementById("skills");
    if (skills) {
      if (!skillsShown) {
        const so = new IntersectionObserver((entries, obs) => {
          if (entries[0].isIntersecting) { skills.classList.add("in"); skillsShown = true; obs.disconnect(); }
        }, { threshold: .2 });
        so.observe(skills); observers.push(so);
      }
      skills.querySelectorAll(".skill").forEach(btn => {
        btn.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") activateSkill(btn); });
        btn.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") activateSkill(null); });
        btn.addEventListener("focus", () => activateSkill(btn));
        btn.addEventListener("click", () => activateSkill(btn));
      });
      skills.addEventListener("focusout", e => { if (!skills.contains(e.relatedTarget)) { activateSkill(null); activateChip(null); } });
      skills.querySelectorAll(".soft-chip").forEach(c => {
        c.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") activateChip(c); });
        c.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") activateChip(null); });
        c.addEventListener("focus", () => activateChip(c));
        c.addEventListener("click", () => activateChip(c));
      });
    }
    const copyBtn = document.querySelector("[data-copy]");
    if (copyBtn) copyBtn.addEventListener("click", async () => {
      const label = copyBtn.querySelector("span");
      try { await navigator.clipboard.writeText(state.contact.email.trim()); label.textContent = ui().copied; }
      catch (e) { const r = document.createRange(); r.selectNodeContents(document.querySelector(".contact-email")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      setTimeout(() => { label.textContent = ui().copy; }, 1800);
    });
  }
  const activateSkill = btn => {
    document.querySelectorAll(".skill.active").forEach(b => { if (b !== btn) { b.classList.remove("active"); b.setAttribute("aria-expanded", "false"); } });
    document.querySelectorAll(".skills ul").forEach(u => u.classList.toggle("dim", !!btn && u.contains(btn)));
    if (btn) { btn.classList.add("active"); btn.setAttribute("aria-expanded", "true"); }
  };
  const activateChip = c => {
    document.querySelectorAll(".soft-chip.active").forEach(x => { if (x !== c) { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); } });
    const note = document.querySelector(".soft-note"), items = state.skills.soft.items;
    if (c) { c.classList.add("active"); c.setAttribute("aria-pressed", "true"); if (note) note.textContent = t(items[+c.dataset.i].note); }
    else if (note) note.textContent = items.some(s => t(s.note)) ? ui().tapHint : "";
  };
  document.addEventListener("pointerdown", e => {
    if (e.target.closest && e.target.closest(".skill, .soft-chip")) return;
    activateSkill(null); activateChip(null);
  });
  const onScroll = () => { const h = document.getElementById("header"); if (h) h.classList.toggle("compact", window.scrollY > window.innerHeight * 1.2); };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- arranque ---------- */
  const preview = /[?&]preview=1/.test(location.search) && window.parent !== window;
  const boot = data => { state = normalize(data); render(); onScroll(); };
  if (preview) {
    window.addEventListener("message", e => {
      if (e.source !== window.parent || !e.data || e.data.type !== "portfolio-state") return;
      assetMap = e.data.assets || {};
      if (e.data.lang && e.data.lang !== lang) lang = e.data.lang;
      const y = window.scrollY; boot(e.data.state); window.scrollTo(0, y);
    });
    window.parent.postMessage({ type: "portfolio-ready" }, "*");
  }
  else {
    // contenido.js se carga sin caché para mostrar siempre la última versión publicada
    const sc = document.createElement("script");
    sc.src = "contenido.js?v=" + Date.now();
    sc.onload = () => boot(window.SITE);
    sc.onerror = () => boot({});
    document.head.appendChild(sc);
  }
})();
