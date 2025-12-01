/**
 * 协作通知系统
 * 参考：Worktile
 */

import React, { useState, useEffect } from 'react';
import {
  Badge,
  Dropdown,
  List,
  Avatar,
  Button,
  Input,
  Mentions,
  Tooltip,
  Space,
  Tag,
  Empty,
  Tabs,
} from 'antd';
import {
  BellOutlined,
  MessageOutlined,
  LikeOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { eventBus, EVENTS } from '../utils/EventBus';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

interface Notification {
  id: string;
  type: 'mention' | 'comment' | 'task' | 'approval' | 'system';
  title: string;
  content: string;
  sender: string;
  avatar?: string;
  time: string;
  read: boolean;
  link?: string;
}

interface Activity {
  id: string;
  user: string;
  avatar?: string;
  action: string;
  target: string;
  time: string;
  type: 'create' | 'update' | 'delete' | 'comment';
}

const CollaborationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    loadActivities();
    
    // 监听新通知
    eventBus.on(EVENTS.NOTIFICATION_SHOW, handleNewNotification);
    
    return () => {
      eventBus.off(EVENTS.NOTIFICATION_SHOW, handleNewNotification);
    };
  }, []);

  const loadNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'mention',
        title: '@提醒',
        content: '张三在"设备安装任务"中@了你',
        sender: '张三',
        time: dayjs().subtract(5, 'minute').toISOString(),
        read: false,
      },
      {
        id: '2',
        type: 'task',
        title: '任务分配',
        content: '李四将"质量检查"任务分配给了你',
        sender: '李四',
        time: dayjs().subtract(1, 'hour').toISOString(),
        read: false,
      },
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const loadActivities = () => {
    const mockActivities: Activity[] = [
      {
        id: '1',
        user: '张三',
        action: '创建了任务',
        target: '设备安装',
        time: dayjs().subtract(10, 'minute').toISOString(),
        type: 'create',
      },
      {
        id: '2',
        user: '李四',
        action: '更新了进度',
        target: '质量检查',
        time: dayjs().subtract(30, 'minute').toISOString(),
        type: 'update',
      },
    ];
    setActivities(mockActivities);
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const notificationMenu = (
    <div style={{ width: 400, maxHeight: 500, overflow: 'auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>通知</span>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead}>
            全部已读
          </Button>
        )}
      </div>
      <Tabs
        defaultActiveKey="all"
        size="small"
        style={{ padding: '0 16px' }}
        items={[
          {
            key: 'all',
            label: '全部',
            children: (
              <List
                dataSource={notifications}
                renderItem={item => (
                  <List.Item
                    style={{
                      backgroundColor: item.read ? 'transparent' : '#f0f7ff',
                      padding: '12px',
                      cursor: 'pointer',
                    }}
                    onClick={() => markAsRead(item.id)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <Space>
                          <span>{item.title}</span>
                          {!item.read && <Badge status="processing" />}
                        </Space>
                      }
                      description={
                        <>
                          <div>{item.content}</div>
                          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                            {dayjs(item.time).fromNow()}
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ),
          },
          {
            key: 'mention',
            label: '@我的',
            children: (
              <List
                dataSource={notifications.filter(n => n.type === 'mention')}
                renderItem={item => (
                  <List.Item onClick={() => markAsRead(item.id)}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={item.content}
                      description={dayjs(item.time).fromNow()}
                    />
                  </List.Item>
                )}
              />
            ),
          },
        ]}
      />
    </div>
  );

  return (
    <Dropdown dropdownRender={() => notificationMenu} trigger={['click']}>
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
      </Badge>
    </Dropdown>
  );
};

export default CollaborationSystem;
