# install.ps1 — instala a skill scaffold-site no Claude Code (Windows)
# Uso:  powershell -ExecutionPolicy Bypass -File install.ps1
$ErrorActionPreference = "Stop"

$source = Join-Path $PSScriptRoot "skills\scaffold-site"
$dest   = Join-Path $env:USERPROFILE ".claude\skills\scaffold-site"

if (-not (Test-Path $source)) {
    Write-Error "Não encontrei a skill em $source. Corre o script a partir da raiz do repo."
    exit 1
}

New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null

if (Test-Path $dest) {
    Write-Host "A skill já existe em $dest — a substituir..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $dest
}

Copy-Item -Recurse -Force $source $dest
Write-Host "✓ Skill instalada em $dest" -ForegroundColor Green
Write-Host "Abre o Claude Code e usa:  /scaffold-site <nome do negócio>" -ForegroundColor Cyan
