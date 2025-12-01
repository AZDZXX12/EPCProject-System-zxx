/**
 * 日历视图组件
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Card, Tag, Empty } from 'antd';
import { taskApi } from '../services/api';
import { useProject } from '../contexts/ProjectContext';
import { logger } from '../utils/logger';
import type { Dayjs } from 'dayjs';
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

const CalendarView: React.FC = () => {
  const { currentProject } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

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
      logger.error('[日历视图] 加载任务失败', error);
    } finally {
      setLoading(false);
    }
  };

  const getTasksForDate = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    return tasks.filter(task => {
      const start = dayjs(task.start_date).format('YYYY-MM-DD');
      const end = dayjs(task.end_date).format('YYYY-MM-DD');
      return dateStr >= start && dateStr <= end;
    });
  };

  const cellRender = (current: Dayjs) => {
    const date = current;
    const dayTasks = getTasksForDate(date);
    
    if (dayTasks.length === 0) return null;

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayTasks.slice(0, 3).map(task => {
          const statusMap: Record<string, 'success' | 'processing' | 'error' | 'default'> = {
            '已完成': 'success',
            '进行中': 'processing',
            '已延期': 'error',
            '未开始': 'default',
          };
          
          return (
            <li key={task.id} style={{ marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Badge 
                status={statusMap[task.status] || 'default'}
                text={
                  <span 
                    style={{ fontSize: 12, cursor: 'pointer' }}
                    title={task.name}
                  >
                    {task.name}
                  </span>
                } 
              />
            </li>
          );
        })}
        {dayTasks.length > 3 && (
          <li style={{ fontSize: 12, color: '#1890ff', cursor: 'pointer' }}>
            +{dayTasks.length - 3} 更多...
          </li>
        )}
      </ul>
    );
  };

  const onSelect = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const selectedTasks = getTasksForDate(selectedDate);

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 300px)' }}>
      <div style={{ flex: 1 }}>
        <Calendar 
          cellRender={cellRender}
          onSelect={onSelect}
        />
      </div>
      
      <Card 
        title={`${selectedDate.format('YYYY年MM月DD日')} 的任务`}
        style={{ width: 350, overflowY: 'auto' }}
        styles={{ body: { padding: 12 } }}
      >
        {loading ? (
          <Empty description="加载中..." />
        ) : selectedTasks.length === 0 ? (
          <Empty description="当天无任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedTasks.map(task => (
              <Card 
                key={task.id}
                size="small"
                hoverable
                styles={{ body: { padding: 12 } }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Tag color={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'blue'}>
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                  </Tag>
                  <Tag color={
                    task.status === '已完成' ? 'success' :
                    task.status === '进行中' ? 'processing' :
                    task.status === '已延期' ? 'error' : 'default'
                  }>
                    {task.status}
                  </Tag>
                </div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{task.name}</div>
                {task.assignee && (
                  <div style={{ fontSize: 12, color: '#666' }}>负责人: {task.assignee}</div>
                )}
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {dayjs(task.start_date).format('MM-DD')} ~ {dayjs(task.end_date).format('MM-DD')}
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
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                      {Math.round(task.progress * 100)}%
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CalendarView;
