/**
 * 基于Luckysheet 2.0.2的设备选型系统
 * 
 * 功能特性：
 * 1. 集成Luckysheet在线表格
 * 2. 设备选型数据管理
 * 3. 实时协作编辑
 * 4. 数据导入导出
 * 5. 公式计算支持
 */

import React from 'react';
import { Card } from 'antd';
import PageContainer from '../components/Layout/PageContainer';

const LuckysheetSelection: React.FC = () => {
  return (
    <PageContainer>
      <Card 
        title="设备选型系统"
        style={{ height: 'calc(100vh - 200px)' }}
        styles={{ body: { padding: 0, height: '100%' } }}
      >
        <div style={{ width: '100%', height: '100%' }}>
          <iframe
            title="设备选型系统"
            src="/selection-tools/index.html"
            style={{ width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </Card>
    </PageContainer>
  );
};

export default LuckysheetSelection;
