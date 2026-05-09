let discountApplied = false;

document.addEventListener("DOMContentLoaded", () => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
        const user = JSON.parse(userData);
        const balanceEl = document.getElementById("nav-user-balance");
        if (balanceEl) {
            balanceEl.textContent = `${user.balance} 🪙`;
        }
    }

    renderCart();
});

function applyDiscount() {
    const code = document.getElementById("discount-code").value.trim().toLowerCase();
    if (code === "primercompra") {
        const userData = sessionStorage.getItem("user");
        if (!userData) {
            showToast("Debes iniciar sesión para usar un cupón.", "error");
            return;
        }
        const user = JSON.parse(userData);

        if (user.username !== "DIOS" && localStorage.getItem(`coupon_used_${user.username}`)) {
            showToast("Ya has utilizado este cupón.", "error");
            return;
        }

        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 3) {
            showToast("El cupón solo es válido para un máximo de 3 sobres en el carrito.", "error");
            return;
        }

        discountApplied = true;
        document.getElementById("discount-msg").style.display = "block";
        document.getElementById("discount-msg").textContent = "¡Cupón aplicado! 80% de descuento en tu compra.";
        document.getElementById("discount-code").disabled = true;
        document.getElementById("apply-discount-btn").disabled = true;
        showToast("¡Código aplicado correctamente!", "success");
        renderCart();
    } else {
        showToast("Código no válido.", "error");
    }
}

function showCheckoutConfirm() {
    const cart = getCart();
    if (cart.length === 0) return;

    let total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    if (discountApplied) {
        total = cart.reduce((sum, item) => sum + (Math.round(item.unitPrice * 0.2) * item.quantity), 0);
    }

    const msg = `¿Estás seguro/a de que deseas confirmar esta compra por un total de <b style="color:var(--success-color);">${total} 🪙</b>?`;
    document.getElementById("checkout-confirm-text").innerHTML = msg;
    document.getElementById("checkout-confirm-modal").style.display = "flex";
}

function closeCheckoutConfirm() {
    document.getElementById("checkout-confirm-modal").style.display = "none";
}

