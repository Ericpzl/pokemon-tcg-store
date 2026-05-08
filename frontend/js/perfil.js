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
    
    if (user.avatarUrl) {
        document.getElementById("profile-avatar").innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        document.getElementById("input-avatar").value = user.avatarUrl;
    } else {
        document.getElementById("profile-avatar").textContent = user.username.charAt(0).toUpperCase();
    }
    
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
    showToast(msg, isError ? "error" : "success");
}

async function updateInfo(event) {
    event.preventDefault();
    
    const user = JSON.parse(sessionStorage.getItem("user"));
    const newEmail = document.getElementById("input-email").value;
    const newAvatar = document.getElementById("input-avatar").value;

    if (newEmail === user.email && newAvatar === (user.avatarUrl || "")) {
        showMessage("No hay cambios que guardar.", true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                newEmail: newEmail,
                newAvatarUrl: newAvatar
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Error al actualizar la información.");
        }

        // Actualizar sesión local con los nuevos datos
        user.email = data.email || newEmail;
        user.avatarUrl = data.avatarUrl || newAvatar;
        sessionStorage.setItem("user", JSON.stringify(user));
        
        showMessage("Información actualizada con éxito.");
        
        // Refrescar el avatar en la UI si cambió
        if (user.avatarUrl) {
            document.getElementById("profile-avatar").innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }
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

async function resetDatabase() {
    if (!confirm("⚠️ ¡ADVERTENCIA CRÍTICA!\n\nEsto borrará a TODOS los usuarios (excepto admins), sus transacciones, inventarios y álbumes.\nLas cartas y expansiones NO se borrarán.\n\n¿Estás completamente seguro/a de que quieres limpiar la base de datos?")) {
        return;
    }
    
    const user = JSON.parse(sessionStorage.getItem("user"));
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reset-db`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast("✅ " + data.message, "success");
        } else {
            showToast("❌ " + data.error, "error");
        }
    } catch (err) {
        showToast("❌ Error al contactar con el servidor.", "error");
    }
}
