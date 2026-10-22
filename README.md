# Portafolio · Emilio Monzón

Sitio estático para GitHub Pages con **panel de administración en el navegador**.
Todo el contenido (textos en español e inglés, fotos, proyectos, habilidades, experiencia, contacto, CV, redes, colores, secciones visibles y textos de botones) se edita desde `admin.html`. No hace falta tocar código.

## Cómo funciona

- `index.html` muestra el sitio y lee el contenido desde `contenido.js`.
- `admin.html` es el panel. Al pulsar **Publicar**, guarda `contenido.js` y las fotos o PDF que subiste directamente en tu repositorio de GitHub. GitHub Pages actualiza el sitio en uno o dos minutos.
- El acceso al panel se hace con **tu token de GitHub**. Sin ese token nadie puede guardar nada, aunque abra `admin.html`.

## 1. Sube el sitio a GitHub (solo la primera vez)

1. Crea en GitHub un repositorio público llamado **`TU-USUARIO.github.io`**.
2. Desde Git Bash, dentro de esta carpeta:

   ```bash
   git init
   git add .
   git commit -m "Portafolio inicial"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-USUARIO.github.io.git
   git push -u origin main
   ```

3. En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. En uno o dos minutos el sitio estará en `https://TU-USUARIO.github.io`.

## 2. Crea tu token de acceso

1. En GitHub: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Repository access:** *Only select repositories* → marca solo `TU-USUARIO.github.io`.
3. **Permissions → Repository permissions → Contents:** *Read and write*.
4. Elige una fecha de vencimiento, genera el token y guárdalo en un lugar seguro (GitHub no lo vuelve a mostrar).

El token solo puede modificar ese repositorio. Si alguna vez se filtra, lo revocas en la misma pantalla y creas otro.

## 3. Edita tu portafolio

1. Abre `https://TU-USUARIO.github.io/admin.html`.
2. Escribe tu usuario, el repositorio y el token. Marca *Recordar en este dispositivo* solo en tu computadora o celular personal.
3. Edita en las pestañas; la vista previa se actualiza al instante (en el celular, con el botón **Vista previa**).
4. Pulsa **Publicar**.

Consejos:
- **Idioma que editas** cambia entre español e inglés. Si un campo en inglés queda vacío, el sitio muestra el español.
- Las fotos se reducen y comprimen automáticamente antes de subirse.
- Si editas desde dos dispositivos, publica desde uno y recarga el otro antes de seguir.

## Dominio propio (opcional)

1. En **Settings → Pages → Custom domain** escribe tu dominio y guarda.
2. En el DNS de tu proveedor agrega registros **A** del dominio raíz hacia `185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`, y un **CNAME** de `www` hacia `TU-USUARIO.github.io`.
3. Cuando el certificado esté listo, activa **Enforce HTTPS**.

Si GitHub cambió algún menú, la guía oficial está en docs.github.com, sección *Pages*.

## Estructura

```
index.html        Sitio público
admin.html        Panel de administración
contenido.js      Contenido (lo genera el panel)
css/  js/         Estilos y lógica
img/subidas/      Fotos subidas desde el panel
archivos/         PDF subidos desde el panel (CV)
```