async function executePurchase() {
    const cart = getCart();
    if (cart.length === 0) return;

    const userData = sessionStorage.getItem("user");
    if (!userData) {
        showToast("Debes iniciar sesión para comprar.", "error");
        setTimeout(() => window.location.href = "login.html", 1500);
        return;
    }

    const user = JSON.parse(userData);
    
    // Si hay descuento, aplicamos el 80% al unitPrice de cada item de este payload.
    // También guardamos el flag para que el usuario no pueda usarlo más si no es DIOS.
    if (discountApplied && user.username !== "DIOS") {
        localStorage.setItem(`coupon_used_${user.username}`, "true");
    }

    const payloadCart = cart.map(item => {
        if (discountApplied) {
            let discountedPrice = Math.round(item.unitPrice * 0.2);
            return { ...item, unitPrice: discountedPrice, subtotal: discountedPrice * item.quantity };
        }
        return item;
    });

    try {
        closeCheckoutConfirm();
        const checkoutBtn = document.getElementById("checkout-btn");
        checkoutBtn.disabled = true;
        const originalText = checkoutBtn.textContent;
        checkoutBtn.textContent = "Procesando...";

        const response = await fetch(`${API_BASE_URL}/purchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                cart: payloadCart
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast("¡Compra realizada con éxito!", "success");
            
            user.balance = data.newBalance;
            sessionStorage.setItem("user", JSON.stringify(user));
            
            const balanceEl = document.getElementById("nav-user-balance");
            if (balanceEl) balanceEl.textContent = `${user.balance} 🪙`;
            
            saveCart([]);
            discountApplied = false;
            document.getElementById("discount-msg").style.display = "none";
            const codeInput = document.getElementById("discount-code");
            if (codeInput) { codeInput.value = ""; codeInput.disabled = false; }
            const applyBtn = document.getElementById("apply-discount-btn");
            if (applyBtn) applyBtn.disabled = false;

            renderCart();
            
            if (typeof updateCartCounter === "function") {
                updateCartCounter();
            }
        } else {
            showToast("Error en la compra: " + (data.error || "Desconocido"), "error");
        }
        
        checkoutBtn.textContent = "Confirmar Compra";
        checkoutBtn.disabled = false;
    } catch (error) {
        console.error("Error al procesar compra:", error);
        showToast("Error de conexión al procesar la compra.", "error");
        const checkoutBtn = document.getElementById("checkout-btn");
        checkoutBtn.textContent = "Confirmar Compra";
        checkoutBtn.disabled = false;
    }
}

function getCart() {
    const raw = sessionStorage.getItem("pokesobres_cart");
    return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
    sessionStorage.setItem("pokesobres_cart", JSON.stringify(cart));
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById("cart-items-container");
    const emptyMsg = document.getElementById("empty-cart-msg");
    const table = document.getElementById("cart-table");
    const totalEl = document.getElementById("cart-total");

    container.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        emptyMsg.style.display = "block";
        table.style.display = "none";
        totalEl.textContent = "0 🪙";
        document.getElementById("checkout-btn").disabled = true;
        document.getElementById("checkout-btn").style.opacity = "0.5";
        return;
    }

    emptyMsg.style.display = "none";
    table.style.display = "table";
    document.getElementById("checkout-btn").disabled = false;
    document.getElementById("checkout-btn").style.opacity = "1";

    cart.forEach(item => {
        const subtotal = item.unitPrice * item.quantity;
        total += subtotal;

        let currentPrice = discountApplied ? Math.round(item.unitPrice * 0.2) : item.unitPrice;
        let subtotalDisplay = currentPrice * item.quantity;

        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid var(--glass-border)";
        
        tr.innerHTML = `
            <td style="padding: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    ${item.coverImage ? `<img src="${item.coverImage}" style="width: 50px; height: 75px; object-fit: contain; border-radius: 4px;">` : `<div style="width: 50px; height: 75px; background: rgba(0,0,0,0.3); border-radius: 4px;"></div>`}
                    <span style="font-weight: 600;">${item.expansionName}</span>
                </div>
            </td>
            <td style="padding: 1rem; color: var(--text-muted);">${currentPrice} 🪙 ${discountApplied ? '<span style="color:var(--success-color); font-size:0.8rem;">(80% DTO)</span>' : ''}</td>
            <td style="padding: 1rem; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <button class="btn btn-sm" style="padding: 0.2rem 0.6rem; background: var(--bg-primary);" onclick="updateQuantity(${item.expansionId}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn btn-sm" style="padding: 0.2rem 0.6rem; background: var(--bg-primary);" onclick="updateQuantity(${item.expansionId}, 1)">+</button>
                </div>
            </td>
            <td style="padding: 1rem; text-align: right; color: var(--success-color); font-weight: bold;">${subtotalDisplay} 🪙</td>
            <td style="padding: 1rem; text-align: center;">
                <button class="btn btn-sm" style="background: var(--error-color);" onclick="removeItem(${item.expansionId})">X</button>
            </td>
        `;
        container.appendChild(tr);
    });

    if (discountApplied) {
        total = cart.reduce((sum, item) => sum + (Math.round(item.unitPrice * 0.2) * item.quantity), 0);
    }
    totalEl.textContent = `${total} 🪙`;
}

function updateQuantity(id, delta) {
    let cart = getCart();

    if (delta > 0 && discountApplied) {
        const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
        if (totalItems >= 3) {
            showToast("El cupón solo permite un máximo de 3 sobres. Elimina el cupón o reduce la cantidad.", "error");
            return;
        }
    }

    const item = cart.find(x => x.expansionId === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(x => x.expansionId !== id);
    }

    saveCart(cart);
    renderCart();
}

function removeItem(id) {
    let cart = getCart();
    cart = cart.filter(x => x.expansionId !== id);
    saveCart(cart);
    renderCart();
}
