<?php
// database.php

// Configuración de la base de datos
$servername = "db";
$username = "root";
$password = "root";
$dbname = "blog_app";

class Database {
    private $host = "db";           // Dirección del servidor
    private $db_name = "blog_app";     // Nombre de la base de datos
    private $username = "root";       // Usuario de la base de datos
    private $password = "root";   // Contraseña del usuario
    private $conn;

    // Método para obtener la conexión
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Error de conexión: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
