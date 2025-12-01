import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/global.css'; // 导入全局样式
import App from './App';
import { setupGlobalErrorHandler } from './utils/errorHandler';
import $ from 'jquery';
// 提前注入全局 jQuery，保证依赖库(如Luckysheet)可直接使用
if (!window.$) {
  window.$ = $;
}
if (!window.jQuery) {
  window.jQuery = $;
}

// 设置全局错误处理
setupGlobalErrorHandler();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
