/**
 * 统一设备选型中心
 * 
 * 功能说明：
 * 1. 离心风机选型 - 根据风量、风压等参数智能推荐风机型号
 * 2. YJV电缆选型 - 根据电流、电压、敷设方式选择合适电缆
 * 3. 在线表格编辑 - 使用Luckysheet进行设备参数表格编辑
 * 
 * 使用流程：
 * 选择工具 → 输入参数 → 查看推荐 → 保存结果 → 导出到采购清单
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Space,
  message,
  Typography,
  Tag,
  Descriptions,
  Alert,
} from 'antd';
import {
  ToolOutlined,
  ThunderboltOutlined,
  TableOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { eventBus, EVENTS } from '../utils/EventBus';
import './EquipmentSelection.css';

const { Title, Text } = Typography;

interface SelectionTool {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  iframeSrc?: string;
  features: string[];
  tag: string;
  tagColor: string;
}

const UnifiedEquipmentSelection: React.FC = () => {
  const [activeKey, setActiveKey] = useState('fan');
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  // 选型工具配置
  const tools: SelectionTool[] = [
    {
      key: 'fan',
      label: '离心风机选型',
      icon: <ToolOutlined />,
      description: '根据风量、风压等参数智能选择合适的离心风机型号',
      iframeSrc: '/fan-selection/index.html',
      features: ['性能曲线图', '功率自动计算', '智能型号推荐', '参数验证'],
      tag: '专业工具',
      tagColor: 'blue',
    },
    {
      key: 'cable',
      label: 'YJV电缆选型',
      icon: <ThunderboltOutlined />,
      description: 'YJV电缆规格完整数据表，支持快速搜索、载流量查询',
      iframeSrc: '/cable-selection/index.html',
      features: ['完整规格表', '载流量计算', '快速搜索', '参数对比'],
      tag: '数据查询',
      tagColor: 'green',
    },
    {
      key: 'table',
      label: '在线表格编辑',
      icon: <TableOutlined />,
      description: '类Excel在线表格系统，支持公式计算、图表制作',
      iframeSrc: '/luckysheet-selection/index.html',
      features: ['Excel导入导出', '公式计算', '图表制作', '协同编辑'],
      tag: '高级功能',
      tagColor: 'orange',
    },
  ];

  useEffect(() => {
    // 初始化loading状态
    const initialLoading: Record<string, boolean> = {};
    tools.forEach(tool => {
      initialLoading[tool.key] = true;
    });
    setLoading(initialLoading);
  }, []);

  const handleIframeLoad = (key: string) => {
    setLoading(prev => ({ ...prev, [key]: false }));
    console.log(`${key} 选型系统加载完成`);
  };

  const handleIframeError = (key: string) => {
    setLoading(prev => ({ ...prev, [key]: false }));
    message.error(`${key} 选型系统加载失败，请刷新重试`);
  };

  const handleFullscreen = () => {
    const iframe = iframeRefs.current[activeKey];
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else {
        message.warning('当前浏览器不支持全屏功能');
      }
    }
  };

  const handleReload = () => {
    const iframe = iframeRefs.current[activeKey];
    if (iframe) {
      setLoading(prev => ({ ...prev, [activeKey]: true }));
      iframe.contentWindow?.location.reload();
      message.info('正在重新加载...');
    }
  };

  const handleSaveSelection = () => {
    const currentTool = tools.find(t => t.key === activeKey);
    message.success(`${currentTool?.label}选型结果已保存`);
    
    // 触发事件通知其他模块
    eventBus.emit(EVENTS.DEVICE_CREATED, {
      type: activeKey,
      toolName: currentTool?.label,
      timestamp: new Date().toISOString(),
    });
  };

  const handleExportToProcurement = () => {
    const currentTool = tools.find(t => t.key === activeKey);
    message.success(`已将${currentTool?.label}结果导出到采购清单`);
    
    eventBus.emit(EVENTS.PROCUREMENT_ITEM_ADDED, {
      materialId: `${activeKey}-${Date.now()}`,
      materialName: currentTool?.label || '设备',
      specification: '待填写',
      quantity: 1,
      estimatedPrice: 0,
      urgency: 'medium',
      reason: `设备选型-${currentTool?.label}`,
    });
  };

  const renderToolbar = () => (
    <Space>
      <Button
        icon={<ReloadOutlined spin={loading[activeKey]} />}
        onClick={handleReload}
        disabled={loading[activeKey]}
      >
        刷新
      </Button>
      <Button
        icon={<FullscreenOutlined />}
        onClick={handleFullscreen}
      >
        全屏
      </Button>
      <Button
        icon={<SaveOutlined />}
        type="primary"
        onClick={handleSaveSelection}
      >
        保存选型
      </Button>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleExportToProcurement}
      >
        导出到采购
      </Button>
    </Space>
  );

  const renderToolInfo = (tool: SelectionTool) => (
    <Alert
      message={
        <Space>
          <Text strong>{tool.label}</Text>
          <Tag color={tool.tagColor}>{tool.tag}</Tag>
        </Space>
      }
      description={
        <div>
          <Text type="secondary">{tool.description}</Text>
          <Descriptions size="small" column={2} style={{ marginTop: 8 }}>
            <Descriptions.Item label="功能特性">
              <Space wrap>
                {tool.features.map((feature, idx) => (
                  <Tag key={idx} color="blue">{feature}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </div>
      }
      type="info"
      showIcon
      icon={<InfoCircleOutlined />}
      style={{ marginBottom: 16 }}
    />
  );

  const renderIframeContent = (tool: SelectionTool) => (
    <div key={tool.key}>
      {renderToolInfo(tool)}
      <Card
        bordered={false}
        bodyStyle={{ padding: 0, height: 'calc(100vh - 320px)' }}
      >
        {loading[tool.key] && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            fontSize: 16,
            color: '#999',
          }}>
            <Space direction="vertical" align="center">
              <ReloadOutlined spin style={{ fontSize: 32 }} />
              <Text>正在加载{tool.label}系统...</Text>
            </Space>
          </div>
        )}
        <iframe
          ref={el => { iframeRefs.current[tool.key] = el; }}
          src={tool.iframeSrc}
          title={tool.label}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: loading[tool.key] ? 'none' : 'block',
          }}
          onLoad={() => handleIframeLoad(tool.key)}
          onError={() => handleIframeError(tool.key)}
        />
      </Card>
    </div>
  );

  const tabItems = tools.map(tool => ({
    key: tool.key,
    label: (
      <Space>
        {tool.icon}
        <span>{tool.label}</span>
      </Space>
    ),
    children: renderIframeContent(tool),
  }));

  return (
    <div className="unified-equipment-selection">
      <Card
        title={
          <Space>
            <ToolOutlined />
            <Title level={4} style={{ margin: 0 }}>设备选型中心</Title>
          </Space>
        }
        extra={renderToolbar()}
      >
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
};

export default UnifiedEquipmentSelection;
