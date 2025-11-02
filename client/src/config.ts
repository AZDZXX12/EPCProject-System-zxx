/**
 * 应用配置文件
 * 根据环境自动选择 API 地址
 */

// 开发环境 API 地址（直接连接后端）
const DEV_API_URL = 'http://localhost:8000';  // 直接连接后端

// 生产环境 API 地址（从环境变量读取，或使用默认值）
const PROD_API_URL = process.env.REACT_APP_API_URL || 'https://epc-backend.onrender.com';

// 根据环境选择 API 地址
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? PROD_API_URL 
  : DEV_API_URL;

// 开发环境提示
if (process.env.NODE_ENV === 'development') {
  console.log('%c[EPC系统] 使用代理模式连接后端 (package.json proxy -> http://localhost:8000)', 'color: #1890ff; font-weight: bold;');
  console.log('%c[EPC系统] API请求将通过React开发服务器代理转发', 'color: #52c41a;');
}

// API 端点
export const API_ENDPOINTS = {
  projects: `${API_BASE_URL}/api/v1/projects`,
  tasks: `${API_BASE_URL}/api/v1/tasks`,
  devices: `${API_BASE_URL}/api/v1/devices`,
};

// 应用配置
export const APP_CONFIG = {
  name: '化工项目管理系统',
  version: '1.0.0',
  description: 'Chemical Project Management System',
};

// 导出配置对象
const config = {
  API_BASE_URL,
  API_ENDPOINTS,
  APP_CONFIG,
};

export default config;

