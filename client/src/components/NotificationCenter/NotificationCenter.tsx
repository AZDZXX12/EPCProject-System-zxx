import React, { useState, useEffect } from 'react';
import { Badge, Drawer, List, Button, Tabs, Tag, Space, Empty, Tooltip } from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useProject } from '../../contexts/ProjectContext';
import './NotificationCenter.css';

interface Notification {
  id: string;
  type: 'task' | 'device' | 'safety' | 'system';
  level: 'info' | 'warning' | 'error' | 'success';
  title: string;
  content: string;
  time: string;
  read: boolean;
  projectId?: string;
}

const NotificationCenter: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const { currentProject } = useProject();

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, [currentProject]);

  const loadNotifications = async () => {
    // 模拟通知数据
    const mockNotifications: Notification[] = [
      {
        id: 'n1',
        type: 'task',
        level: 'warning',
        title: '任务延期提醒',
        content: '基础土建工程预计延期2天，请及时调整计划',
        time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        projectId: currentProject?.id,
      },
      {
        id: 'n2',
        type: 'device',
        level: 'success',
        title: '设备到货通知',
        content: '离心泵-P101已到货，请安排验收',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
        projectId: currentProject?.id,
      },
      {
        id: 'n3',
        type: 'safety',
        level: 'error',
        title: 'HSE安全隐患',
        content: '发现高空作业无防护措施，请立即整改',
        time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        read: true,
        projectId: currentProject?.id,
      },
      {
        id: 'n4',
        type: 'system',
        level: 'info',
        title: '系统更新通知',
        content: 'EPC系统v2.0.0-zxx已更新，新增项目联动功能',
        time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
      },
      {
        id: 'n5',
        type: 'task',
        level: 'info',
        title: '任务即将开始',
        content: '设备安装阶段将于明天开始，请做好准备',
        time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        read: false,
        projectId: currentProject?.id,
      },
    ];
    setNotifications(mockNotifications);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (level: string) => {
    const iconStyle = { fontSize: 20 };
    if (level === 'error')
      return <CloseCircleOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
    if (level === 'warning') return <WarningOutlined style={{ ...iconStyle, color: '#faad14' }} />;
    if (level === 'success')
      return <CheckCircleOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
    return <InfoCircleOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
  };

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      task: { color: 'blue', text: '任务' },
      device: { color: 'green', text: '设备' },
      safety: { color: 'red', text: 'HSE' },
      system: { color: 'purple', text: '系统' },
    };
    return <Tag color={typeMap[type].color}>{typeMap[type].text}</Tag>;
  };

  const formatTime = (time: string) => {
    const now = new Date();
    const notifyTime = new Date(time);
    const diff = now.getTime() - notifyTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filterNotifications = () => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === activeTab);
  };

  const filteredNotifications = filterNotifications();

  return (
    <>
      <Tooltip title="消息通知">
        <Badge count={unreadCount} offset={[-3, 3]}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 20 }} />}
            onClick={() => setVisible(true)}
            style={{ marginLeft: 16 }}
          />
        </Badge>
      </Tooltip>

      <Drawer
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <span>消息通知</span>
            <Button type="link" size="small" onClick={markAllAsRead} disabled={unreadCount === 0}>
              全部标为已读
            </Button>
          </Space>
        }
        placement="right"
        width={450}
        open={visible}
        onClose={() => setVisible(false)}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: `全部 (${notifications.length})` },
            { key: 'unread', label: `未读 (${unreadCount})` },
            { key: 'task', label: '任务' },
            { key: 'device', label: '设备' },
            { key: 'safety', label: 'HSE' },
            { key: 'system', label: '系统' },
          ]}
        />

        {filteredNotifications.length === 0 ? (
          <Empty description="暂无通知" style={{ marginTop: 60 }} />
        ) : (
          <List
            dataSource={filteredNotifications}
            renderItem={(item) => (
              <List.Item
                className={`notification-item ${!item.read ? 'unread' : ''}`}
                actions={[
                  !item.read && (
                    <Tooltip title="标为已读">
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => markAsRead(item.id)}
                      />
                    </Tooltip>
                  ),
                  <Tooltip title="删除">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => deleteNotification(item.id)}
                    />
                  </Tooltip>,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={getIcon(item.level)}
                  title={
                    <Space>
                      {item.title}
                      {getTypeTag(item.type)}
                    </Space>
                  }
                  description={
                    <>
                      <div style={{ marginBottom: 8 }}>{item.content}</div>
                      <Space style={{ fontSize: 12, color: '#999' }}>
                        <ClockCircleOutlined />
                        {formatTime(item.time)}
                      </Space>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </>
  );
};

export default NotificationCenter;
