/**
 * 全局搜索组件 - 快速查找项目、任务、文档等
 * 
 * 功能：
 * - 全局快捷键 Ctrl/Cmd + K
 * - 模糊搜索
 * - 分类显示结果
 * - 快速跳转
 * - 搜索历史
 * - 智能建议
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Input, List, Tag, Empty, Spin, Typography, Space, Divider } from 'antd';
import {
  SearchOutlined,
  ProjectOutlined,
  FileTextOutlined,
  TeamOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { StorageManager } from '../../utils/StorageManager';
import './GlobalSearch.css';

const { Text } = Typography;

interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'document' | 'equipment' | 'person';
  title: string;
  description?: string;
  path: string;
  icon: React.ReactNode;
  tags?: string[];
  score?: number;
}

interface GlobalSearchProps {
  visible: boolean;
  onClose: () => void;
}

const SEARCH_HISTORY_KEY = 'global_search_history';
const MAX_HISTORY = 10;

const GlobalSearch: React.FC<GlobalSearchProps> = ({ visible, onClose }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debouncedSearch = useDebounce(searchText, 300);

  // 加载搜索历史
  useEffect(() => {
    const history = StorageManager.load<string[]>(SEARCH_HISTORY_KEY) || [];
    setSearchHistory(history);
  }, []);

  // 保存搜索历史
  const saveSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    const history = StorageManager.load<string[]>(SEARCH_HISTORY_KEY) || [];
    const newHistory = [
      query,
      ...history.filter((h) => h !== query),
    ].slice(0, MAX_HISTORY);

    StorageManager.save(SEARCH_HISTORY_KEY, newHistory);
    setSearchHistory(newHistory);
  }, []);

  // 执行搜索
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // 模拟搜索延迟
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 搜索数据源
      const mockResults: SearchResult[] = [];

      // 搜索项目
      const projects = StorageManager.load<any[]>('projects') || [];
      projects.forEach((project) => {
        if (
          project.name?.toLowerCase().includes(query.toLowerCase()) ||
          project.description?.toLowerCase().includes(query.toLowerCase())
        ) {
          mockResults.push({
            id: project.id,
            type: 'project',
            title: project.name,
            description: project.description,
            path: '/workspace',
            icon: <ProjectOutlined />,
            tags: [project.status],
            score: calculateScore(query, project.name),
          });
        }
      });

      // 搜索任务
      const tasks = StorageManager.load<any[]>('tasks') || [];
      tasks.forEach((task) => {
        if (
          task.text?.toLowerCase().includes(query.toLowerCase()) ||
          task.description?.toLowerCase().includes(query.toLowerCase())
        ) {
          mockResults.push({
            id: task.id,
            type: 'task',
            title: task.text,
            description: task.description,
            path: '/tasks',
            icon: <FileTextOutlined />,
            tags: [task.status],
            score: calculateScore(query, task.text),
          });
        }
      });

      // 搜索设备
      const equipments = [
        { id: 'eq1', name: '离心泵', type: '泵类设备', path: '/devices' },
        { id: 'eq2', name: '换热器', type: '换热设备', path: '/devices' },
        { id: 'eq3', name: '反应釜', type: '反应设备', path: '/devices' },
        { id: 'eq4', name: '压缩机', type: '压缩设备', path: '/devices' },
        { id: 'eq5', name: '干燥机', type: '干燥设备', path: '/devices' },
      ];

      equipments.forEach((eq) => {
        if (
          eq.name.toLowerCase().includes(query.toLowerCase()) ||
          eq.type.toLowerCase().includes(query.toLowerCase())
        ) {
          mockResults.push({
            id: eq.id,
            type: 'equipment',
            title: eq.name,
            description: eq.type,
            path: eq.path,
            icon: <ToolOutlined />,
            score: calculateScore(query, eq.name),
          });
        }
      });

      // 按相关性排序
      mockResults.sort((a, b) => (b.score || 0) - (a.score || 0));

      setResults(mockResults.slice(0, 20));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 计算搜索相关性分数
  const calculateScore = (query: string, text: string): number => {
    const lowerQuery = query.toLowerCase();
    const lowerText = text.toLowerCase();

    // 完全匹配
    if (lowerText === lowerQuery) return 100;

    // 开头匹配
    if (lowerText.startsWith(lowerQuery)) return 80;

    // 包含匹配
    if (lowerText.includes(lowerQuery)) return 60;

    // 模糊匹配
    let score = 0;
    for (const char of lowerQuery) {
      if (lowerText.includes(char)) {
        score += 10;
      }
    }

    return score;
  };

  // 监听搜索文本变化
  useEffect(() => {
    performSearch(debouncedSearch);
  }, [debouncedSearch, performSearch]);

  // 处理选择
  const handleSelect = useCallback(
    (result: SearchResult) => {
      saveSearchHistory(searchText);
      navigate(result.path);
      onClose();
      setSearchText('');
    },
    [searchText, navigate, onClose, saveSearchHistory]
  );

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    },
    [results, selectedIndex, handleSelect]
  );

  // 重置状态
  useEffect(() => {
    if (visible) {
      setSearchText('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [visible]);

  // 分组结果
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      project: [],
      task: [],
      equipment: [],
      document: [],
      person: [],
    };

    results.forEach((result) => {
      groups[result.type].push(result);
    });

    return groups;
  }, [results]);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      project: '项目',
      task: '任务',
      equipment: '设备',
      document: '文档',
      person: '人员',
    };
    return labels[type] || type;
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="global-search-modal"
      closable={false}
      destroyOnClose
    >
      <div className="global-search-container">
        <Input
          size="large"
          placeholder="搜索项目、任务、设备、文档..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          allowClear
        />

        <div className="search-results">
          {loading ? (
            <div className="search-loading">
              <Spin />
            </div>
          ) : searchText && results.length === 0 ? (
            <Empty description="未找到相关结果" />
          ) : searchText ? (
            <div className="search-results-list">
              {Object.entries(groupedResults).map(([type, items]) =>
                items.length > 0 ? (
                  <div key={type} className="search-group">
                    <div className="search-group-title">
                      <Text type="secondary">{getTypeLabel(type)}</Text>
                    </div>
                    <List
                      dataSource={items}
                      renderItem={(item, index) => {
                        const globalIndex = results.indexOf(item);
                        return (
                          <List.Item
                            className={`search-result-item ${
                              globalIndex === selectedIndex ? 'selected' : ''
                            }`}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                          >
                            <Space>
                              <span className="result-icon">{item.icon}</span>
                              <div className="result-content">
                                <div className="result-title">{item.title}</div>
                                {item.description && (
                                  <Text type="secondary" className="result-description">
                                    {item.description}
                                  </Text>
                                )}
                              </div>
                            </Space>
                            <Space>
                              {item.tags?.map((tag) => (
                                <Tag key={tag}>{tag}</Tag>
                              ))}
                              <RightOutlined className="result-arrow" />
                            </Space>
                          </List.Item>
                        );
                      }}
                    />
                  </div>
                ) : null
              )}
            </div>
          ) : searchHistory.length > 0 ? (
            <div className="search-history">
              <div className="search-group-title">
                <Text type="secondary">
                  <ClockCircleOutlined /> 最近搜索
                </Text>
              </div>
              <List
                dataSource={searchHistory}
                renderItem={(item) => (
                  <List.Item
                    className="search-history-item"
                    onClick={() => setSearchText(item)}
                  >
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <div className="search-tips">
              <Text type="secondary">
                输入关键词搜索项目、任务、设备等内容
              </Text>
            </div>
          )}
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div className="search-footer">
          <Space size="large">
            <Text type="secondary" className="search-tip">
              <kbd>↑</kbd> <kbd>↓</kbd> 导航
            </Text>
            <Text type="secondary" className="search-tip">
              <kbd>Enter</kbd> 选择
            </Text>
            <Text type="secondary" className="search-tip">
              <kbd>Esc</kbd> 关闭
            </Text>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default GlobalSearch;
