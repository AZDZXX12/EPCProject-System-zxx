import React, { useState, useEffect } from 'react';
import { Input, Button, Space, Dropdown, Tag, Badge } from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import AdvancedFilter from '../AdvancedFilter/AdvancedFilter';
import './SearchBar.css';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'date' | 'dateRange' | 'number' | 'text';
  options?: { label: string; value: any }[];
  placeholder?: string;
}

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch: (keyword: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  filters?: FilterConfig[];
  showHistory?: boolean;
  showFavorite?: boolean;
  maxHistoryCount?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索...',
  defaultValue = '',
  onSearch,
  onFilter,
  filters = [],
  showHistory = true,
  showFavorite = true,
  maxHistoryCount = 10,
}) => {
  const [keyword, setKeyword] = useState(defaultValue);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [favoriteSearches, setFavoriteSearches] = useState<string[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);

  // 加载搜索历史和收藏
  useEffect(() => {
    if (showHistory) {
      const history = localStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    }
    if (showFavorite) {
      const favorites = localStorage.getItem('favoriteSearches');
      if (favorites) {
        setFavoriteSearches(JSON.parse(favorites));
      }
    }
  }, [showHistory, showFavorite]);

  // 保存搜索历史
  const saveSearchHistory = (search: string) => {
    if (!search.trim()) return;

    const newHistory = [search, ...searchHistory.filter(h => h !== search)].slice(0, maxHistoryCount);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // 处理搜索
  const handleSearch = (value?: string) => {
    const searchValue = value !== undefined ? value : keyword;
    if (searchValue.trim()) {
      saveSearchHistory(searchValue);
      onSearch(searchValue);
    }
  };

  // 清空搜索
  const handleClear = () => {
    setKeyword('');
    onSearch('');
  };

  // 清空历史
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // 收藏/取消收藏
  const toggleFavorite = (search: string) => {
    let newFavorites: string[];
    if (favoriteSearches.includes(search)) {
      newFavorites = favoriteSearches.filter(f => f !== search);
    } else {
      newFavorites = [...favoriteSearches, search];
    }
    setFavoriteSearches(newFavorites);
    localStorage.setItem('favoriteSearches', JSON.stringify(newFavorites));
  };

  // 应用筛选
  const handleFilterApply = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    setFilterVisible(false);
    onFilter?.(filters);
  };

  // 清空筛选
  const handleFilterClear = () => {
    setActiveFilters({});
    onFilter?.({});
  };

  // 移除单个筛选
  const removeFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onFilter?.(newFilters);
  };

  // 搜索历史菜单
  const historyMenuItems: MenuProps['items'] = [
    ...(favoriteSearches.length > 0
      ? [
          {
            key: 'favorites',
            type: 'group' as const,
            label: '收藏的搜索',
            children: favoriteSearches.map((search, index) => ({
              key: `fav-${index}`,
              label: (
                <div className="history-item">
                  <StarFilled className="history-icon favorite" />
                  <span className="history-text" onClick={() => handleSearch(search)}>
                    {search}
                  </span>
                  <CloseCircleOutlined
                    className="history-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(search);
                    }}
                  />
                </div>
              ),
            })),
          },
          { type: 'divider' as const },
        ]
      : []),
    ...(searchHistory.length > 0
      ? [
          {
            key: 'history',
            type: 'group' as const,
            label: (
              <div className="history-header">
                <span>搜索历史</span>
                <Button type="link" size="small" onClick={clearHistory}>
                  清空
                </Button>
              </div>
            ),
            children: searchHistory.map((search, index) => ({
              key: `hist-${index}`,
              label: (
                <div className="history-item">
                  <HistoryOutlined className="history-icon" />
                  <span className="history-text" onClick={() => handleSearch(search)}>
                    {search}
                  </span>
                  <StarOutlined
                    className={`history-favorite ${
                      favoriteSearches.includes(search) ? 'active' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(search);
                    }}
                  />
                </div>
              ),
            })),
          },
        ]
      : [
          {
            key: 'empty',
            label: <div className="history-empty">暂无搜索历史</div>,
            disabled: true,
          },
        ]),
  ];

  // 活跃筛选数量
  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="search-bar-container">
      <Space.Compact className="search-bar-input-group">
        <Dropdown
          menu={{ items: historyMenuItems }}
          open={historyVisible && (showHistory || showFavorite)}
          onOpenChange={setHistoryVisible}
          trigger={['click']}
          placement="bottomLeft"
        >
          <Input
            placeholder={placeholder}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => handleSearch()}
            onFocus={() => setHistoryVisible(true)}
            prefix={<SearchOutlined />}
            suffix={
              keyword && (
                <CloseCircleOutlined
                  className="search-clear-icon"
                  onClick={handleClear}
                />
              )
            }
            className="search-bar-input"
            allowClear
          />
        </Dropdown>

        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => handleSearch()}
          className="search-bar-button"
        >
          搜索
        </Button>

        {filters.length > 0 && (
          <Badge count={activeFilterCount} offset={[-5, 5]}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilterVisible(true)}
              className="search-bar-filter-button"
            >
              筛选
            </Button>
          </Badge>
        )}
      </Space.Compact>

      {/* 活跃筛选标签 */}
      {activeFilterCount > 0 && (
        <div className="search-bar-active-filters">
          <span className="active-filters-label">筛选条件：</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find((f) => f.key === key);
            if (!filter || !value) return null;

            let displayValue = value;
            if (filter.type === 'select' && filter.options) {
              const option = filter.options.find((o) => o.value === value);
              displayValue = option?.label || value;
            } else if (filter.type === 'dateRange' && Array.isArray(value)) {
              displayValue = `${value[0]} ~ ${value[1]}`;
            }

            return (
              <Tag
                key={key}
                closable
                onClose={() => removeFilter(key)}
                className="active-filter-tag"
              >
                {filter.label}: {displayValue}
              </Tag>
            );
          })}
          <Button
            type="link"
            size="small"
            onClick={handleFilterClear}
            className="clear-filters-button"
          >
            清空筛选
          </Button>
        </div>
      )}

      {/* 高级筛选弹窗 */}
      {filters.length > 0 && (
        <AdvancedFilter
          visible={filterVisible}
          filters={filters}
          values={activeFilters}
          onApply={handleFilterApply}
          onCancel={() => setFilterVisible(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;
