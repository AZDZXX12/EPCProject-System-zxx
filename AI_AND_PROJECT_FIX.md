# 🚀 AI和新建项目功能修复指南

## 问题总结

### 1. ❌ AI机器人未使用真实大模型
- 当前使用本地模拟算法
- 已有RealAIService但未正确配置
- 缺少API密钥配置

### 2. ❌ 新建项目功能问题
- 可能使用Mock数据
- 后端API未正确连接
- 环境变量配置缺失

---

## ✅ 立即修复（5分钟）

### 步骤1：配置AI服务（推荐：硅基流动 - 完全免费）

#### 1.1 获取免费API密钥

访问：https://cloud.siliconflow.cn/

1. 注册账号（支持微信/手机号）
2. 进入控制台
3. 点击"API密钥"
4. 创建新密钥
5. 复制密钥（格式：sk-xxxxxx）

**优势**：
- ✅ 完全免费，无需充值
- ✅ 每天无限次调用
- ✅ 使用Qwen2.5-7B模型
- ✅ 国内访问速度快

#### 1.2 配置环境变量

```bash
# 在项目根目录创建 client/.env.local
cd client
copy .env.example .env.local
```

编辑 `client/.env.local`：

```bash
# AI配置
REACT_APP_AI_PROVIDER=siliconflow
REACT_APP_SILICONFLOW_API_KEY=sk-你的密钥
REACT_APP_ENABLE_AI=true
REACT_APP_AI_STRICT_MODE=false

# API配置
REACT_APP_API_URL=http://localhost:8000
REACT_APP_USE_MOCK=false
```

### 步骤2：启动后端服务

```bash
# 终端1：启动后端
cd server
python sqlite_server.py

# 应该看到：
# INFO: Uvicorn running on http://0.0.0.0:8000
```

### 步骤3：启动前端

```bash
# 终端2：启动前端
cd client
npm start

# 应该看到：
# webpack compiled successfully
# 自动打开 http://localhost:3001
```

### 步骤4：测试功能

#### 测试AI功能

1. 打开浏览器控制台（F12）
2. 输入以下代码：

```javascript
// 测试AI配置
console.log('AI Provider:', process.env.REACT_APP_AI_PROVIDER);
console.log('AI Enabled:', process.env.REACT_APP_ENABLE_AI);

// 测试AI对话（需要先导入服务）
// 在AI助手界面输入：创建一个紧急的前端优化任务
```

#### 测试新建项目

1. 点击"新建项目"按钮
2. 填写项目信息：
   - 项目名称：测试项目
   - 描述：这是一个测试项目
3. 点击"创建"
4. 检查是否成功创建

**验证方法**：
```bash
# 检查数据库
cd server
python -c "
import sqlite3
conn = sqlite3.connect('data/epc_system.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM projects')
print('项目列表:', cursor.fetchall())
conn.close()
"
```

---

## 🔧 详细配置说明

### AI服务配置

系统已集成以下AI服务（按推荐顺序）：

#### 1. 硅基流动（推荐）⭐⭐⭐⭐⭐
- **费用**：完全免费
- **注册**：https://cloud.siliconflow.cn/
- **模型**：Qwen2.5-7B-Instruct
- **限制**：无限制
- **速度**：快（国内服务器）

```bash
REACT_APP_AI_PROVIDER=siliconflow
REACT_APP_SILICONFLOW_API_KEY=sk-your-key
```

#### 2. DeepSeek ⭐⭐⭐⭐
- **费用**：¥1/百万tokens
- **注册**：https://platform.deepseek.com/
- **模型**：deepseek-chat
- **限制**：需要充值
- **速度**：快

```bash
REACT_APP_AI_PROVIDER=deepseek
REACT_APP_DEEPSEEK_API_KEY=sk-your-key
```

#### 3. OpenAI GPT-4 ⭐⭐⭐
- **费用**：$0.03/1K tokens
- **注册**：https://platform.openai.com/
- **模型**：gpt-4-turbo-preview
- **限制**：需要国外信用卡
- **速度**：中等（需要代理）

```bash
REACT_APP_AI_PROVIDER=openai
REACT_APP_OPENAI_API_KEY=sk-your-key
```

