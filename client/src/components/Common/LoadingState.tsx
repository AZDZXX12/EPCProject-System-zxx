/**
 * 统一加载状态组件
 * 提供多种加载样式：骨架屏、旋转器、进度条
 */
import React from 'react';
import { Spin, Skeleton, Progress, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './LoadingState.css';

interface LoadingStateProps {
  type?: 'skeleton' | 'spin' | 'progress' | 'card';
  rows?: number;
  animated?: boolean;
  tip?: string;
  size?: 'small' | 'default' | 'large';
  percent?: number;
  fullscreen?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spin',
  rows = 5,
  animated = true,
  tip = '加载中...',
  size = 'default',
  percent,
  fullscreen = false
}) => {
  const containerClass = fullscreen ? 'loading-state-fullscreen' : 'loading-state-container';

  // 骨架屏加载
  if (type === 'skeleton') {
    return (
      <div className={containerClass}>
        <Skeleton active={animated} paragraph={{ rows }} />
      </div>
    );
  }

  // 卡片骨架屏
  if (type === 'card') {
    return (
      <div className={containerClass}>
        <Card>
          <Skeleton active={animated} avatar paragraph={{ rows: 3 }} />
        </Card>
      </div>
    );
  }

  // 进度条加载
  if (type === 'progress') {
    return (
      <div className={containerClass}>
        <div className="loading-progress">
          <Progress
            percent={percent || 0}
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <div className="loading-tip">{tip}</div>
        </div>
      </div>
    );
  }

  // 旋转器加载（默认）
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 24 : 36 }} spin />;

  return (
    <div className={containerClass}>
      <Spin indicator={antIcon} size={size} tip={tip} />
    </div>
  );
};

export default LoadingState;
