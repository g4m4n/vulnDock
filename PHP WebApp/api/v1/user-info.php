<?php
header("Content-Type: application/json");
session_start();

require_once './config/database.php';

if (!isset($_SESSION['username'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["error" => "No estás autenticado"]);
    exit();
}

$database = new Database();
$conn = $database->getConnection();

// Consulta para obtener información del usuario
$query = "SELECT username, avatar, is_admin FROM users WHERE username = :username";
$stmt = $conn->prepare($query);
$stmt->bindParam(":username", $_SESSION['username']);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode([
        "username" => $user["username"],
        "avatar" => $user["avatar"],
        "is_admin" => (bool) $user["is_admin"],
    ]);
} else {
    http_response_code(404); // Not Found
    echo json_encode(["error" => "Usuario no encontrado"]);
}
?>
