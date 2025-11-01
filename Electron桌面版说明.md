# Electron 桌面版调试指南 🖥️

## 🚀 快速开始

### 方式1：一键启动（推荐）
```bash
# 双击运行
启动Electron桌面版.bat
```

### 方式2：手动启动
```bash
# 1. 安装依赖（首次运行）
npm install

# 2. 启动前端开发服务器（新窗口）
cd client
npm start

# 3. 启动Electron（等前端就绪后，新窗口）
npm run dev
```

---

## 📦 当前状态

### 已完成
- ✅ Electron主进程配置 (`electron-main.js`)
- ✅ 根目录package.json配置
- ✅ 一键启动脚本
- ✅ 开发者工具集成
- ✅ 自定义菜单

### 功能特性
- ✅ 窗口大小：1400x900，最小1200x700
- ✅ 自定义标题栏
- ✅ F12开发者工具
- ✅ F5刷新，Ctrl+Shift+R强制刷新
- ✅ 缩放支持（Ctrl +/-/0）
- ✅ 优雅的加载体验

---

## 🔧 开发模式

### 连接方式
- **前端**：React开发服务器 (http://localhost:3000)
- **后端**：FastAPI (http://localhost:8000) - 需手动启动
- **Electron**：桌面窗口包装

### 快捷键
| 功能 | 快捷键 |
|------|--------|
| 刷新 | F5 |
| 强制刷新 | Ctrl+Shift+R |
| 开发者工具 | F12 |
| 放大 | Ctrl++ |
| 缩小 | Ctrl+- |
| 实际大小 | Ctrl+0 |
| 退出 | Alt+F4 |

---

## 📋 使用流程

### 首次运行
1. **安装Electron**
   ```bash
   npm install
   ```
   大约需要2-3分钟，会下载Electron（~100MB）

2. **启动前端**
   ```bash
   cd client
   npm start
   ```
   等待编译完成（约30秒）

3. **启动Electron**
   ```bash
   # 返回根目录
   cd ..
   npm run dev
   ```
   会自动打开桌面窗口

### 后续运行
- 只需要先启动前端，再运行 `npm run dev`
- 或直接双击 `启动Electron桌面版.bat`

---

## 🎨 界面预览

### 开发模式
```
┌─────────────────────────────────────────┐
│ 化工项目管理系统         🟢 开发模式    │
├─────────────────────────────────────────┤
│ 文件  查看  帮助                         │
├─────────────────────────────────────────┤
│                                         │
│   [React前端 - 连接localhost:3000]     │
│                                         │
│   + 自动刷新                            │
│   + 开发者工具                          │
│   + 热重载                              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🐛 调试技巧

### 1. 打开开发者工具
- 按 **F12**
- 或菜单：查看 → 开发者工具

### 2. 查看控制台日志
- **主进程日志**：查看启动Electron的命令行窗口
- **渲染进程日志**：F12 → Console标签

### 3. 网络请求
- F12 → Network标签
- 可以看到所有API调用

### 4. React DevTools
- 如果已安装React DevTools扩展，会自动加载

---

## ⚠️ 常见问题

### Q1: 窗口显示空白？
**答**: 前端开发服务器可能未启动

**解决**:
1. 确认 `http://localhost:3000` 能在浏览器打开
2. 检查前端窗口是否有错误
3. 按F5刷新Electron窗口

---

### Q2: Electron安装很慢？
**答**: 正常现象，Electron约100MB

**解决**:
1. 使用国内镜像：
   ```bash
   set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
   npm install
   ```
2. 或耐心等待（首次安装需5-10分钟）

---

### Q3: 提示"electron未找到"？
**答**: 未安装Electron

**解决**:
```bash
npm install electron --save-dev
```

---

### Q4: 窗口一闪而过？
**答**: 前端服务器未就绪

**解决**:
1. 先启动前端（`cd client && npm start`）
2. 等待编译完成
3. 再启动Electron（`npm run dev`）

---

### Q5: 能同时调试前端和后端吗？
**答**: 可以！

**步骤**:
1. 窗口1：启动前端 (`cd client && npm start`)
2. 窗口2：启动后端 (`cd server && 启动后端命令`)
3. 窗口3：启动Electron (`npm run dev`)

---

## 📦 打包生产版本

### 打包为exe（未来）
```bash
# 1. 构建前端
cd client
npm run build

# 2. 打包Electron
cd ..
npm run electron:build
```

会在 `dist/` 目录生成安装包：
- `化工项目管理系统 Setup 1.0.0.exe`（安装程序）
- 约150MB

---

## 🎯 下一步计划

### 近期优化
- [ ] 集成后端到Electron（自动启动）
- [ ] 添加托盘图标
- [ ] 添加自动更新
- [ ] 优化启动速度

### 打包优化
- [ ] 使用ASAR压缩
- [ ] 分离大文件
- [ ] 增量更新

---

## 💡 提示

### 开发建议
1. **热重载**：修改前端代码会自动刷新
2. **调试**：F12打开开发者工具，和浏览器一样
3. **日志**：主进程日志在命令行，渲染进程在DevTools
4. **性能**：开发模式会比生产版慢，这是正常的

### 生产部署
- 打包后的exe可以直接分发给用户
- 用户无需安装Node.js、Python等环境
- 一键安装，开箱即用

---

## 📞 技术支持

### 相关文档
- Electron官方文档：https://www.electronjs.org/
- 打包教程：使用electron-builder

### 项目文件
- 主进程：`electron-main.js`
- 配置：`package.json`
- 启动脚本：`启动Electron桌面版.bat`

---

**状态**: ✅ 开发调试就绪  
**版本**: 1.0.0-dev  
**最后更新**: 2024-10-17

**开始调试吧！** 🚀

