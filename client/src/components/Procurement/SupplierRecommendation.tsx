/**
 * 供应商智能推荐组件
 * 基于多维度评估提供Top3供应商推荐
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Badge,
  Tooltip,
  Space,
  Divider,
  Progress,
  Alert,
  Modal,
  Form,
  Select,
  InputNumber,
  Descriptions,
  List,
  Avatar,
  Statistic,
  message,
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  supplierRecommendationService,
  type RecommendationCriteria,
  type RecommendationResult,
  type Supplier,
} from '../../services/SupplierRecommendationService';
import './SupplierRecommendation.css';

interface SupplierRecommendationProps {
  materialCategory?: string;
  onSelectSupplier?: (supplier: Supplier) => void;
}

const SupplierRecommendation: React.FC<SupplierRecommendationProps> = ({
  materialCategory = '钢材',
  onSelectSupplier,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [criteriaModalVisible, setCriteriaModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  // 默认推荐条件
  const defaultCriteria: RecommendationCriteria = {
    materialCategory,
    urgency: 'medium',
    qualityRequirement: 'high',
  };

  useEffect(() => {
    loadRecommendations(defaultCriteria);
  }, [materialCategory]);

  // 加载推荐结果
  const loadRecommendations = (criteria: RecommendationCriteria) => {
    const results = supplierRecommendationService.recommend(criteria);
    setRecommendations(results.slice(0, 3)); // 只显示Top3
  };

  // 自定义推荐条件
  const handleCustomRecommend = async () => {
    try {
      const values = await form.validateFields();
      const criteria: RecommendationCriteria = {
        materialCategory: values.materialCategory || materialCategory,
        urgency: values.urgency,
        qualityRequirement: values.qualityRequirement,
        budgetRange: values.budgetMin && values.budgetMax 
          ? [values.budgetMin, values.budgetMax]
          : undefined,
      };
      loadRecommendations(criteria);
      setCriteriaModalVisible(false);
      message.success('推荐结果已更新');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 查看供应商详情
  const handleViewDetail = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDetailModalVisible(true);
  };

  // 选择供应商
  const handleSelectSupplier = (supplier: Supplier) => {
    onSelectSupplier?.(supplier);
    message.success(`已选择供应商：${supplier.name}`);
  };

  // 渲染推荐卡片
  const renderRecommendationCard = (result: RecommendationResult, index: number) => {
    const { supplier, score, matchReasons, warnings, estimatedDeliveryDays, recommendedReason } = result;
    
    const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    const rankIcons = ['🥇', '🥈', '🥉'];

    return (
      <Card
        key={supplier.id}
        className={`supplier-card rank-${index + 1}`}
        hoverable
      >
        {/* 排名标识 */}
        <div className="rank-badge">
          <span className="rank-icon">{rankIcons[index]}</span>
          <span className="rank-text">TOP {index + 1}</span>
        </div>

        {/* 供应商基本信息 */}
        <div className="supplier-header">
          <Avatar
            size={64}
            style={{ backgroundColor: rankColors[index] }}
          >
            {supplier.name.substring(0, 2)}
          </Avatar>
          <div className="supplier-info">
            <h3>{supplier.name}</h3>
            <Space>
              <Tag color="blue">{supplier.category.join('、')}</Tag>
              <Tag color="gold" icon={<SafetyCertificateOutlined />}>
                {supplier.creditRating}
              </Tag>
            </Space>
          </div>
        </div>

        <Divider />

        {/* 推荐分数 */}
        <div className="score-section">
          <Statistic
            title="推荐指数"
            value={score}
            suffix="/ 100"
            valueStyle={{ color: score >= 90 ? '#3f8600' : score >= 80 ? '#1890ff' : '#faad14' }}
            prefix={<TrophyOutlined />}
          />
          <Progress
            percent={score}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            showInfo={false}
          />
        </div>

        {/* 推荐理由 */}
        <div className="reason-section">
          <div className="section-title">
            <StarOutlined /> 推荐理由
          </div>
          <div className="recommended-reason">{recommendedReason}</div>
        </div>

        {/* 匹配原因 */}
        <div className="match-section">
          <div className="section-title">
            <CheckCircleOutlined /> 匹配优势
          </div>
          <List
            size="small"
            dataSource={matchReasons}
            renderItem={(reason) => (
              <List.Item>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                {reason}
              </List.Item>
            )}
          />
        </div>

        {/* 警告信息 */}
        {warnings.length > 0 && (
          <div className="warning-section">
            <Alert
              message="注意事项"
              description={
                <ul className="warning-list">
                  {warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              }
              type="warning"
              icon={<WarningOutlined />}
              showIcon
            />
          </div>
        )}

        {/* 关键指标 */}
        <Row gutter={16} className="metrics-section">
          <Col span={12}>
            <Tooltip title="预计交付时间">
              <div className="metric-item">
                <ClockCircleOutlined />
                <span>{estimatedDeliveryDays}天</span>
              </div>
            </Tooltip>
          </Col>
          <Col span={12}>
            <Tooltip title="综合评分">
              <div className="metric-item">
                <StarOutlined />
                <span>{supplier.rating}星</span>
              </div>
            </Tooltip>
          </Col>
        </Row>

        {/* 操作按钮 */}
        <div className="action-section">
          <Space style={{ width: '100%' }} direction="vertical">
            <Button
              type="primary"
              block
              icon={<CheckCircleOutlined />}
              onClick={() => handleSelectSupplier(supplier)}
            >
              选择此供应商
            </Button>
            <Button
              block
              onClick={() => handleViewDetail(supplier)}
            >
              查看详细信息
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  return (
    <div className="supplier-recommendation">
      {/* 标题和操作 */}
      <Card
        title={
          <Space>
            <TrophyOutlined />
            <span>智能推荐供应商</span>
            <Tag color="blue">{materialCategory}</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={() => setCriteriaModalVisible(true)}
          >
            自定义推荐条件
          </Button>
        }
      >
        <Alert
          message="基于多维度评估，为您推荐最优质的供应商"
          description="综合考虑质量、价格、交付、服务、市场指标、合作历史等因素"
          type="info"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />

        {/* 推荐卡片 */}
        <Row gutter={[24, 24]}>
          {recommendations.map((result, index) => (
            <Col key={result.supplier.id} xs={24} lg={8}>
              {renderRecommendationCard(result, index)}
            </Col>
          ))}
        </Row>

        {recommendations.length === 0 && (
          <div className="empty-state">
            <p>暂无推荐结果，请调整推荐条件</p>
          </div>
        )}
      </Card>

      {/* 自定义推荐条件模态框 */}
      <Modal
        title="自定义推荐条件"
        open={criteriaModalVisible}
        onOk={handleCustomRecommend}
        onCancel={() => setCriteriaModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={defaultCriteria}>
          <Form.Item label="材料类别" name="materialCategory">
            <Select placeholder="请选择材料类别">
              <Select.Option value="钢材">钢材</Select.Option>
              <Select.Option value="型材">型材</Select.Option>
              <Select.Option value="板材">板材</Select.Option>
              <Select.Option value="电缆">电缆</Select.Option>
              <Select.Option value="电器">电器</Select.Option>
              <Select.Option value="吊装">吊装</Select.Option>
              <Select.Option value="水电">水电</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="紧急程度"
            name="urgency"
            rules={[{ required: true, message: '请选择紧急程度' }]}
          >
            <Select placeholder="请选择紧急程度">
              <Select.Option value="high">紧急</Select.Option>
              <Select.Option value="medium">一般</Select.Option>
              <Select.Option value="low">不急</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="质量要求"
            name="qualityRequirement"
            rules={[{ required: true, message: '请选择质量要求' }]}
          >
            <Select placeholder="请选择质量要求">
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="low">低</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="预算下限（元）" name="budgetMin">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="可选"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="预算上限（元）" name="budgetMax">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="可选"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 供应商详情模态框 */}
      <Modal
        title={`供应商详情 - ${selectedSupplier?.name}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="select"
            type="primary"
            onClick={() => {
              if (selectedSupplier) {
                handleSelectSupplier(selectedSupplier);
                setDetailModalVisible(false);
              }
            }}
          >
            选择此供应商
          </Button>,
        ]}
        width={800}
      >
        {selectedSupplier && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="供应商名称" span={2}>
              {selectedSupplier.name}
            </Descriptions.Item>
            <Descriptions.Item label="供应类别" span={2}>
              {selectedSupplier.category.join('、')}
            </Descriptions.Item>
            <Descriptions.Item label="综合评分">
              {selectedSupplier.rating} 星
            </Descriptions.Item>
            <Descriptions.Item label="信用等级">
              <Tag color="gold">{selectedSupplier.creditRating}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="质量评分">
              <Progress percent={selectedSupplier.qualityScore} size="small" />
            </Descriptions.Item>
            <Descriptions.Item label="价格评分">
              <Progress percent={selectedSupplier.priceScore} size="small" />
            </Descriptions.Item>
            <Descriptions.Item label="交付评分">
              <Progress percent={selectedSupplier.deliveryScore} size="small" />
            </Descriptions.Item>
            <Descriptions.Item label="服务评分">
              <Progress percent={selectedSupplier.serviceScore} size="small" />
            </Descriptions.Item>
            <Descriptions.Item label="市场指数">
              {selectedSupplier.marketIndex}
            </Descriptions.Item>
            <Descriptions.Item label="交易量指数">
              {selectedSupplier.tradingVolume}
            </Descriptions.Item>
            <Descriptions.Item label="合作次数">
              {selectedSupplier.cooperationCount} 次
            </Descriptions.Item>
            <Descriptions.Item label="准时交付率">
              {selectedSupplier.onTimeDeliveryRate}%
            </Descriptions.Item>
            <Descriptions.Item label="质量合格率">
              {selectedSupplier.qualityPassRate}%
            </Descriptions.Item>
            <Descriptions.Item label="平均响应时间">
              {selectedSupplier.averageResponseTime} 小时
            </Descriptions.Item>
            <Descriptions.Item label="付款条件" span={2}>
              {selectedSupplier.paymentTerms}
            </Descriptions.Item>
            <Descriptions.Item label="联系人">
              {selectedSupplier.contact}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              <PhoneOutlined /> {selectedSupplier.phone}
            </Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>
              <EnvironmentOutlined /> {selectedSupplier.address}
            </Descriptions.Item>
            <Descriptions.Item label="资质认证" span={2}>
              {selectedSupplier.certifications.map((cert) => (
                <Tag key={cert} color="blue" style={{ marginBottom: 4 }}>
                  {cert}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="专业领域" span={2}>
              {selectedSupplier.specialties.map((specialty) => (
                <Tag key={specialty} color="green" style={{ marginBottom: 4 }}>
                  {specialty}
                </Tag>
              ))}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default SupplierRecommendation;
