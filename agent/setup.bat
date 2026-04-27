@echo off
REM Setup and run the orchestrator
REM 
REM Usage:
REM   setup.bat              - Install dependencies
REM   run.bat                - Run orchestrator with MOCK_MODE
REM   test.bat               - Run test harness

setlocal enabledelayedexpansion

cd /d "%~dp0"

if "%1"=="setup" (
    echo Installing dependencies...
    python -m pip install -q -r requirements.txt
    echo Dependencies installed successfully!
    echo.
    echo Next: run 'setup.bat run' to test the orchestrator
    goto end
)

if "%1"=="run" (
    echo Running orchestrator in MOCK_MODE...
    set MOCK_MODE=true
    python orchestrator.py
    goto end
)

if "%1"=="test" (
    echo Running test harness...
    set MOCK_MODE=true
    python test_harness.py
    goto end
)

REM Default: show usage
echo LangGraph Orchestrator - Setup and Run
echo.
echo Usage:
echo   setup.bat setup  - Install dependencies (only first time)
echo   setup.bat run    - Run orchestrator with MOCK_MODE (no backend needed)
echo   setup.bat test   - Run full test harness
echo.
echo Examples:
echo   setup.bat setup
echo   setup.bat run
echo   setup.bat test

:end
endlocal
