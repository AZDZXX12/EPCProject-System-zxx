import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { setupGlobalErrorHandler } from './utils/errorHandler';
// 提前注入全局 jQuery，保证依赖库(如Luckysheet)可直接使用
let $: any = (window as any).jQuery || (window as any).$;
if (!$) {
  try {
    // @ts-ignore - 一些项目未启用esModuleInterop或类型限制
    $ = require('jquery');
  } catch {}
}
if ($) {
  (window as any).$ = $;
  (window as any).jQuery = $;
}

// 设置全局错误处理
setupGlobalErrorHandler();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
