@echo off
chcp 65001 >nul
setlocal
set "APPDIR=C:\muse2api-test\app\Muse2API_VI_Portable_1.6.8"
if not "%~1"=="" set "APPDIR=%~1"

if not exist "%APPDIR%\batch.html.goc.bak" (
  echo  Không thấy bản giao diện cũ batch.html.goc.bak trong %APPDIR%
  pause
  exit /b 1
)
copy /y "%APPDIR%\batch.html.goc.bak" "%APPDIR%\batch.html" >nul
echo  Đã trả lại giao diện cũ. Tải lại trang http://127.0.0.1:18610/batch (F5).
pause
