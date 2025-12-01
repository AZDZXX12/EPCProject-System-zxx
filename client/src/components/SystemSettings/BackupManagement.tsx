import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Modal,
  Form,
  Input,
  Switch,
  TimePicker,
  message,
  Tooltip,
  Badge,
  Alert,
} from 'antd';
import {
  CloudUploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { logger } from '../../utils/EnhancedLogger';
import dayjs from 'dayjs';

interface Backup {
  id: string;
  name: string;
  size: number;
  createTime: string;
  type: 'manual' | 'auto';
  status: 'completed' | 'failed' | 'in-progress';
  description?: string;
}

interface BackupSettings {
  autoBackup: boolean;
  backupTime: string;
  retentionDays: number;
  maxBackups: number;
}

const BackupManagement: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackup: true,
    backupTime: '02:00',
    retentionDays: 30,
    maxBackups: 10,
  });
  const [form] = Form.useForm();

  // 加载备份列表
  const loadBackups = () => {
    setLoading(true);
    
    // 模拟备份数据
    setTimeout(() => {
      const mockBackups: Backup[] = [
        {
          id: '1',
          name: 'backup-2025-01-20-02-00.zip',
          size: 15680000, // 15.68 MB
          createTime: dayjs().subtract(1, 'day').toISOString(),
          type: 'auto',
          status: 'completed',
          description: '自动备份',
        },
        {
          id: '2',
          name: 'backup-2025-01-19-manual.zip',
          size: 14230000, // 14.23 MB
          createTime: dayjs().subtract(2, 'day').toISOString(),
          type: 'manual',
          status: 'completed',
          description: '手动备份 - 更新前备份',
        },
        {
          id: '3',
          name: 'backup-2025-01-19-02-00.zip',
          size: 14100000, // 14.1 MB
          createTime: dayjs().subtract(2, 'day').toISOString(),
          type: 'auto',
          status: 'completed',
          description: '自动备份',
        },
      ];

      setBackups(mockBackups);
      setLoading(false);
      logger.info('Backups loaded');
    }, 500);
  };

  useEffect(() => {
    loadBackups();
    
    // 从localStorage加载设置
    const savedSettings = localStorage.getItem('backup-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // 创建备份
  const handleCreateBackup = () => {
    Modal.confirm({
      title: '创建备份',
      content: '确定要创建新的备份吗？这可能需要几分钟时间。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setIsBackingUp(true);
        setBackupProgress(0);

        // 模拟备份进度
        const interval = setInterval(() => {
          setBackupProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsBackingUp(false);
              
              // 添加新备份到列表
              const newBackup: Backup = {
                id: Date.now().toString(),
                name: `backup-${dayjs().format('YYYY-MM-DD-HH-mm')}.zip`,
                size: 15000000 + Math.random() * 2000000,
                createTime: dayjs().toISOString(),
                type: 'manual',
                status: 'completed',
                description: '手动备份',
              };
              
              setBackups([newBackup, ...backups]);
              message.success('备份创建成功！');
              logger.info('Manual backup created');
              return 0;
            }
            return prev + 10;
          });
        }, 300);
      },
    });
  };

  // 恢复备份
  const handleRestore = (backup: Backup) => {
    Modal.confirm({
      title: '恢复备份',
      content: `确定要恢复备份 "${backup.name}" 吗？当前数据将被覆盖。`,
      okText: '确认恢复',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        message.loading({ content: '正在恢复备份...', key: 'restore', duration: 0 });
        
        setTimeout(() => {
          message.success({ content: '备份恢复成功！', key: 'restore' });
          logger.info(`Backup restored: ${backup.name}`);
        }, 2000);
      },
    });
  };

  // 下载备份
  const handleDownload = (backup: Backup) => {
    message.success(`开始下载: ${backup.name}`);
    logger.info(`Backup download started: ${backup.name}`);
  };

  // 删除备份
  const handleDelete = (backup: Backup) => {
    Modal.confirm({
      title: '删除备份',
      content: `确定要删除备份 "${backup.name}" 吗？此操作无法撤销。`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        setBackups(backups.filter((b) => b.id !== backup.id));
        message.success('备份已删除');
        logger.warn(`Backup deleted: ${backup.name}`);
      },
    });
  };

  // 保存设置
  const handleSaveSettings = () => {
    form.validateFields().then((values) => {
      const newSettings: BackupSettings = {
        autoBackup: values.autoBackup,
        backupTime: values.backupTime.format('HH:mm'),
        retentionDays: values.retentionDays,
        maxBackups: values.maxBackups,
      };
      
      setSettings(newSettings);
      localStorage.setItem('backup-settings', JSON.stringify(newSettings));
      setSettingsModalVisible(false);
      message.success('备份设置已保存');
      logger.info('Backup settings updated');
    });
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const columns = [
    {
      title: '备份名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: number) => formatSize(size),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: Backup['type']) => (
        <Tag color={type === 'auto' ? 'blue' : 'green'}>
          {type === 'auto' ? '自动' : '手动'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Backup['status']) => {
        const config = {
          completed: { color: 'success', text: '完成' },
          failed: { color: 'error', text: '失败' },
          'in-progress': { color: 'processing', text: '进行中' },
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Backup) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleRestore(record)}
            disabled={record.status !== 'completed'}
          >
            恢复
          </Button>
          <Button type="link" size="small" onClick={() => handleDownload(record)}>
            下载
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

  return (
    <div>
      <Card
        title={
          <Space>
            <Badge status="success" />
            备份管理
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={handleCreateBackup}
              loading={isBackingUp}
            >
              创建备份
            </Button>
            <Button icon={<SettingOutlined />} onClick={() => setSettingsModalVisible(true)}>
              设置
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadBackups} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      >
        {/* 备份进度 */}
        {isBackingUp && (
          <Alert
            message="正在创建备份..."
            description={<Progress percent={backupProgress} status="active" />}
            type="info"
            style={{ marginBottom: 16 }}
            closable={false}
          />
        )}

        {/* 备份统计 */}
        <Space style={{ marginBottom: 16 }} size="large">
          <div>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            <span>备份总数: </span>
            <strong>{backups.length}</strong>
          </div>
          <div>
            <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            <span>总大小: </span>
            <strong>{formatSize(totalSize)}</strong>
          </div>
          <div>
            <ClockCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <span>自动备份: </span>
            <strong>{settings.autoBackup ? '已启用' : '已禁用'}</strong>
          </div>
          {settings.autoBackup && (
            <div>
              <span>下次备份: </span>
              <strong>今日 {settings.backupTime}</strong>
            </div>
          )}
        </Space>

        {/* 备份列表 */}
        <Table
          columns={columns}
          dataSource={backups}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个备份`,
          }}
          size="small"
        />
      </Card>

      {/* 设置Modal */}
      <Modal
        title="备份设置"
        open={settingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        onOk={handleSaveSettings}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            autoBackup: settings.autoBackup,
            backupTime: dayjs(settings.backupTime, 'HH:mm'),
            retentionDays: settings.retentionDays,
            maxBackups: settings.maxBackups,
          }}
        >
          <Form.Item
            name="autoBackup"
            label="自动备份"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name="backupTime"
            label="备份时间"
            tooltip="每日自动备份的时间"
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="retentionDays"
            label="保留天数"
            tooltip="自动删除超过此天数的备份"
            rules={[{ required: true, message: '请输入保留天数' }]}
          >
            <Input type="number" suffix="天" />
          </Form.Item>

          <Form.Item
            name="maxBackups"
            label="最大备份数"
            tooltip="超过此数量时自动删除最旧的备份"
            rules={[{ required: true, message: '请输入最大备份数' }]}
          >
            <Input type="number" suffix="个" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BackupManagement;
