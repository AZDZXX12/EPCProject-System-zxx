import React, { useState } from 'react';
import { Button, Card, Space, notification, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useProject } from '../contexts/ProjectContext';
import { taskApi } from '../services/api';

/**
 * 测试数据生成器 - 用于快速生成甘特图测试数据
 */
const TestDataGenerator: React.FC = () => {
  const { currentProject } = useProject();
  const [generating, setGenerating] = useState(false);
  const [taskCount, setTaskCount] = useState(10);

  const generateTestTasks = async () => {
    if (!currentProject) {
      notification.error({ message: '请先选择项目' });
      return;
    }

    setGenerating(true);
    try {
      const startDate = new Date();
      const tasks: any[] = [];

      for (let i = 0; i < taskCount; i++) {
        const task = {
          text: `测试任务${i + 1}`,
          start_date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
          duration: Math.floor(Math.random() * 5) + 1,
          progress: Math.random(),
          owner: `负责人${i % 3 + 1}`,
          priority: ['high', 'medium', 'low'][i % 3],
          project_id: currentProject.id
        };

        const result = await taskApi.create(task);
        tasks.push(result);
      }

      notification.success({
        message: '测试数据生成成功',
        description: `已生成 ${taskCount} 个测试任务`
      });

      // 刷新页面以加载新任务
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      notification.error({ message: '生成失败', description: String(error) });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card title="测试数据生成器" style={{ margin: 16 }}>
      <Space>
        <span>生成任务数量：</span>
        <InputNumber
          min={1}
          max={50}
          value={taskCount}
          onChange={(val) => setTaskCount(val || 10)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          loading={generating}
          onClick={generateTestTasks}
          disabled={!currentProject}
        >
          生成测试数据
        </Button>
      </Space>
    </Card>
  );
};

export default TestDataGenerator;
