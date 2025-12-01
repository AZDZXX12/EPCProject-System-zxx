import React, { useState } from 'react';
import { Card, Select, Row, Col, Statistic, Tag, Space, Button, Table } from 'antd';
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { SwapOutlined, DownloadOutlined, DiffOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './EquipmentComparison.css';

const { Option } = Select;

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'idle' | 'warning' | 'fault';
  metrics: {
    efficiency: number;
    temperature: number;
    power: number;
    reliability: number;
    maintenance: number;
    performance: number;
  };
  stats: {
    runningHours: number;
    failureRate: number;
    avgEfficiency: number;
    maintenanceCost: number;
  };
}

const EquipmentComparison: React.FC = () => {
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>(['eq-001', 'eq-003']);

  // 模拟设备数据
  const mockEquipments: Equipment[] = [
    {
      id: 'eq-001',
      name: '反应釜A',
      type: '反应设备',
      status: 'running',
      metrics: {
        efficiency: 92,
        temperature: 85,
        power: 88,
        reliability: 95,
        maintenance: 78,
        performance: 90
      },
      stats: {
        runningHours: 8500,
        failureRate: 2.3,
        avgEfficiency: 91.5,
        maintenanceCost: 12500
      }
    },
    {
      id: 'eq-003',
      name: '输送泵C',
      type: '输送设备',
      status: 'running',
      metrics: {
        efficiency: 85,
        temperature: 78,
        power: 82,
        reliability: 88,
        maintenance: 85,
        performance: 84
      },
      stats: {
        runningHours: 15000,
        failureRate: 4.1,
        avgEfficiency: 84.2,
        maintenanceCost: 3800
      }
    },
    {
      id: 'eq-005',
      name: '冷却塔B',
      type: '冷却设备',
      status: 'idle',
      metrics: {
        efficiency: 88,
        temperature: 92,
        power: 75,
        reliability: 91,
        maintenance: 90,
        performance: 87
      },
      stats: {
        runningHours: 12000,
        failureRate: 3.2,
        avgEfficiency: 87.8,
        maintenanceCost: 1500
      }
    },
    {
      id: 'eq-007',
      name: '压缩机D',
      type: '压缩设备',
      status: 'warning',
      metrics: {
        efficiency: 80,
        temperature: 70,
        power: 90,
        reliability: 82,
        maintenance: 72,
        performance: 79
      },
      stats: {
        runningHours: 9800,
        failureRate: 5.5,
        avgEfficiency: 79.3,
        maintenanceCost: 8900
      }
    }
  ];

  const handleEquipmentChange = (values: string[]) => {
    if (values.length <= 4) {
      setSelectedEquipments(values);
    }
  };

  const getRadarData = () => {
    const metrics = ['efficiency', 'temperature', 'power', 'reliability', 'maintenance', 'performance'];
    const labels = ['效率', '温度控制', '功耗', '可靠性', '维护性', '性能'];
    
    return metrics.map((metric, index) => {
      const dataPoint: any = { subject: labels[index] };
      selectedEquipments.forEach(eqId => {
        const equipment = mockEquipments.find(e => e.id === eqId);
        if (equipment) {
          dataPoint[equipment.name] = equipment.metrics[metric as keyof typeof equipment.metrics];
        }
      });
      return dataPoint;
    });
  };

  const getBarData = () => {
    return selectedEquipments.map(eqId => {
      const equipment = mockEquipments.find(e => e.id === eqId);
      if (!equipment) return null;
      return {
        name: equipment.name,
        效率: equipment.metrics.efficiency,
        可靠性: equipment.metrics.reliability,
        性能: equipment.metrics.performance
      };
    }).filter(Boolean);
  };

  const getComparisonTableData = () => {
    return selectedEquipments.map(eqId => {
      const equipment = mockEquipments.find(e => e.id === eqId);
      if (!equipment) return null;
      return {
        key: equipment.id,
        name: equipment.name,
        type: equipment.type,
        runningHours: equipment.stats.runningHours,
        failureRate: equipment.stats.failureRate,
        avgEfficiency: equipment.stats.avgEfficiency,
        maintenanceCost: equipment.stats.maintenanceCost,
        status: equipment.status
      };
    }).filter(Boolean) as any[];
  };

  const getStatusTag = (status: string) => {
    const configs = {
      running: { color: 'success', text: '运行中' },
      idle: { color: 'default', text: '空闲' },
      warning: { color: 'warning', text: '告警' },
      fault: { color: 'error', text: '故障' }
    };
    const config = configs[status as keyof typeof configs] || configs.idle;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<any> = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 120,
      render: (text) => <span className="equipment-name">{text}</span>
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      key: 'type',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '运行时长(h)',
      dataIndex: 'runningHours',
      key: 'runningHours',
      width: 120,
      sorter: (a, b) => a.runningHours - b.runningHours,
      render: (value) => value.toLocaleString()
    },
    {
      title: '故障率(%)',
      dataIndex: 'failureRate',
      key: 'failureRate',
      width: 100,
      sorter: (a, b) => a.failureRate - b.failureRate,
      render: (value) => (
        <span className={value > 4 ? 'rate-high' : 'rate-normal'}>
          {value.toFixed(1)}%
        </span>
      )
    },
    {
      title: '平均效率(%)',
      dataIndex: 'avgEfficiency',
      key: 'avgEfficiency',
      width: 120,
      sorter: (a, b) => a.avgEfficiency - b.avgEfficiency,
      render: (value) => (
        <span className={value >= 85 ? 'efficiency-good' : 'efficiency-normal'}>
          {value.toFixed(1)}%
        </span>
      )
    },
    {
      title: '维护成本(¥)',
      dataIndex: 'maintenanceCost',
      key: 'maintenanceCost',
      width: 120,
      sorter: (a, b) => a.maintenanceCost - b.maintenanceCost,
      render: (value) => `¥${value.toLocaleString()}`
    }
  ];

  const handleExport = () => {
    const data = getComparisonTableData();
    const csvContent = [
      ['设备名称', '设备类型', '运行时长', '故障率', '平均效率', '维护成本'].join(','),
      ...data.map(d => [d.name, d.type, d.runningHours, d.failureRate, d.avgEfficiency, d.maintenanceCost].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `设备对比分析_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const radarData = getRadarData();
  const barData = getBarData();
  const selectedEqData = selectedEquipments.map(id => mockEquipments.find(e => e.id === id)).filter(Boolean) as Equipment[];

  return (
    <div className="equipment-comparison">
      <Card
        title={
          <Space>
            <DiffOutlined />
            <span>设备对比分析</span>
            <Tag color="blue">{selectedEquipments.length}/4 已选</Tag>
          </Space>
        }
        extra={
          <Space>
            <Select
              mode="multiple"
              placeholder="选择设备（最多4个）"
              value={selectedEquipments}
              onChange={handleEquipmentChange}
              className="equipment-selector"
              maxTagCount={2}
            >
              {mockEquipments.map(eq => (
                <Option key={eq.id} value={eq.id} disabled={selectedEquipments.length >= 4 && !selectedEquipments.includes(eq.id)}>
                  {eq.name}
                </Option>
              ))}
            </Select>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出报告
            </Button>
          </Space>
        }
        className="comparison-card"
      >
        {/* 统计卡片 */}
        <Row gutter={16} className="metrics-row">
          {selectedEqData.map(eq => (
            <Col span={24 / selectedEquipments.length} key={eq.id}>
              <div className={`metric-card metric-card-${eq.status}`}>
                <div className="metric-header">
                  <span className="metric-name">{eq.name}</span>
                  {getStatusTag(eq.status)}
                </div>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Statistic
                      title="综合效率"
                      value={eq.metrics.efficiency}
                      suffix="%"
                      className="statistic-efficiency"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="可靠性"
                      value={eq.metrics.reliability}
                      suffix="%"
                      className="statistic-reliability"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="运行时长"
                      value={eq.stats.runningHours}
                      suffix="h"
                      className="statistic-hours"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="故障率"
                      value={eq.stats.failureRate}
                      suffix="%"
                      className={eq.stats.failureRate > 4 ? 'statistic-failure-high' : 'statistic-failure-low'}
                    />
                  </Col>
                </Row>
              </div>
            </Col>
          ))}
        </Row>

        {/* 雷达图 */}
        <div className="chart-section">
          <h3 className="section-title">
            <SwapOutlined /> 性能指标对比
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            {/* @ts-ignore - Recharts 3.x 类型兼容性问题 */}
            <RadarChart data={radarData}>
              {/* @ts-ignore */}
              <PolarGrid />
              {/* @ts-ignore */}
              <PolarAngleAxis dataKey="subject" />
              {/* @ts-ignore */}
              <PolarRadiusAxis domain={[0, 100]} />
              {selectedEqData.map((eq, index) => (
                // @ts-ignore
                <Radar
                  key={eq.id}
                  name={eq.name}
                  dataKey={eq.name}
                  stroke={['#1890ff', '#52c41a', '#faad14', '#ff4d4f'][index]}
                  fill={['#1890ff', '#52c41a', '#faad14', '#ff4d4f'][index]}
                  fillOpacity={0.3}
                />
              ))}
              {/* @ts-ignore */}
              <Legend />
              {/* @ts-ignore */}
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 柱状图 */}
        <div className="chart-section">
          <h3 className="section-title">
            <SwapOutlined /> 核心指标对比
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {/* @ts-ignore - Recharts 3.x 类型兼容性问题 */}
            <BarChart data={barData}>
              {/* @ts-ignore */}
              <CartesianGrid strokeDasharray="3 3" />
              {/* @ts-ignore */}
              <XAxis dataKey="name" />
              {/* @ts-ignore */}
              <YAxis domain={[0, 100]} />
              {/* @ts-ignore */}
              <Tooltip />
              {/* @ts-ignore */}
              <Legend />
              {/* @ts-ignore */}
              <Bar dataKey="效率" fill="#1890ff" />
              {/* @ts-ignore */}
              <Bar dataKey="可靠性" fill="#52c41a" />
              {/* @ts-ignore */}
              <Bar dataKey="性能" fill="#faad14" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 对比表格 */}
        <div className="table-section">
          <h3 className="section-title">
            <DiffOutlined /> 详细数据对比
          </h3>
          <Table
            columns={columns}
            dataSource={getComparisonTableData()}
            pagination={false}
            scroll={{ x: 800 }}
            className="comparison-table"
          />
        </div>
      </Card>
    </div>
  );
};

export default EquipmentComparison;
