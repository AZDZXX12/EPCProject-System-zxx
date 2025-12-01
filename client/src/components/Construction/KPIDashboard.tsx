import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Tag } from 'antd';
import {
  RiseOutlined,
  DollarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import './KPIDashboard.css';

interface WeatherData {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  temperature: number;
  humidity?: number;
}

interface KPIData {
  totalProgress: number;
  completedValue: number;
  workers: number;
  qualityRate: number;
  safetyDays: number;
  weather: WeatherData;
}

interface KPIDashboardProps {
  data?: KPIData;
}

const defaultData: KPIData = {
  totalProgress: 65,
  completedValue: 3250,
  workers: 128,
  qualityRate: 98.5,
  safetyDays: 180,
  weather: {
    condition: 'sunny',
    temperature: 25,
    humidity: 65
  }
};

const KPIDashboard: React.FC<KPIDashboardProps> = ({ data = defaultData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (condition: string) => {
    const iconMap: Record<string, string> = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      snowy: '❄️',
      windy: '💨'
    };
    return iconMap[condition] || '☀️';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return '#52c41a';
    if (progress >= 70) return '#1890ff';
    if (progress >= 50) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <div className="construction-kpi-dashboard">
      <Row gutter={16} className="kpi-row">
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="kpi-card kpi-progress" hoverable>
            <div className="kpi-icon">
              <RiseOutlined />
            </div>
            <Statistic
              title="总体进度"
              value={data.totalProgress}
              suffix="%"
              valueStyle={{ color: getProgressColor(data.totalProgress), fontSize: '28px', fontWeight: 700 }}
            />
            <div className="kpi-trend">
              <Tag color="green">▲ +2%</Tag>
              <span className="kpi-label">本周</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="kpi-card kpi-value" hoverable>
            <div className="kpi-icon">
              <DollarOutlined />
            </div>
            <Statistic
              title="完成产值"
              value={data.completedValue}
              suffix="万元"
              precision={0}
              valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 700 }}
            />
            <div className="kpi-trend">
              <Tag color="blue">本月</Tag>
              <span className="kpi-label">+420万</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="kpi-card kpi-workers" hoverable>
            <div className="kpi-icon">
              <TeamOutlined />
            </div>
            <Statistic
              title="施工人员"
              value={data.workers}
              suffix="人"
              valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 700 }}
            />
            <div className="kpi-trend">
              <Tag color="cyan">在岗</Tag>
              <span className="kpi-label">出勤率98%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="kpi-card kpi-quality" hoverable>
            <div className="kpi-icon">
              <CheckCircleOutlined />
            </div>
            <Statistic
              title="质量合格率"
              value={data.qualityRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 700 }}
            />
            <div className="kpi-trend">
              <Tag color="success">优秀</Tag>
              <span className="kpi-label">连续3月</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="kpi-card kpi-safety" hoverable>
            <div className="kpi-icon">
              <SafetyOutlined />
            </div>
            <Statistic
              title="安全天数"
              value={data.safetyDays}
              suffix="天"
              valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 700 }}
            />
            <div className="kpi-trend">
              <Tag color="warning">0事故</Tag>
              <span className="kpi-label">连续记录</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="kpi-card kpi-weather" hoverable>
            <div className="kpi-icon weather-icon">
              {getWeatherIcon(data.weather.condition)}
            </div>
            <div className="weather-info">
              <div className="weather-temp">{data.weather.temperature}°C</div>
              <div className="weather-condition">
                {data.weather.condition === 'sunny' && '晴天'}
                {data.weather.condition === 'cloudy' && '多云'}
                {data.weather.condition === 'rainy' && '雨天'}
                {data.weather.condition === 'snowy' && '雪天'}
                {data.weather.condition === 'windy' && '大风'}
              </div>
            </div>
            <div className="kpi-trend">
              <Tag color="blue">湿度</Tag>
              <span className="kpi-label">{data.weather.humidity}%</span>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="kpi-time">
        <ClockCircleOutlined />
        <span>{currentTime.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })}</span>
      </div>
    </div>
  );
};

export default KPIDashboard;
