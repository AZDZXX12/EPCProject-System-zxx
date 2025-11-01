
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, App as AntdApp } from 'antd';
import { ProjectProvider } from './contexts/ProjectContext';
import AppSider from './components/Layout/Sider';
import CommandPalette from './components/CommandPalette';
import Login from './pages/Login';
import DigitalTwinDashboard from './pages/DigitalTwinDashboard';
import DhtmlxGanttChart from './pages/DhtmlxGanttChart';
import KanbanBoard from './pages/KanbanBoard';
import TaskList from './pages/TaskList';
import DeviceManagement from './pages/DeviceManagement';
import Safety from './pages/Safety';
import Quality from './pages/Quality';
import Personnel from './pages/Personnel';
import Documents from './pages/Documents';
import LuckysheetTable from './pages/LuckysheetTable';
import Settings from './pages/Settings';
import SystemManagement from './pages/SystemManagement';
import ReportGenerator from './pages/ReportGenerator';
import ProcurementManagement from './pages/ProcurementManagement';
import Workspace from './pages/Workspace';
import ConstructionLog from './pages/ConstructionLog';
import ConstructionManagement from './pages/ConstructionManagement';
import Utilities from './pages/Utilities';
import SystemSettings from './pages/SystemSettings';
import './App.css';

// 扩展Window接口
declare global {
  interface Window {
    handleLogout?: () => void;
  }
}

const { Content } = Layout;

// 定义 PrivateRoute 的 props 类型
interface PrivateRouteProps {
  children: React.ReactElement;
}

// 路由保护组件
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查用户是否已认证
    const checkAuthentication = () => {
      const user = sessionStorage.getItem('isAuthenticated');
      setIsAuthenticated(user === 'true');
    };
    
    checkAuthentication();
    setLoading(false);
    
    // 定期检查认证状态，防止会话过期
    const checkInterval = setInterval(() => {
      checkAuthentication();
    }, 300000); // 每5分钟检查一次
    
    return () => clearInterval(checkInterval);
  }, []);
  
  // 导出的登出函数供其他组件使用
  React.useEffect(() => {
    window.handleLogout = () => {
      // 清除所有认证相关存储
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('chemical_user');
      localStorage.removeItem('chemical_user'); // 兼容性清理
      setIsAuthenticated(false);
    };
    
    return () => {
      delete window.handleLogout;
    };
  }, []);
  
  if (loading) {
    return null; // 或者返回一个加载指示器
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const [commandPaletteVisible, setCommandPaletteVisible] = React.useState(false);
  const [siderCollapsed, setSiderCollapsed] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteVisible(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AntdApp>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* 登录页面路由 */}
          <Route path="/login" element={<Login />} />
        
        {/* 受保护的主应用路由 */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <ProjectProvider>
                <Layout style={{ minHeight: '100vh' }}>
                  <Layout>
                    <AppSider collapsed={siderCollapsed} onCollapse={setSiderCollapsed} />
                    <Content
                      style={{
                        padding: 0,
                        marginLeft: siderCollapsed ? 60 : 200, // 根据折叠状态动态调整
                        background: '#f0f2f5',
                        minHeight: '100vh',
                        transition: 'all 0.2s ease' // 平滑过渡
                      }}
                    >
                        <Routes>
                          <Route path="/" element={<Navigate to="/workspace" replace />} />
                          <Route path="/workspace" element={<Workspace />} />
                          <Route path="/digital-twin" element={<DigitalTwinDashboard />} />
                          <Route path="/procurement" element={<ProcurementManagement />} />
                          <Route path="/tasks" element={<TaskList />} />
                          <Route path="/gantt" element={<DhtmlxGanttChart />} />
                          <Route path="/kanban" element={<KanbanBoard />} />
                          <Route path="/construction-management" element={<ConstructionManagement />} />
                          <Route path="/construction-log" element={<ConstructionLog />} />
                          <Route path="/utilities" element={<Utilities />} />
                          <Route path="/devices" element={<DeviceManagement />} />
                          <Route path="/safety" element={<Safety />} />
                          <Route path="/quality" element={<Quality />} />
                          <Route path="/selection" element={<LuckysheetTable />} />
                          <Route path="/personnel" element={<Personnel />} />
                          <Route path="/documents" element={<Documents />} />
                          <Route path="/reports" element={<ReportGenerator />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/system-management" element={<SystemManagement />} />
                          <Route path="/system-settings" element={<SystemSettings />} />
                        </Routes>
                    </Content>
                  </Layout>
                </Layout>
              </ProjectProvider>
            </PrivateRoute>
          }
        />
      </Routes>
      <CommandPalette 
        visible={commandPaletteVisible} 
        onClose={() => setCommandPaletteVisible(false)} 
      />
      </Router>
    </AntdApp>
  );
};

export default App;

