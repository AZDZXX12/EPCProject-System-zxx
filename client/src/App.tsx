import React, { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, App as AntdApp, Spin, Button } from 'antd';
import { RobotOutlined, MinusOutlined, CloseOutlined } from '@ant-design/icons';
import { ProjectProvider } from './contexts/ProjectContext';
import AppSider from './components/Layout/Sider';
import CommandPalette from './components/CommandPalette';
import GlobalActions from './components/GlobalActions/GlobalActions';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import Workspace from './pages/Workspace';
import { initializeSystem } from './utils/initializeSystem';
import { lazyWithRetry, preloadComponents } from './utils/lazyLoader';
import { usePerformance } from './hooks/usePerformance';
import { logger } from './utils/logger';
import './styles/globals.css';
import './App.css';
import './styles/MobileOptimization.css';
import './styles/visual-enhancements.css';
import './pages/Workspace.css';
import AIAssistantPanel from './components/AIAssistant/AIAssistantPanel';
import eventBus, { EVENTS } from './utils/EventBus';

// 使用优化的懒加载
const DigitalTwinDashboard = lazyWithRetry(() => import('./pages/DigitalTwinDashboard'));
const NewDigitalTwinDashboard = lazyWithRetry(() => import('./pages/NewDigitalTwinDashboard'));
const BlenderEditorPage = lazyWithRetry(() => import('./pages/BlenderEditorPage'));
const GanttModulePage = lazyWithRetry(() => import('./pages/GanttModulePage'));
const DeviceManagement = lazyWithRetry(() => import('./pages/DeviceManagement'));
const Safety = lazyWithRetry(() => import('./pages/Safety'));
const ProjectLifecycleManager = lazyWithRetry(() => import('./pages/ProjectLifecycleManager'));
const ProcurementManagement = lazyWithRetry(() => import('./pages/ProcurementManagement'));
const ConstructionLog = lazyWithRetry(() => import('./pages/ConstructionLog'));
const Utilities = lazyWithRetry(() => import('./pages/EnhancedUtilities'));
const Quality = lazyWithRetry(() => import('./pages/Quality'));
const UnifiedEquipmentSelection = lazyWithRetry(() => import('./pages/UnifiedEquipmentSelection'));
const LuckysheetSelection = lazyWithRetry(() => import('./pages/LuckysheetSelection'));
const Personnel = lazyWithRetry(() => import('./pages/Personnel'));
const Documents = lazyWithRetry(() => import('./pages/Documents'));
const ReportGenerator = lazyWithRetry(() => import('./pages/ReportGenerator'));
const EnhancedSettings = lazyWithRetry(() => import('./pages/EnhancedSettings'));
const EnhancedSystemManagement = lazyWithRetry(() => import('./pages/EnhancedSystemManagement'));
const EnhancedConstructionManagement = lazyWithRetry(() => import('./pages/EnhancedConstructionManagement'));
const CostManagement = lazyWithRetry(() => import('./pages/CostManagement'));
const KnowledgeBasePage = lazyWithRetry(() => import('./pages/KnowledgeBasePage'));
const SystemSettings = lazyWithRetry(() => import('./pages/SystemSettings'));
const MaterialPriceMonitor = lazyWithRetry(() => import('./pages/MaterialPriceMonitor'));
const UserManagement = lazyWithRetry(() => import('./pages/UserManagement'));
const PanoramaViewer = lazyWithRetry(() => import('./pages/PanoramaViewer'));

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

  // (Removed) AI window effects were mistakenly placed here; moved to App component

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

