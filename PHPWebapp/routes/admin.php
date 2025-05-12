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

if ($request === '/api/v1/users' && $method === 'GET') {
    $user = authenticateUser();
    if (! $user) {
        http_response_code(401);
        echo json_encode(['message' => 'No autenticado']);
        exit;
    }
    $controller = new UserController();
    $controller->listUsers([], $user);
    exit;
}

if (preg_match('#^/api/v1/users/(\d+)$#', $request, $matches) && $method === 'DELETE') {
    $user = authenticateUser();
    if (! $user) {
        http_response_code(401);
        echo json_encode(['message' => 'No autenticado']);
        exit;
    }
    $controller = new UserController();
    $controller->deleteUser(['id' => $matches[1]], $user);
    exit;
}

if (preg_match('#^/api/v1/users/(\d+)/toggle-admin$#', $request, $matches)
    && $method === 'GET') {
    $user = authenticateUser();
    if (! $user) {
        http_response_code(401);
        echo json_encode(['message' => 'No autenticado']);
        exit;
    }
    $controller = new UserController();
    $controller->toggleAdmin(['id' => $matches[1]], $user);
    exit;
}

if ($request === '/api/v1/ping' && $method === 'POST') {
    require_once './controllers/UserController.php';
    $user = authenticateUser();
    (new AdminController())->pingHost($_POST, $_FILES);
    exit;
}
