/**
 * 报表系统
 * 参考：Worktile + 建文云
 */

import React, { useState } from 'react';
import { Card, Table, Select, DatePicker, Button, Space, Row, Col, Statistic, Progress } from 'antd';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportingSystem: React.FC = () => {
  const [reportType, setReportType] = useState('project');

  const projectData = [
    { name: '立项', value: 10 },
    { name: '设计', value: 15 },
    { name: '采购', value: 20 },
    { name: '施工', value: 35 },
    { name: '验收', value: 20 },
  ];

  const progressData = [
    { month: '1月', progress: 10 },
    { month: '2月', progress: 25 },
    { month: '3月', progress: 45 },
    { month: '4月', progress: 65 },
    { month: '5月', progress: 80 },
  ];

  const costData = [
    { category: '设备费', budget: 500, actual: 480 },
    { category: '人工费', budget: 200, actual: 210 },
    { category: '材料费', budget: 300, actual: 280 },
  ];

  const exportReport = (format: 'excel' | 'pdf') => {
    console.log(`导出${format}报表`);
  };

  return (
    <Card
      title="数据报表"
      extra={
        <Space>
          <Select value={reportType} onChange={setReportType} style={{ width: 150 }}>
            <Select.Option value="project">项目报表</Select.Option>
            <Select.Option value="cost">成本报表</Select.Option>
            <Select.Option value="progress">进度报表</Select.Option>
            <Select.Option value="quality">质量报表</Select.Option>
          </Select>
          <RangePicker />
          <Button icon={<FileExcelOutlined />} onClick={() => exportReport('excel')}>
            导出Excel
          </Button>
          <Button icon={<FilePdfOutlined />} onClick={() => exportReport('pdf')}>
            导出PDF
          </Button>
        </Space>
      }
    >
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="项目总数" value={25} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="进行中" value={15} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成" value={8} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均进度" value={68} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="项目阶段分布" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={projectData} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="#8884d8" dataKey="value">
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="进度趋势" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="progress" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="成本对比" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#8884d8" name="预算" />
                <Bar dataKey="actual" fill="#82ca9d" name="实际" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default ReportingSystem;
