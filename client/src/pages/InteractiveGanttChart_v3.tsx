import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Card, Button, Space, message, Modal, Form, DatePicker,
  InputNumber, Select, Table, Popconfirm, Row, Col, Tag, Spin, Input
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ReloadOutlined, DownloadOutlined,
  UploadOutlined
} from '@ant-design/icons';
import Gantt from 'frappe-gantt';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { useProject } from '../contexts/ProjectContext';
import './GanttChart.css';

interface Task {
  id: string;
  task_id?: string;
  name: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  priority: string;
  assignee: string;
  project_id?: string;
  dependencies?: string;
}

const { RangePicker } = DatePicker;

const InteractiveGanttChart: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<string>('Day');
  const [form] = Form.useForm();
  const ganttRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentProject } = useProject();

  const setDemoData = useCallback(() => {
    const today = dayjs();
    const demoTasks: Task[] = [
      {
        id: 'T-001',
        name: '反应釜基础施工',
        start_date: today.subtract(10, 'day').format('YYYY-MM-DD'),
        end_date: today.add(5, 'day').format('YYYY-MM-DD'),
        progress: 100,
        status: 'completed',
        priority: 'high',
        assignee: '张工',
        project_id: currentProject?.id || 'CHEM-2024-001',
        dependencies: ''
      },
      {
        id: 'T-002',
        name: '反应釜设备吊装',
        start_date: today.format('YYYY-MM-DD'),
        end_date: today.add(20, 'day').format('YYYY-MM-DD'),
        progress: 45,
        status: 'in_progress',
        priority: 'high',
        assignee: '李工',
        project_id: currentProject?.id || 'CHEM-2024-001',
        dependencies: 'T-001'
      },
      {
        id: 'T-003',
        name: '管道系统安装',
        start_date: today.subtract(5, 'day').format('YYYY-MM-DD'),
        end_date: today.add(35, 'day').format('YYYY-MM-DD'),
        progress: 30,
        status: 'in_progress',
        priority: 'medium',
        assignee: '王工',
        project_id: currentProject?.id || 'CHEM-2024-001',
        dependencies: ''
      },
      {
        id: 'T-004',
        name: '电气系统布线',
        start_date: today.add(5, 'day').format('YYYY-MM-DD'),
        end_date: today.add(25, 'day').format('YYYY-MM-DD'),
        progress: 0,
        status: 'pending',
        priority: 'high',
        assignee: '赵工',
        project_id: currentProject?.id || 'CHEM-2024-001',
        dependencies: 'T-002'
      },
    ];
    setTasks(demoTasks);
  }, [currentProject]);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const url = 'http://localhost:8000/api/v1/tasks/';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        let tasksData = data.map((task: any) => ({
          ...task,
          id: task.task_id || task.id?.toString() || `T-${task.id}`,
          task_id: task.task_id || `TASK-${task.id}`,
          project_id: task.project_id || 'CHEM-2024-001',
          dependencies: Array.isArray(task.dependencies) ? task.dependencies.join(', ') : ''
        }));
        
        if (currentProject) {
          tasksData = tasksData.filter((t: any) => t.project_id === currentProject.id);
        }
        
        if (tasksData.length === 0) {
          setDemoData();
        } else {
          setTasks(tasksData);
        }
      } else {
        setDemoData();
      }
    } catch (error) {
      console.error('加载失败:', error);
      setDemoData();
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, setDemoData]);

  const renderGantt = useCallback(() => {
    if (!ganttRef.current || tasks.length === 0) {
      console.log('Gantt渲染条件不满足:', { hasRef: !!ganttRef.current, tasksLength: tasks.length });
      return;
    }

    try {
      // 过滤任务
      let filteredTasks = tasks;
      if (filterStatus !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.status === filterStatus);
      }
      if (filterPriority !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === filterPriority);
      }

      if (filteredTasks.length === 0) {
        console.log('过滤后无任务');
        return;
      }

      // 转换为Frappe Gantt格式
      const ganttTasks = filteredTasks.map(task => ({
        id: task.id,
        name: task.name,
        start: task.start_date,
        end: task.end_date,
        progress: task.progress,
        dependencies: task.dependencies || '',
        custom_class: `status-${task.status}`
      }));

      // 清空旧实例
      if (ganttInstance.current) {
        try {
          ganttInstance.current.clear();
        } catch (e) {
          console.log('清空旧实例失败，忽略');
        }
        ganttInstance.current = null;
      }

      // 确保容器干净
      ganttRef.current.innerHTML = '';
      
      // 创建新实例
      ganttInstance.current = new Gantt(ganttRef.current, ganttTasks, {
        header_height: 60,
        column_width: 35,
        step: 24,
        view_modes: ['Day', 'Week', 'Month'],
        bar_height: 35,
        bar_corner_radius: 2,
        arrow_curve: 5,
        padding: 20,
        view_mode: viewMode,
        date_format: 'YYYY-MM-DD',
        language: 'zh',
        popup_trigger: 'click',
        custom_popup_html: function(task: any) {
          const taskData = tasks.find(t => t.id === task.id);
          const statusText = taskData?.status === 'completed' ? '✅ 已完成' : 
                            taskData?.status === 'in_progress' ? '🔄 进行中' : 
                            '⏸️ 待开始';
          const priorityText = taskData?.priority === 'high' ? '🔴 高' : 
                              taskData?.priority === 'medium' ? '🟡 中' : 
                              '🟢 低';
          return `
            <div style="padding: 10px; font-family: Arial, sans-serif;">
              <div style="font-size: 14px; font-weight: bold; color: #262626; margin-bottom: 8px;">
                ${task.name}
              </div>
              <div style="font-size: 12px; color: #595959; line-height: 1.6;">
                <div><strong>负责人:</strong> ${taskData?.assignee || '未分配'}</div>
                <div><strong>进度:</strong> <span style="color: #1890ff; font-weight: 600;">${task.progress}%</span></div>
                <div><strong>开始:</strong> ${task._start.format('YYYY-MM-DD')}</div>
                <div><strong>结束:</strong> ${task._end.format('YYYY-MM-DD')}</div>
                <div><strong>工期:</strong> ${task._end.diff(task._start, 'day') + 1} 天</div>
                <div><strong>状态:</strong> ${statusText}</div>
                <div><strong>优先级:</strong> ${priorityText}</div>
              </div>
            </div>
          `;
        }
      });
      
      console.log('✅ Gantt图渲染成功');
    } catch (error) {
      console.error('❌ Gantt图渲染失败:', error);
      message.error('甘特图渲染失败，请刷新页面重试');
    }
  }, [tasks, filterStatus, filterPriority, viewMode]);

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    if (ganttInstance.current) {
      ganttInstance.current.change_view_mode(mode);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (tasks.length > 0 && ganttRef.current) {
      // 使用requestAnimationFrame确保DOM完全就绪
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          renderGantt();
        });
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [tasks, renderGantt]);

  const handleAddTask = () => {
    form.resetFields();
    setIsEditMode(false);
    setSelectedTask(null);
    form.setFieldsValue({
      status: 'pending',
      priority: 'medium',
      progress: 0,
      dateRange: [dayjs(), dayjs().add(7, 'day')]
    });
    setIsModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditMode(true);
    form.setFieldsValue({
      name: task.name,
      assignee: task.assignee,
      priority: task.priority,
      status: task.status,
      progress: task.progress,
      dateRange: [dayjs(task.start_date), dayjs(task.end_date)],
      dependencies: task.dependencies
    });
    setIsModalVisible(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    message.success('任务已删除');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.dateRange;

      const taskData = {
        name: values.name,
        start_date: start.format('YYYY-MM-DD'),
        end_date: end.format('YYYY-MM-DD'),
        assignee: values.assignee,
        priority: values.priority,
        status: values.status,
        progress: Number(values.progress) || 0,
        project_id: currentProject?.id || 'CHEM-2024-001',
        dependencies: values.dependencies || ''
      };

      if (isEditMode && selectedTask) {
        const updatedTasks = tasks.map(t =>
          t.id === selectedTask.id ? { ...t, ...taskData } : t
        );
        setTasks(updatedTasks);
        message.success('任务已更新');
      } else {
        const newTask: Task = {
          id: `T-${Date.now()}`,
          ...taskData
        };
        setTasks([...tasks, newTask]);
        message.success('任务已添加');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('请检查表单填写');
    }
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      const importedTasks: Task[] = jsonData.map((row, index) => ({
        id: `T-${Date.now()}-${index}`,
        name: row['任务名称'] || `任务${index + 1}`,
        start_date: dayjs(row['开始日期']).format('YYYY-MM-DD'),
        end_date: dayjs(row['结束日期']).format('YYYY-MM-DD'),
        assignee: row['负责人'] || '未指定',
        priority: row['优先级'] || 'medium',
        status: row['状态'] || 'pending',
        progress: Number(row['进度']) || 0,
        project_id: currentProject?.id || 'CHEM-2024-001',
        dependencies: ''
      }));

      setTasks([...tasks, ...importedTasks]);
      message.success(`成功导入 ${importedTasks.length} 个任务`);
      event.target.value = '';
    } catch (error) {
      message.error('导入失败，请检查Excel格式');
    }
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100,
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 120,
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 120,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const colorMap: Record<string, string> = {
          high: 'red',
          medium: 'orange',
          low: 'default'
        };
        return <Tag color={colorMap[priority]}>{priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          pending: { text: '待开始', color: 'default' },
          in_progress: { text: '进行中', color: 'processing' },
          completed: { text: '已完成', color: 'success' }
        };
        const s = statusMap[status] || statusMap.pending;
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 100,
      render: (progress: number) => `${progress}%`
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Task) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditTask(record)} />
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteTask(record.id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={isLoading} tip="加载任务数据中...">
      <div style={{ padding: 16, background: '#f5f7fa', minHeight: '100vh' }}>
        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: '12px 16px' } }}>
          <Row align="middle" gutter={16}>
            <Col flex="auto">
              <Space size="large">
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b' }}>
                  📊 施工甘特图 {currentProject && `- ${currentProject.name}`}
                </span>
                <Space size="middle">
                  <span>总数 <Tag color="blue">{tasks.length}</Tag></span>
                  <span>进行中 <Tag color="orange">{tasks.filter(t => t.status === 'in_progress').length}</Tag></span>
                  <span>已完成 <Tag color="green">{tasks.filter(t => t.status === 'completed').length}</Tag></span>
                </Space>
              </Space>
            </Col>
            <Col>
              <Space size="small">
                <Button icon={<UploadOutlined />} onClick={handleImportExcel}>导入Excel</Button>
                <Button icon={<DownloadOutlined />} type="primary">导出PDF</Button>
              </Space>
            </Col>
          </Row>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </Card>

        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
          <Row align="middle" gutter={8} style={{ marginBottom: 16 }}>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTask}>添加任务</Button>
            </Col>
            <Col>
              <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 100 }}>
                <Select.Option value="all">全部状态</Select.Option>
                <Select.Option value="pending">待开始</Select.Option>
                <Select.Option value="in_progress">进行中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
              </Select>
            </Col>
            <Col>
              <Select value={filterPriority} onChange={setFilterPriority} style={{ width: 110 }}>
                <Select.Option value="all">全部优先级</Select.Option>
                <Select.Option value="high">高</Select.Option>
                <Select.Option value="medium">中</Select.Option>
                <Select.Option value="low">低</Select.Option>
              </Select>
            </Col>
            <Col>
              <Space.Compact>
                <Button 
                  type={viewMode === 'Day' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => handleViewModeChange('Day')}
                >
                  日
                </Button>
                <Button 
                  type={viewMode === 'Week' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => handleViewModeChange('Week')}
                >
                  周
                </Button>
                <Button 
                  type={viewMode === 'Month' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => handleViewModeChange('Month')}
                >
                  月
                </Button>
              </Space.Compact>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={loadTasks} />
            </Col>
          </Row>

          <div 
            ref={ganttRef} 
            className="gantt-container" 
            style={{ 
              minHeight: 500, 
              border: '1px solid #e8e8e8',
              borderRadius: 4,
              background: '#fff',
              padding: 20
            }} 
          />
        </Card>

        <Card title={`任务列表（共 ${tasks.length} 项）`} style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1200 }}
          />
        </Card>

        <Modal
          title={isEditMode ? "编辑任务" : "添加任务"}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="任务名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="dateRange" label="工期" rules={[{ required: true }]}>
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="assignee" label="负责人" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="high">高</Select.Option>
                    <Select.Option value="medium">中</Select.Option>
                    <Select.Option value="low">低</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="pending">待开始</Select.Option>
                    <Select.Option value="in_progress">进行中</Select.Option>
                    <Select.Option value="completed">已完成</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="progress" label="进度 (%)" rules={[{ required: true }]}>
                  <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="dependencies" label="依赖任务">
              <Input placeholder="输入依赖任务ID，多个用逗号分隔" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
};

export default InteractiveGanttChart;

