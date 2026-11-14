@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

:: Version comes from version.txt (single source of truth, also used by the updater)
set "VERSION=0.0.0"
if exist "%~dp0version.txt" set /p VERSION=<"%~dp0version.txt"
title Foshorde v!VERSION!

:: "foshorde kon [MB|preset]" = quiet mode for any folder (no screen clearing, originals kept)
::     presets: discord (10 MB), whatsapp (16 MB), mail (25 MB)
set "kon=0"
if /i "%~1"=="kon" set "kon=1"
set "kon_mb=%~2"
:: "foshorde update" = download the latest version from GitHub and replace this install
set "upd=0"
if /i "%~1"=="update" set "upd=1"
:: "foshorde path" = re-register THIS script's folder on PATH, then exit
set "pth=0"
if /i "%~1"=="path" set "pth=1"
if /i "%~1"=="version" (
    echo Foshorde v!VERSION!
    exit /b 0
)
if "!upd!"=="1" set "kon=1"
if "!pth!"=="1" set "kon=1"
if "!kon!"=="0" mode con cols=90 lines=40

set "script_dir=%~dp0"
:: "Run as administrator" starts in System32 - move back to the script folder
if /i "%cd%"=="%windir%\System32" cd /d "%script_dir%"

:: ================= Default settings =================
:: These are only the DEFAULTS. Your own choices are saved by the Options menu in
:: %LOCALAPPDATA%\Foshorde\settings.cfg and survive updates.
set "output_dir=feshorde-shod"
set "default_mb=35"
set "cpu_preset=medium"
set "min_kbps=100"
:: Encoder: auto / nvenc / amf / qsv / cpu
set "force_encoder=auto"
:: 1 = keep the original file after a successful compression (interactive mode)
set "keep_originals=0"
:: Check GitHub for a new version once a day (1 = yes, 0 = no)
set "check_updates=1"
:: Parallel connections for downloads (ffmpeg, updates). 1 = single normal download, 2-16 = split the file
set "dl_conn=8"
:: GitHub repository used by "foshorde update"
set "gh_user=Acid-hastam"
set "gh_repo=Foshorde"
set "gh_branch=main"
:: ====================================================

set "SELF=%~f0"
set "cfgdir=%LOCALAPPDATA%\Foshorde"
set "gh_raw=https://raw.githubusercontent.com/!gh_user!/!gh_repo!/!gh_branch!/version.txt"
set "gh_zip=https://github.com/!gh_user!/!gh_repo!/archive/refs/heads/!gh_branch!.zip"
call :load_settings
call :load_theme

:: ---- Locate ffmpeg / ffprobe (already on PATH -> use as is, else bin\, else script folder) ----
set "FFMPEG="
set "FFPROBE="
where ffmpeg >nul 2>&1  && set "FFMPEG=ffmpeg"
where ffprobe >nul 2>&1 && set "FFPROBE=ffprobe"

if not defined FFMPEG  if exist "%script_dir%bin\ffmpeg.exe"  set "FFMPEG=%script_dir%bin\ffmpeg.exe"
if not defined FFPROBE if exist "%script_dir%bin\ffprobe.exe" set "FFPROBE=%script_dir%bin\ffprobe.exe"
if not defined FFMPEG  if exist "%script_dir%ffmpeg.exe"       set "FFMPEG=%script_dir%ffmpeg.exe"
if not defined FFPROBE if exist "%script_dir%ffprobe.exe"      set "FFPROBE=%script_dir%ffprobe.exe"

if "!kon!"=="0" cls
call "%script_dir%themes\themes.bat" logo

:: ---- Self-update does not need ffmpeg ----
if "!upd!"=="1" goto :do_update

if not defined FFMPEG  call :get_ffmpeg
if not defined FFPROBE call :get_ffmpeg

if not defined FFMPEG (
    echo !RED!  [ERROR]!RST! ffmpeg not found. Put ffmpeg.exe next to this script.
    pause
    exit /b 1
)
if not defined FFPROBE (
    echo !RED!  [ERROR]!RST! ffprobe not found. Put ffprobe.exe next to this script.
    pause
    exit /b 1
)

:: ---- Put ffmpeg and the "foshorde" command on PATH (once) ----
if "!pth!"=="1" if exist "%cfgdir%\path.ok" del /f /q "%cfgdir%\path.ok"
call :ensure_path
if "!pth!"=="1" goto :path_done

:: ---- Detect graphics card and encoder once ----
call :detect_encoder
if "!kon!"=="1" goto :kon_start
call :auto_check

:start_screen
call :draw_start
if !total! equ 0 goto :no_videos

