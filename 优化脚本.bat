@echo off
chcp 65001 >nul
echo ========================================
echo   EPC项目优化脚本
echo ========================================
echo.

echo [1/5] 创建归档目录...
if not exist "docs\archive" mkdir "docs\archive"
if not exist "docs\archive\optimization-reports" mkdir "docs\archive\optimization-reports"
if not exist "docs\archive\old-scripts" mkdir "docs\archive\old-scripts"
echo ✓ 目录创建完成

echo.
echo [2/5] 归档优化报告文档...
move /Y "✅*.md" "docs\archive\optimization-reports\" 2>nul
move /Y "🎉*.md" "docs\archive\optimization-reports\" 2>nul
move /Y "🎨*.md" "docs\archive\optimization-reports\" 2>nul
move /Y "🎯*.md" "docs\archive\optimization-reports\" 2>nul
move /Y "📦*.md" "docs\archive\optimization-reports\" 2>nul
move /Y "🔄*.md" "docs\archive\optimization-reports\" 2>nul
move /Y "🔍*.md" "docs\archive\optimization-reports\" 2>nul
move /Y "🔥*.md" "docs\archive\optimization-reports\" 2>nul
move /Y "🔧*.md" "docs\archive\optimization-reports\" 2>nul
move /Y "🚀*.md" "docs\archive\optimization-reports\" 2>nul
move /Y "🧪*.md" "docs\archive\optimization-reports\" 2>nul
echo ✓ 文档归档完成

echo.
echo [3/5] 归档旧脚本...
move /Y "一键*.bat" "docs\archive\old-scripts\" 2>nul
move /Y "一键*.js" "docs\archive\old-scripts\" 2>nul
move /Y "准备*.bat" "docs\archive\old-scripts\" 2>nul
move /Y "准备*.ps1" "docs\archive\old-scripts\" 2>nul
move /Y "测试*.bat" "docs\archive\old-scripts\" 2>nul
move /Y "验证*.bat" "docs\archive\old-scripts\" 2>nul
move /Y "诊断*.bat" "docs\archive\old-scripts\" 2>nul
echo ✓ 脚本归档完成

echo.
echo [4/5] 清理临时文件...
del /Q "demo.html" 2>nul
del /Q "simple-demo.html" 2>nul
del /Q "status.html" 2>nul
del /Q "CHANGELOG.md" 2>nul
del /Q "PROJECT_SUMMARY.md" 2>nul
del /Q "QUICKSTART.md" 2>nul
echo ✓ 临时文件清理完成

echo.
echo [5/5] 安装代码规范工具...
cd client
call npm install --save-dev eslint prettier husky lint-staged
echo ✓ 工具安装完成

echo.
echo ========================================
echo   优化完成！
echo ========================================
echo.
echo 已完成的优化:
echo   ✓ 文档归档到 docs/archive/
echo   ✓ 临时文件清理
echo   ✓ 代码规范工具安装
echo.
echo 下一步建议:
echo   1. 查看优化方案: 📋项目优化提升方案.md
echo   2. 运行代码检查: cd client ^&^& npm run lint
echo   3. 格式化代码: cd client ^&^& npm run format
echo.
pause
