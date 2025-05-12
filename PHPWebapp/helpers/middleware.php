<?php
function authenticateUser() {
    if (!isset($_COOKIE['session'])) return null;
    $decoded = json_decode(base64_decode($_COOKIE['session']), true);
    return $decoded;
}
