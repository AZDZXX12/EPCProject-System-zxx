/**
 * 页面骨架屏组件
 * 用于页面加载时的占位显示
 */

import React from 'react';
import { Skeleton, Card } from 'antd';
import './PageSkeleton.css';

interface PageSkeletonProps {
  type?: 'list' | 'form' | 'dashboard' | 'gantt';
  rows?: number;
}

const PageSkeleton: React.FC<PageSkeletonProps> = ({ type = 'list', rows = 5 }) => {
  if (type === 'list') {
    return (
      <div className="page-skeleton">
        <div className="skeleton-toolbar">
          <Skeleton.Input active className="skeleton-search" />
          <Skeleton.Button active />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <Card key={i} className="skeleton-card">
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="page-skeleton">
        <Card className="skeleton-form-card">
          <Skeleton active paragraph={{ rows: 8 }} />
          <div className="skeleton-form-actions">
            <Skeleton.Button active />
            <Skeleton.Button active />
          </div>
        </Card>
      </div>
    );
  }

  if (type === 'gantt') {
    return (
      <div className="page-skeleton">
        <div className="skeleton-gantt-header">
          <Skeleton.Input active />
          <div className="skeleton-gantt-actions">
            <Skeleton.Button active />
            <Skeleton.Button active />
            <Skeleton.Button active />
          </div>
        </div>
        <Card className="skeleton-gantt-card">
          <div className="skeleton-gantt-content">
            <div className="skeleton-gantt-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} active paragraph={{ rows: 1 }} />
              ))}
            </div>
            <div className="skeleton-gantt-timeline">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // dashboard
  return (
    <div className="page-skeleton">
      <div className="skeleton-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="skeleton-stat-card">
            <Skeleton.Avatar size="large" active />
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        ))}
      </div>
      <Card className="skeleton-chart-card">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
      <Card className="skeleton-table-card">
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    </div>
  );
};

export default PageSkeleton;
