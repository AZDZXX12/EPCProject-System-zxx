# Chrome DevTools MCP 配置完成指南

## 📋 配置概述

Chrome DevTools MCP已成功配置，可以让AI助手直接与Chrome浏览器交互，进行调试、截图、网络监控等操作。

## 🎯 已安装的MCP服务器

### 1. Puppeteer MCP Server
- **包名**: `@modelcontextprotocol/server-puppeteer`
- **功能**: 
  - 控制Chrome浏览器
  - 页面导航和交互
  - 截图和PDF生成
  - JavaScript执行
  - 网络请求监控

### 2. Chrome Inspector MCP
- **包名**: `chrome-inspector-mcp`
- **功能**:
  - CSS样式检查
  - DOM元素分析
  - 实时调试

## 📁 配置文件

已创建 `mcp-config.json` 配置文件，内容如下：

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {
        "PUPPETEER_EXECUTABLE_PATH": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      }
    },
    "chrome-inspector": {
      "command": "npx",
      "args": ["-y", "chrome-inspector-mcp"]
    }
  }
}
```

## 🚀 使用方法

### 方法1: 在Windsurf IDE中使用

1. **打开MCP设置**
   - 点击IDE右下角的MCP图标
   - 或使用快捷键 `Ctrl+Shift+P` 搜索 "MCP"

2. **加载配置文件**
   ```
   文件路径: c:\Users\Administrator\Desktop\xiangmu2.0\mcp-config.json
   ```

3. **启动MCP服务器**
   - 选择 `chrome-devtools` 或 `chrome-inspector`
   - 点击"启动"按钮

### 方法2: 命令行直接使用

```bash
# 启动Puppeteer MCP服务器
npx -y @modelcontextprotocol/server-puppeteer

# 启动Chrome Inspector MCP
npx -y chrome-inspector-mcp
```

### 方法3: 在Aider中使用

在 `aider_config.yml` 中添加：

```yaml
mcp:
  servers:
    - name: chrome-devtools
      command: npx
      args:
        - -y
        - @modelcontextprotocol/server-puppeteer
      env:
        PUPPETEER_EXECUTABLE_PATH: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
```

## 🎨 功能示例

### 1. 网页截图
```javascript
// AI可以执行：
"请打开 https://example.com 并截图"
```

### 2. 页面调试
```javascript
// AI可以执行：
"检查页面上的CSS样式问题"
"分析网络请求"
"执行JavaScript代码"
```

### 3. 自动化测试
```javascript
// AI可以执行：
"测试登录功能"
"填写表单并提交"
"点击按钮并验证结果"
```

## 🔧 高级配置

### 自定义Chrome路径

如果Chrome安装在其他位置，修改 `mcp-config.json`：

```json
{
  "env": {
    "PUPPETEER_EXECUTABLE_PATH": "你的Chrome路径"
  }
}
```

常见路径：
- Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Windows (x86): `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
- 便携版: `D:\PortableApps\Chrome\chrome.exe`

### 配置代理

```json
{
  "env": {
    "HTTP_PROXY": "http://proxy.example.com:8080",
    "HTTPS_PROXY": "http://proxy.example.com:8080"
  }
}
```

### 无头模式配置

```json
{
  "env": {
    "PUPPETEER_HEADLESS": "true"
  }
}
```

## 📦 可用的MCP工具

### Puppeteer MCP提供的工具：

1. **navigate** - 导航到URL
2. **screenshot** - 截图
3. **click** - 点击元素
4. **fill** - 填写表单
5. **evaluate** - 执行JavaScript
6. **pdf** - 生成PDF
7. **cookies** - 管理Cookie
8. **network** - 监控网络请求

### Chrome Inspector MCP提供的工具：

1. **inspect_element** - 检查元素
2. **get_styles** - 获取样式
3. **get_computed_styles** - 获取计算样式
4. **modify_styles** - 修改样式

## 🧪 测试MCP连接

创建测试脚本 `test-chrome-mcp.js`：

```javascript
const { spawn } = require('child_process');

// 启动MCP服务器
const mcp = spawn('npx', ['-y', '@modelcontextprotocol/server-puppeteer']);

mcp.stdout.on('data', (data) => {
  console.log(`MCP输出: ${data}`);
});

mcp.stderr.on('data', (data) => {
  console.error(`MCP错误: ${data}`);
});

mcp.on('close', (code) => {
  console.log(`MCP进程退出，代码: ${code}`);
});

console.log('✅ Chrome DevTools MCP已启动');
```

运行测试：
```bash
node test-chrome-mcp.js
```

## 🔍 故障排查

### 问题1: Chrome未找到
**解决方案**: 
- 检查Chrome是否已安装
- 更新 `PUPPETEER_EXECUTABLE_PATH` 路径

### 问题2: 权限错误
**解决方案**:
- 以管理员身份运行
- 检查Chrome可执行文件权限

### 问题3: 端口占用
**解决方案**:
```bash
# 查找占用端口的进程
netstat -ano | findstr :9222

# 结束进程
taskkill /PID <进程ID> /F
```

### 问题4: npx命令失败
**解决方案**:
```bash
# 清除npm缓存
npm cache clean --force

# 重新安装
npm install -g @modelcontextprotocol/server-puppeteer
```

## 📚 相关资源

- [MCP官方文档](https://modelcontextprotocol.io/)
- [Puppeteer文档](https://pptr.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

## 🎯 快速启动命令

创建快速启动脚本 `start-chrome-mcp.bat`：

```batch
@echo off
echo 🚀 启动Chrome DevTools MCP服务器...
echo.
echo 选择MCP服务器:
echo 1. Puppeteer MCP (浏览器自动化)
echo 2. Chrome Inspector MCP (CSS检查)
echo.
set /p choice="请输入选项 (1 或 2): "

if "%choice%"=="1" (
    echo.
    echo ✅ 启动Puppeteer MCP...
    npx -y @modelcontextprotocol/server-puppeteer
) else if "%choice%"=="2" (
    echo.
    echo ✅ 启动Chrome Inspector MCP...
    npx -y chrome-inspector-mcp
) else (
    echo ❌ 无效选项
    pause
)
```

## ✅ 配置完成检查清单

- [x] 安装Puppeteer MCP Server
- [x] 创建mcp-config.json配置文件
- [x] 配置Chrome可执行路径
- [x] 创建配置文档
- [ ] 在IDE中测试MCP连接
- [ ] 验证浏览器控制功能
- [ ] 测试截图功能
- [ ] 测试网络监控

## 🎉 下一步

1. **在Windsurf中启用MCP**
   - 打开设置 → MCP → 加载配置文件

2. **测试基本功能**
   ```
   "请打开百度并截图"
   "检查当前页面的CSS问题"
   ```

3. **集成到项目**
   - 在EPC项目中使用MCP进行自动化测试
   - 使用MCP监控前端性能
   - 使用MCP进行UI调试

## 📞 支持

如有问题，请查看：
- 项目文档: `README.md`
- 故障排查: 本文档"故障排查"部分
- 日志文件: `%APPDATA%\npm-cache\_logs\`

---

**配置时间**: 2025-11-29 08:15
**配置状态**: ✅ 完成
**测试状态**: ⏳ 待测试
