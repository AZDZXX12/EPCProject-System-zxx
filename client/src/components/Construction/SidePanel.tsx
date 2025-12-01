import React from 'react';
import { Card, List, Badge, Tag, Button, Space, Progress, Timeline, Alert } from 'antd';
import {
  CheckOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  SunOutlined,
  CloudOutlined,
  RightOutlined
} from '@ant-design/icons';
import './SidePanel.css';

interface SidePanelProps {
  onTaskClick?: (taskId: string) => void;
  onLogClick?: (logId: string) => void;
  onIssueClick?: (issueId: string) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  onTaskClick,
  onLogClick,
  onIssueClick
}) => {
  // 模拟数据
  const todayTasks = [
    { id: '1', title: '混凝土浇筑', status: 'in_progress', progress: 65, urgent: true },
    { id: '2', title: '钢筋绑扎检查', status: 'pending', progress: 0, urgent: false },
    { id: '3', title: '模板验收', status: 'completed', progress: 100, urgent: false },
    { id: '4', title: '基础回填', status: 'in_progress', progress: 30, urgent: false },
    { id: '5', title: '安全培训', status: 'pending', progress: 0, urgent: true },
  ];

  const latestLogs = [
    { id: '1', title: '上午施工日志', time: '11:30', author: '张三' },
    { id: '2', title: '质量检查记录', time: '10:15', author: '李四' },
    { id: '3', title: '安全巡检记录', time: '09:00', author: '王五' },
  ];

  const pendingIssues = [
    { id: '1', title: '3号楼2层钢筋规格不符', level: 'high', days: 2 },
    { id: '2', title: '西侧围墙基础沉降', level: 'medium', days: 5 },
    { id: '3', title: '施工材料堆放不规范', level: 'low', days: 1 },
  ];

  const weatherForecast = [
    { day: '今天', date: '11-26', icon: 'sunny', temp: '18-25°C', suitable: true },
    { day: '明天', date: '11-27', icon: 'cloudy', temp: '16-23°C', suitable: true },
    { day: '后天', date: '11-28', icon: 'rainy', temp: '14-20°C', suitable: false },
  ];

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      completed: { color: 'success', text: '已完成' },
      in_progress: { color: 'processing', text: '进行中' },
      pending: { color: 'default', text: '待开始' },
    };
    const config = map[status] || map.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getLevelBadge = (level: string) => {
    const map: Record<string, { status: 'error' | 'warning' | 'success'; text: string }> = {
      high: { status: 'error', text: '高' },
      medium: { status: 'warning', text: '中' },
      low: { status: 'success', text: '低' },
    };
    const config = map[level] || map.low;
    return <Badge status={config.status} text={`${config.text}风险`} />;
  };

  const getWeatherIcon = (icon: string) => {
    if (icon === 'sunny') return <SunOutlined className="weather-sunny" />;
    if (icon === 'cloudy') return <CloudOutlined className="weather-cloudy" />;
    return <ThunderboltOutlined className="weather-rainy" />;
  };

  return (
    <div className="construction-side-panel">
      {/* 今日待办 */}
      <Card
        title={
          <Space>
            <CheckOutlined />
            <span>今日待办</span>
            <Badge count={todayTasks.filter(t => t.status !== 'completed').length} />
          </Space>
        }
        size="small"
        className="panel-card"
      >
        <List
          dataSource={todayTasks}
          split={false}
          renderItem={task => (
            <List.Item
              className={`task-item ${task.urgent ? 'urgent' : ''}`}
              onClick={() => onTaskClick?.(task.id)}
            >
              <div className="task-content">
                <div className="task-header">
                  <span className="task-title">{task.title}</span>
                  {task.urgent && <Tag color="red" className="urgent-tag">紧急</Tag>}
                </div>
                <div className="task-footer">
                  {getStatusTag(task.status)}
                  {task.status === 'in_progress' && (
                    <Progress percent={task.progress} size="small" className="task-progress" />
                  )}
                </div>
              </div>
              <RightOutlined className="task-arrow" />
            </List.Item>
          )}
        />
      </Card>

      {/* 最新日志 */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>最新日志</span>
          </Space>
        }
        size="small"
        className="panel-card"
      >
        <Timeline>
          {latestLogs.map(log => (
            <Timeline.Item key={log.id}>
              <div className="log-item" onClick={() => onLogClick?.(log.id)}>
                <div className="log-title">{log.title}</div>
                <div className="log-meta">
                  {log.time} · {log.author}
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* 待整改问题 */}
      <Card
        title={
          <Space>
            <WarningOutlined />
            <span>待整改问题</span>
            <Badge count={pendingIssues.length} />
          </Space>
        }
        size="small"
        className="panel-card"
      >
        <List
          dataSource={pendingIssues}
          split={false}
          renderItem={issue => (
            <List.Item className="issue-item" onClick={() => onIssueClick?.(issue.id)}>
              <div className="issue-content">
                <div className="issue-title">{issue.title}</div>
                <Space size="small">
                  {getLevelBadge(issue.level)}
                  <span className="issue-days">{issue.days}天未处理</span>
                </Space>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* 天气预报 */}
      <Card
        title={
          <Space>
            <SunOutlined />
            <span>天气预报</span>
          </Space>
        }
        size="small"
        className="panel-card weather-card"
      >
        {weatherForecast.map((weather, index) => (
          <div key={index} className={`weather-item ${!weather.suitable ? 'not-suitable' : ''}`}>
            <div className="weather-day">
              <div className="weather-label">{weather.day}</div>
              <div className="weather-date">{weather.date}</div>
            </div>
            <div className="weather-icon-box">
              {getWeatherIcon(weather.icon)}
            </div>
            <div className="weather-temp">{weather.temp}</div>
            <div className="weather-suitable">
              {weather.suitable ? (
                <Tag color="success" className="suitable-tag">适宜施工</Tag>
              ) : (
                <Tag color="error" className="suitable-tag">不宜施工</Tag>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* 快速操作 */}
      <Card
        title="快速操作"
        size="small"
        className="panel-card"
      >
        <Space direction="vertical" className="quick-actions">
          <Button type="primary" block icon={<CheckOutlined />}>
            新建施工日志
          </Button>
          <Button block>质量检查记录</Button>
          <Button block>安全巡检记录</Button>
          <Button block>设备使用申请</Button>
        </Space>
      </Card>
    </div>
  );
};

export default SidePanel;
