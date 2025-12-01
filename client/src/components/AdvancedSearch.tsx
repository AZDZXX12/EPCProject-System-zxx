/**
 * 高级搜索组件
 */

import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Space, Button, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface SearchFilters {
  keyword?: string;
  type?: string[];
  status?: string[];
  dateRange?: [string, string];
  priority?: string[];
}

const AdvancedSearch: React.FC<{ visible: boolean; onClose: () => void; onSearch: (filters: SearchFilters) => void }> = ({
  visible,
  onClose,
  onSearch,
}) => {
  const [form] = Form.useForm();

  const handleSearch = async () => {
    const values = await form.validateFields();
    onSearch(values);
    onClose();
  };

  return (
    <Modal title="高级搜索" open={visible} onCancel={onClose} onOk={handleSearch} width={600}>
      <Form form={form} layout="vertical">
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="搜索任务、项目、文档..." prefix={<SearchOutlined />} />
        </Form.Item>
        <Form.Item name="type" label="类型">
          <Select mode="multiple" placeholder="选择类型">
            <Select.Option value="task">任务</Select.Option>
            <Select.Option value="project">项目</Select.Option>
            <Select.Option value="document">文档</Select.Option>
            <Select.Option value="issue">问题</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select mode="multiple" placeholder="选择状态">
            <Select.Option value="todo">待办</Select.Option>
            <Select.Option value="in_progress">进行中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="priority" label="优先级">
          <Select mode="multiple" placeholder="选择优先级">
            <Select.Option value="high">高</Select.Option>
            <Select.Option value="medium">中</Select.Option>
            <Select.Option value="low">低</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="dateRange" label="日期范围">
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdvancedSearch;
