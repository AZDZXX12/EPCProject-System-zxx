/**
 * 统一错误状态组件
 * 提供友好的错误提示和恢复操作
 */
import React, { ReactNode } from 'react';
import { Result, Button } from 'antd';
import {
  CloseCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  FrownOutlined
} from '@ant-design/icons';
import './ErrorState.css';

interface ErrorStateProps {
  code?: number | string;
  title?: string;
  description?: string;
  action?: ReactNode;
  type?: 'error' | 'warning' | 'info' | '404' | '403' | '500';
  onRetry?: () => void;
  onBack?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  code,
  title,
  description,
  action,
  type = 'error',
  onRetry,
  onBack
}) => {
  // 根据类型或错误码获取默认配置
  const getDefaultConfig = () => {
    // 优先使用错误码
    if (code === 404 || type === '404') {
      return {
        status: '404' as const,
        title: title || '页面未找到',
        subTitle: description || '抱歉，您访问的页面不存在',
        icon: <FrownOutlined />
      };
    }

    if (code === 403 || type === '403') {
      return {
        status: '403' as const,
        title: title || '无权访问',
        subTitle: description || '抱歉，您没有权限访问此页面',
        icon: <ExclamationCircleOutlined />
      };
    }

    if (code === 500 || type === '500') {
      return {
        status: '500' as const,
        title: title || '服务器错误',
        subTitle: description || '抱歉，服务器出现了一些问题',
        icon: <CloseCircleOutlined />
      };
    }

    if (type === 'warning') {
      return {
        status: 'warning' as const,
        title: title || '警告',
        subTitle: description || '请注意，操作可能存在风险',
        icon: <WarningOutlined />
      };
    }

    if (type === 'info') {
      return {
        status: 'info' as const,
        title: title || '提示',
        subTitle: description || '请查看以下信息',
        icon: <ExclamationCircleOutlined />
      };
    }

    // 默认错误状态
    return {
      status: 'error' as const,
      title: title || '操作失败',
      subTitle: description || '抱歉，操作过程中出现了错误',
      icon: <CloseCircleOutlined />
    };
  };

  const config = getDefaultConfig();

  // 默认操作按钮
  const defaultExtra = (
    <div className="error-state-actions">
      {onBack && (
        <Button onClick={onBack}>
          返回
        </Button>
      )}
      {onRetry && (
        <Button type="primary" onClick={onRetry}>
          重试
        </Button>
      )}
    </div>
  );

  return (
    <div className="error-state-container">
      <Result
        status={config.status}
        title={config.title}
        subTitle={config.subTitle}
        extra={action || defaultExtra}
      />
    </div>
  );
};

export default ErrorState;
