import React, { useEffect, useState } from 'react';
import { message, Badge } from 'antd';

const NotificationService: React.FC = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // 连接 WebSocket
    const websocket = new WebSocket('ws://localhost:8000/ws');

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      message.success('实时通知已连接');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // 根据消息类型显示不同的通知
      if (data.type === 'task_update') {
        message.info(`任务更新: ${data.message}`);
      } else if (data.type === 'comment') {
        message.info(`新评论: ${data.message}`);
      } else if (data.type === 'mention') {
        message.warning(`@提醒: ${data.message}`);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      message.warning('实时通知已断开');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  return (
    <Badge status={connected ? 'success' : 'default'} text={connected ? '已连接' : '未连接'} />
  );
};

export default NotificationService;






