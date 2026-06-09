$ErrorActionPreference = "Continue"
$lines = Get-Content "c:\Users\kinge\Downloads\digi-gastro\main.py"
for ($i = 5440; $i -le 5470 -and $i -le $lines.Count; $i++) {
    Write-Host ("{0,5}: {1}" -f $i, $lines[$i-1])
}
