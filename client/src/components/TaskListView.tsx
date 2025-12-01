/**
 * 任务列表视图组件
 */

import React, { useState, useEffect } from 'react';
import { Table, Tag, Progress, Button, Space, Input, Select, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { taskApi } from '../services/api';
import { useProject } from '../contexts/ProjectContext';
import { logger } from '../utils/logger';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Task {
  id: string;
  name: string;
  status: string;
  priority: string;
  assignee?: string;
  start_date: string;
  end_date: string;
  progress: number;
}

const TaskListView: React.FC = () => {
  const { currentProject } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();

  useEffect(() => {
    if (currentProject) {
      loadTasks();
    }
  }, [currentProject]);

  const loadTasks = async () => {
    if (!currentProject) return;
    
    setLoading(true);
    try {
      const response = await taskApi.getAll(currentProject.id);
      setTasks(response as Task[]);
    } catch (error) {
      logger.error('[任务列表] 加载任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      '未开始': 'default',
      '进行中': 'processing',
      '已完成': 'success',
      '已延期': 'error',
      'pending': 'default',
      'in_progress': 'processing',
      'completed': 'success',
      'delayed': 'error',
    };
    return colorMap[status] || 'default';
  };

  const getPriorityColor = (priority: string): string => {
    const colorMap: Record<string, string> = {
      'high': 'red',
      'medium': 'orange',
      'low': 'blue',
      '高': 'red',
      '中': 'orange',
      '低': 'blue',
    };
    return colorMap[priority] || 'default';
  };

  const columns: ColumnsType<Task> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => 
        record.name.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: '未开始', value: '未开始' },
        { text: '进行中', value: '进行中' },
        { text: '已完成', value: '已完成' },
        { text: '已延期', value: '已延期' },
      ],
      filteredValue: statusFilter ? [statusFilter] : null,
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      filters: [
        { text: '高', value: 'high' },
        { text: '中', value: 'medium' },
        { text: '低', value: 'low' },
      ],
      filteredValue: priorityFilter ? [priorityFilter] : null,
      onFilter: (value, record) => record.priority === value,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
        </Tag>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 120,
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 120,
      sorter: (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 120,
      sorter: (a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime(),
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      sorter: (a, b) => a.progress - b.progress,
      render: (progress: number) => (
        <Progress 
          percent={Math.round(progress * 100)} 
          size="small"
          status={progress >= 1 ? 'success' : progress > 0 ? 'active' : 'normal'}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (task: Task) => {
    logger.info('[任务列表] 编辑任务', { taskId: task.id, taskName: task.name });
    // TODO: 打开编辑弹窗
  };

  const handleDelete = (task: Task) => {
    logger.info('[任务列表] 删除任务', { taskId: task.id, taskName: task.name });
    // TODO: 确认删除
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Input
          placeholder="搜索任务名称"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          placeholder="筛选状态"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          allowClear
        >
          <Option value="未开始">未开始</Option>
          <Option value="进行中">进行中</Option>
          <Option value="已完成">已完成</Option>
          <Option value="已延期">已延期</Option>
        </Select>
        <Select
          placeholder="筛选优先级"
          value={priorityFilter}
          onChange={setPriorityFilter}
          style={{ width: 120 }}
          allowClear
        >
          <Option value="high">高</Option>
          <Option value="medium">中</Option>
          <Option value="low">低</Option>
        </Select>
        <Button onClick={loadTasks}>刷新</Button>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条任务`,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default TaskListView;
