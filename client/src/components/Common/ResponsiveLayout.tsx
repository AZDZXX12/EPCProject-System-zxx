/**
 * 响应式布局组件
 * 提供统一的响应式布局解决方案
 */
import React, { ReactNode } from 'react';
import { Row, Col, Grid } from 'antd';

const { useBreakpoint } = Grid;

interface ResponsiveLayoutProps {
  children: ReactNode;
  gutter?: number | [number, number];
  className?: string;
}

interface ResponsiveGridProps {
  children: ReactNode;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
  className?: string;
}

/**
 * 响应式容器
 */
export const ResponsiveContainer: React.FC<ResponsiveLayoutProps> = ({
  children,
  gutter = [16, 16],
  className = ''
}) => {
  const screens = useBreakpoint();
  
  // 根据屏幕大小调整gutter
  const responsiveGutter: [number, number] = React.useMemo(() => {
    if (screens.xs) return [8, 8];
    if (screens.sm) return [12, 12];
    if (screens.md) return [16, 16];
    return Array.isArray(gutter) ? [gutter[0], gutter[1]] : [gutter, gutter];
  }, [screens, gutter]);

  return (
    <Row gutter={responsiveGutter} className={className}>
      {children}
    </Row>
  );
};

/**
 * 响应式网格列
 */
export const ResponsiveCol: React.FC<ResponsiveGridProps> = ({
  children,
  xs = 24,
  sm = 12,
  md = 8,
  lg = 6,
  xl = 6,
  xxl = 4,
  className = ''
}) => {
  return (
    <Col
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      xxl={xxl}
      className={className}
    >
      {children}
    </Col>
  );
};

/**
 * 响应式卡片网格
 * 自动适配不同屏幕尺寸
 */
export const ResponsiveCardGrid: React.FC<{
  children: ReactNode;
  gutter?: number | [number, number];
}> = ({
  children,
  gutter = [16, 16]
}) => {
  const screens = useBreakpoint();

  // 根据屏幕宽度和最小卡片宽度计算列数
  const getColSpan = () => {
    if (screens.xxl) return 4;  // 6列
    if (screens.xl) return 6;   // 4列
    if (screens.lg) return 8;   // 3列
    if (screens.md) return 12;  // 2列
    return 24;                  // 1列
  };

  const normalizedGutter: [number, number] = Array.isArray(gutter) 
    ? [gutter[0], gutter[1]] 
    : [gutter, gutter];

  return (
    <Row gutter={normalizedGutter}>
      {React.Children.map(children, (child) => (
        <Col span={getColSpan()}>
          {child}
        </Col>
      ))}
    </Row>
  );
};

/**
 * 响应式两栏布局
 * 主内容区 + 侧边栏
 */
export const ResponsiveTwoColumn: React.FC<{
  main: ReactNode;
  sidebar: ReactNode;
  sidebarWidth?: number;
  gutter?: number | [number, number];
  reverse?: boolean; // 是否反转（侧边栏在左）
}> = ({
  main,
  sidebar,
  sidebarWidth = 300,
  gutter = [16, 16],
  reverse = false
}) => {
  const screens = useBreakpoint();

  const normalizedGutter: [number, number] = Array.isArray(gutter) 
    ? [gutter[0], gutter[1]] 
    : [gutter, gutter];

  // 移动端垂直布局，桌面端水平布局
  if (screens.xs || screens.sm) {
    return (
      <Row gutter={normalizedGutter}>
        <Col span={24}>{main}</Col>
        <Col span={24}>{sidebar}</Col>
      </Row>
    );
  }

  const mainSpan = 24 - Math.round((sidebarWidth / 1200) * 24);
  const sidebarSpan = 24 - mainSpan;

  return (
    <Row gutter={normalizedGutter}>
      {reverse ? (
        <>
          <Col xs={24} md={sidebarSpan}>{sidebar}</Col>
          <Col xs={24} md={mainSpan}>{main}</Col>
        </>
      ) : (
        <>
          <Col xs={24} md={mainSpan}>{main}</Col>
          <Col xs={24} md={sidebarSpan}>{sidebar}</Col>
        </>
      )}
    </Row>
  );
};

/**
 * 响应式三栏布局
 * 左侧边栏 + 主内容 + 右侧边栏
 */
