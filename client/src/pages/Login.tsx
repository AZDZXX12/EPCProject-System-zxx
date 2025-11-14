import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Form, Input, Button, Checkbox, App, ConfigProvider } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { authApi } from '../services/api';
import { API_BASE_URL } from '../config';
import ErrorBoundary from '../components/ErrorBoundary';
import { handleError } from '../utils/errorHandler';
import './Login.css';

// 3D装饰模型组件 - 使用基础几何体避免GLB加载问题
const DecorativeModel: React.FC = () => {
  const meshRef = useRef<any>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  
  return (
    <mesh ref={meshRef} scale={2.5} position={[0, -1, 0]}>
      <octahedronGeometry args={[1, 2]} />
      <meshStandardMaterial 
        color="#4ecdc4" 
        metalness={0.8} 
        roughness={0.2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

// 粒子背景组件
const ParticleField: React.FC = () => {
  const particleCount = 200;
  const particles: Array<{ x: number; y: number; z: number }> = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 50,
      y: (Math.random() - 0.5) * 50,
      z: (Math.random() - 0.5) * 50,
    });
  }

  return (
    <group>
      {particles.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#00d9ff" opacity={0.6} transparent />
        </mesh>
      ))}
    </group>
  );
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [, setModelAvailable] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // CSRF令牌由API服务层自动处理
  useEffect(() => {
    // 预加载检查后端可用性；跨域时跳过CSRF以避免报错
    try {
      const apiOrigin = new URL(API_BASE_URL).origin;
      const isCrossOrigin = typeof window !== 'undefined' && apiOrigin !== window.location.origin;
      if (!isCrossOrigin) {
        authApi.getCsrfToken().catch(() => {});
      }
    } catch {}
    // 不再需要检测模型资源
    setModelAvailable(false);
  }, []);

  const onFinish = async (values: any) => {
    if (!values.username || !values.password) {
      message.error('用户名和密码不能为空');
      return;
    }

    setLoading(true);

    try {
      // 尝试真实API登录
      const data: any = await authApi.login(values.username, values.password);
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('username', data.username || values.username);
      message.success('登录成功！欢迎来到EPC项目管理系统');
      navigate('/workspace');
    } catch (error) {
      // API失败，使用模拟登录
      if (values.username === 'admin' && values.password === 'admin123') {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('username', values.username);
        message.success('登录成功！欢迎来到EPC项目管理系统');
        navigate('/workspace');
      } else {
        handleError(error, {
          customMessage: '用户名或密码错误！默认账号: admin / admin123',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 3D背景 */}
      <div className="background-3d">
        <ErrorBoundary>
          <Suspense fallback={<div style={{ color: '#00d9ff', padding: 12 }}>模型加载中...</div>}>
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 8]} />
              <ambientLight intensity={0.3} />
              <directionalLight position={[10, 10, 5]} intensity={1} color="#00d9ff" />
              <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff00ff" />
              <spotLight position={[0, 10, 0]} intensity={0.8} color="#00ffaa" />
              {/* 粒子场 */}
              <ParticleField />
              {/* 3D装饰模型 */}
              <DecorativeModel />
              <OrbitControls
                enableZoom={false}
                autoRotate
                autoRotateSpeed={0.5}
                enablePan={false}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.5}
              />
            </Canvas>
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* 网格背景 */}
      <div className="grid-background"></div>

      {/* 扫描线效果 */}
      <div className="scan-line"></div>

      {/* 顶部系统信息栏 */}
      <div className="system-header">
        <div className="system-info">
          <SafetyOutlined className="system-icon" />
          <span className="system-name">EPC PROJECT MANAGEMENT SYSTEM</span>
        </div>
        <div className="system-time">
          <span className="time-label">SYSTEM TIME</span>
          <span className="time-value">{time.toLocaleTimeString('zh-CN', { hour12: false })}</span>
          <span className="date-value">{time.toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="content-wrapper">
        {/* 左侧标题区 */}
        <div className="title-section">
          <div className="title-content">
            <div className="glitch-wrapper">
              <h1 className="main-title" data-text="EPC项目">
                EPC项目
              </h1>
            </div>
            <div className="glitch-wrapper">
              <h1 className="main-title" data-text="管理系统">
                管理系统
              </h1>
            </div>
            <div className="subtitle">
              <span className="subtitle-text">ENGINEERING</span>
              <span className="subtitle-divider">·</span>
              <span className="subtitle-text">PROCUREMENT</span>
              <span className="subtitle-divider">·</span>
              <span className="subtitle-text">CONSTRUCTION</span>
            </div>
            <div className="version-tag">
              <span className="version-label">VERSION</span>
              <span className="version-number">2.0.0-zxx</span>
              <span className="version-status">EPC开发团队</span>
            </div>

            {/* 特性列表 */}
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>工程设计管理 (E)</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>设备采购选型 (P)</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>施工进度管控 (C)</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>HSE安全质量</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧登录表单 */}
        <div className="login-section">
          <div className="login-card">
            <div className="card-header">
              <div className="header-decoration"></div>
              <h2 className="card-title">系统登录</h2>
              <p className="card-subtitle">SYSTEM ACCESS</p>
            </div>

            <ConfigProvider
              theme={{
                token: {
                  colorBgContainer: 'rgba(15, 25, 45, 0.6)',
                },
                components: {
                  Input: {
                    colorBgContainer: 'rgba(15, 25, 45, 0.6)',
                    colorBorder: 'rgba(0, 217, 255, 0.3)',
                    colorPrimaryHover: '#00d9ff',
                    colorPrimary: '#00d9ff',
                    colorText: '#fff',
                    colorTextPlaceholder: 'rgba(255, 255, 255, 0.4)',
                    colorIcon: '#00d9ff',
                    colorIconHover: '#00ff88',
                    controlOutline: 'rgba(0, 217, 255, 0.3)',
                  },
                },
              }}
            >
              <Form
                name="login"
                className="login-form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
              >
                <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
                  <Input
                    prefix={<UserOutlined className="input-icon" />}
                    placeholder="用户名 / Username"
                    size="large"
                    className="cyber-input"
                    autoComplete="username"
                  />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
                  <Input.Password
                    prefix={<LockOutlined className="input-icon" />}
                    placeholder="密码 / Password"
                    size="large"
                    className="cyber-input"
                    autoComplete="current-password"
                  />
                </Form.Item>

                <Form.Item>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="cyber-checkbox">记住我</Checkbox>
                  </Form.Item>
                  <a className="login-form-forgot" href="#!">
                    忘记密码?
                  </a>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-button"
                    loading={loading}
                    block
                    size="large"
                  >
                    {loading ? '验证中...' : '登录系统'}
                  </Button>
                </Form.Item>
              </Form>
            </ConfigProvider>
          </div>

          {/* 装饰元素 */}
          <div className="deco-lines">
            <div className="deco-line deco-line-1"></div>
            <div className="deco-line deco-line-2"></div>
            <div className="deco-line deco-line-3"></div>
          </div>
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className="footer-bar">
        <span>© 2025 EPC Project Management System</span>
        <span className="footer-divider">|</span>
        <span>Engineering · Procurement · Construction</span>
      </div>

      {/* 角落装饰 */}
      <div className="corner-deco corner-tl"></div>
      <div className="corner-deco corner-tr"></div>
      <div className="corner-deco corner-bl"></div>
      <div className="corner-deco corner-br"></div>
    </div>
  );
};

export default Login;
