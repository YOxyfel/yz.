# Reload PATH in the current PowerShell session (fixes "git is not recognized"
# without closing the terminal).
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')

Write-Host 'PATH refreshed.' -ForegroundColor Green
git --version
