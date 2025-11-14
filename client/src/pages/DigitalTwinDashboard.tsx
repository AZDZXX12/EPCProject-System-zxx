import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Progress, Timeline, Badge, Space } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  ToolOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useProject } from '../contexts/ProjectContext';
import { projectApi, deviceApi, taskApi } from '../services/api';
import EnhancedScene3D from '../components/DigitalTwin/EnhancedScene3D';
import './DigitalTwinDashboard.css';

interface Project {
  id: number;
  project_id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
}

interface ConstructionLog {
  id: number;
  time: string;
  operator: string;
  action: string;
  device: string;
  status: 'success' | 'warning' | 'info';
}

const DigitalTwinDashboard: React.FC = () => {
  const { projects: _contextProjects } = useProject();
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<ConstructionLog[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceCount, setDeviceCount] = useState<number>(0);
  const [taskCount, setTaskCount] = useState<number>(0);

  useEffect(() => {
    // 📡 从后端加载真实项目数据
    const loadProjects = async () => {
      try {
        const data = await projectApi.getAll();
        if (data && Array.isArray(data)) {
          setProjects(data as any);
        }
      } catch (error) {
        console.error('加载项目数据失败:', error);
      }

      if (projects.length === 0) {
        setProjects([
          {
            id: 1,
            project_id: 'CHEM-2024-001',
            name: '年产10万吨聚乙烯装置建设',
            description: '聚乙烯生产装置设备安装工程',
            status: 'active',
            progress: 65,
            start_date: '2024-01-01',
            end_date: '2024-06-30',
          },
          {
            id: 2,
            project_id: 'CHEM-2024-002',
            name: '催化裂化装置改造工程',
            description: '催化裂化反应器及配套设备更新',
            status: 'active',
            progress: 45,
            start_date: '2024-02-01',
            end_date: '2024-08-31',
          },
        ]);
      }
    };

    // 📡 加载设备统计
    const loadDeviceStats = async () => {
      try {
        const data = await deviceApi.getAll();
        if (data && Array.isArray(data)) {
          setDeviceCount((data as any[]).length);
        }
      } catch (error) {
        console.error('加载设备统计失败:', error);
        setDeviceCount(7);
      }
    };

    // 📡 加载任务统计
    const loadTaskStats = async () => {
      try {
        const data = await taskApi.getAll();
        if (data && Array.isArray(data)) {
          setTaskCount((data as any[]).length);
        }
      } catch (error) {
        console.error('加载任务统计失败:', error);
        setTaskCount(0);
      }
    };

    loadProjects();
    loadDeviceStats();
    loadTaskStats();

    // 初始化施工日志
    setLogs([
      {
        id: 1,
        time: '10:32',
        operator: '王五',
        action: '完成安装',
        device: '聚合反应釜',
        status: 'success',
      },
      {
        id: 2,
        time: '10:15',
        operator: '李四',
        action: '开始调试',
        device: '换热器组',
        status: 'info',
      },
      {
        id: 3,
        time: '09:48',
        operator: '张三',
        action: '检查完成',
        device: '离心泵',
        status: 'success',
      },
      {
        id: 4,
        time: '09:20',
        operator: '赵六',
        action: '延期预警',
        device: '气液分离器',
        status: 'warning',
      },
    ]);

    // 模拟实时日志更新
    const logInterval = setInterval(() => {
      const operators = ['王五', '李四', '张三', '赵六', '孙七', '周八'];
      const actions = ['完成安装', '开始调试', '检查完成', '维护记录', '测试通过'];
      const devices = ['聚合反应釜', '换热器组', '离心泵', '储罐', '压缩机', '分离器'];
      const statuses: Array<'success' | 'info' | 'warning'> = ['success', 'info', 'warning'];

      const newLog: ConstructionLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        operator: operators[Math.floor(Math.random() * operators.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };

      setLogs((prev) => [newLog, ...prev].slice(0, 10));
    }, 8000); // 每8秒新增一条日志

    return () => clearInterval(logInterval);
  }, []);

  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0;

  // 3D场景中的设备数据
  const equipment3D = [
    {
      id: '1',
      name: '聚合反应釜 R-101',
      position: [0, 0, 0] as [number, number, number],
      progress: 90,
      highlight: selectedDevice === '1',
      type: 'reactor' as const,
      status: 'working' as const,
    },
    {
      id: '2',
      name: '换热器 E-201',
      position: [5, 0, 0] as [number, number, number],
      progress: 75,
      highlight: selectedDevice === '2',
      type: 'reactor' as const,
      status: 'idle' as const,
    },
    {
      id: '3',
      name: '原料储罐 T-301',
      position: [-5, 0, 0] as [number, number, number],
      progress: 100,
      highlight: selectedDevice === '3',
      type: 'tank' as const,
      status: 'working' as const,
    },
    {
      id: '4',
      name: '产品储罐 T-302',
      position: [0, 0, 5] as [number, number, number],
      progress: 85,
      highlight: selectedDevice === '4',
      type: 'tank' as const,
      status: 'working' as const,
    },
    {
      id: '5',
      name: '催化反应器 R-102',
      position: [5, 0, 5] as [number, number, number],
      progress: 60,
      highlight: selectedDevice === '5',
      type: 'reactor' as const,
      status: 'warning' as const,
    },
    {
      id: '6',
      name: '中间储罐 T-303',
      position: [-5, 0, 5] as [number, number, number],
      progress: 45,
      highlight: selectedDevice === '6',
      type: 'tank' as const,
      status: 'idle' as const,
    },
    {
      id: '7',
      name: '控制中心',
      position: [-8, 0, -5] as [number, number, number],
      progress: 100,
      highlight: selectedDevice === '7',
      type: 'building' as const,
      status: 'working' as const,
    },
  ];

  return (
    <div className="digital-twin-dashboard">
      <div className="cyber-header">
        <h1 className="cyber-title">
          <ThunderboltOutlined className="title-icon" />
          数字孪生化工装置安装管控平台
        </h1>
        <div className="cyber-subtitle">DIGITAL TWIN CHEMICAL EQUIPMENT INSTALLATION PLATFORM</div>
      </div>

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card className="cyber-card" hoverable>
            <div className="stat-content">
              <div
                className="stat-icon"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <ProjectOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-label">项目总数</div>
                <div className="stat-value">{projects.length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card className="cyber-card" hoverable>
            <div className="stat-content">
              <div
                className="stat-icon"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
              >
                <ClockCircleOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-label">进行中</div>
                <div className="stat-value">{activeProjects}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card className="cyber-card" hoverable>
            <div className="stat-content">
              <div
                className="stat-icon"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <CheckCircleOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-label">整体进度</div>
                <div className="stat-value">{avgProgress}%</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card className="cyber-card" hoverable>
            <div className="stat-content">
              <div
                className="stat-icon"
                style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}
              >
                <ToolOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-label">设备数量</div>
                <div className="stat-value">{deviceCount}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card className="cyber-card" hoverable>
            <div className="stat-content">
              <div
                className="stat-icon"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <DashboardOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-label">任务数量</div>
                <div className="stat-value">{taskCount}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card className="cyber-card" hoverable>
            <div className="stat-content">
              <div
                className="stat-icon"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}
              >
                <SafetyOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-label">安全天数</div>
                <div className="stat-value">15</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3D场景与实时日志 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card
            className="cyber-card scene-card"
            title={
              <span className="card-title">
                <ThunderboltOutlined /> 3D数字孪生场景
              </span>
            }
          >
            <div style={{ height: 600 }}>
              <EnhancedScene3D
                equipment={equipment3D}
                onEquipmentClick={(id) => setSelectedDevice(id)}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            className="cyber-card log-card"
            title={
              <span className="card-title">
                <ClockCircleOutlined /> 实时施工日志
              </span>
            }
          >
            <div className="log-container">
              <Timeline
                items={logs.map((log) => ({
                  color:
                    log.status === 'success'
                      ? '#00ff88'
                      : log.status === 'warning'
                        ? '#ff9800'
                        : '#00bfff',
                  dot: log.status === 'warning' ? <WarningOutlined /> : undefined,
                  children: (
                    <div className="log-item">
                      <div className="log-header">
                        <span className="log-time">{log.time}</span>
                        <Badge
                          status={
                            log.status === 'success'
                              ? 'success'
                              : log.status === 'warning'
                                ? 'warning'
                                : 'processing'
                          }
                          text={
                            log.status === 'success'
                              ? '成功'
                              : log.status === 'warning'
                                ? '预警'
                                : '进行中'
                          }
                        />
                      </div>
                      <div className="log-content">
                        <span className="log-operator">{log.operator}</span>
                        <span className="log-action">{log.action}</span>
                        <span className="log-device">{log.device}</span>
                      </div>
                    </div>
                  ),
                }))}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 项目进度 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            className="cyber-card"
            title={
              <span className="card-title">
                <ProjectOutlined /> 项目进度监控
              </span>
            }
          >
            <div className="project-progress-container">
              {projects.map((project) => (
                <div key={project.id} className="project-item">
                  <div className="project-header">
                    <Space>
                      <span className="project-id">{project.project_id}</span>
                      <span className="project-name">{project.name}</span>
                      <Badge status="processing" text="进行中" />
                    </Space>
                  </div>
                  <div className="project-progress">
                    <Progress
                      percent={project.progress}
                      strokeColor={{
                        '0%': '#667eea',
                        '50%': '#764ba2',
                        '100%': '#f093fb',
                      }}
                      trailColor="rgba(255,255,255,0.1)"
                      size={[0, 12]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DigitalTwinDashboard;
