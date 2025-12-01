/**
 * React错误边界组件
 * 
 * 功能：
 * 1. 捕获子组件错误
 * 2. 显示友好错误页面
 * 3. 错误日志记录
 * 4. 错误恢复机制
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography, Collapse } from 'antd';
import { ReloadOutlined, BugOutlined } from '@ant-design/icons';
import { logger } from '../../utils/EnhancedLogger';
import './ErrorBoundary.css';

const { Paragraph, Text } = Typography;
const { Panel } = Collapse;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 更新 state 使下一次渲染显示降级后的 UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误日志
    logger.error('React Error Boundary', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // 更新错误计数
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // 调用自定义错误处理
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 发送错误报告（生产环境）
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorReport(error, errorInfo);
    }
  }

  // 发送错误报告
  private sendErrorReport(error: Error, errorInfo: ErrorInfo): void {
    // 这里可以集成 Sentry 或其他错误监控服务
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // 发送到错误监控服务
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport),
    }).catch(() => {
      // 静默失败
    });
  }

  // 重置错误状态
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  // 刷新页面
  handleRefresh = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback } = this.props;

    // 如果有错误，显示错误界面
    if (hasError && error) {
      // 如果提供了自定义fallback
      if (fallback) {
        return fallback;
      }

      // 默认错误界面
      return (
        <div className="error-boundary">
          <Result
            status="error"
            title="页面出现了一些问题"
            subTitle="很抱歉，页面遇到了意外错误。我们已经记录了这个问题，请尝试刷新页面或联系技术支持。"
            extra={[
              <Button
                type="primary"
                key="retry"
                onClick={this.handleReset}
                icon={<ReloadOutlined />}
              >
                重试
              </Button>,
              <Button
                key="refresh"
                onClick={this.handleRefresh}
              >
                刷新页面
              </Button>,
            ]}
          >
            {/* 开发环境显示错误详情 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="error-details">
                <Collapse>
                  <Panel
                    header={
                      <span>
                        <BugOutlined /> 错误详情（仅开发环境可见）
                      </span>
                    }
                    key="1"
                  >
                    <Paragraph>
                      <Text strong>错误信息：</Text>
                      <Text code>{error.message}</Text>
                    </Paragraph>
                    
                    <Paragraph>
                      <Text strong>错误次数：</Text>
                      <Text type="danger">{errorCount}</Text>
                    </Paragraph>

                    {error.stack && (
                      <Paragraph>
                        <Text strong>错误堆栈：</Text>
                        <pre className="error-stack">{error.stack}</pre>
                      </Paragraph>
                    )}

                    {errorInfo?.componentStack && (
                      <Paragraph>
                        <Text strong>组件堆栈：</Text>
                        <pre className="error-stack">{errorInfo.componentStack}</pre>
                      </Paragraph>
                    )}
                  </Panel>
                </Collapse>
              </div>
            )}
          </Result>
        </div>
      );
    }

    // 正常渲染子组件
    return children;
  }
}

export default ErrorBoundary;

// HOC包装器
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.ComponentType<P> {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
}
