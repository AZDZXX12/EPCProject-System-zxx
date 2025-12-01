/**
 * 供应商评估系统
 * 
 * 功能：
 * - 多维度评估（质量、价格、交期、服务）
 * - 评分算法
 * - 历史记录
 * - 对比分析
 * - 黑名单管理
 */

import React, { useState, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  Rate,
  Slider,
  Button,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Space,
  Tabs,
  Progress,
  Alert,
  Tooltip,
  Typography,
  Divider,
} from 'antd';
import {
  StarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  TrophyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
// import { Column } from '@ant-design/plots';
import './SupplierEvaluation.css';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface EvaluationCriteria {
  quality: number; // 质量评分 0-100
  price: number; // 价格评分 0-100
  delivery: number; // 交期评分 0-100
  service: number; // 服务评分 0-100
  marketIndex?: number; // 市场指数 0-100 (新增)
  tradingVolume?: number; // 交易量评分 0-100 (新增)
}

interface SupplierEvaluation {
  id: string;
  supplierId: string;
  supplierName: string;
  evaluationDate: string;
  evaluator: string;
  criteria: EvaluationCriteria;
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  comments: string;
  orderCount: number;
  onTimeRate: number;
  qualityRate: number;
  isBlacklisted: boolean;
}

interface SupplierEvaluationProps {
  visible: boolean;
  supplierId?: string;
  supplierName?: string;
  onClose: () => void;
  onSubmit?: (evaluation: SupplierEvaluation) => void;
}

// 评分权重配置（可动态调整）
const DEFAULT_WEIGHTS = {
  quality: 0.30, // 质量权重 30%
  price: 0.20, // 价格权重 20%
  delivery: 0.20, // 交期权重 20%
  service: 0.15, // 服务权重 15%
  marketIndex: 0.10, // 市场指数权重 10% (新增)
  tradingVolume: 0.05, // 交易量权重 5% (新增)
};

const SupplierEvaluationComponent: React.FC<SupplierEvaluationProps> = ({
  visible,
  supplierId,
  supplierName,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('evaluate');
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [evaluations, setEvaluations] = useState<SupplierEvaluation[]>([
    {
      id: 'eval-001',
      supplierId: 'SUP-001',
      supplierName: '上海水泵厂',
      evaluationDate: '2025-01-15',
      evaluator: '张工',
      criteria: { quality: 92, price: 85, delivery: 88, service: 90 },
      totalScore: 89.25,
      grade: 'A',
      comments: '产品质量优秀，交期准时，服务态度好',
      orderCount: 15,
      onTimeRate: 93,
      qualityRate: 95,
      isBlacklisted: false,
    },
    {
      id: 'eval-002',
      supplierId: 'SUP-002',
      supplierName: '无锡换热设备公司',
      evaluationDate: '2025-01-10',
      evaluator: '李经理',
      criteria: { quality: 88, price: 90, delivery: 85, service: 87 },
      totalScore: 87.65,
      grade: 'A',
      comments: '价格有竞争力，质量稳定',
      orderCount: 12,
      onTimeRate: 88,
      qualityRate: 92,
      isBlacklisted: false,
    },
    {
      id: 'eval-003',
      supplierId: 'SUP-003',
      supplierName: '广州化工设备厂',
      evaluationDate: '2024-12-20',
      evaluator: '王总',
      criteria: { quality: 75, price: 88, delivery: 70, service: 72 },
      totalScore: 76.25,
      grade: 'C',
      comments: '交期经常延误，需要改进',
      orderCount: 8,
      onTimeRate: 72,
      qualityRate: 80,
      isBlacklisted: false,
    },
  ]);

  // 计算总分（支持市场指标）
  const calculateTotalScore = (criteria: EvaluationCriteria): number => {
    return (
      criteria.quality * weights.quality +
      criteria.price * weights.price +
      criteria.delivery * weights.delivery +
      criteria.service * weights.service +
      (criteria.marketIndex || 0) * weights.marketIndex +
      (criteria.tradingVolume || 0) * weights.tradingVolume
    );
  };

  // 计算等级
  const calculateGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  // 提交评估
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const criteria: EvaluationCriteria = {
        quality: values.quality,
        price: values.price,
        delivery: values.delivery,
        service: values.service,
      };

      const totalScore = calculateTotalScore(criteria);
      const grade = calculateGrade(totalScore);

      const newEvaluation: SupplierEvaluation = {
        id: `eval-${Date.now()}`,
        supplierId: supplierId || 'SUP-NEW',
        supplierName: supplierName || values.supplierName,
        evaluationDate: new Date().toISOString().split('T')[0],
        evaluator: sessionStorage.getItem('username') || '当前用户',
        criteria,
        totalScore,
        grade,
        comments: values.comments,
        orderCount: 0,
        onTimeRate: 0,
        qualityRate: 0,
        isBlacklisted: false,
      };

      setEvaluations([newEvaluation, ...evaluations]);
      onSubmit?.(newEvaluation);
      form.resetFields();
      onClose();
    });
  };

  // 统计数据
  const statistics = useMemo(() => {
    const total = evaluations.length;
    const avgScore =
      evaluations.reduce((sum, e) => sum + e.totalScore, 0) / total || 0;
    const gradeA = evaluations.filter((e) => e.grade === 'A').length;
    const blacklisted = evaluations.filter((e) => e.isBlacklisted).length;

    return {
      total,
      avgScore: avgScore.toFixed(2),
      gradeA,
      gradeARate: ((gradeA / total) * 100).toFixed(1),
      blacklisted,
    };
  }, [evaluations]);

  // 评分分布数据
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { range: '90-100', count: 0, label: 'A级' },
      { range: '80-89', count: 0, label: 'B级' },
      { range: '70-79', count: 0, label: 'C级' },
      { range: '60-69', count: 0, label: 'D级' },
      { range: '0-59', count: 0, label: 'F级' },
    ];

    evaluations.forEach((e) => {
      const score = e.totalScore;
      if (score >= 90) ranges[0].count++;
      else if (score >= 80) ranges[1].count++;
      else if (score >= 70) ranges[2].count++;
      else if (score >= 60) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  }, [evaluations]);

  // 表格列
  const columns = [
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 150,
      render: (text: string, record: SupplierEvaluation) => (
        <Space>
          <Text strong>{text}</Text>
          {record.isBlacklisted && (
            <Tag color="red" icon={<WarningOutlined />}>
              黑名单
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 100,
      sorter: (a: SupplierEvaluation, b: SupplierEvaluation) =>
        a.totalScore - b.totalScore,
      render: (score: number) => (
        <Text strong style={{ fontSize: 16, color: getScoreColor(score) }}>
          {score.toFixed(1)}
        </Text>
      ),
    },
    {
      title: '等级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80,
      render: (grade: string) => (
        <Tag color={getGradeColor(grade)} style={{ fontSize: 14, fontWeight: 'bold' }}>
          {grade}
        </Tag>
      ),
    },
    {
      title: '质量',
      dataIndex: ['criteria', 'quality'],
      key: 'quality',
      width: 100,
      render: (score: number) => <Progress percent={score} size="small" />,
    },
    {
      title: '价格',
      dataIndex: ['criteria', 'price'],
      key: 'price',
      width: 100,
      render: (score: number) => <Progress percent={score} size="small" />,
    },
    {
      title: '交期',
      dataIndex: ['criteria', 'delivery'],
      key: 'delivery',
      width: 100,
      render: (score: number) => <Progress percent={score} size="small" />,
    },
    {
      title: '服务',
      dataIndex: ['criteria', 'service'],
      key: 'service',
      width: 100,
      render: (score: number) => <Progress percent={score} size="small" />,
    },
    {
      title: '评估日期',
      dataIndex: 'evaluationDate',
      key: 'evaluationDate',
      width: 120,
    },
    {
      title: '评估人',
      dataIndex: 'evaluator',
      key: 'evaluator',
      width: 100,
    },
  ];

  return (
    <Modal
      title="供应商评估系统"
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      className="supplier-evaluation-modal"
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="评估表单" key="evaluate">
          <Form form={form} layout="vertical">
            {!supplierId && (
              <Form.Item
                label="供应商名称"
                name="supplierName"
                rules={[{ required: true, message: '请输入供应商名称' }]}
              >
                <Input placeholder="请输入供应商名称" />
              </Form.Item>
            )}

            <Alert
              message="评分说明"
              description={
                <div>
                  <p>请根据以下标准对供应商进行评分（0-100分）：</p>
                  <ul>
                    <li>
                      <strong>质量（35%）</strong>：产品质量、合格率、售后问题
                    </li>
                    <li>
                      <strong>价格（25%）</strong>：价格竞争力、付款条件、优惠政策
                    </li>
                    <li>
                      <strong>交期（25%）</strong>：准时交货率、应急响应、库存保障
                    </li>
                    <li>
                      <strong>服务（15%）</strong>：沟通效率、技术支持、售后服务
                    </li>
                  </ul>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span>
                      <StarOutlined /> 质量评分 (权重35%)
                    </span>
                  }
                  name="quality"
                  initialValue={80}
                  rules={[{ required: true }]}
                >
                  <Slider
                    min={0}
                    max={100}
                    marks={{ 0: '0', 50: '50', 100: '100' }}
                    tooltip={{ formatter: (value) => `${value}分` }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span>
                      <DollarOutlined /> 价格评分 (权重25%)
                    </span>
                  }
                  name="price"
                  initialValue={80}
                  rules={[{ required: true }]}
                >
                  <Slider
                    min={0}
                    max={100}
                    marks={{ 0: '0', 50: '50', 100: '100' }}
                    tooltip={{ formatter: (value) => `${value}分` }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span>
                      <ClockCircleOutlined /> 交期评分 (权重25%)
                    </span>
                  }
                  name="delivery"
                  initialValue={80}
                  rules={[{ required: true }]}
                >
                  <Slider
                    min={0}
                    max={100}
                    marks={{ 0: '0', 50: '50', 100: '100' }}
                    tooltip={{ formatter: (value) => `${value}分` }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span>
                      <CustomerServiceOutlined /> 服务评分 (权重15%)
                    </span>
                  }
                  name="service"
                  initialValue={80}
                  rules={[{ required: true }]}
                >
                  <Slider
                    min={0}
                    max={100}
                    marks={{ 0: '0', 50: '50', 100: '100' }}
                    tooltip={{ formatter: (value) => `${value}分` }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="评估意见" name="comments">
              <TextArea
                rows={4}
                placeholder="请输入对供应商的综合评价和建议..."
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleSubmit}>
                  提交评估
                </Button>
                <Button onClick={onClose}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane tab="评估记录" key="records">
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="评估总数"
                  value={statistics.total}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="平均分"
                  value={statistics.avgScore}
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<StarOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="A级供应商"
                  value={statistics.gradeA}
                  suffix={`/ ${statistics.total}`}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="黑名单"
                  value={statistics.blacklisted}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={evaluations}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="统计分析" key="statistics">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="评分等级分布">
                <div className="score-distribution">
                  {scoreDistribution.map((item) => {
                    const colors: Record<string, string> = {
                      'A级': '#52c41a',
                      'B级': '#1890ff',
                      'C级': '#faad14',
                      'D级': '#fa8c16',
                      'F级': '#f5222d',
                    };
                    const color = colors[item.label] || '#d9d9d9';
                    const maxCount = Math.max(...scoreDistribution.map(d => d.count));
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={item.label} className="score-distribution-item">
                        <div className="score-distribution-row">
                          <Text strong>{item.label}</Text>
                          <Text>{item.count}次</Text>
                        </div>
                        <Progress
                          percent={percentage}
                          strokeColor={color}
                          showInfo={false}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="评估指标对比">
                <div className="evaluation-chart-container">
                  {['quality', 'price', 'delivery', 'service'].map((key) => {
                    const avgScore =
                      evaluations.reduce(
                        (sum, e) => sum + (e.criteria[key as keyof EvaluationCriteria] || 0),
                        0
                      ) / evaluations.length || 0;
                    const labels: Record<string, string> = {
                      quality: '质量',
                      price: '价格',
                      delivery: '交期',
                      service: '服务',
                    };
                    return (
                      <div key={key} className="evaluation-indicator-item">
                        <Text>{labels[key]}</Text>
                        <Progress
                          percent={avgScore}
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

// 辅助函数
const getScoreColor = (score: number): string => {
  if (score >= 90) return '#52c41a';
  if (score >= 80) return '#1890ff';
  if (score >= 70) return '#faad14';
  if (score >= 60) return '#fa8c16';
  return '#f5222d';
};

const getGradeColor = (grade: string): string => {
  const colors: Record<string, string> = {
    A: 'green',
    B: 'blue',
    C: 'orange',
    D: 'volcano',
    F: 'red',
  };
  return colors[grade] || 'default';
};

export default SupplierEvaluationComponent;
