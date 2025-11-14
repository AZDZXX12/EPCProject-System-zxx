#!/bin/bash
# 快速启动脚本（Linux/Mac）

echo "======================================"
echo "启动电缆选型工具"
echo "======================================"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: 未安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: 未安装Docker Compose"
    exit 1
fi

# 启动服务
echo "启动Docker容器..."
docker-compose up -d

echo ""
echo "======================================"
echo "服务启动成功！"
echo "======================================"
echo "前端: http://localhost:3000"
echo "后端API: http://localhost:8000/api"
echo "管理后台: http://localhost:8000/admin"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
echo "======================================"

