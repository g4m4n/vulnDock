<?php
header("Content-Type: application/json");
session_start();

// Incluir el archivo de configuración de la base de datos
require_once 'config/database.php';

// Crear una instancia de la conexión
$database = new Database();
$conn = $database->getConnection();

// Verifica que la solicitud sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Obtiene los datos de la solicitud
    $data = json_decode(file_get_contents("php://input"));

    // Validación básica de los datos
    if (!isset($data->username) || !isset($data->password)) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Se requieren usuario y contraseña"]);
        exit();
    }

    // Ejemplo de sanitización de entradas
    //$username = htmlspecialchars($data->username);
    //$password = htmlspecialchars($data->password);

    // Preparar la consulta
    $query = "SELECT id, username, password FROM users WHERE username = :username";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":username", $username);

    // Ejecuta la consulta
    $stmt->execute();

    // Verifica si el usuario existe
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verifica la contraseña
        if (password_verify($password, $user["password"])) {
            $_SESSION["username"] = $user["username"]; // Crea la sesión
            $_SESSION["is_admin"] = $user["is_admin"]; // Almacenar si es administrador

            // Enviar cookie segura
            setcookie("is_admin", $user["is_admin"], time() + 3600, "/", "", true, true);

            echo json_encode(["message" => "Login exitoso"]);
        } else {
            http_response_code(401); // Unauthorized
            echo json_encode(["error" => "Contraseña incorrecta"]);
        }
    } else {
        http_response_code(404); // Not Found
        echo json_encode(["error" => "Usuario no encontrado"]);
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Método no permitido"]);
}
?>
