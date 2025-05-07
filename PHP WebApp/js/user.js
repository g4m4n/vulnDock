document.addEventListener("DOMContentLoaded", async () => {
    const dropdown = document.getElementById("dropdown");

    try {
        // Llamada a la API para obtener información del usuario
        const response = await fetch("/api/v1/user-info.php", { method: "GET", credentials: "include" });

        if (response.ok) {
            const userInfo = await response.json();

            // Mostrar opciones para usuarios logueados
            dropdown.innerHTML = `
                <a href="profile.html">Perfil</a>
                <a href="/api/v1/logout">Log out</a>
            `;
        } else {
            // Mostrar opciones para usuarios no autenticados
            dropdown.innerHTML = `
                <a href="register.html">Registrar</a>
                <a href="login.html">Log In</a>
            `;
        }
    } catch (error) {
        console.error("Error al verificar el estado de autenticación:", error);

        // Opciones predeterminadas para errores
        dropdown.innerHTML = `
            <a href="register.html">Registrar</a>
            <a href="login.html">Log In</a>
        `;
    }
});
