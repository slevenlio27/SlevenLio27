# Rediseño del portafolio: sitio multipágina para clientes

## Intención
Convertir el portafolio de Emilio Monzón en la página de un desarrollador profesional que atraiga **clientes potenciales** (negocios en Nicaragua que necesitan una web, un sistema o una app). Todo debe llevar a **Contacto**, que es la acción principal.

## Objetivos
- Cada botón de la navegación abre su propia página: `index.html`, `sobre-mi.html`, `proyectos.html`, `habilidades.html`, `experiencia.html`, `contacto.html`.
- El botón Contacto destaca en la barra de todas las páginas y cada página termina con un bloque que invita a escribir.
- Los proyectos reales en línea (Claustro, Nutrisev, Facristh) son la prueba principal de trabajo.
- WhatsApp es el canal principal de contacto, con el correo y GitHub como alternativas.

## No objetivos
- No se cambia el panel `admin.html` ni el formato de `contenido.js`.
- Sin framework ni paso de compilación: GitHub Pages sirve los archivos tal cual.

## Anti-objetivos
- Que se rompa la publicación desde el admin.
- Seis paletas distintas: el sitio vuelve a verse como plantilla.
- Texto genérico de "landing" que no hable del negocio del cliente.

## Enfoques considerados
1. **Una página HTML por sección que lee el mismo `contenido.js` (elegido).** Hay URLs reales por página, el admin sigue funcionando y no hace falta compilar.
2. Una sola página con rutas hash: no son páginas reales y es peor para compartir y para SEO.
3. Generador estático (Astro/Vite): obliga a compilar antes de publicar y rompe el flujo de Publicar del admin.

## Decisiones de diseño
- **Color:** fondo `#F3F5F2`, superficie `#FFFFFF`, tinta `#15201A`, texto suave `#55625A`, línea `#D9DFD9`, pino `#1F5A43` (marca) y ámbar `#E8A33D`, que se reserva para las acciones de contacto. Modo oscuro derivado.
- **Tipografía:** Space Grotesk para titulares y Archivo para el texto (recomendación de ui-ux-pro-max).
- **Elemento memorable:** en el hero, un collage con capturas reales de los sitios en línea, en marco de navegador o de teléfono según la proporción de la imagen.
- **Un solo momento de animación:** la entrada del collage en Inicio. Se respeta `prefers-reduced-motion`.
- Idioma ES/EN y modo claro/oscuro con botones en la barra.
- El texto orientado a clientes (titular, servicios, proceso) vive en `ui` con valores por defecto, y `contenido.js` puede sobrescribirlo.

## Queda a criterio de quien construye
Espaciados exactos, breakpoints y redacción menor.
