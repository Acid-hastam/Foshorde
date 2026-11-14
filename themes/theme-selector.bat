@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Foshorde - Theme Selector
mode con cols=90 lines=50

set "dir=%~dp0"
:: The chosen theme lives outside the program folder, so updates never touch it
set "cfg=%LOCALAPPDATA%\Foshorde"
for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "OFF=%ESC%[0m"

if not exist "%dir%themes.bat" (
    echo [ERROR] themes.bat not found next to this script.
    pause
    exit /b 1
)

set "cur=acid"
if exist "%cfg%\theme.cfg" set /p cur=<"%cfg%\theme.cfg"

:menu
echo !OFF!
cls
echo.
echo   !OFF!Theme      current: !cur!
echo.
set /a tn=0
for %%t in (acid dracula nord monokai catppuccin murphy) do (
    set /a tn+=1
    set "name!tn!=%%t"
    call :preview !tn! %%t
)

echo !OFF!
set "pick="
set "chosen="
set /p "pick=  Choose theme [1-6]  (Enter = back): "
if not defined pick goto :end
if /i "!pick!"=="Q" goto :end
for %%n in (1 2 3 4 5 6) do if "!pick!"=="%%n" set "chosen=!name%%n!"
if not defined chosen goto :menu

if not exist "%cfg%" mkdir "%cfg%"
>"%cfg%\theme.cfg" echo !chosen!
set "cur=!chosen!"

:: ---- Apply full screen so you can see it live ----
call "%dir%themes.bat" !chosen!
echo !RST!
cls
call "%dir%themes.bat" logo
echo !GRN!  [OK]!RST! Theme saved: !BLD!!WHT!!LABEL!!RST!
echo.
echo !YEL!  [SKIPPED]!RST! sample    !RED![FAILED]!RST! sample    !MAG!sample_file.mp4!RST!
echo.
set "again="
set /p "again=!GRY!  Enter = done, P = pick another: !RST!"
if /i "!again!"=="P" goto :menu
goto :end

:end
echo !OFF!
cls
endlocal
exit /b 0


:preview
call "%dir%themes.bat" %2
echo !OFF!  [%1] %2  -  !LABEL!
echo !RST!  !CYN!!BLD!F O S H O R D E!RST!  !GRY!video compressor!EL!!OFF!
echo !RST!  !GRY![1/3]!RST! !WHT!Deadlock_replay.mp4!EL!!OFF!
echo !RST!  !GRY!145 MB -^>!RST! !GRN!~43 MB!RST!   !GRN![OK]!RST!  !YEL![SKIPPED]!RST!  !RED![FAILED]!EL!!OFF!
echo.
exit /b 0
