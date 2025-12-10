@echo off
chcp 65001 >nul
echo ════════════════════════════════════════════════════════════
echo 安装 Poly Haven Assets 插件
echo ════════════════════════════════════════════════════════════
echo.
echo 这个插件提供：
echo - 1500+ 免费高质量资产
echo - HDRI环境贴图
echo - PBR材质纹理
echo - 3D模型
echo.
echo ════════════════════════════════════════════════════════════
echo.

echo [1/3] 检查下载...
if not exist "polyhavenassets.zip" (
    echo 正在下载插件...
    curl.exe -L "https://github.com/Poly-Haven/polyhavenassets/archive/refs/heads/main.zip" -o polyhavenassets.zip
    if %errorlevel% neq 0 (
        echo 下载失败！
        pause
        exit /b 1
    )
)
echo ✓ 插件文件准备就绪

echo.
echo [2/3] 安装到Blender...
"C:\MyApps\BlenderCustom\MyBlender.exe" --background --python install_polyhaven.py

echo.
echo [3/3] 完成！
echo.
echo ════════════════════════════════════════════════════════════
echo ✓ Poly Haven Assets 插件安装完成！
echo ════════════════════════════════════════════════════════════
echo.
echo 下一步操作：
echo.
echo 1. 启动Blender
echo 2. 编辑 → 首选项 → 文件路径 → 资产库
echo 3. 点击 '+' 添加新库，命名为 'Poly Haven'
echo 4. 选择保存位置（建议：D:\Blender Assets\Poly Haven）
echo 5. 打开资产浏览器，选择 'Poly Haven' 库
echo 6. 点击顶部的 'Fetch Assets' 按钮
echo 7. 等待下载完成（约3.3GB）
echo.
echo 插件功能：
echo - 浏览1500+免费资产
echo - 一键导入场景
echo - 动态调整纹理分辨率
echo - 自动设置置换贴图
echo - HDRI旋转和亮度调节
echo.
pause

