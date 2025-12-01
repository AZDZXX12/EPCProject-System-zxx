/**
 * 成本管理模块
 * 参考：建文云
 */

import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Form, Input, InputNumber, Select, Modal, Space, Tag, Progress, Statistic, Row, Col } from 'antd';
import { DollarOutlined, PlusOutlined, FileTextOutlined, AlertOutlined } from '@ant-design/icons';

interface BudgetItem {
  id: string;
  category: string;
  item: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  varianceRate: number;
}

interface Contract {
  id: string;
  name: string;
  contractor: string;
  amount: number;
  paidAmount: number;
  status: string;
  startDate: string;
  endDate: string;
}

const CostManagement: React.FC = () => {
  const [budgetData] = useState<BudgetItem[]>([
    {
      id: '1',
      category: '设备费',
      item: '反应釜',
      budgetAmount: 500000,
      actualAmount: 480000,
      variance: -20000,
      varianceRate: -4,
    },
  ]);

  const [contracts] = useState<Contract[]>([
    {
      id: '1',
      name: '设备采购合同',
      contractor: 'XX设备公司',
      amount: 2000000,
      paidAmount: 1200000,
      status: '执行中',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    },
  ]);

  const budgetColumns = [
    { title: '类别', dataIndex: 'category', key: 'category' },
    { title: '项目', dataIndex: 'item', key: 'item' },
    {
      title: '预算金额',
      dataIndex: 'budgetAmount',
      key: 'budgetAmount',
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      title: '实际金额',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      title: '差异',
      dataIndex: 'variance',
      key: 'variance',
      render: (v: number) => (
        <span style={{ color: v < 0 ? '#52c41a' : '#ff4d4f' }}>
          {v > 0 ? '+' : ''}¥{v.toLocaleString()}
        </span>
      ),
    },
    {
      title: '差异率',
      dataIndex: 'varianceRate',
      key: 'varianceRate',
      render: (v: number) => (
        <Tag color={v < 0 ? 'green' : 'red'}>
          {v > 0 ? '+' : ''}
          {v}%
        </Tag>
      ),
    },
  ];

  const contractColumns = [
    { title: '合同名称', dataIndex: 'name', key: 'name' },
    { title: '承包商', dataIndex: 'contractor', key: 'contractor' },
    {
      title: '合同金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      title: '已付金额',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      title: '付款进度',
      key: 'progress',
      render: (_: any, record: Contract) => (
        <Progress percent={Math.round((record.paidAmount / record.amount) * 100)} size="small" />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总预算" value={5000000} prefix="¥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="实际成本" value={3200000} prefix="¥" valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="成本节约" value={1800000} prefix="¥" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="成本节约率" value={36} suffix="%" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          items={[
            {
              key: 'budget',
              label: '预算管理',
              children: (
                <>
                  <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                    新增预算
                  </Button>
                  <Table dataSource={budgetData} columns={budgetColumns} rowKey="id" />
                </>
              ),
            },
            {
              key: 'contract',
              label: '合同管理',
              children: (
                <>
                  <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                    新增合同
                  </Button>
                  <Table dataSource={contracts} columns={contractColumns} rowKey="id" />
                </>
              ),
            },
            {
              key: 'payment',
              label: '支付管理',
              children: <div>支付管理功能开发中...</div>,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default CostManagement;
