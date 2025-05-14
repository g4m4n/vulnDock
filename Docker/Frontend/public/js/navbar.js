function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Obtener la cookie 'session'
        const sessionCookie = getCookie('session');

        if (sessionCookie) {
            // Primero decodificamos la cadena URL codificada
            const decodedUrlData = decodeURIComponent(sessionCookie);

            // Decodificar la cadena base64
            const decodedData = atob(decodedUrlData); // Esto convierte el base64 en un string

            // Parsear el JSON decodificado
            const userData = JSON.parse(decodedData);

            // Verificar si el usuario es un administrador
            const isAdmin = userData.is_admin || false;

             // Obtener datos adicionales del usuario (incluido avatar) desde la API
             const response = await fetch('/api/v1/user/me');
             const userFromApi = await response.json();
             
             const avatar = userFromApi.avatar || null;  // Verificar si hay avatar, si no, será null o undefined

            const navbar = document.querySelector("header"); // Seleccionamos la barra de navegación
            navbar.innerHTML = `
                <div class="logo">
                    <h1>Mi Sitio Web</h1>
                </div>
                <nav class="nav-links">
                    <ul>
                        <li><a href="/">Inicio</a></li>
                        <li><a href="blog">Blog</a></li>
                        ${isAdmin ? `<li><a href="admin">Admin</a></li>` : ""}
                    </ul>
                </nav>
                <div class="user-menu">
                    ${avatar ? 
                    `<img src="${avatar}" alt="Avatar" id="user-icon" class="user-avatar">` :  
                    `<i class="fas fa-user" id="user-icon"></i>`}                   
                    <div class="dropdown-content" id="dropdown">
                        <a href="profile">Perfil</a>
                        <a href="logout" id="logout">Log out</a>
                    </div>
                </div>
            `;

            // Agregar funcionalidad de logout si el usuario está autenticado
            document.getElementById("logout").addEventListener("click", async () => {
                await fetch("/api/v1/logout", { method: "POST", credentials: "include" });
                window.location.reload();
            });

        } else {
            // Si no hay cookie, muestra el menú con login
            const navbar = document.querySelector("header");
            navbar.innerHTML = `
                <div class="logo">
                    <h1>Mi Sitio Web</h1>
                </div>
                <nav class="nav-links">
                    <ul>
                        <li><a href="/">Inicio</a></li>
                        <li><a href="blog">Blog</a></li>
                    </ul>
                </nav>
                <div class="user-menu">
                    <i class="fas fa-user" id="user-icon"></i>
                    <div class="dropdown-content" id="dropdown">
                        <a href="login">Login</a>
                        <a href="register">Registrar</a>
                    </div>
                </div>
            `;
        }

        // Mostrar el menú desplegable al hacer clic en el icono de usuario
        const userIcon = document.getElementById("user-icon");
        const dropdown = document.getElementById("dropdown");
        
        userIcon.addEventListener("click", () => {
            dropdown.classList.toggle("show");
        });

        // Cerrar el menú si se hace clic fuera de él
        document.addEventListener("click", (event) => {
            if (!userIcon.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.remove("show");
            }
        });

    } catch (error) {
        console.error("Error cargando los datos del usuario:", error);
    }
});
