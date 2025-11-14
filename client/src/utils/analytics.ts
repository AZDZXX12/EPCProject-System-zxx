/**
 * 用户行为分析工具
 */

interface UserAction {
  type: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  page: string;
  userAgent: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  page: string;
  sessionId: string;
}

class Analytics {
  private sessionId: string;
  private userId?: string;
  private actions: UserAction[] = [];
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.setupPerformanceObserver();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 设置用户ID
  setUserId(userId: string) {
    this.userId = userId;
  }

  // 跟踪用户行为
  track(type: string, category: string, label?: string, value?: number) {
    if (!this.isEnabled) return;

    const action: UserAction = {
      type,
      category,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      ...(this.userId !== undefined && { userId: this.userId }),
      ...(label !== undefined && { label }),
      ...(value !== undefined && { value }),
    };

    this.actions.push(action);
    this.sendToAnalytics(action);

    // 开发环境下输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', action);
    }
  }

  // 跟踪页面访问
  trackPageView(page: string) {
    this.track('pageview', 'navigation', page);
  }

  // 跟踪点击事件
  trackClick(element: string, location?: string) {
    this.track('click', 'interaction', `${element}${location ? `_${location}` : ''}`);
  }

  // 跟踪表单提交
  trackFormSubmit(formName: string, success: boolean) {
    this.track('form_submit', 'form', formName, success ? 1 : 0);
  }

  // 跟踪搜索
  trackSearch(query: string, results: number) {
    this.track('search', 'search', query, results);
  }

  // 跟踪错误
  trackError(error: string, category: string = 'error') {
    this.track('error', category, error);
  }

  // 跟踪性能指标
  trackPerformance(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      page: window.location.pathname,
      sessionId: this.sessionId,
    };

    this.metrics.push(metric);
    this.sendPerformanceMetric(metric);
  }

  // 设置性能观察器
  private setupPerformanceObserver() {
    if (typeof window === 'undefined') return;

    // 观察导航性能
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.trackPerformance('page_load_time', navEntry.loadEventEnd - navEntry.loadEventStart);
              this.trackPerformance('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
              this.trackPerformance('first_contentful_paint', navEntry.loadEventEnd - navEntry.fetchStart);
            }
          }
        });

        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }

    // 观察资源加载性能
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformance('total_load_time', navigation.loadEventEnd - navigation.fetchStart);
        }
      }, 0);
    });
  }

  // 发送数据到分析服务
  private async sendToAnalytics(action: UserAction) {
    try {
      // 这里可以接入Google Analytics、百度统计等服务
      // 示例：发送到自定义分析端点
      if (this.isEnabled) {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action),
        }).catch(() => {
          // 静默处理分析请求失败
        });
      }
    } catch (error) {
      // 不影响主要功能
    }
  }

  // 发送性能指标
  private async sendPerformanceMetric(metric: PerformanceMetric) {
    try {
      if (this.isEnabled) {
        await fetch('/api/analytics/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metric),
        }).catch(() => {
          // 静默处理
        });
      }
    } catch (error) {
      // 不影响主要功能
    }
  }

  // 获取会话数据
  getSessionData() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      actions: this.actions,
      metrics: this.metrics,
    };
  }

  // 清除数据
  clear() {
    this.actions = [];
    this.metrics = [];
  }
}

// 导出单例
export const analytics = new Analytics();

// 便捷的跟踪函数
export const trackEvent = (type: string, category: string, label?: string, value?: number) => {
  analytics.track(type, category, label, value);
};

export const trackPageView = (page: string) => {
  analytics.trackPageView(page);
};

export const trackClick = (element: string, location?: string) => {
  analytics.trackClick(element, location);
};

export const trackError = (error: string, category?: string) => {
  analytics.trackError(error, category);
};
