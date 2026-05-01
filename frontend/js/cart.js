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

    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", async () => {
            const cart = getCart();
            if (cart.length === 0) return;

            const userData = sessionStorage.getItem("user");
            if (!userData) {
                alert("Debes iniciar sesión para comprar.");
                window.location.href = "login.html";
                return;
            }

            const user = JSON.parse(userData);
            
            try {
                checkoutBtn.disabled = true;
                const originalText = checkoutBtn.textContent;
                checkoutBtn.textContent = "Procesando...";

                const response = await fetch(`${API_BASE_URL}/purchase`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        cart: cart
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("¡Compra realizada con éxito!");
                    
                    // Actualizar saldo del usuario local
                    user.balance = data.newBalance;
                    sessionStorage.setItem("user", JSON.stringify(user));
                    
                    const balanceEl = document.getElementById("nav-user-balance");
                    if (balanceEl) {
                        balanceEl.textContent = `${user.balance} 🪙`;
                    }
                    
                    // Vaciar carrito
                    saveCart([]);
                    renderCart();
                    
                    if (typeof updateCartCounter === "function") {
                        updateCartCounter();
                    }
                } else {
                    alert("Error en la compra: " + (data.error || "Desconocido"));
                }
                
                checkoutBtn.textContent = originalText;
            } catch (error) {
                console.error("Error al procesar compra:", error);
                alert("Error de conexión al procesar la compra.");
                checkoutBtn.textContent = "Finalizar Compra";
            } finally {
                checkoutBtn.disabled = false;
            }
        });
    }
});

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

        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid var(--glass-border)";
        
        tr.innerHTML = `
            <td style="padding: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    ${item.coverImage ? `<img src="${item.coverImage}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px;">` : `<div style="width: 40px; height: 60px; background: rgba(0,0,0,0.3); border-radius: 4px;"></div>`}
                    <span style="font-weight: 600;">${item.expansionName}</span>
                </div>
            </td>
            <td style="padding: 1rem; color: var(--text-muted);">${item.unitPrice} 🪙</td>
            <td style="padding: 1rem; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <button class="btn btn-sm" style="padding: 0.2rem 0.6rem; background: var(--bg-primary);" onclick="updateQuantity(${item.expansionId}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn btn-sm" style="padding: 0.2rem 0.6rem; background: var(--bg-primary);" onclick="updateQuantity(${item.expansionId}, 1)">+</button>
                </div>
            </td>
            <td style="padding: 1rem; text-align: right; color: var(--success-color); font-weight: bold;">${subtotal} 🪙</td>
            <td style="padding: 1rem; text-align: center;">
                <button class="btn btn-sm" style="background: var(--error-color);" onclick="removeItem(${item.expansionId})">X</button>
            </td>
        `;
        container.appendChild(tr);
    });

    totalEl.textContent = `${total} 🪙`;
}

function updateQuantity(id, delta) {
    let cart = getCart();
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
