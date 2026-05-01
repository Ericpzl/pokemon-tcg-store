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
                    alert(`¡Bienvenido de nuevo, ${data.username}!`);
                    window.location.href = "index.html";
                } else {
                    alert("Error al iniciar sesión: " + (data.error || "Algo salió mal."));
                }
            } catch (error) {
                console.error("Error connecting to server:", error);
                alert("Error de conexión con el servidor.");
            }
        });
    }
});
