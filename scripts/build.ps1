# build.ps1 - Windows build script

param (
    [string]$Platform = "all"
)

# Set error action to stop
$ErrorActionPreference = "Stop"

# Go to repository root
$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
Set-Location $ProjectRoot

# Help command
if ($Platform -eq "-h" -or $Platform -eq "--help") {
    Write-Host "Usage: .\scripts\build.ps1 [firefox|chrome|all]"
    exit 0
}

function Build-Platform {
    param (
        [string]$Target
    )
    Write-Host "=== Building $Target ==="

    # 1. Clean up old manifest and dist directories
    if (Test-Path src/manifest.json) { Remove-Item src/manifest.json -Force }
    if (Test-Path src/popup/popup.css) { Remove-Item src/popup/popup.css -Force }
    if (Test-Path "dist/$Target") { Remove-Item "dist/$Target" -Recurse -Force }

    # Ensure clean up on exit/error
    $cleanup = {
        if (Test-Path src/manifest.json) { Remove-Item src/manifest.json -Force }
        if (Test-Path src/popup/popup.css) { Remove-Item src/popup/popup.css -Force }
    }

    $tmpDir = $null
    try {
        # 2. Merge manifests
        node scripts/utility/merge.js src/manifest.common.json "src/manifest.$Target.json" src/manifest.json

        # Copy platform-specific css
        Copy-Item -Path "src/popup/popup.$Target.css" -Destination "src/popup/popup.css" -Force

        # 3. Lint extension
        node scripts/utility/lint.js "$Target"

        # 4. Build extension
        $tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.IO.Path]::GetRandomFileName())
        $null = New-Item -ItemType Directory -Path $tmpDir

        npx web-ext build `
          --source-dir    ./src `
          --artifacts-dir "$tmpDir" `
          --overwrite-dest `
          --no-input `
          --ignore-files manifest.firefox.json manifest.chrome.json manifest.common.json popup/popup.firefox.css popup/popup.chrome.css

        # 5. Copy zip to dist and extract
        $zipFiles = Get-ChildItem -Path $tmpDir -Filter *.zip
        if ($zipFiles.Count -eq 0) {
            throw "Build failed, no zip file generated."
        }
        $zipFile = $zipFiles[0].FullName
        
        # Ensure dist directory exists
        $null = New-Item -ItemType Directory -Path "dist" -Force
        
        # Copy zip next to target dir
        $destZip = "dist/$Target.zip"
        Copy-Item -Path $zipFile -Destination $destZip -Force

        # Extract to unpacked dir
        $destDir = "dist/$Target"
        $null = New-Item -ItemType Directory -Path $destDir -Force
        Expand-Archive -Path $destZip -DestinationPath $destDir -Force

        # Clean up tmp
        Remove-Item -Recurse -Force $tmpDir
        & $cleanup

        Write-Host "=== Build $Target complete: dist/$Target ==="
        Write-Host ""
    }
    catch {
        & $cleanup
        if ($tmpDir -and (Test-Path $tmpDir)) { Remove-Item -Recurse -Force $tmpDir }
        throw $_
    }
}

if ($Platform -eq "firefox") {
    Build-Platform "firefox"
} elseif ($Platform -eq "chrome") {
    Build-Platform "chrome"
} elseif ($Platform -eq "all") {
    Build-Platform "firefox"
    Build-Platform "chrome"
} else {
    Write-Error "Invalid platform '$Platform'. Choose firefox, chrome, or all."
    exit 1
}
