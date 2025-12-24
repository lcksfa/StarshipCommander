@echo off
REM Docker 部署脚本（Windows）/ Docker Deployment Script (Windows)
REM 使用方法 / Usage: docker\deploy.bat [init|start|stop|restart|logs|status|clean]

setlocal enabledelayedexpansion

if "%1"=="" goto help
if "%1"=="init" goto init
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="clean" goto clean
if "%1"=="rebuild" goto rebuild
if "%1"=="help" goto help
goto unknown

:help
echo 🐳 Starship Commander Docker 部署脚本
echo.
echo 使用方法 / Usage:
echo   docker\deploy.bat [命令]
echo.
echo 可用命令 / Available Commands:
echo   init       初始化并启动所有服务
echo   start      启动所有服务
echo   stop       停止所有服务
echo   restart    重启所有服务
echo   logs       查看日志
echo   status     查看服务状态
echo   clean      清理容器和卷
echo   rebuild    重新构建镜像
echo.
echo 示例 / Examples:
echo   docker\deploy.bat init      首次部署
echo   docker\deploy.bat status    查看状态
goto end

:init
echo 🚀 初始化 Starship Commander 服务...
docker-compose build
docker-compose --profile init up db-init --abort-on-container-exit
docker-compose up -d
echo.
echo ✅ 服务启动成功！
echo.
echo 📊 服务状态：
docker-compose ps
echo.
echo 🌐 访问地址：
echo   前端 / Frontend: http://localhost:3000
echo   后端 / Backend:  http://localhost:3001
goto end

:start
echo 🚀 启动服务...
docker-compose up -d
echo ✅ 服务启动成功！
docker-compose ps
goto end

:stop
echo 🛑 停止服务...
docker-compose down
echo ✅ 服务已停止
goto end

:restart
echo 🔄 重启服务...
docker-compose restart
echo ✅ 服务已重启
docker-compose ps
goto end

:logs
echo 📋 查看日志（Ctrl+C 退出）...
docker-compose logs -f
goto end

:status
echo 📊 服务状态：
echo.
docker-compose ps
echo.
echo 🏥 健康检查：
echo.

REM 检查前端
curl -sf http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo   前端 / Frontend: ✅ 健康
) else (
    echo   前端 / Frontend: ❌ 异常
)

REM 检查后端
curl -sf http://localhost:3001/trpc/health >nul 2>&1
if %errorlevel% equ 0 (
    echo   后端 / Backend:  ✅ 健康
) else (
    echo   后端 / Backend:  ❌ 异常
)
echo.
goto end

:clean
echo ⚠️  警告：这将删除所有容器、镜像和卷！
set /p confirm="确认继续？ (y/N): "
if /i "%confirm%"=="y" (
    echo 🧹 清理容器和卷...
    docker-compose down -v --rmi all
    echo ✅ 清理完成
) else (
    echo ❌ 已取消
)
goto end

:rebuild
echo 🔨 重新构建镜像...
docker-compose build --no-cache
echo ✅ 重新构建完成
echo 🔄 重启服务...
docker-compose up -d
echo ✅ 服务已重启
goto end

:unknown
echo ❌ 未知命令: %1
echo.
goto help

:end
endlocal
