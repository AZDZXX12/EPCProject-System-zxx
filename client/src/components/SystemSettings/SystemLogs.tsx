import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  DatePicker,
  Select,
  Input,
  Modal,
  Badge,
  Tooltip,
  message,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { logger } from '../../utils/EnhancedLogger';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  module: string;
  message: string;
  details?: string;
  userId?: string;
  ip?: string;
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  // 加载日志数据
  const loadLogs = () => {
    setLoading(true);
    
    // 模拟日志数据
    setTimeout(() => {
      const mockLogs: SystemLog[] = [
        {
          id: '1',
          timestamp: dayjs().subtract(5, 'minute').toISOString(),
          level: 'INFO',
          module: 'Authentication',
          message: '用户登录成功',
          details: 'User admin logged in from 192.168.1.100',
          userId: 'admin',
          ip: '192.168.1.100',
        },
        {
          id: '2',
          timestamp: dayjs().subtract(10, 'minute').toISOString(),
          level: 'WARN',
          module: 'DeviceManagement',
          message: '设备数据加载较慢',
          details: 'Device data loading took 3.5 seconds',
          userId: 'admin',
          ip: '192.168.1.100',
        },
        {
          id: '3',
          timestamp: dayjs().subtract(15, 'minute').toISOString(),
          level: 'ERROR',
          module: 'WebGL',
          message: 'WebGL context丢失',
          details: 'WebGL context was lost and recovered successfully',
          userId: 'admin',
          ip: '192.168.1.100',
        },
        {
          id: '4',
          timestamp: dayjs().subtract(20, 'minute').toISOString(),
          level: 'INFO',
          module: 'ProjectManagement',
          message: '项目切换',
          details: 'Switched to project: 化工设备生产线安装项目',
          userId: 'admin',
          ip: '192.168.1.100',
        },
        {
          id: '5',
          timestamp: dayjs().subtract(25, 'minute').toISOString(),
          level: 'DEBUG',
          module: 'API',
          message: 'API请求记录',
          details: 'GET /api/projects - 200 OK (125ms)',
          userId: 'admin',
          ip: '192.168.1.100',
        },
      ];

      setLogs(mockLogs);
      setLoading(false);
      logger.info('System logs loaded');
    }, 500);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // 日志级别配置
  const levelConfig = {
    INFO: { color: 'blue', icon: <InfoCircleOutlined /> },
    WARN: { color: 'orange', icon: <WarningOutlined /> },
    ERROR: { color: 'red', icon: <CloseCircleOutlined /> },
    DEBUG: { color: 'default', icon: <CheckCircleOutlined /> },
  };

  // 过滤日志
  const filteredLogs = logs.filter((log) => {
    const matchLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchSearch =
      searchText === '' ||
      log.message.toLowerCase().includes(searchText.toLowerCase()) ||
      log.module.toLowerCase().includes(searchText.toLowerCase());
    return matchLevel && matchSearch;
  });

  // 导出日志
  const handleExportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-logs-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success('日志导出成功！');
    logger.info('System logs exported');
  };

  // 清空日志
  const handleClearLogs = () => {
    Modal.confirm({
      title: '确认清空日志？',
      content: '此操作将清空所有日志记录，且无法恢复。',
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        setLogs([]);
        message.success('日志已清空');
        logger.warn('System logs cleared');
      },
    });
  };

  // 查看日志详情
  const handleViewDetail = (log: SystemLog) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: SystemLog['level']) => (
        <Tag color={levelConfig[level].color} icon={levelConfig[level].icon}>
          {level}
        </Tag>
      ),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 150,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '用户',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: SystemLog) => (
        <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <Badge status="processing" />
          系统日志
        </Space>
      }
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadLogs} loading={loading}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportLogs}>
            导出
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={handleClearLogs}>
            清空
          </Button>
        </Space>
      }
    >
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          style={{ width: 150 }}
          value={selectedLevel}
          onChange={setSelectedLevel}
          options={[
            { value: 'all', label: '全部级别' },
            { value: 'INFO', label: 'INFO' },
            { value: 'WARN', label: 'WARN' },
            { value: 'ERROR', label: 'ERROR' },
            { value: 'DEBUG', label: 'DEBUG' },
          ]}
        />
        <Input
          placeholder="搜索日志..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <RangePicker />
        <Tooltip title="共有日志记录">
          <Tag color="blue">{filteredLogs.length} 条</Tag>
        </Tooltip>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredLogs}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        size="small"
      />

      {/* 日志详情Modal */}
      <Modal
        title="日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedLog && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <strong>时间:</strong>{' '}
                {dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </div>
              <div>
                <strong>级别:</strong>{' '}
                <Tag color={levelConfig[selectedLog.level].color}>
                  {selectedLog.level}
                </Tag>
              </div>
              <div>
                <strong>模块:</strong> {selectedLog.module}
              </div>
              <div>
                <strong>消息:</strong> {selectedLog.message}
              </div>
              {selectedLog.userId && (
                <div>
                  <strong>用户:</strong> {selectedLog.userId}
                </div>
              )}
              {selectedLog.ip && (
                <div>
                  <strong>IP地址:</strong> {selectedLog.ip}
                </div>
              )}
              {selectedLog.details && (
                <div>
                  <strong>详细信息:</strong>
                  <TextArea
                    value={selectedLog.details}
                    autoSize={{ minRows: 3, maxRows: 10 }}
                    readOnly
                    style={{ marginTop: 8 }}
                  />
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default SystemLogs;
