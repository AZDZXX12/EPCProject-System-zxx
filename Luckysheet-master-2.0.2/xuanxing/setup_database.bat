@echo off
REM Windows数据库初始化脚本

echo ======================================
echo 电缆选型工具 - 数据库初始化
echo ======================================

REM 等待PostgreSQL启动
echo 等待PostgreSQL启动...
timeout /t 5 /nobreak

REM 进入后端目录
cd backend

REM 运行数据库迁移
echo 运行数据库迁移...
python manage.py migrate

REM 加载初始数据
echo 加载电缆规格数据...
python manage.py load_initial_data

REM 创建超级用户（可选）
set /p create_admin="是否创建管理员账户？(y/n): "
if /i "%create_admin%"=="y" (
    python manage.py createsuperuser
)

echo ======================================
echo 数据库初始化完成！
echo ======================================
pause

