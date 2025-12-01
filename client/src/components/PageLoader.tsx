/**
 * 页面加载器组件
 * 
 * 功能：
 * - 优雅的加载动画
 * - 进度提示
 * - 超时检测
 * - 友好的错误提示
 */

import React, { useState, useEffect } from 'react';
import { Spin, Progress, Typography, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import './PageLoader.css';

const { Text } = Typography;

interface PageLoaderProps {
  message?: string;
  timeout?: number;
  showProgress?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = '加载中...', 
  timeout = 10000,
  showProgress = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    if (showProgress) {
      // 模拟加载进度
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
    }

    // 超时检测
    timeoutTimer = setTimeout(() => {
      setTimedOut(true);
    }, timeout);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeoutTimer);
    };
  }, [timeout, showProgress]);

  const handleReload = () => {
    window.location.reload();
  };

  if (timedOut) {
    return (
      <div className="page-loader">
        <div className="page-loader-content">
          <Text type="warning" style={{ fontSize: 16, marginBottom: 16 }}>
            ⚠️ 加载超时
          </Text>
          <Text type="secondary" style={{ marginBottom: 24 }}>
            页面加载时间过长，请检查网络连接或刷新页面重试
          </Text>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={handleReload}
          >
            刷新页面
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-loader">
      <div className="page-loader-content">
        <Spin size="large" />
        {showProgress && (
          <Progress 
            percent={Math.round(progress)} 
            showInfo={false}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            className="page-loader-progress"
          />
        )}
        <Text type="secondary" className="page-loader-message">
          {message}
        </Text>
      </div>
    </div>
  );
};

export default PageLoader;
