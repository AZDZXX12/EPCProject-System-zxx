import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, InputNumber, Input, Button, Space } from 'antd';
import { FilterConfig } from '../SearchBar/SearchBar';
import dayjs from 'dayjs';
import './AdvancedFilter.css';

const { RangePicker } = DatePicker;

interface AdvancedFilterProps {
  visible: boolean;
  filters: FilterConfig[];
  values?: Record<string, any>;
  onApply: (values: Record<string, any>) => void;
  onCancel: () => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  visible,
  filters,
  values = {},
  onApply,
  onCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      // 转换日期值
      const formValues = { ...values };
      filters.forEach(filter => {
        if (filter.type === 'date' && formValues[filter.key]) {
          formValues[filter.key] = dayjs(formValues[filter.key]);
        } else if (filter.type === 'dateRange' && formValues[filter.key]) {
          formValues[filter.key] = [
            dayjs(formValues[filter.key][0]),
            dayjs(formValues[filter.key][1]),
          ];
        }
      });
      form.setFieldsValue(formValues);
    }
  }, [visible, values, filters, form]);

  const handleOk = () => {
    form.validateFields().then(formValues => {
      // 转换日期为字符串
      const result: Record<string, any> = {};
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const filter = filters.find(f => f.key === key);
          if (filter?.type === 'date' && dayjs.isDayjs(value)) {
            result[key] = value.format('YYYY-MM-DD');
          } else if (filter?.type === 'dateRange' && Array.isArray(value)) {
            result[key] = [
              value[0].format('YYYY-MM-DD'),
              value[1].format('YYYY-MM-DD'),
            ];
          } else {
            result[key] = value;
          }
        }
      });
      onApply(result);
    });
  };

  const handleReset = () => {
    form.resetFields();
  };

  const renderFilterField = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'select':
        return (
          <Select
            placeholder={filter.placeholder || `请选择${filter.label}`}
            options={filter.options}
            allowClear
          />
        );

      case 'date':
        return (
          <DatePicker
            placeholder={filter.placeholder || `请选择${filter.label}`}
            style={{ width: '100%' }}
          />
        );

      case 'dateRange':
        return (
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            style={{ width: '100%' }}
          />
        );

      case 'number':
        return (
          <InputNumber
            placeholder={filter.placeholder || `请输入${filter.label}`}
            style={{ width: '100%' }}
          />
        );

      case 'text':
        return (
          <Input
            placeholder={filter.placeholder || `请输入${filter.label}`}
            allowClear
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title="高级筛选"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      className="advanced-filter-modal"
      footer={[
        <Button key="reset" onClick={handleReset}>
          重置
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk}>
          应用
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        className="advanced-filter-form"
      >
        {filters.map(filter => (
          <Form.Item
            key={filter.key}
            name={filter.key}
            label={filter.label}
          >
            {renderFilterField(filter)}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default AdvancedFilter;
