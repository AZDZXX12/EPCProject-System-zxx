# 任务分解: [功能名称]

**任务ID**: TASKS-[编号]  
**关联规范**: SPEC-[编号]  
**关联计划**: PLAN-[编号]  
**创建日期**: [日期]  
**总估时**: [N] 小时

---

## 任务说明

本文档将实现计划分解为具体的、可执行的任务。每个任务都有明确的：
- 文件路径
- 依赖关系
- 估计时间
- 验收标准

**标记说明**:
- `[P]` = 可并行执行
- `[CRITICAL]` = 关键路径任务
- `[OPTIONAL]` = 可选任务

---

## 用户故事 #1: [标题]

### Phase 1: 数据模型和服务层

#### Task 1.1: 创建数据模型
- **文件**: `server/app/models/[model_name].py`
- **依赖**: 无
- **估时**: 30 分钟
- **类型**: 后端
- **并行**: 否

**实现内容**:
```python
from sqlalchemy import Column, String, DateTime
from datetime import datetime
from .base import Base

class [ModelName](Base):
    __tablename__ = "[table_name]"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
```

**验收标准**:
- [ ] 模型类定义正确
- [ ] 所有必填字段已定义
- [ ] 索引已创建
- [ ] 关系已定义（如果需要）

---

#### Task 1.2: 创建数据库迁移脚本
- **文件**: `server/migrations/[timestamp]_create_[table].sql`
- **依赖**: Task 1.1
- **估时**: 20 分钟
- **类型**: 后端
- **并行**: 否

**实现内容**:
```sql
CREATE TABLE IF NOT EXISTS [table_name] (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_[table]_name ON [table_name](name);
```

**验收标准**:
- [ ] SQL 语法正确
- [ ] 表结构与模型一致
- [ ] 索引已创建
- [ ] 迁移可回滚

---

#### Task 1.3: 创建 Pydantic Schema
- **文件**: `server/app/schemas/[schema_name].py`
- **依赖**: Task 1.1
- **估时**: 20 分钟
- **类型**: 后端
- **并行**: 可 [P]

**实现内容**:
```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class [SchemaName]Base(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

class [SchemaName]Create([SchemaName]Base):
    pass

class [SchemaName]Update([SchemaName]Base):
    pass

class [SchemaName]([ SchemaName]Base):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

**验收标准**:
- [ ] Schema 定义正确
- [ ] 验证规则完整
- [ ] 继承关系清晰
- [ ] Config 配置正确

---

#### Task 1.4: 实现服务层
- **文件**: `server/app/services/[service_name].py`
- **依赖**: Task 1.1, Task 1.3
- **估时**: 1 小时
- **类型**: 后端
- **并行**: 否

**实现内容**:
```python
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.[model_name] import [ModelName]
from ..schemas.[schema_name] import [SchemaName]Create, [SchemaName]Update

