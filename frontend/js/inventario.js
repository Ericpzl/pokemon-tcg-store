document.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
        alert("Debes iniciar sesión para ver tu inventario.");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);
    const balanceEl = document.getElementById("nav-user-balance");
    if (balanceEl) {
        balanceEl.textContent = `${user.balance} 🪙`;
    }

    // Attempt to update cart counter for the nav bar
    const rawCart = localStorage.getItem("pokesobres_cart");
    const cart = rawCart ? JSON.parse(rawCart) : [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartLink = document.getElementById("nav-cart-link");
    if (cartLink) {
        cartLink.textContent = `Carrito (${totalItems})`;
    }

    loadInventory(user.id);
});

async function loadInventory(userId) {
    const container = document.getElementById("inventory-container");
    
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${userId}`);
        const packs = await response.json();

        container.innerHTML = "";

        if (!packs || packs.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; background: var(--bg-secondary); border-radius: 12px; border: 1px dashed var(--glass-border);">
                    <h4 style="color: var(--text-muted); margin-bottom: 1rem;">No tienes sobres en tu inventario</h4>
                    <button class="btn" onclick="window.location.href='index.html'">Ir a la Tienda</button>
                </div>
            `;
            return;
        }

        packs.forEach(pack => {
            const el = document.createElement("div");
            el.className = "pack-item";
            el.innerHTML = `
                <div class="pack-quantity">${pack.quantity}</div>
                <div class="pack-image">
                    ${pack.coverImage ? `<img src="${pack.coverImage}" alt="${pack.expansionName}">` : `<span style="color:#6366f1">Sin Portada</span>`}
                </div>
                <h4 style="margin-bottom: 1rem;">${pack.expansionName}</h4>
                <button class="btn btn-sm" style="width: 100%;" onclick="openPack(${pack.expansionId})">Abrir Sobre</button>
            `;
            container.appendChild(el);
        });

    } catch (error) {
        console.error("Error al cargar inventario:", error);
        container.innerHTML = `<p style="color: var(--error-color);">Error al cargar tu inventario.</p>`;
    }
}

window.openPack = async function(expansionId) {
    const userData = localStorage.getItem("user");
    if (!userData) return;
    const user = JSON.parse(userData);

    const modal = document.getElementById("opening-modal");
    const title = document.getElementById("opening-title");
    const track = document.getElementById("roulette-track");
    const actions = document.getElementById("opening-actions");

    track.style.transition = "none";
    track.style.transform = `translateX(0px)`;
    track.innerHTML = "";
    actions.style.display = "none";
    title.textContent = "Generando Ruleta...";
    title.style.color = "white";
    modal.style.display = "flex";

    try {
        const response = await fetch(`${API_BASE_URL}/inventory/open`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, expansionId: expansionId })
        });

        const data = await response.json();

        if (response.ok) {
            title.textContent = "¡Girando!";
            
            const wonCard = data.wonCard;
            const allCards = data.allCards;

            if (!allCards || allCards.length === 0) {
                throw new Error("No hay cartas para la ruleta.");
            }

            const totalCards = 50;
            const winnerIndex = 40; 
            
            const cardWidth = 200;
            const gap = 16; 
            const cardTotalWidth = cardWidth + gap;

            for (let i = 0; i < totalCards; i++) {
                let cardData;
                if (i === winnerIndex) {
                    cardData = wonCard;
                } else {
                    cardData = allCards[Math.floor(Math.random() * allCards.length)];
                }

                const cardEl = document.createElement("div");
                cardEl.className = "roulette-card";
                cardEl.id = `rc-${i}`;
                cardEl.innerHTML = `
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; overflow: hidden;">
                        ${cardData.imageUrl ? `<img src="${cardData.imageUrl}" style="max-width: 100%; max-height: 100%; border-radius: 4px;">` : `<span style="font-size:3rem">❓</span>`}
                    </div>
                `;
                track.appendChild(cardEl);
            }

            const randomOffset = (Math.random() - 0.5) * (cardWidth - 20);
            const finalTransform = -(winnerIndex * cardTotalWidth + cardWidth/2 + randomOffset);

            void track.offsetWidth; // Force reflow

            track.style.transition = "transform 6s cubic-bezier(0.15, 0.85, 0.15, 1)";
            track.style.transform = `translateX(${finalTransform}px)`;

            setTimeout(() => {
                const winnerCardEl = document.getElementById(`rc-${winnerIndex}`);
                if (winnerCardEl) {
                    winnerCardEl.classList.add("winner");
                }
                
                title.textContent = `¡Has conseguido a ${wonCard.name}!`;
                title.style.color = "var(--success-color)";
                actions.style.display = "flex";
                
                loadInventory(user.id);
            }, 6000);

        } else {
            title.textContent = "Error";
            title.style.color = "var(--error-color)";
            alert(data.error || "No se pudo abrir el sobre.");
            closeOpeningModal();
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión al abrir el sobre.");
        closeOpeningModal();
    }
}

window.closeOpeningModal = function() {
    document.getElementById("opening-modal").style.display = "none";
}
