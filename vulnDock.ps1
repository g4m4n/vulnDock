# ================================
#        vulnDock CLI v1.0
# ================================
# Lightweight Vulnerability Lab Setup Tool
# Author: Adrian Guzman
# Date: 16-06-2025
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
function Show-Help {
    Show-Banner
    Write-Host "Usage: vulnDock.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  --os-system <linux|windows>       Specify the operating system"
    Write-Host "  --database <mysql|postgresql|mssql> Specify the database"
    Write-Host "  --language <javascript|java|python|php|csharp> Specify the programming language"
    Write-Host "  --help                           Show this help message"
    Write-Host ""
    Write-Host "Example:"
    Write-Host "  .\vulnDock.ps1 --os-system linux --database mysql --language python"
    exit 0
}


function Prompt-Choice($prompt, $options) {
    Write-Host $prompt
    for ($j = 0; $j -lt $options.Length; $j++) {
        Write-Host "$($j+1)) $($options[$j])"
    }
    Write-Host ""
    do {
        $choice = Read-Host "Enter your choice (1-$($options.Length))"
    } while (-not ($choice -match '^[1-9][0-9]*$') -or $choice -lt 1 -or $choice -gt $options.Length)
    return $options[$choice - 1]
}

# Parse command line arguments manually to allow --flag value style
$validOsOptions = @("linux", "windows")
$validDbOptions = @("mysql", "postgresql", "mssql")
$validLangOptions = @("javascript", "java", "python", "php", "csharp")

$dockerfilesDb = @{
    "windows" = @{
        "mysql" = "Docker/DockerfileMySQLWin"
        "postgresql" = "Docker/DockerfilePostgresWin"
        "mssql" = "Docker/DockerfileMSSQL"
    }
    "linux" = @{
        "mysql" = "Docker/DockerfileMySQL"
        "postgresql" = "Docker/DockerfilePostgres"
        "mssql" = "Docker/DockerfileMSSQL"
    }
}

$dockerfilesWeb = @{
    "windows" = @{
        "php" = "Docker/DockerfilePHPWin"
        "javascript" = "Docker/DockerfileNodeWin"
        "java" = "Docker/DockerfileJavaWin"
        "csharp" = "Docker/DockerfileAspnetWin"
        "python" = "Docker/DockerfilePythonWin"
    }
    "linux" = @{
        "php" = "Docker/DockerfilePHP"
        "javascript" = "Docker/DockerfileNode"
        "csharp" = "Docker/DockerfileAspnet"
        "java" = "Docker/DockerfileJava"
        "python" = "Docker/DockerfilePython"
    }
}

$backendFolders = @{ "php" = ".\PHPWebapp"; "javascript" = ".\NodeJSWebapp"; "java" = ".\JavaWebapp"; "csharp" = ".\ASPNETWebapp"; "python" = ".\PythonWebapp" }

function Get-DbConnectorFile {
    param([string]$language, [string]$database)
    $ext = switch ($language) { "php" {"php"}; "javascript" {"js"}; "java" {"java"}; "csharp" {"cs"}; "python" {"py"} }
    $fileName = "$language" + "_" + "$database" + "." + "$ext"
    $filePath = Join-Path -Path "..\DbConnectors" -ChildPath $fileName
    if (Test-Path $filePath) { return $filePath } else { return $null }
}

function Prompt-Choice($prompt, $options) {
    Write-Host $prompt
    for ($j = 0; $j -lt $options.Length; $j++) { Write-Host "$($j+1)) $($options[$j])" }
    do { $choice = Read-Host "Enter choice (1-$($options.Length))" } while (-not ($choice -match '^[1-9][0-9]*$') -or $choice -lt 1 -or $choice -gt $options.Length)
    return $options[$choice - 1]
}

function Build-DockerComposeDynamic {
    param($os, $db, $lang)
    $dockerfileDb = $dockerfilesDb[$os][$db]
    $dockerfileWeb = $dockerfilesWeb[$os][$lang]
    return @"
version: '3'

services:
  db:
    container_name: vulndock-database
    build:
      context: .
      dockerfile: $dockerfileDb
    ports:
      - "$(if ($db -eq "mssql") {"1433"} elseif ($db -eq "postgresql") {"5432"} else {"3306"}):$(if ($db -eq "mssql") {"1433"} elseif ($db -eq "postgresql") {"5432"} else {"3306"})"
    networks:
      - mynetwork

  web:
    container_name: vulndock-web
    build:
      context: .
      dockerfile: $dockerfileWeb
    ports:
      - "80:80"
    depends_on:
      - db
    networks:
      - mynetwork

networks:
  mynetwork:
    driver: bridge
"@
}

