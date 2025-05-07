document.addEventListener('DOMContentLoaded', async () => {
    const userTable = document.getElementById('user-table');
    const importJsonButton = document.getElementById('import-json');
    const importXmlButton = document.getElementById('import-xml-button');
    const importJsonInput = document.getElementById('json-url'); 
    const importXmlInput = document.getElementById('import-xml');

    async function cargarUsuarios() {
        try {
            const response = await fetch('/api/v1/users');
            const data = await response.json();

            let users = data; // Aquí puede ser un objeto o un array

            if (!Array.isArray(users)) {  
                users = [users]; // Convertir a array si es un solo objeto
            }
    
            userTable.innerHTML = '';  

            users.forEach(user => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.id}</td>
                    <td>${user.is_admin ? '✅' : '❌'}</td>
                    <td>
                        <button class="toggle-user" data-id="${user.id}">
                            ${user.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
                        </button>
                        
                    </td>
                    <td><button class="delete-user" data-id="${user.id}">Borrar</button></td>
                `;

                userTable.appendChild(row);
            });

            // Asignar evento de eliminación a cada botón
            document.querySelectorAll('.delete-user').forEach(button => {
                button.addEventListener('click', (e) => {
                    const userId = e.target.getAttribute('data-id');  // Obtener el ID del usuario
                    borrarUsuario(userId); // Llamar a la función de eliminar con el ID
                });
            });

            // Asignar evento de eliminación a cada botón
            document.querySelectorAll('.toggle-user').forEach(button => {
                button.addEventListener('click', (e) => {
                    const userId = e.target.getAttribute('data-id');  // Obtener el ID del usuario
                    toggleAdmin(userId); // Llamar a la función de eliminar con el ID
                });
            });
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    }

    async function toggleAdmin(id) {
        try {
            await fetch(`/api/v1/users/${id}/toggle-admin`, {
                method: 'GET',
            });

            cargarUsuarios();
        } catch (error) {
            console.error('Error al cambiar estado de admin:', error);
        }
    }

    async function borrarUsuario(id) {
        if (!confirm(`¿Seguro que quieres eliminar a ${id}?`)) return;

        try {
            await fetch(`/api/v1/users/${id}`, {
                method: 'DELETE'
            });

            alert(`Usuario ${id} eliminado.`);
            cargarUsuarios();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        }
    }

    async function importarUsuariosDesdeJson() {
        const urlInput = importJsonInput.value.trim(); // Obtener la URL ingresada

        if (!urlInput) {
            alert("Por favor, introduce una URL válida.");
            return;
        }

        try {
            const importResponse = await fetch('/api/v1/users/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlInput }) // Enviar solo la URL al backend
            });

            if (!importResponse.ok) {
                throw new Error(`Error al importar usuarios: ${importResponse.statusText}`);
            }

            alert('Usuarios importados desde la URL proporcionada.');
            cargarUsuarios();
        } catch (error) {
            console.error('Error al importar JSON:', error);
            alert('Hubo un error al importar los usuarios.');
        }
    }

async function importarUsuariosDesdeXml() {
    const file = importXmlInput.files[0];
    if (!file) {
        alert('Selecciona un archivo XML primero.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const xmlContent = e.target.result;

            const response = await fetch('/api/v1/users/import-xml', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xml: xmlContent })
            });

            if (!response.ok) throw new Error('Error al importar usuarios desde XML');

            alert('Usuarios importados con éxito.');
            cargarUsuarios();
        } catch (error) {
            console.error('Error al importar XML:', error);
            alert('Hubo un error al importar los usuarios.');
        }
    };

    reader.readAsText(file);
}

    importJsonButton.addEventListener('click', importarUsuariosDesdeJson);
    importXmlButton.addEventListener('click', importarUsuariosDesdeXml);
    cargarUsuarios();
});

// Event listener para hacer ping
document.addEventListener('DOMContentLoaded', function() {
    const pingButton = document.getElementById('pingButton');
    const hostInput = document.getElementById('host');
    const resultDiv = document.getElementById('pingResult');

    pingButton.addEventListener('click', function() {
        const host = hostInput.value.trim();

        if (!host) {
            alert('Por favor ingresa un host válido.');
            return;
        }

        // Crear los datos a enviar en el formato x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('host', host);

        // Realizar la solicitud POST con formato x-www-form-urlencoded
        fetch('/api/v1/ping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()  // Convertimos formData a cadena
        })
        .then(response => response.json())
        .then(data => {
            resultDiv.style.display = 'block';
            resultDiv.textContent = `Resultado del Ping:\n\n${data.output}`;
        })
        .catch(error => {
            console.error('Error al hacer ping:', error);
            alert('Hubo un error al intentar hacer ping.');
        });
    });
});