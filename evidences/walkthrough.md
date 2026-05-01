# Guía Completa de Despliegue - Pokémon TCG Store

## Arquitectura Final en Producción

```
[Usuario] 
    → GitHub Pages (Frontend HTML/CSS/JS)
        → Render.com (Backend Java/Javalin)
            → Aiven.io (MySQL en la nube)
```

---

## Paso 1: Preparar el Código para la Nube

### 1.1 Crear `frontend/js/config.js`
Este archivo detecta automáticamente si la web está en local o en producción:
```js
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const PRODUCTION_API_URL = "https://pokemon-tcg-store.onrender.com/api";
const LOCAL_API_URL = "http://localhost:7070/api";
const API_BASE_URL = isLocalhost ? LOCAL_API_URL : PRODUCTION_API_URL;
```
Pagina para las expansiones = https://api.tcgdex.net/v2/es/sets

### 1.2 Reemplazar todas las URLs hardcodeadas
Todos los `fetch("http://localhost:7070/api/...")` de los archivos JS fueron reemplazados por `fetch(`${API_BASE_URL}/...`)`.

### 1.3 Actualizar `DBConnection.java`
El archivo fue reescrito para leer la configuración de variables de entorno:
```java
String host     = getEnv("DB_HOST",     "localhost");
String port     = getEnv("DB_PORT",     "3306");
String dbName   = getEnv("DB_NAME",     "pokemon_tcg_db");
String user     = getEnv("DB_USER",     "root");
String password = getEnv("DB_PASSWORD", "");
// Aiven requiere SSL en la nube
boolean useSSL = !host.equals("localhost");
```

### 1.4 Crear `.gitignore`
Para no subir archivos sensibles a GitHub:
```
*.sql
dump.sql
.env
target/
*.jar
```

---

## Paso 2: Subir a GitHub

```bash
git init
git add .
git commit -m "Primer commit - Preparado para la nube"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/pokemon-tcg-store.git
git push -u origin main
```

---

## Paso 3: Activar GitHub Pages

1. GitHub → tu repositorio → **Settings** → **Pages**
2. Source: `Deploy from a branch`
3. Branch: `main`, carpeta: `/ (root)`
4. Tu web pública: `https://ericpzl.github.io/pokemon-tcg-store/frontend/pages/index.html`

---

## Paso 4: Crear Base de Datos en Aiven.io

1. Registrarse en [aiven.io](https://aiven.io)
2. Crear servicio **MySQL** → Plan **Hobbyist (gratis)**
3. En la sección **IP Allow List**: añadir `0.0.0.0/0` para permitir conexiones desde Render
4. Credenciales obtenidas:
   - Host: `mysql-679068b-ericperezleon3-61b8.c.aivencloud.com`
   - Puerto: `20386`
   - Usuario: `avnadmin`
   - Base de datos: `pokemon_tcg_db` (creada manualmente desde Aiven Console → Databases)

### 4.1 Exportar base de datos local
Como `mysqldump` no está en el PATH de Windows, se usó Docker:
```powershell
docker run --rm mysql:8.0 mysqldump -h host.docker.internal -u root pokemon_tcg_db > dump.sql
```

### 4.2 Importar a Aiven (filtrando líneas problemáticas)
El dump incluye `CREATE DATABASE` y `USE` que Aiven no permite por SQL. Se filtraron con PowerShell:
```powershell
Get-Content dump.sql | Where-Object { $_ -notmatch "^CREATE DATABASE" -and $_ -notmatch "^USE " } | docker run --rm -i mysql:8.0 mysql --user avnadmin --password=TU_PASSWORD --host [HOST_AIVEN] --port 20386 --ssl-mode=REQUIRED pokemon_tcg_db
```

### 4.3 Problema de Case-Sensitivity (Linux vs Windows)
MySQL en Linux distingue mayúsculas en nombres de tabla. Las tablas se importaron en minúscula pero el código Java las busca con mayúsculas (`Users`, `Expansions`, etc.).

**Solución:** Renombrar las tablas en Aiven:
```sql
USE pokemon_tcg_db;
RENAME TABLE users TO Users;
RENAME TABLE expansions TO Expansions;
RENAME TABLE cards TO Cards;
RENAME TABLE transactions TO Transactions;
```

Las tablas `PackInventory` y `CollectionAlbum` tenían conflictos de claves foráneas, así que se recrearon manualmente:
```sql
CREATE TABLE PackInventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  expansion_id INT NOT NULL,
  quantity INT DEFAULT 1,
  UNIQUE KEY unique_user_expansion (user_id, expansion_id),
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (expansion_id) REFERENCES Expansions(id)
);

CREATE TABLE CollectionAlbum (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_id INT NOT NULL,
  quantity INT DEFAULT 1,
  is_favorite TINYINT(1) DEFAULT 0,
  obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_card (user_id, card_id),
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (card_id) REFERENCES Cards(id)
);
```

---

## Paso 5: Desplegar Backend en Render.com

1. Registrarse en [render.com](https://render.com) con GitHub
2. **New +** → **Web Service** → conectar repositorio `pokemon-tcg-store`
3. Configuración:
   - **Root Directory:** `backend`
   - **Environment:** `Docker`
4. Añadir **Variables de Entorno** (Environment):

| Variable | Valor |
|---|---|
| `DB_HOST` | `mysql-679068b-ericperezleon3-61b8.c.aivencloud.com` |
| `DB_PORT` | `20386` |
| `DB_NAME` | `pokemon_tcg_db` |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | *(contraseña de Aiven)* |

5. Render construye automáticamente el Docker y arranca Javalin en el puerto 7070.

---

## Resultado Final

| Componente | URL |
|---|---|
| Frontend (GitHub Pages) | `https://ericpzl.github.io/pokemon-tcg-store/frontend/pages/index.html` |
| Backend (Render) | `https://pokemon-tcg-store.onrender.com` |
| Base de Datos (Aiven) | MySQL en la nube, accesible 24/7 |

> ⚠️ **Nota:** El plan gratuito de Render "duerme" el servidor si no hay actividad durante 15 minutos. La primera petición puede tardar ~30-60 segundos en "despertar" el servidor. Para un TFG esto es aceptable.

---

## Para Sincronizar Colecciones de Cartas
Una vez desplegado, usar el panel de administración para importar colecciones desde TCGdex:
```
https://ericpzl.github.io/pokemon-tcg-store/frontend/pages/admin.html
```
- Nombre: `Espada y Escudo Base`  
- Set ID: `swsh1`
- Precio: `250`
