document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const message = document.getElementById('message');

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Evita la recarga de la página

        const formData = new FormData(loginForm);
        const requestData = new URLSearchParams(formData);

        try {
            const response = await fetch('/api/v1/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: requestData
            });

            const result = await response.json();

            if (response.ok) {
                //localStorage.setItem('token', result.token); // Guarda el token
                message.style.color = 'green';
                message.textContent = 'Inicio de sesión exitoso. Redirigiendo...';

                setTimeout(() => {
                    window.location.href = 'profile'; // Redirige a profile
                }, 1500);
            } else {
                message.style.color = 'red';
                message.textContent = result.message || 'Error en el inicio de sesión';
            }
        } catch (error) {
            console.error('Error en el login:', error);
            message.style.color = 'red';
            message.textContent = 'Error de conexión con el servidor';
        }
    });
});
