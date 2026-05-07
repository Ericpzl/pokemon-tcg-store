// Este archivo determina automáticamente si la web se está ejecutando en local o en la nube (ej. GitHub Pages).
// Y dependiendo de eso, envía las peticiones a localhost o al servidor de Render.

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Rellena la URL de producción cuando la despliegues en Render
const PRODUCTION_API_URL = "https://pokemon-tcg-store.onrender.com/api";
const LOCAL_API_URL = "http://localhost:7070/api";

const API_BASE_URL = isLocalhost ? LOCAL_API_URL : PRODUCTION_API_URL;

// Sistema de Notificaciones (Toasts) global
window.showToast = function(msg, type = 'info') {
    const t = document.createElement("div");
    t.className = `custom-toast toast-${type}`;
    t.innerHTML = msg; 
    
    document.body.appendChild(t);
    
    requestAnimationFrame(() => {
        t.classList.add("show");
    });

    setTimeout(() => {
        t.classList.remove("show");
        setTimeout(() => t.remove(), 300); 
    }, 3000);
}
