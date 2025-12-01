/**
 * 质量管理PDCA循环系统
 * Plan-Do-Check-Action 质量持续改进
 * 对标 ISO 9001 质量管理体系
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Modal,
  Space,
  Badge,
  Timeline,
  Progress,
  Statistic,
  Row,
  Col,
  Alert,
  Tag,
  Divider,
  message,
  Upload,
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  BarChartOutlined,
  SafetyOutlined,
  AuditOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { StorageManager } from '../../utils/StorageManager';
import { logger } from '../../utils/logger';
import dayjs from 'dayjs';
import './QualityPDCA.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// ==================== 类型定义 ====================

interface QualityStandard {
  id: string;
  name: string;
  category: string;
  requirements: string[];
  references: string[];
  createdAt: string;
}

interface QualityProcedure {
  id: string;
  title: string;
  department: string;
  version: string;
  effectiveDate: string;
  content: string;
  attachments: any[];
}

interface QualityCheckpoint {
  id: string;
  name: string;
  stage: string;
  criteria: string;
  frequency: string;
  responsible: string;
}

interface QualityInspection {
  id: string;
  date: string;
  type: string;
  inspector: string;
  items: Array<{
    name: string;
    standard: string;
    actual: string;
    result: 'pass' | 'fail';
  }>;
  overallResult: 'pass' | 'fail';
  issues: string[];
}

interface QualityAudit {
  id: string;
  auditDate: string;
  auditor: string;
  auditType: 'internal' | 'external';
  findings: Array<{
    type: 'major' | 'minor' | 'observation';
    description: string;
    requirement: string;
  }>;
  score: number;
}

interface NCR {
  id: string;
  reportDate: string;
  reportedBy: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  rootCause: string;
  status: 'open' | 'investigating' | 'resolved';
}

interface CorrectiveAction {
  id: string;
  ncrId: string;
  action: string;
  responsible: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  effectiveness: string;
}

interface PreventiveAction {
  id: string;
  riskArea: string;
  action: string;
  responsible: string;
  implementationDate: string;
  expectedOutcome: string;
  actualOutcome?: string;
}

// ==================== 主组件 ====================

const QualityPDCA: React.FC = () => {
  const [activePhase, setActivePhase] = useState<'plan' | 'do' | 'check' | 'action'>('plan');
  const [standards, setStandards] = useState<QualityStandard[]>([]);
  const [procedures, setProcedures] = useState<QualityProcedure[]>([]);
  const [checkpoints, setCheckpoints] = useState<QualityCheckpoint[]>([]);
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [audits, setAudits] = useState<QualityAudit[]>([]);
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);
  const [preventiveActions, setPreventiveActions] = useState<PreventiveAction[]>([]);
  
  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const [form] = Form.useForm();

  // 加载数据
  useEffect(() => {
    loadPDCAData();
  }, []);

  const loadPDCAData = () => {
    // 从缓存加载数据
    const cachedStandards = StorageManager.load<QualityStandard[]>('quality_standards');
    if (cachedStandards) setStandards(cachedStandards);
    
    const cachedProcedures = StorageManager.load<QualityProcedure[]>('quality_procedures');
    if (cachedProcedures) setProcedures(cachedProcedures);
    
    const cachedInspections = StorageManager.load<QualityInspection[]>('quality_inspections');
    if (cachedInspections) setInspections(cachedInspections);
    
    const cachedNcrs = StorageManager.load<NCR[]>('quality_ncrs');
    if (cachedNcrs) setNcrs(cachedNcrs);
  };

  // ==================== PLAN 阶段 ====================

  const renderPlanPhase = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="质量标准"
              value={standards.length}
              prefix={<FileTextOutlined />}
              suffix="项"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="作业程序"
              value={procedures.length}
              prefix={<SolutionOutlined />}
              suffix="份"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="检查点"
              value={checkpoints.length}
              prefix={<SafetyOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="standards">
        <TabPane tab="质量标准" key="standards">
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible('standard')}
            >
              新增标准
            </Button>
            <Button icon={<UploadOutlined />}>导入ISO标准</Button>
          </Space>
          
          <Table
            dataSource={standards}
            rowKey="id"
            columns={[
              {
                title: '标准名称',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: '类别',
                dataIndex: 'category',
                key: 'category',
                render: (cat) => <Tag color="blue">{cat}</Tag>,
              },
              {
                title: '要求项',
                dataIndex: 'requirements',
                key: 'requirements',
                render: (reqs) => `${reqs.length} 项`,
              },
              {
                title: '创建时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
              },
              {
                title: '操作',
                key: 'action',
                render: (_, record) => (
                  <Space>
                    <Button type="link" size="small">查看</Button>
                    <Button type="link" size="small">编辑</Button>
                  </Space>
                ),
              },
            ]}
          />
        </TabPane>
        
        <TabPane tab="作业程序" key="procedures">
          <Table
            dataSource={procedures}
            rowKey="id"
            columns={[
              {
                title: '程序名称',
                dataIndex: 'title',
                key: 'title',
              },
              {
                title: '部门',
                dataIndex: 'department',
                key: 'department',
              },
              {
                title: '版本',
                dataIndex: 'version',
                key: 'version',
                render: (v) => <Tag>{v}</Tag>,
              },
              {
                title: '生效日期',
                dataIndex: 'effectiveDate',
                key: 'effectiveDate',
              },
            ]}
          />
        </TabPane>
        
        <TabPane tab="检查点设置" key="checkpoints">
          <Table
            dataSource={checkpoints}
            rowKey="id"
            columns={[
              {
                title: '检查点',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: '阶段',
                dataIndex: 'stage',
                key: 'stage',
              },
              {
                title: '标准',
                dataIndex: 'criteria',
                key: 'criteria',
              },
              {
                title: '频率',
                dataIndex: 'frequency',
                key: 'frequency',
                render: (f) => <Tag color="green">{f}</Tag>,
              },
              {
                title: '负责人',
                dataIndex: 'responsible',
                key: 'responsible',
              },
            ]}
          />
        </TabPane>
      </Tabs>
    </div>
  );

  // ==================== DO 阶段 ====================

  const renderDoPhase = () => {
    const executionRate = 
      checkpoints.length > 0 
        ? (inspections.length / checkpoints.length) * 100 
        : 0;
    
    return (
      <div>
        <Alert
          message="执行提醒"
          description="请严格按照制定的质量标准和程序执行，确保所有检查点都得到落实。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Card title="执行进度" style={{ marginBottom: 16 }}>
          <Progress
            percent={Math.round(executionRate)}
            status={executionRate >= 80 ? 'success' : 'active'}
          />
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={6}>
              <Statistic title="计划检查点" value={checkpoints.length} />
            </Col>
            <Col span={6}>
              <Statistic title="已执行" value={inspections.length} />
            </Col>
            <Col span={6}>
              <Statistic 
                title="合格率" 
                value={
                  inspections.filter(i => i.overallResult === 'pass').length /
                  Math.max(inspections.length, 1) * 100
                }
                precision={1}
                suffix="%"
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="待整改" 
                value={inspections.filter(i => i.overallResult === 'fail').length}
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
          </Row>
        </Card>
        
        <Card title="执行记录">
          <Timeline>
            {inspections.slice(0, 5).map(inspection => (
              <Timeline.Item
                key={inspection.id}
                color={inspection.overallResult === 'pass' ? 'green' : 'red'}
                dot={
                  inspection.overallResult === 'pass'
                    ? <CheckCircleOutlined />
                    : <CloseCircleOutlined />
                }
              >
                <p>
                  <strong>{inspection.date}</strong> - {inspection.type}检查
                </p>
                <p>检查员：{inspection.inspector}</p>
                <p>
                  结果：
                  <Tag color={inspection.overallResult === 'pass' ? 'success' : 'error'}>
                    {inspection.overallResult === 'pass' ? '合格' : '不合格'}
                  </Tag>
                  {inspection.issues.length > 0 && (
                    <span style={{ marginLeft: 8 }}>
                      发现 {inspection.issues.length} 个问题
                    </span>
                  )}
                </p>
              </Timeline.Item>
            ))}
          </Timeline>
          
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible('inspection')}
            style={{ marginTop: 16 }}
          >
            记录新检查
          </Button>
        </Card>
      </div>
    );
  };

  // ==================== CHECK 阶段 ====================

  const renderCheckPhase = () => {
    const passRate = 
      inspections.length > 0
        ? (inspections.filter(i => i.overallResult === 'pass').length / 
           inspections.length) * 100
        : 0;
    
    const majorFindings = 
      audits.flatMap(a => a.findings.filter(f => f.type === 'major')).length;
    
    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="检验合格率"
                value={passRate}
                precision={1}
                suffix="%"
                valueStyle={{ 
                  color: passRate >= 95 ? '#3f8600' : passRate >= 80 ? '#faad14' : '#cf1322' 
                }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="审计得分"
                value={audits.length > 0 ? audits[audits.length - 1].score : 0}
                suffix="/ 100"
                prefix={<AuditOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="不合格报告"
                value={ncrs.filter(n => n.status === 'open').length}
                suffix={`/ ${ncrs.length}`}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="inspection">
          <TabPane tab="检验记录" key="inspection">
            <Table
              dataSource={inspections}
              rowKey="id"
              columns={[
                {
                  title: '检查日期',
                  dataIndex: 'date',
                  key: 'date',
                },
                {
                  title: '类型',
                  dataIndex: 'type',
                  key: 'type',
                },
                {
                  title: '检查员',
                  dataIndex: 'inspector',
                  key: 'inspector',
                },
                {
                  title: '结果',
                  dataIndex: 'overallResult',
                  key: 'overallResult',
                  render: (result) => (
                    <Tag color={result === 'pass' ? 'success' : 'error'}>
                      {result === 'pass' ? '合格' : '不合格'}
                    </Tag>
                  ),
                },
                {
                  title: '发现问题',
                  dataIndex: 'issues',
                  key: 'issues',
                  render: (issues) => issues.length || '-',
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <Space>
                      <Button type="link" size="small">详情</Button>
                      {record.overallResult === 'fail' && (
                        <Button type="link" size="small" danger>
                          创建NCR
                        </Button>
                      )}
                    </Space>
                  ),
                },
              ]}
            />
          </TabPane>
          
          <TabPane tab={`审计记录 ${majorFindings > 0 ? `(${majorFindings})` : ''}`} key="audit">
            <Table
              dataSource={audits}
              rowKey="id"
              columns={[
                {
                  title: '审计日期',
                  dataIndex: 'auditDate',
                  key: 'auditDate',
                },
                {
                  title: '审计员',
                  dataIndex: 'auditor',
                  key: 'auditor',
                },
                {
                  title: '类型',
                  dataIndex: 'auditType',
                  key: 'auditType',
                  render: (type) => (
                    <Tag color={type === 'internal' ? 'blue' : 'gold'}>
                      {type === 'internal' ? '内部审计' : '外部审计'}
                    </Tag>
                  ),
                },
                {
                  title: '发现项',
                  key: 'findings',
                  render: (_, record) => (
                    <Space>
                      <Badge 
                        count={record.findings.filter(f => f.type === 'major').length} 
                        style={{ backgroundColor: '#ff4d4f' }} 
                      />
                      <Badge 
                        count={record.findings.filter(f => f.type === 'minor').length} 
                        style={{ backgroundColor: '#faad14' }} 
                      />
                      <Badge 
                        count={record.findings.filter(f => f.type === 'observation').length} 
                        style={{ backgroundColor: '#52c41a' }} 
                      />
                    </Space>
                  ),
                },
                {
                  title: '得分',
                  dataIndex: 'score',
                  key: 'score',
                  render: (score) => (
                    <Progress
                      percent={score}
                      size="small"
                      status={score >= 90 ? 'success' : score >= 70 ? 'normal' : 'exception'}
                    />
                  ),
                },
              ]}
            />
          </TabPane>
          
          <TabPane tab={`NCR ${ncrs.filter(n => n.status === 'open').length > 0 ? `(${ncrs.filter(n => n.status === 'open').length})` : ''}`} key="ncr">
            <Table
              dataSource={ncrs}
              rowKey="id"
              columns={[
                {
                  title: 'NCR编号',
                  dataIndex: 'id',
                  key: 'id',
                },
                {
                  title: '报告日期',
                  dataIndex: 'reportDate',
                  key: 'reportDate',
                },
                {
                  title: '描述',
                  dataIndex: 'description',
                  key: 'description',
                  ellipsis: true,
                },
                {
                  title: '严重程度',
                  dataIndex: 'severity',
                  key: 'severity',
                  render: (severity) => (
                    <Tag 
                      color={
                        severity === 'critical' ? 'red' :
                        severity === 'major' ? 'orange' : 'yellow'
                      }
                    >
                      {severity === 'critical' ? '严重' :
                       severity === 'major' ? '主要' : '次要'}
                    </Tag>
                  ),
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Badge
                      status={
                        status === 'resolved' ? 'success' :
                        status === 'investigating' ? 'processing' : 'error'
                      }
                      text={
                        status === 'resolved' ? '已解决' :
                        status === 'investigating' ? '调查中' : '待处理'
                      }
                    />
                  ),
                },
              ]}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  };

  // ==================== ACTION 阶段 ====================

  const renderActionPhase = () => {
    const completedCorrectiveActions = 
      correctiveActions.filter(a => a.status === 'completed').length;
    
    const effectivePreventiveActions =
      preventiveActions.filter(a => a.actualOutcome).length;
    
    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="纠正措施完成率"
                value={
                  correctiveActions.length > 0
                    ? (completedCorrectiveActions / correctiveActions.length) * 100
                    : 0
                }
                precision={1}
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="预防措施"
                value={preventiveActions.length}
                prefix={<SafetyOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="改进效果评估"
                value={effectivePreventiveActions}
                suffix={`/ ${preventiveActions.length}`}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="corrective">
          <TabPane tab="纠正措施" key="corrective">
            <Table
              dataSource={correctiveActions}
              rowKey="id"
              columns={[
                {
                  title: 'NCR编号',
                  dataIndex: 'ncrId',
                  key: 'ncrId',
                },
                {
                  title: '措施内容',
                  dataIndex: 'action',
                  key: 'action',
                },
                {
                  title: '负责人',
                  dataIndex: 'responsible',
                  key: 'responsible',
                },
                {
                  title: '截止日期',
                  dataIndex: 'dueDate',
                  key: 'dueDate',
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag
                      color={
                        status === 'completed' ? 'success' :
                        status === 'in_progress' ? 'processing' : 'default'
                      }
                    >
                      {status === 'completed' ? '已完成' :
                       status === 'in_progress' ? '进行中' : '待处理'}
                    </Tag>
                  ),
                },
                {
                  title: '有效性',
                  dataIndex: 'effectiveness',
                  key: 'effectiveness',
                },
              ]}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible('corrective')}
              style={{ marginTop: 16 }}
            >
              新增纠正措施
            </Button>
          </TabPane>
          
          <TabPane tab="预防措施" key="preventive">
            <Table
              dataSource={preventiveActions}
              rowKey="id"
              columns={[
                {
                  title: '风险区域',
                  dataIndex: 'riskArea',
                  key: 'riskArea',
                },
                {
                  title: '预防措施',
                  dataIndex: 'action',
                  key: 'action',
                },
                {
                  title: '负责人',
                  dataIndex: 'responsible',
                  key: 'responsible',
                },
                {
                  title: '实施日期',
                  dataIndex: 'implementationDate',
                  key: 'implementationDate',
                },
                {
                  title: '预期成果',
                  dataIndex: 'expectedOutcome',
                  key: 'expectedOutcome',
                },
                {
                  title: '实际效果',
                  dataIndex: 'actualOutcome',
                  key: 'actualOutcome',
                  render: (outcome) => outcome || <Tag>待评估</Tag>,
                },
              ]}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible('preventive')}
              style={{ marginTop: 16 }}
            >
              新增预防措施
            </Button>
          </TabPane>
        </Tabs>
      </div>
    );
  };

  // ==================== 渲染主界面 ====================

  return (
    <div className="quality-pdca">
      <Card>
        <div style={{ marginBottom: 24 }}>
          <h2>质量管理PDCA循环</h2>
          <p style={{ color: '#666' }}>
            遵循ISO 9001质量管理体系标准，通过Plan-Do-Check-Action循环持续改进质量
          </p>
        </div>
        
        <Tabs
          activeKey={activePhase}
          onChange={(key) => setActivePhase(key as any)}
          size="large"
          tabBarExtraContent={
            <Space>
              <Button icon={<BarChartOutlined />}>质量报表</Button>
              <Button icon={<FilePdfOutlined />}>导出报告</Button>
            </Space>
          }
        >
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                PLAN 计划
              </span>
            }
            key="plan"
          >
            {renderPlanPhase()}
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <SolutionOutlined />
                DO 执行
              </span>
            }
            key="do"
          >
            {renderDoPhase()}
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <AuditOutlined />
                CHECK 检查
              </span>
            }
            key="check"
          >
            {renderCheckPhase()}
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <SafetyOutlined />
                ACTION 处理
              </span>
            }
            key="action"
          >
            {renderActionPhase()}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default QualityPDCA;
