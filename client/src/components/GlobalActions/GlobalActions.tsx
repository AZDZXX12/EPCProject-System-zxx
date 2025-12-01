import React, { useState } from 'react';
import { FloatButton, Tooltip } from 'antd';
import {
  ThunderboltOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import QuickActionsPanel from '../QuickActions/QuickActionsPanel';
import './GlobalActions.css';

/**
 * 全局操作组件
 * 包含：快捷操作面板、通知中心、帮助中心、AI助手
 */
const GlobalActions: React.FC = () => {
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);

  const handleAIClick = () => {
    // 触发AI助手打开事件
    window.dispatchEvent(new CustomEvent('open-ai-assistant'));
  };

  const handleHelpClick = () => {
    // 打开帮助文档
    window.open('/help', '_blank');
  };

  return (
    <>
      {/* 通知中心 - 独立组件，自带浮动按钮 */}
      <NotificationCenter />

      {/* 快捷操作面板 */}
      <QuickActionsPanel
        visible={quickActionsVisible}
        onClose={() => setQuickActionsVisible(false)}
      />

      {/* 浮动按钮组 */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24, bottom: 24 }}
        icon={<ThunderboltOutlined />}
        tooltip="快捷操作"
      >
        <Tooltip title="快捷操作" placement="left">
          <FloatButton
            icon={<ThunderboltOutlined />}
            onClick={() => setQuickActionsVisible(true)}
          />
        </Tooltip>
        
        <Tooltip title="AI助手" placement="left">
          <FloatButton
            icon={<RocketOutlined />}
            onClick={handleAIClick}
            badge={{ dot: true, color: '#52c41a' }}
          />
        </Tooltip>
        
        <Tooltip title="帮助中心" placement="left">
          <FloatButton
            icon={<QuestionCircleOutlined />}
            onClick={handleHelpClick}
          />
        </Tooltip>
      </FloatButton.Group>
    </>
  );
};

export default GlobalActions;
