# Makefile for Cable Selector Project

.PHONY: help install start stop restart logs clean test migrate init

help:
	@echo "Cable Selector - 可用命令:"
	@echo "  make install    - 安装所有依赖"
	@echo "  make start      - 启动所有服务"
	@echo "  make stop       - 停止所有服务"
	@echo "  make restart    - 重启所有服务"
	@echo "  make logs       - 查看日志"
	@echo "  make clean      - 清理临时文件"
	@echo "  make test       - 运行测试"
	@echo "  make migrate    - 运行数据库迁移"
	@echo "  make init       - 初始化项目"

install:
	@echo "安装前端依赖..."
	cd frontend && npm install
	@echo "安装后端依赖..."
	cd backend && pip install -r requirements.txt
	@echo "依赖安装完成!"

start:
	@echo "启动服务..."
	docker-compose up -d
	@echo "服务已启动!"
	@echo "前端: http://localhost:3000"
	@echo "后端: http://localhost:8000"

stop:
	@echo "停止服务..."
	docker-compose down
	@echo "服务已停止!"

restart:
	@echo "重启服务..."
	docker-compose restart
	@echo "服务已重启!"

logs:
	docker-compose logs -f

clean:
	@echo "清理临时文件..."
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name node_modules -exec rm -rf {} +
	find . -type d -name dist -exec rm -rf {} +
	@echo "清理完成!"

test:
	@echo "运行后端测试..."
	cd backend && python manage.py test
	@echo "运行前端测试..."
	cd frontend && npm test
	@echo "测试完成!"

migrate:
	@echo "运行数据库迁移..."
	docker-compose exec api python manage.py migrate
	@echo "迁移完成!"

init:
	@echo "初始化项目..."
	docker-compose up -d db
	sleep 5
	docker-compose exec api python manage.py migrate
	docker-compose exec api python manage.py load_initial_data
	@echo "初始化完成!"
	@echo "创建管理员账户:"
	docker-compose exec api python manage.py createsuperuser

build:
	@echo "构建Docker镜像..."
	docker-compose build --no-cache
	@echo "构建完成!"

shell-api:
	docker-compose exec api python manage.py shell

shell-db:
	docker-compose exec db psql -U postgres cable_selector

backup-db:
	@echo "备份数据库..."
	docker-compose exec db pg_dump -U postgres cable_selector > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "备份完成!"

restore-db:
	@echo "恢复数据库..."
	@read -p "请输入备份文件名: " file; \
	docker-compose exec -T db psql -U postgres cable_selector < $$file
	@echo "恢复完成!"

