# 项目结构说明

## 目录树

```
xuanxing/
├── frontend/                      # 前端React应用
│   ├── src/
│   │   ├── components/           # React组件
│   │   │   ├── CableInputForm.tsx      # 参数输入表单
│   │   │   ├── CableModelViewer.tsx    # 3D模型展示
│   │   │   └── ResultDisplay.tsx       # 结果表格展示
│   │   ├── services/             # API服务层
│   │   │   └── api.ts                  # API客户端
│   │   ├── types/                # TypeScript类型定义
│   │   │   └── index.ts                # 全局类型
│   │   ├── utils/                # 工具函数
│   │   │   └── currentCorrection.ts    # 电流校正计算
│   │   ├── __tests__/            # 单元测试
│   │   │   └── currentCorrection.test.ts
│   │   ├── App.tsx               # 主应用组件
│   │   ├── main.tsx              # 应用入口
│   │   └── setupTests.ts         # 测试配置
│   ├── public/                   # 静态资源
│   ├── package.json              # NPM配置
│   ├── tsconfig.json             # TypeScript配置
│   ├── vite.config.ts            # Vite构建配置
│   ├── jest.config.js            # Jest测试配置
│   ├── Dockerfile                # Docker镜像
│   └── .eslintrc.json            # ESLint配置
│
├── backend/                       # 后端Django应用
│   ├── cable_selector/           # Django项目配置
│   │   ├── __init__.py
│   │   ├── settings.py           # 项目设置
│   │   ├── urls.py               # URL路由
│   │   └── wsgi.py               # WSGI配置
│   ├── cables/                   # 电缆应用
│   │   ├── migrations/           # 数据库迁移
│   │   │   ├── __init__.py
│   │   │   └── 0001_initial.py
│   │   ├── management/           # 管理命令
│   │   │   └── commands/
│   │   │       └── load_initial_data.py
│   │   ├── fixtures/             # 初始数据
│   │   │   └── initial_data.json
│   │   ├── models.py             # 数据模型
│   │   ├── serializers.py        # DRF序列化器
│   │   ├── views.py              # API视图
│   │   ├── urls.py               # URL路由
│   │   ├── calculators.py        # 计算引擎
│   │   ├── admin.py              # 管理后台
│   │   ├── apps.py               # 应用配置
│   │   └── tests.py              # 单元测试
│   ├── requirements.txt          # Python依赖
│   ├── manage.py                 # Django管理脚本
│   ├── Dockerfile                # Docker镜像
│   ├── .env.example              # 环境变量示例
│   ├── .flake8                   # Flake8配置
│   └── pytest.ini                # Pytest配置
│
├── docs/                          # 文档目录
│   ├── API.md                    # API接口文档
│   ├── DEPLOYMENT.md             # 部署指南
│   ├── STANDARDS.md              # 技术标准说明
│   └── QUICKSTART.md             # 快速入门指南
│
├── docker-compose.yml             # Docker编排配置
├── .gitignore                     # Git忽略文件
├── .dockerignore                  # Docker忽略文件
├── README.md                      # 项目说明
├── CONTRIBUTING.md                # 贡献指南
├── CHANGELOG.md                   # 更新日志
├── LICENSE                        # 开源许可证
├── VERSION                        # 版本号
├── Makefile                       # Make命令
├── start.sh                       # Linux/Mac启动脚本
├── start.bat                      # Windows启动脚本
├── setup_database.sh              # Linux/Mac数据库初始化
└── setup_database.bat             # Windows数据库初始化
```

## 核心文件说明

### 前端核心文件

#### `frontend/src/App.tsx`
- **作用**: 主应用组件
- **职责**: 
  - 管理全局状态（计算结果、选中电缆）
  - 协调各子组件交互
  - 处理API调用和错误

#### `frontend/src/components/CableInputForm.tsx`
- **作用**: 参数输入表单
- **功能**:
  - 电压、电流、长度等参数输入
  - 表单验证
  - 提交计算请求

#### `frontend/src/components/CableModelViewer.tsx`
- **作用**: 3D电缆模型展示
- **技术**: Three.js + @react-three/fiber
- **功能**:
  - 渲染电缆结构（导体、绝缘层、护套）
  - 支持旋转、缩放交互
  - 根据材料显示不同颜色

#### `frontend/src/components/ResultDisplay.tsx`
- **作用**: 结果表格展示
- **功能**:
  - 显示推荐电缆列表
  - 高亮最优方案
  - 显示详细参数

#### `frontend/src/services/api.ts`
- **作用**: API客户端
- **功能**:
  - 封装Axios请求
  - 统一错误处理
  - 提供类型安全的API调用

#### `frontend/src/utils/currentCorrection.ts`
- **作用**: 电流校正计算工具
- **功能**:
  - 温度校正系数计算
  - 敷设方式校正系数计算
  - 综合校正载流量计算

### 后端核心文件

#### `backend/cables/models.py`
- **作用**: 数据模型
- **模型**:
  - `CableSpec`: 电缆规格表

#### `backend/cables/calculators.py`
- **作用**: 计算引擎
- **函数**:
  - `calculate_cross_section()`: 电缆选型计算
  - `calculate_voltage_drop()`: 电压降计算
  - `get_temp_correction()`: 温度校正
  - `get_grouping_correction()`: 敷设校正

