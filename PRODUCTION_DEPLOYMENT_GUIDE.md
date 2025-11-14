# EPC项目管理系统 - 生产环境部署指南

## 🎯 部署准备清单

### ✅ 已完成
- [x] Docker多阶段构建
- [x] Docker Compose配置
- [x] Nginx反向代理
- [x] Redis缓存
- [x] 健康检查
- [x] 日志配置

### 🚀 需要优化
- [ ] 环境变量管理
- [ ] SSL/HTTPS配置
- [ ] CI/CD自动化
- [ ] 数据库备份
- [ ] 监控告警
- [ ] 性能调优
- [ ] 安全加固

---

## 📋 部署前优化建议

### 1. 环境变量管理 ⭐⭐⭐⭐⭐

**当前问题：** 缺少`.env`文件管理

**优化方案：**

#### `.env.production` (生产环境)
```bash
# 应用配置
NODE_ENV=production
APP_NAME=EPC项目管理系统
APP_VERSION=2.0.0

# 后端配置
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# 数据库配置
DATABASE_URL=sqlite:///./data/epc_project.db
DATABASE_BACKUP_ENABLED=true
DATABASE_BACKUP_INTERVAL=86400

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password
REDIS_DB=0

# 安全配置
SECRET_KEY=your_super_secret_key_change_in_production
JWT_SECRET=your_jwt_secret_change_in_production
JWT_EXPIRATION=7200
ALLOWED_ORIGINS=https://yourdomain.com

# CORS配置
CORS_ENABLED=true
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]

# 日志配置
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=/app/logs/epc.log

# 监控配置
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090

# 邮件配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
SMTP_FROM=noreply@yourdomain.com

# 对象存储（可选）
S3_ENABLED=false
S3_BUCKET=epc-uploads
S3_REGION=us-east-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# 性能配置
MAX_UPLOAD_SIZE=50M
REQUEST_TIMEOUT=30
CACHE_TTL=3600

# 安全配置
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# 备份配置
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=epc-backups
```

#### `.env.example` (示例模板)
```bash
# 复制此文件为 .env.production 并填写实际值

# 应用配置
NODE_ENV=production
APP_NAME=EPC项目管理系统

# 数据库（必填）
DATABASE_URL=sqlite:///./data/epc_project.db

# 安全密钥（必填，请务必修改！）
SECRET_KEY=CHANGE_THIS_IN_PRODUCTION
JWT_SECRET=CHANGE_THIS_IN_PRODUCTION

# 域名配置（必填）
ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Dockerfile优化 ⭐⭐⭐⭐⭐

**优化后的Dockerfile：**
```dockerfile
# ==========================================
# 阶段1: 前端构建
# ==========================================
FROM node:18-alpine AS frontend-builder

# 设置npm镜像（加速国内构建）
RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app/client

# 复制依赖文件并安装
COPY client/package*.json ./
RUN npm ci --only=production --ignore-scripts

# 复制源码并构建
COPY client/ ./
RUN npm run build

# 优化：删除源码，只保留构建产物
RUN rm -rf src node_modules

# ==========================================
# 阶段2: 后端构建
# ==========================================
FROM python:3.11-slim AS backend

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# 复制并安装Python依赖
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install gunicorn

# 复制后端源码
COPY server/ ./

# 从前端构建复制静态文件
COPY --from=frontend-builder /app/client/build ./static

# 创建必要目录
RUN mkdir -p /app/data /app/logs /app/backups

