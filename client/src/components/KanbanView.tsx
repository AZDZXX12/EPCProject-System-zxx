/**
 * 看板视图组件
 */

import React, { useState, useEffect } from 'react';
import { Card, Tag, Avatar, Empty } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { taskApi } from '../services/api';
import { useProject } from '../contexts/ProjectContext';
import dayjs from 'dayjs';

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

const COLUMNS = [
  { key: '未开始', title: '待办', color: '#d9d9d9' },
  { key: '进行中', title: '进行中', color: '#1890ff' },
  { key: '已完成', title: '已完成', color: '#52c41a' },
];

const KanbanView: React.FC = () => {
  const { currentProject } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

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
      console.error('加载任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string): string => {
    const colorMap: Record<string, string> = {
      'high': 'red',
      'medium': 'orange',
      'low': 'blue',
    };
    return colorMap[priority] || 'default';
  };

  const renderTaskCard = (task: Task) => (
    <Card
      key={task.id}
      size="small"
      hoverable
      style={{ marginBottom: 12, cursor: 'pointer' }}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ marginBottom: 8 }}>
        <Tag color={getPriorityColor(task.priority)} style={{ marginRight: 8 }}>
          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
        </Tag>
        <span style={{ fontWeight: 500 }}>{task.name}</span>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: 12,
        color: '#666',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {task.assignee && (
            <span>
              <Avatar size="small" icon={<UserOutlined />} />
              <span style={{ marginLeft: 4 }}>{task.assignee}</span>
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ClockCircleOutlined />
          <span>{dayjs(task.end_date).format('MM-DD')}</span>
        </div>
      </div>
      
      {task.progress > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ 
            height: 4, 
            background: '#f0f0f0', 
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{ 
              height: '100%', 
              width: `${task.progress * 100}%`,
              background: '#1890ff',
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
            进度: {Math.round(task.progress * 100)}%
          </div>
        </div>
      )}
    </Card>
  );

  return (
    <div style={{ 
      display: 'flex', 
      gap: 16, 
      height: 'calc(100vh - 300px)',
      overflow: 'auto',
    }}>
      {COLUMNS.map(column => {
        const columnTasks = getTasksByStatus(column.key);
        
        return (
          <div 
            key={column.key}
            style={{ 
              flex: 1,
              minWidth: 300,
              background: '#f5f5f5',
              borderRadius: 4,
              padding: 12,
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              paddingBottom: 12,
              borderBottom: `3px solid ${column.color}`,
            }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                {column.title}
              </span>
              <Tag color={column.color}>{columnTasks.length}</Tag>
            </div>
            
            <div style={{ 
              overflowY: 'auto',
              height: 'calc(100% - 50px)',
            }}>
              {loading ? (
                <Empty description="加载中..." />
              ) : columnTasks.length === 0 ? (
                <Empty description="暂无任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                columnTasks.map(renderTaskCard)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;
