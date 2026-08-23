# digi-gastro Smoke-Test
# Prüft: Server erreichbar, Landingpage-Marker (3D-Kartenstapel,
# Video-Hintergrund, Sticky-Fix), PWA-Dateien und robots.txt.
#
# Nutzung:
#   powershell -ExecutionPolicy Bypass -File scripts\smoke-test.ps1            # schnell (ohne Build)
#   powershell -ExecutionPolicy Bypass -File scripts\smoke-test.ps1 -Build     # mit vorherigem npm run build
#   powershell ... -Port 3100                                                  # anderer Port

param(
    [int]$Port = 3100,
    [switch]$Build
)

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
$base = "http://localhost:$Port"
$fail = 0

function Check($name, $cond) {
    if ($cond) { Write-Host "PASS  $name" -ForegroundColor Green }
    else { Write-Host "FAIL  $name" -ForegroundColor Red; $script:fail++ }
}

# ── Optional bauen ──
if ($Build) {
    Write-Host "== npm run build ==" -ForegroundColor Cyan
    Push-Location $root
    $out = & npm run build 2>&1 | Select-String -Pattern "Compiled|error|Failed" | Select-Object -First 5
    $out | ForEach-Object { Write-Host "      $_" }
    Pop-Location
}

# ── Server starten, falls nicht erreichbar ──
$healthy = $false
try {
    $null = Invoke-WebRequest -Uri "$base/api/health" -UseBasicParsing -TimeoutSec 3
    $healthy = $true
    Write-Host "== Server laeuft bereits auf :$Port =="
} catch {}

if (-not $healthy) {
    Write-Host "== Starte Server auf :$Port (Hintergrund) ==" -ForegroundColor Cyan
    Start-Process -FilePath "node" `
        -ArgumentList "node_modules\next\dist\bin\next","start","-p","$Port" `
        -WorkingDirectory $root `
        -RedirectStandardOutput "$env:TEMP\dg-smoke-server.log" `
        -RedirectStandardError  "$env:TEMP\dg-smoke-server.err.log" `
        -WindowStyle Hidden
}

$deadline = (Get-Date).AddSeconds(60)
while ((Get-Date) -lt $deadline) {
    try {
        $null = Invoke-WebRequest -Uri "$base/api/health" -UseBasicParsing -TimeoutSec 3
        break
    } catch { Start-Sleep -Seconds 2 }
}
try { $null = Invoke-WebRequest -Uri "$base/api/health" -UseBasicParsing -TimeoutSec 3; $healthy = $true } catch {}

Check "Server /api/health erreichbar" $healthy
if ($healthy) {
    try { $html = (Invoke-WebRequest -Uri "$base/" -UseBasicParsing -TimeoutSec 30).Content } catch { $html = "" }
    Check "Landingpage laedt"            ($html.Length -gt 5000)
    Check "3D-Kartenstapel (8 Items)"    (([regex]::Matches($html,'feature-stack-item')).Count -eq 8)
    Check "Sticky-Fix overflow-x-clip"   ($html.Contains("overflow-x-clip"))
    Check "Video-Hintergrund-Layer"      ($html.Contains("pointer-events-none fixed inset-0 z-0"))
    Check "ScrollVideo-Komponente"       ($html.Contains("disableRemotePlayback") -or $html.Contains("<video"))

    try { $r = Invoke-WebRequest -Uri "$base/robots.txt" -UseBasicParsing -TimeoutSec 10
          Check "robots.txt OK"            ($r.StatusCode -eq 200 -and $r.Content.Contains("sitemap")) } catch { Check "robots.txt OK" $false }
    try { $m = Invoke-WebRequest -Uri "$base/manifest.json" -UseBasicParsing -TimeoutSec 10
          $mj = $m.Content | ConvertFrom-Json
          Check "PWA-Manifest (maskable)"  ($m.StatusCode -eq 200 -and ($mj.icons | Where-Object { $_.purpose -eq "maskable" }).Count -ge 2) } catch { Check "PWA-Manifest (maskable)" $false }
    try { $sw = Invoke-WebRequest -Uri "$base/sw.js" -UseBasicParsing -TimeoutSec 10
          Check "Service Worker v2+"       ($sw.StatusCode -eq 200) } catch { Check "Service Worker v2+" $false }
}

Write-Host ""
if ($fail -eq 0) { Write-Host "ERGEBNIS: ALLE CHECKS OK" -ForegroundColor Green }
else             { Write-Host "ERGEBNIS: $fail CHECK(S) FEHLGESCHLAGEN" -ForegroundColor Red }
exit $fail
