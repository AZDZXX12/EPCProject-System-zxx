import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Space, Tooltip, Empty, App } from 'antd';
import { ReloadOutlined, DownloadOutlined, FullscreenOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useProject } from '../contexts/ProjectContext';
import PageContainer from '../components/Layout/PageContainer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { eventBus, EVENTS, TaskEventData } from '../utils/EventBus';
import { StorageManager } from '../utils/StorageManager';
import { taskApi } from '../services/api';
import { generateTaskId } from '../utils/IdGenerator';
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

const DhtmlxGanttChart: React.FC = () => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const { currentProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const ganttInitializedRef = useRef(false);
  const scriptLoadingRef = useRef(false);

  // 🔧 使用App.useApp()获取notification API
  const { notification } = App.useApp();

  // 🔧 修复：将颜色映射移到组件级别，确保项目切换后颜色保持一致
  const taskColorMapRef = useRef(new Map<string, number>());
  const colorIndexRef = useRef(0);

  // 🎨 优化后的颜色方案：每个任务不同颜色，未完成颜色更深
  const colorPalette = [
    { bar: '#1890ff', progress: '#0050b3' }, // 蓝色 - 更深
    { bar: '#52c41a', progress: '#237804' }, // 绿色 - 更深
    { bar: '#fa8c16', progress: '#d46b08' }, // 橙色 - 更深
    { bar: '#722ed1', progress: '#391085' }, // 紫色 - 更深
    { bar: '#eb2f96', progress: '#9e1068' }, // 粉色 - 更深
    { bar: '#13c2c2', progress: '#006d75' }, // 青色 - 更深
    { bar: '#faad14', progress: '#d48806' }, // 金色 - 更深
    { bar: '#2f54eb', progress: '#10239e' }, // 深蓝 - 更深
  ];

  // 统一颜色计算（组件级，供初始化与数据加载共用）
  const computeTaskColors = (task: any) => {
    // ⚠️ 确保任务有type属性（DHTMLX Gantt lightbox必需）
    task.type = task.type || 'task';

    const progress = task.progress || 0;
    const now = new Date();
    const end = task.end_date instanceof Date ? task.end_date : new Date(task.end_date);
    const isDelayed =
      end instanceof Date && !isNaN(end.getTime()) ? end < now && progress < 1 : false;

    // 延期任务 - 红色（最高优先级）
    if (isDelayed) {
      task.color = '#ff4d4f';
      task.progressColor = '#cf1322';
      return task;
    }

    // 获取或分配任务的颜色索引
    let colorIndex = taskColorMapRef.current.get(task.id);
    if (colorIndex === undefined) {
      // 🎨 自动分配：如果任务还没有颜色索引，立即分配一个
      colorIndex = colorIndexRef.current % colorPalette.length;
      taskColorMapRef.current.set(task.id, colorIndex);
      colorIndexRef.current++;
      logger.debug('[Gantt] 🎨 自动分配颜色:', task.id, '索引:', colorIndex);
    }

    const colors = colorPalette[colorIndex];

    // ✅ 优化方案：所有任务都保持各自的独特颜色，方便区分
    // 任务条：使用调色板的独特亮色
    task.color = colors.bar;
    // 进度条：使用对应的深色
    task.progressColor = colors.progress;

    return task;
  };

  useEffect(() => {
    // 动态加载 DHTMLX Gantt 资源（带全局防重，兼容 React StrictMode）
    const loadDhtmlxGantt = async () => {
      // 如果脚本已加载，直接初始化
      if (window.gantt && window.__ganttScriptLoaded) {
        initGantt();
        return;
      }
      if (scriptLoadingRef.current || window.__ganttScriptLoaded) return;
      scriptLoadingRef.current = true;

      // 🚀 优化：优先使用CDN，失败时回退到本地文件
      const CSS_SOURCES = [
        'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css', // CDN主源
        '/gantt-master/codebase/dhtmlxgantt.css', // 本地备份
      ];

      const JS_SOURCES = [
        'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js', // CDN主源
        '/gantt-master/codebase/dhtmlxgantt.js', // 本地备份
      ];

      // 加载 CSS（防重复注入，添加错误处理）
      const loadCSS = (sources: string[], index = 0) => {
        if (index >= sources.length) {
          console.error('[Gantt] ❌ All CSS sources failed');
          return;
        }

        const href = sources[index];
        if (document.querySelector(`link[href="${href}"]`)) {
          logger.debug(`[Gantt] CSS already loaded: ${href}`);
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => {
          logger.debug(`[Gantt] ✅ CSS loaded from: ${href}`);
        };
        link.onerror = () => {
          console.warn(`[Gantt] ⚠️ Failed to load CSS from: ${href}, trying next...`);
          loadCSS(sources, index + 1);
        };
        document.head.appendChild(link);
      };

      loadCSS(CSS_SOURCES);

      // 加载 JS（防重复注入，添加错误处理，支持CDN回退）
      const loadJS = (sources: string[], index = 0) => {
        if (index >= sources.length) {
          console.error('[Gantt] ❌ All JS sources failed');
          notification.error({
            message: '甘特图库加载失败',
            description: '无法从CDN或本地加载DHTMLX Gantt库，请检查网络连接',
            duration: 5,
          });
          return;
        }

        const src = sources[index];
        if (document.querySelector(`script[src="${src}"]`)) {
          logger.debug(`[Gantt] JS already loaded: ${src}`);
          window.__ganttScriptLoaded = true;
          initGantt();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          logger.debug(`[Gantt] ✅ JS loaded from: ${src}`);
          window.__ganttScriptLoaded = true;
          initGantt();
        };
        script.onerror = () => {
          console.warn(`[Gantt] ⚠️ Failed to load JS from: ${src}, trying next...`);
          loadJS(sources, index + 1);
        };
        document.body.appendChild(script);
      };

      loadJS(JS_SOURCES);
    };

    loadDhtmlxGantt();

    return () => {
      if (window.gantt) {
        try {
          window.gantt.clearAll();
          window.gantt.detachAllEvents();
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Gantt cleanup warning:', e);
          }
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initGantt = () => {
    if (!ganttContainer.current || !window.gantt) return;
    if (ganttInitializedRef.current || window.__ganttInitialized) return; // 防止重复初始化

    const gantt = window.gantt;

    // 配置甘特图
    gantt.config.date_format = '%Y-%m-%d %H:%i';
    gantt.config.xml_date = '%Y-%m-%d %H:%i';
    gantt.config.min_column_width = 35; // 减小最小列宽，优化横向滚动条长度
    gantt.config.row_height = 40; // 增加行高，方便拖拽
    gantt.config.bar_height = 28; // 增加进度条高度，方便点击和拖拽

    // 🔧 关键修复：使用日历天数计算（包含周末），而非工作日
    gantt.config.work_time = false; // 禁用工作时间计算，使用日历天数
    gantt.config.skip_off_time = false; // 不跳过周末
    gantt.config.duration_unit = 'day'; // 工期单位：天（日历天）
    gantt.config.duration_step = 1; // 工期步长：1天
    gantt.config.round_dnd_dates = false; // 禁用日期舍入，精确控制日期

    // 🔧 日期格式配置
    gantt.config.date_format = '%Y-%m-%d'; // 统一使用YYYY-MM-DD格式
    gantt.config.xml_date = '%Y-%m-%d'; // API数据交换格式

    // 时间刻度配置 - 显示星期和日期（两行）
    gantt.config.scales = [
      { unit: 'week', step: 1, format: '%Y年%M 第%W周' },
      { unit: 'day', step: 1, format: '%d %D' }, // 日期 + 星期
    ];
    gantt.config.scale_height = 54;

    // 中文本地化
    gantt.locale = {
      date: {
        month_full: [
          '一月',
          '二月',
          '三月',
          '四月',
          '五月',
          '六月',
          '七月',
          '八月',
          '九月',
          '十月',
          '十一月',
          '十二月',
        ],
        month_short: [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月',
        ],
        day_full: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        day_short: ['日', '一', '二', '三', '四', '五', '六'],
      },
      labels: {
        new_task: '新任务',
        icon_save: '保存',
        icon_cancel: '取消',
        icon_details: '详情',
        icon_edit: '编辑',
        icon_delete: '删除',
        confirm_closing: '您的修改将会丢失，确认关闭吗？',
        confirm_deleting: '任务将被永久删除，是否确认？',
        section_description: '描述',
        section_text: '任务名称',
        section_start_date: '开始时间',
        section_duration: '持续时间',
        section_parent: '父任务',
        section_progress: '进度 %',
        section_owner: '负责人',
        section_priority: '优先级',
        section_time: '时间段',
        section_type: '类型',
        column_text: '任务名称',
        column_start_date: '开始时间',
        column_duration: '工期',
        column_add: '',
        link: '关联',
        confirm_link_deleting: '将被删除',
        link_start: '开始',
        link_end: '结束',
        type_task: '任务',
        type_project: '项目',
        type_milestone: '里程碑',
        minutes: '分钟',
        hours: '小时',
        days: '天',
        weeks: '周',
        months: '月',
        years: '年',
        // 🔧 添加按钮汉化
        message_ok: '确定',
        message_cancel: '取消',
      },
    };

    // 兜底：明确设置按钮文本（两套key都设置，防止undefined）
    gantt.locale.labels.icon_save = gantt.locale.labels.icon_save || '保存';
    gantt.locale.labels.icon_cancel = gantt.locale.labels.icon_cancel || '取消';
    gantt.locale.labels.icon_delete = gantt.locale.labels.icon_delete || '删除';
    gantt.locale.labels.gantt_save_btn =
      gantt.locale.labels.gantt_save_btn || gantt.locale.labels.icon_save;
    gantt.locale.labels.gantt_cancel_btn =
      gantt.locale.labels.gantt_cancel_btn || gantt.locale.labels.icon_cancel;
    gantt.locale.labels.gantt_delete_btn =
      gantt.locale.labels.gantt_delete_btn || gantt.locale.labels.icon_delete;

    // 启用拖拽并优化拖拽体验
    gantt.config.drag_resize = true; // 启用任务长度调整
    gantt.config.drag_move = true; // 启用任务移动
    gantt.config.drag_links = true; // 启用任务关联
    gantt.config.drag_progress = true; // 启用进度条拖拽
    gantt.config.round_dnd_dates = true;

    // 🔧 统一的任务加载事件（合并过滤和颜色分配）
    gantt.attachEvent('onTaskLoading', (task: any) => {
      // 1️⃣ 过滤其他项目的任务
      if (currentProject && task.project_id && task.project_id !== currentProject.id) {
        console.warn('[Gantt] 跳过其他项目的任务:', task.id, '项目ID:', task.project_id);
        return false; // 不加载其他项目的任务
      }

      // 2️⃣ 为每个任务分配固定颜色（基于任务ID）
      if (!taskColorMapRef.current.has(task.id)) {
        const colorIdx = colorIndexRef.current % colorPalette.length;
        taskColorMapRef.current.set(task.id, colorIdx);
        colorIndexRef.current++;
      }

      return true; // ✅ 加载当前项目的任务
    });

    // 进度条拖拽的精度设置
    gantt.config.drag_timeline = {
      ignore: '.gantt_task_progress', // 不影响进度条区域
      useKey: false, // 不需要按键辅助
    };

    // 配置列
    gantt.config.columns = [
      {
        name: 'wbs',
        label: '序号',
        align: 'center',
        width: 60,
        template: (task: any) => {
          return task.$index + 1; // 自动序号，从1开始
        },
      },
      { name: 'text', label: '任务名称', tree: true, width: 200 },
      { name: 'start_date', label: '开始日期', align: 'center', width: 100 },
      { name: 'duration', label: '工期(天)', align: 'center', width: 70 },
      {
        name: 'progress',
        label: '进度',
        align: 'center',
        width: 80,
        template: (task: any) => {
          return Math.round(task.progress * 100) + '%';
        },
      },
      { name: 'owner', label: '负责人', align: 'center', width: 100 },
      {
        name: 'add',
        label: '',
        width: 44,
        template: () => {
          return '<div class="gantt_add"></div>';
        },
      },
    ];

    // 🔧 重要：必须在init()之前完成所有配置

    // 1️⃣ 配置lightbox sections
    gantt.config.lightbox.sections = [
      { name: 'description', height: 38, map_to: 'text', type: 'textarea', focus: true },
      { name: 'owner', height: 22, map_to: 'owner', type: 'textarea' },
      {
        name: 'priority',
        height: 22,
        map_to: 'priority',
        type: 'select',
        options: [
          { key: 'high', label: '高' },
          { key: 'medium', label: '中' },
          { key: 'low', label: '低' },
        ],
      },
      { name: 'time', type: 'duration', map_to: 'auto' },
    ];

    // 2️⃣ 补充lightbox标签（不覆盖，只添加）
    gantt.locale.labels.section_description = '任务描述';
    gantt.locale.labels.section_owner = '负责人';
    gantt.locale.labels.section_priority = '优先级';
    gantt.locale.labels.section_time = '时间段';

    // 3️⃣ 启用默认双击编辑
    gantt.config.details_on_dblclick = true; // ✅ 启用DHTMLX标准lightbox
    gantt.config.details_on_create = true; // 创建时也显示

    // 安全钩子：打开光箱前确保任务存在且有type
    gantt.attachEvent('onBeforeLightbox', (id: any) => {
      try {
        const t = gantt.getTask(id);
        if (!t) return false;
        if (!t.type) t.type = 'task';
        return true;
      } catch {
        return false;
      }
    });

    // 任务颜色 - 根据进度百分比显示不同颜色
    // 任务CSS类 - 用于应用样式
    gantt.templates.task_class = (_start: any, end: any, task: any) => {
      const progress = task.progress || 0;
      const now = new Date();
      const isDelayed = end < now && progress < 1;

      // 延期任务显示红色警告
      if (isDelayed) {
        return 'gantt-task-delayed';
      }

      // 按进度百分比显示不同颜色
      if (progress === 0) {
        return 'gantt-progress-not-started'; // 未开始：灰色
      } else if (progress > 0 && progress < 0.3) {
        return 'gantt-progress-starting'; // 刚开始(0-30%)：淡红
      } else if (progress >= 0.3 && progress < 0.7) {
        return 'gantt-progress-in-progress'; // 进行中(30-70%)：蓝色
      } else if (progress >= 0.7 && progress < 1) {
        return 'gantt-progress-mostly-done'; // 接近完成(70-99%)：橙色
      } else {
        return 'gantt-progress-completed'; // 已完成(100%)：绿色
      }
    };

    // 关键：在parse之前设置模板，确保渲染时生效
    gantt.templates.task_class = (_start: any, end: any, task: any) => {
      const progress = task.progress || 0;
      const now = new Date();
      const isDelayed = end < now && progress < 1;

      if (isDelayed) return 'gantt-task-delayed';
      if (progress === 0) return 'gantt-progress-not-started';
      if (progress < 0.3) return 'gantt-progress-starting';
      if (progress < 0.7) return 'gantt-progress-in-progress';
      if (progress < 1) return 'gantt-progress-mostly-done';
      return 'gantt-progress-completed';
    };

    // ❌ 删除重复的任务颜色配置和事件监听器（已在上面统一处理）

    gantt.attachEvent('onGanttRender', () => {
      const tasks = gantt.getTaskByTime();
      tasks.forEach((task: any) => {
        const taskEl = gantt.getTaskNode(task.id);
        if (taskEl) {
          const lineEl = taskEl.querySelector('.gantt_task_line');
          const progressEl = taskEl.querySelector('.gantt_task_progress');

          if (lineEl && progressEl) {
            // 🎨 使用新的动态颜色计算（保持色相区分）
            const coloredTask = computeTaskColors(task);

            // 🔧 关键修复：使用cssText确保样式优先级最高，覆盖所有CSS
            lineEl.style.cssText = `
              background: ${coloredTask.color} !important;
              border: 2px solid ${coloredTask.color} !important;
            `;

            progressEl.style.cssText = `
              background: ${coloredTask.progressColor} !important;
            `;

            // 确保文字可见
            const textEl = taskEl.querySelector('.gantt_task_content');
            if (textEl instanceof HTMLElement) {
              textEl.style.cssText = `
                color: #fff !important;
                font-weight: 500 !important;
                text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
              `;
            }
          }
        }
      });
    });

    // 任务文本内容 - 显示进度百分比
    gantt.templates.task_text = (_start: any, _end: any, task: any) => {
      const progress = Math.round((task.progress || 0) * 100);
      return `${task.text} (${progress}%)`;
    };

    // 覆盖任务DOM，直接设置背景色
    gantt.templates.task_unscheduled_time = function (_task: any) {
      return '';
    };

    // 工具提示 - 增强显示
    gantt.templates.tooltip_text = (start: any, end: any, task: any) => {
      const progress = Math.round((task.progress || 0) * 100);
      const now = new Date();
      const isDelayed = end < now && progress < 100;
      const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let statusText = '';
      if (progress === 0) {
        statusText = '<span style="color: #8c8c8c;">⚪ 未开始</span>';
      } else if (progress === 100) {
        statusText = '<span style="color: #52c41a;">✅ 已完成</span>';
      } else if (isDelayed) {
        statusText = '<span style="color: #ff4d4f;">⚠️ 已延期</span>';
      } else if (daysRemaining < 3 && progress < 70) {
        statusText = '<span style="color: #faad14;">⏰ 即将到期</span>';
      } else {
        statusText = '<span style="color: #1890ff;">🔄 进行中</span>';
      }

      return `
        <div style="padding: 8px; min-width: 200px;">
          <b style="font-size: 14px; color: #262626;">${task.text}</b><br/>
          <div style="margin: 8px 0; padding: 6px; background: #fafafa; border-radius: 4px;">
            <b>状态:</b> ${statusText}<br/>
            <b>进度:</b> <span style="color: ${progress === 100 ? '#52c41a' : progress > 50 ? '#1890ff' : '#faad14'};">${progress}%</span><br/>
          </div>
          <b>开始:</b> ${gantt.templates.tooltip_date_format(start)}<br/>
          <b>结束:</b> ${gantt.templates.tooltip_date_format(end)}<br/>
          ${!isDelayed && daysRemaining >= 0 ? `<b>剩余:</b> ${daysRemaining} 天<br/>` : ''}
          ${isDelayed ? `<b style="color: #ff4d4f;">延期:</b> ${Math.abs(daysRemaining)} 天<br/>` : ''}
          ${task.owner ? `<b>负责人:</b> ${task.owner}<br/>` : ''}
          ${task.priority ? `<b>优先级:</b> ${task.priority === 'high' ? '<span style="color: #ff4d4f;">高</span>' : task.priority === 'medium' ? '<span style="color: #faad14;">中</span>' : '<span style="color: #52c41a;">低</span>'}<br/>` : ''}
        </div>
      `;
    };

    // 🔧 配置列显示，确保工期列显示Gantt内部的duration
    gantt.config.columns = [
      {
        name: 'wbs',
        label: '序号',
        align: 'center',
        width: 50,
        template: function (task: any) {
          // 获取任务在视图中的索引（从1开始）
          return gantt.getTaskIndex(task.id) + 1;
        },
      },
      { name: 'text', label: '任务名称', tree: true, width: '*', min_width: 150 },
      { name: 'start_date', label: '开始日期', align: 'center', width: 100 },
      {
        name: 'duration',
        label: '工期(天)',
        align: 'center',
        width: 70,
        // 🔧 关键：从Gantt内部读取duration，确保显示正确
        template: function (task: any) {
          return task.duration || 0;
        },
      },
      {
        name: 'progress',
        label: '进度',
        align: 'center',
        width: 70,
        template: function (task: any) {
          return Math.round((task.progress || 0) * 100) + '%';
        },
      },
      { name: 'owner', label: '负责人', align: 'center', width: 90 },
      { name: 'add', label: '', width: 44 },
    ];

    // 初始化甘特图
    gantt.init(ganttContainer.current);
    ganttInitializedRef.current = true;
    window.__ganttInitialized = true;

    logger.debug('[Gantt] 📋 列配置已应用');

    // ❌ 删除自定义双击事件，使用DHTMLX默认lightbox
    // 不需要 gantt.attachEvent('onTaskDblClick', ...)
    // 因为 details_on_dblclick = true 已经启用了标准lightbox

    // 加载数据
    loadTasks();

    // 🔧 关键修复：拦截新任务创建，重写ID生成逻辑
    gantt.attachEvent('onTaskCreated', (task: any) => {
      if (!currentProject) return true;

      // 🆕 使用智能ID生成器，避免冲突
      const existingTasks = gantt.getTaskByTime();
      const existingIds = existingTasks.map((t: any) => t.id);

      // 生成唯一ID（使用短ID，更简洁）
      task.id = generateTaskId(currentProject.id);

      // 确保ID唯一
      let attempts = 0;
      while (existingIds.includes(task.id) && attempts < 10) {
        task.id = generateTaskId(currentProject.id);
        attempts++;
      }

      task.project_id = currentProject.id;

      // ⚠️ 关键：DHTMLX Gantt的lightbox必须要有type属性
      task.type = task.type || 'task'; // 默认为普通任务

      // 设置默认值
      task.owner = task.owner || '';
      task.priority = task.priority || 'medium';

      // 🎨 关键修复：为新任务分配唯一颜色索引
      if (!taskColorMapRef.current.has(task.id)) {
        const colorIdx = colorIndexRef.current % colorPalette.length;
        taskColorMapRef.current.set(task.id, colorIdx);
        colorIndexRef.current++;
        logger.debug('[Gantt] 🎨 为新任务分配颜色:', task.id, '索引:', colorIdx);
      }

      // 应用颜色
      computeTaskColors(task);

      logger.debug(`[Gantt] 创建新任务 - ID: ${task.id}, 项目: ${currentProject.name}`);
      return true;
    });

    // 事件监听 - 注意：只在编辑已有任务时触发，不在初始加载时触发
    let isInitialLoad = true;

    // 🔧 关键修复：延迟重置isInitialLoad标志，避免影响正常的添加/更新事件
    setTimeout(() => {
      isInitialLoad = false;
      logger.debug('[Gantt] ✅ 初始化完成，事件监听已激活');
    }, 2000);

    gantt.attachEvent('onAfterTaskAdd', (_id: any, item: any) => {
      if (isInitialLoad) {
        logger.debug('[Gantt] 跳过初始加载事件: onAfterTaskAdd');
        return true;
      }
      logger.debug('[Gantt] 🎉 任务添加事件触发:', item.text);
      notification.success({ message: '任务已添加', duration: 2 });

      // 🎨 确保颜色已应用
      computeTaskColors(item);
      setTimeout(() => gantt.render(), 100); // 延迟重绘应用颜色

      // 💾 保存到LocalStorage
      if (currentProject) {
        const allTasks = gantt.getTaskByTime();
        const cacheKey = `gantt_tasks_${currentProject.id}`;
        StorageManager.save(cacheKey, { data: allTasks });
        logger.debug(`[Gantt] 💾 已保存 ${allTasks.length} 个任务到LocalStorage`);
      }

      // ✅ 静默保存到后端（不影响前端操作）
      saveTask(item).catch((err) => {
        console.warn('[Gantt] ⚠️ 后端保存失败，已保存到本地:', err.message);
        // 不显示错误通知，因为LocalStorage已保存
      });

      // 🔗 联动：发布任务创建事件
      if (currentProject) {
        eventBus.emit(EVENTS.TASK_CREATED, {
          id: item.id,
          projectId: currentProject.id,
          name: item.text,
          progress: (item.progress || 0) * 100,
          startDate: item.start_date,
          endDate: item.end_date,
        } as TaskEventData);
      }

      return true;
    });

    gantt.attachEvent('onAfterTaskUpdate', (_id: any, item: any) => {
      if (isInitialLoad) return true; // 忽略初始加载
      notification.success({ message: '任务已更新', duration: 2 });

      // 🎨 确保颜色已应用
      computeTaskColors(item);
      setTimeout(() => gantt.render(), 100); // 延迟重绘应用颜色

      // 💾 保存到LocalStorage
      if (currentProject) {
        const allTasks = gantt.getTaskByTime();
        const cacheKey = `gantt_tasks_${currentProject.id}`;
        StorageManager.save(cacheKey, { data: allTasks });
        logger.debug(`[Gantt] 💾 已保存 ${allTasks.length} 个任务到LocalStorage`);
      }

      // ✅ 静默保存到后端（不影响前端操作）
      saveTask(item).catch((err) => {
        console.warn('[Gantt] ⚠️ 后端保存失败，已保存到本地:', err.message);
        // 不显示错误通知，因为LocalStorage已保存
      });

      // 🔗 联动：发布任务更新事件
      if (currentProject) {
        eventBus.emit(EVENTS.TASK_UPDATED, {
          id: item.id,
          projectId: currentProject.id,
          name: item.text,
          progress: (item.progress || 0) * 100,
          startDate: item.start_date,
          endDate: item.end_date,
        } as TaskEventData);
      }

      return true;
    });

    gantt.attachEvent('onAfterTaskDelete', (id: any) => {
      if (isInitialLoad) return true; // 忽略初始加载
      notification.success({ message: '任务已删除', duration: 2 });

      // 💾 保存到LocalStorage
      if (currentProject) {
        const allTasks = gantt.getTaskByTime();
        const cacheKey = `gantt_tasks_${currentProject.id}`;
        StorageManager.save(cacheKey, { data: allTasks });
        logger.debug(`[Gantt] 💾 已保存 ${allTasks.length} 个任务到LocalStorage`);
      }

      // 🔗 联动：发布任务删除事件
      if (currentProject) {
        eventBus.emit(EVENTS.TASK_DELETED, {
          id,
          projectId: currentProject.id,
        });
      }

      return true;
    });

    // 数据加载完成后解除初始加载标志
    gantt.attachEvent('onParse', () => {
      setTimeout(() => {
        isInitialLoad = false;
      }, 500);
    });
  };

  // 请求超时辅助函数
  const _fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000) => {
    // 创建新的AbortController（不取消之前的请求，避免React严格模式双重渲染问题）
    const controller = new AbortController();

    // 设置超时
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('后端连接超时（5秒），已自动切换本地模式');
      }
      throw error;
    }
  };

  const loadTasks = async () => {
    if (!currentProject) {
      // 🔧 优化：没有项目时显示演示数据，而不是警告
      logger.info('[Gantt] ⚠️ 未选择项目，显示演示数据');
      setError('💡 提示：请先在工作台创建/选择项目，或查看下方演示数据');

      // 🎭 自动加载演示数据
      const demoProjectId = 'DEMO-PROJECT-001';
      const rawData = [
        {
          id: `${demoProjectId}-TASK-1`,
          text: '项目启动',
          start_date: '2025-01-01',
          duration: 5,
          progress: 1,
          owner: '张三',
          priority: 'high',
          project_id: demoProjectId,
        },
        {
          id: `${demoProjectId}-TASK-2`,
          text: '需求分析',
          start_date: '2025-01-06',
          duration: 10,
          progress: 1,
          owner: '李四',
          priority: 'high',
          project_id: demoProjectId,
        },
        {
          id: `${demoProjectId}-TASK-3`,
          text: '概要设计',
          start_date: '2025-01-16',
          duration: 8,
          progress: 0.8,
          owner: '王五',
          priority: 'medium',
          project_id: demoProjectId,
        },
        {
          id: `${demoProjectId}-TASK-4`,
          text: '详细设计',
          start_date: '2025-01-24',
          duration: 10,
          progress: 0.5,
          owner: '赵六',
          priority: 'medium',
          project_id: demoProjectId,
        },
        {
          id: `${demoProjectId}-TASK-5`,
          text: '前端开发',
          start_date: '2025-02-03',
          duration: 15,
          progress: 0.3,
          owner: '孙七',
          priority: 'high',
          project_id: demoProjectId,
        },
        {
          id: `${demoProjectId}-TASK-6`,
          text: '后端开发',
          start_date: '2025-02-03',
          duration: 15,
          progress: 0.2,
          owner: '周八',
          priority: 'high',
          project_id: demoProjectId,
        },
        {
          id: `${demoProjectId}-TASK-7`,
          text: '系统测试',
          start_date: '2025-02-18',
          duration: 10,
          progress: 0,
          owner: '吴九',
          priority: 'medium',
          project_id: demoProjectId,
        },
        {
          id: `${demoProjectId}-TASK-8`,
          text: '用户验收',
          start_date: '2025-02-28',
          duration: 5,
          progress: 0,
          owner: '郑十',
          priority: 'low',
          project_id: demoProjectId,
        },
        {
          id: `${demoProjectId}-TASK-9`,
          text: '项目上线',
          start_date: '2025-03-05',
          duration: 3,
          progress: 0,
          owner: '张三',
          priority: 'high',
          project_id: demoProjectId,
        },
      ];

      const mockData = {
        data: rawData.map((task) => {
          if (!taskColorMapRef.current.has(task.id)) {
            const colorIdx = colorIndexRef.current % colorPalette.length;
            taskColorMapRef.current.set(task.id, colorIdx);
            colorIndexRef.current++;
          }
          return computeTaskColors(task);
        }),
        links: [],
      };

      if (window.gantt) {
        window.gantt.clearAll();
        window.gantt.parse(mockData);
        window.gantt.render();
        logger.debug('[Gantt] 🎭 已加载演示数据');
      }
      return;
    }

    setIsLoading(true);
    setError('⏳ 正在加载甘特图数据...');

    // 🚀 优化：先快速显示本地数据，然后静默同步后端
    const cacheKey = `gantt_tasks_${currentProject.id}`;
    const cachedData = StorageManager.load(cacheKey);

    if (cachedData && cachedData.data && cachedData.data.length > 0) {
      logger.debug(`[Gantt] 📦 快速显示本地数据 ${cachedData.data.length} 个任务`);

      // 立即显示本地数据
      const fixedData = {
        data: cachedData.data.map((task: any) => {
          if (!taskColorMapRef.current.has(task.id)) {
            const colorIdx = colorIndexRef.current % colorPalette.length;
            taskColorMapRef.current.set(task.id, colorIdx);
            colorIndexRef.current++;
          }
          const t = {
            ...task,
            start_date:
              typeof task.start_date === 'string' ? new Date(task.start_date) : task.start_date,
            end_date:
              task.end_date && typeof task.end_date === 'string'
                ? new Date(task.end_date)
                : task.end_date,
          };
          return computeTaskColors(t);
        }),
        links: cachedData.links || [],
      };

      if (window.gantt) {
        window.gantt.clearAll();
        window.gantt.parse(fixedData);
        setTimeout(() => window.gantt.render(), 50);
      }
      // 🔧 修复：有本地数据时，静默同步后端，不显示错误提示
      // setError(`⚡ 本地数据 (${cachedData.data.length} 个任务) - 正在同步后端...`);
      // ✅ 不立即返回，继续同步后端
    }

    // 📡 LocalStorage无数据，尝试从后端加载（快速失败模式）
    logger.debug('[Gantt] 📡 从后端加载任务');

    // 🔧 修复：只在真正需要连接后端时显示提示
    if (!cachedData || !cachedData.data || cachedData.data.length === 0) {
      setError('⏳ 正在从后端加载数据...');
    }

    try {
      // 🚀 优化：快速失败模式（2秒超时，只重试1次）
      const tasksData = (await taskApi.getAll(currentProject.id)) as any[];

      // 转换数据格式为 DHTMLX Gantt 格式
      const ganttData = {
        data: tasksData.map((task: any) => {
          // 1. 预分配颜色索引
          if (!taskColorMapRef.current.has(task.id)) {
            const colorIdx = colorIndexRef.current % colorPalette.length;
            taskColorMapRef.current.set(task.id, colorIdx);
            colorIndexRef.current++;
          }

          // 2. 转换任务数据
          // 🔧 修复：计算日历天数（不排除周末）
          // DHTMLX Gantt的duration是从start_date开始经过的天数（不包含start_date当天）
          // 所以如果任务从1月1日到1月3日，duration应该是2（经过2天到达3日）
          const startDate = dayjs(task.start_date);
          const endDate = dayjs(task.end_date);
          const durationDays = endDate.diff(startDate, 'day'); // 日历天数差（这就是DHTMLX需要的duration）

          const t: any = {
            id: task.id,
            text: task.name,
            start_date: task.start_date,
            duration: durationDays >= 0 ? durationDays : 1, // 最小1天
            progress: task.progress / 100,
            owner: task.assignee,
            priority: task.priority,
            parent: task.dependencies && task.dependencies.length > 0 ? task.dependencies[0] : 0,
            project_id: currentProject.id, // 🔧 确保关联项目ID
          };

          // 🔍 调试：打印日期计算
          if (process.env.NODE_ENV === 'development' && durationDays < 1) {
            console.warn('[Gantt] ⚠️ Duration异常:', {
              name: task.name,
              start: task.start_date,
              end: task.end_date,
              calculated_duration: durationDays,
              fixed_duration: t.duration,
            });
          }

          // 3. 应用颜色
          return computeTaskColors(t);
        }),
        links: [],
      };

      if (window.gantt) {
        window.gantt.clearAll();
        window.gantt.parse(ganttData);
        // 🔧 修复：确保表头正确渲染
        window.gantt.render();
        setTimeout(() => {
          window.gantt.render();
          logger.debug('[Gantt] 🎨 强制重绘完成');
        }, 200);
        logger.debug('[Gantt] ✅ API数据加载成功，任务数:', ganttData.data.length);

        // 🔍 调试：打印第一个任务的日期信息
        if (ganttData.data.length > 0) {
          const firstTask = ganttData.data[0];
          logger.debug('[Gantt Debug] 第一个任务:', {
            id: firstTask.id,
            name: firstTask.text,
            start_date: firstTask.start_date,
            duration: firstTask.duration,
            calculated_end: window.gantt.calculateEndDate(firstTask.start_date, firstTask.duration),
          });
        }

        // 💾 保存到LocalStorage（首次加载后端数据时）
        StorageManager.save(cacheKey, ganttData);
        logger.debug('[Gantt] 💾 已将后端数据保存到LocalStorage');

        // 🔧 修复：成功加载后清除错误提示
        setError('');
      }
    } catch (error: any) {
      console.warn('[Gantt] ⚠️ API加载失败，执行渐进式降级:', error.message);

      // 🆕 渐进式降级策略：LocalStorage → 模拟数据
      const cacheKey = `gantt_tasks_${currentProject.id}`;
      const cachedData = StorageManager.load(cacheKey);

      // 🔧 修复：如果后端连接失败，使用更友好的提示
      if (!cachedData || !cachedData.data || cachedData.data.length === 0) {
        setError('⚠️ 后端连接失败，使用本地缓存数据');
      } else {
        setError(''); // 有缓存数据时清除错误提示
      }

      let mockData;
      if (cachedData && cachedData.data) {
        logger.debug('[Gantt] 📦 使用LocalStorage缓存数据');
        // 🔧 修复：将字符串日期转换为Date对象 + 预分配颜色 + 应用颜色
        mockData = {
          data: cachedData.data.map((task: any) => {
            // 1. 预分配颜色索引
            if (!taskColorMapRef.current.has(task.id)) {
              const colorIdx = colorIndexRef.current % colorPalette.length;
              taskColorMapRef.current.set(task.id, colorIdx);
              colorIndexRef.current++;
            }

            // 2. 转换日期 + 确保duration正确
            const startDate =
              typeof task.start_date === 'string' ? new Date(task.start_date) : task.start_date;
            const endDate =
              task.end_date && typeof task.end_date === 'string'
                ? new Date(task.end_date)
                : task.end_date;

            // 🔧 关键修复：确保duration正确
            // DHTMLX Gantt使用 start_date + duration 来计算end_date，所以duration是关键
            let calculatedDuration = task.duration;

            // 如果duration无效或不存在，从end_date计算
            if (!calculatedDuration || calculatedDuration <= 0) {
              if (endDate && startDate) {
                const start = dayjs(startDate);
                const end = dayjs(endDate);
                calculatedDuration = Math.max(1, end.diff(start, 'day')); // 至少1天
                logger.debug(
                  '[Gantt] 📊 重新计算duration:',
                  task.text,
                  'from',
                  start.format('YYYY-MM-DD'),
                  'to',
                  end.format('YYYY-MM-DD'),
                  '=',
                  calculatedDuration,
                  '天'
                );
              } else {
                calculatedDuration = 1; // 默认1天
              }
            }

            const t = {
              ...task,
              start_date: startDate,
              duration: calculatedDuration,
              // 不设置end_date，让Gantt自己计算
            };

            // 🔍 调试：打印每个任务的duration
            console.log('[Gantt Debug] 加载任务:', {
              id: t.id,
              text: t.text || task.text,
              start: dayjs(startDate).format('YYYY-MM-DD'),
              duration: calculatedDuration,
              original_duration: task.duration,
            });

            // 3. 应用动态颜色计算
            return computeTaskColors(t);
          }),
          links: cachedData.links || [],
        };
        setError(`⚠️ 离线模式：使用上次保存的数据`);
      } else {
        console.log('[Gantt] 🎭 使用默认模拟数据');
        const projectPrefix = currentProject.id;
        const rawData = [
          {
            id: generateTaskId(projectPrefix, 1),
            text: '项目启动',
            start_date: '2025-01-01',
            duration: 5,
            progress: 1,
            owner: '张三',
            priority: 'high',
            project_id: currentProject.id,
          },
          {
            id: generateTaskId(projectPrefix, 2),
            text: '需求分析',
            start_date: '2025-01-06',
            duration: 10,
            progress: 1,
            owner: '李四',
            priority: 'high',
            project_id: currentProject.id,
          },
          {
            id: generateTaskId(projectPrefix, 3),
            text: '概要设计',
            start_date: '2025-01-16',
            duration: 8,
            progress: 0.8,
            owner: '王五',
            priority: 'medium',
            project_id: currentProject.id,
          },
          {
            id: generateTaskId(projectPrefix, 4),
            text: '详细设计',
            start_date: '2025-01-24',
            duration: 10,
            progress: 0.5,
            owner: '赵六',
            priority: 'medium',
            project_id: currentProject.id,
          },
          {
            id: generateTaskId(projectPrefix, 5),
            text: '前端开发',
            start_date: '2025-02-03',
            duration: 15,
            progress: 0.3,
            owner: '孙七',
            priority: 'high',
            project_id: currentProject.id,
          },
          {
            id: generateTaskId(projectPrefix, 6),
            text: '后端开发',
            start_date: '2025-02-03',
            duration: 15,
            progress: 0.2,
            owner: '周八',
            priority: 'high',
            project_id: currentProject.id,
          },
          {
            id: generateTaskId(projectPrefix, 7),
            text: '系统测试',
            start_date: '2025-02-18',
            duration: 10,
            progress: 0,
            owner: '吴九',
            priority: 'medium',
            project_id: currentProject.id,
          },
          {
            id: generateTaskId(projectPrefix, 8),
            text: '用户验收',
            start_date: '2025-02-28',
            duration: 5,
            progress: 0,
            owner: '郑十',
            priority: 'low',
            project_id: currentProject.id,
          },
          {
            id: generateTaskId(projectPrefix, 9),
            text: '项目上线',
            start_date: '2025-03-05',
            duration: 3,
            progress: 0,
            owner: '张三',
            priority: 'high',
            project_id: currentProject.id,
          },
        ];
        // 🎨 预分配颜色 + 应用动态颜色到模拟数据
        mockData = {
          data: rawData.map((task) => {
            // 1. 预分配颜色索引
            if (!taskColorMapRef.current.has(task.id)) {
              const colorIdx = colorIndexRef.current % colorPalette.length;
              taskColorMapRef.current.set(task.id, colorIdx);
              colorIndexRef.current++;
            }
            // 2. 应用颜色
            return computeTaskColors(task);
          }),
          links: [],
        };
        setError(`⚠️ 本地模式：后端连接失败（${error.message}），显示演示数据`);
      }

      if (window.gantt) {
        window.gantt.clearAll();
        window.gantt.parse(mockData);
        // 🔧 修复：强制刷新以应用颜色和显示表头
        window.gantt.render();
        setTimeout(() => {
          window.gantt.render();
          console.log('[Gantt] 🎨 LocalStorage数据重绘完成');
        }, 200);

        // 🔍 调试：打印加载的任务信息
        if (mockData.data.length > 0) {
          const firstTask = mockData.data[0];
          console.log('[Gantt Debug] LocalStorage第一个任务:', {
            id: firstTask.id,
            name: firstTask.text,
            start_date: firstTask.start_date,
            duration: firstTask.duration,
            end_date: firstTask.end_date,
            calculated_end: window.gantt.calculateEndDate(
              firstTask.start_date,
              firstTask.duration || 1
            ),
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 组件卸载时取消所有进行中的请求
  useEffect(() => {
    const controller = abortControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  // 🔧 修复：项目切换时清理甘特图数据，确保数据隔离
  useEffect(() => {
    if (!currentProject) {
      console.log('[Gantt] 没有选中项目，跳过加载');
      return;
    }

    if (window.gantt) {
      console.log('[Gantt] 项目切换，清理旧数据并重新加载:', currentProject.name);
      // 清空甘特图数据
      window.gantt.clearAll();
      // 🔧 关键修复：清空颜色映射，避免旧任务ID残留
      taskColorMapRef.current.clear();
      colorIndexRef.current = 0;
      setError(''); // 清空错误信息
      // 重新加载数据
      loadTasks();
    }
  }, [currentProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const saveTask = async (task: any) => {
    try {
      // 🔧 确保ID是字符串（DHTMLX可能生成数字ID）
      if (typeof task.id !== 'string' || !task.id.startsWith('PROJ-')) {
        console.log('[Gantt] ⚠️ 检测到非标准ID，重新生成:', task.id);
        const oldId = task.id;
        const newId = generateTaskId(currentProject?.id || 'PROJ-001');
        // 更新Gantt中的任务ID（如果gantt已加载）
        if (typeof window !== 'undefined' && (window as any).gantt) {
          (window as any).gantt.changeTaskId(oldId, newId);
        }
        task.id = newId;
      }

      // 🔧 修复日期计算：确保end_date正确
      const startDate = dayjs(task.start_date);
      const duration = task.duration || 1; // 默认1天

      // 计算end_date：start_date + duration天
      const calculatedEndDate = startDate.add(duration, 'day');
      const endDate = task.end_date
        ? dayjs(task.end_date).format('YYYY-MM-DD')
        : calculatedEndDate.format('YYYY-MM-DD');

      // 🔍 调试日志：打印日期计算过程
      if (process.env.NODE_ENV === 'development') {
        console.log('[Gantt] 保存任务日期:', {
          name: task.text,
          start: startDate.format('YYYY-MM-DD'),
          duration: duration,
          calculated_end: calculatedEndDate.format('YYYY-MM-DD'),
          actual_end: endDate,
          gantt_end: window.gantt?.calculateEndDate
            ? dayjs(window.gantt.calculateEndDate(task.start_date, duration)).format('YYYY-MM-DD')
            : 'N/A',
        });
      }

      const taskData = {
        id: task.id,
        name: task.text,
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate,
        progress: Math.round(task.progress * 100),
        assignee: task.owner || '',
        priority: task.priority || 'medium',
        status: task.progress === 1 ? 'completed' : task.progress > 0 ? 'in_progress' : 'pending',
        project_id: currentProject?.id,
      };

      // 🔧 优化：智能判断使用PUT还是POST
      console.log('[Gantt] 💾 保存任务:', task.id, task.text);

      try {
        const saved = await taskApi.update(taskData.id, taskData);
        return saved;
      } catch (e) {
        const created = await taskApi.create(taskData);
        return created;
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save task:', error);
      }
      notification.error({ message: error.message || '保存任务失败' });
      throw error;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _deleteTask = async (id: string) => {
    try {
      await taskApi.delete(id);
      notification.success({ message: '任务删除成功' });
      return true;
    } catch (error: any) {
      // 忽略"Task not found"错误，因为任务可能已经被删除
      if (error instanceof Error && !error.message.includes('Task not found')) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to delete task:', error);
        }
        notification.error({ message: error.message || '删除任务失败' });
      }
      return false;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleZoomIn = () => {
    if (window.gantt && window.gantt.ext && window.gantt.ext.zoom) {
      window.gantt.ext.zoom.zoomIn();
    } else {
      notification.info({ message: '缩放功能需要配置 zoom 扩展' });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleZoomOut = () => {
    if (window.gantt && window.gantt.ext && window.gantt.ext.zoom) {
      window.gantt.ext.zoom.zoomOut();
    } else {
      notification.info({ message: '缩放功能需要配置 zoom 扩展' });
    }
  };

  const handleExportPDF = async () => {
    try {
      const ganttElement = ganttContainer.current;
      if (!ganttElement) {
        notification.error({ message: '甘特图未加载' });
        return;
      }

      notification.destroy('pdf-export');
      notification.open({ message: '正在生成PDF...', key: 'pdf-export', duration: 0 });

      // 使用 html2canvas 截图
      const canvas = await html2canvas(ganttElement, {
        scale: 2, // 高清
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297; // A4 横向宽度 (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // 如果图片高度超过一页，分页处理
      let heightLeft = imgHeight;
      let position = 0;
      const pageHeight = 210; // A4 横向高度 (mm)

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `甘特图-${currentProject?.name || '未命名'}-${dayjs().format('YYYYMMDD')}.pdf`;
      pdf.save(fileName);

      notification.destroy('pdf-export');
      notification.success({ message: 'PDF导出成功！' });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('PDF导出失败:', error);
      }
      notification.destroy('pdf-export');
      notification.error({ message: 'PDF导出失败，请检查页面内容' });
    }
  };

  const handleExportExcel = () => {
    try {
      if (!window.gantt) {
        notification.error({ message: '甘特图未加载' });
        return;
      }

      // 获取所有任务
      const tasks = window.gantt.getTaskByTime();

      if (tasks.length === 0) {
        notification.warning({ message: '没有任务数据可导出' });
        return;
      }

      // 转换数据格式
      const data = tasks.map((task: any) => ({
        任务ID: task.id,
        任务名称: task.text,
        开始日期: dayjs(task.start_date).format('YYYY-MM-DD'),
        结束日期: dayjs(task.end_date).format('YYYY-MM-DD'),
        '持续时间(天)': task.duration,
        进度: `${Math.round(task.progress * 100)}%`,
        负责人: task.owner || '',
        优先级: task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低',
        父任务ID: task.parent || '',
      }));

      // 创建工作表
      const ws = XLSX.utils.json_to_sheet(data);

      // 设置列宽
      ws['!cols'] = [
        { wch: 10 }, // 任务ID
        { wch: 30 }, // 任务名称
        { wch: 15 }, // 开始日期
        { wch: 15 }, // 结束日期
        { wch: 15 }, // 持续时间
        { wch: 10 }, // 进度
        { wch: 15 }, // 负责人
        { wch: 10 }, // 优先级
        { wch: 10 }, // 父任务ID
      ];

      // 创建工作簿
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '甘特图任务');

      // 导出文件
      const fileName = `甘特图-${currentProject?.name || '未命名'}-${dayjs().format('YYYYMMDD')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      notification.success({ message: 'Excel导出成功！' });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Excel导出失败:', error);
      }
      notification.error({ message: 'Excel导出失败，请检查数据格式' });
    }
  };

  const handleFullscreen = () => {
    if (ganttContainer.current) {
      ganttContainer.current.requestFullscreen();
    }
  };

  // 🔗 联动：监听施工日志事件，自动更新任务进度
  useEffect(() => {
    if (!currentProject) return;

    const handleLogCreated = (logData: any) => {
      if (logData.projectId === currentProject.id && logData.taskId && window.gantt) {
        try {
          const task = window.gantt.getTask(logData.taskId);
          if (task) {
            // 如果日志进度大于任务进度，更新任务
            const newProgress = logData.progress / 100;
            if (newProgress > task.progress) {
              task.progress = newProgress;
              window.gantt.updateTask(logData.taskId);
              notification.info({
                message: '任务进度已同步',
                description: `${task.text} 进度: ${logData.progress}%`,
                duration: 3,
              });
            }
          }
        } catch (e) {
          console.warn('[Gantt] 任务不存在:', logData.taskId);
        }
      }
    };

    eventBus.on(EVENTS.LOG_CREATED, handleLogCreated);

    return () => {
      eventBus.off(EVENTS.LOG_CREATED, handleLogCreated);
    };
  }, [currentProject, notification]);

  return (
    <PageContainer>
      <div className="dhtmlx-gantt-container" style={{ minHeight: '100%' }}>
        <Card
          title={
            <Space size="large" align="center">
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1890ff',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                📊 甘特图 {currentProject && `- ${currentProject.name}`}
              </span>
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
              <Tooltip title="全屏显示">
                <Button size="small" icon={<FullscreenOutlined />} onClick={handleFullscreen} />
              </Tooltip>
              <Tooltip title="导出 PDF">
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={handleExportPDF}
                  disabled={isLoading}
                  type="default"
                />
              </Tooltip>
              <Tooltip title="导出 Excel">
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={handleExportExcel}
                  disabled={isLoading}
                  type="default"
                />
              </Tooltip>
            </Space>
          }
          variant="outlined"
          className="gantt-card"
          style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
        >
          {!currentProject ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '400px',
                backgroundColor: '#fafafa',
                borderRadius: '4px',
              }}
            >
              <Empty description="请先在顶部选择一个项目" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="error-message"
                  style={{
                    color: 'red',
                    padding: '12px 16px',
                    backgroundColor: '#fff1f0',
                    border: '1px solid #ffccc7',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  ⚠️ {error}
                </div>
              )}
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#e6f7ff',
                  border: '1px solid #91d5ff',
                  borderRadius: '6px',
                  marginBottom: '16px',
                }}
              >
                💡 <strong>提示</strong>:
                双击功能已禁用。要编辑任务请使用工具栏的"添加任务"按钮，或拖动任务进行调整。
              </div>
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

export default DhtmlxGanttChart;
