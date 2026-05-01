let allCards = [];
let currentOpenedCard = null;
let selectedCards = new Set(); // cardIds seleccionadas para vender

document.addEventListener("DOMContentLoaded", () => {
    const userData = sessionStorage.getItem("user");
    if (!userData) {
        alert("Debes iniciar sesión para ver tu álbum.");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);
    loadAlbum(user.id);

    document.getElementById("filter-name").addEventListener("input", renderAlbum);
    document.getElementById("filter-type").addEventListener("change", renderAlbum);
    document.getElementById("filter-rarity").addEventListener("change", renderAlbum);
    document.getElementById("filter-favorites").addEventListener("change", renderAlbum);
});

async function loadAlbum(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/album/${userId}`);
        const data = await response.json();
        if (response.ok) {
            allCards = data;
            renderAlbum();
        } else {
            document.getElementById("album-container").innerHTML = `<p style="color: var(--error-color); margin-left: 2rem;">Error: ${data.error}</p>`;
        }
    } catch (error) {
        document.getElementById("album-container").innerHTML = `<p style="color: var(--error-color); margin-left: 2rem;">Error de conexión.</p>`;
    }
}

function renderAlbum() {
    const container = document.getElementById("album-container");

    const nameFilter = document.getElementById("filter-name").value.toLowerCase();
    const typeFilter = document.getElementById("filter-type").value;
    const rarityFilter = document.getElementById("filter-rarity").value;
    const favFilter = document.getElementById("filter-favorites").checked;

    const filtered = allCards.filter(card => {
        if (nameFilter && !card.name.toLowerCase().includes(nameFilter)) return false;
        if (typeFilter && card.type !== typeFilter) return false;
        if (rarityFilter && card.rarity !== rarityFilter) return false;
        if (favFilter && !card.favorite) return false;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); margin-left: 2rem; grid-column: 1/-1;">No tienes cartas que coincidan con estos filtros.</p>`;
        return;
    }

    container.innerHTML = "";
    filtered.forEach(card => {
        const isSelected = selectedCards.has(card.cardId);
        const cardEl = document.createElement("div");
        cardEl.className = `album-card ${isSelected ? "card-selected" : ""}`;
        cardEl.id = `card-${card.cardId}`;

        cardEl.innerHTML = `
            <div class="badge-qty">x${card.quantity}</div>
            <div class="heart-icon ${card.favorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${card.cardId})">
                ${card.favorite ? '❤️' : '🤍'}
            </div>
            <div class="sell-checkbox ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation(); toggleSelect(${card.cardId})" title="Seleccionar para vender">
                ${isSelected ? '✓' : '🏷️'}
            </div>
            <div class="card-img-container" onclick="openCardModal(card)">
                <img src="${card.imageUrl}" alt="${card.name}">
            </div>
            <h4 style="text-align: center;">${card.name}</h4>
            <span style="color: var(--text-muted); font-size: 0.8rem;">${card.type} · ${card.price.toFixed(0)}🪙</span>
        `;

        // Pass card object via closure for click
        cardEl.querySelector(".card-img-container").onclick = () => openCardModal(card);
        container.appendChild(cardEl);
    });

    updateSellBar();
}

function toggleSelect(cardId) {
    if (selectedCards.has(cardId)) {
        selectedCards.delete(cardId);
    } else {
        selectedCards.add(cardId);
    }
    renderAlbum();
}

function updateSellBar() {
    const bar = document.getElementById("sell-bar");
    if (selectedCards.size === 0) {
        bar.style.display = "none";
        return;
    }

    // Calculate total earn
    const total = allCards
        .filter(c => selectedCards.has(c.cardId))
        .reduce((sum, c) => sum + c.price, 0);

    document.getElementById("sell-bar-count").textContent = selectedCards.size;
    document.getElementById("sell-bar-total").textContent = total.toFixed(0);
    bar.style.display = "flex";
}

