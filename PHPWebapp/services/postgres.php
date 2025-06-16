<?php
class DatabaseConnector {
    private $pdo;

    public function __construct() {
        try {
            $this->pdo = new PDO("pgsql:host=db;port=5432;dbname=web_app", "admin", "admin");
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
