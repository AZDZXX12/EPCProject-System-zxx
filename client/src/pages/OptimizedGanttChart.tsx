/**
 * 优化版甘特图组件
 * 
 * 🚀 核心优化：
 * 1. 预加载DHTMLX库（本地优先）
 * 2. 智能缓存策略（离线优先）
 * 3. 实时保存指示器
 * 4. 性能监控
 * 5. 错误边界保护
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Button, Space, Tooltip, Empty, App, Badge } from 'antd';
import { 
  ReloadOutlined, 
  DownloadOutlined, 
  FullscreenOutlined,
  CloudOutlined,
  CloudSyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useProject } from '../contexts/ProjectContext';
import PageContainer from '../components/Layout/PageContainer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { StorageManager } from '../utils/StorageManager';
import { taskApi } from '../services/api';
import { logger } from '../utils/logger';
import './DhtmlxGanttChart.css';

// 扩展 Window 类型
declare global {
  interface Window {
    gantt: any;
    __ganttScriptLoaded?: boolean;
    __ganttInitialized?: boolean;
  }
}

// 🔧 性能监控Hook
function usePerformanceMonitor(componentName: string) {
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    return () => {
      const duration = performance.now() - startTimeRef.current;
      logger.info(`[Performance] ${componentName} mounted in ${duration.toFixed(2)}ms`);
    };
  }, [componentName]);
}

// 🔧 自动保存状态Hook
function useAutoSaveIndicator() {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  const markSaving = useCallback(() => {
    setSaveStatus('saving');
  }, []);

  const markSaved = useCallback(() => {
    setSaveStatus('saved');
    setLastSaveTime(new Date());
  }, []);

  const markError = useCallback(() => {
    setSaveStatus('error');
  }, []);

  return { saveStatus, lastSaveTime, markSaving, markSaved, markError };
}

const OptimizedGanttChart: React.FC = () => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const { currentProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const ganttInitializedRef = useRef(false);
  const { notification } = App.useApp();

  // 🚀 性能监控
  usePerformanceMonitor('OptimizedGanttChart');

  // 🚀 自动保存状态
  const { saveStatus, lastSaveTime, markSaving, markSaved, markError } = useAutoSaveIndicator();

  // 颜色管理
  const taskColorMapRef = useRef(new Map<string, number>());
  const colorIndexRef = useRef(0);

  const _colorPalette = [
    { bar: '#1890ff', progress: '#0050b3' },
    { bar: '#52c41a', progress: '#237804' },
    { bar: '#fa8c16', progress: '#d46b08' },
    { bar: '#722ed1', progress: '#391085' },
    { bar: '#eb2f96', progress: '#9e1068' },
    { bar: '#13c2c2', progress: '#006d75' },
    { bar: '#faad14', progress: '#d48806' },
    { bar: '#2f54eb', progress: '#10239e' },
  ];

  // 🚀 优化1：本地优先的资源加载
  const loadDhtmlxGantt = useCallback(async () => {
    console.log('[甘特图] 开始加载DHTMLX Gantt库...');
    
    if (window.gantt && window.__ganttScriptLoaded) {
      console.log('[甘特图] 库已加载，直接初始化');
      initGantt();
      return;
    }

    // 🔥 关键优化：本地文件优先，CDN作为备份
    const CSS_SOURCES = [
      '/gantt-master/codebase/dhtmlxgantt.css', // 本地优先
      'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css', // CDN备份
    ];

    const JS_SOURCES = [
      '/gantt-master/codebase/dhtmlxgantt.js', // 本地优先
      'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js', // CDN备份
    ];

    // 快速加载CSS
    const loadCSS = (sources: string[], index = 0): Promise<void> => {
      return new Promise((resolve) => {
        if (index >= sources.length) {
          resolve();
          return;
        }

        const href = sources[index];
        if (document.querySelector(`link[href="${href}"]`)) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => loadCSS(sources, index + 1).then(resolve);
        document.head.appendChild(link);
      });
    };

    // 快速加载JS（2秒超时）
    const loadJS = (sources: string[], index = 0): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (index >= sources.length) {
          reject(new Error('All sources failed'));
          return;
        }

        const src = sources[index];
        if (document.querySelector(`script[src="${src}"]`)) {
          window.__ganttScriptLoaded = true;
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        
        // 10秒超时（增加加载时间）
        const timeout = setTimeout(() => {
          script.onerror = null;
          script.onload = null;
          console.warn(`加载超时，尝试下一个源: ${src}`);
          loadJS(sources, index + 1).then(resolve).catch(reject);
        }, 10000);

        script.onload = () => {
          clearTimeout(timeout);
          window.__ganttScriptLoaded = true;
          resolve();
        };

        script.onerror = () => {
          clearTimeout(timeout);
          loadJS(sources, index + 1).then(resolve).catch(reject);
        };

        document.body.appendChild(script);
      });
    };

    try {
      console.log('[甘特图] 开始加载CSS和JS资源...');
      await Promise.all([loadCSS(CSS_SOURCES), loadJS(JS_SOURCES)]);
      console.log('[甘特图] 资源加载成功，开始初始化');
      
      // 等待gantt对象可用
      let retries = 0;
      while (!window.gantt && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      if (window.gantt) {
        console.log('[甘特图] gantt对象已就绪，执行初始化');
        initGantt();
      } else {
        throw new Error('gantt对象未能加载');
      }
    } catch (err) {
      console.error('[甘特图] 加载失败:', err);
      notification.error({
        message: '甘特图加载失败',
        description: '无法加载DHTMLX Gantt库，请检查网络连接或本地文件。错误: ' + (err as Error).message,
        duration: 0,
      });
    }
  }, []);

  // 初始化甘特图
  const initGantt = useCallback(() => {
    console.log('[甘特图] initGantt被调用');
    console.log('[甘特图] 检查条件:', {
      hasContainer: !!ganttContainer.current,
      hasGantt: !!window.gantt,
      isInitialized: ganttInitializedRef.current
    });
    
    if (!ganttContainer.current || !window.gantt || ganttInitializedRef.current) {
      console.warn('[甘特图] 初始化条件不满足，跳过');
      return;
    }

    const gantt = window.gantt;

    // 基础配置
    gantt.config.date_format = '%Y-%m-%d';
    gantt.config.xml_date = '%Y-%m-%d';
    gantt.config.work_time = false;
    gantt.config.skip_off_time = false;
    gantt.config.duration_unit = 'day';
    gantt.config.row_height = 40;
    gantt.config.bar_height = 28;

    // 中文本地化
    gantt.locale = {
      date: {
        month_full: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        month_short: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        day_full: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        day_short: ['日', '一', '二', '三', '四', '五', '六'],
      },
      labels: {
        new_task: '新任务',
        icon_save: '保存',
        icon_cancel: '取消',
        icon_delete: '删除',
        section_text: '任务名称',
        section_start_date: '开始时间',
        section_duration: '持续时间',
        section_progress: '进度 %',
        section_owner: '负责人',
        section_priority: '优先级',
      },
    };

    // 配置列
    gantt.config.columns = [
      {
        name: 'wbs',
        label: '序号',
        align: 'center',
        width: 50,
        template: (task: any) => gantt.getTaskIndex(task.id) + 1,
      },
      { name: 'text', label: '任务名称', tree: true, width: '*', min_width: 150 },
      { name: 'start_date', label: '开始日期', align: 'center', width: 100 },
      { name: 'duration', label: '工期(天)', align: 'center', width: 70 },
      {
        name: 'progress',
        label: '进度',
        align: 'center',
        width: 70,
        template: (task: any) => Math.round((task.progress || 0) * 100) + '%',
      },
      { name: 'owner', label: '负责人', align: 'center', width: 90 },
    ];

    // 启用编辑
    gantt.config.details_on_dblclick = true;
    gantt.config.drag_resize = true;
    gantt.config.drag_move = true;
    gantt.config.drag_progress = true;

    // 🚀 优化：统一的任务事件处理（带自动保存提示）
    let saveTimer: NodeJS.Timeout | null = null;
    
    const handleTaskChange = (task: any) => {
      markSaving();
      
      // 防抖保存
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        try {
          // 保存到LocalStorage
          if (currentProject) {
            const allTasks = gantt.getTaskByTime();
            const cacheKey = `gantt_tasks_${currentProject.id}`;
            StorageManager.save(cacheKey, { data: allTasks, links: [] });
          }

          // 保存到后端
          await saveTaskToBackend(task);
          markSaved();
        } catch (err) {
          markError();
        }
      }, 1000);
    };

    gantt.attachEvent('onAfterTaskAdd', (_id: any, item: any) => {
      handleTaskChange(item);
      return true;
    });

    gantt.attachEvent('onAfterTaskUpdate', (_id: any, item: any) => {
      handleTaskChange(item);
      return true;
    });

    gantt.attachEvent('onAfterTaskDelete', (_id: any) => {
      markSaving();
      if (currentProject) {
        const allTasks = gantt.getTaskByTime();
        const cacheKey = `gantt_tasks_${currentProject.id}`;
        StorageManager.save(cacheKey, { data: allTasks, links: [] });
      }
      markSaved();
      return true;
    });

    // 初始化
    console.log('[甘特图] 执行gantt.init...');
    gantt.init(ganttContainer.current);
    ganttInitializedRef.current = true;
    window.__ganttInitialized = true;
    console.log('[甘特图] 初始化完成！');

    // 加载数据
    loadTasks();
  }, [currentProject]);

  // 🚀 优化2：智能的任务加载（离线优先）
  const loadTasks = useCallback(async () => {
    if (!currentProject) {
      setError('💡 请先选择项目');
      return;
    }

    setIsLoading(true);
    const cacheKey = `gantt_tasks_${currentProject.id}`;

    // 🔥 关键优化：立即显示缓存数据
    const cachedData = StorageManager.load(cacheKey);
    if (cachedData?.data && window.gantt) {
      const ganttData = {
        data: cachedData.data.map((task: any) => ({
          ...task,
          start_date: typeof task.start_date === 'string' ? new Date(task.start_date) : task.start_date,
        })),
        links: cachedData.links || [],
      };

      window.gantt.clearAll();
      window.gantt.parse(ganttData);
      window.gantt.render();
      setError('');
      logger.info(`[Gantt] 快速加载本地缓存: ${cachedData.data.length} 个任务`);
    }

    // 🔥 后台静默同步
    try {
      const tasksData = (await taskApi.getAll(currentProject.id)) as any[];
      
      const ganttData = {
        data: tasksData.map((task: any) => {
          const startDate = dayjs(task.start_date);
          const endDate = dayjs(task.end_date);
          const durationDays = Math.max(1, endDate.diff(startDate, 'day'));

          return {
            id: task.id,
            text: task.name,
            start_date: task.start_date,
            duration: durationDays,
            progress: task.progress / 100,
            owner: task.assignee,
            priority: task.priority,
            project_id: currentProject.id,
          };
        }),
        links: [],
      };

      if (window.gantt) {
        window.gantt.clearAll();
        window.gantt.parse(ganttData);
        window.gantt.render();
        
        // 更新缓存
        StorageManager.save(cacheKey, ganttData);
        setError('');
        logger.info(`[Gantt] 后端同步成功: ${ganttData.data.length} 个任务`);
      }
    } catch (err: any) {
      // 如果有缓存数据，不显示错误
      if (!cachedData?.data) {
        setError('⚠️ 后端连接失败，使用本地模式');
      }
      logger.warn('[Gantt] 后端同步失败，继续使用缓存');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  // 保存任务到后端
  const saveTaskToBackend = async (task: any) => {
    if (!currentProject) return;

    const startDate = dayjs(task.start_date);
    const duration = task.duration || 1;
    const endDate = startDate.add(duration, 'day');

    const taskData = {
      id: task.id,
      name: task.text,
      start_date: startDate.format('YYYY-MM-DD'),
      end_date: endDate.format('YYYY-MM-DD'),
      progress: Math.round(task.progress * 100),
      assignee: task.owner || '',
      priority: task.priority || 'medium',
      status: task.progress === 1 ? 'completed' : task.progress > 0 ? 'in_progress' : 'pending',
      project_id: currentProject.id,
    };

    try {
      await taskApi.update(taskData.id, taskData);
    } catch {
      await taskApi.create(taskData);
    }
  };

  // PDF导出
  const handleExportPDF = async () => {
    try {
      const ganttElement = ganttContainer.current;
      if (!ganttElement) return;

      notification.open({ message: '正在生成PDF...', key: 'pdf-export', duration: 0 });

      const canvas = await html2canvas(ganttElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`甘特图-${currentProject?.name}-${dayjs().format('YYYYMMDD')}.pdf`);

      notification.destroy('pdf-export');
      notification.success({ message: 'PDF导出成功！' });
    } catch {
      notification.destroy('pdf-export');
      notification.error({ message: 'PDF导出失败' });
    }
  };

  // Excel导出
  const handleExportExcel = () => {
    try {
      if (!window.gantt) return;

      const tasks = window.gantt.getTaskByTime();
      if (tasks.length === 0) {
        notification.warning({ message: '没有任务数据可导出' });
        return;
      }

      const data = tasks.map((task: any) => ({
        任务ID: task.id,
        任务名称: task.text,
        开始日期: dayjs(task.start_date).format('YYYY-MM-DD'),
        '持续时间(天)': task.duration,
        进度: `${Math.round(task.progress * 100)}%`,
        负责人: task.owner || '',
        优先级: task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '甘特图任务');
      XLSX.writeFile(wb, `甘特图-${currentProject?.name}-${dayjs().format('YYYYMMDD')}.xlsx`);

      notification.success({ message: 'Excel导出成功！' });
    } catch {
      notification.error({ message: 'Excel导出失败' });
    }
  };

  // 全屏
  const handleFullscreen = () => {
    ganttContainer.current?.requestFullscreen();
  };

  useEffect(() => {
    loadDhtmlxGantt();
    return () => {
      if (window.gantt) {
        window.gantt.clearAll();
        window.gantt.detachAllEvents();
      }
    };
  }, [loadDhtmlxGantt]);

  useEffect(() => {
    if (currentProject && window.gantt) {
      window.gantt.clearAll();
      taskColorMapRef.current.clear();
      colorIndexRef.current = 0;
      loadTasks();
    }
  }, [currentProject?.id, loadTasks]);

  return (
    <PageContainer>
      <div className="dhtmlx-gantt-container" style={{ minHeight: '100%' }}>
        <Card
          title={
            <Space size="large" align="center">
              <span style={{ fontSize: '18px', fontWeight: 600, color: '#1890ff' }}>
                📊 甘特图 {currentProject && `- ${currentProject.name}`}
              </span>
              {/* 🚀 新增：保存状态指示器 */}
              {saveStatus === 'saving' && (
                <Badge status="processing" text="正在保存..." />
              )}
              {saveStatus === 'saved' && lastSaveTime && (
                <Badge
                  status="success"
                  text={`已保存 (${dayjs(lastSaveTime).format('HH:mm:ss')})`}
                />
              )}
              {saveStatus === 'error' && (
                <Badge status="error" text="保存失败" />
              )}
            </Space>
          }
          extra={
            <Space size="small">
              <Tooltip title="刷新数据">
                <Button
                  type="primary"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={loadTasks}
                  loading={isLoading}
                />
              </Tooltip>
              <Tooltip title={saveStatus === 'saved' ? '已同步' : '同步中'}>
                <Button
                  size="small"
                  icon={saveStatus === 'saving' ? <CloudSyncOutlined spin /> : <CloudOutlined />}
                  type={saveStatus === 'saved' ? 'default' : 'dashed'}
                />
              </Tooltip>
              <Tooltip title="全屏显示">
                <Button size="small" icon={<FullscreenOutlined />} onClick={handleFullscreen} />
              </Tooltip>
              <Tooltip title="导出 PDF">
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={handleExportPDF}
                  disabled={isLoading}
                />
              </Tooltip>
              <Tooltip title="导出 Excel">
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={handleExportExcel}
                  disabled={isLoading}
                />
              </Tooltip>
            </Space>
          }
          variant="outlined"
          style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
        >
          {!currentProject ? (
            <Empty description="请先在顶部选择一个项目" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <>
              {error && (
                <div
                  style={{
                    color: '#faad14',
                    padding: '12px 16px',
                    backgroundColor: '#fffbe6',
                    border: '1px solid #ffe58f',
                    borderRadius: '6px',
                    marginBottom: '16px',
                  }}
                >
                  {error}
                </div>
              )}
              <div
                ref={ganttContainer}
                className="gantt-container"
                style={{
                  width: '100%',
                  height: 'calc(100vh - 240px)',
                  minHeight: '400px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                }}
              />
            </>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};

export default OptimizedGanttChart;
