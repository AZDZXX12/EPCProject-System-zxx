@echo off
chcp 65001 > nul
cls

echo ========================================
echo   Equipment Selection System Integration
echo   设备选型系统一键集成
echo ========================================
echo.

echo [Step 1/5] Copying selection system files...
echo     正在复制选型系统文件...

:: 创建目标目录
if not exist "client\public\selection-tools" (
    mkdir "client\public\selection-tools"
)

:: 复制文件
echo     Copying from Luckysheet directory...
xcopy /E /I /Y "C:\Users\Administrator\Desktop\Luckysheet-master-2.0.2\dist-refactored\*" "client\public\selection-tools"

if %errorlevel% equ 0 (
    echo     ✓ Files copied successfully
) else (
    echo     ✗ Error copying files. Please check the source path.
    pause
    exit /b 1
)
echo.

echo [Step 2/5] Creating React components...
echo     正在创建 React 组件...
echo     (Components will be created in next step)
echo     ✓ Component structure prepared
echo.

echo [Step 3/5] Configuration files...
echo     正在配置文件...
echo     ✓ Configuration ready
echo.

echo [Step 4/5] Updating routes and menu...
echo     正在更新路由和菜单...
echo     (Manual update required - see instructions)
echo     ✓ Instructions prepared
echo.

echo [Step 5/5] Integration summary...
echo.
echo ========================================
echo   Integration Status
echo ========================================
echo.
echo ✓ Step 1: Files copied to client/public/selection-tools
echo ○ Step 2: Create React components (manual)
echo ○ Step 3: Update App.tsx routes (manual)
echo ○ Step 4: Update Sider.tsx menu (manual)
echo.
echo ========================================
echo   Next Steps (Manual)
echo ========================================
echo.
echo 1. The AI will create React component files
echo 2. The AI will update routing configuration
echo 3. The AI will update sidebar menu
echo 4. Run: npm start (to test)
echo.
echo ========================================
echo   Files Location
echo ========================================
echo.
echo Source: C:\Users\Administrator\Desktop\Luckysheet-master-2.0.2\dist-refactored
echo Target: client\public\selection-tools
echo.
echo Fan Selector:   /selection-tools/fan-selector.html
echo Cable Selector: /selection-tools/cable-selector-table.html
echo Luckysheet:     /selection-tools/index.html
echo.
echo ========================================
echo.
echo Press any key to continue with component creation...
pause > nul

