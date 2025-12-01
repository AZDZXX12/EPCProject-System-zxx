/**
 * 采购计划清单组件
 * 展示从价格监控和设备选型导入的采购计划
 * 支持批量编辑、状态流转、供应商选择
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
  InputNumber,
  Select,
  Input,
  message,
  Popconfirm,
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic,
  Progress,
} from 'antd';
import {
  ShoppingCartOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  SendOutlined,
  FileTextOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { eventBus, EVENTS, useEventBus } from '../../utils/EventBus';
import type { ProcurementEventData } from '../../utils/EventBus';
import './ProcurementPlanList.css';

interface ProcurementPlan {
  id: string;
  materialId: string;
  materialName: string;
  specification: string;
  quantity: number;
  unit?: string;
  estimatedPrice: number;
  totalPrice: number;
  urgency: 'low' | 'medium' | 'high' | 'normal' | 'urgent' | 'emergency';
  reason?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  supplier?: string;
  createdAt: string;
  updatedAt?: string;
}

const ProcurementPlanList: React.FC = () => {
  const [plans, setPlans] = useState<ProcurementPlan[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<ProcurementPlan | null>(null);
  const [form] = Form.useForm();

  // 监听采购计划创建事件
  useEventBus(
    EVENTS.PROCUREMENT_PLAN_CREATED,
    (data: ProcurementEventData) => {
      const newPlan: ProcurementPlan = {
        id: `PP-${Date.now()}`,
        materialId: data.materialId,
        materialName: data.materialName,
        specification: data.specification,
        quantity: data.quantity || 1,
        unit: '件',
        estimatedPrice: data.estimatedPrice,
        totalPrice: (data.quantity || 1) * data.estimatedPrice,
        urgency: data.urgency || 'medium',
        reason: data.reason || '价格监控触发',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPlans((prev) => [newPlan, ...prev]);
      message.success(`已添加采购计划：${data.materialName}`);
    },
    []
  );

  // 监听采购项添加事件
  useEventBus(
    EVENTS.PROCUREMENT_ITEM_ADDED,
    (data: ProcurementEventData) => {
      const newPlan: ProcurementPlan = {
        id: `PP-${Date.now()}`,
        materialId: data.materialId,
        materialName: data.materialName,
        specification: data.specification,
        quantity: data.quantity || 1,
        unit: '件',
        estimatedPrice: data.estimatedPrice,
        totalPrice: (data.quantity || 1) * data.estimatedPrice,
        urgency: data.urgency || 'medium',
        reason: data.reason || '材料价格监控',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPlans((prev) => [newPlan, ...prev]);
    },
    []
  );

  // 编辑采购计划
  const handleEdit = (plan: ProcurementPlan) => {
    setCurrentPlan(plan);
    form.setFieldsValue({
      quantity: plan.quantity,
      unit: plan.unit,
      estimatedPrice: plan.estimatedPrice,
      urgency: plan.urgency,
      supplier: plan.supplier,
      specification: plan.specification,
    });
    setEditModalVisible(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      if (!currentPlan) return;

      const updatedPlan: ProcurementPlan = {
        ...currentPlan,
        ...values,
        totalPrice: values.quantity * values.estimatedPrice,
        updatedAt: new Date().toISOString(),
      };

      setPlans((prev) =>
        prev.map((p) => (p.id === currentPlan.id ? updatedPlan : p))
      );

      message.success('采购计划已更新');
      setEditModalVisible(false);
      setCurrentPlan(null);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 删除采购计划
  const handleDelete = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    message.success('已删除采购计划');
  };

  // 批量删除
  const handleBatchDelete = () => {
    setPlans((prev) => prev.filter((p) => !selectedRowKeys.includes(p.id)));
    setSelectedRowKeys([]);
    message.success(`已删除${selectedRowKeys.length}个采购计划`);
  };

  // 更新状态
  const handleUpdateStatus = (id: string, status: ProcurementPlan['status']) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status, updatedAt: new Date().toISOString() }
          : p
      )
    );

    const statusText = {
      draft: '草稿',
      submitted: '已提交',
      approved: '已批准',
      ordered: '已下单',
      received: '已收货',
    };

    message.success(`状态已更新为：${statusText[status]}`);

    // 触发EventBus事件
    eventBus.emit(EVENTS.PROCUREMENT_PLAN_CREATED, {
      materialId: id,
      materialName: '',
      specification: '',
      quantity: 0,
      estimatedPrice: 0,
      urgency: 'medium',
      reason: `状态更新：${statusText[status]}`,
    });
  };

  // 批量提交
  const handleBatchSubmit = () => {
    const selectedPlans = plans.filter((p) => selectedRowKeys.includes(p.id));
    const draftPlans = selectedPlans.filter((p) => p.status === 'draft');

    if (draftPlans.length === 0) {
      message.warning('请选择草稿状态的采购计划');
      return;
    }

    setPlans((prev) =>
      prev.map((p) =>
        draftPlans.some((dp) => dp.id === p.id)
          ? { ...p, status: 'submitted', updatedAt: new Date().toISOString() }
          : p
      )
    );

    setSelectedRowKeys([]);
    message.success(`已提交${draftPlans.length}个采购计划`);
  };

  // 统计数据
  const statistics = {
    total: plans.length,
    draft: plans.filter((p) => p.status === 'draft').length,
    submitted: plans.filter((p) => p.status === 'submitted').length,
    approved: plans.filter((p) => p.status === 'approved').length,
    totalAmount: plans.reduce((sum, p) => sum + p.totalPrice, 0),
  };

  // 表格列定义
  const columns = [
    {
      title: '材料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 200,
      fixed: 'left' as const,
      render: (text: string, record: ProcurementPlan) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.specification}</div>
        </div>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number, record: ProcurementPlan) => (
        <span>
          {quantity} {record.unit}
        </span>
      ),
    },
    {
      title: '预估单价',
      dataIndex: 'estimatedPrice',
      key: 'estimatedPrice',
      width: 120,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (price: number) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          ¥{price.toFixed(2)}
        </span>
      ),
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 100,
      render: (urgency: string) => {
        const colorMap = {
          high: 'red',
          medium: 'orange',
          low: 'green',
        };
        const textMap = {
          high: '紧急',
          medium: '一般',
          low: '不急',
        };
        return <Tag color={colorMap[urgency as keyof typeof colorMap]}>{textMap[urgency as keyof typeof textMap]}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ProcurementPlan['status']) => {
        const statusConfig = {
          draft: { color: 'default', text: '草稿' },
          submitted: { color: 'processing', text: '已提交' },
          approved: { color: 'success', text: '已批准' },
          ordered: { color: 'warning', text: '已下单' },
          received: { color: 'success', text: '已收货' },
        };
        const config = statusConfig[status];
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
      render: (supplier: string) => supplier || '-',
    },
    {
      title: '来源',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      ellipsis: true,
      render: (reason: string) => (
        <Tooltip title={reason}>
          <span>{reason}</span>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: ProcurementPlan) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'draft' && (
            <Button
              type="link"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'submitted')}
            >
              提交
            </Button>
          )}
          {record.status === 'submitted' && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'approved')}
            >
              批准
            </Button>
          )}
          <Popconfirm
            title="确定删除此采购计划？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="procurement-plan-list">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="采购计划总数"
              value={statistics.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待提交"
              value={statistics.draft}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已提交"
              value={statistics.submitted}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="预估总金额"
              value={statistics.totalAmount}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 表格 */}
      <Card
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>采购计划清单</span>
          </Space>
        }
        extra={
          <Space>
            {selectedRowKeys.length > 0 && (
              <>
                <Button onClick={handleBatchSubmit}>
                  批量提交 ({selectedRowKeys.length})
                </Button>
                <Popconfirm
                  title={`确定删除选中的${selectedRowKeys.length}个采购计划？`}
                  onConfirm={handleBatchDelete}
                >
                  <Button danger>批量删除</Button>
                </Popconfirm>
              </>
            )}
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={plans}
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            selections: [
              Table.SELECTION_ALL,
              Table.SELECTION_INVERT,
              Table.SELECTION_NONE,
            ],
          }}
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 编辑模态框 */}
      <Modal
        title="编辑采购计划"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentPlan(null);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="规格"
            name="specification"
            rules={[{ required: true, message: '请输入规格' }]}
          >
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="数量"
                name="quantity"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="请输入数量"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="单位"
                name="unit"
                rules={[{ required: true, message: '请选择单位' }]}
              >
                <Select placeholder="请选择单位">
                  <Select.Option value="件">件</Select.Option>
                  <Select.Option value="台">台</Select.Option>
                  <Select.Option value="套">套</Select.Option>
                  <Select.Option value="吨">吨</Select.Option>
                  <Select.Option value="米">米</Select.Option>
                  <Select.Option value="平方米">平方米</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="预估单价（元）"
            name="estimatedPrice"
            rules={[{ required: true, message: '请输入预估单价' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入预估单价"
            />
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
          <Form.Item label="供应商" name="supplier">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProcurementPlanList;
