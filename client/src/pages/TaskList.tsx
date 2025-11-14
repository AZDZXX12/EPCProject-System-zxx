import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Progress,
  Empty,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Dropdown,
  message,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useProject } from '../contexts/ProjectContext';
import PageContainer from '../components/Layout/PageContainer';
import dayjs from 'dayjs';

import { taskApi } from '../services/api';
import './TaskList.css';

interface Task {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  priority: string;
  assignee: string;
  project_id?: string;
}

const TaskList: React.FC = () => {
  const { currentProject } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const loadTasks = async () => {
    if (!currentProject) return;

    try {
      const data = await taskApi.getAll(currentProject.id);
      setTasks(data as any);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      message.error('加载任务失败');
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  const showModal = (task?: Task) => {
    setEditingTask(task || null);
    if (task) {
      form.setFieldsValue({
        ...task,
        start_date: dayjs(task.start_date),
        end_date: dayjs(task.end_date),
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const taskData = {
        ...values,
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
        project_id: currentProject?.id,
      };

      if (editingTask) {
        await taskApi.update(editingTask.id, taskData);
        message.success('任务更新成功');
        loadTasks();
      } else {
        await taskApi.create(taskData);
        message.success('任务创建成功');
        loadTasks();
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to save task:', error);
      message.error('保存任务失败');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await taskApi.delete(taskId);
      message.success('任务删除成功');
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      message.error('删除任务失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      pending: 'default',
      in_progress: 'processing',
      completed: 'success',
      blocked: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: '待开始',
      in_progress: '进行中',
      completed: '已完成',
      blocked: '已阻塞',
    };
    return texts[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: '#ff4d4f',
      medium: '#faad14',
      low: '#52c41a',
    };
    return colors[priority] || '#d9d9d9';
  };

  const getPriorityText = (priority: string) => {
    const texts: Record<string, string> = {
      high: '高优先级',
      medium: '中优先级',
      low: '低优先级',
    };
    return texts[priority] || priority;
  };

  const getTaskMenu = (task: Task) => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑',
        onClick: () => showModal(task),
      },
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: '查看详情',
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个任务吗？',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => handleDelete(task.id),
          });
        },
      },
    ],
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  if (!currentProject) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="请先选择一个项目" />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="task-list-container">
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="总任务数"
                value={taskStats.total}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="待开始"
                value={taskStats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="进行中"
                value={taskStats.inProgress}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="已完成"
                value={taskStats.completed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 操作栏 */}
        <Card style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="middle">
                <span style={{ color: '#8c8c8c' }}>筛选:</span>
                <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 120 }}>
                  <Select.Option value="all">全部状态</Select.Option>
                  <Select.Option value="pending">待开始</Select.Option>
                  <Select.Option value="in_progress">进行中</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                </Select>
                <Select value={filterPriority} onChange={setFilterPriority} style={{ width: 120 }}>
                  <Select.Option value="all">全部优先级</Select.Option>
                  <Select.Option value="high">高优先级</Select.Option>
                  <Select.Option value="medium">中优先级</Select.Option>
                  <Select.Option value="low">低优先级</Select.Option>
                </Select>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={loadTasks}>
                  刷新
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                  新建任务
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 任务卡片列表 */}
        {filteredTasks.length === 0 ? (
          <Empty description="暂无任务数据" />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredTasks.map((task) => (
              <Col xs={24} sm={12} md={8} lg={6} key={task.id}>
                <Card
                  className="task-card"
                  hoverable
                  actions={[
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal(task)}>
                      编辑
                    </Button>,
                    <Dropdown menu={getTaskMenu(task)} trigger={['click']}>
                      <Button type="text" icon={<MoreOutlined />}>
                        更多
                      </Button>
                    </Dropdown>,
                  ]}
                >
                  <div style={{ marginBottom: 12 }}>
                    <Space>
                      <Tag color={getStatusColor(task.status)}>{getStatusText(task.status)}</Tag>
                      <Tag icon={<FireOutlined />} color={getPriorityColor(task.priority)}>
                        {getPriorityText(task.priority)}
                      </Tag>
                    </Space>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{task.name}</h3>
                    {task.description && (
                      <p style={{ fontSize: 13, color: '#8c8c8c', marginTop: 8, marginBottom: 0 }}>
                        {task.description.length > 50
                          ? task.description.substring(0, 50) + '...'
                          : task.description}
                      </p>
                    )}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>进度</div>
                    <Progress
                      percent={task.progress}
                      size="small"
                      strokeColor={{
                        '0%': '#1890ff',
                        '100%': '#52c41a',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <Space size={4}>
                      <UserOutlined style={{ color: '#8c8c8c' }} />
                      <span style={{ fontSize: 12, color: '#595959' }}>
                        {task.assignee || '未分配'}
                      </span>
                    </Space>
                    <Space size={4}>
                      <CalendarOutlined style={{ color: '#8c8c8c' }} />
                      <span style={{ fontSize: 12, color: '#595959' }}>
                        {dayjs(task.end_date).format('MM/DD')}
                      </span>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* 新建/编辑任务模态框 */}
        <Modal
          title={editingTask ? '编辑任务' : '新建任务'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="任务名称"
              name="name"
              rules={[{ required: true, message: '请输入任务名称' }]}
            >
              <Input placeholder="请输入任务名称" />
            </Form.Item>

            <Form.Item label="任务描述" name="description">
              <Input.TextArea rows={3} placeholder="请输入任务描述" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="开始日期"
                  name="start_date"
                  rules={[{ required: true, message: '请选择开始日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="结束日期"
                  name="end_date"
                  rules={[{ required: true, message: '请选择结束日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="进度"
                  name="progress"
                  rules={[{ required: true, message: '请输入进度' }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value: any) => value.replace('%', '')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="状态"
                  name="status"
                  rules={[{ required: true, message: '请选择状态' }]}
                >
                  <Select placeholder="请选择状态">
                    <Select.Option value="pending">待开始</Select.Option>
                    <Select.Option value="in_progress">进行中</Select.Option>
                    <Select.Option value="completed">已完成</Select.Option>
                    <Select.Option value="blocked">已阻塞</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="优先级"
                  name="priority"
                  rules={[{ required: true, message: '请选择优先级' }]}
                >
                  <Select placeholder="请选择优先级">
                    <Select.Option value="high">高优先级</Select.Option>
                    <Select.Option value="medium">中优先级</Select.Option>
                    <Select.Option value="low">低优先级</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="负责人"
              name="assignee"
              rules={[{ required: true, message: '请输入负责人' }]}
            >
              <Input placeholder="请输入负责人姓名" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </PageContainer>
  );
};

export default TaskList;
