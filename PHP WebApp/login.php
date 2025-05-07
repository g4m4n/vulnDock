<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Iniciar Sesión</title>
    <style>
        .error { color: red; }
    </style>
     <script>
        document.getElementById("loginForm").addEventListener("submit", function (e) {
            e.preventDefault(); // Evita recargar la página
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            loginUser(username, password);
        });
    </script>
</head>
<body>

<h2>Iniciar Sesión</h2>

<form form id="loginForm">
    <label for="user">Usuario:</label><br>
    <input type="text" id="user" name="user"><br><br>
    
    <label for="password">Contraseña:</label><br>
    <input type="password" id="password" name="password"><br><br>
    
    <input type="submit" value="Iniciar Sesión">
</form>

</body>
</html>