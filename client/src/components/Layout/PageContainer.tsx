import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import PageHeader from './PageHeader';
import './PageContainer.css';

interface BreadcrumbItem {
  path?: string;
  title: string;
  icon?: React.ReactNode;
}

interface PageContainerProps {
  children: React.ReactNode;
  showHeader?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
  title?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  showHeader = true,
  breadcrumbItems,
  title 
}) => {
  return (
    <div className="page-container">
      {showHeader && <PageHeader />}
      
      <div className={`page-container-content ${!showHeader ? 'no-header' : ''}`}>
        {/* 面包屑导航 */}
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <div style={{ marginBottom: '16px', background: '#fff', padding: '12px 16px', borderRadius: '4px' }}>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link to="/workspace">
                  <HomeOutlined style={{ marginRight: '4px' }} />
                  首页
                </Link>
              </Breadcrumb.Item>
              {breadcrumbItems.map((item, index) => (
                <Breadcrumb.Item key={index}>
                  {item.path ? (
                    <Link to={item.path}>
                      {item.icon && <span style={{ marginRight: '4px' }}>{item.icon}</span>}
                      {item.title}
                    </Link>
                  ) : (
                    <span>
                      {item.icon && <span style={{ marginRight: '4px' }}>{item.icon}</span>}
                      {item.title}
                    </span>
                  )}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </div>
        )}
        
        {/* 页面标题 */}
        {title && (
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{title}</h2>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
