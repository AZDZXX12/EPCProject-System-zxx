/**
 * 优化版甘特图组件
 * 
 * 🚀 核心优化：
 * 1. 预加载DHTMLX库（本地优先）
 * 2. 智能缓存策略（离线优先）
 * 3. 实时保存指示器
 * 4. 性能监控
 * 5. 错误边界保护
 * 6. Ganttable特色功能
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Button, Space, Tooltip, Empty, App, Badge, Modal } from 'antd';
import { 
  ReloadOutlined, 
  DownloadOutlined, 
  FullscreenOutlined,
  CloudOutlined,
  CloudSyncOutlined,
  BulbOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  ApartmentOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useProject } from '../contexts/ProjectContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { StorageManager } from '../utils/StorageManager';
import { taskApi } from '../services/api';
import { logger } from '../utils/logger';
import AIGanttGenerator from '../components/AIGanttGenerator';
import TaskBarCustomizer, { generateTaskBarText } from '../components/TaskBarCustomizer';
import { applyFloatTimeToGantt, generateFloatTimeReport } from '../utils/floatTimeAnalyzer';
import './OptimizedGanttChart.css';

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

interface OptimizedGanttChartProps {
  autoFullscreen?: boolean;
  initialScale?: 'day' | 'week' | 'month';
  hideTitle?: boolean;
}

const OptimizedGanttChart: React.FC<OptimizedGanttChartProps> = ({ 
  autoFullscreen = false, 
  initialScale = 'day', 
  hideTitle = false 
}) => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const { currentProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const ganttInitializedRef = useRef(false);
  const { notification, message } = App.useApp();

  // 性能监控
  usePerformanceMonitor('OptimizedGanttChart');

  // 自动保存状态
  const { saveStatus, lastSaveTime, markSaving, markSaved, markError } = useAutoSaveIndicator();

  // 颜色管理
  const taskColorMapRef = useRef(new Map<string, number>());
  const colorIndexRef = useRef(0);

  // 🎯 Ganttable特色功能状态
  const [aiGenVisible, setAiGenVisible] = useState(false);
  const [customizerVisible, setCustomizerVisible] = useState(false);
  const [displayFields, setDisplayFields] = useState(['text', 'progress', 'status']);
  const [taskGroupBy, setTaskGroupBy] = useState<string>('');
  const [viewScale, setViewScale] = useState<'day' | 'week' | 'month'>(initialScale);

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
    logger.info('[甘特图] 开始加载DHTMLX Gantt库...');
    
    if (window.gantt && window.__ganttScriptLoaded) {
      logger.info('[甘特图] 库已加载，直接初始化');
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
          logger.warn(`[甘特图] 加载超时，尝试下一个源: ${src}`);
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
      logger.info('[甘特图] 开始加载CSS和JS资源...');
      await Promise.all([loadCSS(CSS_SOURCES), loadJS(JS_SOURCES)]);
      logger.info('[甘特图] 资源加载成功，开始初始化');
      
      // 等待gantt对象可用
      let retries = 0;
      while (!window.gantt && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      if (window.gantt) {
        logger.info('[甘特图] gantt对象已就绪，执行初始化');
        initGantt();
      } else {
        throw new Error('gantt对象未能加载');
      }
    } catch (err) {
      logger.error('[甘特图] 资源加载失败:', err);
      notification.error({
        message: '甘特图加载失败',
        description: '无法加载DHTMLX Gantt库，请检查网络连接或本地文件。错误: ' + (err as Error).message,
        duration: 0,
      });
    }
  }, []);

  // 初始化甘特图
  const initGantt = useCallback(() => {
    logger.info('[甘特图] initGantt被调用');
    logger.debug('[甘特图] 检查条件:', {
      hasContainer: !!ganttContainer.current,
      hasGantt: !!window.gantt,
      isInitialized: ganttInitializedRef.current
    });
    
    if (!ganttContainer.current || !window.gantt || ganttInitializedRef.current) {
      logger.warn('[甘特图] 初始化条件不满足，跳过');
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
    
    // 🎯 Tooltip配置（悬浮显示详细信息）
    gantt.config.tooltip_timeout = 30;
    gantt.config.touch_drag = 500;
    gantt.plugins({
      tooltip: true
    });
    
    // 自定义Tooltip模板
    gantt.templates.tooltip_text = function(start, end, task) {
      const startDate = gantt.date.date_to_str('%Y-%m-%d')(start);
      const endDate = gantt.date.date_to_str('%Y-%m-%d')(end);
      const progress = Math.round((task.progress || 0) * 100);
      
      return `<div class="gantt-tooltip">
        <div class="tooltip-title">${task.text}</div>
        <div class="tooltip-info">
          <div><strong>开始：</strong>${startDate}</div>
          <div><strong>结束：</strong>${endDate}</div>
          <div><strong>工期：</strong>${task.duration || 0}天</div>
          <div><strong>进度：</strong>${progress}%</div>
          ${task.owner ? `<div><strong>负责人：</strong>${task.owner}</div>` : ''}
          ${task.priority ? `<div><strong>优先级：</strong>${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</div>` : ''}
        </div>
      </div>`;
    };

    // 中文本地化
    gantt.locale = {
      date: {
        month_full: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        month_short: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        day_full: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        day_short: ['日', '一', '二', '三', '四', '五', '六'],
      },
      labels: {
        new_task: '新建任务',
        icon_save: '保存',
        icon_cancel: '取消',
        icon_delete: '删除',
        confirm_closing: '确认关闭吗？未保存的修改将丢失！',
        confirm_deleting: '确认删除任务吗？',
        section_description: '任务描述',
        section_text: '任务名称',
        section_start_date: '开始时间',
        section_end_date: '结束时间',
        section_duration: '持续时间',
        section_type: '任务类型',
        section_parent: '父任务',
        section_progress: '进度',
        section_owner: '负责人',
        section_priority: '优先级',
        section_time: '时间',
        
        // 🎯 按钮和操作
        button_save: '保存',
        button_cancel: '取消',
        button_delete: '删除',
        
        // 🎯 列标题
        column_text: '任务名称',
        column_start_date: '开始日期',
        column_duration: '工期',
        column_add: '添加',
        
        // 🎯 消息提示
        message_ok: '确定',
        message_cancel: '取消',
        
        // 🎯 链接类型
        link: '关联',
        link_start: '开始',
        link_end: '结束',
        
        // 🎯 Lightbox弹窗标题
        'Details': '任务详情',
        'Type': '类型',
        'Task': '任务',
        'Project': '项目',
        'Milestone': '里程碑',
        
        // 🎯 时间选择器
        'Hours': '小时',
        'Minutes': '分钟',
        'Days': '天',
        'Weeks': '周',
        'Months': '月',
        'Years': '年',
        type_task: '任务',
        type_project: '项目',
        type_milestone: '里程碑',
        
        // 🎯 时间单位
        minutes: '分钟',
        hours: '小时',
        days: '天',
        weeks: '周',
        months: '月',
        years: '年',
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
    gantt.config.details_on_dblclick = true;  // 双击编辑
    gantt.config.drag_resize = true;          // 拖拽调整时长
    gantt.config.drag_move = true;            // 拖拽移动任务
    gantt.config.drag_progress = true;        // 拖拽调整进度
    gantt.config.drag_links = true;           // 🎯 拖拽创建依赖关系
    
    // 🎯 编辑弹窗配置
    gantt.config.lightbox.sections = [
      {name: 'description', height: 38, map_to: 'text', type: 'textarea', focus: true},
      {name: 'owner', height: 22, map_to: 'owner', type: 'textarea'},
      {name: 'priority', height: 22, map_to: 'priority', type: 'select', options: [
        {key: 'high', label: '高'},
        {key: 'medium', label: '中'},
        {key: 'low', label: '低'}
      ]},
      {name: 'time', type: 'duration', map_to: 'auto'}
    ];
    
    // 🎯 任务条配色（按状态和优先级）
    gantt.templates.task_class = function(start: any, end: any, task: any) {
      const classes: any = [];
      
      // 按优先级着色
      if (task.priority === 'high') classes.push('task-priority-high');
      else if (task.priority === 'medium') classes.push('task-priority-medium');
      else if (task.priority === 'low') classes.push('task-priority-low');
      
      // 按进度着色
      if (task.progress === 1) classes.push('task-completed');
      else if (task.progress > 0) classes.push('task-in-progress');
      else classes.push('task-not-started');
      
      return classes.join(' ');
    };

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
    logger.info('[甘特图] 执行gantt.init...');
    gantt.init(ganttContainer.current);
    ganttInitializedRef.current = true;
    window.__ganttInitialized = true;
    logger.info('[甘特图] 初始化完成！');

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

  // 🎯 AI生成甘特图处理
  const handleAIGenerate = useCallback((tasks: any[]) => {
    if (!window.gantt) return;
    
    // 添加AI生成的任务
    tasks.forEach(task => {
      window.gantt.addTask(task);
    });
    
    window.gantt.render();
    notification.success({ message: `成功生成 ${tasks.length} 个任务！` });
    setAiGenVisible(false);
  }, [notification]);

  // 🎯 浮动时间分析处理
  const handleFloatTimeAnalysis = useCallback(() => {
    if (!window.gantt) return;
    
    const results = applyFloatTimeToGantt(window.gantt);
    const report = generateFloatTimeReport(results);
    
    Modal.info({
      title: '⏱️ 浮动时间分析报告',
      content: <pre style={{ maxHeight: '400px', overflow: 'auto' }}>{report}</pre>,
      width: 700,
      okText: '关闭'
    });
  }, []);

  // 🎯 任务分组处理（groupBy为付费版功能，使用筛选替代）
  const handleTaskGrouping = useCallback(() => {
    if (!window.gantt) return;
    
    Modal.info({
      title: '📊 任务分组',
      content: (
        <div>
          <p>可使用列头筛选功能按以下维度分组：</p>
          <ul>
            <li>按负责人筛选</li>
            <li>按优先级筛选</li>
            <li>按进度筛选</li>
          </ul>
          <p>点击列头可进行排序和筛选</p>
        </div>
      ),
      okText: '知道了'
    });
  }, []);

  // 🎯 任务条显示定制处理
  const handleDisplayFieldsChange = useCallback((fields: string[]) => {
    setDisplayFields(fields);
    if (window.gantt) {
      // 更新任务条显示
      window.gantt.templates.task_text = function(_start: any, _end: any, task: any) {
        return generateTaskBarText(task, fields);
      };
      window.gantt.render();
    }
  }, []);

  // 🎯 时间轴缩放切换
  const handleScaleChange = useCallback((scale: 'day' | 'week' | 'month') => {
    if (!window.gantt) return;
    
    setViewScale(scale);
    
    // 配置不同的时间刻度
    if (scale === 'day') {
      window.gantt.config.scale_unit = 'day';
      window.gantt.config.date_scale = '%m月%d日';
      window.gantt.config.subscales = [
        {unit: 'month', step: 1, date: '%Y年%m月'}
      ];
      window.gantt.config.scale_height = 50;
    } else if (scale === 'week') {
      window.gantt.config.scale_unit = 'week';
      window.gantt.config.date_scale = '第%W周';
      window.gantt.config.subscales = [
        {unit: 'month', step: 1, date: '%Y年%m月'}
      ];
      window.gantt.config.scale_height = 50;
    } else if (scale === 'month') {
      window.gantt.config.scale_unit = 'month';
      window.gantt.config.date_scale = '%Y年%m月';
      window.gantt.config.subscales = [
        {unit: 'year', step: 1, date: '%Y年'}
      ];
      window.gantt.config.scale_height = 50;
    }
    
    window.gantt.render();
    notification.success({ message: `已切换到${scale === 'day' ? '日' : scale === 'week' ? '周' : '月'}视图` });
  }, [notification]);

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
    <div className="gantt-page-wrapper">
      <Card
        className="gantt-card-compact"
        styles={{ body: { padding: 0 } }}
          extra={
            <Space size="small">
              <Tooltip title="新增任务">
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    logger.info('[甘特图] 点击新建任务按钮', { currentProject });
                    
                    if (!currentProject) {
                      logger.warn('[甘特图] 新建任务失败：未选择项目');
                      Modal.confirm({
                        title: '请先选择项目',
                        content: (
                          <div>
                            <p>创建任务前需要选择一个项目。</p>
                            <p>您可以：</p>
                            <ul>
                              <li>在左侧菜单选择项目</li>
                              <li>或访问工作台创建新项目</li>
                            </ul>
                          </div>
                        ),
                        okText: '前往工作台',
                        cancelText: '取消',
                        onOk: () => {
                          window.location.href = '/workspace';
                        }
                      });
                      return;
                    }
                    
                    if (!window.gantt) {
                      logger.error('[甘特图] 新建任务失败：gantt对象不存在');
                      message.error('甘特图未初始化，请刷新页面重试');
                      return;
                    }
                    
                    try {
                      logger.info('[甘特图] 开始创建新任务...');
                      const newTaskId = window.gantt.createTask({
                        text: '新任务',
                        start_date: new Date(),
                        duration: 3,
                        progress: 0,
                        owner: '',
                        priority: 'medium',
                        project_id: currentProject.id
                      });
                      logger.info('[甘特图] 新任务创建成功，ID:', newTaskId);
                      
                      // 打开编辑弹窗
                      window.gantt.showLightbox(newTaskId);
                      logger.info('[甘特图] 任务编辑弹窗已打开');
                    } catch (error: any) {
                      logger.error('[甘特图] 创建任务失败:', error);
                      message.error('创建任务失败: ' + (error?.message || '未知错误'));
                    }
                  }}
                />
              </Tooltip>
              <Tooltip title="刷新数据">
                <Button
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
              <Tooltip title="切换时间视图">
                <span>
                  <Space.Compact size="small">
                    <Button
                      type={viewScale === 'day' ? 'primary' : 'default'}
                      onClick={() => handleScaleChange('day')}
                    >
                      日
                    </Button>
                    <Button
                      type={viewScale === 'week' ? 'primary' : 'default'}
                      onClick={() => handleScaleChange('week')}
                    >
                      周
                    </Button>
                    <Button
                      type={viewScale === 'month' ? 'primary' : 'default'}
                      onClick={() => handleScaleChange('month')}
                    >
                      月
                    </Button>
                  </Space.Compact>
                </span>
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
              <Tooltip title="AI智能生成甘特图">
                <Button
                  type="primary"
                  size="small"
                  icon={<BulbOutlined />}
                  onClick={() => setAiGenVisible(true)}
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                >
                  AI生成
                </Button>
              </Tooltip>
              <Tooltip title="定制任务条显示信息">
                <Button
                  size="small"
                  icon={<SettingOutlined />}
                  onClick={() => setCustomizerVisible(true)}
                />
              </Tooltip>
              <Tooltip title="浮动时间分析">
                <Button
                  size="small"
                  icon={<ClockCircleOutlined />}
                  onClick={handleFloatTimeAnalysis}
                />
              </Tooltip>
              <Tooltip title="任务智能分组">
                <Button
                  size="small"
                  icon={<ApartmentOutlined />}
                  onClick={handleTaskGrouping}
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
                  height: '100%',
                  border: 'none',
                }}
              />
            </>
          )}
        </Card>

        {/* 🎯 Ganttable特色功能组件 */}
        <AIGanttGenerator
          visible={aiGenVisible}
          onClose={() => setAiGenVisible(false)}
          onGenerate={handleAIGenerate}
        />

        <TaskBarCustomizer
          visible={customizerVisible}
          onClose={() => setCustomizerVisible(false)}
          onSave={handleDisplayFieldsChange}
          currentFields={displayFields}
        />
      </div>
  );
};

export default OptimizedGanttChart;
