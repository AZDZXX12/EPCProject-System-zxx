/**
 * 全局错误边界
 * 捕获并处理React组件错误
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography, Card, Collapse } from 'antd';
import { BugOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { logger } from '../../utils/EnhancedLogger';
import './GlobalErrorBoundary.css';

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

export class GlobalErrorBoundary extends Component<Props, State> {
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
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误
    logger.error('[全局错误边界]', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // 更新错误计数
    this.setState((prev) => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // 调用自定义错误处理
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 生产环境发送错误报告
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorReport(error, errorInfo);
    }

    // 如果错误频繁发生，清除本地存储
    if (this.state.errorCount > 3) {
      logger.warn('[全局错误边界] 错误频繁，清除本地缓存');
      this.clearLocalStorage();
    }
  }

  private sendErrorReport(error: Error, errorInfo: ErrorInfo) {
    // 发送到错误监控服务（如Sentry）
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // 这里可以集成Sentry或其他错误监控服务
    logger.info('[错误报告]', errorReport);
  }

  private clearLocalStorage() {
    try {
      const keysToKeep = ['ai.provider', 'ai.apiKey', 'user.preferences'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      logger.info('[全局错误边界] 本地缓存已清除');
    } catch (e) {
      logger.error('[全局错误边界] 清除缓存失败', e);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 使用自定义fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误页面
      return (
        <div className="error-boundary-container">
          <Card className="error-boundary-card">
            <Result
              status="error"
              icon={<BugOutlined className="error-icon" />}
              title="页面出错了"
              subTitle="抱歉，页面遇到了一些问题。我们已经记录了这个错误。"
              extra={[
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReload}
                  key="reload"
                >
                  刷新页面
                </Button>,
                <Button
                  icon={<HomeOutlined />}
                  onClick={this.handleGoHome}
                  key="home"
                >
                  返回首页
                </Button>,
              ]}
            />

            {/* 开发环境显示错误详情 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Collapse
                className="error-collapse"
                items={[
                  {
                    key: 'error-details',
                    label: '错误详情（开发模式）',
                    children: (
                      <div>
                        <Paragraph>
                          <Text strong>错误信息：</Text>
                          <br />
                          <Text code>{this.state.error.toString()}</Text>
                        </Paragraph>

                        {this.state.error.stack && (
                          <Paragraph>
                            <Text strong>错误堆栈：</Text>
                            <pre className="error-stack-pre">
                              {this.state.error.stack}
                            </pre>
                          </Paragraph>
                        )}

                        {this.state.errorInfo?.componentStack && (
                          <Paragraph>
                            <Text strong>组件堆栈：</Text>
                            <pre className="error-stack-pre">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </Paragraph>
                        )}

                        <Button
                          size="small"
                          onClick={this.handleReset}
                          className="error-reset-button"
                        >
                          尝试恢复
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            )}

            {/* 错误次数提示 */}
            {this.state.errorCount > 1 && (
              <Paragraph
                type="secondary"
                className="error-count-text"
              >
                错误已发生 {this.state.errorCount} 次
                {this.state.errorCount > 3 && '，已自动清除缓存'}
              </Paragraph>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
