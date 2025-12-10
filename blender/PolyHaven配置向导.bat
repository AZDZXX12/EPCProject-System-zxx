@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        ✓ Poly Haven Assets 插件安装成功！                 ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 现在请按照以下步骤配置：
echo.
echo ════════════════════════════════════════════════════════════
echo  步骤1：创建资产库文件夹
echo ════════════════════════════════════════════════════════════
echo.
echo 选择一个有至少 4GB 空间的位置创建文件夹：
echo.
echo 推荐位置1: D:\Blender Assets\Poly Haven
echo 推荐位置2: C:\Users\Administrator\Documents\Blender Assets\Poly Haven
echo.
pause
echo.
echo ════════════════════════════════════════════════════════════
echo  步骤2：在Blender中配置
echo ════════════════════════════════════════════════════════════
echo.
echo 1. 启动Blender（双击桌面的 Blender 3.0.1）
echo 2. 点击菜单：编辑 → 首选项
echo 3. 左侧选择：文件路径 (File Paths)
echo 4. 找到：资产库 (Asset Libraries)
echo 5. 点击 '+' 按钮添加新库
echo 6. 名称输入：Poly Haven
echo 7. 路径选择您刚创建的文件夹
echo 8. 点击 OK 保存
echo.
pause
echo.
echo ════════════════════════════════════════════════════════════
echo  步骤3：下载资产
echo ════════════════════════════════════════════════════════════
echo.
echo 1. 在Blender中切换到 Asset Browser（资产浏览器）
echo    - 顶部菜单切换编辑器类型
echo    - 或按 Shift+F1 然后选择
echo.
echo 2. 在资产浏览器顶部下拉菜单选择 "Poly Haven"
echo.
echo 3. 点击顶部工具栏的 "Fetch Assets" 按钮
echo.
echo 4. 等待下载完成（约3.3GB）
echo    - 第一次下载可能需要30分钟到1小时
echo    - 可以在后台运行，不影响使用Blender
echo.
pause
echo.
echo ════════════════════════════════════════════════════════════
echo  使用方法
echo ════════════════════════════════════════════════════════════
echo.
echo 下载完成后：
echo.
echo 📸 HDRI环境：
echo    - 在资产浏览器找到HDRI
echo    - 拖拽到场景
echo    - 自动应用到世界环境
echo    - 右侧面板可调节旋转、亮度、色温
echo.
echo 🎨 材质纹理：
echo    - 选择一个材质
echo    - 拖拽到3D对象上
echo    - 自动创建完整PBR材质节点
echo    - 可调整分辨率（1K-8K）
echo.
echo 🎭 3D模型：
echo    - 选择模型
echo    - 拖拽到场景
echo    - 立即使用
echo.
echo ════════════════════════════════════════════════════════════
echo  💡 提示
echo ════════════════════════════════════════════════════════════
echo.
echo - 插件已启用，不需要手动勾选
echo - 所有资产完全免费商用（CC0许可）
echo - 定期点击 Fetch Assets 获取新资产
echo - Poly Haven每天发布新内容
echo - 可以在 N 面板找到分辨率切换等功能
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 准备好了吗？按任意键打开Blender开始使用！
pause >nul

echo.
echo 正在启动Blender...
start "" "C:\MyApps\BlenderCustom\MyBlender.exe"

echo.
echo Blender已启动！按照上述步骤配置资产库吧 🎨
echo.
timeout /t 3