async function confirmSell() {
    if (selectedCards.size === 0) return;

    const user = JSON.parse(sessionStorage.getItem("user"));
    const cardIds = Array.from(selectedCards);

    const total = allCards
        .filter(c => selectedCards.has(c.cardId))
        .reduce((sum, c) => sum + c.price, 0);

    if (!confirm(`¿Vender ${cardIds.length} carta(s) por ${total.toFixed(0)}🪙?`)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/album/sell`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, cardIds: cardIds })
        });
        const data = await response.json();

        if (response.ok) {
            // Update local balance display
            const newBalance = Math.round(data.coinsEarned);
            showSellSuccess(newBalance);

            // Clear selection and reload
            selectedCards.clear();
            await loadAlbum(user.id);

            // Update nav balance if possible
            if (window.updateNavBalance) window.updateNavBalance();
        } else {
            alert("Error al vender: " + (data.error || "Error desconocido"));
        }
    } catch (err) {
        alert("Error de conexión al vender.");
    }
}

function showSellSuccess(earned) {
    const toast = document.createElement("div");
    toast.className = "sell-toast";
    toast.innerHTML = `✅ ¡Vendido! +${earned.toFixed(0)}🪙`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function cancelSell() {
    selectedCards.clear();
    renderAlbum();
}

function openCardModal(card) {
    currentOpenedCard = card;
    document.getElementById("modal-img").src = card.imageUrl;
    document.getElementById("modal-name").textContent = card.name;
    document.getElementById("modal-rarity").textContent = card.rarity;
    document.getElementById("modal-type").textContent = card.type;
    document.getElementById("modal-hp").textContent = card.hp;
    document.getElementById("modal-qty").textContent = `x${card.quantity}`;
    document.getElementById("modal-price").textContent = card.price ? `${card.price.toFixed(0)} 🪙` : "0 🪙";

    let dateStr = card.obtainedAt;
    if (dateStr) {
        try { dateStr = new Date(dateStr.replace(' ', 'T')).toLocaleDateString(); } catch(e){}
    }
    document.getElementById("modal-date").textContent = dateStr || "-";

    const favBtn = document.getElementById("modal-fav-btn");
    if (card.favorite) {
        favBtn.classList.add("active");
        favBtn.innerHTML = "❤️ Quitar de Favoritos";
    } else {
        favBtn.classList.remove("active");
        favBtn.innerHTML = "🤍 Añadir a Favoritos";
    }

    // Update sell button in modal
    const sellBtn = document.getElementById("modal-sell-btn");
    const isSelected = selectedCards.has(card.cardId);
    sellBtn.textContent = isSelected ? "✓ Seleccionada para vender" : `Vender (${card.price.toFixed(0)}🪙)`;
    sellBtn.style.opacity = isSelected ? "0.6" : "1";

    document.getElementById("card-modal").style.display = "flex";

    const container = document.querySelector(".holo-card-container");
    const holoCard = document.getElementById("modal-holo-card");
    const glare = document.getElementById("modal-holo-glare");

    container.onmousemove = (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPct = x / rect.width;
        const yPct = y / rect.height;
        holoCard.style.transform = `rotateX(${(0.5 - yPct) * 40}deg) rotateY(${(xPct - 0.5) * 40}deg)`;
        glare.style.opacity = "1";
        glare.style.backgroundPosition = `${xPct * 100}% ${yPct * 100}%`;
    };
    container.onmouseleave = () => {
        holoCard.style.transform = `rotateX(0deg) rotateY(0deg)`;
        glare.style.opacity = "0";
    };
}

function sellFromModal() {
    if (!currentOpenedCard) return;
    toggleSelect(currentOpenedCard.cardId);
    closeCardModal();
}

function closeCardModal() {
    document.getElementById("card-modal").style.display = "none";
    currentOpenedCard = null;
}

async function toggleFavorite(cardId) {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const card = allCards.find(c => c.cardId === cardId);
    if (!card) return;
    card.favorite = !card.favorite;
    renderAlbum();
    try {
        await fetch(`${API_BASE_URL}/album/favorite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, cardId: cardId })
        });
    } catch (error) {
        card.favorite = !card.favorite;
        renderAlbum();
    }
}

function toggleFavoriteFromModal() {
    if (currentOpenedCard) {
        toggleFavorite(currentOpenedCard.cardId);
        const favBtn = document.getElementById("modal-fav-btn");
        if (currentOpenedCard.favorite) {
            favBtn.classList.add("active");
            favBtn.innerHTML = "❤️ Quitar de Favoritos";
        } else {
            favBtn.classList.remove("active");
            favBtn.innerHTML = "🤍 Añadir a Favoritos";
        }
    }
}
