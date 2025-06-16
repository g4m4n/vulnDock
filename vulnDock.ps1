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
$osSystem = $null
$database = $null
$language = $null

for ($i = 0; $i -lt $args.Length; $i++) {
    switch ($args[$i]) {
        '--help' { Show-Help }
        '--os-system' {
            if ($i + 1 -lt $args.Length) {
                $osSystem = $args[$i + 1].ToLower()
                $i++
            } else {
                Write-Host "Error: --os-system requires a value" -ForegroundColor Red
                exit 1
            }
        }
        '--database' {
            if ($i + 1 -lt $args.Length) {
                $database = $args[$i + 1].ToLower()
                $i++
            } else {
                Write-Host "Error: --database requires a value" -ForegroundColor Red
                exit 1
            }
        }
        '--language' {
            if ($i + 1 -lt $args.Length) {
                $language = $args[$i + 1].ToLower()
                $i++
            } else {
                Write-Host "Error: --language requires a value" -ForegroundColor Red
                exit 1
            }
        }
        default {
            # ignore unknown params or positional args
        }
    }
}

Show-Banner

# Define valid options
$validOsOptions = @("linux", "windows")
$validDbOptions = @("mysql", "postgresql", "mssql")
$validLangOptionsWindows = @("javascript", "java", "python", "php", "csharp")
$validLangOptionsLinux = @("javascript", "java", "python", "php")

# Function to validate the input or prompt if null/invalid
function Validate-OrPromptOs {
    param($os)
    if ($os -and $validOsOptions -contains $os) {
        return $os
    }
    return Prompt-Choice "Please select the operating system:" $validOsOptions
}

function Validate-OrPromptDb {
    param($db)
    if ($db -and $validDbOptions -contains $db) {
        return $db
    }
    return Prompt-Choice "Please select the database:" $validDbOptions
}

function Validate-OrPromptLang {
    param($lang, $os)
    $validLangOptions = if ($os -eq "windows") { $validLangOptionsWindows } else { $validLangOptionsLinux }
    if ($lang -and $validLangOptions -contains $lang) {
        # Special check for C# on non-Windows
        if ($lang -eq "csharp" -and $os -ne "windows") {
            Write-Host "C# is only available if Windows is selected." -ForegroundColor Red
            return Prompt-Choice "Please select the programming language:" $validLangOptions
        }
        return $lang
    }
    return Prompt-Choice "Please select the programming language:" $validLangOptions
}

# Run validation or interactive prompts
$osSystem = Validate-OrPromptOs $osSystem
Write-Host "`n$($osSystem.ToUpper()) selected. Initializing $osSystem vulnerability lab..."

$database = Validate-OrPromptDb $database
Write-Host "`n$database selected."

$language = Validate-OrPromptLang $language $osSystem
Write-Host "`n$language selected."

Write-Host "`nConfiguration complete. Proceeding with the setup..."

# Simulate work
Write-Host "Setting up your environment..."

# Simulated images created
$imagesCreated = @("image1.png", "image2.png", "image3.png")

# Ctrl+C handler
$global:stopRequested = $false

Register-EngineEvent PowerShell.Exiting -Action {
    if (-not $global:stopRequested) {
        Write-Host "`nCTRL+C detected!"
        $response = Read-Host "Do you want to stop the setup? (Y/N)"
        if ($response.ToUpper() -eq 'Y') {
            $global:stopRequested = $true
            $deleteResponse = Read-Host "Do you want to delete created images? (Y/N)"
            if ($deleteResponse.ToUpper() -eq 'Y') {
                foreach ($img in $imagesCreated) {
                    Write-Host "Deleting $img..."
                    # Remove-Item $img -ErrorAction SilentlyContinue # Uncomment to actually delete files
                }
                Write-Host "Images deleted."
            }
            Write-Host "Setup stopped by user."
            exit 0
        } else {
            Write-Host "Continuing setup..."
        }
    }
}

# Simulate a long-running task so you can test Ctrl+C interrupt
for ($i=1; $i -le 10; $i++) {
    Write-Host "Step $i of 10 running..."
    Start-Sleep -Seconds 3
}

Write-Host "Setup finished successfully."