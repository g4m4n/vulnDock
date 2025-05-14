document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Obtener los datos del usuario autenticado
        const userResponse = await fetch("/api/v1/user/me", { credentials: "include" });
        const user = await userResponse.json();

        // Definir el nombre del usuario o "Invitado" si no hay sesión
        const username = user.username ? user.username : "Invitado";

        // Obtener el mensaje de bienvenida vulnerable a SSTI
        const response = await fetch(`/api/v1/update-welcome?username=${username}`);
        const welcomeText = await response.text();

        // Insertar el mensaje sin sanitización (vulnerable a SSTI)
        document.getElementById("welcomeMessage").innerHTML = welcomeText;

    } catch (error) {
        console.error("Error cargando el mensaje de bienvenida:", error);
    }
});

// Manejo del formulario con XSS
document.getElementById('infoForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const info = document.getElementById('infoInput').value;

    // Código con XSS
    document.getElementById('infoMessage').innerHTML = info;

    // Código seguro (descomentar para evitar XSS)
    // document.getElementById('infoMessage').innerText = info;
});

// Manejo del menú desplegable del usuario
const userIcon = document.getElementById('user-icon');
const dropdown = document.getElementById('dropdown');

userIcon.addEventListener('click', () => {
    dropdown.classList.toggle('show');
});

window.onclick = function(event) {
    if (!event.target.matches('#user-icon')) {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
};