:: ---- Ask for target size ----
:ask_target
set "target_mb="
set "ask_each=0"
echo !GRN!  Enter!RST!  compress !total! file^(s^) to !BLD!!WHT!!default_mb! MB!RST!
echo.
echo !GRY!  type a size in MB    !MAG!R!GRY! review    !CYN!O!GRY! options    !RED!Q!GRY! quit!RST!
echo.
set /p "target_mb=!YEL!  > !RST!"
if /i "!target_mb!"=="O" (
    call :options_menu
    if "!opt_go!"=="update" goto :do_update
    goto :start_screen
)
:: hidden shortcuts kept for old habits
if /i "!target_mb!"=="T" (
    call :open_themes
    goto :start_screen
)
if /i "!target_mb!"=="U" goto :do_update
if /i "!target_mb!"=="Q" (
    echo !ESC![0m
    cls
    endlocal
    exit /b 0
)
if /i "!target_mb!"=="R" (
    set "ask_each=1"
    set "target_mb="
)
if not defined target_mb set "target_mb=!default_mb!"
set "chk="
for /f "delims=0123456789" %%x in ("!target_mb!") do set "chk=%%x"
if defined chk (
    echo !RED!  Please enter a whole number.!RST!
    goto :ask_target
)
if !target_mb! lss 1 (
    echo !RED!  Please enter a number greater than 0.!RST!
    goto :ask_target
)
if not exist "%output_dir%" mkdir "%output_dir%"
:: remove leftovers of an interrupted run
del /f /q "%output_dir%\*.tmp.mp4" >nul 2>&1

:: results file (one line per processed file)
set "results=%output_dir%\results.tmp"
if exist "!results!" del /f /q "!results!"

set "quit=0"
if "!ask_each!"=="0" (
    echo.
    echo !GRY!  Compressing at !target_mb! MB - Ctrl+C to stop.!RST!
)
call :build_list
if !total! equ 0 (
    echo !YEL!  No usable video files found.!RST!
    pause
    goto :start_screen
)

:run_counters
set /a ok=0, fail=0, skipped=0, idx=0, saved_mb=0, sum_old=0, sum_new=0

for /f "usebackq tokens=1,2* delims=|" %%a in ("!listfile!") do (
    if "!quit!"=="0" (
        set /a idx+=1
        set "FSH_DONE=%%a"
        call :process %%c
    )
)
if exist "!listfile!" del /f /q "!listfile!" >nul 2>&1

:: =====================================================
:: Final report
:: =====================================================
if "!kon!"=="0" cls
echo.
echo !BLD!!WHT!  Report!RST!
echo.

if exist "!results!" (
    echo !GRY!   #   File                                   Before    After   Saved   Status!RST!
    echo !GRY!  ----------------------------------------------------------------------!RST!
    for /f "usebackq tokens=1-7 delims=|" %%a in ("!results!") do (
        set "r_idx=%%a"
        set "r_name=%%b"
        set "r_old=%%c"
        set "r_new=%%d"
        set "r_pct=%%e"
        set "r_status=%%f"
        call :print_row
    )
    echo !GRY!  ----------------------------------------------------------------------!RST!
    del /f /q "!results!" >nul 2>&1
) else (
    echo !YEL!   No files were processed.!RST!
)

echo.
set /a pct_total=0
if !sum_old! gtr 0 set /a pct_total=(sum_old-sum_new)*100/sum_old

echo   !GRN!!ok! done!RST!    !YEL!!skipped! skipped!RST!    !RED!!fail! failed!RST!
echo   !GRY!!sum_old! MB -^> !sum_new! MB!RST!    !BLD!!GRN!saved !saved_mb! MB!RST! !GRY!^(!pct_total!%%^)!RST!
echo.
if !fail! gtr 0 (
    echo !RED!  Some files failed. Their originals were kept untouched.!RST!
) else if !ok! gtr 0 (
    if "!kon!"=="1" (
        echo !GRN!  Saved next to the originals as *_foshorde.mp4 - originals kept.!RST!
    ) else if "!keep_originals!"=="1" (
        echo !GRN!  Compressed files are in %output_dir% - originals kept.!RST!
    ) else (
        echo !GRN!  Compressed files are in %output_dir%.!RST!
    )
) else (
    echo !YEL!  Nothing was compressed.!RST!
)
echo.
if "!kon!"=="1" goto :kon_exit
set "k="
set /p "k=!GRY!  O = open output folder, Enter = exit: !RST!"
if /i "!k!"=="O" start "" explorer "%output_dir%"
echo !ESC![0m
cls
endlocal
exit /b 0


:: =====================================================
:no_videos
echo !YEL!  No video files found in this folder.!RST!
echo.
set "k="
set /p "k=!GRY!  O = options, Enter = exit: !RST!"
if /i not "!k!"=="O" (
    echo !ESC![0m
    endlocal
    exit /b 0
)
call :options_menu
if "!opt_go!"=="update" goto :do_update
goto :start_screen


:: =====================================================
:: Encoder info (shared by the normal and kon screens) - one quiet line
:: =====================================================
:show_info
if "!ENC!"=="cpu" (
    echo !GRY!  !YEL!!ENC_LABEL!!RST!!GRY!  -  v!VERSION!!RST!
) else (
    echo !GRY!  !GRN!!ENC_LABEL!!RST!!GRY!  -  v!VERSION!!RST!
)
if defined UPD_NOTE echo !YEL!  update v!UPD_NOTE! available!RST! !GRY!^(O -^> Check for updates^)!RST!
if "!NO_GPU_WARN!"=="1" echo !GRY!  no usable GPU encoder - using CPU ^(slower^). Update the graphics driver.!RST!
if defined PATH_MSG echo !GRN!  added to PATH!RST! !GRY!- open a NEW terminal and type: foshorde kon!RST!
set "PATH_MSG="
echo.
exit /b 0


:: =====================================================
:: Options menu. Sets opt_go=update when the user wants to update
:: (the update must be reached with GOTO, never CALL).
:: =====================================================
:options_menu
set "opt_go="
:opt_draw
cls
call "%script_dir%themes\themes.bat" logo
set "keep_txt=no"
if "!keep_originals!"=="1" set "keep_txt=yes"
echo !WHT!  Options!RST!
echo.
echo !CYN!  1!RST!  Theme                !GRY!!theme!!RST!
echo !CYN!  2!RST!  Default size         !GRY!!default_mb! MB!RST!
echo !CYN!  3!RST!  Encoder              !GRY!!force_encoder!!RST!
echo !CYN!  4!RST!  Keep originals       !GRY!!keep_txt!!RST!
echo !CYN!  5!RST!  Check for updates    !GRY!v!VERSION!!RST!
echo !CYN!  6!RST!  Open output folder
echo.
echo !GRY!  Enter  back!RST!
echo.
set "o="
set /p "o=!YEL!  > !RST!"
if not defined o exit /b 0
if "!o!"=="1" (
    call :open_themes
    goto :opt_draw
)
if "!o!"=="2" (
    set "v="
    set /p "v=!GRY!  New default size in MB: !RST!"
    if defined v (
        set "chk="
        for /f "delims=0123456789" %%x in ("!v!") do set "chk=%%x"
        if not defined chk if !v! geq 1 (
            set "default_mb=!v!"
            call :save_settings
        )
    )
    goto :opt_draw
)
if "!o!"=="3" (
    set "v="
    set /p "v=!GRY!  Encoder ^(auto / nvenc / amf / qsv / cpu^): !RST!"
    set "okenc="
    for %%k in (auto nvenc amf qsv cpu) do if /i "!v!"=="%%k" set "okenc=%%k"
    if defined okenc (
        set "force_encoder=!okenc!"
        call :save_settings
        call :detect_encoder
    )
    goto :opt_draw
)
if "!o!"=="4" (
    if "!keep_originals!"=="1" (set "keep_originals=0") else set "keep_originals=1"
    call :save_settings
    goto :opt_draw
)
if "!o!"=="5" (
    set "opt_go=update"
    exit /b 0
)
if "!o!"=="6" (
    if not exist "%output_dir%" mkdir "%output_dir%"
    start "" explorer "%output_dir%"
    goto :opt_draw
)
goto :opt_draw


:: =====================================================
:: Settings: %LOCALAPPDATA%\Foshorde\settings.cfg (key=value). Never touched by updates.
:: =====================================================
:load_settings
set "sfile=!cfgdir!\settings.cfg"
if exist "!sfile!" for /f "usebackq tokens=1,* delims==" %%a in ("!sfile!") do (
    if /i "%%a"=="default_mb"      set "default_mb=%%b"
    if /i "%%a"=="force_encoder"   set "force_encoder=%%b"
    if /i "%%a"=="keep_originals"  set "keep_originals=%%b"
    if /i "%%a"=="cpu_preset"      set "cpu_preset=%%b"
    if /i "%%a"=="check_updates"   set "check_updates=%%b"
)
:: sanity checks so a hand-edited file cannot break the program
set "chk="
for /f "delims=0123456789" %%x in ("!default_mb!") do set "chk=%%x"
if defined chk set "default_mb=35"
if not defined default_mb set "default_mb=35"
if "!default_mb!"=="0" set "default_mb=35"
if not "!keep_originals!"=="1" set "keep_originals=0"
if not "!check_updates!"=="0" set "check_updates=1"
set "okenc="
for %%k in (auto nvenc amf qsv cpu) do if /i "!force_encoder!"=="%%k" set "okenc=%%k"
if not defined okenc set "okenc=auto"
set "force_encoder=!okenc!"
exit /b 0

:save_settings
if not exist "!cfgdir!" mkdir "!cfgdir!"
(
    echo default_mb=!default_mb!
    echo force_encoder=!force_encoder!
    echo keep_originals=!keep_originals!
    echo cpu_preset=!cpu_preset!
    echo check_updates=!check_updates!
) >"!cfgdir!\settings.cfg"
exit /b 0


:: =====================================================
:: Self-update from GitHub.
:: Reached with GOTO (never CALL) because the script replaces itself and must exit.
:: =====================================================
:do_update
echo !GRY!  Current version: v!VERSION!   Checking GitHub...!RST!
set "chk_to=8"
call :check_update
if "!upd_res!"=="ERR" (
    echo !RED!  [ERROR]!RST! Could not reach GitHub, or version.txt is missing in the repo.
    echo !GRY!  Repo: !gh_user!/!gh_repo! ^(!gh_branch!^)!RST!
    goto :update_back
)
if "!upd_res!"=="OK" (
    echo !GRN!  [OK]!RST! You already have the latest version ^(v!VERSION!^).
    goto :update_back
)
echo !YEL!  New version available:!RST! !WHT!v!upd_ver!!RST!
if "!upd!"=="0" (
    set "ans_up="
    set /p "ans_up=!GRY!  Download and install it now? [Y/n]: !RST!"
    if /i "!ans_up!"=="N" goto :update_back
)
set "dl_zip=%TEMP%\foshorde-update.zip"
set "dl_dir=%TEMP%\foshorde-update"
if exist "!dl_zip!" del /f /q "!dl_zip!"
if exist "!dl_dir!" rmdir /s /q "!dl_dir!"
set "dl_ok=0"
call :fetch "!gh_zip!"
if "!dl_ok!"=="0" (
    echo !RED!  [ERROR]!RST! Download failed. Nothing was changed.
    if exist "!dl_zip!" del /f /q "!dl_zip!"
    goto :update_back
)
set "FSH_ZIP=!dl_zip!"
set "FSH_TMPD=!dl_dir!"
set "FSH_DST=!script_dir:~0,-1!"
echo !GRN!  [OK]!RST! Downloaded. Installing in a separate window...
echo !ESC![0m
:: A running .bat must not overwrite itself, so a helper window waits for this one to exit,
:: then copies ALL new files (program, themes, readme) over the old ones. Your theme and settings
:: live in %LOCALAPPDATA%\Foshorde, so they are untouched. bin and the output folder are kept.
start "Foshorde update" powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 3; try { Expand-Archive -LiteralPath $env:FSH_ZIP -DestinationPath $env:FSH_TMPD -Force; $f = Get-ChildItem -LiteralPath $env:FSH_TMPD -Recurse -Filter Foshorde.bat | Select-Object -First 1; if (-not $f) { throw 'Foshorde.bat not found in the downloaded archive' }; robocopy $f.DirectoryName $env:FSH_DST /E /XF theme.cfg /XD bin feshorde-shod .git /NFL /NDL /NJH /NJS /NP | Out-Null; if ($LASTEXITCODE -ge 8) { throw ('robocopy failed, code ' + $LASTEXITCODE) }; Remove-Item -LiteralPath (Join-Path $env:LOCALAPPDATA 'Foshorde\lastcheck.txt') -Force -ErrorAction SilentlyContinue; Write-Host 'Update installed. Start Foshorde again.' -ForegroundColor Green } catch { Write-Host ('Update failed: ' + $_) -ForegroundColor Red } finally { Remove-Item -LiteralPath $env:FSH_ZIP,$env:FSH_TMPD -Recurse -Force -ErrorAction SilentlyContinue }; Read-Host 'Press Enter to close'"
exit /b 0

:update_back
echo.
if "!upd!"=="1" goto :kon_exit
echo !GRY!  Press any key to go back...!RST!
pause >nul
goto :start_screen


:: =====================================================
:: Ask GitHub for version.txt.  Sets upd_res = NEW / OK / ERR and upd_ver
:: =====================================================
:check_update
set "upd_res=ERR"
set "upd_ver="
if not defined chk_to set "chk_to=6"
set "FSH_RAW=!gh_raw!"
set "FSH_VER=!VERSION!"
set "FSH_TO=!chk_to!"
for /f "usebackq tokens=1,2" %%a in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; try { [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $r=(Invoke-WebRequest -UseBasicParsing -TimeoutSec ([int]$env:FSH_TO) -Uri $env:FSH_RAW).Content.Trim([char]0xFEFF).Trim(); if ([version]$r -gt [version]$env:FSH_VER) { 'NEW ' + $r } else { 'OK ' + $r } } catch { 'ERR' }"`) do (
    set "upd_res=%%a"
    set "upd_ver=%%b"
)
exit /b 0


:: =====================================================
:: Once a day: look for a new version (result is cached in %LOCALAPPDATA%\Foshorde\lastcheck.txt)
:: =====================================================
:auto_check
set "UPD_NOTE="
if not "!check_updates!"=="1" exit /b 0
set "stamp=%cfgdir%\lastcheck.txt"
set "today=%date%"
set "c_day="
set "c_res="
set "c_ver="
if exist "!stamp!" for /f "usebackq tokens=1-3 delims=|" %%a in ("!stamp!") do (
    set "c_day=%%a"
    set "c_res=%%b"
    set "c_ver=%%c"
)
if not "!c_day!"=="!today!" (
    set "chk_to=4"
    call :check_update
    if not exist "%cfgdir%" mkdir "%cfgdir%"
    >"!stamp!" echo !today!^|!upd_res!^|!upd_ver!
    set "c_res=!upd_res!"
    set "c_ver=!upd_ver!"
)
if "!c_res!"=="NEW" if not "!c_ver!"=="!VERSION!" set "UPD_NOTE=!c_ver!"
exit /b 0


:: =====================================================
:: Download ffmpeg + ffprobe (latest build) into <script folder>\bin
:: =====================================================
:get_ffmpeg
echo !YEL!  ffmpeg / ffprobe not found.!RST!
set "ans_dl="
set /p "ans_dl=!GRY!  Download the latest build now ^(about 90 MB^)? [Y/n]: !RST!"
if /i "!ans_dl!"=="N" exit /b 0
set "dl_zip=%TEMP%\foshorde-ffmpeg.zip"
set "dl_dir=%TEMP%\foshorde-ffmpeg"
if exist "!dl_zip!" del /f /q "!dl_zip!"
if exist "!dl_dir!" rmdir /s /q "!dl_dir!"
set "dl_ok=0"
for %%u in (https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip https://github.com/BtbN/FFmpeg-Builds/releases/latest/download/ffmpeg-master-latest-win64-gpl.zip) do if "!dl_ok!"=="0" call :fetch "%%u"
if "!dl_ok!"=="0" (
    echo !RED!  [ERROR]!RST! Download failed. Check your internet connection, or put ffmpeg.exe and ffprobe.exe in the bin folder yourself.
    if exist "!dl_zip!" del /f /q "!dl_zip!"
    exit /b 0
)
echo !GRY!  Extracting ^(this can take a little while^)...!RST!
set "FSH_ZIP=!dl_zip!"
set "FSH_TMPD=!dl_dir!"
set "FSH_BIN=%script_dir%bin"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Expand-Archive -LiteralPath $env:FSH_ZIP -DestinationPath $env:FSH_TMPD -Force; New-Item -ItemType Directory -Force -Path $env:FSH_BIN | Out-Null; foreach($n in 'ffmpeg.exe','ffprobe.exe'){ $f=Get-ChildItem -LiteralPath $env:FSH_TMPD -Recurse -Filter $n | Select-Object -First 1; if(-not $f){ exit 2 }; Copy-Item -LiteralPath $f.FullName -Destination $env:FSH_BIN -Force }" >nul 2>&1
if exist "!dl_zip!" del /f /q "!dl_zip!"
if exist "!dl_dir!" rmdir /s /q "!dl_dir!"
if exist "%script_dir%bin\ffmpeg.exe"  set "FFMPEG=%script_dir%bin\ffmpeg.exe"
if exist "%script_dir%bin\ffprobe.exe" set "FFPROBE=%script_dir%bin\ffprobe.exe"
if defined FFMPEG if defined FFPROBE echo !GRN!  [OK]!RST! ffmpeg installed in the bin folder.
exit /b 0

:fetch
echo !GRY!  Downloading %~1!RST!
if "!dl_conn!"=="1" goto :fetch_single
call :prep_dl
if not exist "!DLFILE!" goto :fetch_single
powershell -NoProfile -ExecutionPolicy Bypass -File "!DLFILE!" -Url "%~1" -Out "!dl_zip!" -N !dl_conn!
if not errorlevel 1 (
    set "dl_ok=1"
    exit /b 0
)
echo !YEL!  Multi-connection download not possible here - using the normal download.!RST!
if exist "!dl_zip!" del /f /q "!dl_zip!"
:fetch_single
where curl.exe >nul 2>&1
if errorlevel 1 goto :fetch_ps
curl.exe -L --fail -o "!dl_zip!" "%~1"
if not errorlevel 1 set "dl_ok=1"
exit /b 0
:prep_dl
set "DLFILE=%TEMP%\foshorde-dl.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-Content -LiteralPath '%SELF%' | Where-Object { $_.StartsWith('::DL::') } | ForEach-Object { $_.Substring(6) }) | Set-Content -Encoding ASCII -LiteralPath '%DLFILE%'" >nul 2>&1
exit /b 0
:fetch_ps
set "FSH_URL=%~1"
set "FSH_ZIP=!dl_zip!"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile($env:FSH_URL,$env:FSH_ZIP)" >nul 2>&1
if not errorlevel 1 set "dl_ok=1"
exit /b 0


:: =====================================================
:: Add ffmpeg folder + Foshorde folder to the user PATH (once, no duplicates)
:: If ffmpeg is already on PATH nothing is added for it.
:: Only OLD COPIES of Foshorde (folders that contain Foshorde.bat but differ from this one)
:: are removed from PATH. Every other entry is left untouched.
:: The original PATH is saved once to %LOCALAPPDATA%\Foshorde\path-backup.txt
:: =====================================================
:ensure_path
if not defined FFMPEG exit /b 0
set "root=!script_dir:~0,-1!"
set "ffdir="
if not "!FFMPEG!"=="ffmpeg" for %%i in ("!FFMPEG!") do set "ffdir=%%~dpi"
if defined ffdir if "!ffdir:~-1!"=="\" set "ffdir=!ffdir:~0,-1!"
set "sig=!root!|!ffdir!"
set "marked="
if exist "%cfgdir%\path.ok" set /p marked=<"%cfgdir%\path.ok"
if /i "!marked!"=="!sig!" exit /b 0
if not exist "%cfgdir%" mkdir "%cfgdir%"
set "FSH_ROOT=!root!"
set "FSH_FFDIR=!ffdir!"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$u=[Environment]::GetEnvironmentVariable('Path','User'); if($u -eq $null){$u=''}; $bk=Join-Path $env:LOCALAPPDATA 'Foshorde\path-backup.txt'; if(-not (Test-Path -LiteralPath $bk)){ Set-Content -LiteralPath $bk -Value $u }; $p=@($u -split ';' | Where-Object { $_ -ne '' -and -not (($_.TrimEnd('\') -ine $env:FSH_ROOT) -and (Test-Path -LiteralPath ($_ + '\Foshorde.bat'))) }); foreach($d in @($env:FSH_ROOT,$env:FSH_FFDIR)){ if($d -and -not ($p | Where-Object { $_.TrimEnd('\') -ieq $d })){ $p += $d } }; [Environment]::SetEnvironmentVariable('Path',($p -join ';'),'User')" >"%TEMP%\foshorde-path.log" 2>&1
set "fsh_rc=!errorlevel!"
:: verify the registry really contains this folder now - never fail silently
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (([Environment]::GetEnvironmentVariable('Path','User') -split ';') -contains $env:FSH_ROOT) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo !RED!  [ERROR]!RST! Could not add Foshorde to your PATH ^(exit code !fsh_rc!^).
    if exist "%TEMP%\foshorde-path.log" type "%TEMP%\foshorde-path.log"
    exit /b 0
)
>"%cfgdir%\path.ok" echo !sig!
set "PATH_MSG=1"
exit /b 0


:: =====================================================
:: File size in KB without 32-bit overflow (works for files up to ~2 TB).
:: Usage: call :file_kb <variable-name-holding-the-path>   -> r_kb
:: =====================================================
:file_kb
set "r_kb=0"
set "fk_s="
for %%s in ("!%~1!") do set "fk_s=%%~zs"
if not defined fk_s set "fk_s=0"
if "!fk_s:~9,1!"=="" (
    set /a r_kb=fk_s/1024
) else (
    set "fk_t=!fk_s:~0,-3!"
    set /a r_kb=fk_t/128*125+fk_t%%128*125/128
)
exit /b 0


:: =====================================================
:: List the videos of the current folder with their durations.
:: File names are kept in f_1, f_2, ... ; the list file holds  start_seconds^|duration^|index
:: Names containing ! %% or ^ cannot be handled safely by batch and are skipped with a warning.
:: Sets total / all_sec
:: =====================================================
:build_list
set "rawlist=%TEMP%\foshorde-raw.tmp"
set "listfile=%TEMP%\foshorde-list.tmp"
if exist "%rawlist%" del /f /q "%rawlist%"
if exist "%rawlist%.1" del /f /q "%rawlist%.1"
if exist "%rawlist%.2" del /f /q "%rawlist%.2"
if exist "%rawlist%.bad" del /f /q "%rawlist%.bad"
if exist "%listfile%" del /f /q "%listfile%"
set /a total=0, all_sec=0
if "!kon!"=="1" goto :list_kon
dir /b /a-d *.mp4 *.mkv *.avi *.mov *.wmv *.flv *.webm *.m4v *.ts 2>nul >"%rawlist%"
goto :list_filter
:list_kon
dir /b /a-d *.mp4 *.mkv *.avi *.mov *.wmv *.flv *.webm *.m4v *.ts 2>nul | findstr /v /i /c:"_foshorde." >"%rawlist%"
:list_filter
if not exist "%rawlist%" exit /b 0
set "bang=^!"
findstr /l /c:"%%" /c:"^" "%rawlist%" >"%rawlist%.bad" 2>nul
findstr /l /c:"!bang!" "%rawlist%" >>"%rawlist%.bad" 2>nul
findstr /v /l /c:"%%" /c:"^" "%rawlist%" >"%rawlist%.1" 2>nul
findstr /v /l /c:"!bang!" "%rawlist%.1" >"%rawlist%.2" 2>nul
for %%b in ("%rawlist%.bad") do if %%~zb gtr 0 (
    echo !YEL!  [SKIPPED]!RST! !GRY!Names with an exclamation mark, percent sign or caret are not supported - rename:!RST!
    for /f "usebackq delims=" %%n in ("%rawlist%.bad") do echo !GRY!     %%n!RST!
)
echo !GRY!  Scanning videos...!RST!
for /f "usebackq delims=" %%f in ("%rawlist%.2") do (
    set "bd="
    set "bi=0"
    for /f "usebackq delims=" %%d in (`""!FFPROBE!" -v error -show_entries format^=duration -of default^=noprint_wrappers^=1:nokey^=1 "%%f""`) do set "bd=%%d"
    if defined bd for /f "tokens=1 delims=." %%x in ("!bd!") do set "bi=%%x"
    set "chk="
    for /f "delims=0123456789" %%y in ("!bi!") do set "chk=%%y"
    if defined chk set "bi=0"
    set /a total+=1
    set "f_!total!=%%f"
    >>"%listfile%" echo !all_sec!^|!bi!^|!total!
    set /a all_sec+=bi
)
del /f /q "%rawlist%" "%rawlist%.1" "%rawlist%.2" "%rawlist%.bad" >nul 2>&1
exit /b 0


:: =====================================================
:: "foshorde kon [MB|preset]" - compress every video in the current folder.
:: Output: <name>_foshorde.mp4 next to the original. Originals are never deleted.
:: =====================================================
:kon_start
call :show_info
:: remove leftovers of an interrupted run
del /f /q "*_foshorde.tmp.mp4" >nul 2>&1
call :build_list
if !total! equ 0 (
    echo !YEL!  No video files to compress in this folder.!RST!
    goto :kon_exit
)
set "target_mb=!default_mb!"
if defined kon_mb (
    if /i "!kon_mb!"=="discord"  set "kon_mb=10"
    if /i "!kon_mb!"=="whatsapp" set "kon_mb=16"
    if /i "!kon_mb!"=="mail"     set "kon_mb=25"
    set "chk="
    for /f "delims=0123456789" %%x in ("!kon_mb!") do set "chk=%%x"
    if defined chk (
        echo !RED!  Size must be a whole number or a preset - using !default_mb! MB.!RST!
    ) else if !kon_mb! geq 1 (
        set "target_mb=!kon_mb!"
    )
)
set "ask_each=0"
set "quit=0"
set "results=%TEMP%\foshorde-results.tmp"
if exist "!results!" del /f /q "!results!"
echo !GRY!  Compressing !total! file^(s^) at !target_mb! MB - originals are kept. Ctrl+C to stop.!RST!
goto :run_counters

:path_done
if not defined PATH_MSG echo !RED!  [ERROR]!RST! Could not update PATH.
if not defined PATH_MSG goto :kon_exit
echo !GRN!  [OK]!RST! PATH now points to: !WHT!!root!!RST!
echo !GRY!  Open a NEW terminal - foshorde will then run this version.!RST!
set "PATH_MSG="
goto :kon_exit

:kon_exit
echo !ESC![0m
endlocal
exit /b 0

:kon_exists
call :file_kb in
set /a old_mb=r_kb/1024
echo !YEL!  [SKIPPED]!RST! !final! already exists.
set /a skipped+=1
set /a sum_old+=old_mb, sum_new+=old_mb
>>"!results!" echo !idx!^|!in!^|!old_mb!^|!old_mb!^|0^|SKIP
echo.
exit /b 0


:: =====================================================
:: Theme helpers. The chosen theme is stored in %LOCALAPPDATA%\Foshorde\theme.cfg,
:: so updating the program (which replaces themes\) never changes your choice.
:: =====================================================
:load_theme
set "theme=acid"
:: one-time migration from the old location (themes\theme.cfg)
if not exist "%cfgdir%\theme.cfg" if exist "%script_dir%themes\theme.cfg" (
    if not exist "%cfgdir%" mkdir "%cfgdir%"
    copy /y "%script_dir%themes\theme.cfg" "%cfgdir%\theme.cfg" >nul
)
if exist "%cfgdir%\theme.cfg" set /p theme=<"%cfgdir%\theme.cfg"
call "%script_dir%themes\themes.bat" !theme!
echo !RST!
exit /b 0

:open_themes
if not exist "%script_dir%themes\theme-selector.bat" (
    echo !RED!  [ERROR]!RST! themes\theme-selector.bat not found.
    pause
    exit /b 0
)
call "%script_dir%themes\theme-selector.bat"
mode con cols=90 lines=40
title Foshorde v!VERSION!
call :load_theme
cls
call "%script_dir%themes\themes.bat" logo
exit /b 0


:: =====================================================
:: Start screen (logo + info + video count)
:: =====================================================
:draw_start
cls
call "%script_dir%themes\themes.bat" logo
call :show_info
set /a total=0
for %%f in (*.mp4 *.mkv *.avi *.mov *.wmv *.flv *.webm *.m4v *.ts) do set /a total+=1
if !total! gtr 0 (
    echo !WHT!  !total! video file^(s^) in this folder!RST!
    echo.
)
exit /b 0


:: =====================================================
:: Detect the graphics card, then test only that vendor's encoder
:: =====================================================
:detect_encoder
set "ENC="
set "ENC_LABEL="
set "GPU_NAMES="
set "NO_GPU_WARN=0"
set "has_nv=0"
set "has_amd=0"
set "has_intel=0"
set "gpu_found=0"

echo !GRY!  Detecting graphics card...!RST!
for /f "usebackq delims=" %%g in (`powershell -NoProfile -Command "(Get-CimInstance Win32_VideoController).Name" 2^>nul`) do (
    set "gname=%%g"
    if defined GPU_NAMES (set "GPU_NAMES=!GPU_NAMES! + !gname!") else set "GPU_NAMES=!gname!"
    set "gpu_found=1"
    if not "!gname:NVIDIA=!"=="!gname!" set "has_nv=1"
    if not "!gname:AMD=!"=="!gname!"    set "has_amd=1"
    if not "!gname:Radeon=!"=="!gname!" set "has_amd=1"
    if not "!gname:Intel=!"=="!gname!"  set "has_intel=1"
)
if not defined GPU_NAMES set "GPU_NAMES=unknown"

:: Encoders to test, in this order: NVIDIA, AMD, Intel (only for cards that exist)
set "enc_list="
if "!has_nv!"=="1"    set "enc_list=!enc_list! nvenc"
if "!has_amd!"=="1"   set "enc_list=!enc_list! amf"
if "!has_intel!"=="1" set "enc_list=!enc_list! qsv"
:: If Windows could not tell us the card, try all of them
if "!gpu_found!"=="0" set "enc_list=nvenc amf qsv"

:: Manual override (Options menu / settings.cfg)
if /i "!force_encoder!"=="nvenc" set "enc_list=nvenc"
if /i "!force_encoder!"=="amf"   set "enc_list=amf"
if /i "!force_encoder!"=="qsv"   set "enc_list=qsv"
if /i "!force_encoder!"=="cpu"   set "enc_list="

if defined enc_list (
    for %%e in (!enc_list!) do if not defined ENC call :try_enc %%e
)

if not defined ENC (
    set "ENC=cpu"
    set "ENC_LABEL=CPU libx265"
    if /i not "!force_encoder!"=="cpu" set "NO_GPU_WARN=1"
)
exit /b 0

:try_enc
set "t_pix=yuv420p"
if /i "%1"=="nvenc" set "t_enc=-c:v hevc_nvenc -preset p5 -tune hq -rc vbr -b:v 1000k"
if /i "%1"=="amf"   set "t_enc=-c:v hevc_amf -usage transcoding -quality quality -rc vbr_peak -b:v 1000k"
if /i "%1"=="qsv" (
    set "t_enc=-c:v hevc_qsv -preset slower -b:v 1000k"
    set "t_pix=nv12"
)
"!FFMPEG!" -hide_banner -loglevel error -f lavfi -i nullsrc=s=640x360:d=0.3 -pix_fmt !t_pix! !t_enc! -f null - >nul 2>&1
if not "!errorlevel!"=="0" (
    exit /b 0
)
set "ENC=%1"
if /i "%1"=="nvenc" set "ENC_LABEL=NVIDIA NVENC"
if /i "%1"=="amf"   set "ENC_LABEL=AMD AMF"
if /i "%1"=="qsv"   set "ENC_LABEL=Intel Quick Sync"
exit /b 0


:: =====================================================
:print_row
set "pr_n=!r_name!                                    "
set "pr_n=!pr_n:~0,36!"
set "pr_i=  !r_idx!"
set "pr_i=!pr_i:~-3!"
set "pr_o=      !r_old! MB"
set "pr_o=!pr_o:~-8!"
set "pr_w=      !r_new! MB"
set "pr_w=!pr_w:~-8!"
set "pr_p=     !r_pct!%%"
set "pr_p=!pr_p:~-6!"

if "!r_status!"=="OK" (
    echo  !pr_i!  !WHT!!pr_n!!RST! !pr_o! !GRN!!pr_w!!RST! !GRN!!pr_p!!RST!   !GRN!OK!RST!
) else if "!r_status!"=="SKIP" (
    echo  !pr_i!  !WHT!!pr_n!!RST! !pr_o! !GRY!    --!RST! !GRY!    --!RST!   !YEL!SKIPPED!RST!
) else (
    echo  !pr_i!  !WHT!!pr_n!!RST! !pr_o! !GRY!    --!RST! !GRY!    --!RST!   !RED!FAILED!RST!
)
exit /b 0


:: =====================================================
:show_file_header
echo.
echo !GRY!  [!idx!/!total!]!RST! !WHT!!in!!RST!
exit /b 0


:: =====================================================
:: Process one file.  %1 = index into f_1, f_2, ...
:: =====================================================
:process
set "in=!f_%~1!"
set "base="
for %%q in ("!in!") do set "base=%%~nq"
set "otmp=%output_dir%\!base!.tmp.mp4"
set "final=!base!.mp4"
if "!kon!"=="1" set "otmp=!base!_foshorde.tmp.mp4"
if "!kon!"=="1" set "final=!base!_foshorde.mp4"
set "is_hdr=0"
set "is10=0"
set "use_cpu=0"
set "pix_fmt="
set "transfer="
set "duration="
set "dur="
set "old_mb=0"
set "retried=0"
set "has_sub="
set "t_sub="
set "t_aud="
set "t_cpu="

call :show_file_header
if "!kon!"=="1" if exist "!final!" goto :kon_exists

:: ---- Probe pixel format and transfer function ----
for /f "usebackq tokens=1,2 delims==" %%a in (`""!FFPROBE!" -v error -select_streams v:0 -show_entries stream^=pix_fmt^,color_transfer -of default^=noprint_wrappers^=1 "!in!""`) do (
    if "%%a"=="pix_fmt" set "pix_fmt=%%b"
    if "%%a"=="color_transfer" set "transfer=%%b"
)

if /i "!transfer!"=="smpte2084" set "is_hdr=1"
if /i "!transfer!"=="arib-std-b67" set "is_hdr=1"
if not "!pix_fmt!"=="" if not "!pix_fmt:10=!"=="!pix_fmt!" set "is10=1"

:: HDR and 10-bit sources are encoded on CPU (10-bit output); everything else on the GPU
if "!ENC!"=="cpu" set "use_cpu=1"
if "!is_hdr!"=="1" set "use_cpu=1"
if "!is10!"=="1" set "use_cpu=1"
set "cpu_pix=yuv420p"
if "!is_hdr!"=="1" set "cpu_pix=yuv420p10le"
if "!is10!"=="1" set "cpu_pix=yuv420p10le"

:: ---- Probe duration ----
for /f "usebackq delims=" %%d in (`""!FFPROBE!" -v error -show_entries format^=duration -of default^=noprint_wrappers^=1:nokey^=1 "!in!""`) do set "duration=%%d"
if not defined duration goto :failed
for /f "tokens=1 delims=." %%x in ("!duration!") do set "dur=%%x"
if not defined dur goto :failed
set /a dur+=1

:: ---- Probe the total audio bitrate of ALL audio tracks (bits/s); 128k for tracks that do not say ----
set /a abr=0
for /f "usebackq delims=" %%b in (`""!FFPROBE!" -v error -select_streams a -show_entries stream^=bit_rate -of default^=noprint_wrappers^=1:nokey^=1 "!in!""`) do (
    set "ab=%%b"
    if "!ab!"=="N/A" set "ab=128000"
    set /a abr+=ab
)
set /a abr_k=abr/1000

:: ---- Does the file have subtitle streams? ----
for /f "usebackq delims=" %%s in (`""!FFPROBE!" -v error -select_streams s -show_entries stream^=index -of default^=noprint_wrappers^=1:nokey^=1 "!in!""`) do set "has_sub=1"

:: ---- Stream options (the retry ladder in :enc_fail changes these if an encode fails) ----
set "maps_opt=-map 0:v:0 -map 0:a?"
set "sub_opt="
set "aud_opt=-c:a copy"
if defined has_sub (
    set "maps_opt=!maps_opt! -map 0:s?"
    set "sub_opt=-c:s mov_text"
)

call :file_kb in
set "old_kb=!r_kb!"
set /a old_mb=old_kb/1024

:calc
set /a total_kbps=target_mb*8*1024/dur
set /a vkbps=total_kbps-abr_k
set /a vkbps=vkbps*97/100
if !vkbps! lss !min_kbps! set "vkbps=!min_kbps!"
set /a maxk=vkbps*3/2
set /a bufk=maxk*2
set /a est_mb=(vkbps+abr_k)/8*dur/1024

set "enc_tag=CPU libx265"
if "!is10!"=="1" set "enc_tag=CPU libx265 10-bit"
if "!is_hdr!"=="1" set "enc_tag=CPU libx265 10-bit HDR"

echo    !GRY!!old_mb! MB -^>!RST! !GRN!~!est_mb! MB!RST!  !GRY!^(target !target_mb! MB^)  !vkbps! kbps - !dur!s!RST!
:: the GPU is the normal case and already shown at the top - only mention the CPU path
if "!use_cpu!"=="1" if not "!ENC!"=="cpu" echo    !YEL!!enc_tag!!RST!
if !est_mb! geq !old_mb! echo    !YEL![NOTE] Estimated size is not smaller than the original.!RST!

if "!ask_each!"=="0" goto :encode

echo !GRY!  Enter compress   N skip   A all   Q quit   or type a new size in MB!RST!
:prompt
set "ans="
set /p "ans=!YEL!  > !RST!"
if not defined ans goto :encode
if /i "!ans!"=="Y" goto :encode
if /i "!ans!"=="N" goto :user_skip
if /i "!ans!"=="A" (
    set "ask_each=0"
    goto :encode
)
if /i "!ans!"=="Q" (
    set "quit=1"
    set /a idx-=1
    echo.
    exit /b 0
)
set "chk="
for /f "delims=0123456789" %%x in ("!ans!") do set "chk=%%x"
if not defined chk if !ans! geq 1 (
    set "target_mb=!ans!"
    goto :calc
)
goto :prompt

:encode
echo.
if not defined PROGCMD call :prep_progress
set "FSH_DUR=!duration!"
set "FSH_BAR=!GRN!"
set "FSH_DIM=!GRY!"
set "FSH_RST=!RST!"
set "FSH_ALL=!all_sec!"
set "FSH_IDX=!idx!"
set "FSH_TOT=!total!"
set "FSH_MULTI=0"
if !total! gtr 1 set "FSH_MULTI=1"
if "!use_cpu!"=="1" goto :encode_cpu
if "!ENC!"=="nvenc" goto :encode_nvenc
if "!ENC!"=="qsv" goto :encode_qsv
goto :encode_amf

:: ---------- NVIDIA ----------
:encode_nvenc
"%FFMPEG%" -hide_banner -loglevel fatal -nostats -progress pipe:1 -y -i "%in%" ^
    %maps_opt% ^
    -c:v hevc_nvenc -preset p5 -tune hq ^
    -rc vbr -b:v %vkbps%k -maxrate %maxk%k -bufsize %bufk%k ^
    -pix_fmt yuv420p -tag:v hvc1 ^
    %aud_opt% %sub_opt% ^
    "%otmp%" | %PROGCMD%
if not "!errorlevel!"=="0" goto :enc_fail
goto :check

:: ---------- AMD ----------
:encode_amf
"%FFMPEG%" -hide_banner -loglevel fatal -nostats -progress pipe:1 -y -i "%in%" ^
    %maps_opt% ^
    -c:v hevc_amf -usage transcoding -quality quality ^
    -rc vbr_peak -b:v %vkbps%k -maxrate %maxk%k ^
    -pix_fmt yuv420p -tag:v hvc1 ^
    %aud_opt% %sub_opt% ^
    "%otmp%" | %PROGCMD%
if not "!errorlevel!"=="0" goto :enc_fail
goto :check

:: ---------- Intel ----------
:encode_qsv
"%FFMPEG%" -hide_banner -loglevel fatal -nostats -progress pipe:1 -y -i "%in%" ^
    %maps_opt% ^
    -c:v hevc_qsv -preset slower ^
    -b:v %vkbps%k -maxrate %maxk%k ^
    -pix_fmt nv12 -tag:v hvc1 ^
    %aud_opt% %sub_opt% ^
    "%otmp%" | %PROGCMD%
if not "!errorlevel!"=="0" goto :enc_fail
goto :check

:: ---------- CPU ----------
:encode_cpu
if "!is_hdr!"=="1" goto :encode_cpu_hdr
"%FFMPEG%" -hide_banner -loglevel fatal -nostats -progress pipe:1 -y -i "%in%" ^
    %maps_opt% ^
    -c:v libx265 -b:v %vkbps%k -preset %cpu_preset% ^
    -pix_fmt %cpu_pix% -tag:v hvc1 ^
    %aud_opt% %sub_opt% ^
    "%otmp%" | %PROGCMD%
if not "!errorlevel!"=="0" goto :enc_fail
goto :check

:encode_cpu_hdr
"%FFMPEG%" -hide_banner -loglevel fatal -nostats -progress pipe:1 -y -i "%in%" ^
    %maps_opt% ^
    -c:v libx265 -b:v %vkbps%k -preset %cpu_preset% ^
    -pix_fmt yuv420p10le -tag:v hvc1 ^
    -x265-params "hdr10-opt=1:repeat-headers=1:colorprim=bt2020:transfer=%transfer%:colormatrix=bt2020nc" ^
    %aud_opt% %sub_opt% ^
    "%otmp%" | %PROGCMD%
if not "!errorlevel!"=="0" goto :enc_fail
goto :check

:: ---------- Retry ladder: each step is tried once ----------
:: 1) drop subtitles (bitmap subs such as PGS cannot go into mp4)
:: 2) convert audio to AAC (TrueHD, DTS-HD and some others cannot be copied into mp4)
:: 3) fall back from the GPU encoder to the CPU
:enc_fail
echo.
if exist "!otmp!" del /f /q "!otmp!"
if defined has_sub if not defined t_sub (
    set "t_sub=1"
    set "maps_opt=-map 0:v:0 -map 0:a?"
    set "sub_opt="
    echo !YEL!  Encode failed - retrying without subtitles...!RST!
    goto :encode
)
if not defined t_aud (
    set "t_aud=1"
    set "aud_opt=-c:a aac -b:a 160k"
    echo !YEL!  Encode failed - retrying with audio converted to AAC...!RST!
    goto :encode
)
if "!use_cpu!"=="0" if not defined t_cpu (
    set "t_cpu=1"
    set "use_cpu=1"
    set "cpu_pix=yuv420p"
    echo !YEL!  Encode failed - retrying on CPU...!RST!
    goto :encode
)
goto :failed

:check
echo.
:: ---- Verify the output is real before touching the original ----
call :file_kb otmp
set "new_kb=!r_kb!"
if !new_kb! lss 100 (
    echo !RED!  Output file is empty or too small - original kept.!RST!
    goto :failed
)
set "new_dur="
set "new_dur_i="
for /f "usebackq delims=" %%d in (`""!FFPROBE!" -v error -show_entries format^=duration -of default^=noprint_wrappers^=1:nokey^=1 "!otmp!""`) do set "new_dur=%%d"
if not defined new_dur (
    echo !RED!  Output cannot be read - original kept.!RST!
    goto :failed
)
for /f "tokens=1 delims=." %%x in ("!new_dur!") do set "new_dur_i=%%x"
if not defined new_dur_i (
    echo !RED!  Output cannot be read - original kept.!RST!
    goto :failed
)
set /a dd=dur-new_dur_i
if !dd! lss 0 set /a dd=-dd
if !dd! gtr 5 (
    echo !RED!  Output duration does not match - original kept.!RST!
    goto :failed
)

:: ---- Size accuracy: if the result misses the target, re-encode once with a corrected bitrate ----
if !retried! geq 1 goto :size_ok
if !old_mb! leq !target_mb! goto :size_ok
set /a tgt_kb=target_mb*1024
set /a lo_kb=tgt_kb*95/100, hi_kb=tgt_kb*103/100
if !new_kb! geq !lo_kb! if !new_kb! leq !hi_kb! goto :size_ok
set /a aud_kb=abr_k*dur/8*125/128
set /a vid_new=new_kb-aud_kb, vid_tgt=tgt_kb-aud_kb
if !vid_new! lss 1 set /a vid_new=new_kb, vid_tgt=tgt_kb
if !vid_tgt! lss 1 set /a vid_tgt=tgt_kb/2
set /a ratio=vid_tgt*100/vid_new
set /a vkbps=vkbps*ratio/100*99/100
if !vkbps! lss !min_kbps! set "vkbps=!min_kbps!"
set /a maxk=vkbps*3/2
set /a bufk=maxk*2
set /a retried+=1
echo !YEL!  Result was !new_kb! KB, target !tgt_kb! KB - re-encoding at !vkbps! kbps...!RST!
if exist "!otmp!" del /f /q "!otmp!"
goto :encode

:size_ok
if !new_kb! lss !old_kb! goto :success
echo !YEL!  [SKIPPED]!RST! Output not smaller, keeping original.
if exist "!otmp!" del /f /q "!otmp!"
set /a skipped+=1
set /a sum_old+=old_mb, sum_new+=old_mb
>>"!results!" echo !idx!^|!in!^|!old_mb!^|!old_mb!^|0^|SKIP
echo.
exit /b 0

:success
set "dest=%output_dir%\!final!"
if "!kon!"=="1" set "dest=!final!"
:: a.mkv and a.mp4 both become a.mp4 - never overwrite an earlier result
if "!kon!"=="0" if exist "!dest!" call :unique_dest
move /y "!otmp!" "!dest!" >nul 2>&1
:: only after the move really worked is the original touched
if exist "!otmp!" (
    echo !RED!  Could not move the output into place - original kept.!RST!
    goto :failed
)
if not exist "!dest!" (
    echo !RED!  Output is missing after the move - original kept.!RST!
    goto :failed
)
if "!kon!"=="0" if not "!keep_originals!"=="1" del /f /q "!in!"
set /a new_mb=new_kb/1024
set /a d10=new_kb*10/1024
set /a d_i=d10/10, d_f=d10%%10
set /a saved_mb+=old_mb-new_mb
set /a sum_old+=old_mb, sum_new+=new_mb
set /a pct=0
if !old_mb! gtr 0 set /a pct=(old_mb-new_mb)*100/old_mb
echo !GRN!  [OK]!RST! !dest!  !GRY!^(!RST!!old_mb! MB !GRY!-^>!RST! !GRN!!d_i!.!d_f! MB!RST!!GRY!^)!RST!
set /a ok+=1
>>"!results!" echo !idx!^|!in!^|!old_mb!^|!new_mb!^|!pct!^|OK
echo.
exit /b 0

:unique_dest
set /a un=1
:ud_loop
set "dest=%output_dir%\!base!_!un!.mp4"
if exist "!dest!" (
    set /a un+=1
    goto :ud_loop
)
exit /b 0

:user_skip
echo !YEL![SKIPPED by user]!RST! !in!
set /a skipped+=1
set /a sum_old+=old_mb, sum_new+=old_mb
>>"!results!" echo !idx!^|!in!^|!old_mb!^|!old_mb!^|0^|SKIP
echo.
exit /b 0

:failed
echo !RED!  [FAILED]!RST! !in!
if exist "!otmp!" del /f /q "!otmp!"
set /a fail+=1
>>"!results!" echo !idx!^|!in!^|0^|0^|0^|FAIL
echo.
exit /b 0

:: ---- Build the progress-bar script once (first encode of the session) ----
:prep_progress
set "PSFILE=%TEMP%\foshorde-progress.ps1"
:: Progress-bar script lives at the end of this file (lines starting with ::PS::)
powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-Content -LiteralPath '%SELF%' | Where-Object { $_.StartsWith('::PS::') } | ForEach-Object { $_.Substring(6) }) | Set-Content -Encoding ASCII -LiteralPath '%PSFILE%'" >nul 2>&1
set PROGCMD=findstr /b /c:"progress=end" ^>nul
if exist "%PSFILE%" set PROGCMD=powershell -NoProfile -ExecutionPolicy Bypass -File "%PSFILE%"
exit /b 0

:: ===== Embedded progress-bar script (extracted to TEMP at first encode) =====
::PS::$ErrorActionPreference = 'SilentlyContinue'
::PS::$inv = [Globalization.CultureInfo]::InvariantCulture
::PS::$fl = [Globalization.NumberStyles]::Float
::PS::function Num([string]$s) { $v = 0.0; if (-not [double]::TryParse($s, $fl, $inv, [ref]$v)) { $v = 0.0 }; return $v }
::PS::$total = Num $env:FSH_DUR
::PS::$done = Num $env:FSH_DONE
::PS::$all = Num $env:FSH_ALL
::PS::$idx = $env:FSH_IDX
::PS::$tot = $env:FSH_TOT
::PS::$multi = ($env:FSH_MULTI -eq '1') -and ($all -gt 0)
::PS::$cBar = $env:FSH_BAR
::PS::$cDim = $env:FSH_DIM
::PS::$cRst = $env:FSH_RST
::PS::$esc = [string][char]27
::PS::$w = 36
::PS::if ($multi) { $w = 30 }
::PS::$sw = [Diagnostics.Stopwatch]::StartNew()
::PS::$speed = ''
::PS::function Bar([double]$p) {
::PS::    $n = [int][math]::Floor($p / 100 * $w)
::PS::    if ($n -ge $w) { return ('=' * $w) }
::PS::    return (('=' * $n) + '>' + (' ' * ($w - $n - 1)))
::PS::}
::PS::function Fmt([double]$s) {
::PS::    if ($s -lt 0) { $s = 0 }
::PS::    return ([string][int][math]::Floor($s / 60)) + ':' + ([int][math]::Floor($s % 60)).ToString('00')
::PS::}
::PS::function Draw([double]$p, [double]$cur) {
::PS::    $eta = ''
::PS::    if ($p -ge 2 -and $p -lt 100) { $eta = '  ETA ' + (Fmt ($sw.Elapsed.TotalSeconds * (100 - $p) / $p)) }
::PS::    $sp = ''
::PS::    if ($speed -ne '') { $sp = '  ' + $speed }
::PS::    $pc = $p.ToString('0.0', $inv).PadLeft(5) + '%'
::PS::    $lab = ''
::PS::    if ($multi) { $lab = 'File  ' }
::PS::    $l1 = $cDim + '  ' + $lab + '[' + $cBar + (Bar $p) + $cDim + '] ' + $esc + '[1m' + $cBar + $pc + $cRst + $cDim + $sp + $eta + $cRst + $esc + '[K'
::PS::    if (-not $multi) { [Console]::Write("`r" + $l1); return }
::PS::    $op = [math]::Min(100, ($done + $cur) / $all * 100)
::PS::    if ([int]$idx -lt [int]$tot) { $op = [math]::Min(99.9, $op) }
::PS::    $oeta = ''
::PS::    $el = $sw.Elapsed.TotalSeconds
::PS::    if ($cur -gt 2 -and $el -gt 1 -and $op -lt 100) { $oeta = '  ETA ' + (Fmt (($all - $done - $cur) / ($cur / $el))) }
::PS::    $opc = $op.ToString('0.0', $inv).PadLeft(5) + '%'
::PS::    $l2 = $cDim + '  All   [' + $cBar + (Bar $op) + $cDim + '] ' + $esc + '[1m' + $cBar + $opc + $cRst + $cDim + '  file ' + $idx + '/' + $tot + $oeta + $cRst + $esc + '[K'
::PS::    [Console]::Write($esc + '[1A' + "`r" + $l1 + "`n`r" + $l2)
::PS::}
::PS::$pct = 0.0
::PS::$cur = 0.0
::PS::$ok = $false
::PS::if ($multi) { [Console]::Write("`n") }
::PS::Draw 0 0
::PS::while ($true) {
::PS::    $l = [Console]::In.ReadLine()
::PS::    if ($l -eq $null) { break }
::PS::    if ($l.StartsWith('out_time_us=') -or $l.StartsWith('out_time_ms=')) {
::PS::        $t = 0.0
::PS::        if ([double]::TryParse($l.Substring(12), $fl, $inv, [ref]$t) -and $total -gt 0) {
::PS::            $cur = [math]::Min($total, [math]::Max(0, $t / 1000000))
::PS::            $pct = [math]::Min(99.9, $cur / $total * 100)
::PS::        }
::PS::    } elseif ($l.StartsWith('speed=')) {
::PS::        $speed = $l.Substring(6).Trim()
::PS::        if ($speed -eq 'N/A') { $speed = '' }
::PS::    } elseif ($l -eq 'progress=continue') {
::PS::        Draw $pct $cur
::PS::    } elseif ($l -eq 'progress=end') {
::PS::        $ok = $true
::PS::        Draw 100 $total
::PS::    }
::PS::}
::PS::[Console]::WriteLine()
::PS::if ($ok) { exit 0 } else { exit 1 }
:: ===== Embedded multi-connection downloader (extracted to TEMP when a download starts) =====
::DL::param([string]$Url,[string]$Out,[int]$N=8)
::DL::$ErrorActionPreference = 'Stop'
::DL::[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
::DL::[Net.ServicePointManager]::DefaultConnectionLimit = 64
::DL::$final = $Url
::DL::$total = 0
::DL::try {
::DL::    $req = [Net.HttpWebRequest]::Create($Url)
::DL::    $req.AddRange(0, 0)
::DL::    $req.AllowAutoRedirect = $true
::DL::    $req.Timeout = 20000
::DL::    $resp = $req.GetResponse()
::DL::    $final = $resp.ResponseUri.AbsoluteUri
::DL::    $cr = $resp.Headers['Content-Range']
::DL::    $code = [int]$resp.StatusCode
::DL::    $resp.Close()
::DL::    if ($code -ne 206 -or -not $cr) { exit 3 }
::DL::    $total = [int64]($cr.Split('/')[1])
::DL::} catch { exit 3 }
::DL::if ($total -lt 4MB) { exit 3 }
::DL::if ($N -lt 2) { $N = 2 }
::DL::if ($N -gt 16) { $N = 16 }
::DL::$size = [int64][math]::Ceiling($total / $N)
::DL::$sb = {
::DL::    param($u, $s, $e, $f)
::DL::    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
::DL::    $r = [Net.HttpWebRequest]::Create($u)
::DL::    $r.AddRange([int64]$s, [int64]$e)
::DL::    $r.AllowAutoRedirect = $true
::DL::    $r.Timeout = 30000
::DL::    $r.ReadWriteTimeout = 30000
::DL::    $resp = $r.GetResponse()
::DL::    $st = $resp.GetResponseStream()
::DL::    $fs = [IO.File]::Create($f)
::DL::    $buf = New-Object byte[] 262144
::DL::    while (($n = $st.Read($buf, 0, $buf.Length)) -gt 0) { $fs.Write($buf, 0, $n) }
::DL::    $fs.Close(); $st.Close(); $resp.Close()
::DL::}
::DL::$jobs = @(); $parts = @(); $exp = @()
::DL::for ($i = 0; $i -lt $N; $i++) {
::DL::    $s = [int64]$i * $size
::DL::    $e = [math]::Min($total - 1, $s + $size - 1)
::DL::    if ($s -gt $e) { break }
::DL::    $f = "$Out.part$i"
::DL::    if (Test-Path -LiteralPath $f) { Remove-Item -LiteralPath $f -Force }
::DL::    $parts += $f
::DL::    $exp += ($e - $s + 1)
::DL::    $jobs += Start-Job -ScriptBlock $sb -ArgumentList $final, $s, $e, $f
::DL::}
::DL::$sw = [Diagnostics.Stopwatch]::StartNew()
::DL::while ($true) {
::DL::    $done = 0
::DL::    foreach ($f in $parts) { if (Test-Path -LiteralPath $f) { $done += (Get-Item -LiteralPath $f).Length } }
::DL::    $pct = [math]::Min(100, $done * 100 / $total)
::DL::    $sec = [math]::Max(0.1, $sw.Elapsed.TotalSeconds)
::DL::    [Console]::Write(("`r  [{0} connections] {1,5:N1}%  {2:N0}/{3:N0} MB  {4:N1} MB/s   " -f $parts.Count, $pct, ($done / 1MB), ($total / 1MB), ($done / 1MB / $sec)))
::DL::    if (-not ($jobs | Where-Object { $_.State -eq 'Running' })) { break }
::DL::    Start-Sleep -Milliseconds 400
::DL::}
::DL::[Console]::WriteLine()
::DL::$bad = $false
::DL::for ($i = 0; $i -lt $parts.Count; $i++) {
::DL::    $f = $parts[$i]
::DL::    if (-not (Test-Path -LiteralPath $f)) { $bad = $true }
::DL::    elseif ((Get-Item -LiteralPath $f).Length -ne $exp[$i]) { $bad = $true }
::DL::}
::DL::$jobs | Remove-Job -Force -ErrorAction SilentlyContinue
::DL::if ($bad) {
::DL::    foreach ($f in $parts) { if (Test-Path -LiteralPath $f) { Remove-Item -LiteralPath $f -Force } }
::DL::    exit 4
::DL::}
::DL::$fo = [IO.File]::Create($Out)
::DL::foreach ($f in $parts) {
::DL::    $fi = [IO.File]::OpenRead($f)
::DL::    $fi.CopyTo($fo)
::DL::    $fi.Close()
::DL::    Remove-Item -LiteralPath $f -Force
::DL::}
::DL::$fo.Close()
::DL::exit 0
