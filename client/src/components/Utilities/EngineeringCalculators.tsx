import React, { useState } from 'react';
import { Card, Tabs, Row, Col } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import CableCalculator from './CableCalculator';
import PipeCalculator from './PipeCalculator';
import LadderCalculator from './LadderCalculator';
import StairCalculator from './StairCalculator';
import PlatformCalculator from './PlatformCalculator';
import GuardrailCalculator from './GuardrailCalculator';

const EngineeringCalculators: React.FC = () => {
  const items = [
    {
      key: 'cable',
      label: '电缆选型',
      children: <CableCalculator />,
    },
    {
      key: 'pipe',
      label: '管道计算',
      children: <PipeCalculator />,
    },
    {
      key: 'ladder',
      label: '爬梯计算',
      children: <LadderCalculator />,
    },
    {
      key: 'stair',
      label: '楼梯计算',
      children: <StairCalculator />,
    },
    {
      key: 'platform',
      label: '平台计算',
      children: <PlatformCalculator />,
    },
    {
      key: 'guardrail',
      label: '护栏计算',
      children: <GuardrailCalculator />,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <span>
            <ToolOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            工程计算器集合
          </span>
        }
        bordered={false}
      >
        <Tabs
          defaultActiveKey="cable"
          items={items}
          tabPosition="left"
          style={{ minHeight: 600 }}
        />
      </Card>
    </div>
  );
};

export default EngineeringCalculators;
