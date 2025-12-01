/**
 * 任务管理模块 - 统一入口
 * 整合甘特图、列表、看板、日历四种视图
 */

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Space, message } from 'antd';
import { 
  ProjectOutlined, 
  UnorderedListOutlined, 
  AppstoreOutlined, 
  CalendarOutlined,
  PlusOutlined,
  DownloadOutlined,
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

const { TabPane } = Tabs;

const GanttModulePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const params = new URLSearchParams(location.search);
  
  // 从URL获取视图参数
  const viewParam = params.get('view') || 'gantt';
  const [activeView, setActiveView] = useState(viewParam);

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

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <span>
            <ProjectOutlined style={{ marginRight: 8 }} />
            任务管理
          </span>
        }
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleNewTask}
            >
              新建任务
            </Button>
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>
          </Space>
        }
      >
        <Tabs 
          activeKey={activeView} 
          onChange={handleTabChange}
          size="large"
        >
          <TabPane
            tab={
              <span>
                <ProjectOutlined />
                甘特图
              </span>
            }
            key="gantt"
          >
            <div style={{ marginTop: 16 }}>
              <OptimizedGanttChart hideTitle />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <UnorderedListOutlined />
                列表视图
              </span>
            }
            key="list"
          >
            <div style={{ marginTop: 16 }}>
              <TaskListView />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <AppstoreOutlined />
                看板视图
              </span>
            }
            key="kanban"
          >
            <div style={{ marginTop: 16 }}>
              <KanbanView />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                日历视图
              </span>
            }
            key="calendar"
          >
            <div style={{ marginTop: 16 }}>
              <CalendarView />
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default GanttModulePage;
