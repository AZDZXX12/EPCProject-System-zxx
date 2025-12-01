/**
 * 移动端响应式适配
 */

import React from 'react';
import { Drawer, Button, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

const MobileResponsive: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = React.useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
        <Button icon={<MenuOutlined />} size="large" onClick={() => setVisible(true)} />
      </div>
      <Drawer title="菜单" placement="right" onClose={() => setVisible(false)} open={visible}>
        {children}
      </Drawer>
    </>
  );
};

export default MobileResponsive;

export const useResponsive = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  return { isMobile, isTablet, isDesktop };
};
