<?php

require_once __DIR__ . '/../services/DatabaseConnector.php';
require_once __DIR__ . '/../helpers/response.php';
require_once 'vendor/autoload.php';  // Para XML

use GuzzleHttp\Client;

class AdminController {

    // Importar usuarios desde URL (SSRF vulnerable)
    public function importUsers($data, $files) {
        $db = new DatabaseConnector();
        $url = $data['url'];

        // Vulnerabilidad SSRF: No validamos el dominio de la URL
        try {
            $client = new Client();
            $response = $client->get($url);
            $users = json_decode($response->getBody()->getContents(), true);
            
            foreach ($users as $user) {
                $query = "INSERT INTO users (username, email, firstname, lastname, password, is_admin) 
                          VALUES ('{$user['username']}', '{$user['email']}', '{$user['firstname']}', '{$user['lastname']}', 
                                  '" . password_hash($user['password'], PASSWORD_BCRYPT) . "', {$user['is_admin']} )";
                // Ejecutar consulta directamente con exec (como mencionaste anteriormente)
                $db->exec($query);
            }

            return jsonResponse(['message' => 'Usuarios importados correctamente.']);
        } catch (Exception $e) {
            return jsonResponse(['message' => 'Error al importar usuarios: ' . $e->getMessage()], 500);
        }
    }

    // Importar usuarios desde XML (XXE vulnerable)
   public function importUsersFromXML($data, $files) {
        $xml = $data['xml'];
        $dom = new DOMDocument();
        $dom->loadXml($xml);
        $xpath = new DOMXpath($dom);
        try {
            foreach ($xpath->evaluate('//user') as $user) {
                // Extraer los valores de los elementos del XML
                $username = $user->getElementsByTagName('username')->item(0)->nodeValue;
                $email = $user->getElementsByTagName('email')->item(0)->nodeValue;
                $firstname = $user->getElementsByTagName('firstname')->item(0)->nodeValue;
                $lastname = $user->getElementsByTagName('lastname')->item(0)->nodeValue;
                $password = $user->getElementsByTagName('password')->item(0)->nodeValue;
                $isAdmin = ($user->getElementsByTagName('is_admin')->item(0)->nodeValue === 'true') ? 1 : 0;

                // Insertar usuario en la base de datos
                $db = new DatabaseConnector(); // Conectar con la base de datos

                // Preparar la consulta SQL
                $query = "INSERT INTO users (username, email, firstname, lastname, password, is_admin) 
                          VALUES ('{$username}', '{$email}', '{$firstname}', '{$lastname}', 
                                  '" . password_hash($password, PASSWORD_BCRYPT) . "', $isAdmin)";

                // Ejecutar la consulta
                $db->exec($query);
            }

            // Retornar respuesta exitosa
            return jsonResponse(['message' => 'Usuarios importados desde XML'], 200);

        } catch (Exception $e) {
            // En caso de error, retornar mensaje de error
            return jsonResponse(['message' => 'Error al insertar usuarios desde XML: ' . $e->getMessage()], 500);
        } finally {
            libxml_disable_entity_loader(true); // Deshabilitar carga de entidades externas después de procesar el XML
        }
    }

    // Ping inseguro
    public function pingHost($data, $files) {
        $host = $data['host'];

        // Vulnerabilidad: No estamos validando adecuadamente el host
        exec("ping -c 4 " . escapeshellarg($host), $output, $status);

        if ($status !== 0) {
            return jsonResponse(['message' => 'Error al ejecutar el ping.'], 500);
        }

        return jsonResponse(['output' => implode("\n", $output)]);
    }
}
