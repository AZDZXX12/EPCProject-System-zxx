import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Statistic,
  Tag,
  Typography,
  Divider,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileExcelOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import { useProject } from '../contexts/ProjectContext';
import PageContainer from '../components/Layout/PageContainer';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Equipment {
  id: string;
  name: string;
  model: string;
  spec: string;
  quantity: number;
  unit: string;
  manufacturer: string;
  contact: string;
  phone: string;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: string;
  status: string;
  remarks?: string;
}

const ProcurementManagement: React.FC = () => {
  const { currentProject } = useProject();
  const [equipments, setEquipments] = useState<Equipment[]>([
    {
      id: 'EQ-001',
      name: '离心泵',
      model: 'IS80-50-200',
      spec: '流量50m³/h，扬程32m',
      quantity: 3,
      unit: '台',
      manufacturer: '上海水泵厂',
      contact: '张经理',
      phone: '021-12345678',
      unitPrice: 12500,
      totalPrice: 37500,
      deliveryTime: '2024-02-15',
      status: 'delivered',
    },
    {
      id: 'EQ-002',
      name: '换热器',
      model: 'BEM400-1.6-200-4/25',
      spec: '换热面积400m²',
      quantity: 2,
      unit: '台',
      manufacturer: '无锡换热设备公司',
      contact: '李总',
      phone: '0510-87654321',
      unitPrice: 85000,
      totalPrice: 170000,
      deliveryTime: '2024-03-10',
      status: 'ordered',
    },
    {
      id: 'EQ-003',
      name: '反应釜',
      model: 'GSH-5000',
      spec: '容积5000L，压力1.0MPa',
      quantity: 1,
      unit: '台',
      manufacturer: '广州化工设备厂',
      contact: '王工',
      phone: '020-98765432',
      unitPrice: 150000,
      totalPrice: 150000,
      deliveryTime: '2024-04-20',
      status: 'quoted',
    },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingEquipment(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Equipment) => {
    setEditingEquipment(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条设备记录吗？',
      onOk: () => {
        setEquipments(prev => prev.filter(e => e.id !== id));
        message.success('删除成功');
      },
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingEquipment) {
        // 编辑
        setEquipments(prev =>
          prev.map(e =>
            e.id === editingEquipment.id
              ? { ...e, ...values, totalPrice: values.unitPrice * values.quantity }
              : e
          )
        );
        message.success('编辑成功');
      } else {
        // 新增
        const newEquipment: Equipment = {
          ...values,
          id: `EQ-${Date.now()}`,
          totalPrice: values.unitPrice * values.quantity,
        };
        setEquipments(prev => [...prev, newEquipment]);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleImportFromSelection = () => {
    Modal.confirm({
      title: '从设备选型系统导入',
      content: '确定要从设备选型系统导入设备清单吗？现有数据将被保留。',
      onOk: () => {
        // 模拟从选型系统导入
        const importedEquipments: Equipment[] = [
          {
            id: `EQ-IMP-${Date.now()}`,
            name: '压缩机',
            model: 'L-40/8',
            spec: '排气量40m³/min',
            quantity: 1,
            unit: '台',
            manufacturer: '待确定',
            contact: '',
            phone: '',
            unitPrice: 0,
            totalPrice: 0,
            deliveryTime: '',
            status: 'pending',
          },
        ];
        setEquipments(prev => [...prev, ...importedEquipments]);
        message.success('导入成功');
      },
    });
  };

  const handleExportExcel = () => {
    const data = equipments.map(e => ({
      设备编号: e.id,
      设备名称: e.name,
      规格型号: e.model,
      技术规格: e.spec,
      数量: e.quantity,
      单位: e.unit,
      制造厂家: e.manufacturer,
      联系人: e.contact,
      联系电话: e.phone,
      单价: e.unitPrice,
      总价: e.totalPrice,
      交货期: e.deliveryTime,
      状态: getStatusText(e.status),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '设备采购清单');
    XLSX.writeFile(wb, `设备采购清单_${currentProject?.name || '项目'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success('导出成功');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'default',
      quoted: 'processing',
      ordered: 'warning',
      delivered: 'success',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: '待询价',
      quoted: '已报价',
      ordered: '已下单',
      delivered: '已到货',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: '设备编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      fixed: 'left' as const,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '规格型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
    },
    {
      title: '技术规格',
      dataIndex: 'spec',
      key: 'spec',
      width: 200,
      ellipsis: true,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
      align: 'center' as const,
    },
    {
      title: '制造厂家',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 150,
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '单价(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right' as const,
      render: (price: number) => price.toLocaleString(),
    },
    {
      title: '总价(元)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      align: 'right' as const,
      render: (price: number) => <Text strong style={{ color: '#1890ff' }}>¥{price.toLocaleString()}</Text>,
    },
    {
      title: '交货期',
      dataIndex: 'deliveryTime',
      key: 'deliveryTime',
      width: 110,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      align: 'center' as const,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Equipment) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const totalAmount = equipments.reduce((sum: number, e: Equipment) => sum + e.totalPrice, 0);
  const totalQuantity = equipments.reduce((sum: number, e: Equipment) => sum + e.quantity, 0);
  const deliveredCount = equipments.filter((e: Equipment) => e.status === 'delivered').length;
  const orderedCount = equipments.filter((e: Equipment) => e.status === 'ordered').length;

  return (
    <PageContainer>
    <div>
      <Title level={2}>
        <ShoppingCartOutlined /> 设备采购管理 (P)
      </Title>
      <Text type="secondary">
        {currentProject ? `当前项目: ${currentProject.name}` : '请选择项目'}
      </Text>

      <Divider />

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="设备总数"
              value={totalQuantity}
              suffix="件"
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="采购总额"
              value={totalAmount}
              prefix="¥"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已到货"
              value={deliveredCount}
              suffix={`/ ${equipments.length}`}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="运输中"
              value={orderedCount}
              suffix={`/ ${equipments.length}`}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作栏和表格 */}
      <Card
        title="设备采购清单"
        extra={
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加设备
            </Button>
            <Button icon={<ImportOutlined />} onClick={handleImportFromSelection}>
              从选型系统导入
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
              导出Excel
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={equipments}
          rowKey="id"
          scroll={{ x: 1800 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 添加/编辑对话框 */}
      <Modal
        title={editingEquipment ? '编辑设备' : '添加设备'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="设备名称"
                rules={[{ required: true, message: '请输入设备名称' }]}
              >
                <Input placeholder="例如：离心泵" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="model"
                label="规格型号"
                rules={[{ required: true, message: '请输入规格型号' }]}
              >
                <Input placeholder="例如：IS80-50-200" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="spec"
            label="技术规格"
            rules={[{ required: true, message: '请输入技术规格' }]}
          >
            <TextArea rows={2} placeholder="例如：流量50m³/h，扬程32m" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Input placeholder="台/套/件" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="manufacturer"
            label="制造厂家"
            rules={[{ required: true, message: '请输入制造厂家' }]}
          >
            <Input placeholder="厂家名称" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contact" label="联系人">
                <Input placeholder="联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="联系电话">
                <Input placeholder="联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unitPrice"
                label="单价(元)"
                rules={[{ required: true, message: '请输入单价' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" precision={2} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="deliveryTime" label="交货期">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="状态" initialValue="pending">
            <Select>
              <Select.Option value="pending">待询价</Select.Option>
              <Select.Option value="quoted">已报价</Select.Option>
              <Select.Option value="ordered">已下单</Select.Option>
              <Select.Option value="delivered">已到货</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="remarks" label="备注">
            <TextArea rows={2} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </PageContainer>
  );
};

export default ProcurementManagement;
