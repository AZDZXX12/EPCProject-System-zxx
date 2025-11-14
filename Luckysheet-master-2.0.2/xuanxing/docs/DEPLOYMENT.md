# 部署指南

本文档介绍如何在不同环境中部署电缆选型工具。

## Docker部署（推荐）

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 快速开始

#### Windows

双击运行 `start.bat` 或在命令行中执行：

```cmd
start.bat
```

#### Linux/Mac

```bash
chmod +x start.sh
./start.sh
```

或手动执行：

```bash
docker-compose up -d
```

### 查看服务状态

```bash
docker-compose ps
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web    # 前端
docker-compose logs -f api    # 后端
docker-compose logs -f db     # 数据库
```

### 停止服务

```bash
docker-compose down
```

### 重新构建

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 生产环境部署

### 环境准备

1. **服务器要求**
   - CPU: 2核心以上
   - 内存: 4GB以上
   - 磁盘: 20GB以上
   - 操作系统: Ubuntu 20.04+ / CentOS 7+ / Debian 10+

2. **软件依赖**
   - Docker
   - Docker Compose
   - Nginx（可选，用于反向代理）

### 生产环境配置

#### 1. 修改环境变量

创建 `backend/.env` 文件：

```env
SECRET_KEY=your-very-secret-key-here-change-in-production
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

DB_NAME=cable_selector
DB_USER=postgres
DB_PASSWORD=your-strong-password-here
DB_HOST=db
DB_PORT=5432

CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

创建 `frontend/.env` 文件：

```env
VITE_API_URL=https://yourdomain.com/api
```

#### 2. 修改 docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: ./frontend
    restart: always
    environment:
      - VITE_API_URL=https://yourdomain.com/api
    depends_on:
      - api

  api:
    build: ./backend
    restart: always
    environment:
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      - db
    command: gunicorn cable_selector.wsgi:application --bind 0.0.0.0:8000 --workers 4

  db:
    image: postgres:14
    restart: always
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api

volumes:
  pg_data:
```

#### 3. Nginx配置

创建 `nginx.conf` 文件：

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server web:3000;
    }

    upstream backend {
        server api:8000;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        # 重定向到HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL证书配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # 前端
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # 后端API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 静态文件
        location /static/ {
            alias /app/staticfiles/;
        }
    }
}
```

### 部署步骤

1. **上传代码到服务器**

```bash
# 使用git
git clone <repository-url>
cd xuanxing

# 或使用scp上传
scp -r xuanxing user@server:/path/to/
```

2. **配置环境变量**

```bash
cd xuanxing
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 编辑配置文件
nano backend/.env
nano frontend/.env
```

3. **SSL证书配置（使用Let's Encrypt）**

```bash
# 安装certbot
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d yourdomain.com

# 复制证书到项目目录
mkdir ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
```

4. **启动服务**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

5. **初始化数据库**

```bash
docker-compose exec api python manage.py migrate
docker-compose exec api python manage.py load_initial_data
docker-compose exec api python manage.py createsuperuser
```

6. **收集静态文件**

```bash
docker-compose exec api python manage.py collectstatic --noinput
```

## 手动部署

### 前端部署

```bash
cd frontend
npm install
npm run build

# 部署到Nginx
sudo cp -r dist/* /var/www/html/
```

### 后端部署

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
export DEBUG=False
export SECRET_KEY=your-secret-key

# 数据库迁移
python manage.py migrate
python manage.py load_initial_data
python manage.py collectstatic --noinput

# 使用Gunicorn启动
gunicorn cable_selector.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### 使用Systemd管理服务

创建 `/etc/systemd/system/cable-selector.service`：

```ini
[Unit]
Description=Cable Selector API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/xuanxing/backend
Environment="PATH=/path/to/xuanxing/backend/venv/bin"
ExecStart=/path/to/xuanxing/backend/venv/bin/gunicorn cable_selector.wsgi:application --bind 0.0.0.0:8000 --workers 4

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl start cable-selector
sudo systemctl enable cable-selector
sudo systemctl status cable-selector
```

## 监控和维护

### 日志管理

```bash
# Docker日志
docker-compose logs -f --tail=100

# Systemd日志
sudo journalctl -u cable-selector -f
```

### 数据库备份

```bash
# 导出数据
docker-compose exec db pg_dump -U postgres cable_selector > backup.sql

# 导入数据
docker-compose exec -T db psql -U postgres cable_selector < backup.sql
```

### 性能优化

1. **启用Redis缓存**
2. **配置CDN加速静态资源**
3. **数据库查询优化**
4. **启用Gzip压缩**

## 故障排查

### 常见问题

1. **端口冲突**
   - 检查3000、8000、5432端口是否被占用
   - 修改docker-compose.yml中的端口映射

2. **数据库连接失败**
   - 检查DB_HOST、DB_PASSWORD等环境变量
   - 确认PostgreSQL服务运行正常

3. **静态文件404**
   - 运行 `python manage.py collectstatic`
   - 检查Nginx配置

4. **CORS错误**
   - 检查CORS_ALLOWED_ORIGINS配置
   - 确认前后端URL匹配

## 安全建议

1. 使用强密码
2. 定期更新依赖包
3. 启用HTTPS
4. 配置防火墙规则
5. 定期备份数据库
6. 监控系统日志

