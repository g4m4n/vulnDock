<?php

require_once __DIR__ . '/../services/DatabaseConnector.php';
require_once __DIR__ . '/../helpers/response.php';

class AdminController {

    // Importar usuarios desde URL
    public function importUsers($data, $files) {
        $db = new DatabaseConnector();
        $url = filter_var($data['url'] ?? '', FILTER_VALIDATE_URL);
        if (!$url) {
            return jsonResponse(['message' => 'URL no válida'], 400);
        }

        try {
            $json = @file_get_contents($url);
            if ($json === false) {
                throw new Exception("No se pudo leer la URL");
            }
            $users = json_decode($json, true);
            if (!is_array($users)) {
                throw new Exception("Respuesta no es JSON válido");
            }

            foreach ($users as $user) {
                // Sanitizar y preparar datos
                $username  = addslashes($user['username']  ?? '');
                $email     = addslashes($user['email']     ?? '');
                $firstname = addslashes($user['firstname'] ?? '');
                $lastname  = addslashes($user['lastname']  ?? '');
                $password  = password_hash($user['password'] ?? '', PASSWORD_BCRYPT);
                $isAdmin   = !empty($user['is_admin']) ? 1 : 0;

                $query = "
                    INSERT INTO users
                      (username, email, firstname, lastname, password, is_admin)
                    VALUES
                      ('$username', '$email', '$firstname', '$lastname', '$password', $isAdmin)
                ";
                $db->exec($query);
            }

            return jsonResponse(['message' => 'Usuarios importados correctamente.'], 200);

        } catch (Exception $e) {
            return jsonResponse(['message' => 'Error al importar usuarios: ' . $e->getMessage()], 500);
        }
    }

    // Importar usuarios desde XML
    public function importUsersFromXML($data, $files) {
        $xmlString = $data['xml'] ?? '';
        if (empty($xmlString)) {
            return jsonResponse(['message' => 'XML vacío'], 400);
        }

        // Deshabilitar carga de entidades externas por seguridad
        libxml_disable_entity_loader(true);
        libxml_use_internal_errors(true);

        try {
            $xml = simplexml_load_string($xmlString, 'SimpleXMLElement', LIBXML_NOENT | LIBXML_NOERROR);
            if ($xml === false) {
                $errors = libxml_get_errors();
                libxml_clear_errors();
                throw new Exception("XML inválido");
            }

            $db = new DatabaseConnector();
            foreach ($xml->user as $user) {
                $username  = addslashes((string)$user->username);
                $email     = addslashes((string)$user->email);
                $firstname = addslashes((string)$user->firstname);
                $lastname  = addslashes((string)$user->lastname);
                $password  = password_hash((string)$user->password, PASSWORD_BCRYPT);
                $isAdmin   = ((string)$user->is_admin === 'true') ? 1 : 0;

                $query = "
                    INSERT INTO users
                      (username, email, firstname, lastname, password, is_admin)
                    VALUES
                      ('$username', '$email', '$firstname', '$lastname', '$password', $isAdmin)
                ";
                $db->exec($query);
            }

            return jsonResponse(['message' => 'Usuarios importados desde XML'], 200);

        } catch (Exception $e) {
            return jsonResponse(['message' => 'Error al procesar XML: ' . $e->getMessage()], 500);
        } finally {
            // Restaurar comportamiento por defecto
            libxml_disable_entity_loader(false);
        }
    }

    // Ping inseguro
    public function pingHost($data, $files) {
        $host = escapeshellarg($data['host'] ?? '');
        if (empty($host)) {
            return jsonResponse(['message' => 'Host no proporcionado'], 400);
        }

        // Ejecuta ping (podrías validar formato de host antes)
        exec("ping -c 4 $host 2>&1", $output, $status);

        if ($status !== 0) {
            return jsonResponse(['message' => 'Error al ejecutar el ping.', 'output' => $output], 500);
        }

        return jsonResponse(['output' => implode("\n", $output)], 200);
    }
}
