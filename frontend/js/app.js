// Coin → EUR conversion rate: 100 coins = 0.99€
const COIN_TO_EUR = 0.99 / 100;

let allExpansions = [];
let selectedExpansions = new Set(); // expansion ids selected for bulk add
let currentModalExpansion = null;

document.addEventListener("DOMContentLoaded", () => {
    const userData = sessionStorage.getItem("user");
    if (!userData) {
        // Usamos el nuevo toast de error en lugar del alert
        showToast("⚠️ Debes iniciar sesión para acceder a la tienda.", "error");
        
        // Retrasamos la redirección para que el usuario pueda leer el mensaje
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2500);
        return;
    }

    const user = JSON.parse(userData);
    const balanceEl = document.getElementById("nav-user-balance");
    if (balanceEl) balanceEl.textContent = `${user.balance} 🪙`;

    updateCartCounter();
    loadExpansions();
    loadRanking();
    checkDailyStatus();
});

// ──────────────────────────────────────────────────────────────
// Load expansions
// ──────────────────────────────────────────────────────────────
async function loadExpansions() {
    try {
        const response = await fetch(`${API_BASE_URL}/expansions`);
        const expansions = await response.json();
        allExpansions = expansions;
        renderExpansions();
    } catch (error) {
        console.error("Error cargando sobres:", error);
    }
}

function renderExpansions() {
    const storeContainer = document.getElementById("store-container");
    storeContainer.innerHTML = "";

    if (allExpansions.length === 0) {
        storeContainer.innerHTML = '<p style="color: var(--text-muted);">No hay sobres disponibles en este momento.</p>';
        return;
    }

    allExpansions.forEach(exp => {
        const isSelected = selectedExpansions.has(exp.id);
        const realPrice = (exp.packPrice * COIN_TO_EUR).toFixed(2);

        const card = document.createElement("div");
        card.className = `expansion-card ${isSelected ? "selected" : ""}`;
        card.id = `exp-${exp.id}`;
        card.innerHTML = `
            <!-- Select toggle -->
            <div class="card-select-btn ${isSelected ? "checked" : ""}" 
                 onclick="event.stopPropagation(); toggleSelectExp(${exp.id})" title="Seleccionar varios">
                ${isSelected ? "✓" : "🏷️"}
            </div>

            <!-- Cover image (fixed framing) -->
            <div class="exp-img-wrap" onclick="openPackModal(${exp.id})">
                ${exp.coverImage
                    ? `<img src="${exp.coverImage}" alt="${exp.name}" loading="lazy">`
                    : `<span style="color:#6366f1;font-size:2rem;">📦</span>`}
            </div>

            <h4 style="margin-bottom:0.3rem;" onclick="openPackModal(${exp.id})">${exp.name}</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.8rem;">
                📅 ${exp.releaseDate || 'N/A'}
            </p>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                <span style="font-weight:bold; color: var(--success-color);">
                    ${exp.packPrice} 🪙
                    <span style="color:var(--text-muted); font-size:0.75rem; display:block;">≈ ${realPrice}€</span>
                </span>
                <button class="btn btn-sm" onclick="event.stopPropagation(); quickAddToCart(${exp.id})">
                    🛒 Carrito
                </button>
            </div>
        `;
        storeContainer.appendChild(card);
    });

    updateCartBar();
}

// ──────────────────────────────────────────────────────────────
// Pack Detail Modal
// ──────────────────────────────────────────────────────────────
const PACK_DESCRIPTIONS = [
    "Una colección repleta de Pokémon poderosos y cartas especiales de entrenador. Consigue tus favoritos y construye el mazo definitivo.",
    "Descubre criaturas míticas y ataques devastadores. Cada sobre es una aventura llena de sorpresas y rarísimas cartas holográficas.",
    "Colección con cartas de edición especial, incluyendo versiones alternativas y poderosos Pokémon-ex que cambiarán tu estrategia.",
    "Nuevas mecánicas de juego y Pokémon nunca vistos antes. La expansión más esperada por los coleccionistas y jugadores competitivos.",
    "Un viaje a través de todas las regiones Pokémon. Sorpréndete con ilustraciones espectaculares y habilidades únicas.",
];

window.openPackModal = function(expId) {
    const exp = allExpansions.find(e => e.id === expId);
    if (!exp) return;
    currentModalExpansion = exp;

    document.getElementById("modal-pack-img").src = exp.coverImage || "";
    document.getElementById("modal-pack-name").textContent = exp.name;
    document.getElementById("modal-pack-tag").textContent = "Colección Pokémon TCG";
    document.getElementById("modal-pack-coins").textContent = `${exp.packPrice} 🪙`;
    document.getElementById("modal-pack-real").textContent = `≈ ${(exp.packPrice * COIN_TO_EUR).toFixed(2)} €`;
    document.getElementById("modal-pack-date").textContent = exp.releaseDate || "N/A";

    // Random but consistent description per expansion
    const descIdx = exp.id % PACK_DESCRIPTIONS.length;
    document.getElementById("modal-pack-desc").textContent = PACK_DESCRIPTIONS[descIdx];

    document.getElementById("pack-modal").style.display = "flex";
};

window.closePackModal = function() {
    document.getElementById("pack-modal").style.display = "none";
    currentModalExpansion = null;
};

window.addCurrentPackToCart = function() {
    if (!currentModalExpansion) return;
    quickAddToCart(currentModalExpansion.id);
    closePackModal();
};

// ──────────────────────────────────────────────────────────────
// Multi-select logic
// ──────────────────────────────────────────────────────────────
window.toggleSelectExp = function(expId) {
    if (selectedExpansions.has(expId)) {
        selectedExpansions.delete(expId);
    } else {
        selectedExpansions.add(expId);
    }
    renderExpansions();
};

