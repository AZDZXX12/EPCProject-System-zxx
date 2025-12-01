/**
 * AI 甘特图生成器 - Ganttable 核心特色功能
 * 文本生成甘特图（5种输入模式）
 */

import React, { useState } from 'react';
import { Modal, Input, Button, Radio, Space, message, Steps, Card } from 'antd';
import { BulbOutlined, FileTextOutlined, ClockCircleOutlined, CalendarOutlined, FormOutlined } from '@ant-design/icons';
import './AIGanttGenerator.css';

const { TextArea } = Input;
const { Step } = Steps;

interface AIGanttGeneratorProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (tasks: any[]) => void;
}

type InputMode = 'free' | 'structured' | 'timed' | 'dated' | 'full';

export const AIGanttGenerator: React.FC<AIGanttGeneratorProps> = ({ visible, onClose, onGenerate }) => {
  const [inputMode, setInputMode] = useState<InputMode>('free');
  const [inputText, setInputText] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedOutline, setGeneratedOutline] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 示例文本
  const examples: Record<InputMode, string> = {
    free: `我需要一个1500平米自动化厂房施工的项目流程，包括设计、施工、验收等阶段。`,
    structured: `一、策划阶段
  1. 需求分析
  2. 方案设计
  3. 预算编制
二、施工阶段
  1. 场地准备
  2. 主体施工
  3. 设备安装
三、验收阶段
  1. 功能测试
  2. 交付验收`,
    timed: `1. 需求分析（3天）
2. 方案设计（5天）
3. 场地准备（7天）
4. 主体施工（30天）
5. 设备安装（15天）
6. 功能测试（5天）
7. 交付验收（2天）`,
    dated: `数据迁移 2024-01-01 to 2024-01-05
系统培训 2024-01-06 to 2024-01-10
试运行 2024-01-11 to 2024-01-20
正式上线 2024-01-21`,
    full: `【项目名称】厂房自动化改造项目
【项目周期】2024-01-01 至 2024-03-31

阶段一：设计阶段（负责人：张工）
- 需求调研（3天，前置：无）
- 方案设计（5天，前置：需求调研）
- 图纸审核（2天，前置：方案设计）

阶段二：施工阶段（负责人：李工）
- 场地准备（7天，前置：图纸审核）
- 主体施工（30天，前置：场地准备）
- 设备安装（15天，前置：主体施工）

阶段三：验收阶段（负责人：王工）
- 功能测试（5天，前置：设备安装）
- 试运行（10天，前置：功能测试）
- 正式验收（2天，前置：试运行）`
  };

  // 模拟AI解析生成大纲
  const parseTextToOutline = (text: string, mode: InputMode): any[] => {
    // 简单解析逻辑（实际应调用AI服务）
    const lines = text.split('\n').filter(l => l.trim());
    const outline: any[] = [];
    let currentPhase: any = null;
    let taskId = 1;

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // 识别阶段
      if (mode === 'structured') {
        if (/^[一二三四五六七八九十]+、/.test(trimmed) || /^\d+\./.test(trimmed)) {
          const phaseName = trimmed.replace(/^[一二三四五六七八九十]+、/, '').replace(/^\d+\./, '').trim();
          currentPhase = {
            id: `phase_${taskId++}`,
            name: phaseName,
            type: 'phase',
            tasks: []
          };
          outline.push(currentPhase);
        } else if (currentPhase && /^\s+\d+\./.test(line)) {
          const taskName = trimmed.replace(/^\d+\./, '').trim();
          currentPhase.tasks.push({
            id: `task_${taskId++}`,
            name: taskName,
            duration: 5,
            type: 'task'
          });
        }
      } else if (mode === 'timed') {
        const match = trimmed.match(/^(.+?)（(\d+)天）/);
        if (match) {
          outline.push({
            id: `task_${taskId++}`,
            name: match[1],
            duration: parseInt(match[2]),
            type: 'task'
          });
        }
      } else if (mode === 'dated') {
        const match = trimmed.match(/^(.+?)\s+(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/);
        if (match) {
          outline.push({
            id: `task_${taskId++}`,
            name: match[1],
            start_date: match[2],
            end_date: match[3],
            type: 'task'
          });
        }
      } else {
        // 自由描述型，生成通用阶段
        if (outline.length === 0) {
          ['策划阶段', '执行阶段', '验收阶段'].forEach(phase => {
            outline.push({
              id: `phase_${taskId++}`,
              name: phase,
              type: 'phase',
              tasks: [
                { id: `task_${taskId++}`, name: `${phase}任务1`, duration: 5, type: 'task' },
                { id: `task_${taskId++}`, name: `${phase}任务2`, duration: 7, type: 'task' }
              ]
            });
          });
        }
      }
    });

    return outline.length > 0 ? outline : [
      {
        id: 'phase_1',
        name: '默认阶段',
        type: 'phase',
        tasks: [
          { id: 'task_1', name: '任务1', duration: 5, type: 'task' },
          { id: 'task_2', name: '任务2', duration: 7, type: 'task' }
        ]
      }
    ];
  };

  // 步骤1：生成大纲
  const handleGenerateOutline = () => {
    if (!inputText.trim()) {
      message.warning('请输入项目描述');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const outline = parseTextToOutline(inputText, inputMode);
      setGeneratedOutline(outline);
      setCurrentStep(1);
      setLoading(false);
      message.success('大纲生成成功！可以编辑后创建甘特图');
    }, 1000);
  };

  // 步骤2：创建甘特图
  const handleCreateGantt = () => {
    const tasks: any[] = [];
    let startDate = new Date();
    
    generatedOutline.forEach(phase => {
      if (phase.type === 'phase') {
        // 添加阶段任务
        tasks.push({
          id: phase.id,
          text: phase.name,
          start_date: new Date(startDate),
          duration: (phase.tasks?.length || 1) * 5,
          type: 'project',
          open: true
        });

        // 添加子任务
        phase.tasks?.forEach((task: any, idx: number) => {
          const taskStart = new Date(startDate);
          taskStart.setDate(taskStart.getDate() + idx * (task.duration || 5));
          
          tasks.push({
            id: task.id,
            text: task.name,
            start_date: taskStart,
            duration: task.duration || 5,
            parent: phase.id,
            type: 'task'
          });
        });

        startDate.setDate(startDate.getDate() + (phase.tasks?.length || 1) * 5);
      } else {
        // 单个任务
        tasks.push({
          id: phase.id,
          text: phase.name,
          start_date: phase.start_date ? new Date(phase.start_date) : new Date(startDate),
          duration: phase.duration || 5,
          type: 'task'
        });
        startDate.setDate(startDate.getDate() + (phase.duration || 5));
      }
    });

    onGenerate(tasks);
    message.success(`成功创建 ${tasks.length} 个任务！`);
    handleReset();
  };

  // 重置
  const handleReset = () => {
    setCurrentStep(0);
    setInputText('');
    setGeneratedOutline([]);
    onClose();
  };

  // 使用示例
  const useExample = () => {
    setInputText(examples[inputMode]);
  };

  return (
    <Modal
      title={<span><BulbOutlined /> AI 智能生成甘特图</span>}
      open={visible}
      onCancel={handleReset}
      footer={null}
      width={800}
      className="ai-gantt-generator"
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="输入描述" description="选择模式并输入" />
        <Step title="编辑大纲" description="AI生成大纲可编辑" />
        <Step title="创建甘特图" description="一键创建" />
      </Steps>

      {currentStep === 0 && (
        <div className="input-step">
          <Card title="选择输入模式" size="small" style={{ marginBottom: 16 }}>
            <Radio.Group value={inputMode} onChange={(e) => setInputMode(e.target.value)} style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="free">
                  <FileTextOutlined /> <strong>自由描述型</strong> - 适合初次使用，AI自动解析
                </Radio>
                <Radio value="structured">
                  <FormOutlined /> <strong>结构化清单</strong> - 已有阶段划分，准确度高
                </Radio>
                <Radio value="timed">
                  <ClockCircleOutlined /> <strong>带工时任务</strong> - 包含持续时间，最精确
                </Radio>
                <Radio value="dated">
                  <CalendarOutlined /> <strong>精确时间锚点</strong> - 明确开始结束时间
                </Radio>
                <Radio value="full">
                  <BulbOutlined /> <strong>全要素模板</strong> - 包含所有项目信息
                </Radio>
              </Space>
            </Radio.Group>
          </Card>

          <TextArea
            rows={12}
            placeholder={`请输入项目描述...\n\n点击"使用示例"查看${inputMode === 'free' ? '自由描述型' : inputMode === 'structured' ? '结构化清单' : inputMode === 'timed' ? '带工时任务' : inputMode === 'dated' ? '精确时间锚点' : '全要素模板'}示例`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <Space>
            <Button type="primary" onClick={handleGenerateOutline} loading={loading}>
              <BulbOutlined /> 生成大纲
            </Button>
            <Button onClick={useExample}>使用示例</Button>
            <Button onClick={handleReset}>取消</Button>
          </Space>
        </div>
      )}

      {currentStep === 1 && (
        <div className="outline-step">
          <Card title="生成的项目大纲（可编辑）" size="small" style={{ marginBottom: 16 }}>
            <div className="outline-tree">
              {generatedOutline.map(item => (
                <div key={item.id} className="outline-item">
                  <div className="outline-phase">
                    <strong>{item.name}</strong>
                    {item.type === 'phase' && ` (${item.tasks?.length || 0}个任务)`}
                  </div>
                  {item.tasks?.map((task: any) => (
                    <div key={task.id} className="outline-task">
                      └─ {task.name} ({task.duration || 5}天)
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>

          <Space>
            <Button type="primary" onClick={handleCreateGantt}>
              创建甘特图
            </Button>
            <Button onClick={() => setCurrentStep(0)}>返回编辑</Button>
            <Button onClick={handleReset}>取消</Button>
          </Space>
        </div>
      )}
    </Modal>
  );
};

export default AIGanttGenerator;
