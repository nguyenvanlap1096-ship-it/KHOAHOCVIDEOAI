@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title Muse Studio
rem Bấm đôi là dùng: lần đầu tự tải + cài Muse2API, sau đó tự gắn giao diện mới, tự mở Muse2API và mở Studio.
set "ROOT=C:\muse2api-test"
if defined MUSE_ROOT set "ROOT=%MUSE_ROOT%"
set "APPDIR=%ROOT%\app\Muse2API_VI_Portable_1.6.8"
set "PORT=18610"
rem Trang Muse Studio sẽ mở. Bản web khoá học: điền địa chỉ web (build.js tự điền); để trống = mở bản trên máy.
set "WEBURL="
if defined MUSE_PORT set "PORT=%MUSE_PORT%"
set "ZIPURL=https://github.com/binance9/muse-studio/releases/download/tron-goi-v1/Muse-Studio-Tron-Goi-v1.zip"
set "ZIPSHA=ab1763609f611e1ec7df9bc7843e91f17e370ae29bb10149885e7b242e32cc58"

echo.
echo   ✦ MUSE STUDIO — đang mở, chờ chút...
echo.

rem ---------- 1. Lần đầu: tải và cài Muse2API ----------
if exist "%APPDIR%\Muse2API_Studio.exe" goto have_app
echo   Lần đầu dùng: đang tải bộ chạy Muse2API (khoảng 164 MB, mất vài phút)...
set "TMPD=%TEMP%\muse-studio-setup"
if exist "%TMPD%" rmdir /s /q "%TMPD%"
mkdir "%TMPD%"
curl -L --fail --progress-bar -o "%TMPD%\goi.zip" "%ZIPURL%"
if errorlevel 1 goto err_download
set "GOT="
for /f "skip=1 delims=" %%h in ('certutil -hashfile "%TMPD%\goi.zip" SHA256') do if not defined GOT set "GOT=%%h"
set "GOT=!GOT: =!"
if /i not "!GOT!"=="%ZIPSHA%" goto err_hash
echo   Đang giải nén...
tar -xf "%TMPD%\goi.zip" -C "%TMPD%"
if errorlevel 1 goto err_unzip
set "SRC="
for /d /r "%TMPD%" %%d in (*) do if /i "%%~nxd"=="muse2api-test" if exist "%%d\app" set "SRC=%%d"
if not defined SRC goto err_unzip
robocopy "!SRC!" "%ROOT%" /E /NFL /NDL /NJH /NJS /NP >nul
if not exist "%APPDIR%\Muse2API_Studio.exe" goto err_unzip
rmdir /s /q "%TMPD%"
echo   Đã cài xong Muse2API vào %ROOT%
:have_app

rem ---------- 2. Gắn giao diện mới (giữ lại bản gốc 1 lần) ----------
if exist "%~dp0studio.html" (
  if exist "%APPDIR%\batch.html" if not exist "%APPDIR%\batch.html.goc.bak" copy /y "%APPDIR%\batch.html" "%APPDIR%\batch.html.goc.bak" >nul
  copy /y "%~dp0studio.html" "%APPDIR%\batch.html" >nul
  rem Lưu bản mở nhanh vào thư mục Muse2API + tạo shortcut "Muse Studio" ngoài Desktop (chỉ lần đầu).
  if /i not "%~dp0"=="%ROOT%\studio-moi\" (
    if not exist "%ROOT%\studio-moi" mkdir "%ROOT%\studio-moi"
    copy /y "%~dp0studio.html" "%ROOT%\studio-moi\studio.html" >nul
    copy /y "%~f0" "%ROOT%\studio-moi\MO_MUSE_STUDIO.bat" >nul
  )
  rem Giải nén sẵn tiện ích lấy cookie muse.ai (dùng để thêm tài khoản) ra C:\muse2api-test\muse2api-extension.
  if not exist "%ROOT%\muse2api-extension\manifest.json" if exist "%APPDIR%\muse2api-extension.zip" tar -xf "%APPDIR%\muse2api-extension.zip" -C "%ROOT%" >nul 2>nul
  if not defined MUSE_NOLAUNCH powershell -NoProfile -Command "$d=[Environment]::GetFolderPath('Desktop'); $l=Join-Path $d 'Muse Studio.lnk'; if(-not (Test-Path $l)){ $s=(New-Object -ComObject WScript.Shell).CreateShortcut($l); $s.TargetPath='%ROOT%\studio-moi\MO_MUSE_STUDIO.bat'; $s.WorkingDirectory='%ROOT%\studio-moi'; $s.IconLocation='%APPDIR%\Muse2API_Studio.exe,0'; $s.WindowStyle=7; $s.Save() }" >nul 2>nul
)

