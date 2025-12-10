/**
 * 统一空状态组件
 * 提供友好的空数据提示
 */
import React, { ReactNode } from 'react';
import { Empty, Button } from 'antd';
import {
  InboxOutlined,
  FileOutlined,
  FolderOpenOutlined,
  SearchOutlined,
  SmileOutlined,
  FrownOutlined
} from '@ant-design/icons';
import './EmptyState.css';

interface EmptyStateProps {
  type?: 'default' | 'search' | 'file' | 'folder' | 'success' | 'error';
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  image?: string;
  imageStyle?: React.CSSProperties;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  icon,
  title,
  description,
  action,
  image,
  imageStyle
}) => {
  // 根据类型选择默认图标和文案
  const getDefaultConfig = () => {
    switch (type) {
      case 'search':
        return {
          icon: <SearchOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
          title: title || '未找到相关内容',
          description: description || '请尝试其他搜索关键词'
        };
      case 'file':
        return {
          icon: <FileOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
          title: title || '暂无文件',
          description: description || '点击下方按钮上传文件'
        };
      case 'folder':
        return {
          icon: <FolderOpenOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
          title: title || '文件夹为空',
          description: description || '这里还没有任何内容'
        };
      case 'success':
        return {
          icon: <SmileOutlined style={{ fontSize: 64, color: '#52c41a' }} />,
          title: title || '太棒了！',
          description: description || '所有任务都已完成'
        };
      case 'error':
        return {
          icon: <FrownOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />,
          title: title || '出错了',
          description: description || '请稍后重试或联系管理员'
        };
      default:
        return {
          icon: <InboxOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
          title: title || '暂无数据',
          description: description || '这里还没有任何内容'
        };
    }
  };

  const config = getDefaultConfig();

  return (
    <div className="empty-state-container">
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={imageStyle || { height: 100 }}
        description={
          <div className="empty-state-content">
            {icon || config.icon}
            <div className="empty-state-title">{config.title}</div>
            <div className="empty-state-description">{config.description}</div>
          </div>
        }
      >
        {action && <div className="empty-state-action">{action}</div>}
      </Empty>
    </div>
  );
};

export default EmptyState;
