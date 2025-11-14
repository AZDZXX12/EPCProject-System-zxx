import React from 'react';
import PageHeader from './PageHeader';

interface PageContainerProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, showHeader = true }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      {showHeader && <PageHeader />}
      <div
        style={{
          flex: 1,
          padding: showHeader ? '24px' : '0',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
