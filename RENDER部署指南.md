# 🚀 Render部署指南

## 一、前提条件

✅ 代码已推送到GitHub：https://github.com/AZDZXX12/EPCProject-System-zxx
✅ Render配置文件已创建：`render.yaml`

---

## 二、部署步骤

### 方式1：使用render.yaml自动部署（推荐）

1. **登录Render**
   - 访问：https://dashboard.render.com/
   - 使用GitHub账号登录

2. **创建新服务**
   - 点击 "New +" → "Blueprint"
   - 连接GitHub仓库：`AZDZXX12/EPCProject-System-zxx`
   - Render会自动读取 `render.yaml` 配置
   - 点击 "Apply" 开始部署

3. **等待部署完成**
   - 后端服务：`epc-backend`
   - 前端服务：`epc-frontend`
   - 部署时间约5-10分钟

---

### 方式2：手动创建服务

#### 步骤1：部署后端

1. 点击 "New +" → "Web Service"
2. 连接GitHub仓库：`AZDZXX12/EPCProject-System-zxx`
3. 配置如下：
   ```
   Name: epc-backend
   Region: Singapore
   Branch: main
   Root Directory: (留空)
   Environment: Python 3
   Build Command: pip install -r server/requirements.txt
   Start Command: cd server && python quick-start-sqlite.py
   Plan: Free
   ```
4. 环境变量：
   ```
   PYTHON_VERSION=3.11
   PORT=8000
   ```
5. 点击 "Create Web Service"

#### 步骤2：部署前端

1. 点击 "New +" → "Static Site"
2. 连接同一个GitHub仓库
3. 配置如下：
   ```
   Name: epc-frontend
   Region: Singapore
   Branch: main
   Root Directory: (留空)
   Build Command: cd client && npm install && npm run build
   Publish Directory: client/build
   ```
4. 环境变量：
   ```
   NODE_VERSION=18
   REACT_APP_API_URL=https://epc-backend.onrender.com
   ```
5. 点击 "Create Static Site"

---

## 三、部署后配置

### 1. 更新前端API地址

部署完成后，获取后端实际URL（如：`https://epc-backend-xxxx.onrender.com`），然后：

1. 在Render Dashboard找到前端服务
2. 进入 "Environment" 标签
3. 更新环境变量：
   ```
   REACT_APP_API_URL=https://你的后端实际URL
   ```
4. 保存后会自动重新部署

### 2. 配置CORS（如果需要）

如果前后端域名不同，需要在后端添加CORS配置。

编辑 `server/quick-start-sqlite.py`：
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://你的前端URL"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 四、验证部署

### 1. 检查后端
访问：`https://epc-backend.onrender.com/docs`
应该看到FastAPI的API文档页面

### 2. 检查前端
访问：`https://epc-frontend.onrender.com`
应该看到EPC系统登录页面

### 3. 测试功能
- 登录系统
- 创建项目
- 测试甘特图
- 测试设备管理

---

## 五、常见问题

### 问题1：后端启动失败

**原因**：依赖安装失败或Python版本不对

**解决**：
1. 检查 `server/requirements.txt` 是否正确
2. 确认Python版本设置为3.11
3. 查看Render的构建日志

### 问题2：前端无法连接后端

**原因**：API_URL配置错误或CORS问题

**解决**：
1. 确认 `REACT_APP_API_URL` 设置正确
2. 添加CORS中间件
3. 检查后端是否正常运行

### 问题3：数据库文件丢失

**原因**：Render免费版不支持持久化存储

**解决**：
- 使用Render的PostgreSQL服务（推荐）
- 或使用外部数据库服务

### 问题4：服务休眠

**原因**：Render免费版15分钟无活动会休眠

**解决**：
- 首次访问需要等待30秒唤醒
- 或升级到付费版

---

## 六、部署URL

部署完成后，您的系统将在以下地址访问：

- 🌐 **前端**：https://epc-frontend.onrender.com
- 🔧 **后端**：https://epc-backend.onrender.com
- 📚 **API文档**：https://epc-backend.onrender.com/docs

---

## 七、下一步

1. ✅ 推送render.yaml到GitHub
2. ✅ 在Render上创建Blueprint
3. ✅ 等待部署完成
4. ✅ 更新前端API地址
5. ✅ 测试系统功能

---

## 八、快速命令

```bash
# 推送配置到GitHub
git add render.yaml
git commit -m "Add Render deployment config"
git push origin main

# 查看部署状态
# 访问 Render Dashboard
```

---

🎉 **部署完成后，您的EPC项目管理系统将在云端运行！**


