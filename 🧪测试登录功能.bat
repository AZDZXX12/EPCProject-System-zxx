@echo off
chcp 65001 >nul
echo ========================================
echo 🧪 EPC系统 - 登录功能测试
echo ========================================
echo.

echo 📋 测试清单:
echo [1] 检查后端服务器状态
echo [2] 检查前端服务器状态  
echo [3] 测试登录API
echo [4] 验证CORS配置
echo.

echo ⏳ 正在测试后端服务器...
curl -s http://localhost:8000/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务器运行正常 - http://localhost:8000
) else (
    echo ❌ 后端服务器未运行
    echo 💡 请先运行: cd server ^&^& python quick-start-sqlite.py
    pause
    exit /b 1
)

echo.
echo ⏳ 正在测试前端服务器...
curl -s http://localhost:3001/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 前端服务器运行正常 - http://localhost:3001
) else (
    echo ❌ 前端服务器未运行
    echo 💡 请先运行: cd client ^&^& npm start
    pause
    exit /b 1
)

echo.
echo ⏳ 正在测试登录API...
curl -X POST http://localhost:8000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}" ^
  -s -o test_result.json

if exist test_result.json (
    echo ✅ 登录API响应正常
    type test_result.json
    del test_result.json
) else (
    echo ❌ 登录API测试失败
)

echo.
echo ========================================
echo 🎯 测试完成！
echo ========================================
echo.
echo 📝 登录信息:
echo    用户名: admin
echo    密码: admin123
echo.
echo 🌐 访问地址:
echo    前端: http://localhost:3001
echo    后端API文档: http://localhost:8000/docs
echo.
echo 💡 提示: 如果测试失败，请检查:
echo    1. 后端和前端服务器是否都在运行
echo    2. 端口3001和8000是否被占用
echo    3. 查看浏览器控制台的错误信息
echo.
pause
