# ================================
#        vulnDock CLI v1.0
# ================================
# Lightweight Vulnerability Lab Setup Tool
# Author: TuNombreAquí
# -------------------------------

Clear-Host

# Banner ASCII "vulnDock"
$banner = @'
             _       ____             _    
__   ___   _| |_ __ |  _ \  ___   ___| | __
\ \ / / | | | | '_ \| | | |/ _ \ / __| |/ /
 \ V /| |_| | | | | | |_| | (_) | (__|   < 
  \_/  \__,_|_|_| |_|____/ \___/ \___|_|\_\
                                            
'@

Write-Host $banner -ForegroundColor Cyan

Write-Host "==========================================="
Write-Host "        Lightweight Vulnerability Lab       "
Write-Host "==========================================="

# Pregunta: Sistema operativo
Write-Host ""
Write-Host "Please select the operating system:"
Write-Host "1) Linux"
Write-Host "2) Windows"
Write-Host ""

do {
    $osChoice = Read-Host "Enter your choice (1 or 2)"
    
    if ($osChoice -ne '1' -and $osChoice -ne '2') {
        Write-Host "Invalid selection. Please enter 1 for Linux or 2 for Windows." -ForegroundColor Red
    }
} while ($osChoice -ne '1' -and $osChoice -ne '2')

switch ($osChoice) {
    '1' { 
        Write-Host "`nLinux selected. Initializing Linux vulnerability lab..." 
    }
    '2' { 
        Write-Host "`nWindows selected. Initializing Windows vulnerability lab..." 
    }
}

# Pregunta: Base de datos
Write-Host ""
Write-Host "Please select the database:"
Write-Host "1) MySQL"
Write-Host "2) PostgreSQL"
Write-Host "3) MSSQL"
Write-Host ""

do {
    $dbChoice = Read-Host "Enter your choice (1, 2, or 3)"
    
    if ($dbChoice -ne '1' -and $dbChoice -ne '2' -and $dbChoice -ne '3') {
        Write-Host "Invalid selection. Please enter 1 for MySQL, 2 for PostgreSQL, or 3 for MSSQL." -ForegroundColor Red
    }
} while ($dbChoice -ne '1' -and $dbChoice -ne '2' -and $dbChoice -ne '3')

switch ($dbChoice) {
    '1' { Write-Host "`nMySQL selected." }
    '2' { Write-Host "`nPostgreSQL selected." }
    '3' { Write-Host "`nMSSQL selected." }
}

# Pregunta: Lenguaje de programación
Write-Host ""
Write-Host "Please select the programming language:"
Write-Host "1) JavaScript"
Write-Host "2) Java"
Write-Host "3) Python"
Write-Host "4) PHP"
Write-Host "5) C# (only available if Windows was selected)"
Write-Host ""

# Validar si el sistema operativo es Windows
if ($osChoice -eq '2') {
    do {
        $langChoice = Read-Host "Enter your choice (1, 2, 3, 4, or 5)"
        
        # Validar si se eligió C# en caso de no estar en Windows
        if ($langChoice -eq '5' -and $osChoice -ne '2') {
            Write-Host "C# is only available if Windows is selected." -ForegroundColor Red
            $langChoice = $null
        } elseif ($langChoice -ne '1' -and $langChoice -ne '2' -and $langChoice -ne '3' -and $langChoice -ne '4' -and $langChoice -ne '5') {
            Write-Host "Invalid selection. Please enter a valid programming language choice." -ForegroundColor Red
            $langChoice = $null
        }
    } while ($langChoice -eq $null)
} else {
    do {
        $langChoice = Read-Host "Enter your choice (1, 2, 3, or 4)"
        
        if ($langChoice -ne '1' -and $langChoice -ne '2' -and $langChoice -ne '3' -and $langChoice -ne '4') {
            Write-Host "Invalid selection. Please enter 1 for JavaScript, 2 for Java, 3 for Python, or 4 for PHP." -ForegroundColor Red
        }
    } while ($langChoice -ne '1' -and $langChoice -ne '2' -and $langChoice -ne '3' -and $langChoice -ne '4')
}

switch ($langChoice) {
    '1' { Write-Host "`nJavaScript selected." }
    '2' { Write-Host "`nJava selected." }
    '3' { Write-Host "`nPython selected." }
    '4' { Write-Host "`nPHP selected." }
    '5' { Write-Host "`nC# selected." }
}

Write-Host "`nConfiguration complete. Proceeding with the setup..."