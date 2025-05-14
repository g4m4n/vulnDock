document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/api/v1/user/me", { credentials: "include" });
        const user = await response.json();

        if (!user.username) {
            window.location.href = "login";
            return;
        }

        // Rellenar los campos del perfil con los datos del usuario
        document.getElementById("firstName").value = user.firstname || "";
        document.getElementById("lastName").value = user.lastname || "";
        document.getElementById("email").value = user.email || "";

        // Manejar la actualización del perfil
        document.getElementById("profileForm").addEventListener("submit", async (event) => {
            event.preventDefault();

            const updatedData = {
                firstName: document.getElementById("firstName").value,
                lastName: document.getElementById("lastName").value,
                email: document.getElementById("email").value,
                newPassword: document.getElementById("newPassword").value.trim(),
            };

            const formData = new FormData();

            // Agregar los datos de perfil
            Object.keys(updatedData).forEach(key => {
                formData.append(key, updatedData[key]);
            });

            // Agregar el archivo de la imagen
            const profileImage = document.getElementById("avatar").files[0];
            if (profileImage) {
                formData.append("avatar", profileImage);
            }

            // Enviar la solicitud para actualizar el perfil y avatar
            const updateResponse = await fetch("/api/v1/update-profile", {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const updateResult = await updateResponse.json();

            if (updateResponse.ok) {
                alert(updateResult.message); // Muestra mensaje de éxito
            } else {
                alert(updateResult.message); // Muestra mensaje de error
            }
        });
    } catch (error) {
        console.error("Error cargando el perfil:", error);
    }
});