#### 4. 本地模拟（降级方案）⭐⭐
- **费用**：免费
- **功能**：基于规则的简单AI
- **限制**：功能有限
- **速度**：极快

```bash
REACT_APP_AI_PROVIDER=local
```

### API连接配置

#### 开发环境

```bash
# client/.env.local
REACT_APP_API_URL=http://localhost:8000
REACT_APP_USE_MOCK=false
```

#### 生产环境（Render）

```bash
# 在Render控制台配置环境变量
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_USE_MOCK=false
REACT_APP_AI_PROVIDER=siliconflow
REACT_APP_SILICONFLOW_API_KEY=sk-your-key
```

---

## 🐛 常见问题

### Q1: AI功能不工作

**检查清单**：
1. ✅ 是否配置了API密钥？
2. ✅ 是否重启了前端服务？
3. ✅ 浏览器控制台是否有错误？

**解决方法**：
```bash
# 检查环境变量
cd client
cat .env.local | grep AI

# 重启前端
npm start
```

### Q2: 新建项目失败

**检查清单**：
1. ✅ 后端服务是否运行？
2. ✅ API地址是否正确？
3. ✅ 是否禁用了Mock？

**解决方法**：
```bash
# 测试后端API
curl -X POST http://localhost:8000/api/v1/projects/ \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","description":"测试"}'

# 应该返回：{"id":"PROJ-001",...}
```

### Q3: 硅基流动API调用失败

**可能原因**：
- API密钥错误
- 网络问题
- 配额用完

**解决方法**：
1. 检查API密钥是否正确
2. 登录控制台查看使用情况
3. 检查网络连接

### Q4: 数据库不存在

**解决方法**：
```bash
cd server
python -c "
from database import db
db.init_database()
print('数据库初始化完成')
"
```

---

## 📊 功能验证清单

### AI功能测试

- [ ] AI对话正常工作
- [ ] 任务解析功能正常
- [ ] 进度预测功能正常
- [ ] 风险识别功能正常
- [ ] 资源优化建议正常

### 项目管理测试

- [ ] 新建项目成功
- [ ] 编辑项目成功
- [ ] 删除项目成功
- [ ] 项目列表显示正常
- [ ] 数据持久化正常

### 系统测试

- [ ] 前端启动正常
- [ ] 后端启动正常
- [ ] API连接正常
- [ ] 数据库正常
- [ ] 无控制台错误

---

## 🚀 部署到Render

### 1. 配置环境变量

在Render控制台添加：

```
REACT_APP_AI_PROVIDER=siliconflow
REACT_APP_SILICONFLOW_API_KEY=sk-your-key
REACT_APP_ENABLE_AI=true
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_USE_MOCK=false
```

### 2. 推送代码

```bash
git add .
git commit -m "feat: 集成真实AI服务和修复项目创建"
git push origin main
```

### 3. 等待自动部署

Render会自动检测更新并部署（3-5分钟）

---

## 💡 最佳实践

### 1. AI使用建议

- ✅ 开发环境使用硅基流动（免费）
- ✅ 生产环境可选DeepSeek（便宜）
- ✅ 启用本地降级（提高可用性）
- ❌ 不要在前端暴露API密钥（使用环境变量）

### 2. 数据管理建议

- ✅ 定期备份数据库
- ✅ 使用事务处理
- ✅ 添加错误处理
- ❌ 不要在生产环境使用Mock数据

### 3. 性能优化建议

- ✅ 启用API缓存
- ✅ 使用懒加载
- ✅ 压缩静态资源
- ✅ 启用CDN

---

## 📞 获取帮助

### 官方文档

- 硅基流动：https://docs.siliconflow.cn/
- DeepSeek：https://platform.deepseek.com/docs
- FastAPI：https://fastapi.tiangolo.com/
- React：https://react.dev/

### 常用命令

```bash
# 查看日志
cd server && python sqlite_server.py  # 后端日志
cd client && npm start  # 前端日志

# 清理缓存
cd client && rm -rf node_modules/.cache

# 重置数据库
cd server && rm data/epc_system.db && python -c "from database import db; db.init_database()"

# 检查端口占用
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Mac/Linux
```

---

**创建时间**：2025-12-01  
**预计修复时间**：5-10分钟  
**难度**：⭐⭐（简单）
