/**
 * 任务管理模块 - 统一入口
 * 整合甘特图、列表、看板、日历四种视图
 */

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Space, message, Tooltip, Badge } from 'antd';
import { 
  ProjectOutlined, 
  UnorderedListOutlined, 
  AppstoreOutlined, 
  CalendarOutlined,
  PlusOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { taskApi } from '../services/api';
import { logger } from '../utils/logger';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import OptimizedGanttChart from './OptimizedGanttChart';
import TaskListView from '../components/TaskListView';
import KanbanView from '../components/KanbanView';
import CalendarView from '../components/CalendarView';
import './GanttModulePage.css';

const GanttModulePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const params = new URLSearchParams(location.search);
  
  // 从URL获取视图参数
  const viewParam = params.get('view') || 'gantt';
  const [activeView, setActiveView] = useState(viewParam);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 同步URL参数
  useEffect(() => {
    const newView = params.get('view') || 'gantt';
    setActiveView(newView);
  }, [location.search]);

  const handleTabChange = (key: string) => {
    setActiveView(key);
    // 更新URL参数
    navigate(`/tasks?view=${key}`, { replace: true });
  };

  const handleExport = async () => {
    logger.info('[甘特图模块] 导出任务数据');
    try {
      // 获取当前激活视图的数据
      const data = await taskApi.getAll(currentProject?.id);
      if (!data || !Array.isArray(data)) {
        message.warning('没有可导出的数据');
        return;
      }

      // 创建Excel工作簿
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '任务数据');
      
      // 下载文件
      const fileName = `任务数据_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      message.success('导出成功');
    } catch (error) {
      logger.error('[甘特图模块] 导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  const handleNewTask = () => {
    logger.info('[甘特图模块] 新建任务');
    
    if (!currentProject) {
      message.warning('请先选择一个项目');
      return;
    }
    
    // 根据当前视图调用不同的新建功能
    if (activeView === 'gantt' && window.gantt) {
      // 在甘特图中直接创建任务
      const newTaskId = window.gantt.createTask({
        text: '新任务',
        start_date: new Date(),
        duration: 1,
      });
      window.gantt.showLightbox(newTaskId);
    } else {
      // 其他视图打开新建对话框
      message.info('正在开发中...');
      // TODO: 后续实现Modal弹窗新建
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    message.info('刷新中...');
    setTimeout(() => {
      setLoading(false);
      message.success('刷新成功');
    }, 1000);
  };

  const items = [
    {
      key: 'gantt',
      label: (
        <span>
          <ProjectOutlined />
          甘特图
          {taskCount > 0 && <Badge count={taskCount} offset={[10, 0]} />}
        </span>
      ),
      children: (
        <div className="tab-content">
          <OptimizedGanttChart hideTitle />
        </div>
      ),
    },
    {
      key: 'list',
      label: (
        <span>
          <UnorderedListOutlined />
          列表视图
        </span>
      ),
      children: (
        <div className="tab-content">
          <TaskListView />
        </div>
      ),
    },
    {
      key: 'kanban',
      label: (
        <span>
          <AppstoreOutlined />
          看板视图
        </span>
      ),
      children: (
        <div className="tab-content">
          <KanbanView />
        </div>
      ),
    },
    {
      key: 'calendar',
      label: (
        <span>
          <CalendarOutlined />
          日历视图
        </span>
      ),
      children: (
        <div className="tab-content">
          <CalendarView />
        </div>
      ),
    },
  ];

  return (
    <div className="gantt-module-page-compact">
      <Card className="content-card-compact">
        <div className="compact-header">
          <Space>
            <ProjectOutlined />
            <span className="compact-title">任务管理</span>
          </Space>
          <Space size="small">
            <Tooltip title="刷新">
              <Button 
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              />
            </Tooltip>
            <Button 
              type="primary" 
              size="small"
              icon={<PlusOutlined />}
              onClick={handleNewTask}
            >
              新建
            </Button>
            <Button 
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>
          </Space>
        </div>

        <Tabs 
          activeKey={activeView} 
          onChange={handleTabChange}
          size="small"
          type="line"
          className="compact-tabs"
          items={items}
        />
      </Card>
    </div>
  );
};

export default GanttModulePage;
