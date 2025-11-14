import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Card,
  Select,
  Button,
  Space,
  Tag,
  Input,
  message,
  Tooltip,
  Table,
  Drawer,
  Statistic,
  Row,
  Col,
  Progress,
  Descriptions,
} from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ClockCircleOutlined,
  FilePdfOutlined,
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import './GanttChart.css';

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
  daily_workload?: DailyWork[];
}

interface DailyWork {
  date: string;
  device: string;
  work_content: string;
  workers: number;
  hours: number;
  completed: boolean;
}

const GanttChart: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState('CHEM-2024-001');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [selectedProject]);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchText, statusFilter]);

  useEffect(() => {
    if (filteredTasks.length > 0) {
      drawGanttChart();
    }
  }, [filteredTasks, zoom]);

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
    const demoTasks: Task[] = [
      {
        id: 'T-001',
        name: '反应釜基础施工',
        start_date: '2024-01-05',
        end_date: '2024-01-20',
        progress: 100,
        dependencies: [],
        assignee: '张工',
        status: 'completed',
        priority: 'high',
        daily_workload: [
          {
            date: '2024-01-05',
            device: 'R-001反应釜',
            work_content: '基坑开挖',
            workers: 8,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-01-06',
            device: 'R-001反应釜',
            work_content: '基坑开挖',
            workers: 8,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-01-07',
            device: 'R-001反应釜',
            work_content: '基底处理',
            workers: 6,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-01-08',
            device: 'R-001反应釜',
            work_content: '钢筋绑扎',
            workers: 10,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-01-09',
            device: 'R-001反应釜',
            work_content: '钢筋绑扎',
            workers: 10,
            hours: 8,
            completed: true,
          },
        ],
      },
      {
        id: 'T-002',
        name: '反应釜主体吊装',
        start_date: '2024-01-25',
        end_date: '2024-02-10',
        progress: 85,
        dependencies: ['T-001'],
        assignee: '李队长',
        status: 'in_progress',
        priority: 'critical',
        daily_workload: [
          {
            date: '2024-01-25',
            device: 'R-001反应釜',
            work_content: '吊装准备',
            workers: 12,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-01-26',
            device: 'R-001反应釜',
            work_content: '主体吊装',
            workers: 15,
            hours: 10,
            completed: true,
          },
          {
            date: '2024-01-27',
            device: 'R-001反应釜',
            work_content: '就位调整',
            workers: 10,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-01-28',
            device: 'R-001反应釜',
            work_content: '固定焊接',
            workers: 8,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-01-29',
            device: 'R-001反应釜',
            work_content: '固定焊接',
            workers: 8,
            hours: 8,
            completed: false,
          },
        ],
      },
      {
        id: 'T-003',
        name: '换热器组安装',
        start_date: '2024-01-20',
        end_date: '2024-02-15',
        progress: 70,
        dependencies: ['T-001'],
        assignee: '王工程师',
        status: 'in_progress',
        priority: 'high',
        daily_workload: [
          {
            date: '2024-01-20',
            device: 'H-001换热器',
            work_content: '设备检查',
            workers: 4,
            hours: 6,
            completed: true,
          },
          {
            date: '2024-01-21',
            device: 'H-001换热器',
            work_content: '基础准备',
            workers: 6,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-01-22',
            device: 'H-002换热器',
            work_content: '设备检查',
            workers: 4,
            hours: 6,
            completed: true,
          },
          {
            date: '2024-01-23',
            device: 'H-002换热器',
            work_content: '基础准备',
            workers: 6,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-01-24',
            device: 'H-001换热器',
            work_content: '吊装安装',
            workers: 10,
            hours: 8,
            completed: false,
          },
        ],
      },
      {
        id: 'T-004',
        name: '管道预制焊接',
        start_date: '2024-02-01',
        end_date: '2024-02-28',
        progress: 55,
        dependencies: ['T-002', 'T-003'],
        assignee: '赵师傅',
        status: 'in_progress',
        priority: 'medium',
        daily_workload: [
          {
            date: '2024-02-01',
            device: 'P-001管道',
            work_content: '预制加工',
            workers: 8,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-02-02',
            device: 'P-001管道',
            work_content: '预制加工',
            workers: 8,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-02-03',
            device: 'P-002管道',
            work_content: '预制加工',
            workers: 8,
            hours: 8,
            completed: true,
          },
          {
            date: '2024-02-04',
            device: 'P-001管道',
            work_content: '现场焊接',
            workers: 6,
            hours: 8,
            completed: false,
          },
        ],
      },
    ];
    setTasks(demoTasks);
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

    const baseWidth = 2400;
    const rowHeight = 50;
    const headerHeight = 150;
    const baseHeight = filteredTasks.length * rowHeight + headerHeight;
    canvas.width = baseWidth * zoom;
    canvas.height = baseHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 获取日期范围
    const dates = filteredTasks.flatMap((t) => [new Date(t.start_date), new Date(t.end_date)]);
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 5;

    const chartStartX = 250;
    const chartWidth = canvas.width - chartStartX - 50;
    const dayWidth = chartWidth / daysDiff;

    // 标题
    ctx.fillStyle = '#1890ff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('施工进度甘特图（每日工作量）', 20, 35);

    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText(`项目: ${selectedProject} | 生成: ${dayjs().format('YYYY-MM-DD HH:mm')}`, 20, 55);

    // 表头
    ctx.fillStyle = '#f0f5ff';
    ctx.fillRect(0, 70, canvas.width, 40);

    ctx.strokeStyle = '#d9d9d9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 110);
    ctx.lineTo(canvas.width, 110);
    ctx.stroke();

    ctx.fillStyle = '#262626';
    ctx.font = 'bold 13px Arial';
    ctx.fillText('任务名称', 20, 93);
    ctx.fillText('负责人', 160, 93);

    // 时间轴 - 每日刻度
    for (let i = 0; i <= daysDiff; i += 7) {
      const x = chartStartX + i * dayWidth;

      ctx.strokeStyle = '#e8e8e8';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(x, 70);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      const date = new Date(minDate);
      date.setDate(date.getDate() + i);
      ctx.fillStyle = '#1890ff';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(dayjs(date).format('MM-DD'), x + 3, 90);
    }

    // 今日线
    const today = new Date();
    if (today >= minDate && today <= maxDate) {
      const todayDiff = Math.ceil((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
      const todayX = chartStartX + todayDiff * dayWidth;

      ctx.strokeStyle = '#ff4d4f';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(todayX, 70);
      ctx.lineTo(todayX, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ff4d4f';
      ctx.font = 'bold 10px Arial';
      ctx.fillText('今', todayX + 2, 85);
    }

    // 绘制任务
    filteredTasks.forEach((task, index) => {
      const y = 120 + index * rowHeight;

      if (index % 2 === 0) {
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, y - 5, canvas.width, rowHeight);
      }

      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + rowHeight - 5);
      ctx.lineTo(canvas.width, y + rowHeight - 5);
      ctx.stroke();

      ctx.fillStyle = '#262626';
      ctx.font = '13px Arial';
      const taskName = task.name.length > 10 ? task.name.substring(0, 10) + '...' : task.name;
      ctx.fillText(taskName, 20, y + 18);

      ctx.fillStyle = '#8c8c8c';
      ctx.font = '10px Arial';
      ctx.fillText(task.id, 20, y + 32);

      ctx.fillStyle = '#1890ff';
      ctx.font = '11px Arial';
      ctx.fillText(task.assignee, 160, y + 18);

      const startDiff = Math.ceil(
        (new Date(task.start_date).getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const endDiff = Math.ceil(
        (new Date(task.end_date).getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const barX = chartStartX + startDiff * dayWidth;
      const barWidth = Math.max((endDiff - startDiff) * dayWidth, 20);
      const barY = y + 2;
      const barHeight = 25;

      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      const progressWidth = barWidth * (task.progress / 100);

      let progressColor = '#52c41a';
      if (task.status === 'in_progress') {
        progressColor = '#1890ff';
      } else if (task.status === 'pending') {
        progressColor = '#faad14';
      }

      ctx.fillStyle = progressColor;
      ctx.fillRect(barX, barY, progressWidth, barHeight);

      ctx.strokeStyle = progressColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      if (barWidth > 40) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${task.progress}%`, barX + barWidth / 2, barY + barHeight / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
      }

      // 绘制每日工作量标记
      if (task.daily_workload && task.daily_workload.length > 0) {
        task.daily_workload.forEach((daily) => {
          const workDate = new Date(daily.date);
          const workDiff = Math.ceil(
            (workDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const workX = chartStartX + workDiff * dayWidth + dayWidth / 2;

          const dotSize = Math.min(dayWidth * 0.4, 8);
          ctx.beginPath();
          ctx.arc(workX, barY + barHeight / 2, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = daily.completed ? '#52c41a' : '#faad14';
          ctx.fill();

          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }

      if (task.priority === 'critical') {
        ctx.fillStyle = '#ff4d4f';
        ctx.beginPath();
        ctx.arc(barX - 8, barY + barHeight / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 图例
    const legendY = canvas.height - 30;
    const legendItems = [
      { label: '已完成', color: '#52c41a' },
      { label: '进行中', color: '#1890ff' },
      { label: '待开始', color: '#faad14' },
      { label: '每日已完成', color: '#52c41a', isDot: true },
      { label: '每日未完成', color: '#faad14', isDot: true },
    ];

    let legendX = chartStartX;
    legendItems.forEach((item) => {
      if (item.isDot) {
        ctx.beginPath();
        ctx.arc(legendX + 7, legendY + 7, 6, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY, 15, 15);
      }

      ctx.fillStyle = '#595959';
      ctx.font = '10px Arial';
      ctx.fillText(item.label, legendX + 20, legendY + 11);

      legendX += 110;
    });
  };

  const exportToPDF = async () => {
    if (!canvasRef.current) {
      message.error('甘特图未加载完成');
      return;
    }

    setIsExporting(true);
    message.loading({ content: '正在生成PDF...', key: 'pdf-export' });

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

      const fileName = `甘特图_${selectedProject}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
      pdf.save(fileName);

      message.success({ content: 'PDF导出成功！', key: 'pdf-export', duration: 2 });
    } catch (error) {
      message.error({ content: 'PDF导出失败', key: 'pdf-export' });
    } finally {
      setIsExporting(false);
    }
  };

  const completedTasks = filteredTasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress').length;
  const avgProgress =
    filteredTasks.length > 0
      ? Math.round(filteredTasks.reduce((sum, t) => sum + t.progress, 0) / filteredTasks.length)
      : 0;

  const _dailyWorkColumns = [
    { title: '日期', dataIndex: 'date', key: 'date', width: 100 },
    { title: '设备', dataIndex: 'device', key: 'device' },
    { title: '工作内容', dataIndex: 'work_content', key: 'work_content' },
    { title: '工人数', dataIndex: 'workers', key: 'workers', width: 80 },
    { title: '工时', dataIndex: 'hours', key: 'hours', width: 80 },
    {
      title: '状态',
      dataIndex: 'completed',
      key: 'completed',
      width: 80,
      render: (completed: boolean) => (
        <Tag color={completed ? 'success' : 'warning'}>{completed ? '已完成' : '未完成'}</Tag>
      ),
    },
  ];

  return (
    <div className="gantt-chart-page" style={{ height: 'calc(100vh - 100px)' }}>
      {/* 顶部工具栏 - 优化设计 */}
      <div className="gantt-toolbar">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: 4,
                height: 32,
                background: 'linear-gradient(180deg, #1890ff 0%, #096dd9 100%)',
                borderRadius: 2,
              }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#262626' }}>
                施工进度甘特图
              </h1>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                每日工作量追踪与管理
              </div>
            </div>
            <div
              style={{
                padding: '6px 14px',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#262626',
                border: '1px solid #d9d9ff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontWeight: 600, color: '#1890ff' }}>{filteredTasks.length}</span>{' '}
              个任务
              <span style={{ color: '#d9d9d9' }}>|</span>
              <span style={{ fontWeight: 600, color: '#52c41a' }}>{completedTasks}</span> 已完成
              <span style={{ color: '#d9d9d9' }}>|</span>
              <span>
                平均 <strong style={{ color: '#1890ff' }}>{avgProgress}%</strong>
              </span>
            </div>
          </div>

          <Space size="middle">
            <Tooltip title="导出为PDF文件">
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={exportToPDF}
                loading={isExporting}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                }}
              >
                导出PDF
              </Button>
            </Tooltip>
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 4 }}>
              导出Excel
            </Button>
            <Tooltip title="点击任务条查看详细信息">
              <Button icon={<ClockCircleOutlined />} style={{ borderRadius: 4 }}>
                使用说明
              </Button>
            </Tooltip>
          </Space>
        </div>

        <Space size="middle" wrap>
          <Select
            style={{ width: 200 }}
            value={selectedProject}
            onChange={setSelectedProject}
            placeholder="选择项目"
          >
            <Select.Option value="CHEM-2024-001">年产10万吨聚乙烯装置</Select.Option>
            <Select.Option value="CHEM-2024-002">催化裂化装置改造</Select.Option>
            <Select.Option value="CHEM-2024-003">精馏塔系统安装</Select.Option>
          </Select>

          <Select style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}>
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

      {/* 甘特图主体 */}
      <div
        ref={chartContainerRef}
        style={{
          flex: 1,
          display: 'flex',
          gap: '16px',
          padding: '16px',
          overflow: 'auto',
        }}
      >
        <Card
          variant="borderless"
          styles={{ body: { padding: '24px', background: '#fff' } }}
          style={{
            flex: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderRadius: '8px',
          }}
        >
          {/* 图例说明栏 - 优化设计 */}
          <div
            style={{
              marginBottom: '20px',
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #f6f9fc 0%, #fff 100%)',
              borderRadius: '8px',
              border: '1px solid #e8f4ff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(24, 144, 255, 0.08)',
            }}
          >
            <Space size="large">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#595959' }}>今日标记</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#52c41a',
                    boxShadow: '0 0 4px rgba(82, 196, 26, 0.5)',
                  }}
                />
                <span style={{ fontSize: 13, color: '#595959' }}>每日已完成</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#faad14',
                    boxShadow: '0 0 4px rgba(250, 173, 20, 0.5)',
                  }}
                />
                <span style={{ fontSize: 13, color: '#595959' }}>每日未完成</span>
              </div>
            </Space>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Tag color="processing" style={{ margin: 0 }}>
                {inProgressTasks} 进行中
              </Tag>
              <Tag color="success" style={{ margin: 0 }}>
                {completedTasks} 已完成
              </Tag>
              <Tag color="blue" style={{ margin: 0 }}>
                💡 点击任务条查看详情
              </Tag>
            </div>
          </div>

          <div
            style={{
              overflowX: 'auto',
              overflowY: 'auto',
              borderRadius: '8px',
              border: '1px solid #e8e8e8',
              background: 'linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%)',
              padding: '16px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                display: 'block',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.002)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onClick={(e) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const y = e.clientY - rect.top;
                const taskIndex = Math.floor((y - 120) / 50);
                if (taskIndex >= 0 && taskIndex < filteredTasks.length) {
                  setSelectedTask(filteredTasks[taskIndex]);
                  message.success({
                    content: `📋 已选中任务：${filteredTasks[taskIndex].name}`,
                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                  });
                }
              }}
            />
          </div>
        </Card>

        {/* 右侧详情抽屉 - 专业设计 */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ClockCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedTask?.name}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 'normal' }}>
                  每日工作量详细追踪
                </div>
              </div>
            </div>
          }
          placement="right"
          width={680}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          styles={{ body: { padding: '24px', background: '#f5f7fa' } }}
        >
          {selectedTask && selectedTask.daily_workload && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* 任务概览卡片 */}
              <Card
                variant="borderless"
                styles={{ body: { padding: '20px' } }}
                style={{ borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
              >
                <Descriptions column={2} size="small">
                  <Descriptions.Item
                    label={
                      <span>
                        <UserOutlined /> 负责人
                      </span>
                    }
                  >
                    <Tag color="blue">{selectedTask.assignee}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span>
                        <CheckCircleOutlined /> 状态
                      </span>
                    }
                  >
                    <Tag
                      color={
                        selectedTask.status === 'completed'
                          ? 'success'
                          : selectedTask.status === 'in_progress'
                            ? 'processing'
                            : 'default'
                      }
                    >
                      {selectedTask.status === 'completed'
                        ? '已完成'
                        : selectedTask.status === 'in_progress'
                          ? '进行中'
                          : '待开始'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="开始日期">
                    {dayjs(selectedTask.start_date).format('YYYY-MM-DD')}
                  </Descriptions.Item>
                  <Descriptions.Item label="结束日期">
                    {dayjs(selectedTask.end_date).format('YYYY-MM-DD')}
                  </Descriptions.Item>
                </Descriptions>
                <div style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 8, fontSize: 13, color: '#8c8c8c' }}>整体进度</div>
                  <Progress
                    percent={selectedTask.progress}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    size={['100%', 18]}
                  />
                </div>
              </Card>

              {/* 统计卡片 */}
              <Row gutter={12}>
                <Col span={8}>
                  <Card
                    variant="borderless"
                    style={{
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      textAlign: 'center',
                    }}
                    styles={{ body: { padding: '16px 12px' } }}
                  >
                    <Statistic
                      title="总工作日"
                      value={selectedTask.daily_workload.length}
                      suffix="天"
                      valueStyle={{ fontSize: 24, color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    variant="borderless"
                    style={{
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      textAlign: 'center',
                    }}
                    styles={{ body: { padding: '16px 12px' } }}
                  >
                    <Statistic
                      title="已完成"
                      value={selectedTask.daily_workload.filter((d) => d.completed).length}
                      suffix={`/ ${selectedTask.daily_workload.length}`}
                      valueStyle={{ fontSize: 24, color: '#52c41a' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    variant="borderless"
                    style={{
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      textAlign: 'center',
                    }}
                    styles={{ body: { padding: '16px 12px' } }}
                  >
                    <Statistic
                      title="总工时"
                      value={selectedTask.daily_workload.reduce((sum, d) => sum + d.hours, 0)}
                      suffix="小时"
                      valueStyle={{ fontSize: 24, color: '#fa8c16' }}
                      prefix={<FieldTimeOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              {/* 每日工作明细表 */}
              <Card
                variant="borderless"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TeamOutlined style={{ color: '#1890ff' }} />
                    <span>每日工作明细</span>
                  </div>
                }
                styles={{ body: { padding: 0 } }}
                style={{ borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
              >
                <Table
                  dataSource={selectedTask.daily_workload}
                  columns={[
                    {
                      title: '日期',
                      dataIndex: 'date',
                      key: 'date',
                      width: 100,
                      render: (date: string) => (
                        <div>
                          <div style={{ fontWeight: 500 }}>{dayjs(date).format('MM-DD')}</div>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            {dayjs(date).format('ddd')}
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: '设备',
                      dataIndex: 'device',
                      key: 'device',
                      width: 120,
                      render: (device: string) => <Tag color="geekblue">{device}</Tag>,
                    },
                    {
                      title: '工作内容',
                      dataIndex: 'work_content',
                      key: 'work_content',
                      ellipsis: true,
                    },
                    {
                      title: '人员',
                      dataIndex: 'workers',
                      key: 'workers',
                      width: 70,
                      align: 'center' as const,
                      render: (workers: number) => (
                        <Tag icon={<TeamOutlined />} color="cyan">
                          {workers}人
                        </Tag>
                      ),
                    },
                    {
                      title: '工时',
                      dataIndex: 'hours',
                      key: 'hours',
                      width: 70,
                      align: 'center' as const,
                      render: (hours: number) => `${hours}h`,
                    },
                    {
                      title: '状态',
                      dataIndex: 'completed',
                      key: 'completed',
                      width: 80,
                      align: 'center' as const,
                      render: (completed: boolean) => (
                        <Tag
                          icon={completed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                          color={completed ? 'success' : 'warning'}
                        >
                          {completed ? '已完成' : '未完成'}
                        </Tag>
                      ),
                    },
                  ]}
                  pagination={false}
                  size="small"
                  rowKey={(record, index) => `${record.date}-${index}`}
                  rowClassName={(_record, index) => (index % 2 === 0 ? 'row-light' : 'row-dark')}
                />
              </Card>
            </div>
          )}
        </Drawer>
      </div>
    </div>
  );
};

export default GanttChart;
