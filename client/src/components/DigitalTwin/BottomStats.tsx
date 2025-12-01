import React from 'react';
import { Row, Col, Card } from 'antd';
import './BottomStats.css';

interface EquipmentStats {
  running: number;
  idle: number;
  fault: number;
  maintenance: number;
}

interface BottomStatsProps {
  stats: EquipmentStats;
  onStatusClick?: (status: string) => void;
}

const BottomStats: React.FC<BottomStatsProps> = ({ stats, onStatusClick }) => {
  const statItems = [
    {
      key: 'running',
      icon: '🟢',
      value: stats.running,
      label: '运行中',
      className: 'stat-running',
      color: '#52c41a'
    },
    {
      key: 'idle',
      icon: '🔵',
      value: stats.idle,
      label: '待机',
      className: 'stat-idle',
      color: '#1890ff'
    },
    {
      key: 'fault',
      icon: '🔴',
      value: stats.fault,
      label: '故障',
      className: 'stat-fault',
      color: '#ff4d4f'
    },
    {
      key: 'maintenance',
      icon: '🟡',
      value: stats.maintenance,
      label: '维护中',
      className: 'stat-maintenance',
      color: '#faad14'
    }
  ];

  return (
    <div className="bottom-stats">
      <Row gutter={16}>
        {statItems.map(item => (
          <Col xs={12} sm={12} md={6} key={item.key}>
            <Card
              className={`stat-card ${item.className}`}
              hoverable
              onClick={() => onStatusClick?.(item.key)}
            >
              <div className="stat-icon">{item.icon}</div>
              <div className="stat-info">
                <div className={`stat-value stat-value-${item.key}`}>
                  {item.value}
                </div>
                <div className="stat-label">{item.label}</div>
              </div>
              {item.value > 0 && (
                <div className={`stat-badge stat-badge-${item.key}`}>
                  {item.value}台
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BottomStats;
