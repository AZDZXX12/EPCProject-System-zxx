# 快速入门指南

本指南将帮助您在5分钟内启动并运行电缆选型工具。

## 方式一：Docker一键启动（推荐）

### 前置要求
- 已安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Windows 10/11 或 macOS 10.15+ 或 Linux

### 启动步骤

#### Windows用户
1. 双击 `start.bat`
2. 等待服务启动（首次启动约需3-5分钟）
3. 打开浏览器访问 http://localhost:3000

#### Mac/Linux用户
```bash
chmod +x start.sh
./start.sh
```

### 验证安装

访问以下URL确认服务正常：
- 前端界面: http://localhost:3000
- 后端API: http://localhost:8000/api/cables/
- 管理后台: http://localhost:8000/admin

## 方式二：手动安装

### 1. 安装依赖

#### 后端依赖
- Python 3.11+
- PostgreSQL 14+

#### 前端依赖
- Node.js 18+
- npm 或 yarn

### 2. 启动数据库

```bash
# 启动PostgreSQL
# Windows (使用PostgreSQL installer)
# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

创建数据库：
```sql
CREATE DATABASE cable_selector;
CREATE USER postgres WITH PASSWORD 'cable123';
GRANT ALL PRIVILEGES ON DATABASE cable_selector TO postgres;
```

### 3. 启动后端

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 运行迁移
python manage.py migrate

# 加载初始数据
python manage.py load_initial_data

# 启动服务
python manage.py runserver
```

后端将运行在 http://localhost:8000

### 4. 启动前端

打开新的终端窗口：

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 http://localhost:3000

## 第一次使用

### 1. 打开应用

在浏览器中访问 http://localhost:3000

### 2. 输入参数

在左侧表单中输入：
- **额定电压**: 380V
- **负载电流**: 100A
- **线路长度**: 50m
- **环境温度**: 30℃
- **敷设方式**: 桥架敷设

### 3. 查看结果

点击"计算推荐电缆"按钮，系统将：
1. 计算推荐的电缆规格
2. 在中间显示3D电缆模型
3. 在底部显示详细的计算结果

### 4. 理解结果

结果表格包含：
- **型号**: 电缆型号（如YJV-0.6/1kV）
- **截面积**: 导体截面积（mm²）
- **载流量**: 经过温度和敷设方式校正后的载流量
- **电压降**: 在当前长度和负载下的电压降百分比
- **单价**: 每米价格
- **总价**: 总成本

绿色高亮的行是系统推荐的最优方案。

## 常见问题

### Q: Docker启动失败
**A:** 
1. 检查Docker是否正在运行
2. 检查端口3000、8000、5432是否被占用
3. 尝试运行 `docker-compose down` 后重新启动

### Q: 前端无法连接后端
**A:**
1. 确认后端服务正在运行（访问 http://localhost:8000/api/cables/）
2. 检查浏览器控制台的错误信息
3. 确认CORS配置正确

### Q: 数据库连接失败
**A:**
1. 确认PostgreSQL服务正在运行
2. 检查数据库名称、用户名、密码是否正确
3. 查看后端日志获取详细错误信息

### Q: 没有电缆数据
**A:**
运行初始数据加载命令：
```bash
python manage.py load_initial_data
```

### Q: 计算结果为空
**A:**
1. 检查输入参数是否合理
2. 确认数据库中有电缆数据
3. 降低电流要求或增加电缆库规格

## 进阶使用

### 访问管理后台

1. 创建超级用户：
```bash
docker-compose exec api python manage.py createsuperuser
# 或手动方式
python manage.py createsuperuser
```

2. 访问 http://localhost:8000/admin
3. 使用创建的账户登录
4. 可以添加、修改、删除电缆规格

### 添加新的电缆规格

在管理后台中：
1. 点击"电缆规格"
2. 点击"添加电缆规格"
3. 填写所有必填字段
4. 保存

### 导出计算结果

目前版本支持在浏览器中复制表格数据。

PDF导出功能正在开发中。

## 下一步

- 阅读 [API文档](API.md) 了解如何集成
- 阅读 [技术标准](STANDARDS.md) 了解计算依据
- 阅读 [部署指南](DEPLOYMENT.md) 了解生产环境部署
- 查看 [贡献指南](../CONTRIBUTING.md) 了解如何参与开发

## 获取帮助

- 查看 [README.md](../README.md)
- 提交 [GitHub Issue](https://github.com/your-repo/issues)
- 联系开发团队

## 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件

