document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Guardar datos del usuario en sessionStorage para mantener sesión
                    sessionStorage.setItem("user", JSON.stringify(data));
                    showToast(`¡Bienvenido de nuevo, ${data.username}!`, "success");
                    setTimeout(() => window.location.href = "index.html", 1000);
                } else {
                    showToast("Error al iniciar sesión: " + (data.error || "Algo salió mal."), "error");
                }
            } catch (error) {
                console.error("Error connecting to server:", error);
                showToast("Error de conexión con el servidor.", "error");
            }
        });
    }
});
