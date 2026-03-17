@echo off
setlocal

rem Elements CLI Installer — Windows
rem Usage: curl -fsSL https://NVIDIA.github.io/elements/install.cmd -o install.cmd && install.cmd && del install.cmd

set "BASE_URL=https://NVIDIA.github.io/elements/cli"
set "BINARY=nve-windows-x64"
set "INSTALL_DIR=%USERPROFILE%\.nve\bin"
set "BIN_NAME=nve.exe"

echo Installing Elements CLI...

if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo Downloading %BASE_URL%/%BINARY%
curl -fsSL "%BASE_URL%/%BINARY%" -o "%INSTALL_DIR%\%BIN_NAME%"
if %errorlevel% neq 0 (
    echo error: Failed to download binary. Check your internet connection and try again.
    exit /b 1
)

rem Add to user PATH if not already present
echo %PATH% | findstr /I /C:"%INSTALL_DIR%" >nul 2>&1
if %errorlevel% neq 0 (
    setx PATH "%INSTALL_DIR%;%PATH%" >nul 2>&1
    set "PATH=%INSTALL_DIR%;%PATH%"
    echo Added %INSTALL_DIR% to user PATH.
)

rem Check npm registry
set "REGISTRY_URL=https://registry.npmjs.org"

where npm >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%r in ('npm config get registry 2^>nul') do set "CURRENT_REGISTRY=%%r"
    if /i not "%CURRENT_REGISTRY%"=="%REGISTRY_URL%" (
        echo Configuring npm registry for NVIDIA Artifactory...
        npm config set registry %REGISTRY_URL%
        echo npm registry configured.
        echo NOTE: Run "npm login --auth-type=legacy" to authenticate.
    )
) else (
    echo WARNING: npm not found. After installing Node.js, run:
    echo   npm config set registry %REGISTRY_URL%
    echo   npm login --auth-type=legacy
)

rem Verify installation
"%INSTALL_DIR%\%BIN_NAME%" --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%v in ('"%INSTALL_DIR%\%BIN_NAME%" --version') do set "VERSION=%%v"
    echo.
    echo Elements CLI %VERSION% installed successfully!
) else (
    echo.
    echo Elements CLI installed successfully!
)

echo.
echo   Run "nve --help" to get started.
echo   Restart your terminal to update PATH.
echo.

endlocal
