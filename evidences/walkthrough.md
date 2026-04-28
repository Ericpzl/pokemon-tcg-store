# Guía de Despliegue - Pokémon TCG Store

## Paso 1: Subir el código a GitHub

1. Abre una **nueva terminal** en VS Code.
2. Asegúrate de estar en la carpeta raíz del proyecto.
3. Ejecuta estos comandos uno a uno:

```bash
git init
git add .
git commit -m "Primer commit - Preparado para la nube"
```

4. Ve a [GitHub.com](https://github.com/), inicia sesión y haz clic en **"New"** para crear un repositorio nuevo.
5. Llámalo `pokemon-tcg-store`, déjalo en **Public** y haz clic en **"Create repository"** (sin marcar ninguna opción adicional).
6. GitHub te mostrará la sección **"...or push an existing repository from the command line"**. Copia esos 3 comandos y pégalos en tu terminal.

---

## Paso 2: Activar GitHub Pages (El Frontend)

1. En tu repositorio de GitHub ve a **Settings** > **Pages**.
2. En "Source" selecciona `Deploy from a branch`.
3. En "Branch" selecciona `main` y la carpeta `/ (root)`. Haz clic en **Save**.
4. Espera 2-3 minutos y recarga la página. Verás el enlace público.
5. Tu web estará en: `https://TU_USUARIO.github.io/pokemon-tcg-store/frontend/pages/index.html`

---

## Paso 3: Desplegar el Backend Java en Render.com

1. Ve a [Render.com](https://render.com/) y crea una cuenta con GitHub.
2. Haz clic en **New +** > **Web Service**.
3. Conecta tu repositorio `pokemon-tcg-store`.
4. En **Root Directory** escribe `backend`.
5. En **Environment** selecciona `Docker`.
6. Haz clic en **Create Web Service**.

---

## Paso 4: Actualizar `config.js` con la URL de producción

Una vez Render te dé la URL de tu backend (ej. `https://mi-backend.onrender.com`), abre:

```
frontend/js/config.js
```

Y actualiza esta línea:

```js
const PRODUCTION_API_URL = "https://mi-backend.onrender.com/api";
```

Luego haz un nuevo commit y push para actualizar GitHub Pages automáticamente.
