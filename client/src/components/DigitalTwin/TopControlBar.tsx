import React, { useState, useEffect } from 'react';
import { Button, Tag } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  WarningOutlined,
  FireOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import MiniStatCard from './MiniStatCard';
import './TopControlBar.css';

interface SystemStats {
  runningCount: number;
  totalEfficiency: number;
  alarmCount: number;
  totalPower: number;
}

interface TopControlBarProps {
  isRunning: boolean;
  onToggle: () => void;
  stats: SystemStats;
}

const TopControlBar: React.FC<TopControlBarProps> = ({
  isRunning,
  onToggle,
  stats
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="top-control-bar">
      {/* 左侧：控制按钮 */}
      <div className="control-section">
        <Button
          type={isRunning ? 'default' : 'primary'}
          size="large"
          icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={onToggle}
          danger={isRunning}
          className="control-btn"
        >
          {isRunning ? '停止运行' : '启动运行'}
        </Button>
        <Tag 
          color={isRunning ? 'success' : 'default'} 
          icon={<SyncOutlined spin={isRunning} />}
          className="status-tag"
        >
          {isRunning ? '实时运行' : '待启动'}
        </Tag>
      </div>

      {/* 中间：关键指标卡片 */}
      <div className="stats-section">
        <MiniStatCard
          icon={<ThunderboltOutlined />}
          label="运行设备"
          value={`${stats.runningCount}台`}
          color="green"
        />
        <MiniStatCard
          icon={<LineChartOutlined />}
          label="系统效率"
          value={`${stats.totalEfficiency.toFixed(1)}%`}
          color="blue"
        />
        <MiniStatCard
          icon={<WarningOutlined />}
          label="未确认报警"
          value={stats.alarmCount}
          color={stats.alarmCount > 0 ? 'red' : 'green'}
          pulse={stats.alarmCount > 0}
        />
        <MiniStatCard
          icon={<FireOutlined />}
          label="总功率"
          value={`${stats.totalPower.toFixed(1)}kW`}
          color="orange"
        />
      </div>

      {/* 右侧：时间和信息 */}
      <div className="info-section">
        <div className="current-time">
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
    </div>
  );
};

export default TopControlBar;
