<?php
require_once './config/database.php'; // Asegúrate de que la ruta a database.php es correcta

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Leer el cuerpo del POST
    $input = json_decode(file_get_contents("php://input"), true);

    // Validar que se reciban todos los datos necesarios
    if (
        isset($input['username'], $input['firstname'], $input['lastname'], $input['correo'], $input['password']) &&
        !empty($input['username']) &&
        !empty($input['firstname']) &&
        !empty($input['lastname']) &&
        !empty($input['correo']) &&
        !empty($input['password'])
    ) {
        // Conexión a la base de datos
        $database = new Database();
        $conn = $database->getConnection();

        try {
            $stmt = $conn->prepare("
                INSERT INTO users (username, firstname, lastname, email, password)
                VALUES (:username, :firstname, :lastname, :email, :password)
            ");

            // Hashear la contraseña
            $hashedPassword = password_hash($input['password'], PASSWORD_BCRYPT);

            // Vincular parámetros
            $stmt->bindParam(':username', $input['username']);
            $stmt->bindParam(':firstname', $input['firstname']);
            $stmt->bindParam(':lastname', $input['lastname']);
            $stmt->bindParam(':email', $input['correo']);
            $stmt->bindParam(':password', $hashedPassword);

            // Ejecutar consulta
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["message" => "Usuario registrado exitosamente."]);
            } else {
                throw new Exception("Error al registrar el usuario.");
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } else {
        // Respuesta si faltan datos
        http_response_code(400);
        echo json_encode(["error" => "Faltan datos requeridos para el registro."]);
    }
} else {
    // Respuesta si no es POST
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido."]);
}
