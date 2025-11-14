#!/bin/bash
# ===========================================
# EPC项目管理系统 - 一键部署脚本
# ===========================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要工具
check_prerequisites() {
    log_info "检查必要工具..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装"
        exit 1
    fi
    
    log_info "✅ 工具检查通过"
}

# 创建必要目录
create_directories() {
    log_info "创建必要目录..."
    
    mkdir -p data logs backups ssl
    mkdir -p volumes/redis volumes/nginx_cache volumes/prometheus volumes/grafana
    mkdir -p monitoring/grafana/dashboards monitoring/grafana/datasources
    
    log_info "✅ 目录创建完成"
}

# 检查环境变量文件
check_env_file() {
    log_info "检查环境变量配置..."
    
    if [ ! -f ".env.production" ]; then
        log_warn ".env.production 不存在，从模板创建..."
        cp .env.production.example .env.production
        log_error "请编辑 .env.production 文件，修改所有必要的配置项！"
        exit 1
    fi
    
    # 检查关键配置
    if grep -q "CHANGE_THIS" .env.production; then
        log_error ".env.production 中仍包含默认值，请修改所有 CHANGE_THIS 配置项！"
        exit 1
    fi
    
    log_info "✅ 环境变量检查通过"
}

# 生成SSL证书（自签名，测试用）
generate_ssl_cert() {
    if [ ! -f "ssl/fullchain.pem" ]; then
        log_warn "SSL证书不存在，生成自签名证书（仅用于测试）..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/privkey.pem \
            -out ssl/fullchain.pem \
            -subj "/C=CN/ST=Beijing/L=Beijing/O=EPC/OU=IT/CN=localhost"
        
        cp ssl/fullchain.pem ssl/chain.pem
        
        log_warn "⚠️ 生产环境请使用 Let's Encrypt 或其他CA签发的证书！"
    fi
}

# 备份现有数据
backup_data() {
    if [ -d "data" ] && [ "$(ls -A data)" ]; then
        log_info "备份现有数据..."
        timestamp=$(date +%Y%m%d_%H%M%S)
        tar -czf "backups/pre_deploy_backup_${timestamp}.tar.gz" data/
        log_info "✅ 数据备份完成: pre_deploy_backup_${timestamp}.tar.gz"
    fi
}

# 构建并启动服务
deploy_services() {
    log_info "开始部署服务..."
    
    # 停止旧服务
    log_info "停止旧服务..."
    docker-compose -f docker-compose.prod.yml down || true
    
    # 拉取最新镜像
    log_info "拉取最新镜像..."
    docker-compose -f docker-compose.prod.yml pull || true
    
    # 构建新镜像
    log_info "构建新镜像..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # 启动服务
    log_info "启动服务..."
    docker-compose -f docker-compose.prod.yml up -d
    
    log_info "✅ 服务启动完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    log_info "等待服务启动（30秒）..."
    sleep 30
    
    # 检查容器状态
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log_error "容器未正常启动！"
        docker-compose -f docker-compose.prod.yml logs --tail=50
        exit 1
    fi
    
    # HTTP健康检查
    log_info "检查应用健康状态..."
    for i in {1..10}; do
        if curl -f http://localhost/health &> /dev/null; then
            log_info "✅ 应用健康检查通过"
            return 0
        fi
        log_warn "健康检查失败，重试 ($i/10)..."
        sleep 5
    done
    
    log_error "健康检查失败！"
    docker-compose -f docker-compose.prod.yml logs epc-app --tail=50
    exit 1
}

# 清理旧资源
cleanup() {
    log_info "清理Docker资源..."
    docker system prune -f
    log_info "✅ 清理完成"
}

# 显示部署信息
show_deployment_info() {
    echo ""
    log_info "=========================================="
    log_info "🎉 部署成功！"
    log_info "=========================================="
    echo ""
    log_info "应用地址:"
    log_info "  HTTP:  http://localhost"
    log_info "  HTTPS: https://localhost"
    echo ""
    log_info "监控服务（可选）:"
    log_info "  Prometheus: http://localhost:9090"
    log_info "  Grafana:    http://localhost:3000 (admin/admin123)"
    echo ""
    log_info "查看日志:"
    log_info "  docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    log_info "查看状态:"
    log_info "  docker-compose -f docker-compose.prod.yml ps"
    echo ""
    log_info "停止服务:"
    log_info "  docker-compose -f docker-compose.prod.yml down"
    echo ""
    log_info "=========================================="
}

# 主函数
main() {
    log_info "开始部署 EPC项目管理系统..."
    
    check_prerequisites
    create_directories
    check_env_file
    generate_ssl_cert
    backup_data
    deploy_services
    health_check
    cleanup
    show_deployment_info
}

# 执行主函数
main "$@"
