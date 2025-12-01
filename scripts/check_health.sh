#!/bin/bash

# 健康检查脚本

echo "=========================================="
echo "  EPC系统健康检查"
echo "=========================================="
echo ""

# 检查后端
echo "[1/4] 检查后端服务..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ 后端服务正常"
    curl -s http://localhost:8000/health | python -m json.tool
else
    echo "❌ 后端服务异常"
fi
echo ""

# 检查前端
echo "[2/4] 检查前端服务..."
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务异常"
fi
echo ""

# 检查数据库
echo "[3/4] 检查数据库..."
if curl -f http://localhost:8000/api/v1/database/info > /dev/null 2>&1; then
    echo "✅ 数据库连接正常"
    curl -s http://localhost:8000/api/v1/database/info | python -m json.tool
else
    echo "❌ 数据库连接异常"
fi
echo ""

# 检查API
echo "[4/4] 检查API..."
if curl -f http://localhost:8000/api/v1/projects > /dev/null 2>&1; then
    echo "✅ API正常"
else
    echo "❌ API异常"
fi
echo ""

echo "=========================================="
echo "  健康检查完成"
echo "=========================================="