rem ---------- 3. Mở Muse2API nếu chưa chạy, chờ sẵn sàng ----------
call :readenv
call :alive
if "!UP!"=="1" goto ready
rem Muse2API_Studio.exe mở không tham số chỉ là cửa sổ GUI (phải bấm "Chạy dịch vụ");
rem --console chạy thẳng dịch vụ (giống 02_CHAY_MUSE2API.bat), để cửa sổ thu nhỏ. Đóng cửa sổ đó là dừng dịch vụ.
if not defined MUSE_NOLAUNCH start "Muse2API - dong cua so nay la dung dich vu" /min /d "%APPDIR%" "%APPDIR%\Muse2API_Studio.exe" --console
echo   Đang khởi động Muse2API...
for /l %%i in (1,1,60) do (
  call :alive
  if "!UP!"=="1" goto ready
  timeout /t 2 /nobreak >nul
)
goto err_start
:ready

rem ---------- 4. Lấy key trong .env và mở Studio ----------
rem Muse2API có thể tự tạo key ở lần chạy đầu: đọc lại .env sau khi đã chạy.
call :readenv
rem Key đặt sau dấu # (bản web) — phần này không gửi lên máy chủ web, key chỉ ở trên máy học viên.
if defined WEBURL (
  set "URL=!WEBURL!"
  if defined KEY set "URL=!URL!#key=!KEY!"
) else (
  set "URL=http://127.0.0.1:!PORT!/batch"
  if defined KEY set "URL=!URL!?key=!KEY!"
)
if defined MUSE_DRYRUN (echo   [thử] !URL!) else start "" "!URL!"
echo   Đã mở Muse Studio trên trình duyệt. Cửa sổ này tự đóng sau 5 giây.
echo   Lần đầu: nếu Studio báo chưa có tài khoản muse, bấm nút "Thêm tài khoản muse" trên Studio.
timeout /t 5 >nul
exit /b 0

:readenv
rem Key: MUSE2API_KEY (bản 1.6.8) hoặc KEY (bản cũ). Cổng: MUSE2API_PORT nếu có.
set "KEY="
if not exist "%APPDIR%\.env" exit /b 0
for /f "usebackq eol=# tokens=1,* delims==" %%a in ("%APPDIR%\.env") do (
  set "NAME=%%a"
  set "NAME=!NAME: =!"
  set "VAL=%%b"
  if defined VAL for /f "tokens=* delims= " %%v in ("!VAL!") do set "VAL=%%v"
  if /i "!NAME!"=="MUSE2API_KEY" set "KEY=!VAL!"
  if /i "!NAME!"=="KEY" if not defined KEY set "KEY=!VAL!"
  if /i "!NAME!"=="MUSE2API_PORT" if not defined MUSE_PORT if defined VAL set "PORT=!VAL!"
)
exit /b 0

:alive
set "UP=0"
for /f %%c in ('curl -s -m 2 -o nul -w "%%{http_code}" "http://127.0.0.1:%PORT%/batch" 2^>nul') do if not "%%c"=="000" set "UP=1"
exit /b 0

:err_download
echo   [LỖI] Không tải được. Kiểm tra mạng Internet rồi bấm đôi lại file này.
pause & exit /b 1
:err_hash
echo   [LỖI] File tải về bị hỏng hoặc không đúng bản gốc (mã kiểm tra không khớp). Bấm đôi lại để tải lại.
pause & exit /b 1
:err_unzip
echo   [LỖI] Giải nén không được. Ổ C: cần trống khoảng 10 GB. Bấm đôi lại file này.
pause & exit /b 1
:err_start
echo   [LỖI] Muse2API không mở lên được sau 2 phút.
echo   Mở thử bằng tay: %APPDIR%\Muse2API_Studio.exe
echo   Nếu Windows hiện màn hình xanh SmartScreen: bấm More info, rồi Run anyway. Sau đó bấm đôi lại file này.
pause & exit /b 1
