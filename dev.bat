@echo off
echo ==========================================
echo    Vitalium - Development Environment
echo ==========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker nao esta rodando. Inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

set ACTION=%1

if "%ACTION%"=="up" goto :up
if "%ACTION%"=="down" goto :down
if "%ACTION%"=="restart" goto :restart
if "%ACTION%"=="logs" goto :logs
if "%ACTION%"=="build" goto :build
if "%ACTION%"=="init" goto :init
if "%ACTION%"=="clean" goto :clean
if "%ACTION%"=="reset_hard" goto :reset_hard
goto :up

:up
echo [INFO] Subindo todos os servicos (backend + frontend + postgres + prisma studio)...
docker compose -f docker-compose.dev.yml up -d
echo.
echo [OK] Servicos iniciados!
echo   Backend:       http://localhost:3000
echo   Frontend:      http://localhost:3001
echo   Prisma Studio: http://localhost:5555
echo   PostgreSQL:    localhost:5432
echo.
echo Use ".\dev.bat logs" para ver os logs
goto :end

:down
echo [INFO] Parando todos os servicos (containers preservados)...
docker compose -f docker-compose.dev.yml stop
echo [OK] Servicos parados.
goto :end

:restart
echo [INFO] Reiniciando todos os servicos...
docker compose -f docker-compose.dev.yml restart
echo [OK] Servicos reiniciados!
goto :end

:logs
echo [INFO] Mostrando logs (Ctrl+C para sair)...
docker compose -f docker-compose.dev.yml logs -f
goto :end

:init
echo [INFO] Construindo imagens e subindo servicos pela primeira vez...
docker compose -f docker-compose.dev.yml up --build -d
echo.
echo [OK] Servicos iniciados!
echo   Backend:       http://localhost:3000
echo   Frontend:      http://localhost:3001
echo   Prisma Studio: http://localhost:5555
echo   PostgreSQL:    localhost:5432
goto :end

:build
echo [INFO] Reconstruindo imagens...
docker compose -f docker-compose.dev.yml build --no-cache
echo [OK] Imagens reconstruidas!
goto :end

:clean
echo [INFO] Limpando tudo (containers, volumes, imagens)...
docker compose -f docker-compose.dev.yml down -v --rmi local
echo [OK] Tudo limpo!
goto :end

:reset_hard
echo.
echo ==========================================
echo   WARNING: RESET HARD - TUDO SERA APAGADO!
echo ==========================================
echo.
echo Isso vai:
echo   X Parar todos os containers
echo   X Remover todos os volumes (banco de dados, cache)
echo   X Remover as imagens locais
echo   X Limpar cache do Docker
echo.
set /p confirm="Tem certeza? Digite 'sim' para continuar: "
if /i not "%confirm%"=="sim" (
    echo [INFO] Operacao cancelada.
    goto :end
)
echo.
echo [INFO] Parando containers...
docker compose -f docker-compose.dev.yml down -v --rmi local >nul 2>&1
echo [OK] Containers removidos.
echo.
echo [INFO] Removendo volumes orfaos...
docker volume prune -f >nul 2>&1
echo [OK] Volumes limpos.
echo.
echo [INFO] Removendo redes orfaas...
docker network prune -f >nul 2>&1
echo [OK] Redes limpas.
echo.
echo [INFO] Limpando cache do build...
docker builder prune -f >nul 2>&1
echo [OK] Cache limpo.
echo.
echo [INFO] Reconstruindo tudo do zero...
docker compose -f docker-compose.dev.yml up --build -d
echo.
echo ==========================================
echo [OK] RESET HARD COMPLETO!
echo ==========================================
echo   Backend:       http://localhost:3000
echo   Frontend:      http://localhost:3001
echo   Prisma Studio: http://localhost:5555
echo   PostgreSQL:    localhost:5432
echo.
goto :end

:end
