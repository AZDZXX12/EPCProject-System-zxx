/**
 * Ant Design Tabs迁移工具
 * 从Tabs.TabPane迁移到items API
 */

import { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  closable?: boolean;
  icon?: ReactNode;
}

/**
 * 创建Tab项
 */
export function createTabItem(
  key: string,
  label: ReactNode,
  children: ReactNode,
  options?: Partial<TabItem>
): TabItem {
  return {
    key,
    label,
    children,
    ...options,
  };
}

/**
 * 批量创建Tab项
 */
export function createTabItems(
  items: Array<{
    key: string;
    label: ReactNode;
    children: ReactNode;
    options?: Partial<TabItem>;
  }>
): TabItem[] {
  return items.map(({ key, label, children, options }) =>
    createTabItem(key, label, children, options)
  );
}