class [ServiceName]:
    @staticmethod
    async def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[[ModelName]]:
        return db.query([ModelName]).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_by_id(db: Session, id: str) -> Optional[[ModelName]]:
        return db.query([ModelName]).filter([ModelName].id == id).first()
    
    @staticmethod
    async def create(db: Session, data: [SchemaName]Create) -> [ModelName]:
        db_obj = [ModelName](**data.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    @staticmethod
    async def update(db: Session, id: str, data: [SchemaName]Update) -> Optional[[ModelName]]:
        db_obj = await [ServiceName].get_by_id(db, id)
        if db_obj:
            for key, value in data.dict(exclude_unset=True).items():
                setattr(db_obj, key, value)
            db.commit()
            db.refresh(db_obj)
        return db_obj
    
    @staticmethod
    async def delete(db: Session, id: str) -> bool:
        db_obj = await [ServiceName].get_by_id(db, id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
            return True
        return False
```

**验收标准**:
- [ ] CRUD 操作实现完整
- [ ] 错误处理完善
- [ ] 类型注解正确
- [ ] 文档字符串完整

---

### Phase 2: API 端点

#### Task 2.1: 创建 API 路由
- **文件**: `server/app/api/[endpoint_name].py`
- **依赖**: Task 1.4
- **估时**: 1.5 小时
- **类型**: 后端
- **并行**: 可 [P]
- **关键**: 是 [CRITICAL]

**实现内容**:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..services.[service_name] import [ServiceName]
from ..schemas.[schema_name] import [SchemaName], [SchemaName]Create, [SchemaName]Update

router = APIRouter(prefix="/api/v1/[resource]", tags=["[Resource]"])

@router.get("/", response_model=List[[SchemaName]])
async def get_resources(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取资源列表"""
    return await [ServiceName].get_all(db, skip, limit)

# ... 其他端点
```

**验收标准**:
- [ ] 所有 CRUD 端点实现
- [ ] 请求验证正确
- [ ] 错误处理完善
- [ ] 响应模型正确

---

#### Task 2.2: 注册 API 路由到主应用
- **文件**: `server/main.py`
- **依赖**: Task 2.1
- **估时**: 10 分钟
- **类型**: 后端
- **并行**: 否

**实现内容**:
```python
from app.api.[endpoint_name] import router as [resource]_router

app.include_router([resource]_router)
```

**验收标准**:
- [ ] 路由注册成功
- [ ] API 文档更新
- [ ] 端点可访问

---

### Phase 3: 前端 - 数据层

#### Task 3.1: 创建 API 服务
- **文件**: `client/src/services/[resource]Service.ts`
- **依赖**: Task 2.1
- **估时**: 1 小时
- **类型**: 前端
- **并行**: 可 [P]

**实现内容**:
```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

export interface [Resource] {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const [resource]Service = {
  async getAll(skip: number = 0, limit: number = 100): Promise<[Resource][]> {
    const response = await axios.get(`${API_BASE}/[resource]`, {
      params: { skip, limit }
    });
    return response.data;
  },
  
  async getById(id: string): Promise<[Resource]> {
    const response = await axios.get(`${API_BASE}/[resource]/${id}`);
    return response.data;
  },
  
  async create(data: Partial<[Resource]>): Promise<[Resource]> {
    const response = await axios.post(`${API_BASE}/[resource]`, data);
    return response.data;
  },
  
  async update(id: string, data: Partial<[Resource]>): Promise<[Resource]> {
    const response = await axios.put(`${API_BASE}/[resource]/${id}`, data);
    return response.data;
  },
  
  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE}/[resource]/${id}`);
  }
};
```

**验收标准**:
- [ ] 接口定义正确
- [ ] 错误处理完善
- [ ] TypeScript 类型安全
- [ ] API 路径正确

---

### Phase 4: 前端 - 组件层

#### Task 4.1: 创建列表组件
- **文件**: `client/src/components/[Resource]/[Resource]List.tsx`
- **依赖**: Task 3.1
- **估时**: 2 小时
- **类型**: 前端
- **并行**: 否

**实现内容**:
```typescript
import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message } from 'antd';
import { [resource]Service, [Resource] } from '../../services/[resource]Service';

const [Resource]List: React.FC = () => {
  const [data, setData] = useState<[Resource][]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await [resource]Service.getAll();
      setData(result);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };
  
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    // ... 其他列
  ];
  
  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={loading}
      rowKey="id"
    />
  );
};

export default [Resource]List;
```

**验收标准**:
- [ ] 数据加载正常
- [ ] 表格显示正确
- [ ] 加载状态显示
- [ ] 错误处理完善

---

#### Task 4.2: 创建表单组件
- **文件**: `client/src/components/[Resource]/[Resource]Form.tsx`
- **依赖**: Task 3.1
- **估时**: 2 小时
- **类型**: 前端
- **并行**: 可 [P]

**实现内容**:
```typescript
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { [resource]Service, [Resource] } from '../../services/[resource]Service';

interface [Resource]FormProps {
  initialValues?: Partial<[Resource]>;
  onSuccess?: () => void;
}

