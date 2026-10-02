# PowerShell Setup & Package Installer for Vanna Agent
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Setting up Virtual Environment for Vanna Agent" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

if (-not (Test-Path ".venv")) {
    Write-Host "[1/3] Creating virtual environment (.venv)..." -ForegroundColor Yellow
    python -m venv .venv
} else {
    Write-Host "[1/3] Virtual environment (.venv) already exists." -ForegroundColor Green
}

Write-Host "[2/3] Activating virtual environment..." -ForegroundColor Yellow
& ".\.venv\Scripts\Activate.ps1"

Write-Host "[3/3] Upgrading pip and installing required packages..." -ForegroundColor Yellow
python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   Setup completed successfully!" -ForegroundColor Green
Write-Host "   To run your agent: python main.py" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