function updateCartBar() {
    const bar = document.getElementById("cart-bar");
    if (selectedExpansions.size === 0) { bar.style.display = "none"; return; }

    const total = allExpansions
        .filter(e => selectedExpansions.has(e.id))
        .reduce((sum, e) => sum + e.packPrice, 0);

    document.getElementById("cart-bar-count").textContent = selectedExpansions.size;
    document.getElementById("cart-bar-total").textContent = total;
    bar.style.display = "flex";
}

window.addSelectionToCart = function() {
    if (selectedExpansions.size === 0) return;
    selectedExpansions.forEach(expId => {
        const exp = allExpansions.find(e => e.id === expId);
        if (exp) _addToCartRaw(exp.id, exp.name, exp.packPrice, exp.coverImage);
    });
    // Llamada original que ahora usará el tipo 'info' por defecto
    showToast(`✅ ${selectedExpansions.size} sobre(s) añadido(s) al carrito`);
    selectedExpansions.clear();
    renderExpansions();
    updateCartCounter();
};

window.clearSelection = function() {
    selectedExpansions.clear();
    renderExpansions();
};

// ──────────────────────────────────────────────────────────────
// Cart helpers
// ──────────────────────────────────────────────────────────────
window.quickAddToCart = function(expId) {
    const exp = allExpansions.find(e => e.id === expId);
    if (!exp) return;
    _addToCartRaw(exp.id, exp.name, exp.packPrice, exp.coverImage);
    // Llamada original que ahora usará el tipo 'info' por defecto
    showToast(`🛒 "${exp.name}" añadido al carrito`);
    updateCartCounter();
};

function _addToCartRaw(id, name, price, coverImage) {
    let cart = JSON.parse(sessionStorage.getItem("pokesobres_cart") || "[]");
    const existing = cart.find(item => item.expansionId === id);
    if (existing) { existing.quantity += 1; }
    else { cart.push({ expansionId: id, expansionName: name, unitPrice: price, quantity: 1, coverImage: coverImage }); }
    sessionStorage.setItem("pokesobres_cart", JSON.stringify(cart));
}

// Keep backward-compat alias
window.addToCart = function(id, name, price, coverImage) {
    _addToCartRaw(id, name, price, coverImage);
    showToast(`🛒 "${name}" añadido al carrito`);
    updateCartCounter();
};

// ──────────────────────────────────────────────────────────────
// El sistema de Notificaciones (Toasts) ahora se encuentra globalmente en config.js

function updateCartCounter() {
    let cart = JSON.parse(sessionStorage.getItem("pokesobres_cart") || "[]");
    let total = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartLink = document.getElementById("nav-cart-link");
    if (cartLink) cartLink.textContent = `Carrito (${total})`;
}

// ──────────────────────────────────────────────────────────────
// Ranking
// ──────────────────────────────────────────────────────────────
async function loadRanking() {
    try {
        const response = await fetch(`${API_BASE_URL}/ranking`);
        const ranking = await response.json();
        const rankingList = document.getElementById("ranking-list");
        rankingList.innerHTML = "";
        ranking.forEach((user, index) => {
            const li = document.createElement("li");
            li.style.cssText = "display:flex;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid var(--glass-border);";
            const medals = ["🥇 ", "🥈 ", "🥉 "];
            li.innerHTML = `
                <span>${medals[index] || `${index+1}. `}${user.username}</span>
                <span style="color:var(--success-color);font-weight:600;">${user.balance} 🪙</span>
            `;
            rankingList.appendChild(li);
        });
    } catch (error) { console.error("Error cargando ranking:", error); }
}

// ──────────────────────────────────────────────────────────────
// Daily pack
// ──────────────────────────────────────────────────────────────
let dailyCountdownInterval = null;

async function checkDailyStatus() {
    const userData = sessionStorage.getItem("user");
    if (!userData) return;
    const user = JSON.parse(userData);
    const btn = document.getElementById("btn-claim-daily");
    const countdown = document.getElementById("daily-countdown");
    if (!btn || !countdown) return;

    try {
        const response = await fetch(`${API_BASE_URL}/store/daily-status/${user.id}`);
        const data = await response.json();
        if (!response.ok) return;

        let msUntilNext = data.msUntilNext;
        if (dailyCountdownInterval) clearInterval(dailyCountdownInterval);

        if (msUntilNext <= 0) {
            btn.style.display = "inline-block";
            countdown.style.display = "none";
        } else {
            btn.style.display = "none";
            countdown.style.display = "inline-block";
            const tick = () => {
                if (msUntilNext <= 0) {
                    clearInterval(dailyCountdownInterval);
                    btn.style.display = "inline-block";
                    countdown.style.display = "none";
                    return;
                }
                const h = Math.floor(msUntilNext / 3600000);
                const m = Math.floor((msUntilNext % 3600000) / 60000);
                const s = Math.floor((msUntilNext % 60000) / 1000);
                countdown.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                msUntilNext -= 1000;
            };
            tick();
            dailyCountdownInterval = setInterval(tick, 1000);
        }
    } catch (error) { console.error("Error checking daily status:", error); }
}

window.claimDailyPack = async function() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    try {
        const response = await fetch(`${API_BASE_URL}/store/daily-claim`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id })
        });
        const data = await response.json();
        if (response.ok) {
            const packName = data.wonCard ? data.wonCard.name : "Diario";
            showToast(`🎁 ¡Sobre "${packName}" reclamado con éxito! Ve a tu Inventario.`, "success");
            checkDailyStatus();
        } else {
            // Toast de error devuelto por la API
            showToast(`❌ ${data.error}`, "error");
        }
    } catch { 
        // Toast de error de conexión
        showToast("❌ Error al reclamar el sobre.", "error"); 
    }
};