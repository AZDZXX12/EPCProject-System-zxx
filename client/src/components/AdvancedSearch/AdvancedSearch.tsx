/**
 * 高级搜索组件
 * 支持多条件组合搜索、保存搜索条件、搜索历史等功能
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Tag,
  Space,
  Row,
  Col,
  Card,
  Divider,
  List,
  Empty,
  message,
  Dropdown,
  Menu,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  SaveOutlined,
  HistoryOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { logger } from '../../utils/logger';
import { StorageManager } from '../../utils/StorageManager';
import './AdvancedSearch.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface SearchCondition {
  field: string;
  operator: string;
  value: any;
  label?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  conditions: SearchCondition[];
  createdAt: string;
}

interface AdvancedSearchProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (conditions: SearchCondition[]) => void;
  searchableFields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number' | 'boolean';
    options?: { label: string; value: any }[];
  }>;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  visible,
  onClose,
  onSearch,
  searchableFields = [],
}) => {
  const [form] = Form.useForm();
  const [conditions, setConditions] = useState<SearchCondition[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchCondition[][]>([]);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveName, setSaveName] = useState('');

  // 默认搜索字段
  const defaultFields = [
    { name: 'name', label: '名称', type: 'text' as const },
    { name: 'status', label: '状态', type: 'select' as const, 
      options: [
        { label: '进行中', value: 'in_progress' },
        { label: '已完成', value: 'completed' },
        { label: '已暂停', value: 'paused' },
        { label: '已取消', value: 'cancelled' },
      ]
    },
    { name: 'priority', label: '优先级', type: 'select' as const,
      options: [
        { label: '高', value: 'high' },
        { label: '中', value: 'medium' },
        { label: '低', value: 'low' },
      ]
    },
    { name: 'date', label: '日期', type: 'date' as const },
    { name: 'assignee', label: '负责人', type: 'text' as const },
    { name: 'progress', label: '进度', type: 'number' as const },
  ];

  const fields = searchableFields.length > 0 ? searchableFields : defaultFields;

  useEffect(() => {
    // 加载保存的搜索和历史
    const saved = StorageManager.load('advanced_searches') || [];
    const history = StorageManager.load('search_history') || [];
    setSavedSearches(saved);
    setSearchHistory(history.slice(0, 10)); // 只保留最近10条
  }, []);

  // 添加搜索条件
  const addCondition = () => {
    const newCondition: SearchCondition = {
      field: fields[0].name,
      operator: 'equals',
      value: '',
      label: fields[0].label,
    };
    setConditions([...conditions, newCondition]);
  };

  // 删除搜索条件
  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
  };

  // 更新搜索条件
  const updateCondition = (index: number, field: string, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    
    // 如果更新了field，同时更新label
    if (field === 'field') {
      const selectedField = fields.find(f => f.name === value);
      if (selectedField) {
        newConditions[index].label = selectedField.label;
      }
    }
    
    setConditions(newConditions);
  };

  // 执行搜索
  const handleSearch = () => {
    if (conditions.length === 0) {
      message.warning('请添加至少一个搜索条件');
      return;
    }

    // 添加到搜索历史
    const newHistory = [conditions, ...searchHistory.slice(0, 9)];
    setSearchHistory(newHistory);
    StorageManager.save('search_history', newHistory);

    // 执行搜索
    onSearch(conditions);
    logger.info('[高级搜索] 执行搜索', { conditions });
    message.success('搜索成功');
    onClose();
  };

  // 保存搜索条件
  const handleSaveSearch = () => {
    if (!saveName.trim()) {
      message.warning('请输入搜索名称');
      return;
    }

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveName,
      conditions: conditions,
      createdAt: new Date().toISOString(),
    };

    const newSavedSearches = [...savedSearches, newSavedSearch];
    setSavedSearches(newSavedSearches);
    StorageManager.save('advanced_searches', newSavedSearches);

    message.success('搜索条件已保存');
    setSaveModalVisible(false);
    setSaveName('');
  };

  // 加载保存的搜索
  const loadSavedSearch = (search: SavedSearch) => {
    setConditions(search.conditions);
    message.success(`已加载搜索条件: ${search.name}`);
  };

  // 删除保存的搜索
  const deleteSavedSearch = (id: string) => {
    const newSavedSearches = savedSearches.filter(s => s.id !== id);
    setSavedSearches(newSavedSearches);
    StorageManager.save('advanced_searches', newSavedSearches);
    message.success('已删除保存的搜索');
  };

  // 清空所有条件
  const clearAllConditions = () => {
    setConditions([]);
    form.resetFields();
  };

  // 获取操作符选项
  const getOperatorOptions = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
        return [
          { label: '等于', value: 'equals' },
          { label: '包含', value: 'contains' },
          { label: '开始于', value: 'startsWith' },
          { label: '结束于', value: 'endsWith' },
          { label: '不等于', value: 'notEquals' },
        ];
      case 'number':
        return [
          { label: '等于', value: 'equals' },
          { label: '大于', value: 'greaterThan' },
          { label: '小于', value: 'lessThan' },
          { label: '大于等于', value: 'greaterThanOrEqual' },
          { label: '小于等于', value: 'lessThanOrEqual' },
          { label: '不等于', value: 'notEquals' },
        ];
      case 'date':
        return [
          { label: '等于', value: 'equals' },
          { label: '在之前', value: 'before' },
          { label: '在之后', value: 'after' },
          { label: '在范围内', value: 'between' },
        ];
      case 'select':
      case 'boolean':
        return [
          { label: '等于', value: 'equals' },
          { label: '不等于', value: 'notEquals' },
        ];
      default:
        return [{ label: '等于', value: 'equals' }];
    }
  };

  // 渲染条件输入控件
  const renderValueInput = (condition: SearchCondition, index: number) => {
    const field = fields.find(f => f.name === condition.field);
    if (!field) return null;

    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder="请输入"
            value={condition.value}
            onChange={(e) => updateCondition(index, 'value', e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            placeholder="请输入数字"
            value={condition.value}
            onChange={(e) => updateCondition(index, 'value', parseFloat(e.target.value))}
          />
        );
      case 'select':
        return (
          <Select
            placeholder="请选择"
            value={condition.value}
            onChange={(value) => updateCondition(index, 'value', value)}
            style={{ width: '100%' }}
          >
            {field.options?.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        );
      case 'date':
        if (condition.operator === 'between') {
          return (
            <RangePicker
              value={condition.value}
              onChange={(dates) => updateCondition(index, 'value', dates)}
              style={{ width: '100%' }}
            />
          );
        }
        return (
          <DatePicker
            value={condition.value}
            onChange={(date) => updateCondition(index, 'value', date)}
            style={{ width: '100%' }}
          />
        );
      case 'boolean':
        return (
          <Select
            placeholder="请选择"
            value={condition.value}
            onChange={(value) => updateCondition(index, 'value', value)}
            style={{ width: '100%' }}
          >
            <Option value={true}>是</Option>
            <Option value={false}>否</Option>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Modal
        title={
          <Space>
            <FilterOutlined />
            高级搜索
          </Space>
        }
        visible={visible}
        onCancel={onClose}
        width={900}
        footer={[
          <Button key="clear" onClick={clearAllConditions}>
            清空条件
          </Button>,
          <Button key="save" icon={<SaveOutlined />} onClick={() => setSaveModalVisible(true)}>
            保存搜索
          </Button>,
          <Button key="cancel" onClick={onClose}>
            取消
          </Button>,
          <Button key="search" type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>,
        ]}
      >
        <Row gutter={16}>
          {/* 搜索条件区域 */}
          <Col span={16}>
            <Card title="搜索条件" size="small">
              {conditions.length === 0 ? (
                <Empty description="暂无搜索条件" />
              ) : (
                <div className="search-conditions">
                  {conditions.map((condition, index) => (
                    <div key={index} className="search-condition-row">
                      <Row gutter={8} align="middle">
                        <Col span={6}>
                          <Select
                            value={condition.field}
                            onChange={(value) => updateCondition(index, 'field', value)}
                            style={{ width: '100%' }}
                          >
                            {fields.map(field => (
                              <Option key={field.name} value={field.name}>
                                {field.label}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        <Col span={5}>
                          <Select
                            value={condition.operator}
                            onChange={(value) => updateCondition(index, 'operator', value)}
                            style={{ width: '100%' }}
                          >
                            {getOperatorOptions(
                              fields.find(f => f.name === condition.field)?.type || 'text'
                            ).map(opt => (
                              <Option key={opt.value} value={opt.value}>
                                {opt.label}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        <Col span={11}>
                          {renderValueInput(condition, index)}
                        </Col>
                        <Col span={2}>
                          <Button
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => removeCondition(index)}
                          />
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addCondition}
                style={{ width: '100%', marginTop: 16 }}
              >
                添加条件
              </Button>
            </Card>
          </Col>

          {/* 保存的搜索和历史 */}
          <Col span={8}>
            <Card title="保存的搜索" size="small" style={{ marginBottom: 16 }}>
              {savedSearches.length === 0 ? (
                <Empty description="暂无保存的搜索" />
              ) : (
                <List
                  size="small"
                  dataSource={savedSearches}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          key="load"
                          type="link"
                          size="small"
                          onClick={() => loadSavedSearch(item)}
                        >
                          加载
                        </Button>,
                        <Button
                          key="delete"
                          type="link"
                          danger
                          size="small"
                          onClick={() => deleteSavedSearch(item.id)}
                        >
                          删除
                        </Button>,
                      ]}
                    >
                      <div>
                        <div>{item.name}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {item.conditions.length} 个条件
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>

            <Card title="搜索历史" size="small">
              {searchHistory.length === 0 ? (
                <Empty description="暂无搜索历史" />
              ) : (
                <List
                  size="small"
                  dataSource={searchHistory.slice(0, 5)}
                  renderItem={(conditions, index) => (
                    <List.Item
                      actions={[
                        <Button
                          key="use"
                          type="link"
                          size="small"
                          onClick={() => setConditions(conditions)}
                        >
                          使用
                        </Button>,
                      ]}
                    >
                      <div style={{ fontSize: 12 }}>
                        {conditions.map((c, i) => (
                          <Tag key={i}>
                            {c.label} {c.operator} {c.value}
                          </Tag>
                        ))}
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* 保存搜索对话框 */}
      <Modal
        title="保存搜索条件"
        visible={saveModalVisible}
        onOk={handleSaveSearch}
        onCancel={() => setSaveModalVisible(false)}
        width={400}
      >
        <Form>
          <Form.Item label="搜索名称">
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="请输入搜索名称"
            />
          </Form.Item>
          <Form.Item label="条件预览">
            <div>
              {conditions.map((c, i) => (
                <Tag key={i}>
                  {c.label} {c.operator} {c.value}
                </Tag>
              ))}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdvancedSearch;
