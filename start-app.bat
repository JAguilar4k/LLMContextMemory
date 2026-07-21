@echo off
setlocal EnableDelayedExpansion

set "HOST=127.0.0.1"

cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  set "PYTHON_CMD=py"
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    set "PYTHON_CMD=python"
  ) else (
    echo No se encontro Python.
    echo Instala Python o ejecuta manualmente con otro servidor local.
    pause
    exit /b 1
  )
)

set "PORT="
for %%P in (8010 8011 8012 8013 8014 8015 8016 8017 8018 8019 8020 8021 8022 8023 8024 8025 8026 8027 8028 8029 8030) do (
  netstat -ano | findstr /R /C:":%%P .*LISTENING" >nul
  if errorlevel 1 (
    if not defined PORT set "PORT=%%P"
  )
)

if not defined PORT (
  echo No se encontro un puerto libre entre 8010 y 8030.
  echo Cierra otros servidores locales e intentalo de nuevo.
  pause
  exit /b 1
)

set "CACHE_BUST=%RANDOM%%RANDOM%"
set "URL=http://%HOST%:%PORT%/index.html?v=%CACHE_BUST%"

echo Abriendo %URL%
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 900; Start-Process '%URL%'"
echo.
echo Servidor local activo en %URL%
echo Para detenerlo, cierra esta ventana o presiona Ctrl+C.
echo.

%PYTHON_CMD% -m http.server %PORT% --bind %HOST%

endlocal
