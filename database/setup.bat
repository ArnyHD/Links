@echo off
chcp 65001 > nul
echo ================================================
echo Knowledge Graph Platform - Database Setup
echo ================================================
echo.

REM Загружаем переменные из .env
for /f "tokens=1,2 delims==" %%a in (..\.env) do (
    if "%%a"=="DB_HOST" set DB_HOST=%%b
    if "%%a"=="DB_PORT" set DB_PORT=%%b
    if "%%a"=="DB_USERNAME" set DB_USERNAME=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
    if "%%a"=="DB_DATABASE" set DB_DATABASE=%%b
)

echo Подключение к базе данных:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   User: %DB_USERNAME%
echo   Database: %DB_DATABASE%
echo.

REM Проверяем, установлен ли psql
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] psql не найден в PATH!
    echo.
    echo Пожалуйста, установите PostgreSQL или добавьте psql в PATH.
    echo Обычно psql находится в: C:\Program Files\PostgreSQL\15\bin\
    echo.
    pause
    exit /b 1
)

echo [OK] psql найден
echo.

REM Устанавливаем пароль для psql
set PGPASSWORD=%DB_PASSWORD%

echo Запуск миграций...
echo.

psql -h %DB_HOST% -p %DB_PORT% -U %DB_USERNAME% -d %DB_DATABASE% -f run_all.sql

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo [SUCCESS] База данных успешно настроена!
    echo ================================================
) else (
    echo.
    echo ================================================
    echo [ERROR] Ошибка при настройке базы данных!
    echo ================================================
    echo.
    echo Возможные причины:
    echo   1. Неверные учетные данные в .env
    echo   2. База данных недоступна
    echo   3. Недостаточно прав у пользователя
)

echo.
pause
