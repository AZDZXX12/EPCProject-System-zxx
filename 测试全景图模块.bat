@echo off
chcp 65001 >nul
echo ========================================
echo 全景图模块测试指南
echo ========================================
echo.
echo 📸 全景图模块已成功集成！
echo.
echo 🎯 访问方式：
echo    1. 启动项目后，在左侧菜单找到 "全景图查看器"
echo    2. 或直接访问: http://localhost:5173/panorama
echo.
echo 🎮 功能测试：
echo    ✓ 鼠标拖拽 - 查看全景不同角度
echo    ✓ 滚轮缩放 - 放大/缩小视图
echo    ✓ 自动旋转 - 点击播放按钮
echo    ✓ 全屏模式 - 点击全屏按钮
echo    ✓ 场景切换 - 使用下拉菜单
echo    ✓ 热点信息 - 悬停蓝色图标
echo.
echo 📁 相关文件：
echo    - client/src/pages/PanoramaViewer.tsx
echo    - client/src/pages/PanoramaViewer.css
echo    - client/src/components/Layout/Sider.tsx
echo    - client/src/config/routes.tsx
echo.
echo 📖 详细说明请查看: 全景图模块使用说明.md
echo.
echo ========================================
echo 按任意键启动项目...
echo ========================================
pause >nul

cd client
echo.
echo 🚀 正在启动前端服务...
npm run dev