function Copy-FoldersForWindows {
    param($lang, $db)
    $backendSrc = $backendFolders[$lang]
    Copy-Item -Recurse ".\Frontend" ".\Docker\frontend" -Force
    Copy-Item -Recurse $backendSrc ".\Docker\backend" -Force
    $dbConnectorFile = Get-DbConnectorFile -language $lang -database $db
    #if ($dbConnectorFile) {
    #
    #Copy-Item $dbConnectorFile ".\backend" -Force
    #}
}

function Inicialize-Docker {
    docker info > $null 2>&1
    $dockerRunning = ($LASTEXITCODE -eq 0)

    if (-not $dockerRunning) {
        Write-Warning "Docker does not appear to be running."
        $answer = Read-Host "Do you want to start Docker now? (y/n)"
        if ($answer -eq 'y') {
            Write-Host "Attempting to start Docker..."

            # Start Docker Desktop (Windows only)
            start "C:\Program Files\Docker\Docker\Docker Desktop.exe"

            # Wait for it to start (retry loop)
            $maxAttempts = 20
            $attempt = 0
            do {
                Start-Sleep -Seconds 3
                try {
                    docker info > $null 2>&1
                    $dockerRunning = $true
                } catch {
                    $dockerRunning = $false
                }
                $attempt++
            } while (-not $dockerRunning -and $attempt -lt $maxAttempts)

            if ($dockerRunning) {
                Write-Host "Docker is now running."
            } else {
                Write-Error "Docker could not be started automatically. Please start it manually and try again."
                exit 1
            }
        } else {
            Write-Host "Docker is required. Exiting script."
            exit 1
        }
    }
}

function Ensure-DockerEngineMatchesOSSystem {
    param (
        [string]$osSystem
    )

    $dockerInfo = docker info
    if ($dockerInfo -match "OSType: linux") {
        $dockerEngine = "linux"
    } elseif ($dockerInfo -match "OSType: windows") {
        $dockerEngine = "windows"
    } else {
        Write-Warning "Could not determine current Docker engine."
        return
    }

    if ($dockerEngine -ne $osSystem) {
        Write-Warning "Docker is running on '$dockerEngine' engine, but the script expects '$osSystem'."

        $switchCmd = if ($osSystem -eq "linux") {
            "& 'C:\Program Files\Docker\Docker\DockerCli.exe' -SwitchLinuxEngine"
        } elseif ($osSystem -eq "windows") {
            "& 'C:\Program Files\Docker\Docker\DockerCli.exe' -SwitchWindowsEngine"
        } else {
            Write-Error "Invalid target engine: $osSystem"
            return
        }

        $confirm = Read-Host "Do you want to switch Docker to '$osSystem' engine? (y/n)"
        if ($confirm -eq 'y') {
            Write-Host "Switching Docker engine to $osSystem..."
            Invoke-Expression $switchCmd
            Write-Host "Docker is switching engines. Please wait and restart this script afterward."
            exit 0
        } else {
            Write-Warning "Docker engine not changed. The script may not work correctly."
        }
    }
}
    

function Remove-FoldersForWindows {
    if (Test-Path ".\Docker\frontend") { Remove-Item -Recurse -Force ".\Docker\frontend" }
    if (Test-Path ".\Docker\backend") { Remove-Item -Recurse -Force ".\Docker\backend" }
}

$osSystem = Prompt-Choice "Select OS:" $validOsOptions
$database = Prompt-Choice "Select DB:" $validDbOptions
$language = Prompt-Choice "Select Language:" $validLangOptions

$composeContent = Build-DockerComposeDynamic -os $osSystem -db $database -lang $language
Set-Content -Path "docker-compose.yml" -Value $composeContent -Encoding UTF8
Write-Host "Generated docker-compose.yml"

if ($osSystem -eq "windows") { Copy-FoldersForWindows -lang $language -db $database }

Write-Host "Starting Docker..."


Inicialize-Docker
Ensure-DockerEngineMatchesOSSystem -osSystem $osSystem
docker-compose up -d

Write-Host "Running. Press Ctrl+C to stop..."


Write-Host "Press 'q' to quit and cleanup..."

while ($true) {
    $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    if ($key.Character -eq 'q') {
        Write-Host "`n'q' pressed. Cleaning up..."
        docker-compose down
        if ($osSystem -eq "windows") { Remove-FoldersForWindows }
        $deleteImg = Read-Host "Delete Docker images? (Y/N)"
        if ($deleteImg.ToUpper() -eq 'Y') {
            docker rmi -f vulndock-database vulndock-web
        }
        break
    }
}