// Genera el HTML de cada página (contenido + datos estructurados) a partir de contenido.js.
// Uso: node tools/prerender.mjs   (requiere: npm i playwright && npx playwright install chromium)
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://www.slevenlio27.com";
const PAGES = [
  { file: "index.html", url: "/", title: "Emilio Monzón · Desarrollador web y móvil en Nicaragua",
    desc: "Construyo la web, el sistema o la app que tu negocio necesita: sitios, tiendas en línea, sistemas con panel de administración y apps Android. Estelí, Nicaragua." },
  { file: "sobre-mi.html", url: "/sobre-mi", title: "Sobre mí · Emilio Monzón, desarrollador full stack en Estelí",
    desc: "Conoce a Emilio Monzón, desarrollador full stack de Estelí, Nicaragua: crea aplicaciones web y móviles completas, del diseño a la publicación." },
  { file: "proyectos.html", url: "/proyectos", title: "Proyectos · Sitios, sistemas y apps en línea · Emilio Monzón",
    desc: "Proyectos reales en uso: Claustro (asistente de IA para docentes), Nutrisev (tienda y citas) y Facristh (venta de madera). Ábrelos y míralos funcionando." },
  { file: "habilidades.html", url: "/habilidades", title: "Habilidades y tecnologías · Emilio Monzón, desarrollador web",
    desc: "Tecnologías y herramientas con las que Emilio Monzón construye sitios web, sistemas con panel de administración y apps Android para negocios en Nicaragua." },
  { file: "experiencia.html", url: "/experiencia", title: "Experiencia · Emilio Monzón, desarrollador web y móvil",
    desc: "Experiencia profesional y proyectos de Emilio Monzón: dónde ha trabajado y qué ha construido como desarrollador full stack en Estelí, Nicaragua." },
  { file: "contacto.html", url: "/contacto", title: "Contacto · Cotiza tu sitio web, sistema o app · Emilio Monzón",
    desc: "Cuéntame qué necesita tu negocio y lo construimos. Escríbeme por WhatsApp al +505 8603 6776 o por correo para cotizar tu sitio, sistema o app en Nicaragua." },
];
const DEFAULT_ICON = `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%2328C8E8'/><text x='16' y='21.5' font-family='Arial' font-weight='700' font-size='14' text-anchor='middle' fill='%23070B16'>EM</text></svg>">`;
const NAMES = { "/": "Inicio", "/sobre-mi": "Sobre mí", "/proyectos": "Proyectos", "/habilidades": "Habilidades", "/experiencia": "Experiencia", "/contacto": "Contacto" };

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".json": "application/json" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/") p = "/index.html";
  let f = path.join(ROOT, p);
  if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const abs = u => !u ? "" : /^https?:/i.test(u) ? u : `${ORIGIN}/${String(u).replace(/^\//, "")}`;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function graph(site, page) {
  const t = f => (f && (f.es || "")).trim();
  const same = (site.socials || []).map(s => s.url).filter(u => /^https?:/i.test(u) && !/wa\.me/.test(u));
  const email = (site.contact && site.contact.email) || (site.socials || []).find(s => s.type === "email")?.url || "";
  const wa = (site.socials || []).find(s => s.type === "whatsapp")?.url || "";
  const phone = (wa.match(/wa\.me\/(\d+)/) || [])[1];
  const skills = ["tech", "tools"].flatMap(k => ((site.skills || {})[k] || {}).items || []).map(i => i && i.n && (i.n.es || i.n)).filter(x => typeof x === "string" && x);
  const g = [
    { "@type": "WebSite", "@id": `${ORIGIN}/#website`, url: `${ORIGIN}/`, name: site.name, inLanguage: "es", publisher: { "@id": `${ORIGIN}/#person` } },
    { "@type": "Person", "@id": `${ORIGIN}/#person`, name: site.name, jobTitle: t(site.role), url: `${ORIGIN}/`,
      image: abs(site.photos && site.photos.profile), description: t(site.share),
      address: { "@type": "PostalAddress", addressLocality: "Estelí", addressCountry: "NI" },
      ...(same.length ? { sameAs: same } : {}), ...(skills.length ? { knowsAbout: skills } : {}) },
    { "@type": "ProfessionalService", "@id": `${ORIGIN}/#service`, name: `${site.name} · Desarrollo web y móvil`, url: `${ORIGIN}/`,
      image: `${ORIGIN}/img/og.jpg`, description: t(site.share), founder: { "@id": `${ORIGIN}/#person` },
      areaServed: { "@type": "Country", name: "Nicaragua" },
      address: { "@type": "PostalAddress", addressLocality: "Estelí", addressCountry: "NI" },
      ...(email ? { email: email.replace(/^mailto:/, "") } : {}), ...(phone ? { telephone: "+" + phone } : {}),
      makesOffer: ["Sitios web y tiendas en línea", "Sistemas con panel de administración", "Apps Android"].map(n => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })) },
  ];
  if (page.url !== "/") g.push({ "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: NAMES["/"], item: `${ORIGIN}/` },
    { "@type": "ListItem", position: 2, name: NAMES[page.url], item: ORIGIN + page.url } ] });
  if (page.url === "/proyectos") g.push({ "@type": "ItemList", itemListElement: (site.projects || []).map((p, i) => ({
    "@type": "ListItem", position: i + 1, item: { "@type": "CreativeWork", name: t(p.title), description: t(p.desc || p.description), url: p.demo || p.url || undefined, author: { "@id": `${ORIGIN}/#person` } } })) });
  return { "@context": "https://schema.org", "@graph": g };
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: "es-NI", viewport: { width: 1280, height: 900 } });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const siteData = (await (async () => { const p = await ctx.newPage(); await p.goto(base + "/contenido.js"); const txt = await p.evaluate(() => document.body.innerText); await p.close();
  return JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1)); })());

for (const pg of PAGES) {
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem("lang", "es"); localStorage.setItem("theme", "dark"); } catch (e) {} });
  await p.goto(base + pg.url, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("html.ready", { timeout: 20000 });
  const inner = await p.evaluate(() => document.getElementById("root").innerHTML);
  await p.close();

  const fp = path.join(ROOT, pg.file);
  let html = fs.readFileSync(fp, "utf8");
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(pg.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(pg.desc)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(pg.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(pg.desc)}$2`);
  const fav = siteData.photos && siteData.photos.favicon;
  const icon = fav && /^img\/subidas\/[\w.-]+$/.test(fav)
    ? `<link rel="icon" href="/${fav}"><link rel="apple-touch-icon" href="/${fav}">` : DEFAULT_ICON;
  html = html.replace(/<!--icon:start-->[\s\S]*?<!--icon:end-->/, () => `<!--icon:start-->${icon}<!--icon:end-->`);
  const ld = `<!--ld:start--><script type="application/ld+json">${JSON.stringify(graph(siteData, pg)).replace(/</g, "\\u003c")}</script><!--ld:end-->`;
  html = /<!--ld:start-->/.test(html) ? html.replace(/<!--ld:start-->[\s\S]*?<!--ld:end-->/, () => ld) : html.replace("</head>", () => ld + "\n</head>");
  const body = `<div id="root"><!--pre:start-->${inner}<!--pre:end--></div>`;
  html = /<!--pre:start-->/.test(html) ? html.replace(/<div id="root"><!--pre:start-->[\s\S]*?<!--pre:end--><\/div>/, () => body) : html.replace('<div id="root"></div>', () => body);
  fs.writeFileSync(fp, html);
  console.log("ok", pg.file, inner.length);
}
await browser.close(); server.close();