#### `backend/cables/views.py`
- **作用**: API视图
- **端点**:
  - `POST /api/calculate/`: 计算电缆选型
  - `GET /api/cables/`: 获取电缆列表
  - `GET /api/cables/{id}/`: 获取单个电缆

#### `backend/cables/serializers.py`
- **作用**: 数据序列化
- **序列化器**:
  - `CableSpecSerializer`: 电缆规格
  - `CableCalculationRequestSerializer`: 计算请求
  - `CableResultSerializer`: 计算结果

#### `backend/cables/fixtures/initial_data.json`
- **作用**: 初始数据
- **内容**: 12种常用电缆规格
- **加载**: `python manage.py load_initial_data`

### 配置文件

#### `docker-compose.yml`
- **作用**: Docker服务编排
- **服务**:
  - `web`: 前端React应用（端口3000）
  - `api`: 后端Django应用（端口8000）
  - `db`: PostgreSQL数据库（端口5432）

#### `frontend/vite.config.ts`
- **作用**: Vite构建配置
- **配置**: 开发服务器、插件等

#### `frontend/tsconfig.json`
- **作用**: TypeScript编译配置
- **配置**: 编译选项、类型检查级别

#### `backend/cable_selector/settings.py`
- **作用**: Django项目设置
- **配置**: 数据库、CORS、REST Framework等

## 数据流

### 计算流程

```
用户输入参数
    ↓
CableInputForm
    ↓
App.handleSubmit()
    ↓
api.calculateCable()
    ↓
POST /api/calculate/
    ↓
calculate_cable() view
    ↓
calculate_cross_section()
    ├─ get_temp_correction()
    ├─ get_grouping_correction()
    └─ calculate_voltage_drop()
    ↓
返回推荐电缆列表
    ↓
App更新state
    ↓
ResultDisplay显示结果
    +
CableModelViewer显示3D模型
```

### 数据库查询流程

```
calculate_cross_section()
    ↓
CableSpec.objects.filter()
    - rated_voltage >= 输入电压
    - max_temp >= 环境温度 + 30
    ↓
校正载流量计算
    ↓
过滤满足要求的电缆
    ↓
计算电压降
    ↓
排序返回
```

## 技术栈概览

### 前端技术栈
- **框架**: React 18
- **语言**: TypeScript
- **构建**: Vite
- **UI库**: Material-UI
- **3D**: Three.js + @react-three/fiber
- **HTTP**: Axios
- **测试**: Jest + Testing Library

### 后端技术栈
- **框架**: Django 4.2
- **API**: Django REST Framework
- **数据库**: PostgreSQL 14
- **验证**: Pydantic
- **服务器**: Gunicorn
- **测试**: Django Test + Pytest

### DevOps
- **容器**: Docker + Docker Compose
- **反向代理**: Nginx
- **代码质量**: ESLint + Flake8

## 开发工作流

### 添加新功能

1. **前端**:
   ```bash
   cd frontend
   # 创建新组件
   touch src/components/NewFeature.tsx
   # 添加类型定义
   # 编辑 src/types/index.ts
   # 添加测试
   touch src/__tests__/NewFeature.test.tsx
   ```

2. **后端**:
   ```bash
   cd backend
   # 修改模型（如需要）
   # 编辑 cables/models.py
   python manage.py makemigrations
   python manage.py migrate
   # 添加API端点
   # 编辑 cables/views.py
   # 添加测试
   # 编辑 cables/tests.py
   ```

### 运行测试

```bash
# 前端测试
cd frontend
npm test

# 后端测试
cd backend
python manage.py test
# 或使用pytest
pytest

# 所有测试
make test
```

### 代码检查

```bash
# 前端
cd frontend
npm run lint

# 后端
cd backend
flake8
```

## 扩展点

### 添加新的电缆类型

1. 在管理后台添加规格
2. 或编辑 `backend/cables/fixtures/initial_data.json`
3. 运行 `python manage.py load_initial_data`

### 添加新的计算参数

1. 修改 `frontend/src/types/index.ts`
2. 更新 `CableInputForm.tsx`
3. 修改 `backend/cables/serializers.py`
4. 更新 `calculators.py` 中的计算逻辑

### 集成外部API

1. 在 `backend/cables/` 创建新的服务模块
2. 添加配置到 `settings.py`
3. 在 `views.py` 中调用

### 添加报告功能

1. 安装 `reportlab`
2. 创建 `backend/cables/report_generator.py`
3. 添加新的API端点
4. 前端添加下载按钮

## 性能优化建议

1. **前端**:
   - 使用React.memo()缓存组件
   - 实现虚拟滚动（大数据量）
   - 启用代码分割

2. **后端**:
   - 添加Redis缓存
   - 使用数据库索引
   - 实现查询优化

3. **部署**:
   - 启用Nginx缓存
   - 使用CDN加速静态资源
   - 配置数据库连接池

## 安全考虑

1. 定期更新依赖
2. 使用环境变量管理敏感信息
3. 启用HTTPS
4. 实施API速率限制
5. 添加用户认证（如需要）

