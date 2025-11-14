# 电器电缆选型工具

基于IEC标准的智能电缆选型系统，提供电缆参数计算、3D可视化和选型建议。

## 技术栈

### 前端
- **React 18** + **TypeScript** - 现代化前端框架
- **Material-UI (MUI)** - 工业风格UI组件库
- **Three.js** + **@react-three/fiber** - 3D可视化
- **Vite** - 快速构建工具

### 后端
- **Django 4.2** + **Django REST Framework** - RESTful API
- **PostgreSQL** - 关系型数据库
- **Pydantic** - 数据验证

### 部署
- **Docker** + **Docker Compose** - 容器化部署
- **Nginx** - 反向代理（生产环境）

## 核心功能

### 1. 电缆参数计算
- 基于IEC 60287-1-1标准的载流量计算
- 温度校正系数（IEC 60512）
- 敷设方式校正系数（IEC 60364-5-52）
- 电压降计算

### 2. 3D可视化
- 实时3D电缆结构展示
- 支持旋转、缩放交互
- 根据电缆材料显示不同颜色

### 3. 智能选型
- 自动推荐最优电缆方案
- 提供多个备选方案
- 价格计算和成本分析

## 快速开始

### ⚡ 方式一：纯前端版本（最简单，推荐）

**Windows用户**
```bash
# 双击运行
start-frontend-only.bat
```

**Mac/Linux用户**
```bash
chmod +x start-frontend-only.sh
./start-frontend-only.sh
```

访问: http://localhost:3000

✅ **优点**: 
- 无需Docker
- 无需数据库
- 启动超快
- 所有计算在浏览器完成

📖 详细说明: [README-FRONTEND-ONLY.md](README-FRONTEND-ONLY.md)

---

### 🐳 方式二：完整版（包含后端）

1. **克隆项目**
```bash
git clone <repository-url>
cd xuanxing
```

2. **启动所有服务**
```bash
docker-compose up -d
```

3. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:8000/api
- 管理后台: http://localhost:8000/admin

### 手动安装

#### 前端安装

```bash
cd frontend
npm install
npm run dev
```

#### 后端安装

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置数据库连接等

# 数据库迁移
python manage.py migrate

# 加载初始数据
python manage.py load_initial_data

# 创建超级用户（可选）
python manage.py createsuperuser

# 启动服务
python manage.py runserver
```

## 项目结构

```
xuanxing/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/      # React组件
│   │   │   ├── CableInputForm.tsx
│   │   │   ├── CableModelViewer.tsx
│   │   │   └── ResultDisplay.tsx
│   │   ├── services/        # API服务
│   │   ├── types/           # TypeScript类型定义
│   │   ├── utils/           # 工具函数
│   │   └── __tests__/       # 测试文件
│   ├── package.json
│   └── Dockerfile
├── backend/                  # 后端项目
│   ├── cable_selector/      # Django项目配置
│   ├── cables/              # 电缆应用
│   │   ├── models.py        # 数据模型
│   │   ├── views.py         # 视图
│   │   ├── serializers.py   # 序列化器
│   │   ├── calculators.py   # 计算引擎
│   │   ├── fixtures/        # 初始数据
│   │   └── tests.py         # 测试
│   ├── requirements.txt
│   └── Dockerfile
└── docker-compose.yml        # Docker编排配置
```

## API接口

### 计算电缆选型

**POST** `/api/calculate/`

请求参数：
```json
{
  "voltage": 380,
  "current": 100,
  "length": 50,
  "ambient_temp": 30,
  "installation": "tray"
}
```

响应示例：
```json
[
  {
    "type": "YJV-0.6/1kV",
    "cross_section": 25.0,
    "current_rating": 109.25,
    "voltage_drop": 1.23,
    "price_per_meter": 42.5,
    "insulation_material": "XLPE",
    "shield_type": "copper",
    "insulationColor": "#2E8B57"
  }
]
```

### 获取电缆规格列表

**GET** `/api/cables/`

## 测试

### 前端测试
```bash
cd frontend
npm test
```

### 后端测试
```bash
cd backend
python manage.py test
```

## 计算公式

### 载流量校正
```
I_corrected = I_rated × k_temp × k_group
```

### 温度校正系数
```
k_temp = √[(T_max - T_ambient) / (T_max - T_base)]
```
其中：
- T_max = 90℃（最高工作温度）
- T_base = 30℃（基准温度）

### 电压降计算
```
ΔU% = (√3 × I × L × (R×cosφ + X×sinφ)) / U × 100
```
其中：
- I = 负载电流(A)
- L = 线路长度(km)
- R = 电阻(Ω/km)
- X = 电抗(Ω/km)
- cosφ = 功率因数
- U = 额定电压(V)

## 标准依据

- **IEC 60287-1-1**: 电缆载流量计算
- **IEC 60512**: 温度校正系数
- **IEC 60364-5-52**: 敷设方式校正系数
- **GB/T 50217**: 电力工程电缆设计规范

## 扩展功能

### 供应链集成（待实现）
- 实时价格查询
- 多供应商比价
- 库存查询

### 报告生成（待实现）
- PDF选型报告
- 详细计算过程
- 技术参数表

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue或联系开发团队。

