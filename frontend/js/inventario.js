// ════════════════════════════════════════════════════════════
//  SOUND ENGINE  –  Web Audio API (no external files needed)
// ════════════════════════════════════════════════════════════
const SoundFX = (() => {
    let ctx = null;

    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        return ctx;
    }

    /**
     * CS:GO-style tick: short percussive blip
     * @param {number} t  – delay in seconds from now
     * @param {number} freq  – pitch (higher = earlier/faster card)
     */
    function scheduleTick(t, freq = 900) {
        const ac = getCtx();
        const now = ac.currentTime;

        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + t);

        gain.gain.setValueAtTime(0, now + t);
        gain.gain.linearRampToValueAtTime(0.25, now + t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.08);

        osc.connect(gain);
        gain.connect(ac.destination);

        osc.start(now + t);
        osc.stop(now + t + 0.1);
    }

    /**
     * Winner "ding" – pleasant bell-like tone
     * @param {number} t – delay in seconds from now
     */
    function scheduleWinnerDing(t) {
        const ac = getCtx();
        const now = ac.currentTime;

        // Fundamental
        [1, 2, 3].forEach((harmonic, i) => {
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(880 * harmonic, now + t);
            gain.gain.setValueAtTime(0, now + t);
            gain.gain.linearRampToValueAtTime(0.35 / harmonic, now + t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 1.5 - i * 0.2);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(now + t);
            osc.stop(now + t + 2);
        });
    }

    /**
     * Schedule all ticks for a 6-second roulette spin.
     * Mimics CS:GO case: dense at start → sparse at end.
     * Uses an ease-out curve to space the ~38 ticks.
     */
    function scheduleRouletteSounds(totalDuration = 6) {
        const ac = getCtx();
        if (ac.state === "suspended") ac.resume();

        const TICKS = 38;

        for (let i = 0; i < TICKS; i++) {
            const progress = i / TICKS;                      // 0 → 1
            // ease-out: pack fast at first, slows toward end
            const eased = 1 - Math.pow(1 - progress, 2.4);
            const t = eased * (totalDuration - 0.15);        // time offset

            // Pitch drops as speed slows (like CSGO)
            const freq = 1100 - progress * 350;

            scheduleTick(t, freq);
        }

        // Extra slow ticks at the very end (last 1.5 s)
        [5.1, 5.35, 5.58, 5.78, 5.93].forEach((t, i) => {
            scheduleTick(t, 680 - i * 30);
        });

        // Winner ding exactly when animation finishes
        scheduleWinnerDing(totalDuration + 0.05);
    }

    return { scheduleRouletteSounds };
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

    const modal   = document.getElementById("opening-modal");
    const title   = document.getElementById("opening-title");
    const track   = document.getElementById("roulette-track");
    const actions = document.getElementById("opening-actions");

    track.style.transition = "none";
    track.style.transform  = "translateX(0px)";
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
