import React, { useMemo } from 'react';
import { Tooltip } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import './WorkloadHeatmap.css';

interface Task {
  id: string;
  text: string;
  start_date: Date;
  end_date: Date;
  [key: string]: any;
}

interface WorkloadData {
  date: Date;
  taskCount: number;
  tasks: Task[];
  intensity: 'none' | 'low' | 'medium' | 'high';
}

interface WorkloadHeatmapProps {
  tasks: Task[];
  onDateClick?: (date: Date, tasks: Task[]) => void;
}

const WorkloadHeatmap: React.FC<WorkloadHeatmapProps> = ({ tasks, onDateClick }) => {
  
  const heatmapData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    // 找出日期范围
    const dates = tasks.flatMap(t => [new Date(t.start_date), new Date(t.end_date)]);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // 生成每一天的数据
    const data: WorkloadData[] = [];
    const currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      const dateStr = currentDate.toDateString();
      const tasksOnDate = tasks.filter(task => {
        const start = new Date(task.start_date);
        const end = new Date(task.end_date);
        return currentDate >= start && currentDate <= end;
      });
      
      const taskCount = tasksOnDate.length;
      let intensity: 'none' | 'low' | 'medium' | 'high' = 'none';
      
      if (taskCount === 0) intensity = 'none';
      else if (taskCount <= 3) intensity = 'low';
      else if (taskCount <= 6) intensity = 'medium';
      else intensity = 'high';
      
      data.push({
        date: new Date(currentDate),
        taskCount,
        tasks: tasksOnDate,
        intensity
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  }, [tasks]);
  
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  const handleCellClick = (data: WorkloadData) => {
    if (onDateClick && data.taskCount > 0) {
      onDateClick(data.date, data.tasks);
    }
  };
  
  if (heatmapData.length === 0) return null;
  
  return (
    <div className="workload-heatmap-container">
      <div className="workload-heatmap-title">
        <FireOutlined />
        工作负载热力图（点击日期查看任务）
      </div>
      
      <div className="workload-heatmap">
        {heatmapData.map((data, index) => (
          <Tooltip
            key={index}
            title={
              <div>
                <div className="workload-tooltip-date">{formatDate(data.date)}</div>
                <div>{data.taskCount} 个任务</div>
                {data.tasks.length > 0 && (
                  <div className="workload-tooltip-tasks">
                    {data.tasks.slice(0, 3).map(t => (
                      <div key={t.id}>• {t.text}</div>
                    ))}
                    {data.tasks.length > 3 && <div>...等{data.tasks.length}个</div>}
                  </div>
                )}
              </div>
            }
          >
            <div
              className={`workload-cell intensity-${data.intensity}`}
              onClick={() => handleCellClick(data)}
            >
              {data.taskCount > 0 ? data.taskCount : ''}
            </div>
          </Tooltip>
        ))}
      </div>
      
      <div className="workload-legend">
        <div className="workload-legend-item">
          <div className="workload-legend-color none" />
          <span>无任务</span>
        </div>
        <div className="workload-legend-item">
          <div className="workload-legend-color low" />
          <span>1-3个任务（轻度）</span>
        </div>
        <div className="workload-legend-item">
          <div className="workload-legend-color medium" />
          <span>4-6个任务（中度）</span>
        </div>
        <div className="workload-legend-item">
          <div className="workload-legend-color high" />
          <span>7+个任务（高负载⚠️）</span>
        </div>
      </div>
    </div>
  );
};

export default WorkloadHeatmap;
