// ════════════════════════════════════════════════════════════
//  SOUND ENGINE  –  suave, estilo baraja de cartas
// ════════════════════════════════════════════════════════════
const SoundFX = (() => {
    let ctx = null;

    function init() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") ctx.resume();
    }

    // Soft "click" — sine + lowpass filter, very short envelope
    function tick(delaySeconds, freq = 320, volume = 0.07) {
        if (!ctx) return;
        const now = ctx.currentTime;
        const t   = now + delaySeconds;

        const osc    = ctx.createOscillator();
        const gain   = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        // Very fast attack, super short decay → sounds like a soft click
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, t);   // cut harshness

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.06);
    }

    // Gentle winner chime — soft sine bell
    function winnerDing(delaySeconds) {
        if (!ctx) return;
        const now = ctx.currentTime;
        const t   = now + delaySeconds;
        [523, 659, 784].forEach((freq, i) => {   // C5 - E5 - G5 (major chord)
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, t + i * 0.07);
            gain.gain.setValueAtTime(0, t + i * 0.07);
            gain.gain.linearRampToValueAtTime(0.12, t + i * 0.07 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 1.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + i * 0.07);
            osc.stop(t + i * 0.07 + 1.5);
        });
    }

    function scheduleRouletteSounds(totalDuration = 6) {
        if (!ctx) return;
        const TICKS = 38;
        for (let i = 0; i < TICKS; i++) {
            const progress = i / TICKS;
            const eased = 1 - Math.pow(1 - progress, 2.4);
            const t    = eased * (totalDuration - 0.3);
            // Pitch gently drops from 400 → 220 Hz as speed slows
            const freq = 400 - progress * 180;
            tick(t, freq, 0.07);
        }
        // Last slow taps
        [5.1, 5.4, 5.65, 5.82, 5.94].forEach((t, i) => {
            tick(t, 220 - i * 15, 0.06);
        });
        winnerDing(totalDuration + 0.15);
    }

    return { init, scheduleRouletteSounds };
})();


// ════════════════════════════════════════════════════════════
//  INVENTORY LOGIC
// ════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
        alert("Debes iniciar sesión para ver tu inventario.");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);
    const balanceEl = document.getElementById("nav-user-balance");
    if (balanceEl) balanceEl.textContent = `${user.balance} 🪙`;

    const rawCart = localStorage.getItem("pokesobres_cart");
    const cart = rawCart ? JSON.parse(rawCart) : [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartLink = document.getElementById("nav-cart-link");
    if (cartLink) cartLink.textContent = `Carrito (${totalItems})`;

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
                <div style="grid-column:1/-1;text-align:center;padding:4rem 0;background:var(--bg-secondary);border-radius:12px;border:1px dashed var(--glass-border);">
                    <h4 style="color:var(--text-muted);margin-bottom:1rem;">No tienes sobres en tu inventario</h4>
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
                    ${pack.coverImage
                        ? `<img src="${pack.coverImage}" alt="${pack.expansionName}">`
                        : `<span style="color:#6366f1">Sin Portada</span>`}
                </div>
                <h4 style="margin-bottom:1rem;">${pack.expansionName}</h4>
                <button class="btn btn-sm" style="width:100%;" onclick="openPack(${pack.expansionId})">
                    ▶ Abrir Sobre
                </button>
            `;
            container.appendChild(el);
        });

    } catch (error) {
        console.error("Error al cargar inventario:", error);
        container.innerHTML = `<p style="color:var(--error-color);">Error al cargar tu inventario.</p>`;
    }
}

window.openPack = async function(expansionId) {
    const userData = localStorage.getItem("user");
    if (!userData) return;
    const user = JSON.parse(userData);

    // 🔊 Init AudioContext AQUI — sincrono dentro del click handler
    SoundFX.init();

    const modal   = document.getElementById("opening-modal");
    const title   = document.getElementById("opening-title");
    const track   = document.getElementById("roulette-track");
    const actions = document.getElementById("opening-actions");

    track.style.transition = "none";
    track.style.transform  = "translateX(0px)";
    track.innerHTML = "";
    actions.style.display = "none";
    title.textContent = "Preparando sobre...";
    title.style.color = "white";

    // Show spinner, hide roulette
    document.getElementById("opening-loading").style.display = "flex";
    document.getElementById("roulette-container").style.display = "none";

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

            // Hide spinner, show roulette
            document.getElementById("opening-loading").style.display = "none";
            document.getElementById("roulette-container").style.display = "flex";

            const wonCard  = data.wonCard;
            const allCards = data.allCards;

            if (!allCards || allCards.length === 0) throw new Error("No hay cartas para la ruleta.");

            const TOTAL_CARDS  = 50;
            const WINNER_INDEX = 40;
            const CARD_WIDTH   = 200;
            const GAP          = 16;
            const CARD_TOTAL   = CARD_WIDTH + GAP;
            const SPIN_DURATION = 6; // seconds (must match CSS transition)

            // Build roulette cards
            for (let i = 0; i < TOTAL_CARDS; i++) {
                const cardData = (i === WINNER_INDEX)
                    ? wonCard
                    : allCards[Math.floor(Math.random() * allCards.length)];

                const cardEl = document.createElement("div");
                cardEl.className = "roulette-card";
                cardEl.id = `rc-${i}`;
                cardEl.innerHTML = `
                    <div style="flex:1;display:flex;align-items:center;justify-content:center;width:100%;overflow:hidden;">
                        ${cardData.imageUrl
                            ? `<img src="${cardData.imageUrl}" style="max-width:100%;max-height:100%;border-radius:4px;">`
                            : `<span style="font-size:3rem">❓</span>`}
                    </div>
                `;
                track.appendChild(cardEl);
            }

            const randomOffset  = (Math.random() - 0.5) * (CARD_WIDTH - 20);
            const finalTransform = -(WINNER_INDEX * CARD_TOTAL + CARD_WIDTH / 2 + randomOffset);

            void track.offsetWidth; // force reflow

            // 🔊 Start sounds BEFORE spinning so first tick fires immediately
            SoundFX.scheduleRouletteSounds(SPIN_DURATION);

            track.style.transition = `transform ${SPIN_DURATION}s cubic-bezier(0.15, 0.85, 0.15, 1)`;
            track.style.transform  = `translateX(${finalTransform}px)`;

            setTimeout(() => {
                const winnerEl = document.getElementById(`rc-${WINNER_INDEX}`);
                if (winnerEl) winnerEl.classList.add("winner");

                title.textContent = `¡Has conseguido a ${wonCard.name}!`;
                title.style.color = "var(--success-color)";
                actions.style.display = "flex";

                loadInventory(user.id);
            }, SPIN_DURATION * 1000);

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
};

window.closeOpeningModal = function() {
    document.getElementById("opening-modal").style.display = "none";
};
