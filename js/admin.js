/* Panel de administración del portafolio.
   Guarda los cambios en tu repositorio de GitHub mediante la API de GitHub.
   Acceso: un token personal de GitHub con permiso de escritura SOLO sobre este repositorio. */
(() => {
  "use strict";
  const API = "https://api.github.com";
  const CONTENT_PATH = "contenido.js";
  const app = document.getElementById("app");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const L = (es, en) => ({ es: es || "", en: en || "" });

  /* ---------- sesión ---------- */
  const store = {
    get(k) { try { return sessionStorage.getItem(k) || localStorage.getItem(k) || ""; } catch (e) { return ""; } },
    set(k, v, remember) { try { (remember ? localStorage : sessionStorage).setItem(k, v); } catch (e) {} },
    clear(k) { try { sessionStorage.removeItem(k); localStorage.removeItem(k); } catch (e) {} }
  };
  const guessRepo = () => {
    const h = location.hostname, m = /^([^.]+)\.github\.io$/i.exec(h);
    if (!m) return { owner: "", repo: "" };
    const seg = location.pathname.split("/").filter(Boolean)[0];
    return { owner: m[1], repo: seg && !/\.html$/i.test(seg) ? seg : `${m[1]}.github.io` };
  };
  let session = null; // {owner, repo, token, branch}

  async function gh(path, opts = {}) {
    const res = await fetch(API + path, {
      ...opts,
      headers: { "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Authorization": `Bearer ${session.token}`, ...(opts.body ? { "Content-Type": "application/json" } : {}) },
      cache: "no-store"
    });
    if (!res.ok) { const err = new Error("HTTP " + res.status); err.status = res.status; try { err.body = await res.json(); } catch (e) {} throw err; }
    return res.status === 204 ? null : res.json();
  }
  const enc = str => { const bytes = new TextEncoder().encode(str); let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(bin); };
  const dec = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), c => c.charCodeAt(0)));
  const blobToB64 = blob => new Promise((r, j) => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(",")[1]); fr.onerror = j; fr.readAsDataURL(blob); });
  const blobToDataUrl = blob => new Promise((r, j) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.onerror = j; fr.readAsDataURL(blob); });

  /* ---------- login ---------- */
  function showLogin(msg) {
    const g = guessRepo();
    const owner = store.get("gh-owner") || g.owner, repo = store.get("gh-repo") || g.repo;
    app.innerHTML = `<div class="login"><form class="login-card" autocomplete="off">
      <h1>Administrar portafolio</h1>
      <p class="sub">Entra con tu token de GitHub para editar y publicar.</p>
      ${msg ? `<p class="err" role="alert">${esc(msg)}</p>` : ""}
      <div class="field"><label for="o">Usuario de GitHub</label><input id="o" type="text" value="${esc(owner)}" required autocapitalize="off" spellcheck="false"></div>
      <div class="field"><label for="r">Repositorio</label><input id="r" type="text" value="${esc(repo)}" required autocapitalize="off" spellcheck="false" placeholder="usuario.github.io"></div>
      <div class="field"><label for="tk">Token de acceso</label><input id="tk" type="password" required autocapitalize="off" spellcheck="false" placeholder="github_pat_…"></div>
      <label class="check"><input id="rem" type="checkbox"> Recordar en este dispositivo</label>
      <button class="btn primary" type="submit" style="width:100%">Entrar</button>
      <details class="help"><summary>¿Cómo creo el token?</summary><ol>
        <li>En GitHub abre Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.</li>
        <li>En <em>Repository access</em> elige <em>Only select repositories</em> y marca solo el repositorio del portafolio.</li>
        <li>En <em>Permissions → Repository permissions</em> pon <em>Contents</em> en <em>Read and write</em>.</li>
        <li>Genera el token, cópialo y pégalo aquí. Guárdalo en un lugar seguro: GitHub no lo vuelve a mostrar.</li>
      </ol></details>
    </form></div>`;
    const f = app.querySelector("form");
    f.addEventListener("submit", async e => {
      e.preventDefault();
      const btn = f.querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Verificando…";
      const o = f.querySelector("#o").value.trim(), r = f.querySelector("#r").value.trim(), tk = f.querySelector("#tk").value.trim(), rem = f.querySelector("#rem").checked;
      try { await login(o, r, tk); store.set("gh-owner", o, true); store.set("gh-repo", r, true); store.set("gh-token", tk, rem); }
      catch (err) { showLogin(err.message); }
    });
  }
  async function login(owner, repo, token) {
    session = { owner, repo, token, branch: "main" };
    let info;
    try { info = await gh(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`); }
    catch (err) {
      session = null;
      if (err.status === 401) throw new Error("El token no es válido o ya venció.");
      if (err.status === 404) throw new Error("No se encontró el repositorio, o el token no tiene acceso a él.");
      throw new Error("No se pudo conectar con GitHub. Revisa tu conexión.");
    }
    if (!info.permissions || !info.permissions.push) { session = null; throw new Error("El token no tiene permiso de escritura (Contents: Read and write)."); }
    session.branch = info.default_branch || "main";
    session.siteUrl = info.homepage || (repo.toLowerCase() === `${owner.toLowerCase()}.github.io` ? `https://${owner}.github.io/` : `https://${owner}.github.io/${repo}/`);
    await loadContent();
    showEditor();
  }

  /* ---------- contenido ---------- */
  let saved = null, state = null, contentSha = null;
  const pending = {}; // ruta → {blob, dataUrl}
  const recent = {};  // archivos recién publicados: vista previa mientras GitHub Pages se actualiza
  async function loadContent() {
    const f = await gh(`/repos/${session.owner}/${session.repo}/contents/${CONTENT_PATH}?ref=${encodeURIComponent(session.branch)}`);
    contentSha = f.sha;
    const text = dec(f.content || "");
    const a = text.indexOf("{"), b = text.lastIndexOf("}");
    const data = JSON.parse(text.slice(a, b + 1));
    if (data.links && !data.socials) { data.socials = Object.keys(data.links).map(type => ({ type, url: data.links[type] || "" })); delete data.links; }
    saved = clone(data); state = clone(data);
  }
  const serialize = s => "// Contenido del portafolio. Lo genera admin.html al publicar; no hace falta editarlo a mano.\nwindow.SITE = " + JSON.stringify(s, null, 2) + ";\n";

  /* ---------- editor ---------- */
  const SECTIONS = { inicio: "Inicio", sobre: "Sobre mí", proyectos: "Proyectos", habilidades: "Habilidades", experiencia: "Experiencia", contacto: "Contacto" };
  const SOCIAL_TYPES = { whatsapp: "WhatsApp", github: "GitHub", instagram: "Instagram", linkedin: "LinkedIn", facebook: "Facebook", x: "X", youtube: "YouTube", tiktok: "TikTok", web: "Sitio web", email: "Correo" };
  const TABS = [["general", "General"], ["secciones", "Secciones"], ["proyectos", "Proyectos"], ["habilidades", "Habilidades"], ["experiencia", "Experiencia"], ["contacto", "Contacto"], ["fotos", "Fotos"], ["colores", "Colores"], ["botones", "Textos de interfaz"]];
  let tab = "general", lang = "es", frame = null, frameReady = false, device = "desktop";
  const dirty = () => JSON.stringify(state) !== JSON.stringify(saved);

  function showEditor() {
    app.innerHTML = `<div class="shell">
      <header class="topbar">
        <span class="title">Portafolio</span><span class="repo">${esc(session.owner)}/${esc(session.repo)}</span>
        <span class="spacer"></span>
        <span class="status" aria-live="polite"></span>
        <button class="btn only-mobile" type="button" data-toggle-preview>Vista previa</button>
        <a class="btn" href="${esc(session.siteUrl)}" target="_blank" rel="noopener">Ver sitio</a>
        <button class="btn" type="button" data-discard>Descartar</button>
        <button class="btn primary" type="button" data-publish>Publicar</button>
        <button class="btn" type="button" data-logout>Salir</button>
      </header>
      <div class="work">
        <section class="editor" aria-label="Editor">
          <div class="editor-head"><span class="lbl">Idioma que editas</span><div class="seg" role="group" aria-label="Idioma"><button type="button" data-lang="es">Español</button><button type="button" data-lang="en">English</button></div></div>
          <div class="tabs" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${k === tab}">${l}</button>`).join("")}</div>
          <div class="panel"></div>
        </section>
        <section class="preview" aria-label="Vista previa">
          <div class="preview-bar"><div class="seg dev" role="group" aria-label="Dispositivo"><button type="button" data-device="desktop" aria-pressed="true">Escritorio</button><button type="button" data-device="mobile" aria-pressed="false">Móvil</button></div></div>
          <div class="frame-wrap"><iframe title="Vista previa del portafolio" src="index.html?preview=1"></iframe></div>
        </section>
      </div>
    </div>`;
    frame = app.querySelector("iframe");
    const shell = app.querySelector(".shell"), panel = app.querySelector(".panel");
    app.querySelector("[data-toggle-preview]").addEventListener("click", e => {
      const onP = shell.classList.toggle("show-preview");
      e.currentTarget.textContent = onP ? "Editar" : "Vista previa";
      if (onP) sendPreview();
    });
    app.querySelector("[data-logout]").addEventListener("click", () => {
      if (dirty() && !confirm("Tienes cambios sin publicar. ¿Salir de todos modos?")) return;
      store.clear("gh-token"); session = null; showLogin();
    });
    app.querySelector("[data-discard]").addEventListener("click", () => {
      if (!confirm("¿Descartar todos los cambios sin publicar?")) return;
      state = clone(saved); for (const k in pending) delete pending[k]; changed(); paint();
    });
    app.querySelector("[data-publish]").addEventListener("click", publish);
    app.querySelectorAll("[data-device]").forEach(b => b.addEventListener("click", () => {
      device = b.dataset.device;
      app.querySelectorAll("[data-device]").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      app.querySelector(".frame-wrap").classList.toggle("mobile", device === "mobile");
    }));
    app.querySelector(".editor-head .seg").addEventListener("click", e => {
      const b = e.target.closest("[data-lang]"); if (!b) return; lang = b.dataset.lang; paint(); sendPreview();
    });
    app.querySelector(".tabs").addEventListener("click", e => {
      const b = e.target.closest("[data-tab]"); if (!b) return; tab = b.dataset.tab;
      app.querySelectorAll(".tabs button").forEach(x => x.setAttribute("aria-selected", x === b ? "true" : "false"));
      paint(); panel.scrollTop = 0;
    });
    panel.addEventListener("input", onInput);
    panel.addEventListener("change", onChange);
    panel.addEventListener("click", onClick);
    paint(); refresh();
  }

  window.addEventListener("message", e => {
    if (!frame || e.source !== frame.contentWindow || !e.data || e.data.type !== "portfolio-ready") return;
    frameReady = true; sendPreview();
  });
  let sendTimer = null;
  function sendPreview() {
    clearTimeout(sendTimer);
    sendTimer = setTimeout(() => {
      if (!frame || !frameReady) return;
      const assets = { ...recent }; for (const k in pending) assets[k] = pending[k].dataUrl;
      frame.contentWindow.postMessage({ type: "portfolio-state", state, assets, lang }, "*");
    }, 120);
  }
  function setStatus(msg, kind) { const s = app.querySelector(".topbar .status"); if (s) { s.textContent = msg; s.className = "status" + (kind ? " " + kind : ""); } }
  function refresh(msg, kind) {
    const d = dirty();
    const pub = app.querySelector("[data-publish]"), dis = app.querySelector("[data-discard]");
    if (pub) pub.disabled = !d; if (dis) dis.disabled = !d;
    setStatus(msg || (d ? "Cambios sin publicar" : "Todo publicado"), kind);
  }
  function changed() { refresh(); sendPreview(); }
  window.addEventListener("beforeunload", e => { if (state && dirty()) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------- campos ---------- */
  const get = path => path.split(".").reduce((o, k) => o == null ? o : o[k], state);
  const set = (path, val) => {
    const ks = path.split("."); const last = ks.pop();
    let o = state; for (const k of ks) { if (o[k] == null) o[k] = {}; o = o[k]; }
    o[last] = val;
  };
  const ensure = path => { let v = get(path); if (!v || typeof v !== "object") { v = L(typeof v === "string" ? v : ""); set(path, v); } return v; };
  const tag = () => `<span class="lang-tag">${lang.toUpperCase()}</span>`;
  const phFor = (path, fallback) => { const v = get(path); return lang === "en" && v && v.es && !v.en ? v.es : (fallback || ""); };
  const tf = (label, path, multi, ph) => {
    const v = (get(path) || {})[lang] || "", p = esc(phFor(path, ph));
    return `<div class="field"><label>${label}${tag()}</label>${multi ? `<textarea data-i18n="${path}" placeholder="${p}">${esc(v)}</textarea>` : `<input type="text" data-i18n="${path}" value="${esc(v)}" placeholder="${p}">`}</div>`;
  };
  const pf = (label, path, type, ph) => `<div class="field"><label>${label}</label><input type="${type || "text"}" data-path="${path}" value="${esc(get(path) == null ? "" : get(path))}"${ph ? ` placeholder="${esc(ph)}"` : ""}></div>`;
  const uiPath = k => `ui.${lang}.${k}`;
  const uf = (label, k) => `<div class="field"><label>${label}${tag()}</label><input type="text" data-path="${uiPath(k)}" value="${esc(get(uiPath(k)) || "")}"></div>`;
  const preview = p => pending[p] ? pending[p].dataUrl : (recent[p] || p);
  const upload = (label, path, accept) => {
    const cur = get(path), isPdf = /pdf/.test(accept);
    const thumbStyle = cur && !isPdf ? `background-image:url('${esc(preview(cur))}')` : "";
    return `<div class="upload"><div class="thumb" style="${thumbStyle}">${isPdf ? (cur ? "PDF" : "Sin archivo") : (cur ? "" : "Sin imagen")}</div><div class="actions">
      <button class="btn small" type="button" data-pick="${path}">${cur ? "Cambiar" : label}</button>
      ${cur ? `<button class="btn small" type="button" data-clear="${path}">Quitar</button>` : ""}
      <input type="file" accept="${accept}" hidden data-file="${path}"></div></div>`;
  };
  const tools = (list, i, len) => `<div class="tools"><button class="icon-btn" type="button" data-move="${list}|${i}|-1" aria-label="Subir"${i === 0 ? " disabled" : ""}>↑</button><button class="icon-btn" type="button" data-move="${list}|${i}|1" aria-label="Bajar"${i === len - 1 ? " disabled" : ""}>↓</button><button class="icon-btn" type="button" data-del="${list}|${i}" aria-label="Eliminar">×</button></div>`;

  function paint() {
    app.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false"));
    const panel = app.querySelector(".panel");
    let h = lang === "en" ? `<p class="hint">Editas la versión en inglés. Si un campo queda vacío, el sitio muestra el texto en español.</p>` : "";
    if (tab === "general") {
      h += `<p class="group-title">Inicio</p>` + pf("Nombre", "name") + tf("Título del panel oscuro", "brand") + tf("Profesión", "role");
      h += `<p class="group-title">Sobre mí</p>` + tf("Saludo", "hello", true) + tf("Descripción", "about", true);
      h += `<p class="group-title">Pie de página</p>` + tf("Texto", "footer");
      h += `<p class="group-title">Buscadores y redes</p>` + tf("Descripción de la página", "share", true);
    }
    if (tab === "secciones") {
      h += `<p class="hint">Oculta las secciones que no quieras mostrar y cambia su nombre en el menú y en el título.</p>`;
      for (const k of Object.keys(SECTIONS)) {
        h += `<div class="card"><div class="card-top">${SECTIONS[k]}${k === "inicio" ? "" : `<label class="toggle" style="border:0;padding:0;gap:8px">Visible <input type="checkbox" data-section="${k}"${state.sections && state.sections[k] === false ? "" : " checked"}></label>`}</div>` + uf("Nombre en el menú y título", `nav.${k}`) + `</div>`;
      }
    }
    if (tab === "proyectos") {
      (state.projects || []).forEach((p, i, a) => {
        h += `<div class="card"><div class="card-top">Proyecto ${i + 1}${tools("projects", i, a.length)}</div>`
          + tf("Nombre", `projects.${i}.title`) + tf("Descripción", `projects.${i}.desc`, true)
          + pf("Tecnologías (separadas por coma)", `projects.${i}.stack`)
          + pf("Enlace a la demo", `projects.${i}.demo`, "url", "https://") + pf("Enlace al código", `projects.${i}.repo`, "url", "https://")
          + `<p class="lbl">Captura</p>` + upload("Subir captura", `projects.${i}.image`, "image/*") + `</div>`;
      });
      h += `<button class="btn small" type="button" data-add="projects">Agregar proyecto</button>`;
    }
    if (tab === "habilidades") {
      const lv = (get(`ui.${lang}.levels`) || ["Básico", "Intermedio", "Avanzado", "Experto"]);
      h += `<p class="hint">Los años y la nota aparecen al pasar el cursor o tocar la habilidad. Si un grupo queda vacío, no se muestra.</p>`;
      for (const [g, l] of [["tech", "Lenguajes y frameworks"], ["tools", "Herramientas"]]) {
        h += `<p class="group-title">${l}</p>` + tf("Título del grupo", `skills.${g}.title`);
        state.skills[g].items.forEach((s, i, a) => {
          h += `<div class="row skill"><input type="text" aria-label="Habilidad" data-i18n="skills.${g}.items.${i}.n" value="${esc((s.n || {})[lang] || "")}" placeholder="${esc(phFor(`skills.${g}.items.${i}.n`))}">
            <select aria-label="Nivel" data-path="skills.${g}.items.${i}.lvl" data-num>${[1, 2, 3, 4].map(k => `<option value="${k}"${+s.lvl === k ? " selected" : ""}>${esc(lv[k - 1])}</option>`).join("")}</select>
            <input type="number" min="0" max="60" aria-label="Años" placeholder="Años" data-path="skills.${g}.items.${i}.years" value="${esc(s.years)}">
            <button class="icon-btn" type="button" data-del="skills.${g}.items|${i}" aria-label="Eliminar">×</button></div>
            <div class="note"><input type="text" aria-label="Nota" data-i18n="skills.${g}.items.${i}.note" value="${esc((s.note || {})[lang] || "")}" placeholder="${esc(phFor(`skills.${g}.items.${i}.note`, "Nota (opcional)"))}"></div>`;
        });
        h += `<button class="btn small" type="button" data-add="skills.${g}.items">Agregar</button>`;
      }
      h += `<p class="group-title">Personales</p>` + tf("Título del grupo", "skills.soft.title");
      state.skills.soft.items.forEach((s, i) => {
        h += `<div class="row soft"><input type="text" aria-label="Habilidad" data-i18n="skills.soft.items.${i}.n" value="${esc((s.n || {})[lang] || "")}" placeholder="${esc(phFor(`skills.soft.items.${i}.n`))}">
          <button class="icon-btn" type="button" data-del="skills.soft.items|${i}" aria-label="Eliminar">×</button></div>
          <div class="note"><input type="text" aria-label="Ejemplo" data-i18n="skills.soft.items.${i}.note" value="${esc((s.note || {})[lang] || "")}" placeholder="${esc(phFor(`skills.soft.items.${i}.note`, "Ejemplo concreto (opcional)"))}"></div>`;
      });
      h += `<button class="btn small" type="button" data-add="skills.soft.items">Agregar</button>`;
    }
    if (tab === "experiencia") {
      h += `<p class="hint">Se muestran en este orden; deja lo más reciente arriba.</p>`;
      (state.experience || []).forEach((e, i, a) => {
        h += `<div class="card"><div class="card-top">Entrada ${i + 1}${tools("experience", i, a.length)}</div>`
          + tf("Periodo", `experience.${i}.period`, false, "Mar 2023 – actualidad") + tf("Rol o proyecto", `experience.${i}.role`)
          + tf("Lugar o empresa", `experience.${i}.place`) + tf("Descripción y logros", `experience.${i}.desc`, true) + `</div>`;
      });
      h += `<button class="btn small" type="button" data-add="experience">Agregar entrada</button>`;
    }
    if (tab === "contacto") {
      h += pf("Correo", "contact.email", "email", "tu@correo.com") + tf("Texto de invitación", "contact.text", true);
      h += `<p class="group-title">Currículum (PDF)</p>${state.contact.cv ? `<p class="hint">${esc(state.contact.cvName || "CV.pdf")}</p>` : ""}` + upload("Subir PDF", "contact.cv", "application/pdf");
      h += `<p class="group-title">Redes</p><p class="hint">Para WhatsApp usa https://wa.me/ seguido de tu número con código de país.</p>`;
      (state.socials || []).forEach((s, i, a) => {
        h += `<div class="row social"><select aria-label="Red" data-path="socials.${i}.type">${Object.keys(SOCIAL_TYPES).map(k => `<option value="${k}"${s.type === k ? " selected" : ""}>${SOCIAL_TYPES[k]}</option>`).join("")}</select>
          <input type="text" inputmode="url" aria-label="Enlace" data-path="socials.${i}.url" value="${esc(s.url)}" placeholder="${s.type === "email" ? "tu@correo.com" : "https://"}">
          <button class="icon-btn" type="button" data-del="socials|${i}" aria-label="Eliminar">×</button></div>`;
      });
      h += `<button class="btn small" type="button" data-add="socials">Agregar red</button>`;
    }
    if (tab === "fotos") {
      h += `<p class="group-title">Foto de perfil (Inicio)</p><p class="hint">Cuadrada, idealmente de 800 × 800 px o más.</p>` + upload("Subir foto", "photos.profile", "image/*");
      h += `<p class="group-title">Foto de Sobre mí</p><p class="hint">Vertical, proporción 3:4.</p>` + upload("Subir foto", "photos.about", "image/*");
      h += `<p class="hint">Las capturas de proyectos se cambian en la pestaña Proyectos.</p>`;
    }
    if (tab === "colores") {
      const keys = [["bg", "Fondo"], ["panel", "Principal"], ["ink", "Texto"], ["soft", "Suave"], ["on", "Sobre principal"]];
      h += `<p class="hint">Cada sección tiene su propia paleta. En modo oscuro el sitio la adapta solo.</p>`;
      for (const sec of Object.keys(SECTIONS)) {
        h += `<div class="palette"><div class="palette-head">${SECTIONS[sec]}</div><div class="swatches">`
          + keys.map(([k, l]) => `<label class="swatch"><input type="color" data-path="palettes.${sec}.${k}" value="${esc(get(`palettes.${sec}.${k}`) || "#000000")}">${l}</label>`).join("") + `</div></div>`;
      }
    }
    if (tab === "botones") {
      h += `<p class="hint">Textos fijos de la interfaz, por idioma.</p>`;
      h += `<p class="group-title">Proyectos</p><div class="grid2">${uf("Botón demo", "demo")}${uf("Botón código", "repo")}</div>`;
      h += `<p class="group-title">Contacto</p><div class="grid2">${uf("Botón correo", "mail")}${uf("Botón copiar", "copy")}${uf("Al copiar", "copied")}${uf("Botón CV", "cv")}</div>`;
      h += `<p class="group-title">Habilidades</p><div class="grid2">${[0, 1, 2, 3].map(i => uf(`Nivel ${i + 1}`, `levels.${i}`)).join("")}${uf("Año (singular)", "yearOne")}${uf("Años (plural)", "yearMany")}</div>${uf("Indicación al pie de habilidades personales", "tapHint")}`;
    }
    panel.innerHTML = h;
  }

  function onInput(e) {
    const el = e.target;
    if (el.dataset.i18n) { ensure(el.dataset.i18n)[lang] = el.value; changed(); return; }
    if (el.dataset.path) {
      let v = el.value;
      if ("num" in el.dataset) v = parseInt(v, 10) || 1;
      set(el.dataset.path, v); changed();
      if (el.tagName === "SELECT" && el.dataset.path.startsWith("socials")) paint();
    }
  }
  function onChange(e) {
    const el = e.target;
    if (el.dataset.section) { state.sections = state.sections || {}; state.sections[el.dataset.section] = el.checked; changed(); return; }
    if (el.dataset.file && el.files && el.files[0]) handleFile(el.dataset.file, el.files[0]);
  }
  const blank = {
    projects: () => ({ title: L("Nuevo proyecto"), desc: L(), stack: "", image: "", demo: "", repo: "" }),
    experience: () => ({ period: L(), role: L("Nuevo rol"), place: L(), desc: L() }),
    "skills.tech.items": () => ({ n: L("Nueva"), lvl: 2, years: "", note: L() }),
    "skills.tools.items": () => ({ n: L("Nueva"), lvl: 2, years: "", note: L() }),
    "skills.soft.items": () => ({ n: L("Nueva", "New"), note: L() }),
    socials: () => ({ type: "linkedin", url: "" })
  };
  function onClick(e) {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.add) { let a = get(b.dataset.add); if (!Array.isArray(a)) { a = []; set(b.dataset.add, a); } a.push(blank[b.dataset.add]()); changed(); paint(); }
    if (b.dataset.del) { const [list, i] = b.dataset.del.split("|"); if (!confirm("¿Eliminar este elemento?")) return; get(list).splice(+i, 1); changed(); paint(); }
    if (b.dataset.move) { const [list, i, d] = b.dataset.move.split("|"); const a = get(list), x = +i, y = x + +d; [a[x], a[y]] = [a[y], a[x]]; changed(); paint(); }
    if (b.dataset.pick) b.parentElement.querySelector("input[type=file]").click();
    if (b.dataset.clear) { const p = get(b.dataset.clear); delete pending[p]; set(b.dataset.clear, ""); if (b.dataset.clear === "contact.cv") state.contact.cvName = ""; changed(); paint(); }
  }
  const slug = s => (s || "archivo").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "archivo";
  async function handleFile(path, file) {
    const isPdf = file.type === "application/pdf";
    try {
      if (isPdf && file.size > 20 * 1024 * 1024) throw new Error("El PDF pesa más de 20 MB.");
      setStatus(isPdf ? "Preparando PDF…" : "Preparando imagen…");
      const blob = isPdf ? file : await resize(file, 1600);
      const repoPath = isPdf ? `archivos/${slug(file.name)}-${Date.now()}.pdf` : `img/subidas/${slug(file.name)}-${Date.now()}.jpg`;
      pending[repoPath] = { blob, dataUrl: await blobToDataUrl(blob) };
      const prev = get(path); if (prev && pending[prev]) delete pending[prev];
      set(path, repoPath);
      if (isPdf) state.contact.cvName = file.name;
      changed(); paint();
    } catch (err) { refresh(err.message || "No se pudo leer el archivo. Prueba con otro.", "err"); }
  }
  function resize(file, max) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(b => b ? resolve(b) : reject(new Error("No se pudo procesar la imagen.")), "image/jpeg", 0.85);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Ese archivo no parece una imagen válida.")); };
      img.src = url;
    });
  }

  /* ---------- publicar ---------- */
  let publishing = false;
  async function publish() {
    if (publishing || !dirty()) return;
    publishing = true;
    const btn = app.querySelector("[data-publish]"); btn.disabled = true;
    try {
      const json = JSON.stringify(state);
      const toUpload = Object.keys(pending).filter(p => json.includes(JSON.stringify(p)));
      let n = 0;
      for (const p of toUpload) {
        n++; setStatus(`Subiendo archivo ${n} de ${toUpload.length}…`);
        await gh(`/repos/${session.owner}/${session.repo}/contents/${p.split("/").map(encodeURIComponent).join("/")}`, {
          method: "PUT", body: JSON.stringify({ message: `Sube ${p} desde admin`, content: await blobToB64(pending[p].blob), branch: session.branch })
        });
        recent[p] = pending[p].dataUrl; delete pending[p];
      }
      for (const k of Object.keys(pending)) delete pending[k];
      setStatus("Guardando contenido…");
      const res = await gh(`/repos/${session.owner}/${session.repo}/contents/${CONTENT_PATH}`, {
        method: "PUT", body: JSON.stringify({ message: "Actualiza contenido desde admin", content: enc(serialize(state)), sha: contentSha, branch: session.branch })
      });
      contentSha = res.content.sha;
      saved = clone(state);
      refresh("Publicado. GitHub Pages tarda uno o dos minutos en mostrar los cambios.", "ok");
    } catch (err) {
      if (err.status === 409) refresh("El contenido cambió en GitHub desde que abriste el panel. Copia tus cambios importantes, recarga la página y vuelve a intentarlo.", "err");
      else if (err.status === 401) { refresh("Tu sesión venció. Vuelve a entrar.", "err"); }
      else if (err.status === 403 || err.status === 404) refresh("El token no tiene permiso para escribir en este repositorio.", "err");
      else if (err.status === 422) refresh("GitHub rechazó un archivo (puede ser demasiado grande).", "err");
      else refresh("No se pudo publicar. Revisa tu conexión e inténtalo de nuevo.", "err");
      btn.disabled = false;
    } finally { publishing = false; }
  }

  /* ---------- inicio ---------- */
  const tk = store.get("gh-token"), o = store.get("gh-owner"), r = store.get("gh-repo");
  if (tk && o && r) {
    app.innerHTML = `<div class="login"><p class="sub">Conectando con GitHub…</p></div>`;
    login(o, r, tk).catch(err => { store.clear("gh-token"); showLogin(err.message); });
  } else showLogin();
})();
