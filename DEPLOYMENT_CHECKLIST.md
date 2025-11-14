# 生产环境部署检查清单

## 📋 部署前检查

### 1. 代码准备 ✅
- [ ] 代码已提交到Git
- [ ] 所有测试已通过
- [ ] 代码已审查
- [ ] 版本号已更新

### 2. 环境配置 ✅
- [ ] 复制`.env.production.example`为`.env.production`
- [ ] 修改所有`CHANGE_THIS`配置项
- [ ] 设置强密码（SECRET_KEY, JWT_SECRET, REDIS_PASSWORD）
- [ ] 配置正确的域名和CORS
- [ ] 验证数据库连接字符串

### 3. SSL证书 ✅
- [ ] 生产环境使用Let's Encrypt或其他CA证书
- [ ] 证书文件放置在`ssl/`目录
- [ ] 验证证书有效期
- [ ] 配置自动续期

### 4. 服务器准备 ✅
- [ ] 服务器规格满足要求（4核8G+）
- [ ] 已安装Docker和Docker Compose
- [ ] 防火墙已配置（开放80, 443端口）
- [ ] 域名DNS已指向服务器IP
- [ ] 系统时区已设置（Asia/Shanghai）

### 5. 安全配置 ✅
- [ ] 修改默认密码
- [ ] 配置速率限制
- [ ] 启用Fail2Ban
- [ ] 配置SSH密钥登录
- [ ] 禁用root登录
- [ ] 配置防火墙规则

---

## 🚀 部署步骤

### 步骤1: 准备服务器

```bash
# SSH登录服务器
ssh user@your-server

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 步骤2: 上传代码

```bash
# 方式1: Git克隆
git clone https://your-repo/epc-project.git /opt/epc-project
cd /opt/epc-project

# 方式2: 直接上传
scp -r ./xiangmu2.0 user@your-server:/opt/epc-project
```

### 步骤3: 配置环境

```bash
cd /opt/epc-project

# 复制环境变量模板
cp .env.production.example .env.production

# 编辑环境变量
nano .env.production

# 创建必要目录
mkdir -p data logs backups ssl
mkdir -p volumes/{redis,nginx_cache,prometheus,grafana}

# 设置权限
chmod 700 data logs backups
```

### 步骤4: 配置SSL

```bash
# 使用Let's Encrypt
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
sudo chown -R $USER:$USER ./ssl/

# 设置自动续期
sudo crontab -e
# 添加: 0 0 * * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /opt/epc-project/ssl/
```

### 步骤5: 执行部署

```bash
# 使用一键部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 或手动执行
docker-compose -f docker-compose.prod.yml up -d --build
```

### 步骤6: 验证部署

```bash
# 检查容器状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 健康检查
curl https://yourdomain.com/health

# 测试API
curl https://yourdomain.com/api/v1/projects
```

---

## ✅ 部署后检查

### 1. 功能测试
- [ ] 登录功能正常
- [ ] 项目创建/编辑正常
- [ ] 甘特图加载正常
- [ ] 数据持久化正常
- [ ] 文件上传正常

### 2. 性能测试
- [ ] 首页加载时间 < 2秒
- [ ] API响应时间 < 500ms
- [ ] 并发100用户无问题

### 3. 安全测试
- [ ] HTTPS证书有效
- [ ] HTTP自动跳转HTTPS
- [ ] 安全头部已配置
- [ ] 速率限制生效
- [ ] CORS正确配置

### 4. 监控配置
- [ ] Prometheus正常运行
- [ ] Grafana可访问
- [ ] 日志正常写入
- [ ] 备份任务正常

---

## 📊 性能指标

### 预期性能
- **可用性**: 99.9%
- **响应时间**: < 200ms (p90)
- **并发能力**: 1000+ req/s
- **首屏加载**: < 1.5秒

### 资源使用
- **CPU**: < 50% (正常负载)
- **内存**: < 70%
- **磁盘**: < 80%
- **网络**: < 100Mbps

---

## 🔧 常见问题

### Q1: 容器无法启动
```bash
# 查看详细日志
docker-compose -f docker-compose.prod.yml logs epc-app

# 检查配置
docker-compose -f docker-compose.prod.yml config

# 检查端口占用
netstat -tulpn | grep -E '(80|443|8000)'
```

### Q2: SSL证书错误
```bash
# 验证证书
openssl x509 -in ssl/fullchain.pem -text -noout

# 检查证书权限
ls -la ssl/

# 重新获取证书
certbot renew --force-renewal
```

### Q3: 数据库连接失败
```bash
# 检查数据库文件
ls -la data/

# 查看数据库日志
docker-compose -f docker-compose.prod.yml logs epc-app | grep database

# 手动连接测试
docker exec -it epc-app sqlite3 /app/data/epc_project.db ".tables"
```

### Q4: Redis连接失败
```bash
# 检查Redis状态
docker-compose -f docker-compose.prod.yml ps redis

# 测试Redis连接
docker exec -it epc-redis redis-cli ping

# 查看Redis日志
docker-compose -f docker-compose.prod.yml logs redis
```

---

## 📈 监控和维护

### 日常监控
```bash
# 查看容器状态
docker-compose -f docker-compose.prod.yml ps

# 查看资源使用
docker stats

# 查看日志
tail -f logs/epc.log
tail -f logs/nginx/access.log
```

### 定期维护
```bash
# 每天：查看日志和监控
# 每周：更新系统和容器
# 每月：检查备份和证书

# 更新脚本
./scripts/update.sh

# 手动备份
tar -czf backups/manual_backup_$(date +%Y%m%d).tar.gz data/
```

---

## 🆘 紧急回滚

### 快速回滚步骤
```bash
# 1. 停止当前服务
docker-compose -f docker-compose.prod.yml down

# 2. 恢复备份
tar -xzf backups/epc_backup_YYYYMMDD_HHMMSS.tar.gz

# 3. 切换到旧版本
git checkout <previous-commit>

# 4. 重新启动
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 支持联系

**技术支持**:
- 文档: 查看`PRODUCTION_DEPLOYMENT_GUIDE.md`
- 日志: 查看`logs/`目录
- 监控: http://your-server:9090 (Prometheus)

---

**清单完成时间**: 2025年11月13日  
**适用版本**: EPC v2.0+  
**下次审查**: 部署前