const App: React.FC = React.memo(() => {
  const [commandPaletteVisible, setCommandPaletteVisible] = React.useState(false);
  const [siderCollapsed, setSiderCollapsed] = React.useState(false);
  const { measureAsync } = usePerformance('App');

  // Global AI Assistant state
  const [aiVisible, setAiVisible] = React.useState(false);
  const aiRef = React.useRef<HTMLDivElement | null>(null);
  const [aiPos, setAiPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 80 });
  const [aiSize, setAiSize] = React.useState<{ w: number; h: number }>({ w: 480, h: 600 });
  const [aiMinimized, setAiMinimized] = React.useState<boolean>(false);
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  // Draggable AI floating button state
  const [aiBtnPos, setAiBtnPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const aiBtnDragging = React.useRef(false);
  const aiBtnStart = React.useRef<{ x: number; y: number; cx: number; cy: number }>({ x: 0, y: 0, cx: 0, cy: 0 });

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

  // Load saved AI window state (global)
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('global_ai_window_state');
      if (saved) {
        const s = JSON.parse(saved);
        if (typeof s.w === 'number' && typeof s.h === 'number') setAiSize({ w: s.w, h: s.h });
        if (typeof s.x === 'number' && typeof s.y === 'number') setAiPos({ x: s.x, y: s.y });
        if (typeof s.minimized === 'boolean') setAiMinimized(s.minimized);
      }
      const btnSaved = localStorage.getItem('global_ai_button_pos');
      if (btnSaved) {
        const p = JSON.parse(btnSaved);
        if (typeof p.x === 'number' && typeof p.y === 'number') {
          setAiBtnPos({ x: p.x, y: p.y });
        }
      } else {
        // default bottom-right: match previous visual roughly
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const btnSize = 56; // matches CSS
        setAiBtnPos({ x: Math.max(12, vw - btnSize - 24), y: Math.max(12, vh - btnSize - 80) });
      }
    } catch {}
  }, []);

  // Persist AI window state (global)
  React.useEffect(() => {
    try {
      const saved = { x: aiPos.x, y: aiPos.y, w: aiSize.w, h: aiSize.h, minimized: aiMinimized };
      localStorage.setItem('global_ai_window_state', JSON.stringify(saved));
    } catch {}
  }, [aiPos, aiSize, aiMinimized]);

  // Persist AI floating button position
  React.useEffect(() => {
    try {
      localStorage.setItem('global_ai_button_pos', JSON.stringify(aiBtnPos));
    } catch {}
  }, [aiBtnPos]);

  // Mobile detection
  React.useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Clamp position on resize
  React.useEffect(() => {
    const clamp = () => {
      const el = aiRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const width = (el?.offsetWidth || aiSize.w);
      const height = (aiMinimized ? 48 : (el?.offsetHeight || aiSize.h));
      const nx = Math.max(10, Math.min(vw - width - 10, aiPos.x));
      const ny = Math.max(10, Math.min(vh - height - 10, aiPos.y));
      if (nx !== aiPos.x || ny !== aiPos.y) setAiPos({ x: nx, y: ny });
    };
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [aiPos, aiSize, aiMinimized]);

  // Open AI - 放在右上角，确保可见
  const openAI = () => {
    logger.debug('[App] AI按钮被点击');
    
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    logger.debug('[App] 页面滚动到顶部');
    
    const vw = window.innerWidth;
    // 窗口放在右上角，距离右边和顶部各20px
    const x = Math.max(20, vw - aiSize.w - 20);
    const y = 20; // 距离顶部20px
    logger.debug('[App] 计算的窗口位置', { vw, windowWidth: aiSize.w, x, y });
    setAiPos({ x, y });
    setAiVisible(true);
    logger.debug('[App] AI窗口已设置为可见', { x, y, aiVisible: true });
    
    // 延迟检查DOM
    setTimeout(() => {
      const aiWindow = document.querySelector('.ai-floating-window');
      if (aiWindow) {
        logger.debug('[App] ✅ AI窗口DOM已创建');
        const styles = window.getComputedStyle(aiWindow);
        logger.debug('[App] 关键样式检查', {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position
        });
        
        // 检查窗口边界
        const rect = aiWindow.getBoundingClientRect();
        logger.debug('[App] 窗口边界', {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          inViewport: rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth
        });
        
        // 检查窗口内容
        const content = aiWindow.querySelector('.ai-window-content');
        logger.debug('[App] 窗口内容元素', { hasContent: !!content, childCount: content?.childNodes.length });
      } else {
        logger.error('[App] ❌ AI窗口DOM未找到');
      }
    }, 100);
  };

  // Subscribe global AI open event
  React.useEffect(() => {
    const handler = () => openAI();
    eventBus.on(EVENTS.AI_ASSISTANT_OPEN, handler);
    return () => eventBus.off(EVENTS.AI_ASSISTANT_OPEN, handler);
  }, [aiSize.w]);

  // Confirm AI button mounted
  React.useEffect(() => {
    logger.info('[App] AI按钮组件已挂载');
  }, []);

  // Monitor aiVisible changes
  React.useEffect(() => {
    logger.debug('[App] aiVisible状态变化', { aiVisible, aiPos, aiSize });
  }, [aiVisible, aiPos, aiSize]);

  // 系统初始化
  React.useEffect(() => {
    initializeSystem();
  }, []);

  // 预加载常用组件（按使用频率优化）
  React.useEffect(() => {
    const preloadCommonComponents = async () => {
      await measureAsync(async () => {
        await preloadComponents([
          // 高频模块优先加载
          () => import('./pages/GanttModulePage'),
          () => import('./pages/DigitalTwinDashboard'),
          // 次频模块延后加载
          () => import('./pages/DeviceManagement'),
          () => import('./pages/ProjectLifecycleManager'),
        ]);
      }, 'Preload Common Components');
    };

    // 延迟3秒预加载，避免阻塞初始渲染
    const timer = setTimeout(preloadCommonComponents, 3000);
    return () => clearTimeout(timer);
  }, [measureAsync]);

  return (
    <AntdApp>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* 登录和注册页面路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 受保护的主应用路由 */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <ProjectProvider>
                  <Layout style={{ minHeight: '100vh' }}>
                    <AppSider collapsed={siderCollapsed} onCollapse={setSiderCollapsed} />
                    <Content className={`main-content ${siderCollapsed ? 'sider-collapsed' : 'sider-expanded'}`}>
                      <Suspense fallback={
                        <div className="loading-container">
                          <Spin size="large" />
                        </div>
                      }>
                            <Routes>
                            <Route path="/" element={<Navigate to="/workspace" replace />} />
                            <Route path="/workspace" element={<Workspace />} />
                            <Route path="/project-lifecycle" element={<ProjectLifecycleManager />} />
                            <Route path="/digital-twin" element={<NewDigitalTwinDashboard />} />
                            <Route path="/digital-twin-legacy" element={<DigitalTwinDashboard />} />
                            <Route path="/blender-editor" element={<BlenderEditorPage />} />
                            <Route path="/procurement" element={<ProcurementManagement />} />
                            {/* 统一任务管理入口 */}
                            <Route path="/tasks" element={<GanttModulePage />} />
                            <Route path="/task-center" element={<Navigate to="/tasks" replace />} />
                            <Route path="/gantt" element={<Navigate to="/tasks?view=gantt" replace />} />
                            <Route path="/kanban" element={<Navigate to="/tasks?view=kanban" replace />} />
                            <Route path="/construction" element={<EnhancedConstructionManagement />} />
                            <Route path="/construction-management" element={<Navigate to="/construction" replace />} />
                            <Route path="/construction-log" element={<ConstructionLog />} />
                            <Route path="/utilities" element={<Utilities />} />
                            <Route path="/devices" element={<DeviceManagement />} />
                            <Route path="/safety" element={<Safety />} />
                            <Route path="/quality" element={<Quality />} />
                            <Route path="/selection" element={<LuckysheetSelection />} />
                            <Route path="/equipment-selection" element={<UnifiedEquipmentSelection />} />
                            <Route path="/personnel" element={<Personnel />} />
                            <Route path="/documents" element={<Documents />} />
                            <Route path="/reports" element={<ReportGenerator />} />
                            <Route path="/settings" element={<EnhancedSettings />} />
                            <Route path="/settings-enhanced" element={<Navigate to="/settings" replace />} />
                            <Route path="/system-management" element={<EnhancedSystemManagement />} />
                            <Route path="/user-management" element={<UserManagement />} />
                            <Route path="/change-password" element={<ChangePassword />} />
                            <Route path="/construction-enhanced" element={<Navigate to="/construction" replace />} />
              <Route path="/cost-management" element={<CostManagement />} />
              <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
                            <Route path="/system-management-enhanced" element={<EnhancedSystemManagement />} />
                            <Route path="/system-settings" element={<SystemSettings />} />
                            <Route path="/material-price" element={<MaterialPriceMonitor />} />
                            <Route path="/panorama" element={<PanoramaViewer />} />
                          </Routes>
                        </Suspense>
                      </Content>

                    {/* Global AI Assistant Floating Button - Portal to body */}
                    {createPortal(
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<RobotOutlined />}
                        size="large"
                        className="ai-assistant-float-btn"
                        style={{
                          position: 'fixed',
                          left: aiBtnPos.x,
                          top: aiBtnPos.y,
                          right: 'auto',
                          bottom: 'auto',
                          zIndex: 10001,
                          cursor: aiBtnDragging.current ? 'grabbing' as any : 'grab'
                        }}
                        onMouseDown={(e) => {
                          try {
                            aiBtnDragging.current = false;
                            aiBtnStart.current = { x: e.clientX, y: e.clientY, cx: aiBtnPos.x, cy: aiBtnPos.y };
                            const move = (ev: MouseEvent) => {
                              const dx = ev.clientX - aiBtnStart.current.x;
                              const dy = ev.clientY - aiBtnStart.current.y;
                              if (!aiBtnDragging.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
                                aiBtnDragging.current = true;
                              }
                              const vw = window.innerWidth;
                              const vh = window.innerHeight;
                              const size = 56; // approximate
                              let nx = aiBtnStart.current.cx + dx;
                              let ny = aiBtnStart.current.cy + dy;
                              nx = Math.max(8, Math.min(vw - size - 8, nx));
                              ny = Math.max(8, Math.min(vh - size - 8, ny));
                              setAiBtnPos({ x: nx, y: ny });
                            };
                            const up = (ev: MouseEvent) => {
                              document.removeEventListener('mousemove', move);
                              document.removeEventListener('mouseup', up);
                              const moved = aiBtnDragging.current;
                              aiBtnDragging.current = false;
                              if (!moved) {
                                logger.debug('[App] AI按钮点击事件触发');
                                openAI();
                              }
                            };
                            document.addEventListener('mousemove', move);
                            document.addEventListener('mouseup', up);
                          } catch {}
                        }}
                        title="打开AI助手（可拖动）"
                      />,
                      document.body
                    )}

                    {/* Global AI Assistant Floating Window (Portal) */}
                    {aiVisible && createPortal(
                      <div
                        onClick={() => logger.debug('[App] AI窗口被点击')}
                        ref={aiRef}
                        className={`ai-floating-window${aiMinimized ? ' minimized' : ''}${isMobile ? ' bottom-sheet' : ''}`}
                        style={{
                          width: aiSize.w + 'px',
                          height: aiSize.h + 'px',
                          left: aiPos.x + 'px',
                          top: aiPos.y + 'px',
                          zIndex: 10000
                        }}
                      >
                        {/* Draggable header (desktop only) */}
                        <div
                          className="ai-window-header"
                          onMouseDown={(e) => {
                            if (isMobile) return;
                            const el = aiRef.current;
                            if (!el) return;
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const rect = el.getBoundingClientRect();
                            let baseX = aiPos.x;
                            let baseY = aiPos.y;
                            let lastX = baseX;
                            let lastY = baseY;
                            let raf = 0;
                            const move = (ev: MouseEvent) => {
                              const dx = ev.clientX - startX;
                              const dy = ev.clientY - startY;
                              const vw = window.innerWidth;
                              const vh = window.innerHeight;
                              const w = el.offsetWidth || rect.width;
                              const h = (aiMinimized ? 48 : el.offsetHeight) || rect.height;
                              let nx = baseX + dx;
                              let ny = baseY + dy;
                              
                              // 严格限制边界，确保窗口不会拖出界面外
                              nx = Math.max(10, Math.min(vw - w - 10, nx));
                              ny = Math.max(10, Math.min(vh - h - 10, ny));
                              
                              lastX = nx; lastY = ny;
                              if (!raf) {
                                raf = requestAnimationFrame(() => {
                                  // 使用top/left替代transform
                                  el.style.left = `${lastX}px`;
                                  el.style.top = `${lastY}px`;
                                  raf = 0;
                                });
                              }
                            };
                            const up = () => {
                              document.removeEventListener('mousemove', move);
                              document.removeEventListener('mouseup', up);
                              setAiPos({ x: lastX, y: lastY });
                            };
                            document.addEventListener('mousemove', move);
                            document.addEventListener('mouseup', up);
                          }}
                        >
                          <div className="header-title">
                            <RobotOutlined />
                            <span>AI智能助手</span>
                          </div>
                          <div className="header-actions">
                            <Button
                              type="text"
                              size="small"
                              icon={<MinusOutlined />}
                              onClick={() => setAiMinimized((v) => !v)}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={() => setAiVisible(false)}
                            />
                          </div>
                        </div>

                        <div className="ai-window-content">
                          <AIAssistantPanel />
                        </div>

                        {/* Resize handles */}
                        {!aiMinimized && (
                          <div
                            className="ai-resize-handle"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const el = aiRef.current;
                              if (!el) return;
                              const startX = e.clientX;
                              const startY = e.clientY;
                              const startW = el.offsetWidth;
                              const startH = el.offsetHeight;
                              let lastW = startW;
                              let lastH = startH;
                              const move = (ev: MouseEvent) => {
                                const dw = ev.clientX - startX;
                                const dh = ev.clientY - startY;
                                const vw = window.innerWidth;
                                const vh = window.innerHeight;
                                let nw = Math.max(320, Math.min(800, startW + dw));
                                let nh = Math.max(400, Math.min(vh - 80, startH + dh));
                                nw = Math.min(nw, vw - aiPos.x - 16);
                                nh = Math.min(nh, vh - aiPos.y - 16);
                                el.style.width = nw + 'px';
                                el.style.height = nh + 'px';
                                lastW = nw; lastH = nh;
                              };
                              const up = () => {
                                document.removeEventListener('mousemove', move);
                                document.removeEventListener('mouseup', up);
                                setAiSize({ w: lastW, h: lastH });
                              };
                              document.addEventListener('mousemove', move);
                              document.addEventListener('mouseup', up);
                            }}
                          />
                        )}

                        {!aiMinimized && (
                          <div
                            className="ai-resize-handle-right"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const el = aiRef.current;
                              if (!el) return;
                              const startX = e.clientX;
                              const startW = el.offsetWidth;
                              let lastW = startW;
                              const move = (ev: MouseEvent) => {
                                const dw = ev.clientX - startX;
                                const vw = window.innerWidth;
                                let nw = Math.max(320, Math.min(800, startW + dw));
                                nw = Math.min(nw, vw - aiPos.x - 16);
                                el.style.width = nw + 'px';
                                lastW = nw;
                              };
                              const up = () => {
                                document.removeEventListener('mousemove', move);
                                document.removeEventListener('mouseup', up);
                                setAiSize((s) => ({ w: lastW, h: s.h }));
                              };
                              document.addEventListener('mousemove', move);
                              document.addEventListener('mouseup', up);
                            }}
                          />
                        )}

                        {!aiMinimized && (
                          <div
                            className="ai-resize-handle-bottom"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const el = aiRef.current;
                              if (!el) return;
                              const startY = e.clientY;
                              const startH = el.offsetHeight;
                              let lastH = startH;
                              const move = (ev: MouseEvent) => {
                                const dh = ev.clientY - startY;
                                const vh = window.innerHeight;
                                let nh = Math.max(300, Math.min(vh - 80, startH + dh));
                                nh = Math.min(nh, vh - aiPos.y - 16);
                                el.style.height = nh + 'px';
                                lastH = nh;
                              };
                              const up = () => {
                                document.removeEventListener('mousemove', move);
                                document.removeEventListener('mouseup', up);
                                setAiSize((s) => ({ w: s.w, h: lastH }));
                              };
                              document.addEventListener('mousemove', move);
                              document.addEventListener('mouseup', up);
                            }}
                          />
                        )}
                      </div>,
                      document.body
                    )}
                  </Layout>
                  
                  {/* 全局操作组件 - 通知中心、快捷操作、AI助手 */}
                  <GlobalActions />
                </ProjectProvider>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AntdApp>
  );
});

export default App;
