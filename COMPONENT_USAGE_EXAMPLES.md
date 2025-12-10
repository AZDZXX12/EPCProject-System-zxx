# 📚 组件使用示例大全

**版本**：2.1.0  
**更新日期**：2025-12-01

---

## 🎯 目录

1. [FileUpload - 文件上传组件](#fileupload)
2. [SearchBar - 搜索筛选组件](#searchbar)
3. [NotificationService - 通知服务](#notificationservice)
4. [集成示例](#integration-examples)

---

## FileUpload

### 基础示例

#### 1. 简单图片上传
```typescript
import React from 'react';
import FileUpload from '@/components/FileUpload/FileUpload';
import { message } from 'antd';

const ImageUploadExample: React.FC = () => {
  const handleUpload = async (files: File[]) => {
    try {
      // 模拟上传
      const urls = files.map(file => URL.createObjectURL(file));
      message.success('上传成功！');
      return urls;
    } catch (error) {
      message.error('上传失败！');
      throw error;
    }
  };

  return (
    <FileUpload
      accept="image/*"
      maxSize={5}
      maxCount={5}
      multiple
      onUpload={handleUpload}
    />
  );
};
```

#### 2. 文档上传（带服务器）
```typescript
import React from 'react';
import FileUpload from '@/components/FileUpload/FileUpload';
import { message } from 'antd';
import axios from 'axios';

const DocumentUploadExample: React.FC = () => {
  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          console.log(`上传进度: ${percentCompleted}%`);
        },
      });

      message.success('文档上传成功！');
      return response.data.urls;
    } catch (error) {
      message.error('文档上传失败！');
      throw error;
    }
  };

  return (
    <FileUpload
      accept=".pdf,.doc,.docx,.xls,.xlsx"
      maxSize={10}
      maxCount={10}
      multiple
      listType="text"
      onUpload={handleUpload}
    />
  );
};
```

#### 3. 施工照片上传（完整功能）
```typescript
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload/FileUpload';
import { Modal, Image, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';

interface ConstructionPhoto {
  id: string;
  url: string;
  name: string;
  uploadTime: string;
  location?: string;
  description?: string;
}

const ConstructionPhotoUpload: React.FC = () => {
  const [photos, setPhotos] = useState<ConstructionPhoto[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const handleUpload = async (files: File[]) => {
    try {
      // 上传到服务器
      const formData = new FormData();
      files.forEach(file => formData.append('photos', file));
      
      const response = await fetch('/api/construction/photos', {
        method: 'POST',
        body: formData,
      });
      
      const { urls } = await response.json();
      
      // 保存照片信息
      const newPhotos: ConstructionPhoto[] = files.map((file, index) => ({
        id: `photo-${Date.now()}-${index}`,
        url: urls[index],
        name: file.name,
        uploadTime: new Date().toISOString(),
      }));
      
      setPhotos([...photos, ...newPhotos]);
      message.success(`成功上传 ${files.length} 张照片`);
      
      return urls;
    } catch (error) {
      message.error('照片上传失败');
      throw error;
    }
  };

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || file.preview || '');
    setPreviewTitle(file.name || '预览');
    setPreviewVisible(true);
  };

  const handleRemove = (file: UploadFile) => {
    // 从服务器删除
    fetch(`/api/construction/photos/${file.uid}`, {
      method: 'DELETE',
    });
    
    // 从本地列表删除
    setPhotos(photos.filter(p => p.id !== file.uid));
    message.success('照片已删除');
  };

  return (
    <div>
      <FileUpload
        accept="image/*"
        maxSize={5}
        maxCount={20}
        multiple
        listType="picture-card"
        onUpload={handleUpload}
        onPreview={handlePreview}
        onRemove={handleRemove}
      />

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <Image
          alt="preview"
          style={{ width: '100%' }}
          src={previewImage}
          preview={false}
        />
      </Modal>
    </div>
  );
};
```

---

## SearchBar

### 基础示例

#### 1. 简单搜索
```typescript
import React, { useState } from 'react';
import SearchBar from '@/components/SearchBar/SearchBar';
import { List } from 'antd';

const SimpleSearchExample: React.FC = () => {
  const [data, setData] = useState([
    { id: 1, name: '项目A', status: 'active' },
    { id: 2, name: '项目B', status: 'completed' },
    { id: 3, name: '项目C', status: 'active' },
  ]);
  const [filteredData, setFilteredData] = useState(data);

  const handleSearch = (keyword: string) => {
    if (!keyword) {
      setFilteredData(data);
      return;
    }
    
    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <div>
      <SearchBar
        placeholder="搜索项目..."
        onSearch={handleSearch}
      />
      
      <List
        dataSource={filteredData}
        renderItem={item => (
          <List.Item>
            {item.name} - {item.status}
          </List.Item>
        )}
      />
    </div>
  );
};
```

#### 2. 带筛选的搜索
```typescript
import React, { useState } from 'react';
import SearchBar, { FilterConfig } from '@/components/SearchBar/SearchBar';
import { Table } from 'antd';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  budget: number;
}

const ProjectSearchExample: React.FC = () => {
  const [projects] = useState<Project[]>([
    {
      id: 'P001',
      name: '办公楼建设项目',
      status: 'active',
      priority: 'high',
      startDate: '2025-01-01',
      budget: 5000000,
    },
    // ... 更多项目
  ]);
  
  const [filteredProjects, setFilteredProjects] = useState(projects);

  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '规划中', value: 'planning' },
        { label: '进行中', value: 'active' },
        { label: '已完成', value: 'completed' },
        { label: '已暂停', value: 'paused' },
      ],
    },
    {
      key: 'priority',
      label: '优先级',
      type: 'select',
      options: [
        { label: '高', value: 'high' },
        { label: '中', value: 'medium' },
        { label: '低', value: 'low' },
      ],
    },
    {
      key: 'startDate',
      label: '开始日期',
      type: 'dateRange',
    },
    {
      key: 'budget',
      label: '预算（万元）',
      type: 'number',
      placeholder: '请输入预算金额',
    },
  ];

  const handleSearch = (keyword: string) => {
    let filtered = projects;
    
    if (keyword) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(keyword.toLowerCase()) ||
        p.id.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    
    setFilteredProjects(filtered);
  };

  const handleFilter = (filterValues: Record<string, any>) => {
    let filtered = projects;
    
    // 应用筛选条件
    if (filterValues.status) {
      filtered = filtered.filter(p => p.status === filterValues.status);
    }
    
    if (filterValues.priority) {
      filtered = filtered.filter(p => p.priority === filterValues.priority);
    }
    
    if (filterValues.startDate && Array.isArray(filterValues.startDate)) {
      const [start, end] = filterValues.startDate;
      filtered = filtered.filter(
        p => p.startDate >= start && p.startDate <= end
      );
    }
    
    if (filterValues.budget) {
      filtered = filtered.filter(p => p.budget >= filterValues.budget * 10000);
    }
    
    setFilteredProjects(filtered);
  };

  const columns = [
    { title: '项目编号', dataIndex: 'id', key: 'id' },
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '优先级', dataIndex: 'priority', key: 'priority' },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (value: number) => `¥${(value / 10000).toFixed(2)}万`,
    },
  ];

  return (
    <div>
      <SearchBar
        placeholder="搜索项目名称或编号..."
        onSearch={handleSearch}
        onFilter={handleFilter}
        filters={filters}
        showHistory
        showFavorite
      />
      
      <Table
        dataSource={filteredProjects}
        columns={columns}
        rowKey="id"
        style={{ marginTop: 16 }}
      />
    </div>
  );
};
```

#### 3. 任务搜索（完整功能）
```typescript
import React, { useState, useEffect } from 'react';
import SearchBar, { FilterConfig } from '@/components/SearchBar/SearchBar';
import { Card, Tag, Space, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface Task {
  id: string;
  name: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  dueDate: string;
  tags: string[];
}

const TaskSearchExample: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [displayTasks, setDisplayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      // 从API加载任务
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
      setDisplayTasks(data);
    } catch (error) {
      console.error('加载任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '待办', value: 'todo' },
        { label: '进行中', value: 'doing' },
        { label: '已完成', value: 'done' },
      ],
    },
    {
      key: 'priority',
      label: '优先级',
      type: 'select',
      options: [
        { label: '高', value: 'high' },
        { label: '中', value: 'medium' },
        { label: '低', value: 'low' },
      ],
    },
    {
      key: 'assignee',
      label: '负责人',
      type: 'text',
      placeholder: '输入负责人姓名',
    },
    {
      key: 'dueDate',
      label: '截止日期',
      type: 'dateRange',
    },
  ];

  const handleSearch = (keyword: string) => {
    let filtered = tasks;
    
    if (keyword) {
      filtered = filtered.filter(
        task =>
          task.name.toLowerCase().includes(keyword.toLowerCase()) ||
          task.assignee.toLowerCase().includes(keyword.toLowerCase()) ||
          task.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
      );
    }
    
    setDisplayTasks(filtered);
  };

  const handleFilter = (filterValues: Record<string, any>) => {
    let filtered = tasks;
    
    Object.entries(filterValues).forEach(([key, value]) => {
      if (!value) return;
      
      switch (key) {
        case 'status':
          filtered = filtered.filter(t => t.status === value);
          break;
        case 'priority':
          filtered = filtered.filter(t => t.priority === value);
          break;
        case 'assignee':
          filtered = filtered.filter(t =>
            t.assignee.toLowerCase().includes(value.toLowerCase())
          );
          break;
        case 'dueDate':
          if (Array.isArray(value)) {
            const [start, end] = value;
            filtered = filtered.filter(
              t => t.dueDate >= start && t.dueDate <= end
            );
          }
          break;
      }
    });
    
    setDisplayTasks(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      todo: 'default',
      doing: 'processing',
      done: 'success',
    };
    return colors[status as keyof typeof colors];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'green',
    };
    return colors[priority as keyof typeof colors];
  };

  return (
    <div>
      <SearchBar
        placeholder="搜索任务名称、负责人或标签..."
        onSearch={handleSearch}
        onFilter={handleFilter}
        filters={filters}
        showHistory
        showFavorite
        maxHistoryCount={15}
      />
      
      <div style={{ marginTop: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {displayTasks.map(task => (
            <Card key={task.id} size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{task.name}</strong>
                  <Space>
                    <Tag color={getStatusColor(task.status)}>
                      {task.status}
                    </Tag>
                    <Tag color={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Tag>
                  </Space>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span>{task.assignee}</span>
                  </Space>
                  <span>截止: {task.dueDate}</span>
                </div>
                
                <div>
                  {task.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </Space>
            </Card>
          ))}
        </Space>
      </div>
    </div>
  );
};
```

---

## NotificationService

### 基础示例

#### 1. 发送简单通知
```typescript
import notificationService from '@/services/NotificationService';

// 发送普通通知
notificationService.send({
  type: 'system',
  priority: 'normal',
  title: '系统通知',
  content: '系统将于今晚22:00进行维护',
  receiver: 'all',
});

// 发送任务通知
notificationService.send({
  type: 'task',
  priority: 'important',
  title: '任务分配',
  content: '您有一个新的任务：基础土建工程验收',
  link: '/tasks/123',
  receiver: 'user123',
});

// 发送紧急警告
notificationService.send({
  type: 'alert',
  priority: 'urgent',
  title: '安全警告',
  content: '发现重大安全隐患，请立即处理！',
  link: '/safety/alert/456',
  receiver: 'safety-manager',
});
```

#### 2. 订阅通知事件
```typescript
import React, { useEffect, useState } from 'react';
import notificationService from '@/services/NotificationService';
import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const NotificationBadge: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 初始化未读数量
    setUnreadCount(notificationService.getUnreadCount());

    // 订阅新通知
    const unsubscribe = notificationService.subscribe('new', (notification) => {
      console.log('收到新通知:', notification);
      setUnreadCount(prev => prev + 1);
    });

    // 订阅已读事件
    const unsubscribeRead = notificationService.subscribe('read', () => {
      setUnreadCount(notificationService.getUnreadCount());
    });

    // 订阅全部已读事件
    const unsubscribeReadAll = notificationService.subscribe('readAll', () => {
      setUnreadCount(0);
    });

    // 清理订阅
    return () => {
      unsubscribe();
      unsubscribeRead();
      unsubscribeReadAll();
    };
  }, []);

  return (
    <Badge count={unreadCount} offset={[10, 0]}>
      <BellOutlined style={{ fontSize: 20 }} />
    </Badge>
  );
};
```

#### 3. 通知列表组件
```typescript
import React, { useState, useEffect } from 'react';
import notificationService, { Notification } from '@/services/NotificationService';
import { List, Tag, Button, Space, Empty } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();

    // 订阅新通知
    const unsubscribe = notificationService.subscribe('new', () => {
      loadNotifications();
    });

    return () => unsubscribe();
  }, [filter]);

  const loadNotifications = () => {
    const filterConfig = filter === 'all' ? undefined : { status: filter };
    const list = notificationService.getList(filterConfig as any);
    setNotifications(list);
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleDelete = (id: string) => {
    notificationService.delete(id);
    loadNotifications();
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      normal: 'default',
      important: 'orange',
      urgent: 'red',
    };
    return colors[priority as keyof typeof colors];
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      system: <BellOutlined />,
      task: <ClockCircleOutlined />,
      approval: <CheckOutlined />,
      reminder: <ClockCircleOutlined />,
      alert: <BellOutlined />,
    };
    return icons[type as keyof typeof icons];
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type={filter === 'all' ? 'primary' : 'default'}
          onClick={() => setFilter('all')}
        >
          全部
        </Button>
        <Button
          type={filter === 'unread' ? 'primary' : 'default'}
          onClick={() => setFilter('unread')}
        >
          未读
        </Button>
        <Button
          type={filter === 'read' ? 'primary' : 'default'}
          onClick={() => setFilter('read')}
        >
          已读
        </Button>
        <Button onClick={handleMarkAllAsRead}>全部标记为已读</Button>
      </Space>

      <List
        dataSource={notifications}
        locale={{ emptyText: <Empty description="暂无通知" /> }}
        renderItem={item => (
          <List.Item
            style={{
              background: item.status === 'unread' ? '#f0f7ff' : 'white',
              padding: '12px 16px',
              borderRadius: 4,
              marginBottom: 8,
            }}
            actions={[
              item.status === 'unread' && (
                <Button
                  type="link"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleMarkAsRead(item.id)}
                >
                  标记已读
                </Button>
              ),
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(item.id)}
              >
                删除
              </Button>,
            ].filter(Boolean) as React.ReactNode[]}
          >
            <List.Item.Meta
              avatar={getTypeIcon(item.type)}
              title={
                <Space>
                  <span>{item.title}</span>
                  <Tag color={getPriorityColor(item.priority)}>
                    {item.priority}
                  </Tag>
                  {item.status === 'unread' && <Tag color="blue">未读</Tag>}
                </Space>
              }
              description={
                <div>
                  <div>{item.content}</div>
                  <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};
```

---

## Integration Examples

### 完整集成示例：施工管理模块

```typescript
import React, { useState } from 'react';
import { Card, Tabs, Button, Space, message } from 'antd';
import FileUpload from '@/components/FileUpload/FileUpload';
import SearchBar from '@/components/SearchBar/SearchBar';
import notificationService from '@/services/NotificationService';

const ConstructionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState([]);

  // 上传施工照片
  const handlePhotoUpload = async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('photos', file));
      
      const response = await fetch('/api/construction/photos', {
        method: 'POST',
        body: formData,
      });
      
      const { urls } = await response.json();
      
      // 发送通知
      notificationService.send({
        type: 'system',
        priority: 'normal',
        title: '照片上传成功',
        content: `成功上传 ${files.length} 张施工照片`,
        receiver: 'current-user',
      });
      
      message.success('照片上传成功！');
      return urls;
    } catch (error) {
      message.error('照片上传失败！');
      throw error;
    }
  };

  // 搜索施工日志
  const handleSearch = (keyword: string) => {
    // 搜索逻辑
    console.log('搜索:', keyword);
  };

  // 筛选施工日志
  const handleFilter = (filters: Record<string, any>) => {
    // 筛选逻辑
    console.log('筛选:', filters);
  };

  return (
    <Card title="施工管理">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'logs',
            label: '施工日志',
            children: (
              <div>
                <SearchBar
                  placeholder="搜索施工日志..."
                  onSearch={handleSearch}
                  onFilter={handleFilter}
                  filters={[
                    {
                      key: 'date',
                      label: '日期',
                      type: 'dateRange',
                    },
                    {
                      key: 'type',
                      label: '类型',
                      type: 'select',
                      options: [
                        { label: '土建', value: 'civil' },
                        { label: '安装', value: 'installation' },
                        { label: '装修', value: 'decoration' },
                      ],
                    },
                  ]}
                />
                {/* 日志列表 */}
              </div>
            ),
          },
          {
            key: 'photos',
            label: '施工照片',
            children: (
              <FileUpload
                accept="image/*"
                maxSize={5}
                maxCount={20}
                multiple
                listType="picture-card"
                onUpload={handlePhotoUpload}
              />
            ),
          },
        ]}
      />
    </Card>
  );
};

export default ConstructionManagement;
```

---

## 最佳实践

### 1. 错误处理
```typescript
const handleUpload = async (files: File[]) => {
  try {
    const urls = await uploadToServer(files);
    message.success('上传成功');
    return urls;
  } catch (error) {
    console.error('上传失败:', error);
    message.error('上传失败，请重试');
    throw error; // 重要：必须抛出错误
  }
};
```

### 2. 加载状态
```typescript
const [loading, setLoading] = useState(false);

const handleSearch = async (keyword: string) => {
  setLoading(true);
  try {
    const results = await searchAPI(keyword);
    setData(results);
  } finally {
    setLoading(false);
  }
};
```

### 3. 性能优化
```typescript
import { useMemo, useCallback } from 'react';

const filters = useMemo(() => [
  { key: 'status', label: '状态', type: 'select', options: [...] },
], []);

const handleSearch = useCallback((keyword: string) => {
  // 搜索逻辑
}, []);
```

---

**文档版本**：1.0.0  
**最后更新**：2025-12-01  
**维护团队**：EPC开发团队
