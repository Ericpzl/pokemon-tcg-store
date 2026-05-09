// ════════════════════════════════════════════════════════════
//  SOUND ENGINE  –  suave, estilo baraja de cartas
// ════════════════════════════════════════════════════════════
const SoundFX = (() => {
    let ctx = null;

    function init() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") ctx.resume();
    }

    function tick(delaySeconds, freq = 320, volume = 0.07) {
        if (!ctx) return;
        const now = ctx.currentTime;
        const t   = now + delaySeconds;
        const osc    = ctx.createOscillator();
        const gain   = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, t);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
    }

    function winnerDing(delaySeconds) {
        if (!ctx) return;
        const now = ctx.currentTime;
        const t   = now + delaySeconds;
        [523, 659, 784].forEach((freq, i) => {
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

    function scheduleRouletteSounds(totalDuration = 6, offsetDelay = 0) {
        if (!ctx) return;
        const TICKS = 38;
        for (let i = 0; i < TICKS; i++) {
            const progress = i / TICKS;
            const eased = 1 - Math.pow(1 - progress, 2.4);
            const t    = offsetDelay + eased * (totalDuration - 0.3);
            const freq = 400 - progress * 180;
            tick(t, freq, 0.07);
        }
        [5.1, 5.4, 5.65, 5.82, 5.94].forEach((t, i) => {
            tick(offsetDelay + t, 220 - i * 15, 0.06);
        });
        winnerDing(offsetDelay + totalDuration + 0.15);
    }

    return { init, scheduleRouletteSounds };
})();


// ════════════════════════════════════════════════════════════
//  INVENTORY LOGIC
// ════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    const userData = sessionStorage.getItem("user");
    if (!userData) {
        showToast("Debes iniciar sesión para ver tu inventario.", "error");
        setTimeout(() => window.location.href = "login.html", 1500);
        return;
    }

    const user = JSON.parse(userData);
    const balanceEl = document.getElementById("nav-user-balance");
    if (balanceEl) balanceEl.textContent = `${user.balance} 🪙`;

    const rawCart = sessionStorage.getItem("pokesobres_cart");
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
            const btnLabel = pack.quantity > 1 ? `▶ Abrir (${pack.quantity} disponibles)` : `▶ Abrir Sobre`;
            el.innerHTML = `
                <div class="pack-quantity">${pack.quantity}</div>
                <div class="pack-image">
                    ${pack.coverImage
                        ? `<img src="${pack.coverImage}" alt="${pack.expansionName}">`
                        : `<span style="color:#6366f1">Sin Portada</span>`}
                </div>
                <h4 style="margin-bottom:1rem;">${pack.expansionName}</h4>
                <button class="btn btn-sm" style="width:100%;" onclick="askHowMany(${pack.expansionId}, ${pack.quantity}, '${pack.expansionName.replace(/'/g,"\\'")}')">
                    ${btnLabel}
                </button>
            `;
            container.appendChild(el);
        });

    } catch (error) {
        console.error("Error al cargar inventario:", error);
        container.innerHTML = `<p style="color:var(--error-color);">Error al cargar tu inventario.</p>`;
    }
}


// ════════════════════════════════════════════════════════════
//  QUANTITY PICKER
// ════════════════════════════════════════════════════════════
let _qtyExpansionId = null;
let _qtyMax = 1;
let _qtyCurrentValue = 1;

window.askHowMany = function(expansionId, maxQty, expansionName) {
    SoundFX.init();
    _qtyExpansionId = expansionId;
    _qtyMax = maxQty;
    _qtyCurrentValue = 1;

    document.getElementById("qty-subtitle").textContent =
        `Tienes ${maxQty} sobre${maxQty !== 1 ? 's' : ''} de "${expansionName}"`;
    document.getElementById("qty-value").textContent = 1;
    document.getElementById("qty-modal").style.display = "flex";
};

window.adjustQty = function(delta) {
    _qtyCurrentValue = Math.min(_qtyMax, Math.max(1, _qtyCurrentValue + delta));
    document.getElementById("qty-value").textContent = _qtyCurrentValue;
};

window.closeQtyModal = function() {
    document.getElementById("qty-modal").style.display = "none";
};

window.confirmOpenPacks = function() {
    closeQtyModal();
    openMultiplePacks(_qtyExpansionId, _qtyCurrentValue);
};


// ════════════════════════════════════════════════════════════
//  MULTI-PACK OPENING
// ════════════════════════════════════════════════════════════
let _rouletteTimeouts = [];
let _rouletteSkipFns  = [];

window.skipAllRoulettes = function() {
    _rouletteTimeouts.forEach(t => clearTimeout(t));
    _rouletteTimeouts = [];
    _rouletteSkipFns.forEach(fn => fn && fn());
    _rouletteSkipFns = [];
    document.getElementById("skip-action").style.display = "none";
};

