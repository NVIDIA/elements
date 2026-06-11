# Elements CLI Installer - Windows PowerShell
# Usage: irm https://NVIDIA.github.io/elements/install.ps1 | iex

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$baseUrl = if ($env:NVE_BASE_URL) { $env:NVE_BASE_URL } else { 'https://NVIDIA.github.io/elements/cli' }
$platformKey = 'windows-x64'
$tempBinary = Join-Path ([System.IO.Path]::GetTempPath()) ("nve-" + [System.IO.Path]::GetRandomFileName() + ".exe")

try {
  $manifest = Invoke-RestMethod -Uri "$baseUrl/manifest.json"
  $entry = $manifest.platforms.$platformKey

  if (-not $entry) {
    throw "Platform $platformKey not found in CLI manifest."
  }

  $runningOnWindows = ($env:OS -eq 'Windows_NT') -or ($IsWindows -eq $true) -or ($PSVersionTable.OS -like '*Windows*')
  $downloadName = if ($runningOnWindows -and $entry.filename -notlike '*.exe') { "$($entry.filename).exe" } else { $entry.filename }

  Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/$downloadName" -OutFile $tempBinary
  $actualChecksum = (Get-FileHash -Algorithm SHA256 -Path $tempBinary).Hash.ToLowerInvariant()
  if ($actualChecksum -ne $entry.checksum) {
    throw "Checksum verification failed for $($entry.filename)."
  }

  & $tempBinary install $tempBinary
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }

  Write-Host ''
  Write-Host 'Elements CLI installed successfully.'
} finally {
  if (Test-Path $tempBinary) {
    Remove-Item $tempBinary -Force
  }
}
