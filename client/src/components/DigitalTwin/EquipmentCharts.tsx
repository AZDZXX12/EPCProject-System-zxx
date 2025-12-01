import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Space, Tag, Button } from 'antd';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChartOutlined, BarChartOutlined, AreaChartOutlined, DownloadOutlined } from '@ant-design/icons';
import './EquipmentCharts.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ChartDataPoint {
  time: string;
  efficiency: number;
  temperature: number;
  power: number;
  target: number;
}

interface EquipmentChartsProps {
  equipmentId?: string;
}

const EquipmentCharts: React.FC<EquipmentChartsProps> = ({ equipmentId }) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [selectedMetric, setSelectedMetric] = useState('efficiency');
  
  // 模拟实时数据
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    // 生成模拟数据
    const generateData = (): ChartDataPoint[] => {
      const data: ChartDataPoint[] = [];
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600000);
        data.push({
          time: `${time.getHours()}:00`,
          efficiency: 85 + Math.random() * 15,
          temperature: 45 + Math.random() * 25,
          power: 150 + Math.random() * 50,
          target: 90,
        });
      }
      return data;
    };

    setChartData(generateData());

    // 每30秒更新一次数据
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: `${now.getHours()}:${now.getMinutes()}`,
          efficiency: 85 + Math.random() * 15,
          temperature: 45 + Math.random() * 25,
          power: 150 + Math.random() * 50,
          target: 90,
        });
        return newData;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const metricOptions = [
    { value: 'efficiency', label: '设备效率', unit: '%', color: '#1890ff' },
    { value: 'temperature', label: '设备温度', unit: '°C', color: '#ff4d4f' },
    { value: 'power', label: '功率消耗', unit: 'kW', color: '#52c41a' },
  ];

  const currentMetric = metricOptions.find(m => m.value === selectedMetric)!;

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 20, left: 0, bottom: 5 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#8c8c8c" />
            <YAxis stroke="#8c8c8c" />
            <Tooltip 
              contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            <Bar dataKey={selectedMetric} fill={currentMetric.color} name={currentMetric.label} radius={[8, 8, 0, 0]} />
            {selectedMetric === 'efficiency' && <Bar dataKey="target" fill="#52c41a" name="目标值" radius={[8, 8, 0, 0]} opacity={0.3} />}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#8c8c8c" />
            <YAxis stroke="#8c8c8c" />
            <Tooltip 
              contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            <Area type="monotone" dataKey={selectedMetric} stroke={currentMetric.color} fillOpacity={1} fill="url(#colorMetric)" name={currentMetric.label} />
            {selectedMetric === 'efficiency' && <Area type="monotone" dataKey="target" stroke="#52c41a" fill="none" strokeDasharray="5 5" name="目标值" />}
          </AreaChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#8c8c8c" />
            <YAxis stroke="#8c8c8c" />
            <Tooltip 
              contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            <Line type="monotone" dataKey={selectedMetric} stroke={currentMetric.color} strokeWidth={3} dot={{ fill: currentMetric.color, r: 4 }} name={currentMetric.label} />
            {selectedMetric === 'efficiency' && <Line type="monotone" dataKey="target" stroke="#52c41a" strokeWidth={2} strokeDasharray="5 5" dot={false} name="目标值" />}
          </LineChart>
        );
    }
  };

  const handleExport = () => {
    // 导出CSV逻辑
    const csvContent = [
      ['时间', currentMetric.label, '目标值'].join(','),
      ...chartData.map(d => [d.time, d[selectedMetric], d.target || ''].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `设备数据_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  return (
    <div className="equipment-charts">
      <Card
        title={
          <Space>
            <LineChartOutlined />
            <span>实时数据趋势</span>
            <Tag color="blue">实时更新</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button.Group>
              <Button
                type={chartType === 'line' ? 'primary' : 'default'}
                icon={<LineChartOutlined />}
                onClick={() => setChartType('line')}
              >
                折线图
              </Button>
              <Button
                type={chartType === 'bar' ? 'primary' : 'default'}
                icon={<BarChartOutlined />}
                onClick={() => setChartType('bar')}
              >
                柱状图
              </Button>
              <Button
                type={chartType === 'area' ? 'primary' : 'default'}
                icon={<AreaChartOutlined />}
                onClick={() => setChartType('area')}
              >
                面积图
              </Button>
            </Button.Group>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
          </Space>
        }
        className="charts-card"
      >
        <Row gutter={16} className="chart-controls">
          <Col span={12}>
            <Space>
              <span>指标：</span>
              <Select
                value={selectedMetric}
                onChange={setSelectedMetric}
                className="metric-select"
              >
                {metricOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    <span className={`metric-option-dot-${option.value}`}>●</span> {option.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col span={12}>
            <Space>
              <span>时间范围：</span>
              <RangePicker showTime />
            </Space>
          </Col>
        </Row>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            {renderChart()}
          </ResponsiveContainer>
        </div>

        <Row gutter={16} className="chart-stats">
          <Col span={8}>
            <div className="stat-item">
              <div className="stat-label">当前值</div>
              <div className="stat-value stat-value-primary">
                {chartData.length > 0 ? chartData[chartData.length - 1][selectedMetric].toFixed(1) : '-'}
                <span className="stat-unit">{currentMetric.unit}</span>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="stat-item">
              <div className="stat-label">平均值</div>
              <div className="stat-value">
                {chartData.length > 0 
                  ? (chartData.reduce((sum, d) => sum + d[selectedMetric], 0) / chartData.length).toFixed(1)
                  : '-'}
                <span className="stat-unit">{currentMetric.unit}</span>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="stat-item">
              <div className="stat-label">最大值</div>
              <div className="stat-value">
                {chartData.length > 0
                  ? Math.max(...chartData.map(d => d[selectedMetric])).toFixed(1)
                  : '-'}
                <span className="stat-unit">{currentMetric.unit}</span>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EquipmentCharts;