# 创建非root用户（安全）
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 生产环境启动命令（使用Gunicorn）
CMD ["gunicorn", "sqlite-server:app", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--timeout", "120", \
     "--keep-alive", "5", \
     "--access-logfile", "/app/logs/access.log", \
     "--error-logfile", "/app/logs/error.log", \
     "--log-level", "info"]
```

### 3. Docker Compose生产版 ⭐⭐⭐⭐⭐

**优化后的docker-compose.prod.yml：**
```yaml
version: '3.8'

services:
  # 主应用
  epc-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: epc-app
    restart: always
    env_file:
      - .env.production
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./backups:/app/backups
    networks:
      - epc-network
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: epc-redis
    restart: always
    command: >
      redis-server
      --appendonly yes
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - epc-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: epc-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
      - nginx_cache:/var/cache/nginx
    networks:
      - epc-network
    depends_on:
      epc-app:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  # 数据库自动备份
  backup:
    image: alpine:latest
    container_name: epc-backup
    restart: always
    volumes:
      - ./data:/data:ro
      - ./backups:/backups
    networks:
      - epc-network
    command: >
      sh -c "
        while true; do
          echo '[Backup] Starting database backup...';
          timestamp=$$(date +%Y%m%d_%H%M%S);
          tar -czf /backups/epc_backup_$$timestamp.tar.gz /data;
          find /backups -name 'epc_backup_*.tar.gz' -mtime +30 -delete;
          echo '[Backup] Backup completed: epc_backup_$$timestamp.tar.gz';
          sleep 86400;
        done
      "

networks:
  epc-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16

volumes:
  redis_data:
    driver: local
  nginx_cache:
    driver: local
```

### 4. Nginx生产配置 ⭐⭐⭐⭐⭐

**优化后的nginx.prod.conf：**
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format json_combined escape=json
    '{'
        '"time_local":"$time_local",'
        '"remote_addr":"$remote_addr",'
        '"request":"$request",'
        '"status":$status,'
        '"body_bytes_sent":$body_bytes_sent,'
        '"request_time":$request_time,'
        '"upstream_response_time":"$upstream_response_time",'
        '"http_user_agent":"$http_user_agent"'
    '}';

    access_log /var/log/nginx/access.log json_combined;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;
    client_body_buffer_size 128k;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # 缓存配置
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;
    proxy_cache_key "$scheme$request_method$host$request_uri";

    # 速率限制
    limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    # 上游服务器
    upstream epc_backend {
        server epc-app:8000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP重定向到HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        
        # Let's Encrypt验证
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS主配置
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL证书
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_trusted_certificate /etc/nginx/ssl/chain.pem;

        # SSL配置（A+级别）
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_stapling on;
        ssl_stapling_verify on;

        # 安全头部
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

        # 静态文件缓存（1年）
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://epc_backend;
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # API路由（有缓存）
        location /api/ {
            limit_req zone=api burst=40 nodelay;
            limit_conn addr 10;

            # 缓存GET请求（5分钟）
            proxy_cache api_cache;
            proxy_cache_methods GET HEAD;
            proxy_cache_valid 200 5m;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            proxy_cache_background_update on;
            proxy_cache_lock on;
            add_header X-Cache-Status $upstream_cache_status;

            proxy_pass http://epc_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # 超时
            proxy_connect_timeout 10s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # 登录接口（严格限制）
        location /api/v1/auth/login {
            limit_req zone=login burst=3 nodelay;
            
            proxy_pass http://epc_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 健康检查
        location /health {
            proxy_pass http://epc_backend;
            access_log off;
        }

        # WebSocket支持
        location /ws {
            proxy_pass http://epc_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 默认路由
        location / {
            proxy_pass http://epc_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## 🚀 部署步骤

### 1. 准备服务器

**推荐配置：**
- CPU: 4核心
- 内存: 8GB
- 磁盘: 50GB SSD
- 系统: Ubuntu 22.04 LTS

**安装依赖：**
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 配置环境

```bash
# 克隆代码
git clone https://your-repo/epc-project.git
cd epc-project

# 配置环境变量
cp .env.example .env.production
nano .env.production  # 修改配置

# 创建必要目录
mkdir -p data logs backups ssl

# 设置权限
chmod 700 data logs backups
```

### 3. SSL证书配置

**使用Let's Encrypt（免费）：**
```bash
# 安装Certbot
sudo apt install certbot -y

# 获取证书
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your@email.com \
  --agree-tos

# 复制证书
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/chain.pem ./ssl/

# 设置自动续期
sudo crontab -e
# 添加: 0 0 * * * certbot renew --quiet
```

### 4. 启动服务

```bash
# 构建并启动
docker-compose -f docker-compose.prod.yml up -d --build

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 检查状态
docker-compose -f docker-compose.prod.yml ps
```

### 5. 验证部署

```bash
# 健康检查
curl https://yourdomain.com/health

# API测试
curl https://yourdomain.com/api/v1/projects

# SSL测试
curl -I https://yourdomain.com
```

---

## 📊 监控配置

### Prometheus配置

**monitoring/prometheus.yml：**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # 应用监控
  - job_name: 'epc-app'
    static_configs:
      - targets: ['epc-app:8000']

  # Nginx监控
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']

  # Redis监控
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:9121']

  # Node Exporter
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

### 启用监控

```bash
# 启动监控服务
docker-compose --profile monitoring up -d

# 访问Grafana
open http://your-server:3000
# 默认登录: admin/admin123
```

---

## 🔒 安全加固

### 1. 防火墙配置

```bash
# 安装UFW
sudo apt install ufw -y

# 允许SSH
sudo ufw allow 22/tcp

# 允许HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 2. Fail2Ban配置

```bash
# 安装Fail2Ban
sudo apt install fail2ban -y

# 配置Nginx防护
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 5
findtime = 600
bantime = 3600
```

### 3. 定期更新

```bash
# 创建更新脚本
cat > update.sh << 'EOF'
#!/bin/bash
echo "Starting system update..."
sudo apt update && sudo apt upgrade -y
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
docker system prune -f
echo "Update completed!"
EOF

chmod +x update.sh

# 设置定期更新（每周日凌晨3点）
sudo crontab -e
# 添加: 0 3 * * 0 /path/to/update.sh >> /var/log/system-update.log 2>&1
```

---

## 📦 备份恢复

### 自动备份脚本

**backup.sh：**
```bash
#!/bin/bash
BACKUP_DIR="/app/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="epc_backup_${TIMESTAMP}.tar.gz"

echo "[$(date)] Starting backup..."

# 备份数据库
tar -czf ${BACKUP_DIR}/${BACKUP_FILE} /app/data

# 上传到S3（可选）
# aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE} s3://your-bucket/backups/

# 保留最近30天的备份
find ${BACKUP_DIR} -name "epc_backup_*.tar.gz" -mtime +30 -delete

echo "[$(date)] Backup completed: ${BACKUP_FILE}"
```

### 恢复数据

```bash
# 停止服务
docker-compose -f docker-compose.prod.yml down

# 恢复备份
tar -xzf backups/epc_backup_YYYYMMDD_HHMMSS.tar.gz -C ./

# 重启服务
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎯 性能调优建议

### 1. 数据库优化

```python
# server/sqlite-server.py
import sqlite3

# 启用WAL模式（提升并发）
conn.execute("PRAGMA journal_mode=WAL")
conn.execute("PRAGMA synchronous=NORMAL")
conn.execute("PRAGMA cache_size=10000")
conn.execute("PRAGMA temp_store=MEMORY")
```

### 2. Redis优化

```bash
# redis.conf
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. Nginx缓存

```nginx
# 启用缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g;
proxy_cache my_cache;
proxy_cache_valid 200 10m;
```

---

## 📈 预期效果

完成所有优化后：

- ✅ **可用性**: 99.9%
- ✅ **响应时间**: < 200ms (90th percentile)
- ✅ **并发能力**: 1000+ req/s
- ✅ **安全等级**: A+
- ✅ **自动化**: 100%
- ✅ **可监控**: 完整覆盖

---

## 📞 故障排查

### 常见问题

**1. 容器无法启动**
```bash
# 查看日志
docker-compose logs epc-app

# 检查端口占用
netstat -tulpn | grep 8000
```

**2. SSL证书问题**
```bash
# 验证证书
openssl x509 -in ssl/fullchain.pem -text -noout

# 续期证书
certbot renew
```

**3. 性能问题**
```bash
# 查看资源使用
docker stats

# 查看慢查询
tail -f logs/epc.log | grep "slow"
```

---

**部署指南完成时间**: 2025年11月13日  
**适用版本**: EPC v2.0+  
**维护状态**: ✅ 生产就绪
