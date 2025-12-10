import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Row,
  Col,
  Space,
  Tag,
  Progress,
  List,
  Typography,
  Badge,
  Modal,
  Form,
  Input,
  Select,
  Statistic,
  Table,
  App,
  Drawer,
  Tooltip
} from 'antd';
// 移除外部拖拽库，使用自定义实现
import {
  PlusOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BellOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  AlertOutlined,
  DashboardOutlined,
  RocketOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  StarOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FundProjectionScreenOutlined,
  WarningOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  UploadOutlined,
  SyncOutlined,
  HeartOutlined,
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  HomeOutlined,
  ShopOutlined,
  CarOutlined,
  ToolOutlined,
  BugOutlined,
  CodeOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SecurityScanOutlined,
  SafetyOutlined,
  GiftOutlined,
  
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { StorageManager } from '../utils/StorageManager';
import { useProject } from '../contexts/ProjectContext';
import { projectApi } from '../services/api';
import { handleError } from '../utils/errorHandler';
import PageContainer from '../components/Layout/PageContainer';
import { eventBus, EVENTS, ProgressEventData } from '../utils/EventBus';
import './Workspace.css';

const { Title, Text, Paragraph } = Typography;

interface LocalProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

const Workspace: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animateCards, setAnimateCards] = useState(false);
  const { message } = App.useApp(); // 使用App hook获取message，避免静态方法warning
  const { currentProject, setCurrentProject } = useProject();
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<LocalProject | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 本页不再管理本地AI浮窗（已迁移到App.tsx）

  // 加载项目列表
  const loadProjects = async () => {
    try {
      const data: any = await projectApi.getAll();
      setProjects(data);
      if (data.length > 0 && !currentProject) {
        setCurrentProject(data[0] as any);
      }
    } catch (error) {
      handleError(error, {
        showMessage: false,
        silent: true,
      });
      // Mock数据已在API层自动处理
      const mockProjects = [
        {
          id: 'PROJ-001',
          name: '化工设备生产线安装项目',
          description: '某化工企业生产线设备采购、安装及调试',
          status: 'in_progress',
          progress: 45,
          start_date: '2025-01-01',
          end_date: '2025-06-30',
          created_at: '2024-12-01',
          updated_at: '2025-01-24',
        },
        {
          id: 'PROJ-002',
          name: '石油炼化装置改造项目',
          description: '炼油厂催化裂化装置升级改造工程',
          status: 'planning',
          progress: 15,
          start_date: '2025-03-01',
          end_date: '2025-09-30',
          created_at: '2025-01-10',
          updated_at: '2025-01-20',
        },
      ];
      setProjects(mockProjects);
      if (mockProjects.length > 0 && !currentProject) {
        setCurrentProject(mockProjects[0] as any);
      }
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTimeout(() => setAnimateCards(true), 100);
  }, []);

  // 🔗 联动：监听进度变更事件，自动更新项目进度
  useEffect(() => {
    const handleProgressChanged = async (data: ProgressEventData) => {
      // 更新本地项目列表中的进度
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === data.projectId
            ? { ...p, progress: data.progress, updated_at: new Date().toISOString() }
            : p
        )
      );

      // 如果是当前项目，也更新全局状态
      if (currentProject && currentProject.id === data.projectId) {
        setCurrentProject({
          ...currentProject,
          progress: data.progress,
        });
      }

      // 尝试同步到后端
      try {
        const project = projects.find((p) => p.id === data.projectId);
        if (project) {
          await projectApi.update(data.projectId, {
            ...project,
            progress: data.progress,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.warn('Failed to sync progress to backend:', error);
      }

      // 显示通知
      const sourceText = {
        task: '任务进度',
        phase: '阶段进度',
        log: '施工日志',
        manual: '手动更新',
      }[data.source || 'manual'];

      message.success(`项目进度已更新: ${data.progress}% (来源: ${sourceText})`);
    };

    eventBus.on(EVENTS.PROGRESS_CHANGED, handleProgressChanged);

    return () => {
      eventBus.off(EVENTS.PROGRESS_CHANGED, handleProgressChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject, projects, setCurrentProject]);

  const handleCreateProject = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditProject = (project: LocalProject) => {
    setEditingProject(project);
    form.setFieldsValue(project);
    setIsModalVisible(true);
  };

  const handleSaveProject = async (values: any) => {
    try {
      if (editingProject) {
        // 更新现有项目
        const updatedProject = { ...editingProject, ...values };
        const savedProject = await projectApi.update(editingProject.id, updatedProject);
        setCurrentProject(savedProject as any);
        await loadProjects();
        message.success('项目更新成功');
      } else {
        // 创建新项目
        // 🔧 修复：使用简短的递增ID，而不是时间戳
        const existingProjects = projects || [];
        const maxId =
          existingProjects.length > 0
            ? Math.max(
                ...existingProjects.map((p) => {
                  const match = p.id.match(/PROJ-(\d+)/);
                  return match ? parseInt(match[1]) : 0;
                })
              )
            : 0;
        const newProjectId = `PROJ-${String(maxId + 1).padStart(3, '0')}`;

        const newProject: any = {
          id: newProjectId,
          name: values.name,
          description: values.description || '',
          status: values.status || 'planning',
          progress: 0,
          start_date: dayjs().format('YYYY-MM-DD'),
          end_date: dayjs().add(180, 'day').format('YYYY-MM-DD'),
          budget: values.budget || 0,
          spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        let savedProject;
        try {
          // 尝试调用后端API
          savedProject = await projectApi.create(newProject);
        } catch (apiError) {
          // API失败，使用本地存储
          console.warn('API创建项目失败，使用本地存储:', apiError);
          const localProjects = JSON.parse(localStorage.getItem('projects') || '[]');
          localProjects.push(newProject);
          localStorage.setItem('projects', JSON.stringify(localProjects));
          savedProject = newProject;
        }
        const phases = [
          {
            key: 'initiation',
            name: '立项阶段',
            progress: 100,
            status: 'completed',
            weight: 0.05,
            responsible: '项目经理',
            startDate: newProject.start_date,
            endDate: dayjs(newProject.start_date).add(14, 'day').format('YYYY-MM-DD'),
            deliverables: ['项目章程', '可行性研究', '立项批复'],
            milestones: ['立项批准', '团队组建'],
            color: '#52c41a',
          },
          {
            key: 'design',
            name: '设计阶段',
            progress: 0,
            status: 'in_progress',
            weight: 0.15,
            responsible: '设计总工',
            startDate: dayjs(newProject.start_date).add(15, 'day').format('YYYY-MM-DD'),
            endDate: dayjs(newProject.start_date).add(74, 'day').format('YYYY-MM-DD'),
            deliverables: ['初步设计', '详细设计', '施工图纸'],
            milestones: ['设计评审', '图纸会审'],
            color: '#1890ff',
          },
          {
            key: 'procurement',
            name: '采购阶段',
            progress: 0,
            status: 'pending',
            weight: 0.2,
            responsible: '采购经理',
            startDate: dayjs(newProject.start_date).add(31, 'day').format('YYYY-MM-DD'),
            endDate: dayjs(newProject.start_date).add(120, 'day').format('YYYY-MM-DD'),
            deliverables: ['设备清单', '采购合同', '设备到货'],
            milestones: ['招标完成', '合同签订', '设备验收'],
            color: '#fa8c16',
          },
          {
            key: 'construction',
            name: '施工阶段',
            progress: 0,
            status: 'pending',
            weight: 0.4,
            responsible: '施工经理',
            startDate: dayjs(newProject.start_date).add(60, 'day').format('YYYY-MM-DD'),
            endDate: dayjs(newProject.start_date).add(210, 'day').format('YYYY-MM-DD'),
            deliverables: ['土建工程', '安装工程', '配套设施'],
            milestones: ['基础完工', '主体完工', '安装完成'],
            color: '#722ed1',
          },
          {
            key: 'commissioning',
            name: '调试阶段',
            progress: 0,
            status: 'pending',
            weight: 0.15,
            responsible: '调试工程师',
            startDate: dayjs(newProject.start_date).add(210, 'day').format('YYYY-MM-DD'),
            endDate: dayjs(newProject.start_date).add(260, 'day').format('YYYY-MM-DD'),
            deliverables: ['单机调试', '联动调试', '性能测试'],
            milestones: ['单机试车', '联动试车', '72小时试运行'],
            color: '#13c2c2',
          },
          {
            key: 'acceptance',
            name: '验收阶段',
            progress: 0,
            status: 'pending',
            weight: 0.05,
            responsible: '项目经理',
            startDate: dayjs(newProject.start_date).add(261, 'day').format('YYYY-MM-DD'),
            endDate: dayjs(newProject.start_date).add(280, 'day').format('YYYY-MM-DD'),
            deliverables: ['竣工资料', '验收报告', '培训记录'],
            milestones: ['预验收', '正式验收', '移交运营'],
            color: '#eb2f96',
          },
        ];
        StorageManager.save(`epc_phases_${newProjectId}`, phases);
        const baselineTasks = {
          data: [
            {
              id: `${newProjectId}-TASK-1`,
              text: '项目启动',
              start_date: newProject.start_date,
              duration: 5,
              progress: 1,
              owner: '项目经理',
              priority: 'high',
              project_id: newProjectId,
            },
            {
              id: `${newProjectId}-TASK-2`,
              text: '初步设计',
              start_date: dayjs(newProject.start_date).add(15, 'day').format('YYYY-MM-DD'),
              duration: 20,
              progress: 0,
              owner: '设计总工',
              priority: 'high',
              project_id: newProjectId,
            },
            {
              id: `${newProjectId}-TASK-3`,
              text: '详细设计',
              start_date: dayjs(newProject.start_date).add(35, 'day').format('YYYY-MM-DD'),
              duration: 30,
              progress: 0,
              owner: '设计总工',
              priority: 'medium',
              project_id: newProjectId,
            },
          ],
          links: [],
        };
        StorageManager.save(`gantt_tasks_${newProjectId}`, baselineTasks);
        setCurrentProject(savedProject as any);
        await loadProjects();
        message.success('项目创建成功并已保存到数据库');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('保存项目失败: ' + (error as Error).message);
    }
  };

  const handleProjectClick = (project: LocalProject) => {
    setCurrentProject(project as any);
  };

  // 项目统计数据
  const projectStats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'in_progress').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    planning: projects.filter((p) => p.status === 'planning').length,
    avgProgress:
      projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
        : 0,
  };

  // 通知信息
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: '项目进度提醒',
      message: '化工设备生产线项目进度45%，需加快施工进度',
      time: '2小时前',
      projectId: 'PROJ-001',
    },
    {
      id: 2,
      type: 'info',
      title: '新项目立项',
      message: '石油炼化装置改造项目已完成立项审批',
      time: '5小时前',
      projectId: 'PROJ-002',
    },
    {
      id: 3,
      type: 'success',
      title: '里程碑完成',
      message: '设备采购阶段已完成验收',
      time: '1天前',
      projectId: 'PROJ-001',
    },
  ];

  // 待办事项
  const todoItems = [
    {
      id: 1,
      title: '审批施工进度规划',
      project: '化工设备生产线',
      priority: 'high',
      deadline: '今天',
    },
    {
      id: 2,
      title: '确认设备到货时间',
      project: '石油炼化装置',
      priority: 'medium',
      deadline: '明天',
    },
    { id: 3, title: '提交周报', project: '化工设备生产线', priority: 'low', deadline: '本周五' },
  ];

  // 项目表格列定义
  const projectColumns = [
    {
      title: '项目编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig: any = {
          planning: { color: 'default', text: '规划中' },
          in_progress: { color: 'processing', text: '进行中' },
          completed: { color: 'success', text: '已完成' },
          on_hold: { color: 'warning', text: '暂停' },
        };
        const config = statusConfig[status] || statusConfig.planning;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 120,
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: LocalProject) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleProjectClick(record)}>
            查看
          </Button>
          <Button type="link" size="small" onClick={() => handleEditProject(record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setCurrentProject(record as any);
              navigate('/construction-management');
            }}
          >
            施工管理
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="workspace-page">
      {/* 顶部欢迎区域 - 全新设计 */}
      <Card 
        className={`welcome-card ${animateCards ? 'animate-in' : ''}`}
      >
        <Row align="middle">
          <Col span={16}>
            <Title level={2} className="welcome-title">
              <RocketOutlined /> 欢迎回来，管理员！
            </Title>
            <Paragraph className="welcome-subtitle">
              今天是 {currentTime.toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long'
              })} {currentTime.toLocaleTimeString('zh-CN')}
            </Paragraph>
            <Space className="welcome-badges">
              <Badge status="processing" text={<span className="text-white">系统运行正常</span>} />
              <Badge status="success" text={<span className="text-white">AI助手在线</span>} />
              <Badge status="warning" text={<span className="text-white">3个待办事项</span>} />
            </Space>
          </Col>
          <Col span={8} className="align-right">
            <Space direction="vertical" align="end">
              <Space>
                <Tooltip title="新建项目">
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<ProjectOutlined />} 
                    className="btn-white-primary"
                    onClick={handleCreateProject}
                  >
                    新建项目
                  </Button>
                </Tooltip>
                <Tooltip title="智能仪表盘">
                  <Button 
                    size="large" 
                    icon={<DashboardOutlined />} 
                    className="btn-glass"
                    onClick={() => navigate('/dashboard')}
                  >
                    智能分析
                  </Button>
                </Tooltip>
              </Space>
              <div className="welcome-tags">
                <Tag color="gold" icon={<TrophyOutlined />}>高级版</Tag>
                <Tag color="cyan" icon={<ThunderboltOutlined />}>性能优化</Tag>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 核心指标卡片 - 动画效果 */}
      <Row gutter={16} className="mb-24">
        <Col span={6}>
          <Card 
            hoverable
            className={`stat-card ${animateCards ? 'animate-in-up' : ''}`}
            style={{ 
              background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
              border: 'none',
              color: 'white',
              transform: animateCards ? 'translateY(0)' : 'translateY(20px)',
              opacity: animateCards ? 1 : 0,
              transition: 'all 0.5s ease',
              transitionDelay: '0.1s'
            }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>活跃项目</span>}
              value={12}
              prefix={<ProjectOutlined style={{ color: 'white' }} />}
              suffix="个"
              valueStyle={{ color: 'white' }}
            />
            <Progress percent={75} strokeColor="white" trailColor="rgba(255,255,255,0.2)" />
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.9)' }}>
              <ArrowUpOutlined /> 较上周 +15%
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card 
            hoverable
            className={`stat-card ${animateCards ? 'animate-in-up' : ''}`}
            style={{ 
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              border: 'none',
              transform: animateCards ? 'translateY(0)' : 'translateY(20px)',
              opacity: animateCards ? 1 : 0,
              transition: 'all 0.5s ease',
              transitionDelay: '0.4s'
            }}>
            <Statistic
              title={<span style={{ color: '#666' }}>待处理</span>}
              value={15}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              suffix="项"
              valueStyle={{ color: '#333' }}
            />
            <Progress percent={35} strokeColor="#faad14" />
            <div style={{ marginTop: 8, color: '#666' }}>
              <WarningOutlined style={{ color: '#ff4d4f' }} /> 3项紧急
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card 
            hoverable
            className={`stat-card ${animateCards ? 'animate-in-up' : ''}`}
            style={{ 
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              border: 'none',
              transform: animateCards ? 'translateY(0)' : 'translateY(20px)',
              opacity: animateCards ? 1 : 0,
              transition: 'all 0.5s ease',
              transitionDelay: '0.3s'
            }}>
            <Statistic
              title={<span style={{ color: '#666' }}>本月完成</span>}
              value={28}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="项"
              valueStyle={{ color: '#333' }}
            />
            <Progress percent={93} strokeColor="#52c41a" />
            <div style={{ marginTop: 8, color: '#666' }}>
              <CrownOutlined style={{ color: '#faad14' }} /> 超额完成
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card 
            hoverable
            className={`stat-card ${animateCards ? 'animate-in-up' : ''}`}
            style={{ 
              background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
              border: 'none',
              color: 'white',
              transform: animateCards ? 'translateY(0)' : 'translateY(20px)',
              opacity: animateCards ? 1 : 0,
              transition: 'all 0.5s ease',
              transitionDelay: '0.2s'
            }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>项目总数</span>}
              value={50}
              prefix={<ProjectOutlined style={{ color: 'white' }} />}
              suffix="个"
              valueStyle={{ color: 'white' }}
            />
            <Progress percent={50} strokeColor="white" trailColor="rgba(255,255,255,0.2)" />
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.9)' }}>
              <ArrowUpOutlined /> 较上周 +10%
            </div>
          </Card>
        </Col>
      </Row>

      {/* 项目概览统计 */}
      <Card
        title={
          <Space>
            <ProjectOutlined className="project-icon" />
            <span className="project-title">项目管理中心</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProject}>
            新建项目
          </Button>
        }
        className="project-header-card"
      >
        <Row gutter={16}>
          <Col xs={12} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="项目总数"
                value={projectStats.total}
                prefix={<ProjectOutlined />}
                className="stat-value-primary"
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="进行中"
                value={projectStats.inProgress}
                prefix={<ClockCircleOutlined />}
                className="stat-value-warning"
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="已完成"
                value={projectStats.completed}
                prefix={<CheckCircleOutlined />}
                className="stat-value-success"
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="平均进度"
                value={projectStats.avgProgress}
                suffix="%"
                prefix={<DollarOutlined />}
                className="stat-value-purple"
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 当前项目快捷信息 */}
      {currentProject && (
        <Card
          title={
            <Space>
              <FileTextOutlined className="project-list-icon" />
              <span>当前项目</span>
            </Space>
          }
          extra={
            <Button type="primary" onClick={() => navigate('/construction-management')}>
              进入施工管理
            </Button>
          }
          className="current-project-card"
        >
          <Row gutter={16}>
            <Col span={18}>
              <Title level={4} className="project-title-main">
                {currentProject.name}
              </Title>
              <Text type="secondary">{currentProject.description}</Text>
              <div className="project-info-section">
                <Space size="large">
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" className="project-info-label">
                      项目编号
                    </Text>
                    <Text strong>{currentProject.id}</Text>
                  </Space>
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" className="project-info-label">
                      开始日期
                    </Text>
                    <Text strong>
                      <CalendarOutlined /> {currentProject.start_date}
                    </Text>
                  </Space>
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" className="project-info-label">
                      结束日期
                    </Text>
                    <Text strong>
                      <CalendarOutlined /> {currentProject.end_date}
                    </Text>
                  </Space>
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" className="project-info-label">
                      项目状态
                    </Text>
                    <Tag color="processing">进行中</Tag>
                  </Space>
                </Space>
              </div>
            </Col>
            <Col span={6} className="progress-col-center">
              <Progress
                type="circle"
                percent={currentProject.progress}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                size={120}
              />
              <div className="progress-label-container">
                <Text type="secondary" className="progress-label">
                  项目进度
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        {/* 所有项目列表 */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <ProjectOutlined className="project-list-icon" />
                <span>所有项目</span>
              </Space>
            }
          >
            <Table
              dataSource={projects}
              columns={projectColumns}
              rowKey="id"
              pagination={{ pageSize: 5, size: 'small' }}
              size="small"
            />
          </Card>

          {/* 待办事项 */}
          <Card
            title={
              <Space>
                <CheckCircleOutlined className="todo-title-icon" />
                <span>待办事项</span>
                <Badge count={todoItems.length} />
              </Space>
            }
            className="ws-mt-16"
          >
            <List
              dataSource={todoItems}
              renderItem={(item: any) => (
                <List.Item
                  actions={[
                    <Tag
                      color={
                        item.priority === 'high'
                          ? 'red'
                          : item.priority === 'medium'
                            ? 'orange'
                            : 'blue'
                      }
                    >
                      {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                    </Tag>,
                    <Text type="secondary" className="project-info-label">
                      <ClockCircleOutlined /> {item.deadline}
                    </Text>,
                  ]}
                >
                  <List.Item.Meta
                    title={<Text strong>{item.title}</Text>}
                    description={
                      <Text type="secondary" className="project-info-label">
                        {item.project}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 右侧栏 */}
        <Col xs={24} lg={8}>
          {/* 通知中心 */}
          <Card
            title={
              <Space>
                <BellOutlined className="notification-icon" />
                <span>通知中心</span>
                <Badge count={notifications.length} />
              </Space>
            }
            extra={
              <Button type="link" size="small">
                查看全部
              </Button>
            }
          >
            <List
              dataSource={notifications}
              renderItem={(item: any) => (
                <List.Item className="notification-list-item">
                  <div className="notification-item-wrapper">
                    <div className="notification-item-header">
                      <Text strong className="notification-title">
                        {item.title}
                      </Text>
                      <Text type="secondary" className="notification-time">
                        {item.time}
                      </Text>
                    </div>
                    <Text type="secondary" className="project-info-label">
                      {item.message}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
            </Card>

            {/* 团队成员 */}
            <Card
              title={
                <Space>
                  <TeamOutlined className="team-title-icon" />
                  <span>项目团队</span>
                </Space>
              }
              className="ws-mt-16"
            >
              <Space direction="vertical" className="w-100" size="middle">
                <div className="team-item">
                  <Space>
                    <div className="team-avatar avatar-primary">张</div>
                    <div>
                      <Text strong className="team-name">张工程师</Text>
                      <Text type="secondary" className="team-role">项目经理</Text>
                    </div>
                  </Space>
                  <Tag color="success">在线</Tag>
                </div>
                <div className="team-item">
                  <Space>
                    <div className="team-avatar avatar-success">李</div>
                    <div>
                      <Text strong className="team-name">李工</Text>
                      <Text type="secondary" className="team-role">施工负责人</Text>
                    </div>
                  </Space>
                  <Tag color="success">在线</Tag>
                </div>
                <div className="team-item">
                  <Space>
                    <div className="team-avatar avatar-warning">王</div>
                    <div>
                      <Text strong className="team-name">王主管</Text>
                      <Text type="secondary" className="team-role">质检主管</Text>
                    </div>
                  </Space>
                  <Tag color="default">离线</Tag>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 项目创建/编辑Modal */}
        <Modal
          title={editingProject ? '编辑项目' : '新建项目'}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={() => form.submit()}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveProject}
            initialValues={editingProject || {}}
          >
            <Form.Item
              label="项目名称"
              name="name"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>

            <Form.Item
              label="项目描述"
              name="description"
              rules={[{ required: true, message: '请输入项目描述' }]}
            >
              <Input.TextArea rows={4} placeholder="请输入项目描述" />
            </Form.Item>

            <Form.Item label="项目状态" name="status" initialValue="planning">
              <Select>
                <Select.Option value="planning">规划中</Select.Option>
                <Select.Option value="in_progress">进行中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
                <Select.Option value="on_hold">暂停</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        {/* 全局AI窗口与按钮已移至 App.tsx */}
      </div>
  );
};

export default Workspace;
