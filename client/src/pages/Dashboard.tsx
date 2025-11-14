import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Progress, Timeline, List, Tag, Alert, Divider } from 'antd';
import { projectApi, taskApi, deviceApi } from '../services/api';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  TeamOutlined,
  ToolOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useProject } from '../contexts/ProjectContext';

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

const Dashboard: React.FC = () => {
  const { currentProject } = useProject();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, inProgress: 0, pending: 0 });
  const [deviceStats, setDeviceStats] = useState({ total: 0, installed: 0, pending: 0 });

  // 加载当前项目的任务统计
  useEffect(() => {
    if (!currentProject) return;

    const fetchTaskStats = async () => {
      try {
        const tasks = (await taskApi.getAll(currentProject.id)) as any[];
          const stats = {
            total: tasks.length,
            completed: tasks.filter((t: any) => t.status === 'completed').length,
            inProgress: tasks.filter((t: any) => t.status === 'in_progress').length,
            pending: tasks.filter((t: any) => t.status === 'pending').length,
          };
          setTaskStats(stats);
      } catch (error) {
        setTaskStats({ total: 15, completed: 5, inProgress: 7, pending: 3 });
      }
    };

    fetchTaskStats();
  }, [currentProject]);

  // 加载当前项目的设备统计
  useEffect(() => {
    if (!currentProject) return;

    const fetchDeviceStats = async () => {
      try {
        const devices = (await deviceApi.getAll()) as any[];
          const stats = {
            total: devices.length,
            installed: devices.filter((d: any) => d.status === 'installed').length,
            pending: devices.filter((d: any) => d.status === 'pending' || d.status === 'ordered')
              .length,
          };
          setDeviceStats(stats);
      } catch (error) {
        setDeviceStats({ total: 25, installed: 18, pending: 7 });
      }
    };

    fetchDeviceStats();
  }, [currentProject]);

  useEffect(() => {
    projectApi
      .getAll()
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data as any);
        }
        setLoading(false);
      })
      .catch(() => {
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
          {
            id: 3,
            project_id: 'CHEM-2023-015',
            name: '环保脱硫设备安装项目',
            description: '烟气脱硫装置安装及调试',
            status: 'completed',
            progress: 100,
            start_date: '2023-09-01',
            end_date: '2023-12-31',
          },
        ]);
        setLoading(false);
      });
  }, []);

  const activeProjects = Array.isArray(projects)
    ? projects.filter((p) => p.status === 'active').length
    : 0;
  const completedProjects = Array.isArray(projects)
    ? projects.filter((p) => p.status === 'completed').length
    : 0;
  const avgProgress =
    Array.isArray(projects) && projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0;

  return (
    <div>
      <h1 style={{ marginBottom: 8, fontSize: 28, fontWeight: 600 }}>EPC工程概览</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Engineering · Procurement · Construction 项目管理平台
      </p>

      {/* 当前项目信息卡片 */}
      {currentProject && (
        <Card
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
          styles={{ body: { padding: 20 } }}
        >
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <div style={{ color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <ProjectOutlined style={{ fontSize: 24, marginRight: 12 }} />
                  <h2 style={{ color: '#fff', margin: 0, fontSize: 20 }}>{currentProject.name}</h2>
                  <Tag
                    color={currentProject.status === 'in_progress' ? 'green' : 'blue'}
                    style={{ marginLeft: 12 }}
                  >
                    {currentProject.status === 'in_progress'
                      ? '进行中'
                      : currentProject.status === 'planning'
                        ? '规划中'
                        : currentProject.status === 'completed'
                          ? '已完成'
                          : '已暂停'}
                  </Tag>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: 14 }}>
                  {currentProject.description || '项目编号: ' + currentProject.id}
                </p>
              </div>
            </Col>
            <Col>
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={currentProject.progress || 0}
                  size={80}
                  strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                />
                <div style={{ color: '#fff', marginTop: 8, fontSize: 12 }}>整体进度</div>
              </div>
            </Col>
          </Row>
          <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '16px 0' }} />
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>开始日期</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>
                {currentProject.start_date}
              </div>
            </Col>
            <Col span={6}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>结束日期</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>
                {currentProject.end_date}
              </div>
            </Col>
            <Col span={6}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>项目经理</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>
                {currentProject.manager || '未指定'}
              </div>
            </Col>
            <Col span={6}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>项目预算</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>
                {currentProject.budget
                  ? `¥${(currentProject.budget / 10000).toFixed(0)}万`
                  : '未设置'}
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Alert
        message="安全提示"
        description="当前有 2 项设备需要进行安全检查，请相关人员及时处理。"
        type="warning"
        icon={<WarningOutlined />}
        showIcon
        closable
        style={{ marginBottom: 24 }}
      />

      {/* 当前项目统计数据 */}
      {currentProject && (
        <>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>
            <ProjectOutlined /> 当前项目数据统计
          </h3>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<span style={{ fontSize: 14, color: '#666' }}>任务总数</span>}
                  value={taskStats.total}
                  prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff', fontSize: 28 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<span style={{ fontSize: 14, color: '#666' }}>已完成任务</span>}
                  value={taskStats.completed}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontSize: 28 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<span style={{ fontSize: 14, color: '#666' }}>进行中任务</span>}
                  value={taskStats.inProgress}
                  prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14', fontSize: 28 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<span style={{ fontSize: 14, color: '#666' }}>待开始任务</span>}
                  value={taskStats.pending}
                  prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f', fontSize: 28 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<span style={{ fontSize: 14, color: '#666' }}>设备总数</span>}
                  value={deviceStats.total}
                  prefix={<ToolOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1', fontSize: 28 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<span style={{ fontSize: 14, color: '#666' }}>已安装设备</span>}
                  value={deviceStats.installed}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontSize: 28 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<span style={{ fontSize: 14, color: '#666' }}>待安装设备</span>}
                  value={deviceStats.pending}
                  prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14', fontSize: 28 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title={<span style={{ fontSize: 14, color: '#666' }}>安装率</span>}
                  value={
                    deviceStats.total > 0
                      ? Math.round((deviceStats.installed / deviceStats.total) * 100)
                      : 0
                  }
                  suffix="%"
                  prefix={<RiseOutlined style={{ color: '#13c2c2' }} />}
                  valueStyle={{ color: '#13c2c2', fontSize: 28 }}
                />
              </Card>
            </Col>
          </Row>
          <Divider />
        </>
      )}

      <h3 style={{ marginBottom: 16, fontSize: 18 }}>
        <TeamOutlined /> 全局项目统计
      </h3>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={<span style={{ fontSize: 14, color: '#666' }}>项目总数</span>}
              value={projects.length}
              prefix={<ProjectOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 'bold' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={<span style={{ fontSize: 14, color: '#666' }}>进行中</span>}
              value={activeProjects}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: 32, fontWeight: 'bold' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={<span style={{ fontSize: 14, color: '#666' }}>已完成</span>}
              value={completedProjects}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 'bold' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={<span style={{ fontSize: 14, color: '#666' }}>平均进度</span>}
              value={avgProgress}
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: 32, fontWeight: 'bold' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>项目进度概况</span>}
            loading={loading}
          >
            <List
              dataSource={projects}
              renderItem={(project) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <span style={{ fontSize: 16, fontWeight: 500 }}>
                        {project.name}
                        <Tag
                          color={project.status === 'completed' ? 'success' : 'processing'}
                          style={{ marginLeft: 12 }}
                        >
                          {project.status === 'completed' ? '已完成' : '进行中'}
                        </Tag>
                      </span>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        <div style={{ marginBottom: 4, color: '#666' }}>
                          项目编号: {project.project_id}
                        </div>
                        <Progress
                          percent={project.progress}
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                          status={project.progress === 100 ? 'success' : 'active'}
                        />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>最新动态</span>}
            style={{ marginBottom: 16 }}
          >
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <div style={{ fontWeight: 500 }}>环保脱硫设备安装完成</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>2小时前</div>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <div style={{ fontWeight: 500 }}>反应釜压力测试通过</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>5小时前</div>
                    </div>
                  ),
                },
                {
                  color: 'orange',
                  children: (
                    <div>
                      <div style={{ fontWeight: 500 }}>催化剂装填作业启动</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>1天前</div>
                    </div>
                  ),
                },
                {
                  children: (
                    <div>
                      <div style={{ fontWeight: 500 }}>换热器组安装就位</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>3天前</div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <Card.Grid
                  hoverable={false}
                  style={{ width: '100%', textAlign: 'center', padding: 16 }}
                >
                  <SafetyOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>15</div>
                  <div style={{ color: '#666', fontSize: 12 }}>安全天数</div>
                </Card.Grid>
              </Col>
              <Col span={12}>
                <Card.Grid
                  hoverable={false}
                  style={{ width: '100%', textAlign: 'center', padding: 16 }}
                >
                  <ExperimentOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>98%</div>
                  <div style={{ color: '#666', fontSize: 12 }}>质量合格率</div>
                </Card.Grid>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
