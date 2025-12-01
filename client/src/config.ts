/**
 * 应用配置文件
 * 智能切换本地开发和生产部署环境
 */

// 🔍 检测运行环境
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]');

const isDevelopment = process.env.NODE_ENV === 'development';

// 📍 API地址配置
const DEV_API_URL = 'http://localhost:8000'; // 本地开发后端
const PROD_API_URL = process.env.REACT_APP_API_URL || ''; // 生产后端（默认同源）

// 🎯 智能选择API地址
// 规则：
// 1. 本地开发环境(localhost) -> 使用本地后端
// 2. 生产环境有环境变量 -> 使用环境变量指定的后端
// 3. 生产环境无环境变量 -> 使用同源相对路径（避免CORS和网络问题）
export const API_BASE_URL = isLocalhost ? DEV_API_URL : PROD_API_URL;

// 🐛 调试信息（开发环境）
if (isDevelopment && typeof window !== 'undefined') {
  // 延迟引入以避免循环依赖
  const { logger } = require('./utils/logger');
  logger.info('🔧 [Config] Environment Detection:', {
    hostname: window.location.hostname,
    isLocalhost,
    isDevelopment,
    API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  });
}

// 🔧 Mock数据配置（仅在本地开发且后端不可用时使用）
export const USE_MOCK_DATA = isDevelopment && isLocalhost;

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
