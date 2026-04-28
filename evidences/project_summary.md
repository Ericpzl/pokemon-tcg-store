# Resumen del Proyecto - Pokémon TCG Store

## Descripción
Aplicación web full-stack que simula una tienda de cartas coleccionables Pokémon TCG. Los usuarios pueden registrarse, comprar sobres con monedas virtuales, abrirlos con una animación de ruleta 3D, y gestionar su colección en un álbum digital.

---

## Stack Tecnológico

### Backend
- **Lenguaje:** Java 17
- **Framework:** Javalin (ligero, sin Spring)
- **Base de Datos:** MySQL (via JDBC)
- **Arquitectura:** REST API (MVC)
- **Empaquetado:** Maven + Fat JAR (shade plugin)

### Frontend
- **HTML5 + CSS3 + JavaScript Vanilla** (sin frameworks)
- **Animaciones:** CSS 3D transforms (ruleta de apertura de sobres)
- **Fuentes:** Google Fonts (Inter)

### Infraestructura
- **Contenedores:** Docker + Docker Compose
  - `backend`: Contenedor Java (Alpine JRE)
  - `frontend`: Contenedor Nginx
- **API externa:** TCGdex (gratuita, sin clave)

---

## Arquitectura de la Aplicación

```
pokemon-tcg-project/
├── backend/                  ← Servidor Java/Javalin
│   ├── src/main/java/
│   │   ├── controller/       ← Endpoints REST
│   │   ├── service/          ← Lógica de negocio
│   │   ├── dao/              ← Acceso a base de datos
│   │   ├── model/            ← Modelos de datos
│   │   └── util/             ← DBConnection, JWT
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                 ← Web estática (Nginx)
│   ├── pages/                ← HTML de cada pantalla
│   ├── js/                   ← Lógica JavaScript
│   ├── css/                  ← Estilos
│   └── Dockerfile
├── evidences/                ← Documentación del proyecto
│   ├── walkthrough.md        ← Guía de despliegue
│   ├── tasks.md              ← Lista de tareas
│   └── project_summary.md   ← Este archivo
└── docker-compose.yml        ← Orquestación de contenedores
```

---

## Funcionalidades Implementadas

| Funcionalidad | Estado |
|---|---|
| Registro e inicio de sesión | ✅ |
| Tienda de sobres | ✅ |
| Carrito de compra | ✅ |
| Apertura de sobres (ruleta 3D) | ✅ |
| Álbum de colección | ✅ |
| Ranking de usuarios | ✅ |
| Recompensa diaria (Daily Reward) | ✅ |
| Añadir fondos (saldo) | ✅ |
| Docker (Frontend + Backend) | ✅ |
| Sincronización con TCGdex API | ✅ |
| Panel de Administración | ✅ |
| Despliegue en la nube | 🔄 En progreso |
