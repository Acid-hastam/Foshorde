@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Foshorde GUI Builder

echo ========================================================
echo   Foshorde - Building Release GUI Executable
echo ========================================================

:: Ensure Cargo/Rust is in PATH
where cargo >nul 2>&1
if errorlevel 1 (
    if exist "%USERPROFILE%\.cargo\bin\cargo.exe" (
        set "PATH=%USERPROFILE%\.cargo\bin;!PATH!"
    ) else (
        echo [ERROR] Cargo/Rust was not found. Please install Rust.
        pause
        exit /b 1
    )
)

cd /d "%~dp0foshorde-gui"

echo [*] Building Tauri Release package (standalone exe)...
call npx tauri build --no-bundle
if errorlevel 1 (
    echo [ERROR] Build failed!
    cd /d "%~dp0"
    pause
    exit /b 1
)

:: Locate built exe
set "TARGET_EXE=%~dp0foshorde-gui\src-tauri\target\release\foshorde-gui.exe"
if not exist "!TARGET_EXE!" set "TARGET_EXE=%~dp0foshorde-gui\src-tauri\target\release\Foshorde.exe"

if exist "!TARGET_EXE!" (
    echo [*] Copying standalone executable to project root...
    copy /y "!TARGET_EXE!" "%~dp0Foshorde.exe" >nul
    echo.
    echo ========================================================
    echo   [SUCCESS] Foshorde.exe created successfully in root!
    echo ========================================================
) else (
    echo [WARNING] Built exe not found in release folder.
)

cd /d "%~dp0"
pause
