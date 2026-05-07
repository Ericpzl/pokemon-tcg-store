document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showToast("¡Registro exitoso! Ya puedes iniciar sesión.", "success");
                    setTimeout(() => window.location.href = "login.html", 1500);
                } else {
                    showToast("Error en el registro: " + (data.error || "Algo salió mal."), "error");
                }
            } catch (error) {
                console.error("Error connecting to server:", error);
                showToast("Error de conexión con el servidor.", "error");
            }
        });
    }
});
