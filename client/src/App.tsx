import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, App as AntdApp, Spin } from 'antd';
import { ProjectProvider } from './contexts/ProjectContext';
import AppSider from './components/Layout/Sider';
import CommandPalette from './components/CommandPalette';
import Login from './pages/Login';
import Workspace from './pages/Workspace';
import { lazyWithRetry, preloadComponents } from './utils/lazyLoader';
import { usePerformance } from './hooks/usePerformance';
import './App.css';

// 使用优化的懒加载
const DigitalTwinDashboard = lazyWithRetry(() => import('./pages/DigitalTwinDashboard'));
const DhtmlxGanttChart = lazyWithRetry(() => import('./pages/DhtmlxGanttChart'));
const KanbanBoard = lazyWithRetry(() => import('./pages/KanbanBoard'));
const TaskList = lazyWithRetry(() => import('./pages/TaskList'));
const DeviceManagement = lazyWithRetry(() => import('./pages/DeviceManagement'));
const Safety = lazyWithRetry(() => import('./pages/Safety'));
const ProjectLifecycleManager = lazyWithRetry(() => import('./pages/ProjectLifecycleManager'));
const ProcurementManagement = lazyWithRetry(() => import('./pages/ProcurementManagement'));
const ConstructionManagement = lazyWithRetry(() => import('./pages/ConstructionManagement'));
const ConstructionLog = lazyWithRetry(() => import('./pages/ConstructionLog'));
const Utilities = lazyWithRetry(() => import('./pages/Utilities'));
const Quality = lazyWithRetry(() => import('./pages/Quality'));
const LuckysheetSelection = lazyWithRetry(() => import('./pages/LuckysheetSelection'));
const Personnel = lazyWithRetry(() => import('./pages/Personnel'));
const Documents = lazyWithRetry(() => import('./pages/Documents'));
const ReportGenerator = lazyWithRetry(() => import('./pages/ReportGenerator'));
const Settings = lazyWithRetry(() => import('./pages/Settings'));
const SystemManagement = lazyWithRetry(() => import('./pages/SystemManagement'));
const SystemSettings = lazyWithRetry(() => import('./pages/SystemSettings'));

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
  const { measureAsync } = usePerformance('App');

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

  // 预加载常用组件
  React.useEffect(() => {
    const preloadCommonComponents = async () => {
      await measureAsync(async () => {
        await preloadComponents([
          () => import('./pages/TaskList'),
          () => import('./pages/DeviceManagement'),
          () => import('./pages/KanbanBoard'),
        ]);
      }, 'Preload Common Components');
    };

    // 延迟预加载，避免阻塞初始渲染
    const timer = setTimeout(preloadCommonComponents, 2000);
    return () => clearTimeout(timer);
  }, [measureAsync]);

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
                        className={`main-content ${siderCollapsed ? 'collapsed' : 'expanded'}`}
                      >
                        <Suspense fallback={
                          <div className="loading-container">
                            <Spin size="large" />
                          </div>
                        }>
                          <Routes>
                            <Route path="/" element={<Navigate to="/workspace" replace />} />
                            <Route path="/workspace" element={<Workspace />} />
                            <Route path="/project-lifecycle" element={<ProjectLifecycleManager />} />
                            <Route path="/digital-twin" element={<DigitalTwinDashboard />} />
                            <Route path="/procurement" element={<ProcurementManagement />} />
                            <Route path="/tasks" element={<TaskList />} />
                            <Route path="/gantt" element={<DhtmlxGanttChart />} />
                            <Route path="/kanban" element={<KanbanBoard />} />
                            <Route
                              path="/construction-management"
                              element={<ConstructionManagement />}
                            />
                            <Route path="/construction-log" element={<ConstructionLog />} />
                            <Route path="/utilities" element={<Utilities />} />
                            <Route path="/devices" element={<DeviceManagement />} />
                            <Route path="/safety" element={<Safety />} />
                            <Route path="/quality" element={<Quality />} />
                            <Route path="/selection" element={<LuckysheetSelection />} />
                            <Route path="/personnel" element={<Personnel />} />
                            <Route path="/documents" element={<Documents />} />
                            <Route path="/reports" element={<ReportGenerator />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/system-management" element={<SystemManagement />} />
                            <Route path="/system-settings" element={<SystemSettings />} />
                          </Routes>
                        </Suspense>
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
