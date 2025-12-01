import React, { useEffect, useState } from 'react';
import { Progress } from 'antd';
import { 
  ThunderboltOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  LineChartOutlined,
  FireOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import './StatCard.css';

export interface StatCardProps {
  title: string;
  value: number;
  unit?: string;
  total?: number;
  color: 'blue' | 'green' | 'orange' | 'red' | 'cyan';
  icon?: React.ReactNode;
  trend?: { value: number; type: 'up' | 'down' };
  pulse?: boolean;
  realtime?: boolean;
  progress?: boolean;
}

// 数字滚动动画组件
const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({ 
  value, 
  duration = 800 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // 使用 easeOutQuad 缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * easeProgress;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{Math.round(displayValue)}</>;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  total,
  color,
  icon,
  trend,
  pulse = false,
  realtime = false,
  progress = true
}) => {
  const colorMap = {
    blue: {
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      color: '#3b82f6',
      light: 'rgba(59, 130, 246, 0.1)'
    },
    green: {
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#10b981',
      light: 'rgba(16, 185, 129, 0.1)'
    },
    orange: {
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: '#f59e0b',
      light: 'rgba(245, 158, 11, 0.1)'
    },
    red: {
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: '#ef4444',
      light: 'rgba(239, 68, 68, 0.1)'
    },
    cyan: {
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      color: '#06b6d4',
      light: 'rgba(6, 182, 212, 0.1)'
    }
  };

  const defaultIcons = {
    blue: <LineChartOutlined />,
    green: <CheckCircleOutlined />,
    orange: <FireOutlined />,
    red: <WarningOutlined />,
    cyan: <ThunderboltOutlined />
  };

  const currentColor = colorMap[color];
  const displayIcon = icon || defaultIcons[color];

  return (
    <div className={`stat-card stat-card-${color} ${pulse ? 'stat-card-pulse' : ''}`}>
      <div className="stat-card-icon" style={{ background: currentColor.gradient }}>
        {displayIcon}
        <div className="stat-card-icon-glow" style={{ background: currentColor.gradient }} />
      </div>
      
      <div className="stat-card-content">
        <div className="stat-card-title">{title}</div>
        
        <div className="stat-card-value-wrapper">
          <div className="stat-card-value">
            {realtime ? <AnimatedNumber value={value} /> : value}
            {unit && <span className="stat-card-unit">{unit}</span>}
            {total !== undefined && (
              <span className="stat-card-total">/{total}</span>
            )}
          </div>
          
          {trend && (
            <div className={`stat-card-trend trend-${trend.type}`}>
              {trend.type === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {progress && (
          <Progress 
            percent={total ? (value / total) * 100 : value} 
            strokeColor={currentColor.gradient}
            trailColor="rgba(0, 0, 0, 0.05)"
            showInfo={false}
            size="small"
            strokeLinecap="round"
          />
        )}
      </div>

      {pulse && (
        <>
          <div className="stat-card-pulse-ring" style={{ borderColor: currentColor.color }} />
          <div className="stat-card-pulse-ring-2" style={{ borderColor: currentColor.color }} />
        </>
      )}
    </div>
  );
};

export default StatCard;
