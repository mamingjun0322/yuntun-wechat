@echo off
chcp 65001 >nul
echo ========================================
echo      Redis 完全清除工具
echo ========================================
echo.

echo [步骤 1] 正在清除 Redis 所有数据库...
redis-cli FLUSHALL
if %errorlevel% neq 0 (
    echo ❌ Redis 清除失败！请检查 Redis 是否正在运行。
    echo.
    echo 提示：请先启动 Redis 服务
    echo   方法1: net start redis
    echo   方法2: 在服务管理器中启动 Redis
    pause
    exit /b 1
)
echo ✅ Redis 已清空！
echo.

echo [步骤 2] 验证清除结果...
redis-cli KEYS * > temp_redis_keys.txt
set /p KEYS=<temp_redis_keys.txt
del temp_redis_keys.txt

if "%KEYS%"=="(empty array)" (
    echo ✅ 验证成功：Redis 已完全清空
) else if "%KEYS%"=="" (
    echo ✅ 验证成功：Redis 已完全清空
) else (
    echo ⚠️  警告：Redis 中仍有数据！
    echo 正在再次清除...
    redis-cli FLUSHALL
    echo ✅ 再次清除完成
)
echo.

echo [步骤 3] 显示 Redis 状态...
redis-cli INFO keyspace
echo.

echo ========================================
echo      清除完成！
echo ========================================
echo.
echo 📝 接下来请执行：
echo   1. 在 IDEA 中重启后端服务
echo   2. 在微信开发者工具中清除缓存
echo   3. 重新编译小程序
echo.
pause

