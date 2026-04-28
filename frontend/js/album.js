let allCards = [];
let currentOpenedCard = null;

document.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
        alert("Debes iniciar sesión para ver tu álbum.");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);
    loadAlbum(user.id);

    // Setup filter listeners
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
            console.error("Error al cargar el álbum:", data.error);
            document.getElementById("album-container").innerHTML = `<p style="color: var(--error-color); margin-left: 2rem;">Error: ${data.error}</p>`;
        }
    } catch (error) {
        console.error("Error de conexión:", error);
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
        const cardEl = document.createElement("div");
        cardEl.className = "album-card";
        cardEl.onclick = () => openCardModal(card);
        
        cardEl.innerHTML = `
            <div class="badge-qty">x${card.quantity}</div>
            <div class="heart-icon ${card.favorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${card.cardId})">
                ${card.favorite ? '❤️' : '🤍'}
            </div>
            <div class="card-img-container">
                <img src="${card.imageUrl}" alt="${card.name}">
            </div>
            <h4 style="text-align: center;">${card.name}</h4>
            <span style="color: var(--text-muted); font-size: 0.8rem;">${card.type}</span>
        `;
        container.appendChild(cardEl);
    });
}

function openCardModal(card) {
    currentOpenedCard = card;
    document.getElementById("modal-img").src = card.imageUrl;
    document.getElementById("modal-name").textContent = card.name;
    document.getElementById("modal-rarity").textContent = card.rarity;
    document.getElementById("modal-type").textContent = card.type;
    document.getElementById("modal-hp").textContent = card.hp;
    document.getElementById("modal-qty").textContent = `x${card.quantity}`;
    document.getElementById("modal-price").textContent = card.price ? `${card.price} 🪙` : "0 🪙";
    
    let dateStr = card.obtainedAt;
    if (dateStr) {
        try {
            dateStr = new Date(dateStr.replace(' ', 'T')).toLocaleDateString();
        } catch(e){}
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

    document.getElementById("card-modal").style.display = "flex";

    // Setup Holo Effect
    const container = document.querySelector(".holo-card-container");
    const holoCard = document.getElementById("modal-holo-card");
    const glare = document.getElementById("modal-holo-glare");

    container.onmousemove = (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate rotation (-20 to 20 degrees)
        const xPct = x / rect.width;
        const yPct = y / rect.height;
        const rotateY = (xPct - 0.5) * 40;
        const rotateX = (0.5 - yPct) * 40;

        holoCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Glare effect
        glare.style.opacity = "1";
        glare.style.backgroundPosition = `${xPct * 100}% ${yPct * 100}%`;
    };

    container.onmouseleave = () => {
        holoCard.style.transform = `rotateX(0deg) rotateY(0deg)`;
        glare.style.opacity = "0";
    };
}

function closeCardModal() {
    document.getElementById("card-modal").style.display = "none";
    currentOpenedCard = null;
}

async function toggleFavorite(cardId) {
    const user = JSON.parse(localStorage.getItem("user"));
    
    const card = allCards.find(c => c.cardId === cardId);
    if (!card) return;
    
    // Optimistic update
    card.favorite = !card.favorite;
    renderAlbum();

    try {
        await fetch(`${API_BASE_URL}/album/favorite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, cardId: cardId })
        });
    } catch (error) {
        console.error("Error toggling favorite:", error);
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
