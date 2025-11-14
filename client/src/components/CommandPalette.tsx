import React from 'react';
import { Modal } from 'antd';

interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ visible, onClose }) => {
  return (
    <Modal title="快捷命令" open={visible} onCancel={onClose} footer={null} width={600}>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        命令面板功能暂时禁用，正在修复中...
      </div>
    </Modal>
  );
};

export default CommandPalette;
