# Rediseño multipágina — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seis páginas estáticas con una sola identidad visual que llevan a Contacto, leyendo el `contenido.js` actual.

**Architecture:** Cada HTML es un esqueleto con `<body data-page="...">`. `js/app.js` carga `contenido.js`, normaliza los datos y pinta cabecera, contenido de la página y pie según `data-page`. `css/estilos.css` contiene todos los tokens y componentes.

**Tech Stack:** HTML, CSS y JS sin dependencias; Google Fonts (Space Grotesk y Archivo).

**Spec:** `docs/superpowers/specs/2026-11-24-rediseno-multipagina-design.md`

## Global Constraints
- Sin pasos de compilación; rutas relativas que funcionen en `/SlevenLio27/`.
- `index.html?preview=1` sigue aceptando el mensaje `portfolio-state` del admin.
- Las secciones con `sections[k] === false` desaparecen de la navegación.
- El ámbar solo se usa en acciones de contacto.

## Review Focus
- Proyecto sin imagen, sin demo o sin título en inglés → se muestra con iniciales y se usa el título en español.
- Imagen vertical frente a horizontal → marco de teléfono o de navegador.
- Sin enlace de WhatsApp → el correo pasa a ser la acción principal.
- Pantalla de 360 px → menú plegable y sin desbordamiento horizontal.
- Modo oscuro y `prefers-reduced-motion`.

---

### Task 1: Esqueletos de las páginas
**Files:** Modify `index.html`; Create `sobre-mi.html`, `proyectos.html`, `habilidades.html`, `experiencia.html`, `contacto.html`.
- [ ] Mismo `<head>` (fuentes, `css/estilos.css`), `<body data-page="inicio|sobre|proyectos|habilidades|experiencia|contacto">`, `#root` y `js/app.js`.

### Task 2: Renderizador
**Files:** Rewrite `js/app.js`.
**Produces:** `PAGES = {inicio:"index.html", sobre:"sobre-mi.html", ...}`; `render()` → `header() + views[page]() + ctaBand() + footer()`.
- [ ] Mantener `normalize`, `merge`, `esc`, `safeUrl`, `src`, `ICONS` y el arranque o vista previa.
- [ ] `waLink()`: URL de WhatsApp de `socials`, o vacío.
- [ ] `frame(img)`: marco de teléfono o de navegador según `naturalWidth/naturalHeight` al cargar.
- [ ] Botones de idioma y de tema (claro/oscuro) que se guardan en `localStorage` con try/catch.

### Task 3: Estilos
**Files:** Rewrite `css/estilos.css`.
- [ ] Tokens en `:root` y modo oscuro con `[data-theme]` y `prefers-color-scheme`.
- [ ] Componentes: cabecera, hero y collage, servicios, proceso, casos de proyecto, medidores de habilidad, línea de tiempo, contacto, bloque CTA y pie.

### Task 4: Verificación
- [ ] Capturas con Playwright de las 6 páginas a 1440 y 390 px, en claro y oscuro, y revisión.
- [ ] Sin errores en consola; sin desbordamiento horizontal (`scrollWidth <= innerWidth`).
- [ ] Commit, copia a la carpeta del usuario y análisis de mejoras.
