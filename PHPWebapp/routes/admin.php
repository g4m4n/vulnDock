<?php

require_once './helpers/middleware.php';
require_once './controllers/AdminController.php';

if ($request === '/api/v1/users/import' && $method === 'POST') {
    require_once './controllers/UserController.php';
    $user = authenticateUser();
    (new AdminController())->importUsers($_POST, $_FILES);
    exit;
}

if ($request === '/api/v1/users/import-xml' && $method === 'POST') {
    require_once './controllers/UserController.php';
    $user = authenticateUser();
    (new AdminController())->importUsersFromXML($_POST, $_FILES);
    exit;
}

if ($request === '/api/v1/ping' && $method === 'POST') {
    require_once './controllers/UserController.php';
    $user = authenticateUser();
    (new AdminController())->pingHost($_POST, $_FILES);
    exit;
}
