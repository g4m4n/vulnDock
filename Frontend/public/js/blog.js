async function obtenerUsuario() {
    try {
        const response = await fetch('/api/v1/user/me', {
            credentials: 'include' // Enviar cookies con la solicitud
        });

        if (!response.ok) {
            throw new Error('No autenticado');
        }

        return await response.json();
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = await obtenerUsuario();
    const authorField = document.getElementById('author');
    const isPrivateField = document.getElementById('isPrivate'); 

    if (user) {
        authorField.value = `${user.firstname} ${user.lastname}`;
        authorField.readOnly = true; // Bloqueamos la edición si está autenticado
        if (isPrivateField) {
            isPrivateField.disabled = false; // Habilitamos solo si el usuario está autenticado
        }
    } else {
        authorField.placeholder = "Ingrese su nombre";
        if (isPrivateField) {
            isPrivateField.disabled = true; // Bloqueamos para usuarios no autenticados
        }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const blogContainer = document.querySelector('#blogs');

    if (!blogContainer) {
        console.error('El contenedor de blogs no existe en el DOM');
        return;
    }

    async function cargarBlogs() {
        try {
            const response = await fetch('/api/v1/blogs', { credentials: 'include' });
            const blogs = await response.json();

            if (!blogs || blogs.length === 0) {
                blogContainer.innerHTML = '<p>No hay blogs disponibles.</p>';
                return;
            }

            blogContainer.innerHTML = '<h2>Blogs</h2>';

            blogs.forEach(blog => {
                const article = document.createElement('article');
                article.innerHTML = `
                    <h3><a href="/blog/${blog.id}">${blog.title}</a></h3>
                    <p>${blog.content.substring(0, 400)}</p>
                    <p><strong>Autor:</strong> ${blog.author}</p>
                    ${blog.url ? `<a href="${blog.url}" target="_blank">Ver más</a>` : ''}
                `;
                blogContainer.appendChild(article);
            });
        } catch (error) {
            console.error('Error al cargar los blogs:', error);
        }
    }

    await cargarBlogs();
});

document.addEventListener('DOMContentLoaded', async () => {
    const blogForm = document.getElementById('blogForm');

    if (!blogForm) {
        console.error("No se encontró el formulario con id 'blogForm'. Verifica el HTML.");
        return;
    }

    // Obtener usuario autenticado antes de enviar el formulario
    const user = await obtenerUsuario();

    blogForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const url = document.getElementById('url').value;
        const author = document.getElementById('author').value || "Anónimo";
        const isPrivateField = document.getElementById('isPrivate');
        
        // Solo incluir is_private si el usuario está autenticado
        const is_private = user && isPrivateField?.checked ? true : false;

        const blogMessage = document.getElementById('blogMessage');

        try {
            const response = await fetch('/api/v1/blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ title, content, author, url, is_private })
            });

            const result = await response.json();

            if (response.ok) {
                blogMessage.style.color = 'green';
                blogMessage.textContent = 'Blog publicado con éxito!';
                blogForm.reset();
            } else {
                blogMessage.style.color = 'red';
                blogMessage.textContent = result.message || 'Error al publicar el blog';
            }
        } catch (error) {
            console.error('Error al enviar blog:', error);
            blogMessage.style.color = 'red';
            blogMessage.textContent = 'Error al conectar con el servidor';
        }
    });
});
