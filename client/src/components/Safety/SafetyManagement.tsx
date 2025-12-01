/**
 * 安全管理模块
 * 
 * 功能特性：
 * 1. 安全检查记录
 * 2. 隐患排查
 * 3. 整改跟踪
 * 4. 安全培训记录
 * 5. 应急预案管理
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Timeline,
  Tabs,
  message,
  Progress,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SafetyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import './SafetyManagement.css';

const { TextArea } = Input;
const { TabPane } = Tabs;

// 安全检查记录
interface SafetyInspection {
  id: string;
  date: string;
  inspector: string;
  location: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  hazardsFound: number;
  hazardsResolved: number;
  status: 'completed' | 'pending';
  remarks?: string;
}

// 安全隐患
interface SafetyHazard {
  id: string;
  title: string;
  level: 'critical' | 'major' | 'moderate' | 'minor';
  location: string;
  description: string;
  discoverer: string;
  discoverDate: string;
  assignee?: string;
  dueDate?: string;
  status: 'open' | 'rectifying' | 'resolved';
  rectificationMeasures?: string;
  resolveDate?: string;
}

const SafetyManagement: React.FC = () => {
  const [inspections, setInspections] = useState<SafetyInspection[]>([]);
  const [hazards, setHazards] = useState<SafetyHazard[]>([]);
  const [isInspectionModalVisible, setIsInspectionModalVisible] = useState(false);
  const [isHazardModalVisible, setIsHazardModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [hazardForm] = Form.useForm();

  // 检查类型配置
  const inspectionTypeConfig = {
    daily: { text: '日检', color: 'blue' },
    weekly: { text: '周检', color: 'green' },
    monthly: { text: '月检', color: 'orange' },
    special: { text: '专项检查', color: 'purple' },
  };

  // 隐患等级配置
  const hazardLevelConfig = {
    critical: { text: '重大隐患', color: 'red' },
    major: { text: '较大隐患', color: 'orange' },
    moderate: { text: '一般隐患', color: 'blue' },
    minor: { text: '轻微隐患', color: 'green' },
  };

  // 隐患状态配置
  const hazardStatusConfig = {
    open: { text: '待整改', color: 'red', icon: <WarningOutlined /> },
    rectifying: { text: '整改中', color: 'orange', icon: <ClockCircleOutlined /> },
    resolved: { text: '已整改', color: 'green', icon: <CheckCircleOutlined /> },
  };

  // 初始化数据
  useEffect(() => {
    const mockInspections: SafetyInspection[] = [
      {
        id: 'SI-001',
        date: '2025-01-20',
        inspector: '张工',
        location: '施工现场',
        type: 'daily',
        hazardsFound: 3,
        hazardsResolved: 2,
        status: 'completed',
      },
      {
        id: 'SI-002',
        date: '2025-01-19',
        inspector: '李工',
        location: 'A区',
        type: 'weekly',
        hazardsFound: 5,
        hazardsResolved: 5,
        status: 'completed',
      },
    ];

    const mockHazards: SafetyHazard[] = [
      {
        id: 'SH-001',
        title: '脚手架未设置安全网',
        level: 'critical',
        location: 'C区外脚手架',
        description: '第4层脚手架未按规范设置安全网',
        discoverer: '张工',
        discoverDate: '2025-01-20 09:00:00',
        assignee: '王工',
        dueDate: '2025-01-21',
        status: 'rectifying',
      },
      {
        id: 'SH-002',
        title: '临边防护不到位',
        level: 'major',
        location: 'B区楼梯口',
        description: '楼梯口临边防护栏杆缺失',
        discoverer: '李工',
        discoverDate: '2025-01-19 14:30:00',
        status: 'open',
      },
    ];

    setInspections(mockInspections);
    setHazards(mockHazards);
  }, []);

  // 统计数据
  const stats = {
    totalInspections: inspections.length,
    totalHazards: hazards.length,
    openHazards: hazards.filter(h => h.status === 'open').length,
    resolvedHazards: hazards.filter(h => h.status === 'resolved').length,
    criticalHazards: hazards.filter(h => h.level === 'critical').length,
    resolveRate: hazards.length > 0 
      ? Math.round((hazards.filter(h => h.status === 'resolved').length / hazards.length) * 100)
      : 0,
  };

  // 检查记录表格列
  const inspectionColumns: ColumnsType<SafetyInspection> = [
    {
      title: '检查编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '检查日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: '检查类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={inspectionTypeConfig[type as keyof typeof inspectionTypeConfig].color}>
          {inspectionTypeConfig[type as keyof typeof inspectionTypeConfig].text}
        </Tag>
      ),
    },
    {
      title: '检查人',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 100,
    },
    {
      title: '检查位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '发现隐患',
      dataIndex: 'hazardsFound',
      key: 'hazardsFound',
      width: 100,
      render: (count: number) => (
        <span style={{ color: count > 0 ? '#ff4d4f' : '#52c41a' }}>
          {count} 项
        </span>
      ),
    },
    {
      title: '已整改',
      dataIndex: 'hazardsResolved',
      key: 'hazardsResolved',
      width: 100,
      render: (count: number) => `${count} 项`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status === 'completed' ? '已完成' : '进行中'}
        </Tag>
      ),
    },
  ];

  // 隐患表格列
  const hazardColumns: ColumnsType<SafetyHazard> = [
    {
      title: '隐患编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '隐患标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '隐患等级',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (level: string) => (
        <Tag color={hazardLevelConfig[level as keyof typeof hazardLevelConfig].color}>
          {hazardLevelConfig[level as keyof typeof hazardLevelConfig].text}
        </Tag>
      ),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '发现人',
      dataIndex: 'discoverer',
      key: 'discoverer',
      width: 100,
    },
    {
      title: '发现时间',
      dataIndex: 'discoverDate',
      key: 'discoverDate',
      width: 160,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '责任人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100,
      render: (assignee?: string) => assignee || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = hazardStatusConfig[status as keyof typeof hazardStatusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">详情</Button>
          {record.status !== 'resolved' && (
            <Button type="link" size="small">整改</Button>
          )}
        </Space>
      ),
    },
  ];

  // 创建检查记录
  const handleCreateInspection = async (values: any) => {
    const newInspection: SafetyInspection = {
      id: `SI-${String(inspections.length + 1).padStart(3, '0')}`,
      date: values.date.format('YYYY-MM-DD'),
      inspector: values.inspector,
      location: values.location,
      type: values.type,
      hazardsFound: values.hazardsFound || 0,
      hazardsResolved: values.hazardsResolved || 0,
      status: 'completed',
      remarks: values.remarks,
    };

    setInspections([newInspection, ...inspections]);
    message.success('检查记录创建成功');
    setIsInspectionModalVisible(false);
    form.resetFields();
  };

  // 创建隐患
  const handleCreateHazard = async (values: any) => {
    const newHazard: SafetyHazard = {
      id: `SH-${String(hazards.length + 1).padStart(3, '0')}`,
      title: values.title,
      level: values.level,
      location: values.location,
      description: values.description,
      discoverer: values.discoverer,
      discoverDate: values.discoverDate.format('YYYY-MM-DD HH:mm:ss'),
      assignee: values.assignee,
      dueDate: values.dueDate?.format('YYYY-MM-DD'),
      status: 'open',
    };

    setHazards([newHazard, ...hazards]);
    message.success('隐患记录创建成功');
    setIsHazardModalVisible(false);
    hazardForm.resetFields();
  };

  return (
    <div className="safety-management">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="检查次数"
              value={stats.totalInspections}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="隐患总数"
              value={stats.totalHazards}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待整改"
              value={stats.openHazards}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="整改率"
              value={stats.resolveRate}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 重大隐患提醒 */}
      {stats.criticalHazards > 0 && (
        <Alert
          message="重大隐患提醒"
          description={`当前有 ${stats.criticalHazards} 项重大隐患待整改，请立即处理！`}
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 主内容 */}
      <Card>
        <Tabs defaultActiveKey="hazards">
          {/* 隐患管理 */}
          <TabPane
            tab={
              <span>
                <WarningOutlined />
                隐患管理
              </span>
            }
            key="hazards"
          >
            <Space style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsHazardModalVisible(true)}
              >
                新建隐患
              </Button>
            </Space>
            <Table
              columns={hazardColumns}
              dataSource={hazards}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          {/* 检查记录 */}
          <TabPane
            tab={
              <span>
                <SafetyOutlined />
                检查记录
              </span>
            }
            key="inspections"
          >
            <Space style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsInspectionModalVisible(true)}
              >
                新建检查
              </Button>
            </Space>
            <Table
              columns={inspectionColumns}
              dataSource={inspections}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 创建检查记录弹窗 */}
      <Modal
        title="新建安全检查"
        open={isInspectionModalVisible}
        onCancel={() => {
          setIsInspectionModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateInspection}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="检查日期"
                name="date"
                rules={[{ required: true, message: '请选择检查日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="检查类型"
                name="type"
                rules={[{ required: true, message: '请选择检查类型' }]}
              >
                <Select placeholder="请选择">
                  <Select.Option value="daily">日检</Select.Option>
                  <Select.Option value="weekly">周检</Select.Option>
                  <Select.Option value="monthly">月检</Select.Option>
                  <Select.Option value="special">专项检查</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="检查人"
                name="inspector"
                rules={[{ required: true, message: '请输入检查人' }]}
              >
                <Input placeholder="请输入检查人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="检查位置"
                name="location"
                rules={[{ required: true, message: '请输入检查位置' }]}
              >
                <Input placeholder="请输入检查位置" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="发现隐患" name="hazardsFound">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="已整改" name="hazardsResolved">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注" name="remarks">
            <TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建隐患弹窗 */}
      <Modal
        title="新建安全隐患"
        open={isHazardModalVisible}
        onCancel={() => {
          setIsHazardModalVisible(false);
          hazardForm.resetFields();
        }}
        onOk={() => hazardForm.submit()}
        width={700}
      >
        <Form form={hazardForm} layout="vertical" onFinish={handleCreateHazard}>
          <Form.Item
            label="隐患标题"
            name="title"
            rules={[{ required: true, message: '请输入隐患标题' }]}
          >
            <Input placeholder="请输入隐患标题" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="隐患等级"
                name="level"
                rules={[{ required: true, message: '请选择隐患等级' }]}
              >
                <Select placeholder="请选择">
                  <Select.Option value="critical">重大隐患</Select.Option>
                  <Select.Option value="major">较大隐患</Select.Option>
                  <Select.Option value="moderate">一般隐患</Select.Option>
                  <Select.Option value="minor">轻微隐患</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="发现时间"
                name="discoverDate"
                rules={[{ required: true, message: '请选择发现时间' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="隐患位置"
            name="location"
            rules={[{ required: true, message: '请输入隐患位置' }]}
          >
            <Input placeholder="请输入隐患位置" />
          </Form.Item>
          <Form.Item
            label="隐患描述"
            name="description"
            rules={[{ required: true, message: '请输入隐患描述' }]}
          >
            <TextArea rows={4} placeholder="请详细描述隐患情况" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="发现人"
                name="discoverer"
                rules={[{ required: true, message: '请输入发现人' }]}
              >
                <Input placeholder="请输入发现人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="责任人" name="assignee">
                <Input placeholder="请输入责任人姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="整改期限" name="dueDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SafetyManagement;
