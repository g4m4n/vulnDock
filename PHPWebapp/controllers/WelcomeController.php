<?php

class SSTIController {
    public function updateWelcome($query) {
        $username = $query['username'] ?? 'Guest';

        // ❌ Vulnerabilidad SSTI: se interpreta como PHP (riesgo de ejecución arbitraria)
        $templateString = "Bienvenido $username!";

        ob_start();
        eval("?>$templateString<?php ");
        $output = ob_get_clean();

        echo $output;
    }
}
