document.addEventListener("DOMContentLoaded", () => {
    // Verificar sesión y cargar saldo
    const userData = sessionStorage.getItem("user");
    if (!userData) {
        alert("Debes iniciar sesión para acceder a la tienda de monedas.");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);
    const balanceEl = document.getElementById("nav-user-balance");
    if (balanceEl) {
        balanceEl.textContent = `${user.balance} 🪙`;
    }
});

async function buyTokens(tokenAmount, priceEuro) {
    const userData = sessionStorage.getItem("user");
    if (!userData) return;
    const user = JSON.parse(userData);

    const modal = document.getElementById("payment-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalText = document.getElementById("modal-text");
    const modalLoader = document.getElementById("modal-loader");
    const modalClose = document.getElementById("modal-close");

    // Reset modal state
    modalTitle.textContent = "Procesando Pago...";
    modalTitle.style.color = "var(--text-primary)";
    modalText.textContent = `Cobrando ${priceEuro}€ a tu método de pago...`;
    modalLoader.style.display = "block";
    modalClose.style.display = "none";
    modal.style.display = "flex";

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const response = await fetch(`${API_BASE_URL}/profile/add_funds`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                amount: tokenAmount
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Éxito
            modalTitle.textContent = "¡Pago Completado!";
            modalTitle.style.color = "var(--success-color)";
            modalText.textContent = `Has recibido ${tokenAmount} 🪙.`;
            modalLoader.style.display = "none";
            modalClose.style.display = "block";

            // Actualizar local
            user.balance = data.newBalance;
            sessionStorage.setItem("user", JSON.stringify(user));

            const balanceEl = document.getElementById("nav-user-balance");
            if (balanceEl) {
                balanceEl.textContent = `${user.balance} 🪙`;
            }
        } else {
            // Error de backend
            modalTitle.textContent = "Error en el pago";
            modalTitle.style.color = "var(--error-color)";
            modalText.textContent = data.error || "La transacción fue rechazada.";
            modalLoader.style.display = "none";
            modalClose.style.display = "block";
        }
    } catch (error) {
        console.error(error);
        modalTitle.textContent = "Error de conexión";
        modalTitle.style.color = "var(--error-color)";
        modalText.textContent = "No se pudo conectar con el servidor.";
        modalLoader.style.display = "none";
        modalClose.style.display = "block";
    }
}

window.closeModal = function() {
    const modal = document.getElementById("payment-modal");
    modal.style.display = "none";
}
