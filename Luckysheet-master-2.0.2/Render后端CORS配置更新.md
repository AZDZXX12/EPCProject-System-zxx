# Render后端CORS配置更新

## 问题
前端 `http://localhost:8000` 访问后端API时被CORS策略阻止。

## 解决方案

### 方案1：更新Render环境变量（推荐）

1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 找到你的后端服务 `luckysheet-backend`
3. 点击 **Environment** 标签
4. 找到 `CORS_ALLOWED_ORIGINS` 环境变量
5. 修改为：
   ```
   http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,https://luckysheet-selection-system.onrender.com
   ```
6. 点击 **Save Changes**
7. 等待服务自动重启（约1-2分钟）

### 方案2：临时本地测试（使用本地后端）

如果只是本地开发测试，可以在本地启动Django后端：

```bash
# 1. 进入后端目录
cd xuanxing/backend

# 2. 安装依赖（如果还没安装）
pip install -r requirements.txt

# 3. 运行数据库迁移
python manage.py migrate

# 4. 启动开发服务器
python manage.py runserver 8001
```

然后修改前端API地址：
- 打开 `dist-refactored/js/modules/selectionHistory.js`
- 将 `API_BASE_URL` 改为 `http://localhost:8001/api/selections`

### 方案3：开发环境允许所有来源（不推荐生产环境）

如果只是开发测试，可以临时允许所有来源：

在 `xuanxing/backend/cable_selector/settings.py` 中：
```python
# 临时开发用
CORS_ALLOW_ALL_ORIGINS = True
```

⚠️ **注意**：生产环境不要使用此配置！

## 推荐操作流程

1. ✅ **已完成**：本地代码已更新，添加了 `localhost:8000` 到CORS白名单
2. **需要操作**：按照方案1更新Render环境变量
3. **等待**：Render服务重启完成
4. **测试**：刷新前端页面，测试保存功能

## 验证方法

1. 打开 `http://localhost:8000/index.html`
2. 填写选型数据，点击"保存"按钮
3. 打开浏览器开发者工具（F12）
4. 查看Console，应该看到：
   - ✅ `📤 自动上传到云端: 选型文件_YYYYMMDD_HHMM`
   - ✅ `✅ 文件已自动备份到云端`
5. 打开 `http://localhost:8000/selection-history.html`
6. 点击"🔄 刷新"，应该能看到刚才保存的记录

## 常见问题

### Q: 更新后还是报CORS错误？
A: 需要等待Render服务完全重启，通常需要1-2分钟。

### Q: 本地测试可以跳过Render配置吗？
A: 可以，使用方案2在本地启动Django后端服务器即可。

### Q: 如何确认Render配置生效？
A: 在浏览器开发者工具Network标签中，查看API请求的Response Headers，应该包含：
```
Access-Control-Allow-Origin: http://localhost:8000
```

