import React, { useState } from 'react';
import { 
  Card, Tabs, Empty, Button, Space, Progress, Tag, Timeline, 
  Descriptions, Modal, Form, Input, DatePicker, Slider, Select,
  Table, Statistic, Row, Col, message 
} from 'antd';
import { 
  DashboardOutlined, RocketOutlined, FileTextOutlined, 
  SafetyOutlined, CheckCircleOutlined, EditOutlined,
  PlusOutlined, SyncOutlined
} from '@ant-design/icons';
import { useProject } from '../contexts/ProjectContext';
import dayjs from 'dayjs';

/**
 * 总包施工管理 - 完整EPC项目生命周期管理
 * 功能：立项 → 设计 → 采购 → 施工 → 调试 → 验收 → 完工
 */
const ConstructionManagement: React.FC = () => {
  const { currentProject } = useProject();
  const [activeTab, setActiveTab] = useState('overview');
  const [form] = Form.useForm();
  
  // 🎯 EPC阶段状态管理
  const [epcPhases, setEpcPhases] = useState([
    {
      key: 'initiation',
      name: '立项阶段',
      progress: 100,
      status: 'completed',
      weight: 0.05,
      responsible: '项目经理',
      startDate: '2025-01-01',
      endDate: '2025-01-15',
      deliverables: ['项目章程', '可行性研究', '立项批复'],
      milestones: ['立项批准', '团队组建'],
      color: '#52c41a'
    },
    {
      key: 'design',
      name: '设计阶段',
      progress: 85,
      status: 'in_progress',
      weight: 0.15,
      responsible: '设计总工',
      startDate: '2025-01-16',
      endDate: '2025-03-15',
      deliverables: ['初步设计', '详细设计', '施工图纸'],
      milestones: ['设计评审', '图纸会审'],
      color: '#1890ff'
    },
    {
      key: 'procurement',
      name: '采购阶段',
      progress: 60,
      status: 'in_progress',
      weight: 0.20,
      responsible: '采购经理',
      startDate: '2025-02-01',
      endDate: '2025-04-30',
      deliverables: ['设备清单', '采购合同', '设备到货'],
      milestones: ['招标完成', '合同签订', '设备验收'],
      color: '#fa8c16'
    },
    {
      key: 'construction',
      name: '施工阶段',
      progress: 45,
      status: 'in_progress',
      weight: 0.40,
      responsible: '施工经理',
      startDate: '2025-03-01',
      endDate: '2025-08-31',
      deliverables: ['土建工程', '安装工程', '配套设施'],
      milestones: ['基础完工', '主体完工', '安装完成'],
      color: '#722ed1'
    },
    {
      key: 'commissioning',
      name: '调试阶段',
      progress: 20,
      status: 'pending',
      weight: 0.15,
      responsible: '调试工程师',
      startDate: '2025-08-01',
      endDate: '2025-09-30',
      deliverables: ['单机调试', '联动调试', '性能测试'],
      milestones: ['单机试车', '联动试车', '72小时试运行'],
      color: '#13c2c2'
    },
    {
      key: 'acceptance',
      name: '验收阶段',
      progress: 0,
      status: 'pending',
      weight: 0.05,
      responsible: '项目经理',
      startDate: '2025-10-01',
      endDate: '2025-10-31',
      deliverables: ['竣工资料', '验收报告', '培训记录'],
      milestones: ['预验收', '正式验收', '移交运营'],
      color: '#eb2f96'
    }
  ]);

  // 编辑阶段
  const [editingPhase, setEditingPhase] = useState<any>(null);
  const [isPhaseModalVisible, setIsPhaseModalVisible] = useState(false);

  // 📊 计算项目总进度（加权平均）
  const calculateOverallProgress = (phases: any[]) => {
    return phases.reduce((total, phase) => {
      return total + (phase.progress * phase.weight);
    }, 0);
  };

  // 🔄 更新项目进度
  const updateProjectProgress = async (newProgress: number) => {
    if (currentProject) {
      // TODO: 调用API更新项目进度
      message.success(`项目总进度已更新为 ${newProgress.toFixed(1)}%`);
    }
  };

  // ✏️ 编辑阶段
  const handleEditPhase = (phase: any) => {
    setEditingPhase(phase);
    form.setFieldsValue({
      ...phase,
      startDate: dayjs(phase.startDate),
      endDate: dayjs(phase.endDate)
    });
    setIsPhaseModalVisible(true);
  };

  // 💾 保存阶段
  const handleSavePhase = async (values: any) => {
    const updatedPhases = epcPhases.map(p => 
      p.key === editingPhase.key ? {
        ...p,
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD')
      } : p
    );
    setEpcPhases(updatedPhases);
    
    // 🔗 联动：更新项目总进度
    const overallProgress = calculateOverallProgress(updatedPhases);
    await updateProjectProgress(overallProgress);
    
    setIsPhaseModalVisible(false);
    message.success('阶段信息已更新');
  };

  // 🔄 同步到甘特图
  const syncToGantt = (phase: any) => {
    message.info(`正在将 ${phase.name} 同步到甘特图...`);
    // TODO: 实现甘特图同步逻辑
  };

  // 📊 项目概览
  const renderOverview = () => {
    const overallProgress = calculateOverallProgress(epcPhases);
    const completedPhases = epcPhases.filter(p => p.status === 'completed').length;
    const inProgressPhases = epcPhases.filter(p => p.status === 'in_progress').length;

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 总体进度 */}
        <Card>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic 
                title="项目总进度" 
                value={overallProgress.toFixed(1)} 
                suffix="%" 
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="已完成阶段" 
                value={completedPhases} 
                suffix={`/ ${epcPhases.length}`}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="进行中阶段" 
                value={inProgressPhases} 
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="项目天数" 
                value={dayjs().diff(dayjs('2025-01-01'), 'day')} 
                suffix="天"
              />
            </Col>
          </Row>
        </Card>

        {/* 环节衔接流程图 */}
        <Card title="项目生命周期环节衔接">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {epcPhases.map((phase, index) => (
              <div key={phase.key}>
                <Card 
                  size="small"
                  style={{ 
                    borderLeft: `4px solid ${phase.color}`,
                    backgroundColor: phase.status === 'completed' ? '#f6ffed' : 
                                   phase.status === 'in_progress' ? '#e6f7ff' : '#fafafa'
                  }}
                >
                  <Row gutter={16} align="middle">
                    <Col span={4}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: 24, 
                          fontWeight: 'bold', 
                          color: phase.color 
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {phase.name}
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <span style={{ color: '#999', fontSize: 12 }}>输入：</span>
                          <Tag style={{ marginLeft: 4 }}>
                            {index === 0 ? '项目需求' : epcPhases[index - 1].deliverables[0]}
                          </Tag>
                        </div>
                        <div>
                          <span style={{ color: '#999', fontSize: 12 }}>输出：</span>
                          {phase.deliverables.map((item, idx) => (
                            <Tag key={idx} color="blue" style={{ marginLeft: 4 }}>
                              {item}
                            </Tag>
                          ))}
                        </div>
                      </Space>
                    </Col>
                    <Col span={6}>
                      <Progress 
                        percent={phase.progress} 
                        strokeColor={phase.color}
                        size="small"
                      />
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        负责人：{phase.responsible}
                      </div>
                    </Col>
                    <Col span={6}>
                      <Space direction="vertical" size="small">
                        <Tag color={
                          phase.status === 'completed' ? 'success' :
                          phase.status === 'in_progress' ? 'processing' : 'default'
                        }>
                          {phase.status === 'completed' ? '已完成' :
                           phase.status === 'in_progress' ? '进行中' : '未开始'}
                        </Tag>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {phase.startDate} ~ {phase.endDate}
                        </div>
                      </Space>
                    </Col>
                  </Row>
                </Card>
                {index < epcPhases.length - 1 && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '8px 0',
                    color: '#1890ff',
                    fontSize: 20
                  }}>
                    ↓
                  </div>
                )}
              </div>
            ))}
          </Space>
        </Card>

        {/* 阶段进度卡片 */}
        <Row gutter={[16, 16]}>
          {epcPhases.map(phase => (
            <Col span={8} key={phase.key}>
              <Card
                title={
                  <Space>
                    <span>{phase.name}</span>
                    <Tag color={
                      phase.status === 'completed' ? 'success' :
                      phase.status === 'in_progress' ? 'processing' : 'default'
                    }>
                      {phase.status === 'completed' ? '已完成' :
                       phase.status === 'in_progress' ? '进行中' : '未开始'}
                    </Tag>
                  </Space>
                }
                extra={
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => handleEditPhase(phase)}
                  />
                }
                size="small"
              >
                <Progress 
                  percent={phase.progress} 
                  strokeColor={phase.color}
                  status={phase.status === 'completed' ? 'success' : 'active'}
                />
                <Descriptions column={1} size="small" style={{ marginTop: 12 }}>
                  <Descriptions.Item label="负责人">{phase.responsible}</Descriptions.Item>
                  <Descriptions.Item label="权重">{(phase.weight * 100).toFixed(0)}%</Descriptions.Item>
                  <Descriptions.Item label="时间">
                    {phase.startDate} ~ {phase.endDate}
                  </Descriptions.Item>
                </Descriptions>
                <Button 
                  type="link" 
                  size="small" 
                  icon={<SyncOutlined />}
                  onClick={() => syncToGantt(phase)}
                >
                  同步到甘特图
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </Space>
    );
  };

  // 🚀 15步骤详细流程
  const renderDetailedFlow = () => {
    const detailedSteps = [
      { 
        phase: 'initiation', 
        step: 1, 
        name: '项目立项', 
        status: 'finish',
        description: '完成项目章程编制、组建项目团队',
        deliverables: ['项目章程', '团队名单'],
        duration: '5天',
        progress: 100
      },
      { 
        phase: 'initiation', 
        step: 2, 
        name: '可行性研究', 
        status: 'finish',
        description: '技术可行性、经济可行性、环境影响评估',
        deliverables: ['可行性报告', '立项批复'],
        duration: '10天',
        progress: 100
      },
      { 
        phase: 'design', 
        step: 3, 
        name: '初步设计', 
        status: 'finish',
        description: '工艺流程设计、设备选型、平面布置',
        deliverables: ['初步设计文件', '设备清单'],
        duration: '20天',
        progress: 100
      },
      { 
        phase: 'design', 
        step: 4, 
        name: '详细设计', 
        status: 'process',
        description: '详细工艺设计、管道仪表流程图(P&ID)',
        deliverables: ['详细设计文件', 'P&ID图纸'],
        duration: '30天',
        progress: 85
      },
      { 
        phase: 'design', 
        step: 5, 
        name: '施工图设计', 
        status: 'process',
        description: '施工图纸绘制、材料表编制',
        deliverables: ['施工图纸', '材料清单'],
        duration: '25天',
        progress: 60
      },
      { 
        phase: 'procurement', 
        step: 6, 
        name: '设备招标', 
        status: 'process',
        description: '编制招标文件、发布公告、评标',
        deliverables: ['招标文件', '中标通知'],
        duration: '30天',
        progress: 80
      },
      { 
        phase: 'procurement', 
        step: 7, 
        name: '设备采购', 
        status: 'process',
        description: '签订采购合同、跟踪生产进度',
        deliverables: ['采购合同', '生产进度表'],
        duration: '60天',
        progress: 50
      },
      { 
        phase: 'procurement', 
        step: 8, 
        name: '设备到货验收', 
        status: 'wait',
        description: '设备运输、到货检验、入库管理',
        deliverables: ['验收报告', '入库单'],
        duration: '15天',
        progress: 20
      },
      { 
        phase: 'construction', 
        step: 9, 
        name: '土建施工', 
        status: 'process',
        description: '基础施工、厂房建设、道路硬化',
        deliverables: ['土建验收报告', '隐蔽工程记录'],
        duration: '90天',
        progress: 65
      },
      { 
        phase: 'construction', 
        step: 10, 
        name: '设备安装', 
        status: 'process',
        description: '设备基础、设备就位、找正找平',
        deliverables: ['安装记录', '质量检验报告'],
        duration: '60天',
        progress: 40
      },
      { 
        phase: 'construction', 
        step: 11, 
        name: '管线施工', 
        status: 'wait',
        description: '工艺管道、电气线路、仪表安装',
        deliverables: ['管线竣工图', '电气接线图'],
        duration: '45天',
        progress: 15
      },
      { 
        phase: 'commissioning', 
        step: 12, 
        name: '单机调试', 
        status: 'wait',
        description: '设备单机试运行、参数调整',
        deliverables: ['单机调试报告', '参数记录'],
        duration: '20天',
        progress: 10
      },
      { 
        phase: 'commissioning', 
        step: 13, 
        name: '联动调试', 
        status: 'wait',
        description: '系统联动运行、工艺优化',
        deliverables: ['联动调试报告', '工艺参数表'],
        duration: '25天',
        progress: 5
      },
      { 
        phase: 'acceptance', 
        step: 14, 
        name: '竣工验收', 
        status: 'wait',
        description: '72小时试运行、性能测试、资料整理',
        deliverables: ['竣工报告', '验收证书'],
        duration: '10天',
        progress: 0
      },
      { 
        phase: 'acceptance', 
        step: 15, 
        name: '项目移交', 
        status: 'wait',
        description: '技术资料移交、人员培训、质保期',
        deliverables: ['移交清单', '培训记录'],
        duration: '5天',
        progress: 0
      }
    ];

    const timelineItems = detailedSteps.map(step => ({
      key: step.step,
      color: step.status === 'finish' ? 'green' : step.status === 'process' ? 'blue' : 'gray',
      label: `步骤 ${step.step}`,
      children: (
        <Card 
          size="small" 
          style={{ marginBottom: 8 }}
          styles={{ body: { padding: 12 } }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{step.name}</span>
                <Tag color={
                  step.status === 'finish' ? 'success' :
                  step.status === 'process' ? 'processing' : 'default'
                }>
                  {step.status === 'finish' ? '已完成' :
                   step.status === 'process' ? '进行中' : '未开始'}
                </Tag>
              </Space>
              <Tag color="blue">{step.duration}</Tag>
            </Space>
            
            <div style={{ color: '#666', fontSize: 13 }}>
              {step.description}
            </div>
            
            <Progress 
              percent={step.progress} 
              size="small"
              strokeColor={step.status === 'finish' ? '#52c41a' : '#1890ff'}
              status={step.status === 'finish' ? 'success' : 'active'}
            />
            
            <Space size={[0, 4]} wrap>
              <span style={{ color: '#999', fontSize: 12 }}>交付物：</span>
              {step.deliverables.map((item, idx) => (
                <Tag key={idx} style={{ fontSize: 12 }}>{item}</Tag>
              ))}
            </Space>
          </Space>
        </Card>
      )
    }));

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic 
                title="总步骤数" 
                value={detailedSteps.length} 
                suffix="步"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="已完成" 
                value={detailedSteps.filter(s => s.status === 'finish').length} 
                suffix="步"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="进行中" 
                value={detailedSteps.filter(s => s.status === 'process').length} 
                suffix="步"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="平均进度" 
                value={(detailedSteps.reduce((sum, s) => sum + s.progress, 0) / detailedSteps.length).toFixed(1)} 
                suffix="%"
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
          </Row>
        </Card>

        <Card title="详细流程时间线">
          <Timeline mode="left" items={timelineItems} />
        </Card>
      </Space>
    );
  };

  // 📋 EPC阶段详情
  const renderPhaseDetail = () => {
    const columns = [
      {
        title: '阶段',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: any) => (
          <Space>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: record.color 
            }} />
            <span style={{ fontWeight: 500 }}>{text}</span>
          </Space>
        )
      },
      {
        title: '进度',
        dataIndex: 'progress',
        key: 'progress',
        render: (progress: number, record: any) => (
          <Progress 
            percent={progress} 
            strokeColor={record.color}
            size="small"
          />
        )
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={
            status === 'completed' ? 'success' :
            status === 'in_progress' ? 'processing' : 'default'
          }>
            {status === 'completed' ? '已完成' :
             status === 'in_progress' ? '进行中' : '未开始'}
          </Tag>
        )
      },
      {
        title: '负责人',
        dataIndex: 'responsible',
        key: 'responsible'
      },
      {
        title: '时间范围',
        key: 'timeRange',
        render: (_: any, record: any) => (
          <span>{record.startDate} ~ {record.endDate}</span>
        )
      },
      {
        title: '交付物',
        dataIndex: 'deliverables',
        key: 'deliverables',
        render: (deliverables: string[]) => (
          <Space size={[0, 4]} wrap>
            {deliverables.map((item, index) => (
              <Tag key={index}>{item}</Tag>
            ))}
          </Space>
        )
      },
      {
        title: '操作',
        key: 'action',
        render: (_: any, record: any) => (
          <Space>
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEditPhase(record)}
            >
              编辑
            </Button>
            <Button 
              type="link" 
              size="small" 
              icon={<SyncOutlined />}
              onClick={() => syncToGantt(record)}
            >
              同步
            </Button>
          </Space>
        )
      }
    ];

    return (
      <Card>
        <Table 
          dataSource={epcPhases} 
          columns={columns} 
          rowKey="key"
          pagination={false}
        />
      </Card>
    );
  };

  // 🛡️ 安全管理
  const renderSafety = () => {
    const safetyChecks = [
      { id: 1, date: '2025-11-01', type: '日常检查', inspector: '安全员张三', status: 'pass', issues: 0 },
      { id: 2, date: '2025-10-28', type: '专项检查', inspector: '安全主管李四', status: 'warning', issues: 2 },
      { id: 3, date: '2025-10-25', type: '日常检查', inspector: '安全员张三', status: 'pass', issues: 0 },
    ];

    const columns = [
      { title: '检查日期', dataIndex: 'date', key: 'date' },
      { title: '检查类型', dataIndex: 'type', key: 'type' },
      { title: '检查人', dataIndex: 'inspector', key: 'inspector' },
      { 
        title: '状态', 
        dataIndex: 'status', 
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'pass' ? 'success' : status === 'warning' ? 'warning' : 'error'}>
            {status === 'pass' ? '合格' : status === 'warning' ? '整改中' : '不合格'}
          </Tag>
        )
      },
      { 
        title: '问题数', 
        dataIndex: 'issues', 
        key: 'issues',
        render: (issues: number) => (
          <span style={{ color: issues > 0 ? '#ff4d4f' : '#52c41a' }}>
            {issues}
          </span>
        )
      },
      {
        title: '操作',
        key: 'action',
        render: () => (
          <Space>
            <Button type="link" size="small">查看</Button>
            <Button type="link" size="small">编辑</Button>
          </Space>
        )
      }
    ];

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="本月检查次数" 
                value={12} 
                suffix="次"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="发现隐患" 
                value={5} 
                suffix="项"
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="已整改" 
                value={4} 
                suffix="项"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="整改率" 
                value={80} 
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Card 
          title="安全检查记录"
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              新增检查
            </Button>
          }
        >
          <Table 
            dataSource={safetyChecks} 
            columns={columns} 
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Space>
    );
  };

  // ✅ 质量管理
  const renderQuality = () => {
    const qualityInspections = [
      { id: 1, date: '2025-11-01', phase: '土建施工', item: '混凝土强度', result: '合格', inspector: '质检员王五' },
      { id: 2, date: '2025-10-30', phase: '设备安装', item: '设备找正', result: '合格', inspector: '质检员赵六' },
      { id: 3, date: '2025-10-28', phase: '管线施工', item: '焊缝质量', result: '整改', inspector: '质检员王五' },
    ];

    const columns = [
      { title: '检验日期', dataIndex: 'date', key: 'date' },
      { title: '施工阶段', dataIndex: 'phase', key: 'phase' },
      { title: '检验项目', dataIndex: 'item', key: 'item' },
      { 
        title: '检验结果', 
        dataIndex: 'result', 
        key: 'result',
        render: (result: string) => (
          <Tag color={result === '合格' ? 'success' : result === '整改' ? 'warning' : 'error'}>
            {result}
          </Tag>
        )
      },
      { title: '检验人', dataIndex: 'inspector', key: 'inspector' },
      {
        title: '操作',
        key: 'action',
        render: () => (
          <Space>
            <Button type="link" size="small">查看</Button>
            <Button type="link" size="small">编辑</Button>
          </Space>
        )
      }
    ];

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="本月检验次数" 
                value={18} 
                suffix="次"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="合格项" 
                value={16} 
                suffix="项"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="整改项" 
                value={2} 
                suffix="项"
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="合格率" 
                value={88.9} 
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Card 
          title="质量检验记录"
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              新增检验
            </Button>
          }
        >
          <Table 
            dataSource={qualityInspections} 
            columns={columns} 
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Space>
    );
  };

  const tabItems = [
    {
      key: 'overview',
      label: <span><DashboardOutlined /> 项目总览</span>,
      children: renderOverview()
    },
    {
      key: 'detailed-flow',
      label: <span><RocketOutlined /> 15步骤详细流程</span>,
      children: renderDetailedFlow()
    },
    {
      key: 'phases',
      label: <span><FileTextOutlined /> EPC阶段详情</span>,
      children: renderPhaseDetail()
    },
    {
      key: 'safety',
      label: <span><SafetyOutlined /> 安全管理</span>,
      children: renderSafety()
    },
    {
      key: 'quality',
      label: <span><CheckCircleOutlined /> 质量管理</span>,
      children: renderQuality()
    }
  ];

  if (!currentProject) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="请先选择一个项目"
          >
            <Button type="primary">返回工作台</Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={
          <Space>
            <span>总包施工管理</span>
            <Tag color="blue">{currentProject.name}</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<SyncOutlined />}>
              全部同步到甘特图
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              新建任务
            </Button>
          </Space>
        }
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>

      {/* 阶段编辑Modal */}
      <Modal
        title={`编辑阶段 - ${editingPhase?.name}`}
        open={isPhaseModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsPhaseModalVisible(false)}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form 
          form={form} 
          onFinish={handleSavePhase}
          layout="vertical"
        >
          <Form.Item 
            label="阶段名称" 
            name="name"
            rules={[{ required: true, message: '请输入阶段名称' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            label="负责人" 
            name="responsible"
            rules={[{ required: true, message: '请输入负责人' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            label="进度" 
            name="progress"
            rules={[{ required: true, message: '请设置进度' }]}
          >
            <Slider 
              min={0} 
              max={100} 
              marks={{ 0: '0%', 50: '50%', 100: '100%' }} 
            />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="开始日期" 
                name="startDate"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="结束日期" 
                name="endDate"
                rules={[{ required: true, message: '请选择结束日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item 
            label="状态" 
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="pending">未开始</Select.Option>
              <Select.Option value="in_progress">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConstructionManagement;
