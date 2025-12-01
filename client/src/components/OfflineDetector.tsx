/**
 * 离线检测器
 * 
 * 功能：
 * - 实时监控网络状态
 * - 离线/在线提醒
 * - 定期心跳检测
 * - 自动同步恢复
 */

import { useEffect, useState } from 'react';
import { message, notification } from 'antd';
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useGlobalStore } from '../store/globalStore';
import { logger } from '../utils/EnhancedLogger';

const HEARTBEAT_INTERVAL = 30000; // 30秒心跳检测
const HEALTH_CHECK_ENDPOINT = '/api/health';

const OfflineDetector: React.FC = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [notificationKey, setNotificationKey] = useState<string | null>(null);
  const { addNotification, syncWithBackend } = useGlobalStore();

  // 网络状态变化处理
  useEffect(() => {
    const handleOnline = async () => {
      if (!online) {
        setOnline(true);
        
        // 关闭离线通知
        if (notificationKey) {
          notification.destroy(notificationKey);
          setNotificationKey(null);
        }
        
        // 显示恢复消息
        message.success('网络连接已恢复');
        
        // 添加到通知中心
        addNotification({
          type: 'success',
          message: '网络连接已恢复',
        });
        
        // 记录日志
        logger.info('Network connection restored');
        
        // 自动同步数据
        try {
          await syncWithBackend();
          message.info('数据同步完成');
        } catch (error) {
          logger.error('Failed to sync after reconnection', error);
        }
      }
    };

    const handleOffline = () => {
      if (online) {
        setOnline(false);
        
        // 显示离线通知
        const key = `offline_${Date.now()}`;
        notification.warning({
          key,
          message: '网络连接已断开',
          description: (
            <div>
              <p>部分功能可能无法使用</p>
              <p>数据将在网络恢复后自动同步</p>
            </div>
          ),
          icon: <DisconnectOutlined style={{ color: '#faad14' }} />,
          duration: 0, // 不自动关闭
        });
        setNotificationKey(key);
        
        // 添加到通知中心
        addNotification({
          type: 'warning',
          message: '网络连接已断开',
        });
        
        // 记录日志
        logger.warn('Network connection lost');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [online, notificationKey, addNotification, syncWithBackend]);

  // 定期心跳检测
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
        
        const response = await fetch(HEALTH_CHECK_ENDPOINT, {
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok && online) {
          // 服务器响应异常但浏览器认为在线
          setOnline(false);
          logger.warn('Server unreachable but network appears online');
        } else if (response.ok && !online) {
          // 服务器可达但标记为离线
          setOnline(true);
          logger.info('Server reachable, updating online status');
        }
      } catch (error) {
        if (online) {
          // 检测失败，可能离线
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.debug('Health check failed', { error: errorMessage });
          
          // 如果是超时或网络错误，标记为离线
          if (errorMessage.includes('aborted') || errorMessage.includes('fetch')) {
            setOnline(false);
          }
        }
      }
    };

    // 立即检查一次
    checkConnection();
    
    // 定期检查
    const interval = setInterval(checkConnection, HEARTBEAT_INTERVAL);
    
    return () => clearInterval(interval);
  }, [online]);

  // 页面可见性变化时检查网络
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 页面变为可见时，检查网络状态
        setOnline(navigator.onLine);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 不渲染UI，仅提供功能
  return null;
};

export default OfflineDetector;
