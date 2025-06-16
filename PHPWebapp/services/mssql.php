<?php
class DatabaseConnector {
    private $pdo;

    public function __construct() {
        try {
            $this->pdo = new PDO("sqlsrv:Server=db;Database=web_app", "sa", "YourStrong!Passw0rd");
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }

    public function query($sql) {
        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function exec($sql) {
        return $this->pdo->exec($sql);
    }

    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }
}
