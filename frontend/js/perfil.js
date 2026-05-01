document.addEventListener("DOMContentLoaded", () => {
    const userData = sessionStorage.getItem("user");
    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    // Actualizar navbar
    document.getElementById("nav-user-balance").innerHTML = `🪙 ${user.balance}`;

    // Cargar datos en el perfil
    document.getElementById("profile-username").textContent = user.username;
    document.getElementById("profile-avatar").textContent = user.username.charAt(0).toUpperCase();
    
    // Cargar en el formulario
    document.getElementById("input-username").value = user.username;
    document.getElementById("input-email").value = user.email;

    // Lógica del carrito si existe en navbar
    const cart = JSON.parse(sessionStorage.getItem("pokesobres_cart") || "[]");
    const navCartLink = document.getElementById("nav-cart-link");
    if (navCartLink) {
        navCartLink.textContent = `Carrito (${cart.length})`;
    }

    // Mostrar sección de admin si corresponde
    if (user.role && user.role.toLowerCase() === "admin") {
        const adminSection = document.getElementById("admin-section");
        if (adminSection) {
            adminSection.style.display = "block";
        }
    }
});

function showMessage(msg, isError = false) {
    const msgBox = document.getElementById("profile-message");
    msgBox.textContent = msg;
    msgBox.className = "message-alert " + (isError ? "message-error" : "message-success");
    msgBox.style.display = "block";
    
    setTimeout(() => {
        msgBox.style.display = "none";
    }, 5000);
}

async function updateInfo(event) {
    event.preventDefault();
    
    const user = JSON.parse(sessionStorage.getItem("user"));
    const newEmail = document.getElementById("input-email").value;

    if (newEmail === user.email) {
        showMessage("El correo electrónico es el mismo que el actual.", true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                newEmail: newEmail
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Error al actualizar la información.");
        }

        // Actualizar sesión local
        user.email = newEmail;
        sessionStorage.setItem("user", JSON.stringify(user));
        
        showMessage("Información actualizada con éxito.");
    } catch (error) {
        showMessage(error.message, true);
    }
}

async function updatePassword(event) {
    event.preventDefault();

    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentPassword = document.getElementById("input-current-password").value;
    const newPassword = document.getElementById("input-new-password").value;
    const confirmPassword = document.getElementById("input-confirm-password").value;

    if (newPassword !== confirmPassword) {
        showMessage("Las nuevas contraseñas no coinciden.", true);
        return;
    }

    if (newPassword.length < 6) {
        showMessage("La nueva contraseña debe tener al menos 6 caracteres.", true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Error al actualizar la contraseña.");
        }

        showMessage("Contraseña actualizada con éxito.");
        document.getElementById("form-security").reset();
    } catch (error) {
        showMessage(error.message, true);
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}
