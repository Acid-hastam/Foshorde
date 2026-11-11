@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Foshorde - Video Compressor

:: "foshorde kon [MB]" = quiet mode for any folder (no screen clearing, originals kept)
set "kon=0"
if /i "%~1"=="kon" set "kon=1"
set "kon_mb=%~2"
:: "foshorde update" = re-register THIS script's folder on PATH, then exit
set "upd=0"
if /i "%~1"=="update" set "upd=1"
if "!upd!"=="1" set "kon=1"
if "!kon!"=="0" mode con cols=90 lines=40

set "script_dir=%~dp0"
:: "Run as administrator" starts in System32 - move back to the script folder
if /i "%cd%"=="%windir%\System32" cd /d "%script_dir%"

:: ================= Settings =================
set "output_dir=feshorde-shod"
set "default_mb=35"
set "cpu_preset=medium"
set "min_kbps=100"
:: Encoder: auto / nvenc / amf / qsv / cpu
:: auto = detect the graphics card and use its encoder (NVIDIA, AMD, Intel), else CPU
set "force_encoder=auto"
:: ============================================

set "SELF=%~f0"
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
if "!upd!"=="1" if exist "%LOCALAPPDATA%\Foshorde\path.ok" del /f /q "%LOCALAPPDATA%\Foshorde\path.ok"
call :ensure_path
if "!upd!"=="1" goto :update_done

:: ---- Detect graphics card and encoder once ----
call :detect_encoder
if "!kon!"=="1" goto :kon_start

:start_screen
call :draw_start
if !total! equ 0 goto :no_videos

:: ---- Ask for target size ----
:ask_target
set "target_mb="
set "ask_each=0"
echo !GRN!  Enter!RST! = compress all !total! file^(s^) to !BLD!!WHT!!default_mb! MB!RST!
echo !GRY!  or type a size in MB   !MAG!R!GRY!=review each file   !BLU!T!GRY!=theme   !RED!Q!GRY!=quit!RST!
echo.
set /p "target_mb=!YEL!  > !RST!"
if /i "!target_mb!"=="T" (
    call :open_themes
    goto :start_screen
)
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

:: results file (one line per processed file)
set "results=%output_dir%\results.tmp"
if exist "!results!" del /f /q "!results!"

set "quit=0"
if "!ask_each!"=="0" (
    echo.
    echo !GRY!  Compressing all files at !target_mb! MB - press Ctrl+C to stop.!RST!
)
call :build_list

:run_counters
set /a ok=0, fail=0, skipped=0, idx=0, saved_mb=0, sum_old=0, sum_new=0

for /f "usebackq tokens=1,2* delims=|" %%a in ("!listfile!") do (
    if "!quit!"=="0" (
        set /a idx+=1
        set "FSH_DONE=%%a"
        call :process "%%c"
    )
)
if exist "!listfile!" del /f /q "!listfile!" >nul 2>&1

:: =====================================================
:: Final report
:: =====================================================
if "!kon!"=="0" cls
echo.
echo !CYN!  ======================================================================!RST!
echo !CYN!  ^|!RST!!BLD!!WHT!                      F O S H O R D E   -   R E P O R T                 !RST!!CYN!^|!RST!
echo !CYN!  ======================================================================!RST!
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

echo !BLD!!WHT!   SUMMARY!RST!
echo !CYN!  ----------------------------------------------------------------------!RST!
echo    !GRN!Success       :!RST! !ok!
echo    !YEL!Skipped       :!RST! !skipped!
echo    !RED!Failed        :!RST! !fail!
echo.
echo    !GRY!Total before  :!RST! !sum_old! MB
echo    !GRY!Total after   :!RST! !sum_new! MB
echo    !CYN!Space saved   :!RST! !BLD!!GRN!!saved_mb! MB!RST!  !GRY!^(!pct_total!%%^)!RST!
echo !CYN!  ----------------------------------------------------------------------!RST!
echo.
if !fail! gtr 0 (
    echo !RED!   Some files failed. Originals were kept untouched.!RST!
) else if !ok! gtr 0 (
    if "!kon!"=="1" (
        echo !GRN!   All done. Saved next to the originals as *_foshorde.mp4 - originals kept.!RST!
    ) else (
        echo !GRN!   All done. Compressed files are in %output_dir%.!RST!
    )
) else (
    echo !YEL!   Nothing was compressed.!RST!
)
echo.
if "!kon!"=="1" goto :kon_exit
set "k="
set /p "k=!GRY!  Press O to open the output folder, or Enter to exit: !RST!"
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
set /p "k=!GRY!  Press T to change theme, or Enter to exit: !RST!"
if /i not "!k!"=="T" exit /b 0
call :open_themes
goto :start_screen


