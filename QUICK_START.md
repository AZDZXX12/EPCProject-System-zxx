# 🚀 EPC系统快速启动指南

## 方式一：一键启动（推荐）

### Windows
```bash
启动EPC系统-优化版.bat
```

### Linux/Mac
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

## 方式二：手动启动

### 1. 启动后端
```bash
cd server
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python sqlite_server.py
```

### 2. 启动前端
```bash
cd client
npm install
npm start
```

## 访问地址

- 前端: http://localhost:3001
- 后端: http://localhost:8000
- API文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

## Docker启动

```bash
# 开发环境
docker-compose up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

## 验证部署

```bash
# 检查健康状态
curl http://localhost:8000/health

# 检查API
curl http://localhost:8000/api/v1/projects

# 检查前端
curl http://localhost:3001
```

## 常见问题

### 端口被占用
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Python虚拟环境问题
```bash
cd server
rm -rf venv
python -m venv venv
```

### Node依赖问题
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

## 性能优化

### 生产构建
```bash
cd client
npm run build:prod
```

### 数据库优化
```bash
# 备份数据库
curl -X POST http://localhost:8000/api/v1/database/backup

# 查看数据库信息
curl http://localhost:8000/api/v1/database/info
```

## 下一步

- 📖 查看 [完整文档](./README.md)
- 🔧 查看 [优化报告](./OPTIMIZATION_REPORT_2025.md)
- 🚢 查看 [部署指南](./PRODUCTION_DEPLOYMENT_GUIDE.md)
