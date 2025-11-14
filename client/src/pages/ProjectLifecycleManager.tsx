/**
 * 项目生命周期管理中心
 * 管理项目从立项到结束的完整流程
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Timeline,
  Progress,
  Button,
  Row,
  Col,
  Statistic,
  Tag,
  Table,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Tabs,
  Alert,
  Space,
  Divider,
  Badge,
  Descriptions,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  RightOutlined,
  FileTextOutlined,
  FlagOutlined,
  WarningOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import {
  ProjectPhase,
  PhaseNames,
  PhaseDescriptions,
  PhaseDeliverables,
  PhaseStatus,
  PhaseStatusNames,
  ProjectPhaseData,
  DeliverableItem,
  MilestoneItem,
  RiskItem,
  getPhaseColor,
  canTransitionToPhase,
  getNextPhase,
  calculatePhaseProgress,
  calculateOverallProgress,
  canStartPhase,
} from '../types/projectLifecycle';

const { Step } = Steps;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface ProjectLifecycleManagerProps {
  projectId?: string;
}

const ProjectLifecycleManager: React.FC<ProjectLifecycleManagerProps> = ({ projectId = 'PROJ-001' }) => {
  const [currentPhase, setCurrentPhase] = useState<ProjectPhase>(ProjectPhase.INITIATION);
  const [phases, setPhases] = useState<ProjectPhaseData[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase>(ProjectPhase.INITIATION);
  const [phaseModalVisible, setPhaseModalVisible] = useState(false);
  const [deliverableModalVisible, setDeliverableModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 初始化所有阶段数据
  useEffect(() => {
    initializePhases();
  }, []);

  const initializePhases = () => {
    const allPhases = Object.values(ProjectPhase);
    const initialPhases: ProjectPhaseData[] = allPhases.map((phase, index) => ({
      phase,
      status: index === 0 ? PhaseStatus.IN_PROGRESS : PhaseStatus.NOT_STARTED,
      progress: index === 0 ? 30 : 0,
      deliverables: PhaseDeliverables[phase].map((name, idx) => ({
        id: `${phase}-deliverable-${idx}`,
        name,
        status: 'pending',
      })),
      milestones: [],
      risks: [],
    }));
    setPhases(initialPhases);
  };

  // 获取当前阶段数据
  const getCurrentPhaseData = (): ProjectPhaseData | undefined => {
    return phases.find((p) => p.phase === selectedPhase);
  };

  // 转换到下一阶段
  const handleTransitionToNextPhase = () => {
    const nextPhase = getNextPhase(currentPhase);
    if (!nextPhase) {
      message.warning('当前已是最后阶段');
      return;
    }

    Modal.confirm({
      title: '确认阶段转换',
      content: `确定要将项目从"${PhaseNames[currentPhase]}"转换到"${PhaseNames[nextPhase]}"吗？`,
      onOk: () => {
        setPhases((prev) =>
          prev.map((p) => {
            if (p.phase === currentPhase) {
              return { ...p, status: PhaseStatus.COMPLETED, progress: 100 };
            }
            if (p.phase === nextPhase) {
              return { ...p, status: PhaseStatus.IN_PROGRESS, startDate: dayjs().format('YYYY-MM-DD') };
            }
            return p;
          })
        );
        setCurrentPhase(nextPhase);
        setSelectedPhase(nextPhase);
        message.success('阶段转换成功');
      },
    });
  };

  // 更新交付物状态
  const handleUpdateDeliverable = (deliverableId: string, status: DeliverableItem['status']) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.phase === selectedPhase) {
          const updatedDeliverables = p.deliverables.map((d) =>
            d.id === deliverableId ? { ...d, status } : d
          );
          const newProgress = calculatePhaseProgress({ ...p, deliverables: updatedDeliverables });
          return { ...p, deliverables: updatedDeliverables, progress: newProgress };
        }
        return p;
      })
    );
  };

  // 渲染阶段步骤条
  const renderSteps = () => {
    const allPhases = Object.values(ProjectPhase);
    const currentIndex = allPhases.indexOf(currentPhase);

    return (
      <Steps current={currentIndex} style={{ marginBottom: 32 }}>
        {allPhases.map((phase) => {
          const phaseData = phases.find((p) => p.phase === phase);
          let icon;
          switch (phaseData?.status) {
            case PhaseStatus.COMPLETED:
              icon = <CheckCircleOutlined />;
              break;
            case PhaseStatus.IN_PROGRESS:
              icon = <SyncOutlined spin />;
              break;
            case PhaseStatus.ON_HOLD:
              icon = <ClockCircleOutlined />;
              break;
            case PhaseStatus.CANCELLED:
              icon = <CloseCircleOutlined />;
              break;
            default:
              icon = <ClockCircleOutlined />;
          }

          return (
            <Step
              key={phase}
              title={PhaseNames[phase]}
              icon={icon}
              description={`${phaseData?.progress || 0}%`}
            />
          );
        })}
      </Steps>
    );
  };

  // 渲染统计卡片
  const renderStatistics = () => {
    const completedPhases = phases.filter((p) => p.status === PhaseStatus.COMPLETED).length;
    const overallProgress = calculateOverallProgress(phases);
    const currentPhaseData = getCurrentPhaseData();
    const totalDeliverables = currentPhaseData?.deliverables.length || 0;
    const completedDeliverables = currentPhaseData?.deliverables.filter((d) => d.status === 'completed').length || 0;

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="整体进度"
              value={overallProgress}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前阶段"
              value={PhaseNames[currentPhase]}
              valueStyle={{ color: '#1890ff', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成阶段"
              value={completedPhases}
              suffix={`/ ${phases.length}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="交付物完成率"
              value={totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染阶段详情
  const renderPhaseDetail = () => {
    const phaseData = getCurrentPhaseData();
    if (!phaseData) return null;

    const deliverableColumns = [
      {
        title: '交付物名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: DeliverableItem['status']) => {
          const statusMap = {
            pending: { color: 'default', text: '待处理' },
            in_progress: { color: 'processing', text: '进行中' },
            completed: { color: 'success', text: '已完成' },
            rejected: { color: 'error', text: '已拒绝' },
          };
          return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
        },
      },
      {
        title: '操作',
        key: 'action',
        render: (_: any, record: DeliverableItem) => (
          <Space>
            {record.status !== 'completed' && (
              <Button
                type="link"
                size="small"
                onClick={() => handleUpdateDeliverable(record.id, 'completed')}
              >
                标记完成
              </Button>
            )}
            <Button type="link" size="small">
              查看详情
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <Card>
        <Tabs defaultActiveKey="overview">
          <TabPane tab="阶段概览" key="overview">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="阶段名称">{PhaseNames[phaseData.phase]}</Descriptions.Item>
              <Descriptions.Item label="阶段状态">
                <Tag color={getPhaseColor(phaseData.status)}>{PhaseStatusNames[phaseData.status]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={phaseData.progress} status="active" />
              </Descriptions.Item>
              <Descriptions.Item label="开始日期">
                {phaseData.startDate || '未开始'}
              </Descriptions.Item>
              <Descriptions.Item label="预计结束日期" span={2}>
                {phaseData.planEndDate || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="阶段描述" span={2}>
                {PhaseDescriptions[phaseData.phase]}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab={`交付物 (${phaseData.deliverables.length})`} key="deliverables">
            <Table
              columns={deliverableColumns}
              dataSource={phaseData.deliverables}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab={`里程碑 (${phaseData.milestones.length})`} key="milestones">
            <Timeline>
              {phaseData.milestones.map((milestone) => (
                <Timeline.Item key={milestone.id} color={milestone.status === 'achieved' ? 'green' : 'blue'}>
                  <Space direction="vertical">
                    <Space>
                      <FlagOutlined />
                      <strong>{milestone.name}</strong>
                      <Tag>{milestone.status}</Tag>
                    </Space>
                    <div style={{ color: '#666' }}>{milestone.description}</div>
                    <div>目标日期: {milestone.targetDate}</div>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
            {phaseData.milestones.length === 0 && (
              <Alert message="暂无里程碑" type="info" showIcon />
            )}
          </TabPane>

          <TabPane tab={`风险 (${phaseData.risks.length})`} key="risks">
            {phaseData.risks.length === 0 ? (
              <Alert message="暂无风险记录" type="success" showIcon />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {phaseData.risks.map((risk) => (
                  <Card key={risk.id} size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <WarningOutlined style={{ color: '#faad14' }} />
                        <strong>{risk.description}</strong>
                      </Space>
                      <Row gutter={16}>
                        <Col span={8}>概率: <Tag color="orange">{risk.probability}</Tag></Col>
                        <Col span={8}>影响: <Tag color="red">{risk.impact}</Tag></Col>
                        <Col span={8}>状态: <Badge status="processing" text={risk.status} /></Col>
                      </Row>
                      {risk.mitigation && (
                        <div>
                          <strong>缓解措施: </strong>
                          {risk.mitigation}
                        </div>
                      )}
                    </Space>
                  </Card>
                ))}
              </Space>
            )}
          </TabPane>
        </Tabs>
      </Card>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <RocketOutlined />
            项目生命周期管理
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" onClick={() => setPhaseModalVisible(true)}>
              阶段设置
            </Button>
            {getNextPhase(currentPhase) && (
              <Button type="primary" icon={<RightOutlined />} onClick={handleTransitionToNextPhase}>
                进入下一阶段
              </Button>
            )}
          </Space>
        }
      >
        {renderSteps()}
        {renderStatistics()}

        <Divider />

        <Row gutter={16}>
          <Col span={6}>
            <Card title="阶段导航" size="small">
              <Timeline>
                {Object.values(ProjectPhase).map((phase) => {
                  const phaseData = phases.find((p) => p.phase === phase);
                  return (
                    <Timeline.Item
                      key={phase}
                      color={getPhaseColor(phaseData?.status || PhaseStatus.NOT_STARTED)}
                    >
                      <div onClick={() => setSelectedPhase(phase)} style={{ cursor: 'pointer' }}>
                        <Space>
                          <strong style={{ color: selectedPhase === phase ? '#1890ff' : 'inherit' }}>
                            {PhaseNames[phase]}
                          </strong>
                          {phase === currentPhase && <Badge status="processing" />}
                        </Space>
                      </div>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </Card>
          </Col>

          <Col span={18}>
            {renderPhaseDetail()}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProjectLifecycleManager;