:: =====================================================
:: Card / encoder info lines (shared by the normal and kon screens)
:: =====================================================
:show_info
echo !GRY!  Card    :!RST! !GPU_NAMES!
if "!ENC!"=="cpu" (
    echo !GRY!  Encoder :!RST! !YEL!!ENC_LABEL!!RST!
) else (
    echo !GRY!  Encoder :!RST! !GRN!!ENC_LABEL!!RST!
)
if "!NO_GPU_WARN!"=="1" echo !GRY!            No usable GPU encoder - using CPU ^(slower^). Update the graphics driver.!RST!
if defined PATH_MSG echo !GRN!  [OK]!RST! !GRY!Added to your PATH. Open a NEW terminal and type:!RST! !WHT!foshorde kon!RST!
set "PATH_MSG="
echo.
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
where curl.exe >nul 2>&1
if errorlevel 1 goto :fetch_ps
curl.exe -L --fail -o "!dl_zip!" "%~1"
if not errorlevel 1 set "dl_ok=1"
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
:: =====================================================
:ensure_path
if not defined FFMPEG exit /b 0
set "root=!script_dir:~0,-1!"
set "ffdir="
if not "!FFMPEG!"=="ffmpeg" for %%i in ("!FFMPEG!") do set "ffdir=%%~dpi"
if defined ffdir if "!ffdir:~-1!"=="\" set "ffdir=!ffdir:~0,-1!"
set "sig=!root!|!ffdir!"
set "marked="
if exist "%LOCALAPPDATA%\Foshorde\path.ok" set /p marked=<"%LOCALAPPDATA%\Foshorde\path.ok"
if /i "!marked!"=="!sig!" exit /b 0
set "FSH_ROOT=!root!"
set "FSH_FFDIR=!ffdir!"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$u=[Environment]::GetEnvironmentVariable('Path','User'); if($u -eq $null){$u=''}; $p=@($u -split ';' | Where-Object { $_ -ne '' -and (($_.TrimEnd('\') -ieq $env:FSH_ROOT) -or -not (Test-Path -LiteralPath ($_ + '\Foshorde.bat'))) }); foreach($d in @($env:FSH_ROOT,$env:FSH_FFDIR)){ if($d -and -not ($p | Where-Object { $_.TrimEnd('\') -ieq $d })){ $p += $d } }; [Environment]::SetEnvironmentVariable('Path',($p -join ';'),'User')" >nul 2>&1
if errorlevel 1 exit /b 0
if not exist "%LOCALAPPDATA%\Foshorde" mkdir "%LOCALAPPDATA%\Foshorde"
>"%LOCALAPPDATA%\Foshorde\path.ok" echo !sig!
set "PATH_MSG=1"
exit /b 0


:: =====================================================
:: List the videos of the current folder with their durations.
:: Writes %TEMP%\foshorde-list.tmp  (start_seconds^|duration^|name)  and sets total / all_sec
:: =====================================================
:build_list
set "rawlist=%TEMP%\foshorde-raw.tmp"
set "listfile=%TEMP%\foshorde-list.tmp"
if exist "%rawlist%" del /f /q "%rawlist%"
if exist "%listfile%" del /f /q "%listfile%"
set /a total=0, all_sec=0
if "!kon!"=="1" goto :list_kon
dir /b /a-d *.mp4 *.mkv *.avi *.mov *.wmv *.flv *.webm *.m4v *.ts 2>nul >"%rawlist%"
goto :list_scan
:list_kon
dir /b /a-d *.mp4 *.mkv *.avi *.mov *.wmv *.flv *.webm *.m4v *.ts 2>nul | findstr /v /i /c:"_foshorde." >"%rawlist%"
:list_scan
if not exist "%rawlist%" exit /b 0
echo !GRY!  Scanning videos...!RST!
for /f "usebackq delims=" %%f in ("%rawlist%") do (
    set "bd="
    set "bi=0"
    for /f "usebackq delims=" %%d in (`""!FFPROBE!" -v error -show_entries format^=duration -of default^=noprint_wrappers^=1:nokey^=1 "%%f""`) do set "bd=%%d"
    if defined bd for /f "tokens=1 delims=." %%x in ("!bd!") do set "bi=%%x"
    set "chk="
    for /f "delims=0123456789" %%y in ("!bi!") do set "chk=%%y"
    if defined chk set "bi=0"
    >>"%listfile%" echo !all_sec!^|!bi!^|%%f
    set /a all_sec+=bi, total+=1
)
del /f /q "%rawlist%" >nul 2>&1
exit /b 0


:: =====================================================
:: "foshorde kon [MB]" - compress every video in the current folder.
:: Output: <name>_foshorde.mp4 next to the original. Originals are never deleted.
:: =====================================================
:kon_start
call :show_info
call :build_list
if !total! equ 0 (
    echo !YEL!  No video files to compress in this folder.!RST!
    goto :kon_exit
)
set "target_mb=!default_mb!"
if defined kon_mb (
    set "chk="
    for /f "delims=0123456789" %%x in ("!kon_mb!") do set "chk=%%x"
    if defined chk (
        echo !RED!  Size must be a whole number - using !default_mb! MB.!RST!
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

:update_done
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
for %%s in ("!in!") do set "old_size=%%~zs"
set /a old_mb=old_size/1048576
echo !YEL!  [SKIPPED]!RST! !final! already exists.
set /a skipped+=1
set /a sum_old+=old_mb, sum_new+=old_mb
>>"!results!" echo !idx!^|!in!^|!old_mb!^|!old_mb!^|0^|SKIP
echo.
exit /b 0


:: =====================================================
:: Theme helpers
:: =====================================================
:load_theme
set "theme=acid"
if exist "%script_dir%themes\theme.cfg" set /p theme=<"%script_dir%themes\theme.cfg"
call "%script_dir%themes\themes.bat" !theme!
echo !RST!
exit /b 0

:open_themes
if not exist "%script_dir%themes\theme-selector.bat" (
    echo !RED!  [ERROR]!RST! themes\theme-selector.bat not found.
    pause
    exit /b 1
)
call "%script_dir%themes\theme-selector.bat"
mode con cols=90 lines=40
title Foshorde - Video Compressor
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
    echo !WHT!  Found !total! video file^(s^) in this folder.!RST!
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

:: Manual override from the settings at the top
if /i "!force_encoder!"=="nvenc" set "enc_list=nvenc"
if /i "!force_encoder!"=="amf"   set "enc_list=amf"
if /i "!force_encoder!"=="qsv"   set "enc_list=qsv"
if /i "!force_encoder!"=="cpu"   set "enc_list="

if defined enc_list (
    for %%e in (!enc_list!) do if not defined ENC call :try_enc %%e
)

if not defined ENC (
    set "ENC=cpu"
    set "ENC_LABEL=CPU libx265 (no GPU encoder in use)"
    set "NO_GPU_WARN=0"
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
if /i "%1"=="nvenc" set "ENC_LABEL=NVIDIA NVENC (hevc_nvenc)"
if /i "%1"=="amf"   set "ENC_LABEL=AMD AMF (hevc_amf)"
if /i "%1"=="qsv"   set "ENC_LABEL=Intel Quick Sync (hevc_qsv)"
exit /b 0


:: =====================================================
:print_row
set "n=!r_name!                                    "
set "n=!n:~0,36!"
set "i=  !r_idx!"
set "i=!i:~-3!"
set "o=      !r_old! MB"
set "o=!o:~-8!"
set "w=      !r_new! MB"
set "w=!w:~-8!"
set "p=     !r_pct!%%"
set "p=!p:~-6!"

if "!r_status!"=="OK" (
    echo  !i!  !WHT!!n!!RST! !o! !GRN!!w!!RST! !GRN!!p!!RST!   !GRN!OK!RST!
) else if "!r_status!"=="SKIP" (
    echo  !i!  !WHT!!n!!RST! !o! !GRY!    --!RST! !GRY!    --!RST!   !YEL!SKIPPED!RST!
) else (
    echo  !i!  !WHT!!n!!RST! !o! !GRY!    --!RST! !GRY!    --!RST!   !RED!FAILED!RST!
)
exit /b 0


:: =====================================================
:show_file_header
echo !GRY!  ------------------------------------------------------!RST!
echo !BLD!!WHT!  [!idx!/!total!]!RST! !MAG!!in!!RST!
exit /b 0


:: =====================================================
:process
set "in=%~1"
set "otmp=%output_dir%\%~n1.tmp.mp4"
set "final=%~n1.mp4"
if "!kon!"=="1" set "otmp=%~n1_foshorde.tmp.mp4"
if "!kon!"=="1" set "final=%~n1_foshorde.mp4"
set "is_hdr=0"
set "is10=0"
set "use_cpu=0"
set "pix_fmt="
set "transfer="
set "duration="
set "dur="
set "abr="
set "old_mb=0"
set "retried=0"

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

:: ---- Probe audio bitrate (bits/s), default 128k if unknown ----
for /f "usebackq delims=" %%b in (`""!FFPROBE!" -v error -select_streams a:0 -show_entries stream^=bit_rate -of default^=noprint_wrappers^=1:nokey^=1 "!in!""`) do set "abr=%%b"
if not defined abr set "abr=128000"
if "!abr!"=="N/A" set "abr=128000"
set /a abr_k=abr/1000

for %%s in ("!in!") do set "old_size=%%~zs"
set /a old_mb=old_size/1048576

:calc
set /a total_kbps=target_mb*8*1024/dur
set /a vkbps=total_kbps-abr_k
set /a vkbps=vkbps*97/100
if !vkbps! lss !min_kbps! set "vkbps=!min_kbps!"
set /a maxk=vkbps*3/2
set /a bufk=maxk*2
set /a est_mb=(vkbps+abr_k)*dur/8/1024

echo.
echo    !GRY!Size    :!RST! !old_mb! MB  !GRY!-^>!RST!  !GRN!~!est_mb! MB!RST!  !GRY!^(target !target_mb! MB, +/- 15%%^)!RST!
echo    !GRY!Bitrate :!RST! !vkbps! kbps video + !abr_k! kbps audio ^(copied^)  !GRY!!dur! s!RST!
if "!is_hdr!"=="1" (
    echo    !GRY!Encoder :!RST! !YEL!CPU libx265 10-bit ^(HDR^)!RST!
) else if "!is10!"=="1" (
    echo    !GRY!Encoder :!RST! !YEL!CPU libx265 10-bit!RST!
) else if "!use_cpu!"=="1" (
    echo    !GRY!Encoder :!RST! !YEL!CPU libx265!RST!
) else (
    echo    !GRY!Encoder :!RST! !CYN!!ENC_LABEL!!RST!
)
if !est_mb! geq !old_mb! echo    !YEL![NOTE] Estimated size is not smaller than the original.!RST!
echo.

if "!ask_each!"=="0" goto :encode

echo !GRN!  Enter!RST!=compress  !RED!N!RST!=skip  !CYN!A!RST!=all remaining  !BLU!T!RST!=theme  !GRY!Q!RST!=quit  !MAG!or type a new size in MB!RST!
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
if /i "!ans!"=="T" (
    call :open_themes
    call :show_file_header
    goto :calc
)
set "chk="
for /f "delims=0123456789" %%x in ("!ans!") do set "chk=%%x"
if not defined chk if !ans! geq 1 (
    set "target_mb=!ans!"
    goto :calc
)
if /i "!ans!"=="C" (
    set "newmb="
    set /p "newmb=!YEL!  New target size in MB: !RST!"
    set "chk="
    for /f "delims=0123456789" %%x in ("!newmb!") do set "chk=%%x"
    if defined chk (
        echo !RED!  Invalid number.!RST!
        goto :prompt
    )
    if not defined newmb goto :prompt
    if !newmb! lss 1 goto :prompt
    set "target_mb=!newmb!"
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
echo !CYN!  Encoding on NVIDIA GPU...!RST!
"%FFMPEG%" -hide_banner -loglevel fatal -nostats -progress pipe:1 -y -i "%in%" ^
    -map 0:v:0 -map 0:a? -map 0:s? ^
    -c:v hevc_nvenc -preset p5 -tune hq ^
    -rc vbr -b:v %vkbps%k -maxrate %maxk%k -bufsize %bufk%k ^
    -pix_fmt yuv420p -tag:v hvc1 ^
    -c:a copy -c:s mov_text ^
    "%otmp%" | %PROGCMD%
if not "!errorlevel!"=="0" goto :failed
goto :check

:: ---------- AMD ----------
:encode_amf
echo !CYN!  Encoding on AMD GPU...!RST!
"%FFMPEG%" -hide_banner -loglevel fatal -nostats -progress pipe:1 -y -i "%in%" ^
    -map 0:v:0 -map 0:a? -map 0:s? ^
    -c:v hevc_amf -usage transcoding -quality quality ^
    -rc vbr_peak -b:v %vkbps%k -maxrate %maxk%k ^
    -pix_fmt yuv420p -tag:v hvc1 ^
    -c:a copy -c:s mov_text ^
    "%otmp%" | %PROGCMD%
if not "!errorlevel!"=="0" goto :failed
goto :check

:: ---------- Intel ----------
:encode_qsv
echo !CYN!  Encoding on Intel GPU...!RST!
"%FFMPEG%" -hide_banner -loglevel fatal -nostats -progress pipe:1 -y -i "%in%" ^
    -map 0:v:0 -map 0:a? -map 0:s? ^
    -c:v hevc_qsv -preset slower ^
    -b:v %vkbps%k -maxrate %maxk%k ^
    -pix_fmt nv12 -tag:v hvc1 ^
    -c:a copy -c:s mov_text ^
    "%otmp%" | %PROGCMD%
if not "!errorlevel!"=="0" goto :failed
goto :check

:: ---------- CPU ----------
:encode_cpu
echo !YEL!  Encoding on CPU...!RST!
if "!is_hdr!"=="1" goto :encode_cpu_hdr
"%FFMPEG%" -hide_banner -loglevel fatal -nostats -progress pipe:1 -y -i "%in%" ^
    -map 0:v:0 -map 0:a? -map 0:s? ^
    -c:v libx265 -b:v %vkbps%k -preset %cpu_preset% ^
    -pix_fmt %cpu_pix% -tag:v hvc1 ^
    -c:a copy -c:s mov_text ^
    "%otmp%" | %PROGCMD%
if not "!errorlevel!"=="0" goto :failed
goto :check

:encode_cpu_hdr
"%FFMPEG%" -hide_banner -loglevel fatal -nostats -progress pipe:1 -y -i "%in%" ^
    -map 0:v:0 -map 0:a? -map 0:s? ^
    -c:v libx265 -b:v %vkbps%k -preset %cpu_preset% ^
    -pix_fmt yuv420p10le -tag:v hvc1 ^
    -x265-params "hdr10-opt=1:repeat-headers=1:colorprim=bt2020:transfer=%transfer%:colormatrix=bt2020nc" ^
    -c:a copy -c:s mov_text ^
    "%otmp%" | %PROGCMD%
if not "!errorlevel!"=="0" goto :failed

:check
echo.
:: ---- Verify the output is real before touching the original ----
set "new_size=0"
if exist "!otmp!" for %%s in ("!otmp!") do set "new_size=%%~zs"
if !new_size! lss 102400 (
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
set /a dd=dur-new_dur_i
if !dd! lss 0 set /a dd=-dd
if !dd! gtr 5 (
    echo !RED!  Output duration does not match - original kept.!RST!
    goto :failed
)

:: ---- Size accuracy: if the result misses the target, re-encode once with a corrected bitrate ----
if !retried! geq 1 goto :size_ok
if !old_mb! leq !target_mb! goto :size_ok
set /a new_kb=new_size/1024, tgt_kb=target_mb*1024
set /a lo_kb=tgt_kb*95/100, hi_kb=tgt_kb*103/100
if !new_kb! lss 1 goto :size_ok
if !new_kb! geq !lo_kb! if !new_kb! leq !hi_kb! goto :size_ok
set /a aud_kb=abr_k*dur*125/1024
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
if !new_size! lss !old_size! goto :success
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
if "!kon!"=="0" del /f /q "!in!"
move /y "!otmp!" "!dest!" >nul
set /a new_mb=new_size/1048576
set /a d10=new_size/1024*10/1024
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
