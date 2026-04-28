document.addEventListener("DOMContentLoaded", () => {
    // Verificar sesión (simulada)
    const userData = localStorage.getItem("user");
    if (!userData) {
        alert("Debes iniciar sesión para acceder a la tienda.");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);
    
    const balanceEl = document.getElementById("nav-user-balance");
    if (balanceEl) {
        balanceEl.textContent = `${user.balance} 🪙`;
    }

    updateCartCounter();
    loadExpansions();
    loadRanking();
    checkDailyStatus();
});

async function loadExpansions() {
    try {
        const response = await fetch(`${API_BASE_URL}/expansions`);
        const expansions = await response.json();
        const storeContainer = document.getElementById("store-container");

        storeContainer.innerHTML = ""; // Limpiar loading

        if (expansions.length === 0) {
            storeContainer.innerHTML = '<p style="color: var(--text-muted);">No hay sobres disponibles en este momento.</p>';
            return;
        }

        expansions.forEach(exp => {
            const card = document.createElement("div");
            card.className = "expansion-card";
            card.innerHTML = `
                <div class="exp-image" style="background-color: rgba(255,255,255,0.05); height: 180px; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-bottom: 1rem;">
                    ${exp.coverImage ? `<img src="${exp.coverImage}" alt="${exp.name}" style="max-height: 100%; border-radius: 8px;">` : `<span style="color:#6366f1">Sin Portada</span>`}
                </div>
                <h4>${exp.name}</h4>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Lanzamiento: ${exp.releaseDate || 'N/A'}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <span style="font-weight: bold; color: var(--success-color);">${exp.packPrice} 🪙</span>
                    <button class="btn btn-sm" onclick="addToCart(${exp.id}, '${exp.name.replace(/'/g, "\\'")}', ${exp.packPrice}, '${exp.coverImage || ''}')">Añadir al Carrito</button>
                </div>
            `;
            storeContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error cargando sobres:", error);
    }
}

async function loadRanking() {
    try {
        const response = await fetch(`${API_BASE_URL}/ranking`);
        const ranking = await response.json();
        const rankingList = document.getElementById("ranking-list");

        rankingList.innerHTML = "";

        ranking.forEach((user, index) => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.padding = "0.75rem 0";
            li.style.borderBottom = "1px solid var(--glass-border)";
            
            let medalla = "";
            if(index === 0) medalla = "🥇 ";
            else if(index === 1) medalla = "🥈 ";
            else if(index === 2) medalla = "🥉 ";
            else medalla = `${index + 1}. `;

            li.innerHTML = `
                <span>${medalla}${user.username}</span>
                <span style="color: var(--success-color); font-weight: 600;">${user.balance} 🪙</span>
            `;
            rankingList.appendChild(li);
        });

    } catch (error) {
        console.error("Error cargando ranking:", error);
    }
}

// Lógica temporal para que al pulsar 'Añadir al Carrito' en la tienda se guarden datos
window.addToCart = function(id, name, price, coverImage) {
    let rawCart = localStorage.getItem("pokesobres_cart");
    let cart = rawCart ? JSON.parse(rawCart) : [];

    const existingItem = cart.find(item => item.expansionId === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            expansionId: id,
            expansionName: name,
            unitPrice: price,
            quantity: 1,
            coverImage: coverImage
        });
    }

    localStorage.setItem("pokesobres_cart", JSON.stringify(cart));
    alert(name + " añadido al carrito.");
    updateCartCounter();
};

function updateCartCounter() {
    let rawCart = localStorage.getItem("pokesobres_cart");
    let cart = rawCart ? JSON.parse(rawCart) : [];
    
    let totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartLink = document.getElementById("nav-cart-link");
    if (cartLink) {
        cartLink.textContent = `Carrito (${totalItems})`;
    }
}

let dailyCountdownInterval = null;

async function checkDailyStatus() {
    const userData = localStorage.getItem("user");
    if (!userData) return;
    const user = JSON.parse(userData);

    const btn = document.getElementById("btn-claim-daily");
    const countdown = document.getElementById("daily-countdown");
    if (!btn || !countdown) return; // Not on index.html

    try {
        const response = await fetch(`${API_BASE_URL}/store/daily-status/${user.id}`);
        const data = await response.json();

        if (response.ok) {
            let msUntilNext = data.msUntilNext;

            if (dailyCountdownInterval) clearInterval(dailyCountdownInterval);

            if (msUntilNext <= 0) {
                btn.style.display = "inline-block";
                countdown.style.display = "none";
            } else {
                btn.style.display = "none";
                countdown.style.display = "inline-block";
                
                const updateTimer = () => {
                    if (msUntilNext <= 0) {
                        clearInterval(dailyCountdownInterval);
                        btn.style.display = "inline-block";
                        countdown.style.display = "none";
                        return;
                    }
                    
                    const h = Math.floor(msUntilNext / (1000 * 60 * 60));
                    const m = Math.floor((msUntilNext % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((msUntilNext % (1000 * 60)) / 1000);
                    countdown.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                    msUntilNext -= 1000;
                };
                
                updateTimer();
                dailyCountdownInterval = setInterval(updateTimer, 1000);
            }
        }
    } catch (error) {
        console.error("Error checking daily status:", error);
    }
}

window.claimDailyPack = async function() {
    const user = JSON.parse(localStorage.getItem("user"));
    try {
        const response = await fetch(`${API_BASE_URL}/store/daily-claim`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id })
        });
        const data = await response.json();
        if (response.ok) {
            alert(`¡Sobre reclamado con éxito! Ve a tu Inventario para abrirlo.`);
            checkDailyStatus();
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert("Error al reclamar el sobre.");
    }
}
