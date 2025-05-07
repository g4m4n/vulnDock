document.addEventListener('DOMContentLoaded', async () => {
    const blogTitle = document.querySelector('#blog-title');
    const blogContent = document.querySelector('#blog-content');
    const blogAuthor = document.querySelector('#blog-author');
    const commentList = document.querySelector('#comment-list');
    const commentForm = document.querySelector('#comment-form');
    const commentText = document.querySelector('#comment-text');
    const commentFiles = document.querySelector('#comment-files') || { files: [] };

    // Obtener el ID del blog desde la URL
    const blogId = window.location.pathname.split('/').pop();
    await cargarBlog(); // Verificar si entra aquí

    async function cargarBlog() {
        try {
            const response = await fetch(`/api/v1/blog/${blogId}`);
            const blog = await response.json();

            if (response.status !== 200) {
                blogTitle.innerHTML = 'Blog no encontrado';
                return;
            }

            blogTitle.innerHTML = blog.title  || "Título no disponible";;
            blogContent.innerHTML = blog.content  || "Contenido no disponible";
            blogAuthor.innerHTML = blog.author  || "Autor desconocido";
        } catch (error) {
            console.error('Error al cargar el blog:', error);
        }
    }

    async function cargarComentarios() {
        try {
            const response = await fetch(`/api/v1/blog/${blogId}/comments`);
            const data = await response.json();

            const comments = data.comments || [];

            commentList.innerHTML = '';

            if (comments.length === 0) {
                commentList.innerHTML = '<p>No hay comentarios aún.</p>';
                return;
            }

            comments.forEach(comment => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${comment.writer}</strong>: ${comment.comment}`;

                if (comment.files && comment.files.length > 0) {
                    const fileList = document.createElement('ul');
                    comment.files.forEach(file => {
                        const fileItem = document.createElement('li');
                        const fileName = file.file_path.match(/([^\/]+)$/)[0];
                        fileItem.style.marginLeft = '20px'; // Aumenta el valor para más separación
                        fileItem.innerHTML = `<a href="${file.file_path}" target="_blank">${fileName}</a>`;
                        fileList.appendChild(fileItem);
                    });
                    li.appendChild(fileList);
                }

                commentList.appendChild(li);
            });
        } catch (error) {
            console.error('Error al cargar comentarios:', error);
        }
    }

    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const content = commentText.value.trim();
        if (!content) return alert('No puedes enviar un comentario vacío');

        const formData = new FormData();
        formData.append('content', content);

        if (commentFiles.files.length > 0) {
            for (const file of commentFiles.files) {
                formData.append('files', file);
            }
        }

        try {
            const response = await fetch(`/api/v1/blog/${blogId}/comments`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                commentText.value = '';
                commentFiles.value = ''; // Limpiar los archivos seleccionados
                await cargarComentarios();
            } else {
                alert('Error al enviar comentario');
            }
        } catch (error) {
            console.error('Error al enviar comentario:', error);
        }
    });

    await cargarBlog();
    await cargarComentarios();
});
