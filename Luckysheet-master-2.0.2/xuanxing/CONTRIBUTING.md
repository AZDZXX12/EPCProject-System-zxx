# 贡献指南

感谢您对电缆选型工具项目的关注！

## 开发环境设置

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

### 后端开发

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py load_initial_data
python manage.py runserver
```

## 代码规范

### TypeScript/React
- 使用TypeScript严格模式
- 遵循React Hooks最佳实践
- 组件使用函数式写法
- 类型定义放在 `types/` 目录

### Python/Django
- 遵循PEP 8代码规范
- 使用类型注解
- 文档字符串使用Google风格
- 所有计算函数需要单元测试

## 提交规范

### Commit Message格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type类型：**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例：**
```
feat(calculator): 添加电缆温度补偿计算

实现IEC 60512标准的温度校正系数计算功能

Closes #123
```

## Pull Request流程

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 测试要求

### 前端测试
```bash
npm test
```

### 后端测试
```bash
python manage.py test
```

**测试覆盖率要求：**
- 核心计算函数：100%
- API接口：>90%
- 工具函数：>80%

## 问题反馈

请使用GitHub Issues提交bug或功能建议，包含：
1. 问题描述
2. 复现步骤
3. 预期行为
4. 实际行为
5. 环境信息（浏览器、操作系统等）

## License

通过贡献代码，您同意您的贡献将遵循MIT许可证。

