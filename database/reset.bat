@echo off
chcp 65001 > nul
echo ================================================
echo Knowledge Graph Platform - Database Reset
echo ================================================
echo.
echo [WARNING] Это удалит ВСЕ данные из базы!
echo.
set /p confirm="Вы уверены? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo Отменено пользователем.
    pause
    exit /b 0
)

echo.

REM Загружаем переменные из .env
for /f "tokens=1,2 delims==" %%a in (..\.env) do (
    if "%%a"=="DB_HOST" set DB_HOST=%%b
    if "%%a"=="DB_PORT" set DB_PORT=%%b
    if "%%a"=="DB_USERNAME" set DB_USERNAME=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
    if "%%a"=="DB_DATABASE" set DB_DATABASE=%%b
)

REM Устанавливаем пароль для psql
set PGPASSWORD=%DB_PASSWORD%

echo Удаление таблиц...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USERNAME% -d %DB_DATABASE% -f reset_database.sql

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Таблицы удалены
    echo.
    set /p recreate="Пересоздать структуру базы? (yes/no): "

    if /i "!recreate!"=="yes" (
        echo.
        echo Запуск миграций...
        psql -h %DB_HOST% -p %DB_PORT% -U %DB_USERNAME% -d %DB_DATABASE% -f run_all.sql

        if !errorlevel! equ 0 (
            echo.
            echo [SUCCESS] База данных пересоздана!
        )
    )
) else (
    echo [ERROR] Ошибка при удалении таблиц
)

echo.
pause