export const ResponsiveThreeColumn: React.FC<{
  left: ReactNode;
  main: ReactNode;
  right: ReactNode;
  leftWidth?: number;
  rightWidth?: number;
  gutter?: number | [number, number];
}> = ({
  left,
  main,
  right,
  leftWidth = 240,
  rightWidth = 300,
  gutter = [16, 16]
}) => {
  const screens = useBreakpoint();

  const normalizedGutter: [number, number] = Array.isArray(gutter) 
    ? [gutter[0], gutter[1]] 
    : [gutter, gutter];

  // 移动端和平板：垂直布局
  if (screens.xs || screens.sm || screens.md) {
    return (
      <Row gutter={normalizedGutter}>
        <Col span={24}>{left}</Col>
        <Col span={24}>{main}</Col>
        <Col span={24}>{right}</Col>
      </Row>
    );
  }

  // 桌面端：三栏布局
  const leftSpan = Math.round((leftWidth / 1200) * 24);
  const rightSpan = Math.round((rightWidth / 1200) * 24);
  const mainSpan = 24 - leftSpan - rightSpan;

  return (
    <Row gutter={normalizedGutter}>
      <Col span={leftSpan}>{left}</Col>
      <Col span={mainSpan}>{main}</Col>
      <Col span={rightSpan}>{right}</Col>
    </Row>
  );
};

/**
 * 响应式Hero区域
 * 大标题 + 描述 + 操作按钮
 */
export const ResponsiveHero: React.FC<{
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  extra?: ReactNode;
  background?: string;
  className?: string;
}> = ({
  title,
  description,
  actions,
  extra,
  background,
  className = ''
}) => {
  const screens = useBreakpoint();

  return (
    <div
      className={`responsive-hero ${className}`}
      style={{
        background: background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: screens.xs ? '24px 16px' : screens.md ? '32px 24px' : '48px 32px',
        borderRadius: '12px',
        color: '#fff',
        marginBottom: '24px'
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={extra ? 16 : 24}>
          <div style={{ fontSize: screens.xs ? '24px' : '32px', fontWeight: 'bold', marginBottom: '12px' }}>
            {title}
          </div>
          {description && (
            <div style={{ fontSize: screens.xs ? '14px' : '16px', opacity: 0.9, marginBottom: '16px' }}>
              {description}
            </div>
          )}
          {actions && (
            <div style={{ marginTop: '16px' }}>
              {actions}
            </div>
          )}
        </Col>
        {extra && (
          <Col xs={24} md={8} style={{ textAlign: screens.xs ? 'center' : 'right' }}>
            {extra}
          </Col>
        )}
      </Row>
    </div>
  );
};

/**
 * 响应式统计卡片网格
 */
export const ResponsiveStatGrid: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const screens = useBreakpoint();

  const getColSpan = () => {
    if (screens.xxl) return 4;  // 6列
    if (screens.xl) return 6;   // 4列
    if (screens.lg) return 6;   // 4列
    if (screens.md) return 12;  // 2列
    return 24;                  // 1列
  };

  return (
    <Row gutter={[16, 16]}>
      {React.Children.map(children, (child) => (
        <Col span={getColSpan()}>
          {child}
        </Col>
      ))}
    </Row>
  );
};

/**
 * 自适应容器
 * 根据内容自动调整布局
 */
export const AdaptiveContainer: React.FC<{
  children: ReactNode;
  maxWidth?: number;
  centered?: boolean;
  padding?: boolean;
}> = ({
  children,
  maxWidth = 1400,
  centered = true,
  padding = true
}) => {
  const screens = useBreakpoint();

  return (
    <div
      style={{
        maxWidth: `${maxWidth}px`,
        margin: centered ? '0 auto' : undefined,
        padding: padding ? (screens.xs ? '12px' : screens.md ? '16px' : '24px') : undefined,
        width: '100%'
      }}
    >
      {children}
    </div>
  );
};

export default {
  Container: ResponsiveContainer,
  Col: ResponsiveCol,
  CardGrid: ResponsiveCardGrid,
  TwoColumn: ResponsiveTwoColumn,
  ThreeColumn: ResponsiveThreeColumn,
  Hero: ResponsiveHero,
  StatGrid: ResponsiveStatGrid,
  Adaptive: AdaptiveContainer
};
