
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Progress, Modal, Form, Input, Select, DatePicker, Badge, Statistic, Row, Col, Alert } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  WarningOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  SyncOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useProject } from '../contexts/ProjectContext';

const { Option } = Select;

interface Device {
  id: number;
  device_id: string;
  name: string;
  type: string;
  status: string;
  installation_progress: number;
  location: string;
  assigned_task: string;
  start_date: string;
  expected_completion: string;
  responsible_person: string;
  project_id?: string; // 🔧 添加项目ID字段
}

const DeviceManagement: React.FC = () => {
  const { currentProject } = useProject();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听项目切换
  useEffect(() => {
    if (currentProject) {
      console.log(`🔄 项目切换至: ${currentProject.name}，重新加载设备...`);
      loadDevices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  const loadDevices = async () => {
    if (!currentProject) {
      setDevices([]);
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      // 🔧 修复：直接按项目ID过滤
      const url = `http://localhost:8000/api/v1/devices/?project_id=${currentProject.id}`;
      
      console.log(`🔄 加载设备中... URL: ${url}`);
      console.log(`📌 当前项目: ${currentProject.name} (ID: ${currentProject.id})`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📦 收到后端数据: ${data.length} 条`, data);
        
        if (data.length === 0) {
          console.log('⚠️ 没有设备数据，使用演示数据');
          // 使用演示数据（添加project_id字段）
          setDevices([
          {
            id: 1,
            device_id: `${currentProject.id}-DEV-001`,
            name: '聚合反应釜',
            type: '反应设备',
            status: 'installing',
            installation_progress: 90,
            location: '车间A-1区',
            assigned_task: '反应釜安装就位',
            start_date: '2024-01-18',
            expected_completion: '2024-02-05',
            responsible_person: '王五',
            project_id: currentProject.id,
          },
          {
            id: 2,
            device_id: `${currentProject.id}-DEV-002`,
            name: '列管式换热器',
            type: '换热设备',
            status: 'installing',
            installation_progress: 75,
            location: '车间A-2区',
            assigned_task: '换热器组安装',
            start_date: '2024-01-25',
            expected_completion: '2024-02-15',
            responsible_person: '赵六',
            project_id: currentProject.id,
          },
          {
            id: 3,
            device_id: `${currentProject.id}-DEV-003`,
            name: '离心泵',
            type: '泵类设备',
            status: 'installed',
            installation_progress: 100,
            location: '泵房一',
            assigned_task: '泵类设备安装',
            start_date: '2024-01-10',
            expected_completion: '2024-01-25',
            responsible_person: '李四',
            project_id: currentProject.id,
          },
          {
            id: 4,
            device_id: `${currentProject.id}-DEV-004`,
            name: '原料储罐',
            type: '储罐设备',
            status: 'installing',
            installation_progress: 85,
            location: '储罐区A',
            assigned_task: '储罐安装',
            start_date: '2024-01-15',
            expected_completion: '2024-02-10',
            responsible_person: '孙七',
            project_id: currentProject.id,
          },
          {
            id: 5,
            device_id: `${currentProject.id}-DEV-005`,
            name: '压缩机',
            type: '压缩设备',
            status: 'installing',
            installation_progress: 60,
            location: '车间B-1区',
            assigned_task: '压缩机安装',
            start_date: '2024-02-01',
            expected_completion: '2024-02-20',
            responsible_person: '周八',
            project_id: currentProject.id,
          },
          {
            id: 6,
            device_id: `${currentProject.id}-DEV-006`,
            name: '气液分离器',
            type: '分离设备',
            status: 'delayed',
            installation_progress: 45,
            location: '车间A-3区',
            assigned_task: '分离设备安装',
            start_date: '2024-01-20',
            expected_completion: '2024-01-30',
            responsible_person: '吴九',
            project_id: currentProject.id,
          },
          {
            id: 7,
            device_id: `${currentProject.id}-DEV-007`,
            name: '真空泵',
            type: '泵类设备',
            status: 'installing',
            installation_progress: 70,
            location: '泵房二',
            assigned_task: '泵类设备安装',
            start_date: '2024-01-28',
            expected_completion: '2024-02-15',
            responsible_person: '郑十',
            project_id: currentProject.id,
          },
          {
            id: 8,
            device_id: `${currentProject.id}-DEV-008`,
            name: '精馏塔',
            type: '塔类设备',
            status: 'pending',
            installation_progress: 30,
            location: '车间C-1区',
            assigned_task: '塔类设备安装',
            start_date: '2024-02-05',
            expected_completion: '2024-02-28',
            responsible_person: '刘一',
            project_id: currentProject.id,
          },
        ]);
        console.log('✅ 演示数据已加载: 8 个设备');
      } else {
        setDevices(Array.isArray(data) ? data : []);
        console.log(`✅ 设备已加载: ${data.length} 个`);
      }
    }
    } catch (err) {
      console.error('⚠️ 连接失败:', err);
      // 使用演示数据
      setDevices([
        {
          id: 1,
          device_id: 'CHEM-R-001',
          name: '聚合反应釜',
          type: '反应设备',
          status: 'installing',
          installation_progress: 90,
          location: '车间A-1区',
          assigned_task: 'TASK-001',
          start_date: '2024-01-01',
          expected_completion: '2024-02-05',
          responsible_person: '张工',
        },
        {
          id: 2,
          device_id: 'CHEM-H-001',
          name: '列管式换热器',
          type: '换热设备',
          status: 'installing',
          installation_progress: 75,
          location: '车间A-2区',
          assigned_task: 'TASK-002',
          start_date: '2024-01-10',
          expected_completion: '2024-02-15',
          responsible_person: '李工',
        },
        {
          id: 3,
          device_id: 'CHEM-P-001',
          name: '离心泵',
          type: '泵类设备',
          status: 'installed',
          installation_progress: 100,
          location: '泵房一',
          assigned_task: 'TASK-003',
          start_date: '2024-01-05',
          expected_completion: '2024-01-25',
          responsible_person: '王工',
        },
        {
          id: 4,
          device_id: 'CHEM-T-001',
          name: '原料储罐',
          type: '储罐设备',
          status: 'installing',
          installation_progress: 85,
          location: '储罐区A',
          assigned_task: 'TASK-004',
          start_date: '2024-01-15',
          expected_completion: '2024-02-10',
          responsible_person: '赵工',
        },
        {
          id: 5,
          device_id: 'CHEM-C-001',
          name: '压缩机',
          type: '压缩设备',
          status: 'installing',
          installation_progress: 60,
          location: '车间B-1区',
          assigned_task: 'TASK-005',
          start_date: '2024-02-01',
          expected_completion: '2024-02-20',
          responsible_person: '刘工',
        },
      ]);
      console.log('✅ 演示数据已加载: 5 个设备');
    } finally {
      setLoading(false);
    }
  };

  const installedDevices = devices.filter(d => d.installation_progress === 100).length;
  const inProgressDevices = devices.filter(d => d.installation_progress > 0 && d.installation_progress < 100).length;
  const delayedDevices = devices.filter(d => {
    const expected = new Date(d.expected_completion);
    const today = new Date();
    return d.installation_progress < 100 && expected < today;
  }).length;

  const columns = [
    {
      title: '设备编号',
      dataIndex: 'device_id',
      key: 'device_id',
      width: 120,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const colorMap: any = {
          '反应设备': 'red',
          '换热设备': 'orange',
          '泵类设备': 'blue',
          '储罐设备': 'purple',
          '压缩设备': 'cyan',
          '分离设备': 'green',
          '塔类设备': 'magenta',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '安装进度',
      dataIndex: 'installation_progress',
      key: 'installation_progress',
      width: 200,
      render: (progress: number, record: Device) => {
        const expected = new Date(record.expected_completion);
        const today = new Date();
        const isDelayed = progress < 100 && expected < today;
        
        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Progress 
              percent={progress} 
              size="small"
              status={isDelayed ? 'exception' : progress === 100 ? 'success' : 'active'}
            />
            {isDelayed && (
              <span style={{ fontSize: 12, color: '#ff4d4f' }}>
                <WarningOutlined /> 已延期
              </span>
            )}
          </Space>
        );
      },
    },
    {
      title: '安装位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '关联任务',
      dataIndex: 'assigned_task',
      key: 'assigned_task',
      width: 180,
      render: (task: string) => (
        <Tag color="processing">{task}</Tag>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'responsible_person',
      key: 'responsible_person',
      width: 100,
    },
    {
      title: '预计完成',
      dataIndex: 'expected_completion',
      key: 'expected_completion',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config: any = {
          installed: { color: 'success', text: '已安装' },
          installing: { color: 'processing', text: '安装中' },
          pending: { color: 'default', text: '待安装' },
          delayed: { color: 'error', text: '延期' },
        };
        return <Tag color={config[status]?.color}>{config[status]?.text || status}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Device) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>设备安装管理 (C)</h1>
        <Space>
          <Button icon={<SyncOutlined />} onClick={loadDevices}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            添加设备
          </Button>
        </Space>
      </div>

      {/* 当前项目提示 */}
      {currentProject && (
        <Alert
          message={
            <Space>
              <ProjectOutlined />
              <span>当前项目: <strong>{currentProject.name}</strong></span>
              <Tag color={currentProject.status === 'in_progress' ? 'green' : 'blue'}>
                {currentProject.status === 'in_progress' ? '进行中' : '规划中'}
              </Tag>
            </Space>
          }
          description={`显示该项目的所有设备信息。项目进度: ${currentProject.progress}%`}
          type="info"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={<span style={{ fontSize: 14, color: '#666' }}>设备总数</span>}
              value={devices.length}
              prefix={<ToolOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 'bold' }}
              suffix="台"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={<span style={{ fontSize: 14, color: '#666' }}>已安装</span>}
              value={installedDevices}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 'bold' }}
              suffix="台"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={<span style={{ fontSize: 14, color: '#666' }}>安装中</span>}
              value={inProgressDevices}
              prefix={<SyncOutlined spin style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 'bold' }}
              suffix="台"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Badge count={delayedDevices} offset={[-10, 10]}>
              <Statistic
                title={<span style={{ fontSize: 14, color: '#666' }}>延期预警</span>}
                value={delayedDevices}
                prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f', fontSize: 32, fontWeight: 'bold' }}
                suffix="台"
              />
            </Badge>
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <Space>
            <span style={{ fontSize: 16, fontWeight: 600 }}>设备清单</span>
            <Badge count={devices.length} showZero style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={devices}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `共 ${total} 台设备`,
            showSizeChanger: true,
          }}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Modal
        title="添加设备"
        open={modalVisible}
        onOk={() => {
          form.validateFields().then(values => {
            console.log('添加设备:', values);
            setModalVisible(false);
            form.resetFields();
          });
        }}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="设备名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item label="设备类型" name="type" rules={[{ required: true }]}>
            <Select placeholder="请选择设备类型">
              <Option value="反应设备">反应设备</Option>
              <Option value="换热设备">换热设备</Option>
              <Option value="泵类设备">泵类设备</Option>
              <Option value="储罐设备">储罐设备</Option>
              <Option value="压缩设备">压缩设备</Option>
              <Option value="分离设备">分离设备</Option>
              <Option value="塔类设备">塔类设备</Option>
              <Option value="干燥设备">干燥设备</Option>
            </Select>
          </Form.Item>
          <Form.Item label="安装位置" name="location" rules={[{ required: true }]}>
            <Input placeholder="请输入安装位置" />
          </Form.Item>
          <Form.Item label="关联任务" name="assigned_task">
            <Select placeholder="选择关联的施工任务">
              <Option value="反应釜安装就位">反应釜安装就位</Option>
              <Option value="换热器组安装">换热器组安装</Option>
              <Option value="管道预制及安装">管道预制及安装</Option>
              <Option value="电气仪表安装">电气仪表安装</Option>
              <Option value="泵类设备安装">泵类设备安装</Option>
              <Option value="储罐安装">储罐安装</Option>
              <Option value="压力试验">压力试验</Option>
            </Select>
          </Form.Item>
          <Form.Item label="负责人" name="responsible_person" rules={[{ required: true }]}>
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item label="预计完成日期" name="expected_completion" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceManagement;
