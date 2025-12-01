import React from 'react';
import './MiniStatCard.css';

interface MiniStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: 'green' | 'blue' | 'red' | 'orange' | 'yellow';
  pulse?: boolean;
}

const MiniStatCard: React.FC<MiniStatCardProps> = ({
  icon,
  label,
  value,
  color = 'blue',
  pulse = false
}) => {
  return (
    <div className={`mini-stat-card mini-stat-${color} ${pulse ? 'pulse' : ''}`}>
      <div className="mini-stat-icon">
        {icon}
      </div>
      <div className="mini-stat-content">
        <div className="mini-stat-label">{label}</div>
        <div className="mini-stat-value">{value}</div>
      </div>
    </div>
  );
};

export default MiniStatCard;