const [Resource]Form: React.FC<[Resource]FormProps> = ({ initialValues, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (initialValues?.id) {
        await [resource]Service.update(initialValues.id, values);
        message.success('更新成功');
      } else {
        await [resource]Service.create(values);
        message.success('创建成功');
      }
      onSuccess?.();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form
      form={form}
      initialValues={initialValues}
      onFinish={handleSubmit}
      layout="vertical"
    >
      <Form.Item
        name="name"
        label="名称"
        rules={[{ required: true, message: '请输入名称' }]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues?.id ? '更新' : '创建'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default [Resource]Form;
```

**验收标准**:
- [ ] 表单验证正确
- [ ] 提交逻辑正常
- [ ] 加载状态显示
- [ ] 错误处理完善

---

#### Task 4.3: 创建主页面组件
- **文件**: `client/src/pages/[Resource]Page.tsx`
- **依赖**: Task 4.1, Task 4.2
- **估时**: 1.5 小时
- **类型**: 前端
- **并行**: 否

**实现内容**:
```typescript
import React, { useState } from 'react';
import { Card, Button, Modal, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import [Resource]List from '../components/[Resource]/[Resource]List';
import [Resource]Form from '../components/[Resource]/[Resource]Form';

const [Resource]Page: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleSuccess = () => {
    setModalVisible(false);
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="[Resource 中文名]管理"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            添加
          </Button>
        }
      >
        <[Resource]List key={refreshKey} />
      </Card>
      
      <Modal
        title="添加[Resource 中文名]"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <[Resource]Form onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
};

export default [Resource]Page;
```

**验收标准**:
- [ ] 页面布局正确
- [ ] 模态框正常
- [ ] 刷新逻辑正常
- [ ] 交互流畅

---

#### Task 4.4: 添加路由配置
- **文件**: `client/src/App.tsx`
- **依赖**: Task 4.3
- **估时**: 10 分钟
- **类型**: 前端
- **并行**: 否

**实现内容**:
```typescript
import [Resource]Page from './pages/[Resource]Page';

// 在路由配置中添加
<Route path="/[resource]" element={<[Resource]Page />} />
```

**验收标准**:
- [ ] 路由注册成功
- [ ] 页面可访问
- [ ] 导航正常

---

### Checkpoint 1: 验证用户故事 #1

**验收标准**:
- [ ] 可以创建新记录
- [ ] 可以查看记录列表
- [ ] 可以更新记录
- [ ] 可以删除记录
- [ ] 所有操作有反馈提示
- [ ] 错误处理完善
- [ ] UI 美观易用

**测试步骤**:
1. 打开页面 `http://localhost:3000/[resource]`
2. 点击"添加"按钮
3. 填写表单并提交
4. 验证列表中显示新记录
5. 编辑记录
6. 删除记录
7. 验证所有错误情况

---

## 用户故事 #2: [标题]

*(重复上述结构)*

---

## 总体检查清单

### 代码质量
- [ ] 无 TypeScript 编译错误
- [ ] 无 ESLint 警告（关键级别）
- [ ] 代码格式规范
- [ ] 命名清晰易懂
- [ ] 注释恰当充分

### 功能完整性
- [ ] 所有用户故事实现
- [ ] 所有验收标准满足
- [ ] 边界情况处理

### 性能
- [ ] 页面加载 < 3 秒
- [ ] API 响应 < 500ms
- [ ] 无性能瓶颈

### 用户体验
- [ ] UI 美观一致
- [ ] 交互流畅自然
- [ ] 错误提示清晰
- [ ] 加载状态明确

### 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] E2E 测试通过
- [ ] 手动测试通过

---

## 部署前检查

- [ ] 数据库迁移准备就绪
- [ ] 环境变量配置正确
- [ ] 依赖包已安装
- [ ] 构建成功
- [ ] 测试环境验证通过
- [ ] 回滚方案准备

---

## 完成标准

当以下所有条件满足时，此功能开发完成：

1. ✅ 所有任务完成
2. ✅ 所有 Checkpoint 通过
3. ✅ 代码评审通过
4. ✅ 质量检查通过
5. ✅ 用户验收测试通过
6. ✅ 文档已更新
7. ✅ 部署成功

---

**注意**: 
- 任务按顺序执行，除非标记为 [P] 可并行
- 每完成一个 Phase，进行 Checkpoint 验证
- 遇到问题立即反馈，不要拖延
- 保持代码质量，不要为了速度牺牲质量

**下一步**: 按照任务顺序开始实现，完成后进行验收




