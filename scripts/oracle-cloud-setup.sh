#!/bin/bash
# ===========================================
# Oracle Cloud 快速配置脚本
# 适用于 Ubuntu 22.04 (ARM/AMD)
# ===========================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================${NC}\n"
}

# 1. 系统更新
setup_system() {
    log_step "步骤 1/8: 更新系统"
    
    log_info "更新软件包列表..."
    sudo apt update
    
    log_info "升级系统软件包..."
    sudo apt upgrade -y
    
    log_info "安装必要工具..."
    sudo apt install -y \
        curl \
        wget \
        git \
        vim \
        htop \
        net-tools \
        ufw \
        fail2ban
    
    log_info "✅ 系统更新完成"
}

# 2. 配置防火墙
setup_firewall() {
    log_step "步骤 2/8: 配置防火墙"
    
    log_info "配置Ubuntu防火墙（UFW）..."
    
    # 允许SSH
    sudo ufw allow 22/tcp
    log_info "✅ 允许 SSH (22)"
    
    # 允许HTTP
    sudo ufw allow 80/tcp
    log_info "✅ 允许 HTTP (80)"
    
    # 允许HTTPS
    sudo ufw allow 443/tcp
    log_info "✅ 允许 HTTPS (443)"
    
    # 启用防火墙
    echo "y" | sudo ufw enable
    
    # 配置Oracle Cloud iptables（重要！）
    log_info "配置 Oracle Cloud iptables..."
    sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
    sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
    sudo iptables-save | sudo tee /etc/iptables/rules.v4
    
    log_info "✅ 防火墙配置完成"
}

# 3. 安装Docker
install_docker() {
    log_step "步骤 3/8: 安装Docker"
    
    if command -v docker &> /dev/null; then
        log_warn "Docker已安装，跳过"
        docker --version
        return
    fi
    
    log_info "下载Docker安装脚本..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    
    log_info "安装Docker..."
    sudo sh get-docker.sh
    
    log_info "配置Docker权限..."
    sudo usermod -aG docker $USER
    
    log_info "启用Docker服务..."
    sudo systemctl enable docker
    sudo systemctl start docker
    
    # 清理安装脚本
    rm get-docker.sh
    
    log_info "✅ Docker安装完成"
    docker --version
}

# 4. 安装Docker Compose
install_docker_compose() {
    log_step "步骤 4/8: 安装Docker Compose"
    
    if command -v docker-compose &> /dev/null; then
        log_warn "Docker Compose已安装，跳过"
        docker-compose --version
        return
    fi
    
    log_info "下载Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    
    log_info "设置执行权限..."
    sudo chmod +x /usr/local/bin/docker-compose
    
    log_info "✅ Docker Compose安装完成"
    docker-compose --version
}

# 5. 配置Swap（增加虚拟内存）
setup_swap() {
    log_step "步骤 5/8: 配置Swap（虚拟内存）"
    
    if swapon --show | grep -q '/swapfile'; then
        log_warn "Swap已配置，跳过"
        free -h
        return
    fi
    
    log_info "创建4GB Swap文件..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    log_info "设置开机自动挂载..."
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    
    log_info "✅ Swap配置完成"
    free -h
}

# 6. 优化系统性能
optimize_system() {
    log_step "步骤 6/8: 优化系统性能"
    
    log_info "配置系统参数..."
    
    cat | sudo tee -a /etc/sysctl.conf << EOF

# Oracle Cloud优化配置
vm.swappiness=10
vm.vfs_cache_pressure=50
net.core.somaxconn=65535
net.ipv4.tcp_max_syn_backlog=8192
net.ipv4.tcp_tw_reuse=1
fs.file-max=65535
EOF
    
    sudo sysctl -p
    
    log_info "✅ 系统优化完成"
}

# 7. 安装SSL证书工具
install_certbot() {
    log_step "步骤 7/8: 安装SSL证书工具（Certbot）"
    
    if command -v certbot &> /dev/null; then
        log_warn "Certbot已安装，跳过"
        return
    fi
    
    log_info "安装Certbot..."
    sudo apt install -y certbot
    
    log_info "✅ Certbot安装完成"
    log_info "使用方法："
    log_info "  sudo certbot certonly --standalone -d yourdomain.com"
}

# 8. 设置自动安全更新
setup_auto_updates() {
    log_step "步骤 8/8: 配置自动安全更新"
    
    log_info "安装unattended-upgrades..."
    sudo apt install -y unattended-upgrades
    
    log_info "配置自动更新..."
    sudo dpkg-reconfigure -plow unattended-upgrades
    
    log_info "✅ 自动更新配置完成"
}

# 显示完成信息
show_completion_info() {
    echo ""
    log_step "🎉 Oracle Cloud服务器配置完成！"
    echo ""
    
    log_info "系统信息："
    echo "  操作系统: $(lsb_release -d | cut -f2)"
    echo "  内核版本: $(uname -r)"
    echo "  CPU架构: $(uname -m)"
    echo ""
    
    log_info "已安装服务："
    echo "  Docker: $(docker --version 2>/dev/null || echo '未安装')"
    echo "  Docker Compose: $(docker-compose --version 2>/dev/null || echo '未安装')"
    echo "  Certbot: $(certbot --version 2>/dev/null || echo '未安装')"
    echo ""
    
    log_info "系统资源："
    echo "  内存使用:"
    free -h | grep -E 'Mem|Swap'
    echo ""
    echo "  磁盘使用:"
    df -h | grep -E '^/dev'
    echo ""
    
    log_info "防火墙状态："
    sudo ufw status | head -10
    echo ""
    
    log_info "下一步操作："
    echo "  1️⃣  重新登录以使Docker权限生效："
    echo "      exit"
    echo "      ssh ubuntu@your-server-ip"
    echo ""
    echo "  2️⃣  克隆项目："
    echo "      git clone https://your-repo/epc-project.git"
    echo "      cd epc-project"
    echo ""
    echo "  3️⃣  配置环境变量："
    echo "      cp .env.production.example .env.production"
    echo "      nano .env.production"
    echo ""
    echo "  4️⃣  部署项目："
    echo "      chmod +x scripts/deploy.sh"
    echo "      ./scripts/deploy.sh"
    echo ""
    echo "  5️⃣  配置SSL证书（如有域名）："
    echo "      sudo certbot certonly --standalone -d yourdomain.com"
    echo ""
    
    log_info "🔗 相关链接："
    echo "  Oracle Cloud控制台: https://cloud.oracle.com/"
    echo "  项目文档: 查看 PRODUCTION_DEPLOYMENT_GUIDE.md"
    echo "  免费托管指南: 查看 FREE_HOSTING_GUIDE.md"
    echo ""
}

# 主函数
main() {
    log_step "Oracle Cloud 服务器快速配置"
    log_info "适用于: Ubuntu 22.04 (ARM/AMD)"
    log_info "预计时间: 5-10分钟"
    echo ""
    
    read -p "是否继续配置? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warn "配置已取消"
        exit 0
    fi
    
    setup_system
    setup_firewall
    install_docker
    install_docker_compose
    setup_swap
    optimize_system
    install_certbot
    setup_auto_updates
    show_completion_info
}

# 执行主函数
main "$@"
