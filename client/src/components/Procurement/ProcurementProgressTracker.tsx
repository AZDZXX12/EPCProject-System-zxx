/**
 * 采购进度跟踪组件
 * 
 * 功能特性：
 * 1. 订单状态看板
 * 2. 交付进度甘特图
 * 3. 延期预警提醒
 * 4. 供应商对比分析
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Steps,
  Timeline,
  Progress,
  Tag,
  Table,
  Button,
  Space,
  Statistic,
  Alert,
  Tabs,
  Badge,
  Tooltip,
  Modal,
  message,
  Typography,
} from 'antd';
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  WarningOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';
import './ProcurementProgressTracker.css';

const { Text } = Typography;

const { Step } = Steps;
const { TabPane } = Tabs;

// 采购订单接口
interface ProcurementOrder {
  id: string;
  orderNumber: string;
  materialName: string;
  supplier: string;
  quantity: number;
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: 'ordered' | 'confirmed' | 'in_transit' | 'delivered' | 'delayed';
  currentStep: number;
  progress: number;
  delayDays?: number;
}

// 供应商对比数据
interface SupplierComparison {
  supplier: string;
  totalOrders: number;
  onTimeRate: number;
  avgDeliveryDays: number;
  totalAmount: number;
  qualityScore: number;
}

const ProcurementProgressTracker: React.FC = () => {
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ProcurementOrder | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // 初始化模拟数据
  useEffect(() => {
    const mockOrders: ProcurementOrder[] = [
      {
        id: 'PO-001',
        orderNumber: 'PO20250120001',
        materialName: '螺纹钢 HRB400E Φ25',
        supplier: '宝钢集团',
        quantity: 50,
        totalAmount: 245000,
        orderDate: '2025-01-15',
        expectedDelivery: '2025-01-25',
        status: 'in_transit',
        currentStep: 2,
        progress: 60,
      },
      {
        id: 'PO-002',
        orderNumber: 'PO20250120002',
        materialName: '电力电缆 YJV-0.6/1kV 3×240+1×120',
        supplier: '远东电缆',
        quantity: 1000,
        totalAmount: 580000,
        orderDate: '2025-01-10',
        expectedDelivery: '2025-01-20',
        actualDelivery: '2025-01-18',
        status: 'delivered',
        currentStep: 4,
        progress: 100,
      },
      {
        id: 'PO-003',
        orderNumber: 'PO20250120003',
        materialName: '变压器 S11-M-1000/10',
        supplier: '特变电工',
        quantity: 2,
        totalAmount: 320000,
        orderDate: '2025-01-12',
        expectedDelivery: '2025-01-22',
        status: 'delayed',
        currentStep: 2,
        progress: 50,
        delayDays: 3,
      },
      {
        id: 'PO-004',
        orderNumber: 'PO20250120004',
        materialName: 'H型钢 HN400×200×8×13',
        supplier: '首钢集团',
        quantity: 30,
        totalAmount: 156000,
        orderDate: '2025-01-18',
        expectedDelivery: '2025-01-28',
        status: 'confirmed',
        currentStep: 1,
        progress: 25,
      },
      {
        id: 'PO-005',
        orderNumber: 'PO20250120005',
        materialName: '水泥 P.O 42.5',
        supplier: '海螺水泥',
        quantity: 200,
        totalAmount: 98000,
        orderDate: '2025-01-16',
        expectedDelivery: '2025-01-26',
        status: 'ordered',
        currentStep: 0,
        progress: 10,
      },
    ];
    setOrders(mockOrders);
  }, []);

  // 计算统计数据
  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    inTransit: orders.filter(o => o.status === 'in_transit').length,
    delayed: orders.filter(o => o.status === 'delayed').length,
    totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    onTimeRate: orders.length > 0 
      ? ((orders.filter(o => o.status === 'delivered' && !o.delayDays).length / orders.filter(o => o.status === 'delivered').length) * 100 || 0)
      : 0,
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      ordered: { color: 'default', text: '已下单', icon: <FileTextOutlined /> },
      confirmed: { color: 'processing', text: '已确认', icon: <CheckCircleOutlined /> },
      in_transit: { color: 'blue', text: '运输中', icon: <TruckOutlined /> },
      delivered: { color: 'success', text: '已交付', icon: <CheckCircleOutlined /> },
      delayed: { color: 'error', text: '已延期', icon: <WarningOutlined /> },
    };
    const config = statusConfig[status] || statusConfig.ordered;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 计算延期天数
  const calculateDelayDays = (order: ProcurementOrder) => {
    if (order.status === 'delivered' && order.actualDelivery) {
      const expected = dayjs(order.expectedDelivery);
      const actual = dayjs(order.actualDelivery);
      const diff = actual.diff(expected, 'day');
      return diff > 0 ? diff : 0;
    }
    if (order.status === 'delayed') {
      return order.delayDays || 0;
    }
    const expected = dayjs(order.expectedDelivery);
    const today = dayjs();
    const diff = today.diff(expected, 'day');
    return diff > 0 ? diff : 0;
  };

  // 订单状态步骤
  const orderSteps = [
    { title: '已下单', icon: <ShoppingCartOutlined /> },
    { title: '已确认', icon: <CheckCircleOutlined /> },
    { title: '运输中', icon: <TruckOutlined /> },
    { title: '质检中', icon: <FileTextOutlined /> },
    { title: '已交付', icon: <CheckCircleOutlined /> },
  ];

  // 表格列定义
  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
      fixed: 'left' as const,
    },
    {
      title: '材料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 200,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'right' as const,
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right' as const,
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      title: '下单日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
    },
    {
      title: '预计交付',
      dataIndex: 'expectedDelivery',
      key: 'expectedDelivery',
      width: 120,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (value: number, record: ProcurementOrder) => (
        <Progress
          percent={value}
          size="small"
          status={record.status === 'delayed' ? 'exception' : record.status === 'delivered' ? 'success' : 'active'}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '延期',
      key: 'delay',
      width: 80,
      render: (record: ProcurementOrder) => {
        const days = calculateDelayDays(record);
        return days > 0 ? (
          <Tag color="error">{days}天</Tag>
        ) : (
          <Tag color="success">准时</Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (record: ProcurementOrder) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => setSelectedOrder(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  // 供应商对比数据
  const supplierComparisonData: SupplierComparison[] = [
    { supplier: '宝钢集团', totalOrders: 12, onTimeRate: 91.7, avgDeliveryDays: 8, totalAmount: 2850000, qualityScore: 95 },
    { supplier: '远东电缆', totalOrders: 8, onTimeRate: 100, avgDeliveryDays: 7, totalAmount: 1560000, qualityScore: 98 },
    { supplier: '特变电工', totalOrders: 5, onTimeRate: 80, avgDeliveryDays: 12, totalAmount: 980000, qualityScore: 92 },
    { supplier: '首钢集团', totalOrders: 10, onTimeRate: 90, avgDeliveryDays: 9, totalAmount: 2100000, qualityScore: 94 },
    { supplier: '海螺水泥', totalOrders: 15, onTimeRate: 93.3, avgDeliveryDays: 6, totalAmount: 1200000, qualityScore: 96 },
  ];

  // 状态分布图表配置
  const statusDistributionConfig = {
    data: [
      { status: '已交付', count: stats.delivered },
      { status: '运输中', count: stats.inTransit },
      { status: '已延期', count: stats.delayed },
      { status: '其他', count: stats.total - stats.delivered - stats.inTransit - stats.delayed },
    ],
    angleField: 'count',
    colorField: 'status',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  // 供应商对比图表配置
  const supplierComparisonConfig = {
    data: supplierComparisonData,
    xField: 'supplier',
    yField: 'onTimeRate',
    label: {
      position: 'top' as const,
      style: {
        fill: '#000000',
        opacity: 0.6,
      },
      formatter: (datum: any) => `${datum.onTimeRate}%`,
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      supplier: { alias: '供应商' },
      onTimeRate: { alias: '准时率(%)' },
    },
  };

  return (
    <div className="procurement-progress-tracker">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={stats.total}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已交付"
              value={stats.delivered}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="运输中"
              value={stats.inTransit}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="延期订单"
              value={stats.delayed}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              suffix={
                <Tooltip title="延期率">
                  <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                    ({((stats.delayed / stats.total) * 100).toFixed(1)}%)
                  </span>
                </Tooltip>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 延期预警 */}
      {stats.delayed > 0 && (
        <Alert
          message="延期预警"
          description={`当前有 ${stats.delayed} 个订单延期，请及时跟进处理。`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 主内容区 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 订单概览 */}
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                订单概览
              </span>
            }
            key="overview"
          >
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              scroll={{ x: 1400 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          </TabPane>

          {/* 进度跟踪 */}
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                进度跟踪
              </span>
            }
            key="progress"
          >
            <Row gutter={[16, 16]}>
              {orders.map((order) => (
                <Col xs={24} key={order.id}>
                  <Card
                    size="small"
                    title={
                      <Space>
                        <span>{order.orderNumber}</span>
                        <Tag>{order.materialName}</Tag>
                        {getStatusTag(order.status)}
                      </Space>
                    }
                    extra={
                      <Space>
                        <Text type="secondary">
                          预计交付: {order.expectedDelivery}
                        </Text>
                        {calculateDelayDays(order) > 0 && (
                          <Tag color="error">
                            延期 {calculateDelayDays(order)} 天
                          </Tag>
                        )}
                      </Space>
                    }
                  >
                    <Steps current={order.currentStep} size="small">
                      {orderSteps.map((step, index) => (
                        <Step
                          key={index}
                          title={step.title}
                          icon={step.icon}
                          status={
                            index < order.currentStep
                              ? 'finish'
                              : index === order.currentStep
                              ? order.status === 'delayed'
                                ? 'error'
                                : 'process'
                              : 'wait'
                          }
                        />
                      ))}
                    </Steps>
                    <div style={{ marginTop: 16 }}>
                      <Progress
                        percent={order.progress}
                        status={
                          order.status === 'delayed'
                            ? 'exception'
                            : order.status === 'delivered'
                            ? 'success'
                            : 'active'
                        }
                      />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          {/* 数据分析 */}
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                数据分析
              </span>
            }
            key="analysis"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="订单状态分布" size="small">
                  <Pie {...statusDistributionConfig} height={300} />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="供应商准时率对比" size="small">
                  <Column {...supplierComparisonConfig} height={300} />
                </Card>
              </Col>
              <Col xs={24}>
                <Card title="供应商综合对比" size="small">
                  <Table
                    dataSource={supplierComparisonData}
                    rowKey="supplier"
                    pagination={false}
                    columns={[
                      { title: '供应商', dataIndex: 'supplier', key: 'supplier' },
                      { title: '订单总数', dataIndex: 'totalOrders', key: 'totalOrders', align: 'right' },
                      {
                        title: '准时率',
                        dataIndex: 'onTimeRate',
                        key: 'onTimeRate',
                        align: 'right',
                        render: (value: number) => (
                          <Tag color={value >= 95 ? 'success' : value >= 85 ? 'warning' : 'error'}>
                            {value}%
                          </Tag>
                        ),
                      },
                      {
                        title: '平均交付天数',
                        dataIndex: 'avgDeliveryDays',
                        key: 'avgDeliveryDays',
                        align: 'right',
                        render: (value: number) => `${value}天`,
                      },
                      {
                        title: '采购总额',
                        dataIndex: 'totalAmount',
                        key: 'totalAmount',
                        align: 'right',
                        render: (value: number) => `¥${value.toLocaleString()}`,
                      },
                      {
                        title: '质量评分',
                        dataIndex: 'qualityScore',
                        key: 'qualityScore',
                        align: 'right',
                        render: (value: number) => (
                          <Progress
                            percent={value}
                            size="small"
                            status={value >= 95 ? 'success' : 'normal'}
                          />
                        ),
                      },
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 时间线 */}
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                时间线
              </span>
            }
            key="timeline"
          >
            <Timeline mode="left">
              {orders
                .sort((a, b) => dayjs(b.orderDate).unix() - dayjs(a.orderDate).unix())
                .map((order) => (
                  <Timeline.Item
                    key={order.id}
                    label={order.orderDate}
                    color={
                      order.status === 'delivered'
                        ? 'green'
                        : order.status === 'delayed'
                        ? 'red'
                        : 'blue'
                    }
                  >
                    <Card size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <strong>{order.orderNumber}</strong>
                          {getStatusTag(order.status)}
                        </Space>
                        <Text>{order.materialName}</Text>
                        <Text type="secondary">供应商: {order.supplier}</Text>
                        <Text type="secondary">
                          预计交付: {order.expectedDelivery}
                        </Text>
                        {order.actualDelivery && (
                          <Text type="success">
                            实际交付: {order.actualDelivery}
                          </Text>
                        )}
                      </Space>
                    </Card>
                  </Timeline.Item>
                ))}
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* 订单详情弹窗 */}
      <Modal
        title={`订单详情 - ${selectedOrder?.orderNumber}`}
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedOrder(null)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Steps current={selectedOrder.currentStep} style={{ marginBottom: 24 }}>
              {orderSteps.map((step, index) => (
                <Step key={index} title={step.title} icon={step.icon} />
              ))}
            </Steps>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>材料名称：</Text>
                <Text>{selectedOrder.materialName}</Text>
              </Col>
              <Col span={12}>
                <Text strong>供应商：</Text>
                <Text>{selectedOrder.supplier}</Text>
              </Col>
              <Col span={12}>
                <Text strong>数量：</Text>
                <Text>{selectedOrder.quantity}</Text>
              </Col>
              <Col span={12}>
                <Text strong>金额：</Text>
                <Text>¥{selectedOrder.totalAmount.toLocaleString()}</Text>
              </Col>
              <Col span={12}>
                <Text strong>下单日期：</Text>
                <Text>{selectedOrder.orderDate}</Text>
              </Col>
              <Col span={12}>
                <Text strong>预计交付：</Text>
                <Text>{selectedOrder.expectedDelivery}</Text>
              </Col>
              {selectedOrder.actualDelivery && (
                <Col span={12}>
                  <Text strong>实际交付：</Text>
                  <Text>{selectedOrder.actualDelivery}</Text>
                </Col>
              )}
              <Col span={24}>
                <Text strong>当前状态：</Text>
                {getStatusTag(selectedOrder.status)}
              </Col>
              <Col span={24}>
                <Text strong>进度：</Text>
                <Progress percent={selectedOrder.progress} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProcurementProgressTracker;
