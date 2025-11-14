import React from 'react';
import { Modal } from 'antd';

interface TaskDetailProps {
  visible: boolean;
  onClose: () => void;
  taskId?: string;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ visible, onClose }) => {
  return (
    <Modal title="任务详情" open={visible} onCancel={onClose} footer={null} width={800}>
      <div style={{ padding: '20px' }}>任务详情功能开发中...</div>
    </Modal>
  );
};

export default TaskDetail;
