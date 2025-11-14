#!/bin/bash
# 纯前端启动脚本（Linux/Mac）

echo "======================================"
echo "启动电缆选型工具（纯前端版本）"
echo "======================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未安装Node.js"
    echo "请从 https://nodejs.org 下载安装"
    exit 1
fi

# 进入前端目录
cd frontend

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "首次运行，正在安装依赖..."
    npm install
fi

# 启动开发服务器
echo ""
echo "启动开发服务器..."
echo ""
npm run dev

