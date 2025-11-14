import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Select, Button, Space, Tag, Input, message, Tooltip } from 'antd';
import {
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  FilePdfOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import './EnhancedGanttChart.css';

interface Task {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  progress: number;
  dependencies: string[];
  assignee: string;
  status: string;
  priority: string;
}

interface ConstructionLog {
  id: number;
  time: string;
  taskId: string;
  operator: string;
  action: string;
  device: string;
  status: 'success' | 'warning' | 'info';
}

const EnhancedGanttChart: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState('PRJ-001');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [logs, setLogs] = useState<ConstructionLog[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadTasks();

    // 初始化施工日志
    setLogs([
      {
        id: 1,
        time: '10:32',
        taskId: 'T-003',
        operator: '王五',
        action: '完成安装',
        device: '反应釜',
        status: 'success',
      },
      {
        id: 2,
        time: '10:15',
        taskId: 'T-004',
        operator: '赵六',
        action: '开始调试',
        device: '换热器',
        status: 'info',
      },
      {
        id: 3,
        time: '09:48',
        taskId: 'T-005',
        operator: '孙七',
        action: '管道焊接',
        device: '管道系统',
        status: 'info',
      },
    ]);

    // 模拟实时日志更新
    const logInterval = setInterval(() => {
      const taskIds = ['T-003', 'T-004', 'T-005', 'T-006', 'T-007'];
      const operators = ['王五', '李四', '张三', '赵六', '孙七'];
      const actions = ['完成安装', '开始调试', '质量检测', '维护记录', '进度更新'];
      const devices = ['反应釜', '换热器', '离心泵', '储罐', '管道系统'];
      const statuses: Array<'success' | 'info' | 'warning'> = ['success', 'info', 'warning'];

      const newLog: ConstructionLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        taskId: taskIds[Math.floor(Math.random() * taskIds.length)],
        operator: operators[Math.floor(Math.random() * operators.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };

      setLogs((prev) => [newLog, ...prev].slice(0, 15));
    }, 6000);

    return () => clearInterval(logInterval);
  }, [selectedProject]);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchText, statusFilter]);

  useEffect(() => {
    if (filteredTasks.length > 0) {
      drawGanttChart();
    }
  }, [filteredTasks, zoom, logs]);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/v1/tasks/');
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      } else {
        setDemoData();
      }
    } catch {
      setDemoData();
    }
  };

  const setDemoData = () => {
    setTasks([
      {
        id: 'T-001',
        name: '基础施工准备',
        start_date: '2024-01-01',
        end_date: '2024-01-10',
        progress: 100,
        dependencies: [],
        assignee: '张三',
        status: 'completed',
        priority: 'high',
      },
      {
        id: 'T-002',
        name: '反应釜基础浇筑',
        start_date: '2024-01-08',
        end_date: '2024-01-20',
        progress: 100,
        dependencies: ['T-001'],
        assignee: '李四',
        status: 'completed',
        priority: 'critical',
      },
      {
        id: 'T-003',
        name: '反应釜安装就位',
        start_date: '2024-01-18',
        end_date: '2024-02-05',
        progress: 90,
        dependencies: ['T-002'],
        assignee: '王五',
        status: 'in_progress',
        priority: 'critical',
      },
      {
        id: 'T-004',
        name: '换热器组安装',
        start_date: '2024-01-25',
        end_date: '2024-02-15',
        progress: 75,
        dependencies: ['T-002'],
        assignee: '赵六',
        status: 'in_progress',
        priority: 'high',
      },
      {
        id: 'T-005',
        name: '管道预制及安装',
        start_date: '2024-02-01',
        end_date: '2024-02-28',
        progress: 60,
        dependencies: ['T-003'],
        assignee: '孙七',
        status: 'in_progress',
        priority: 'high',
      },
      {
        id: 'T-006',
        name: '电气仪表安装',
        start_date: '2024-02-10',
        end_date: '2024-03-05',
        progress: 40,
        dependencies: ['T-003', 'T-004'],
        assignee: '周八',
        status: 'in_progress',
        priority: 'medium',
      },
      {
        id: 'T-007',
        name: '压力试验',
        start_date: '2024-02-25',
        end_date: '2024-03-10',
        progress: 20,
        dependencies: ['T-005'],
        assignee: '吴九',
        status: 'pending',
        priority: 'critical',
      },
    ]);
  };

  const filterTasks = useCallback(() => {
    let filtered = [...tasks];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.assignee.toLowerCase().includes(searchLower) ||
          t.id.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, searchText, statusFilter]);

  const drawGanttChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || filteredTasks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1400 * zoom;
    canvas.height = filteredTasks.length * 80 + 150;

    // 背景渐变
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    bgGradient.addColorStop(0, '#0a0a1f');
    bgGradient.addColorStop(0.5, '#1a1a3f');
    bgGradient.addColorStop(1, '#0a0a1f');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 获取日期范围
    const dates = filteredTasks.flatMap((t) => [new Date(t.start_date), new Date(t.end_date)]);
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

    const chartStartX = 280;
    const chartWidth = canvas.width - chartStartX - 50;
    const dayWidth = chartWidth / daysDiff;

    // 绘制时间轴
    const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 60);
    headerGradient.addColorStop(0, 'rgba(102,126,234,0.3)');
    headerGradient.addColorStop(1, 'rgba(118,75,162,0.3)');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, canvas.width, 80);

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('施工进度甘特图 (实时联动)', 20, 40);

    // 绘制月份刻度
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 1;
    const monthWidth = dayWidth * 30;

    for (let i = 0; i <= daysDiff / 30; i++) {
      const x = chartStartX + i * monthWidth;
      ctx.beginPath();
      ctx.moveTo(x, 80);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();

      const month = new Date(minDate);
      month.setMonth(month.getMonth() + i);
      ctx.fillStyle = '#00bfff';
      ctx.font = '13px Arial';
      ctx.fillText(
        `${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, '0')}`,
        x + 5,
        100
      );
    }

    // 今日线
    const today = new Date();
    const todayDiff = Math.ceil((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const todayX = chartStartX + todayDiff * dayWidth;

    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(todayX, 80);
    ctx.lineTo(todayX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('TODAY', todayX + 5, 95);

    // 绘制任务条
    filteredTasks.forEach((task, index) => {
      const y = 120 + index * 80;

      // 背景行
      if (index % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, y - 10, canvas.width, 70);
      }

      // 任务名称
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px Arial';
      ctx.fillText(task.name, 15, y + 25);

      // 负责人
      ctx.fillStyle = '#00bfff';
      ctx.font = '12px Arial';
      ctx.fillText(`${task.assignee}`, 15, y + 45);

      // 计算任务条位置
      const startDiff = Math.ceil(
        (new Date(task.start_date).getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const endDiff = Math.ceil(
        (new Date(task.end_date).getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const barX = chartStartX + startDiff * dayWidth;
      const barWidth = (endDiff - startDiff) * dayWidth;
      const barY = y;
      const barHeight = 35;

      // 背景条
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // 进度条
      const progressWidth = barWidth * (task.progress / 100);
      const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);

      if (task.status === 'completed') {
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(1, '#00bfff');
      } else if (task.status === 'in_progress') {
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
      } else {
        gradient.addColorStop(0, '#f093fb');
        gradient.addColorStop(1, '#f5576c');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(barX, barY, progressWidth, barHeight);

      // 边框
      ctx.strokeStyle = task.status === 'completed' ? '#00ff88' : '#667eea';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // 进度文字
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${task.progress}%`, barX + barWidth / 2, barY + barHeight / 2 + 5);
      ctx.textAlign = 'left';

      // 日志标记
      const taskLogs = logs.filter((log) => log.taskId === task.id).slice(0, 3);
      taskLogs.forEach((log, logIndex) => {
        const dotX = barX + progressWidth + 10 + logIndex * 25;
        const dotY = barY + barHeight / 2;

        ctx.beginPath();
        ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
        ctx.fillStyle =
          log.status === 'success' ? '#00ff88' : log.status === 'warning' ? '#ff9800' : '#00bfff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(dotX, dotY, 10, 0, Math.PI * 2);
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    });
  };

  const exportToPDF = async () => {
    if (!canvasRef.current) {
      message.error('甘特图未加载完成');
      return;
    }

    setIsExporting(true);
    message.loading({ content: '正在生成PDF，请稍候...', key: 'pdf-export' });

    try {
      const canvas = canvasRef.current;
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      const fileName = `施工进度甘特图_${selectedProject}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
      pdf.save(fileName);

      message.success({ content: 'PDF导出成功！', key: 'pdf-export', duration: 2 });
    } catch (error) {
      message.error({ content: 'PDF导出失败，请重试', key: 'pdf-export' });
    } finally {
      setIsExporting(false);
    }
  };

  const completedTasks = filteredTasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div
      className="enhanced-gantt-page"
      style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}
    >
      {/* 顶部工具栏 */}
      <div
        style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThunderboltOutlined style={{ fontSize: 24 }} />
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#fff' }}>
            施工进度甘特图
          </h1>
          <Tag color="magenta" style={{ marginLeft: 8 }}>
            实时联动
          </Tag>
          <span style={{ fontSize: 13, opacity: 0.9 }}>
            {filteredTasks.length} 个任务 · {inProgressTasks} 进行中
          </span>
        </div>
        <Space size="middle">
          <Tooltip title="导出高清PDF">
            <Button
              type="primary"
              ghost
              icon={<FilePdfOutlined />}
              onClick={exportToPDF}
              loading={isExporting}
            >
              导出PDF
            </Button>
          </Tooltip>
          <Select
            style={{ width: 160 }}
            value={selectedProject}
            onChange={setSelectedProject}
            options={[
              { label: '聚乙烯装置', value: 'PRJ-001' },
              { label: '催化裂化', value: 'PRJ-002' },
            ]}
          />
          <Button icon={<ZoomOutOutlined />} onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
            缩小
          </Button>
          <Button icon={<ZoomInOutlined />} onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
            放大
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadTasks}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 筛选栏 */}
      <div style={{ padding: '12px 24px', background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
        <Space size="middle">
          <Select
            style={{ width: 120 }}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="任务状态"
          >
            <Select.Option value="all">全部状态</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="in_progress">进行中</Select.Option>
            <Select.Option value="pending">待开始</Select.Option>
          </Select>

          <Input
            style={{ width: 200 }}
            placeholder="搜索任务..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Space>
      </div>

      {/* 甘特图主体 */}
      <div style={{ flex: 1, padding: '16px', background: '#f0f2f5', overflow: 'auto' }}>
        <Card
          className="cyber-card"
          variant="borderless"
          style={{
            height: '100%',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            borderRadius: '8px',
          }}
          styles={{
            body: {
              height: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <div
            style={{
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Space size="large">
              <span style={{ fontSize: 16, fontWeight: 600 }}>任务时间线</span>
              <Tag color="red" icon={<ClockCircleOutlined />}>
                今日标记
              </Tag>
              <Tag color="processing">{inProgressTasks} 进行中</Tag>
              <Tag color="success">{completedTasks} 已完成</Tag>
            </Space>
            <span style={{ fontSize: 13, color: '#8c8c8c' }}>拖拽查看 · 实时日志联动</span>
          </div>

          <div
            style={{
              flex: 1,
              overflowX: 'auto',
              overflowY: 'auto',
              background: 'linear-gradient(180deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <canvas ref={canvasRef} style={{ display: 'block' }} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedGanttChart;