async function openMultiplePacks(expansionId, qty) {
    const userData = sessionStorage.getItem("user");
    if (!userData) return;
    const user = JSON.parse(userData);

    // Reset modal state
    const modal      = document.getElementById("opening-modal");
    const title      = document.getElementById("opening-title");
    const loading    = document.getElementById("opening-loading");
    const multiCont  = document.getElementById("multi-roulette-container");
    const skipBtn    = document.getElementById("skip-action");
    const actions    = document.getElementById("opening-actions");

    _rouletteTimeouts = [];
    _rouletteSkipFns  = [];

    multiCont.innerHTML = "";
    multiCont.style.display = "none";
    actions.style.display = "none";
    skipBtn.style.display = "none";
    loading.style.display = "flex";
    title.textContent = qty > 1 ? `Abriendo ${qty} sobres...` : "Abriendo sobre...";
    title.style.color = "white";
    modal.style.display = "flex";
    modal.scrollTop = 0;

    // Fetch all pack opens in parallel
    const requests = [];
    for (let i = 0; i < qty; i++) {
        requests.push(
            fetch(`${API_BASE_URL}/inventory/open`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, expansionId })
            }).then(r => r.json())
        );
    }

    let results;
    try {
        results = await Promise.all(requests);
    } catch (err) {
        console.error(err);
        showToast("Error de conexión al abrir los sobres.", "error");
        closeOpeningModal();
        return;
    }

    // Check for errors
    const failed = results.find(d => d.error);
    if (failed) {
        showToast(failed.error || "No se pudo abrir el sobre.", "error");
        closeOpeningModal();
        return;
    }

    loading.style.display = "none";
    multiCont.style.display = "flex";
    skipBtn.style.display = "block";

    const TOTAL_CARDS  = 50;
    const WINNER_INDEX = 40;
    const CARD_WIDTH   = 180;
    const GAP          = 12;
    const CARD_TOTAL   = CARD_WIDTH + GAP;
    const SPIN_DURATION = 6; // seconds

    let completedCount = 0;

    results.forEach((data, idx) => {
        const wonCard  = data.wonCard;
        const allCards = data.allCards;
        if (!allCards || allCards.length === 0) return;

        // Create a roulette row for this pack
        const rouletteRow = document.createElement("div");
        rouletteRow.style.cssText = `width:100%; max-width:900px; background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:12px; overflow:hidden; padding:1rem 0;`;
        rouletteRow.innerHTML = `
            <p style="text-align:center; color:var(--text-muted); font-size:0.85rem; margin-bottom:0.5rem;">
                Sobre ${idx + 1} / ${qty}
            </p>
            <div id="winner-label-${idx}" style="text-align:center; font-weight:bold; font-size:1rem; min-height:1.4em; color:var(--success-color); margin-bottom:0.5rem; opacity:0; transition:opacity 0.5s;"></div>
            <div style="position:relative; width:100%; height:${CARD_WIDTH + 20}px; overflow:hidden; background:rgba(0,0,0,0.3);">
                <div style="position:absolute; width:3px; height:100%; background:var(--error-color); z-index:10; left:50%; transform:translateX(-50%); box-shadow:0 0 12px var(--error-color);"></div>
                <div id="track-${idx}" style="display:flex; gap:${GAP}px; position:absolute; left:50%; transform:translateX(0); height:${CARD_WIDTH}px; align-items:center;"></div>
            </div>
        `;
        multiCont.appendChild(rouletteRow);

        const track = document.getElementById(`track-${idx}`);

        // Build cards
        for (let i = 0; i < TOTAL_CARDS; i++) {
            const cardData = (i === WINNER_INDEX)
                ? wonCard
                : allCards[Math.floor(Math.random() * allCards.length)];

            const cardEl = document.createElement("div");
            cardEl.id = `rc-${idx}-${i}`;
            cardEl.style.cssText = `width:${CARD_WIDTH}px; height:${CARD_WIDTH}px; background:var(--bg-secondary); border-radius:8px; border:2px solid var(--glass-border); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden;`;
            cardEl.innerHTML = cardData.imageUrl
                ? `<img src="${cardData.imageUrl}" style="max-width:100%;max-height:100%;border-radius:4px;">`
                : `<span style="font-size:2.5rem">❓</span>`;
            track.appendChild(cardEl);
        }

        const randomOffset   = (Math.random() - 0.5) * (CARD_WIDTH - 20);
        const finalX         = -(WINNER_INDEX * CARD_TOTAL + CARD_WIDTH / 2 + randomOffset);
        const finalTransform = `translateX(${finalX}px)`;
        track.dataset.finalTransform = finalTransform;

        void track.offsetWidth;

        // Stagger sounds slightly so packs don't all sound identical
        SoundFX.scheduleRouletteSounds(SPIN_DURATION, idx * 0.15);

        track.style.transition = `transform ${SPIN_DURATION}s cubic-bezier(0.15, 0.85, 0.15, 1)`;
        track.style.transform  = finalTransform;

        const endFn = () => {
            const winnerEl = document.getElementById(`rc-${idx}-${WINNER_INDEX}`);
            if (winnerEl) {
                winnerEl.style.borderColor = "var(--success-color)";
                winnerEl.style.boxShadow   = "0 0 24px var(--success-color)";
                winnerEl.style.transform   = "scale(1.08)";
                winnerEl.style.transition  = "all 0.4s";
            }
            const labelEl = document.getElementById(`winner-label-${idx}`);
            if (labelEl) {
                labelEl.textContent = `✨ ${wonCard.name}`;
                labelEl.style.opacity = "1";
            }
            completedCount++;
            if (completedCount === qty) {
                title.textContent = qty > 1 ? `¡Has abierto ${qty} sobres!` : `¡Has conseguido a ${wonCard.name}!`;
                title.style.color = "var(--success-color)";
                skipBtn.style.display = "none";
                actions.style.display = "block";
                loadInventory(JSON.parse(sessionStorage.getItem("user")).id);
            }
        };

        _rouletteSkipFns[idx] = () => {
            track.style.transition = "none";
            track.style.transform  = finalTransform;
            endFn();
        };

        const tid = setTimeout(() => {
            endFn();
            _rouletteSkipFns[idx] = null;
        }, SPIN_DURATION * 1000);
        _rouletteTimeouts.push(tid);
    });
}

window.closeOpeningModal = function() {
    document.getElementById("opening-modal").style.display = "none";
};
