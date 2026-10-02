@echo off
echo ========================================================
echo   Setting up Virtual Environment for Vanna Agent
echo ========================================================

cd /d "%~dp0"

IF NOT EXIST ".venv" (
    echo [1/3] Creating virtual environment (.venv)...
    python -m venv .venv
) ELSE (
    echo [1/3] Virtual environment (.venv) already exists.
)

echo [2/3] Activating virtual environment...
call .venv\Scripts\activate.bat

echo [3/3] Installing and upgrading required packages...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo ========================================================
echo   Setup completed successfully!
echo   To start the agent:
echo     call .venv\Scripts\activate.bat
echo     python main.py
echo ========================================================
cmd /k
