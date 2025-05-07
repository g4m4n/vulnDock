// auth.js
async function loginUser(username, password) {
    try {
        const response = await fetch("/api/v1/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Login exitoso:", result);
            // Redirigir o manejar sesión del usuario
        } else {
            console.error("Error:", result.error);
            alert(result.error); // Muestra el error en la interfaz
        }
    } catch (error) {
        console.error("Error en el login:", error);
    }
}
