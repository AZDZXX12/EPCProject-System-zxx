/**
 * 优化的列表组件
 * 支持虚拟滚动、懒加载、搜索过滤
 */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { List, Input, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { debounce } from '../../utils/optimizedPerformance';
import './OptimizedList.css';

interface OptimizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  virtualScroll?: boolean;
  itemHeight?: number;
  emptyText?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

function OptimizedList<T extends Record<string, any>>({
  data,
  renderItem,
  loading = false,
  searchable = false,
  searchKeys = [],
  pageSize = 20,
  virtualScroll = false,
  itemHeight = 60,
  emptyText = '暂无数据',
  onLoadMore,
  hasMore = false
}: OptimizedListProps<T>) {
  const [searchText, setSearchText] = useState('');
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: pageSize });
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 搜索过滤
  const filteredData = useMemo(() => {
    if (!searchText || !searchable) return data;

    const lowerSearch = searchText.toLowerCase();
    return data.filter(item => {
      if (searchKeys.length === 0) {
        // 搜索所有字段
        return Object.values(item).some(value =>
          String(value).toLowerCase().includes(lowerSearch)
        );
      }
      
      // 搜索指定字段
      return searchKeys.some(key =>
        String(item[key]).toLowerCase().includes(lowerSearch)
      );
    });
  }, [data, searchText, searchable, searchKeys]);

  // 虚拟滚动数据
  const visibleData = useMemo(() => {
    if (!virtualScroll) return filteredData;
    return filteredData.slice(visibleRange.start, visibleRange.end);
  }, [filteredData, virtualScroll, visibleRange]);

  // 防抖搜索
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchText(value);
      setVisibleRange({ start: 0, end: pageSize });
    }, 300),
    [pageSize]
  );

  // 虚拟滚动处理
  const handleScroll = useCallback(() => {
    if (!virtualScroll || !containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;

    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.ceil((scrollTop + clientHeight) / itemHeight) + 5; // 预加载5项

    setVisibleRange({
      start: Math.max(0, start - 5), // 预留5项
      end: Math.min(filteredData.length, end)
    });
  }, [virtualScroll, itemHeight, filteredData.length]);

  const debouncedScroll = useMemo(
    () => debounce(handleScroll, 100),
    [handleScroll]
  );

  // 无限滚动加载更多
  useEffect(() => {
    if (!onLoadMore || !loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [onLoadMore, hasMore, loading]);

  // 虚拟滚动样式
  const containerStyle = virtualScroll
    ? {
        height: '600px',
        overflow: 'auto'
      }
    : undefined;

  const listStyle = virtualScroll
    ? {
        height: `${filteredData.length * itemHeight}px`,
        position: 'relative' as const
      }
    : undefined;

  const itemStyle = (index: number) =>
    virtualScroll
      ? {
          position: 'absolute' as const,
          top: `${(visibleRange.start + index) * itemHeight}px`,
          left: 0,
          right: 0,
          height: `${itemHeight}px`
        }
      : undefined;

  return (
    <div className="optimized-list">
      {searchable && (
        <div className="optimized-list-search">
          <Input
            placeholder="搜索..."
            prefix={<SearchOutlined />}
            onChange={(e) => debouncedSearch(e.target.value)}
            allowClear
          />
        </div>
      )}

      <div
        ref={containerRef}
        className="optimized-list-container"
        style={containerStyle}
        onScroll={virtualScroll ? debouncedScroll : undefined}
      >
        {loading && visibleData.length === 0 ? (
          <div className="optimized-list-loading">
            <Spin size="large" />
          </div>
        ) : visibleData.length === 0 ? (
          <Empty description={emptyText} />
        ) : (
          <div style={listStyle}>
            <List
              dataSource={visibleData}
              renderItem={(item, index) => (
                <div style={itemStyle(index)}>
                  {renderItem(item, visibleRange.start + index)}
                </div>
              )}
            />
          </div>
        )}

        {onLoadMore && hasMore && (
          <div ref={loadMoreRef} className="optimized-list-load-more">
            {loading && <Spin />}
          </div>
        )}
      </div>
    </div>
  );
}

export default OptimizedList;
