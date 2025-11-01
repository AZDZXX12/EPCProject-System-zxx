
import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Modal, Form, Input, DatePicker, 
  Select, message, Tag, Upload, Row, Col, Statistic
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UploadOutlined, FileImageOutlined,
  CheckCircleOutlined, ClockCircleOutlined, 
  ToolOutlined, SafetyOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useProject } from '../contexts/ProjectContext';
import { eventBus, EVENTS, LogEventData } from '../utils/EventBus';
import { StorageManager } from '../utils/StorageManager';

const { TextArea } = Input;

interface ConstructionLog {
  id: string;
  log_id?: string;
  date: string;
  task_id?: string;
  task_name: string;
  weather: string;
  temperature: string;
  work_content: string;
  worker_count: number;
  equipment_used: string;
  material_used: string;
  progress_today: number;
  issues: string;
  safety_check: string;
  photos: string[];
  reporter: string;
  project_id?: string;
}

const ConstructionLog: React.FC = () => {
  const [logs, setLogs] = useState<ConstructionLog[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ConstructionLog | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { currentProject } = useProject();
  
  // 🆕 任务列表（从甘特图加载）
  const [availableTasks, setAvailableTasks] = useState<Array<{id: string; name: string; progress: number}>>([]);

  useEffect(() => {
    loadLogs();
    loadAvailableTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  // 🆕 加载可用任务列表
  const loadAvailableTasks = async () => {
    if (!currentProject) {
      setAvailableTasks([]);
      return;
    }
    
    try {
      // 尝试从LocalStorage加载甘特图任务
      const cacheKey = `gantt_tasks_${currentProject.id}`;
      const cachedData = StorageManager.load(cacheKey);
      
      if (cachedData && cachedData.data) {
        const tasks = cachedData.data.map((task: any) => ({
          id: task.id,
          name: task.text || task.name,
          progress: Math.round((task.progress || 0) * 100)
        }));
        setAvailableTasks(tasks);
      } else {
        // 尝试从API加载
        const response = await fetch(`http://localhost:8000/api/v1/tasks?project_id=${currentProject.id}`);
        if (response.ok) {
          const tasks = await response.json();
          setAvailableTasks(tasks.map((t: any) => ({
            id: t.id,
            name: t.name,
            progress: t.progress || 0
          })));
        }
      }
    } catch (error) {
      console.warn('加载任务列表失败:', error);
      // 使用模拟数据
      setAvailableTasks([
        { id: `${currentProject.id}-TASK-1`, name: '项目启动', progress: 100 },
        { id: `${currentProject.id}-TASK-2`, name: '需求分析', progress: 80 },
        { id: `${currentProject.id}-TASK-3`, name: '概要设计', progress: 60 }
      ]);
    }
  };

  const loadLogs = async () => {
    if (!currentProject) {
      setLogs([]);
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/v1/construction-logs/?project_id=${currentProject.id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        // 使用演示数据
        setDemoData();
      }
    } catch (error) {
      console.error('加载施工日志失败:', error);
      setDemoData();
    } finally {
      setLoading(false);
    }
  };

  const setDemoData = () => {
    const today = dayjs();
    const demoLogs: ConstructionLog[] = [
      {
        id: 'LOG-001',
        date: today.format('YYYY-MM-DD'),
        task_name: '主体结构施工',
        weather: '晴',
        temperature: '18-25℃',
        work_content: '完成3层主体结构混凝土浇筑，进行钢筋绑扎施工',
        worker_count: 45,
        equipment_used: '塔吊2台、混凝土搅拌车3台',
        material_used: '混凝土120m³、钢筋8吨',
        progress_today: 15,
        issues: '无',
        safety_check: '已完成安全检查，无隐患',
        photos: [],
        reporter: '张工',
        project_id: currentProject?.id || 'CHEM-2024-001'
      },
      {
        id: 'LOG-002',
        date: today.subtract(1, 'day').format('YYYY-MM-DD'),
        task_name: '电气安装',
        weather: '多云',
        temperature: '16-23℃',
        work_content: '完成2层配电箱安装，铺设电缆桥架',
        worker_count: 12,
        equipment_used: '电焊机2台、切割机1台',
        material_used: '配电箱8个、电缆桥架50米',
        progress_today: 20,
        issues: '部分电缆规格需调整',
        safety_check: '已完成，提醒高空作业注意安全',
        photos: [],
        reporter: '李工',
        project_id: currentProject?.id || 'CHEM-2024-001'
      },
      {
        id: 'LOG-003',
        date: today.subtract(2, 'day').format('YYYY-MM-DD'),
        task_name: '管道安装',
        weather: '阴',
        temperature: '15-20℃',
        work_content: '完成工艺管道焊接，进行管道防腐处理',
        worker_count: 18,
        equipment_used: '焊接设备3套、吊车1台',
        material_used: '无缝钢管200米、防腐涂料50kg',
        progress_today: 18,
        issues: '焊接检测发现2处需返工',
        safety_check: '已完成，焊接作业安全措施到位',
        photos: [],
        reporter: '王工',
        project_id: currentProject?.id || 'CHEM-2024-001'
      }
    ];
    setLogs(demoLogs);
  };

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      date: dayjs(),
      task_name: '', // ✅ 必填
      weather: '晴', // ✅ 必填
      temperature: '15-25℃', // ✅ 必填，添加默认值
      worker_count: 10, // ✅ 必填，改为合理默认值
      work_content: '', // ✅ 必填
      progress_today: 0, // ✅ 必填
      reporter: localStorage.getItem('username') || '项目经理', // ✅ 必填
      equipment_used: '',
      material_used: '',
      issues: '无',
      safety_check: '已完成安全检查，无隐患'
    });
    setIsEditMode(false);
    setSelectedLog(null);
    setIsModalVisible(true);
  };

  const handleEdit = (log: ConstructionLog) => {
    setSelectedLog(log);
    setIsEditMode(true);
    form.setFieldsValue({
      ...log,
      date: dayjs(log.date)
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (logId: string) => {
    setLogs(logs.filter(l => l.id !== logId));
    message.success('删除成功');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const logData: ConstructionLog = {
        id: isEditMode && selectedLog ? selectedLog.id : `LOG-${Date.now()}`,
        date: values.date.format('YYYY-MM-DD'),
        task_id: values.task_id, // 关联的任务ID
        task_name: values.task_name,
        weather: values.weather,
        temperature: values.temperature,
        work_content: values.work_content,
        worker_count: values.worker_count,
        equipment_used: values.equipment_used || '',
        material_used: values.material_used || '',
        progress_today: values.progress_today,
        issues: values.issues || '无',
        safety_check: values.safety_check || '已完成',
        photos: [],
        reporter: values.reporter,
        project_id: currentProject?.id || 'CHEM-2024-001'
      };

      if (isEditMode && selectedLog) {
        const updatedLogs = logs.map(l => l.id === selectedLog.id ? logData : l);
        setLogs(updatedLogs);
        
        // 💾 持久化到本地存储
        StorageManager.save('construction_logs', updatedLogs);
        
        // 🔗 联动：发布日志更新事件
        eventBus.emit(EVENTS.LOG_UPDATED, {
          id: logData.id,
          projectId: logData.project_id,
          taskId: logData.task_id,
          date: logData.date,
          progress: logData.progress_today,
          content: logData.work_content
        } as LogEventData);
        
        message.success('修改成功');
      } else {
        const updatedLogs = [logData, ...logs];
        setLogs(updatedLogs);
        
        // 💾 持久化到本地存储
        StorageManager.save('construction_logs', updatedLogs);
        
        // 🔗 联动：发布日志创建事件
        eventBus.emit(EVENTS.LOG_CREATED, {
          id: logData.id,
          projectId: logData.project_id,
          taskId: logData.task_id,
          date: logData.date,
          progress: logData.progress_today,
          content: logData.work_content
        } as LogEventData);
        
        message.success('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const columns: ColumnsType<ConstructionLog> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      fixed: 'left',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date) => (
        <div>
          <div style={{ fontWeight: 500 }}>{dayjs(date).format('YYYY-MM-DD')}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{dayjs(date).format('dddd')}</div>
        </div>
      )
    },
    {
      title: '任务名称',
      dataIndex: 'task_name',
      key: 'task_name',
      width: 150,
      ellipsis: true
    },
    {
      title: '天气',
      dataIndex: 'weather',
      key: 'weather',
      width: 80,
      render: (weather) => {
        const weatherIcons: Record<string, string> = {
          '晴': '☀️',
          '多云': '⛅',
          '阴': '☁️',
          '雨': '🌧️',
          '雪': '❄️'
        };
        return <span>{weatherIcons[weather] || '🌤️'} {weather}</span>;
      }
    },
    {
      title: '温度',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 100
    },
    {
      title: '工作内容',
      dataIndex: 'work_content',
      key: 'work_content',
      width: 250,
      ellipsis: true
    },
    {
      title: '人员',
      dataIndex: 'worker_count',
      key: 'worker_count',
      width: 80,
      render: (count) => <Tag color="blue">{count}人</Tag>
    },
    {
      title: '进度',
      dataIndex: 'progress_today',
      key: 'progress_today',
      width: 100,
      sorter: (a, b) => a.progress_today - b.progress_today,
      render: (progress) => (
        <Tag color={progress >= 80 ? 'green' : progress >= 50 ? 'blue' : 'orange'}>
          +{progress}%
        </Tag>
      )
    },
    {
      title: '问题',
      dataIndex: 'issues',
      key: 'issues',
      width: 150,
      ellipsis: true,
      render: (issues) => (
        <span style={{ color: issues === '无' ? '#52c41a' : '#fa8c16' }}>
          {issues === '无' ? '✓ 无' : '⚠ ' + issues}
        </span>
      )
    },
    {
      title: '记录人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 统计数据
  const avgProgress = logs.length > 0 ? Math.round(logs.reduce((sum, log) => sum + log.progress_today, 0) / logs.length) : 0;
  const issueCount = logs.filter(log => log.issues !== '无').length;

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="今日施工记录" 
              value={logs.filter(l => l.date === dayjs().format('YYYY-MM-DD')).length}
              prefix={<FileImageOutlined />}
              suffix="条"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="累计施工天数" 
              value={logs.length}
              prefix={<ClockCircleOutlined />}
              suffix="天"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="平均日进度" 
              value={avgProgress}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="问题数量" 
              value={issueCount}
              prefix={<SafetyOutlined style={{ color: issueCount > 0 ? '#fa8c16' : '#52c41a' }} />}
              suffix="项"
              valueStyle={{ color: issueCount > 0 ? '#fa8c16' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <Space>
            <ToolOutlined />
            <span>📋 施工日志</span>
          </Space>
        }
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              添加日志
            </Button>
          </Space>
        }
      >
        <Table 
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title={isEditMode ? '编辑施工日志' : '添加施工日志'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="施工日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                  presets={[
                    { label: '今天', value: dayjs() },
                    { label: '昨天', value: dayjs().add(-1, 'd') },
                    { label: '前天', value: dayjs().add(-2, 'd') }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="task_id"
                label="关联任务"
                tooltip="选择关联的甘特图任务，日志进度将自动同步到任务"
              >
                <Select
                  placeholder="选择任务（可选）"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  onChange={(value, option: any) => {
                    // 自动填充任务名称
                    if (value && option) {
                      form.setFieldsValue({ task_name: option.label });
                    }
                  }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {availableTasks.map(task => (
                    <Select.Option 
                      key={task.id} 
                      value={task.id}
                      label={task.name}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{task.name}</span>
                        <Tag color={task.progress === 100 ? 'green' : task.progress > 0 ? 'blue' : 'default'}>
                          {task.progress}%
                        </Tag>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="task_name"
                label="任务名称"
                rules={[{ required: true, message: '请输入任务名称' }]}
              >
                <Input placeholder="输入任务名称（选择关联任务后自动填充）" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="weather"
                label="天气"
                rules={[{ required: true, message: '请选择天气' }]}
              >
                <Select>
                  <Select.Option value="晴">☀️ 晴</Select.Option>
                  <Select.Option value="多云">⛅ 多云</Select.Option>
                  <Select.Option value="阴">☁️ 阴</Select.Option>
                  <Select.Option value="雨">🌧️ 雨</Select.Option>
                  <Select.Option value="雪">❄️ 雪</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="temperature"
                label="温度"
                rules={[{ required: true, message: '请输入温度' }]}
              >
                <Input placeholder="如: 18-25℃" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="worker_count"
                label="施工人数"
                rules={[{ required: true, message: '请输入施工人数' }]}
              >
                <Input type="number" placeholder="输入人数" suffix="人" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="work_content"
            label="工作内容"
            rules={[{ required: true, message: '请输入工作内容' }]}
          >
            <TextArea rows={3} placeholder="详细描述今日完成的工作内容" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="equipment_used" label="使用设备">
                <Input placeholder="如: 塔吊2台、搅拌车3台" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="material_used" label="材料消耗">
                <Input placeholder="如: 混凝土120m³、钢筋8吨" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="progress_today"
                label="今日进度 (%)"
                rules={[{ required: true, message: '请输入进度' }]}
              >
                <Input type="number" placeholder="今日完成进度百分比" suffix="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reporter"
                label="记录人"
                rules={[{ required: true, message: '请输入记录人' }]}
              >
                <Input placeholder="记录人姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="issues" label="问题与困难">
            <TextArea rows={2} placeholder='记录施工过程中遇到的问题，无则填"无"' />
          </Form.Item>

          <Form.Item name="safety_check" label="安全检查">
            <TextArea rows={2} placeholder="安全检查情况及隐患排查记录" />
          </Form.Item>

          <Form.Item label="现场照片">
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传照片</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConstructionLog;

