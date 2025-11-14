#!/bin/bash
# 数据库初始化脚本

echo "======================================"
echo "电缆选型工具 - 数据库初始化"
echo "======================================"

# 等待PostgreSQL启动
echo "等待PostgreSQL启动..."
sleep 5

# 进入后端目录
cd backend

# 运行数据库迁移
echo "运行数据库迁移..."
python manage.py migrate

# 加载初始数据
echo "加载电缆规格数据..."
python manage.py load_initial_data

# 创建超级用户（可选）
echo "是否创建管理员账户？(y/n)"
read -r create_admin

if [ "$create_admin" = "y" ]; then
    python manage.py createsuperuser
fi

echo "======================================"
echo "数据库初始化完成！"
echo "======================================"

