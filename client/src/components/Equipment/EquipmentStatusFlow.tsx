/**
 * 设备状态流转可视化组件
 * 
 * 功能特性：
 * 1. 状态流程图可视化
 * 2. 状态变更历史记录
 * 3. 自动状态提醒
 * 4. 设备利用率统计
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Steps,
  Timeline,
  Table,
  Tag,
  Button,
  Space,
  Statistic,
  Progress,
  Modal,
  Form,
  Select,
  Input,
  message,
  Tooltip,
  Badge,
} from 'antd';
import {
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ArrowRightOutlined,
  HistoryOutlined,
  BarChartOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';
import './EquipmentStatusFlow.css';

const { Step } = Steps;
const { TextArea } = Input;

// 设备状态枚举
enum EquipmentStatus {
  PLANNED = 'planned',
  ORDERED = 'ordered',
  DELIVERED = 'delivered',
  INSTALLED = 'installed',
  TESTING = 'testing',
  RUNNING = 'running',
  MAINTENANCE = 'maintenance',
  FAULT = 'fault',
  RETIRED = 'retired',
}

// 设备接口
interface Equipment {
  id: string;
  name: string;
  model: string;
  status: EquipmentStatus;
  location: string;
  installDate?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  utilizationRate: number;
  runningHours: number;
  faultCount: number;
}

// 状态变更记录
interface StatusChangeRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  fromStatus: EquipmentStatus;
  toStatus: EquipmentStatus;
  changeDate: string;
  operator: string;
  reason: string;
}

const EquipmentStatusFlow: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [statusRecords, setStatusRecords] = useState<StatusChangeRecord[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 初始化模拟数据
  useEffect(() => {
    const mockEquipments: Equipment[] = [
      {
        id: 'EQ-001',
        name: '离心泵 A1',
        model: 'IS80-50-200',
        status: EquipmentStatus.RUNNING,
        location: '泵房1',
        installDate: '2024-12-01',
        lastMaintenance: '2025-01-10',
        nextMaintenance: '2025-04-10',
        utilizationRate: 85,
        runningHours: 1200,
        faultCount: 2,
      },
      {
        id: 'EQ-002',
        name: '变压器 T1',
        model: 'S11-M-1000/10',
        status: EquipmentStatus.INSTALLED,
        location: '配电室',
        installDate: '2025-01-15',
        utilizationRate: 0,
        runningHours: 0,
        faultCount: 0,
      },
      {
        id: 'EQ-003',
        name: '换热器 H1',
        model: 'BEM400-1.6-200',
        status: EquipmentStatus.MAINTENANCE,
        location: '换热站',
        installDate: '2024-11-20',
        lastMaintenance: '2025-01-18',
        nextMaintenance: '2025-02-18',
        utilizationRate: 72,
        runningHours: 1800,
        faultCount: 5,
      },
      {
        id: 'EQ-004',
        name: '风机 F1',
        model: 'Y4-73-11NO8D',
        status: EquipmentStatus.DELIVERED,
        location: '待安装',
        utilizationRate: 0,
        runningHours: 0,
        faultCount: 0,
      },
      {
        id: 'EQ-005',
        name: '电动机 M1',
        model: 'Y315M-4',
        status: EquipmentStatus.FAULT,
        location: '车间2',
        installDate: '2024-10-15',
        lastMaintenance: '2024-12-20',
        utilizationRate: 45,
        runningHours: 2400,
        faultCount: 8,
      },
    ];

    const mockRecords: StatusChangeRecord[] = [
      {
        id: 'R-001',
        equipmentId: 'EQ-001',
        equipmentName: '离心泵 A1',
        fromStatus: EquipmentStatus.INSTALLED,
        toStatus: EquipmentStatus.RUNNING,
        changeDate: '2024-12-05',
        operator: '张工',
        reason: '安装调试完成，正式投运',
      },
      {
        id: 'R-002',
        equipmentId: 'EQ-003',
        equipmentName: '换热器 H1',
        fromStatus: EquipmentStatus.RUNNING,
        toStatus: EquipmentStatus.MAINTENANCE,
        changeDate: '2025-01-18',
        operator: '李工',
        reason: '定期维护保养',
      },
      {
        id: 'R-003',
        equipmentId: 'EQ-005',
        equipmentName: '电动机 M1',
        fromStatus: EquipmentStatus.RUNNING,
        toStatus: EquipmentStatus.FAULT,
        changeDate: '2025-01-19',
        operator: '王工',
        reason: '轴承异响，紧急停机检修',
      },
    ];

    setEquipments(mockEquipments);
    setStatusRecords(mockRecords);
  }, []);

  // 状态配置
  const statusConfig: Record<EquipmentStatus, { text: string; color: string; icon: React.ReactNode }> = {
    [EquipmentStatus.PLANNED]: { text: '已规划', color: 'default', icon: <ClockCircleOutlined /> },
    [EquipmentStatus.ORDERED]: { text: '已订购', color: 'processing', icon: <ClockCircleOutlined /> },
    [EquipmentStatus.DELIVERED]: { text: '已交付', color: 'cyan', icon: <CheckCircleOutlined /> },
    [EquipmentStatus.INSTALLED]: { text: '已安装', color: 'blue', icon: <ToolOutlined /> },
    [EquipmentStatus.TESTING]: { text: '调试中', color: 'orange', icon: <ClockCircleOutlined /> },
    [EquipmentStatus.RUNNING]: { text: '运行中', color: 'success', icon: <CheckCircleOutlined /> },
    [EquipmentStatus.MAINTENANCE]: { text: '维护中', color: 'warning', icon: <ToolOutlined /> },
    [EquipmentStatus.FAULT]: { text: '故障', color: 'error', icon: <WarningOutlined /> },
    [EquipmentStatus.RETIRED]: { text: '已退役', color: 'default', icon: <ClockCircleOutlined /> },
  };

  // 获取状态标签
  const getStatusTag = (status: EquipmentStatus) => {
    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 状态流程步骤
  const statusSteps = [
    { title: '已规划', status: EquipmentStatus.PLANNED },
    { title: '已订购', status: EquipmentStatus.ORDERED },
    { title: '已交付', status: EquipmentStatus.DELIVERED },
    { title: '已安装', status: EquipmentStatus.INSTALLED },
    { title: '调试中', status: EquipmentStatus.TESTING },
    { title: '运行中', status: EquipmentStatus.RUNNING },
  ];

  // 获取当前步骤
  const getCurrentStep = (status: EquipmentStatus) => {
    const index = statusSteps.findIndex(s => s.status === status);
    return index >= 0 ? index : 0;
  };

  // 统计数据
  const stats = {
    total: equipments.length,
    running: equipments.filter(e => e.status === EquipmentStatus.RUNNING).length,
    maintenance: equipments.filter(e => e.status === EquipmentStatus.MAINTENANCE).length,
    fault: equipments.filter(e => e.status === EquipmentStatus.FAULT).length,
    avgUtilization: equipments.reduce((sum, e) => sum + e.utilizationRate, 0) / equipments.length,
  };

  // 状态分布数据
  const statusDistribution = Object.values(EquipmentStatus).map(status => ({
    status: statusConfig[status].text,
    count: equipments.filter(e => e.status === status).length,
  })).filter(item => item.count > 0);

  // 利用率趋势数据（模拟）
  const utilizationTrend = [
    { date: '01-14', rate: 78 },
    { date: '01-15', rate: 80 },
    { date: '01-16', rate: 82 },
    { date: '01-17', rate: 79 },
    { date: '01-18', rate: 75 },
    { date: '01-19', rate: 73 },
    { date: '01-20', rate: 76 },
  ];

  // 状态变更
  const handleStatusChange = async (values: any) => {
    if (!selectedEquipment) return;

    const newRecord: StatusChangeRecord = {
      id: `R-${Date.now()}`,
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.name,
      fromStatus: selectedEquipment.status,
      toStatus: values.toStatus,
      changeDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      operator: values.operator,
      reason: values.reason,
    };

    setStatusRecords([newRecord, ...statusRecords]);
    setEquipments(equipments.map(e =>
      e.id === selectedEquipment.id ? { ...e, status: values.toStatus } : e
    ));

    message.success('状态更新成功');
    setIsModalVisible(false);
    form.resetFields();
  };

  // 表格列
  const columns = [
    {
      title: '设备编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: EquipmentStatus) => getStatusTag(status),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: '利用率',
      dataIndex: 'utilizationRate',
      key: 'utilizationRate',
      width: 150,
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 80 ? 'success' : rate >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
    {
      title: '运行时长',
      dataIndex: 'runningHours',
      key: 'runningHours',
      width: 100,
      render: (hours: number) => `${hours}h`,
    },
    {
      title: '故障次数',
      dataIndex: 'faultCount',
      key: 'faultCount',
      width: 100,
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: count > 5 ? '#ff4d4f' : '#52c41a' }} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (record: Equipment) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedEquipment(record);
              setIsModalVisible(true);
            }}
          >
            变更状态
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => setSelectedEquipment(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  // 状态变更记录列
  const recordColumns = [
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
    },
    {
      title: '原状态',
      dataIndex: 'fromStatus',
      key: 'fromStatus',
      render: (status: EquipmentStatus) => getStatusTag(status),
    },
    {
      title: '',
      key: 'arrow',
      width: 50,
      render: () => <ArrowRightOutlined />,
    },
    {
      title: '新状态',
      dataIndex: 'toStatus',
      key: 'toStatus',
      render: (status: EquipmentStatus) => getStatusTag(status),
    },
    {
      title: '变更时间',
      dataIndex: 'changeDate',
      key: 'changeDate',
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '变更原因',
      dataIndex: 'reason',
      key: 'reason',
    },
  ];

  // 饼图配置
  const pieConfig = {
    data: statusDistribution,
    angleField: 'count',
    colorField: 'status',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
  };

  // 折线图配置
  const lineConfig = {
    data: utilizationTrend,
    xField: 'date',
    yField: 'rate',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    yAxis: {
      min: 0,
      max: 100,
    },
  };

  return (
    <div className="equipment-status-flow">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="设备总数"
              value={stats.total}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="运行中"
              value={stats.running}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="维护/故障"
              value={stats.maintenance + stats.fault}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均利用率"
              value={stats.avgUtilization.toFixed(1)}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: stats.avgUtilization >= 80 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主内容区 */}
      <Row gutter={[16, 16]}>
        {/* 设备列表 */}
        <Col xs={24}>
          <Card title="设备状态总览" className="equipment-table-card">
            <Table
              columns={columns}
              dataSource={equipments}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 台设备`,
              }}
            />
          </Card>
        </Col>

        {/* 状态分布 */}
        <Col xs={24} md={12}>
          <Card title="状态分布" className="chart-card">
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>

        {/* 利用率趋势 */}
        <Col xs={24} md={12}>
          <Card title="设备利用率趋势（近7天）" className="chart-card">
            <Line {...lineConfig} height={300} />
          </Card>
        </Col>

        {/* 状态变更记录 */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <HistoryOutlined />
                状态变更记录
              </Space>
            }
            className="records-card"
          >
            <Table
              columns={recordColumns}
              dataSource={statusRecords}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 状态变更弹窗 */}
      <Modal
        title={`变更设备状态 - ${selectedEquipment?.name}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        {selectedEquipment && (
          <>
            <div className="current-status-info">
              <Space>
                <span>当前状态：</span>
                {getStatusTag(selectedEquipment.status)}
              </Space>
            </div>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleStatusChange}
              className="status-change-form"
            >
              <Form.Item
                label="新状态"
                name="toStatus"
                rules={[{ required: true, message: '请选择新状态' }]}
              >
                <Select placeholder="请选择新状态">
                  {Object.entries(statusConfig).map(([key, value]) => (
                    <Select.Option key={key} value={key} disabled={key === selectedEquipment.status}>
                      <Tag color={value.color} icon={value.icon}>
                        {value.text}
                      </Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="操作人"
                name="operator"
                rules={[{ required: true, message: '请输入操作人' }]}
              >
                <Input placeholder="请输入操作人姓名" />
              </Form.Item>
              <Form.Item
                label="变更原因"
                name="reason"
                rules={[{ required: true, message: '请输入变更原因' }]}
              >
                <TextArea rows={4} placeholder="请输入状态变更原因" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default EquipmentStatusFlow;
