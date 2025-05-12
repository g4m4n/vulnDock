<?php
require_once __DIR__ . '/../controllers/WelcomeController.php';

if ($request === '/api/v1/update-welcome' && $method === 'GET') {
    (new SSTIController())->updateWelcome($_GET);
    exit;
}
