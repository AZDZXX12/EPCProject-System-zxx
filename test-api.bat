@echo off
chcp 65001 >nul
echo ========================================
echo 测试SQLite后端API
echo ========================================

echo.
echo [1] 测试健康检查...
curl http://localhost:8000/health
echo.

echo.
echo [2] 创建测试项目...
curl -X POST http://localhost:8000/api/v1/projects/ -H "Content-Type: application/json" -d "{\"name\":\"化工项目001\",\"description\":\"SQLite测试项目\",\"status\":\"planning\",\"budget\":1000000}"
echo.

echo.
echo [3] 获取所有项目...
curl http://localhost:8000/api/v1/projects/
echo.

echo.
echo [4] 创建测试任务...
curl -X POST http://localhost:8000/api/v1/tasks/ -H "Content-Type: application/json" -d "{\"project_id\":\"PROJ-TEST\",\"name\":\"设计任务\",\"status\":\"pending\",\"priority\":\"high\",\"progress\":0}"
echo.

echo.
echo [5] 获取所有任务...
curl http://localhost:8000/api/v1/tasks/
echo.

echo.
echo [6] 获取数据库信息...
curl http://localhost:8000/api/v1/database/info
echo.

echo.
echo ========================================
echo 测试完成！
echo ========================================
pause


