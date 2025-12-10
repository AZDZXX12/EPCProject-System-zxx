/**
 * 监控仪表盘覆盖层组件
 */

import React, { useState, useEffect } from 'react';
import { 
  Factory, Settings, AlertTriangle, RefreshCw, Shield, Play, Square, 
  TrendingUp, Bell, CheckCircle, Search, Monitor, ChevronRight, Activity, Blend
} from 'lucide-react';
import { ViewMode, UploadedFile, ModelStats } from './types';
import { useDCS } from '../../contexts/DCSContext';
import './DigitalTwin3D.css';

interface DashboardOverlayProps {
  onSwitchMode: (mode: ViewMode) => void;
  onInspection: (active: boolean) => void;
  file: UploadedFile | null;
  modelStats: ModelStats | null;
}

const DashboardOverlay: React.FC<DashboardOverlayProps> = ({ 
  onSwitchMode, 
  onInspection, 
  file, 
  modelStats 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInspecting, setIsInspecting] = useState(false);
  
  // 使用DCS实时数据
  const { processData, controlEquipment, getActiveAlarms } = useDCS();

  const handleInspection = () => {
    const newState = !isInspecting;
    setIsInspecting(newState);
    onInspection(newState);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = modelStats || { triangles: '45,210', materials: 12, dimensions: '12m x 8m x 6m' };
  const assetName = file ? file.name : 'Demo_Factory_Pro.glb';

  // 获取DCS控制回路数据
  const ticLoop = processData.controlLoops.find(l => l.id === 'TIC-101');
  const picLoop = processData.controlLoops.find(l => l.id === 'PIC-203');
  const lic101 = processData.controlLoops.find(l => l.id === 'LIC-101');
  const lic201 = processData.controlLoops.find(l => l.id === 'LIC-201');

  // 获取设备状态
  const compressor = processData.equipment.find(eq => eq.id === 'C-201A');

  // 兼容旧数据结构（避免代码大量修改）
  const data = {
    pv1: ticLoop?.pv || 842.0,
    op1: ticLoop?.op || 45.0,
    pv2: picLoop?.pv || 45.1,
    op2: picLoop?.op || 60.0,
    tank1: lic101?.pv || 72.5,
    tank2: 45.2, // TK-102 (暂未配置控制回路)
    tank3: lic201?.pv || 88.9
  };

  // 获取活动报警数量
  const activeAlarms = getActiveAlarms();

  return (
    <div className="dashboard-overlay">
      
      {/* 顶部报警条 */}
      <div className="alarm-ticker">
        <div className="alarm-badge">
          <AlertTriangle className="icon-xs" /> 紧急报警 ({activeAlarms.length})
        </div>
        <div className="alarm-content">
          <div className="alarm-text">
            {activeAlarms.length > 0 
              ? `[${activeAlarms[0].timestamp.toLocaleTimeString()}] ${activeAlarms[0].description}`
              : '[系统正常] 无活动报警'}
          </div>
        </div>
        <div className="alarm-detail-link">查看详情</div>
      </div>

      {/* 顶部导航栏 */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-icon-box">
            <Factory className="header-icon" />
          </div>
          <div>
            <h1 className="header-title">化工生产线数字孪生</h1>
            <div className="header-subtitle">CHEMICAL PLANT DIGITAL TWIN SYSTEM</div>
          </div>
        </div>
        
        <div className="header-center">
          <div className="mode-switcher">
            <button className="mode-btn mode-btn-active">
              MONITOR
            </button>
            <button 
              className="mode-btn"
              onClick={() => onSwitchMode('editor')}
            >
              EDITOR
            </button>
          </div>
        </div>

        <div className="header-right">
          <button 
            className="blender-btn-compact"
            onClick={() => window.open('/blender-editor', '_blank')}
            title="打开Blender 3D编辑器 (新标签)"
          >
            <Blend size={16} />
            <span>3D</span>
          </button>
          <div className="time-display">
            <div className="time-clock">{currentTime.toLocaleTimeString([], {hour12: false})}</div>
            <div className="time-date">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* 主体内容区 */}
      <div className="dashboard-content">
        
        {/* 左侧面板 */}
        <div className="left-panel">
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title-bar" />
              <h3 className="panel-title">工艺单元</h3>
            </div>
            <div className="panel-body">
              <div className="unit-list">
                {['乙烯裂解', '急冷区', '压缩区', '分离区', '加氢区', '成品罐区'].map((item, i) => (
                  <div key={i} className={`unit-item ${i === 0 ? 'unit-item-active' : ''}`}>
                    <div className={`unit-dot ${i === 0 ? 'unit-dot-active' : ''}`} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel-card panel-card-sm">
            <div className="panel-header">
              <div className="panel-title-bar" />
              <h3 className="panel-title">关键指标</h3>
            </div>
            <div className="panel-body">
              <div className="kpi-grid">
                <div className="kpi-box">
                  <div className="kpi-label">负荷率</div>
                  <div className="kpi-value">{processData.kpis.loadFactor.toFixed(1)}<span className="kpi-unit">%</span></div>
                </div>
                <div className="kpi-box">
                  <div className="kpi-label">能耗密度</div>
                  <div className="kpi-value">{Math.round(processData.kpis.energyConsumption)}<span className="kpi-unit">kwh/t</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel-card panel-card-sm">
            <div className="panel-header">
              <div className="panel-title-bar" />
              <h3 className="panel-title">HSE 安全看板</h3>
            </div>
            <div className="panel-body">
              <div className="safety-box">
                <div className="safety-header">
                  <Shield className="icon-xs" /> 安全运行天数
                </div>
                <div className="safety-value">1284</div>
                <div className="safety-label">Days without incident</div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧面板 */}
        <div className="right-panel">
          
          {/* 资产信息 */}
          <div className="panel-card panel-card-sm">
            <div className="panel-header">
              <div className="panel-title-bar" />
              <h3 className="panel-title">资产信息</h3>
            </div>
            <div className="panel-body">
              <div className="asset-detail">
                <div className="asset-detail-name">{assetName}</div>
                <div className="asset-detail-format">GLB FORMAT / 2.0</div>
              </div>
              <div className="asset-stats">
                <div className="asset-stat">
                  <div className="asset-stat-label">Tris</div>
                  <div className="asset-stat-value">{stats.triangles}</div>
                </div>
                <div className="asset-stat">
                  <div className="asset-stat-label">Mats</div>
                  <div className="asset-stat-value">{stats.materials}</div>
                </div>
                <div className="asset-stat">
                  <div className="asset-stat-label">Size</div>
                  <div className="asset-stat-value">{stats.dimensions}</div>
                </div>
              </div>
            </div>
          </div>

          {/* DCS 控制回路 */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title-bar" />
              <h3 className="panel-title">DCS 控制回路</h3>
            </div>
            <div className="panel-body">
              
              {/* TIC-101 */}
              <div className="pid-panel">
                <div className="pid-header">
                  <div>
                    <div className="pid-tag">TIC-101 <TrendingUp className="icon-xxs" /></div>
                    <div className="pid-desc">裂解炉出口温度</div>
                  </div>
                  <div className="pid-mode pid-mode-auto">AUTO</div>
                </div>
                <div className="pid-bars">
                  <div className="pid-bar-container">
                    <div className="pid-bar-fill pid-bar-pv" style={{ height: `${Math.min(data.pv1/10, 100)}%` }} />
                    <span className="pid-bar-label">PV</span>
                  </div>
                  <div className="pid-bar-container pid-bar-op-container">
                    <div className="pid-bar-fill pid-bar-op" style={{ height: `${data.op1}%` }} />
                    <span className="pid-bar-label">OP</span>
                  </div>
                </div>
                <div className="pid-values">
                  <div className="pid-value-box">
                    <span className="pid-value-label">PV</span>
                    <span className="pid-value-num">{data.pv1.toFixed(1)}</span>
                  </div>
                  <div className="pid-value-box">
                    <span className="pid-value-label">SP</span>
                    <span className="pid-value-num">{ticLoop?.sp.toFixed(1) || '840.0'}</span>
                  </div>
                  <div className="pid-value-box">
                    <span className="pid-value-label">OP</span>
                    <span className="pid-value-num">{data.op1.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* PIC-203 */}
              <div className="pid-panel">
                <div className="pid-header">
                  <div>
                    <div className="pid-tag">PIC-203 <TrendingUp className="icon-xxs" /></div>
                    <div className="pid-desc">压缩机入口压力</div>
                  </div>
                  <div className="pid-mode pid-mode-auto">AUTO</div>
                </div>
                <div className="pid-bars">
                  <div className="pid-bar-container">
                    <div className="pid-bar-fill pid-bar-pv" style={{ height: `${data.pv2 * 2}%` }} />
                    <span className="pid-bar-label">PV</span>
                  </div>
                  <div className="pid-bar-container pid-bar-op-container">
                    <div className="pid-bar-fill pid-bar-op" style={{ height: `${data.op2}%` }} />
                    <span className="pid-bar-label">OP</span>
                  </div>
                </div>
                <div className="pid-values">
                  <div className="pid-value-box">
                    <span className="pid-value-label">PV</span>
                    <span className="pid-value-num">{data.pv2.toFixed(2)}</span>
                  </div>
                  <div className="pid-value-box">
                    <span className="pid-value-label">SP</span>
                    <span className="pid-value-num">{picLoop?.sp.toFixed(1) || '45.0'}</span>
                  </div>
                  <div className="pid-value-box">
                    <span className="pid-value-label">OP</span>
                    <span className="pid-value-num">{data.op2.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 设备控制 */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title-bar" />
              <h3 className="panel-title">设备控制</h3>
            </div>
            <div className="panel-body">
              
              <div className="device-item">
                <div className="device-icon device-icon-active">
                  <RefreshCw className="icon-sm device-icon-spin" />
                </div>
                <div className="device-info">
                  <div className="device-tag">C-201A</div>
                  <div className="device-name">裂解气压缩机 A</div>
                </div>
                <div className="device-controls">
                  <button className="device-btn device-btn-start device-btn-active">
                    <Play className="icon-xxs" /> 启动
                  </button>
                  <button className="device-btn device-btn-stop">
                    <Square className="icon-xxs" /> 停止
                  </button>
                </div>
              </div>

              <div className="device-item">
                <div className="device-icon device-icon-active">
                  <RefreshCw className="icon-sm device-icon-spin" />
                </div>
                <div className="device-info">
                  <div className="device-tag">C-301</div>
                  <div className="device-name">乙烯制冷压缩机</div>
                </div>
                <div className="device-controls">
                  <button className="device-btn device-btn-start device-btn-active">
                    <Play className="icon-xxs" /> 启动
                  </button>
                  <button className="device-btn device-btn-stop">
                    <Square className="icon-xxs" /> 停止
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* 储罐组 */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title-bar" />
              <h3 className="panel-title">储罐组</h3>
            </div>
            <div className="panel-body">
              <div className="tank-grid">
                <div className="tank-widget">
                  <div className="tank-header">
                    <span className="tank-name">TK-101</span>
                    <span className="tank-level">{data.tank1.toFixed(1)}%</span>
                  </div>
                  <div className="tank-container">
                    <div className="tank-fill" style={{ height: `${data.tank1}%` }}>
                      <div className="tank-surface" />
                    </div>
                  </div>
                  <div className="tank-product">Raw Naphtha</div>
                </div>

                <div className="tank-widget">
                  <div className="tank-header">
                    <span className="tank-name">TK-102</span>
                    <span className="tank-level">{data.tank2.toFixed(1)}%</span>
                  </div>
                  <div className="tank-container">
                    <div className="tank-fill" style={{ height: `${data.tank2}%` }}>
                      <div className="tank-surface" />
                    </div>
                  </div>
                  <div className="tank-product">Raw Naphtha</div>
                </div>

                <div className="tank-widget">
                  <div className="tank-header">
                    <span className="tank-name">TK-201</span>
                    <span className="tank-level tank-level-high">{data.tank3.toFixed(1)}%</span>
                  </div>
                  <div className="tank-container">
                    <div className="tank-fill tank-fill-high" style={{ height: `${data.tank3}%` }}>
                      <div className="tank-surface" />
                    </div>
                  </div>
                  <div className="tank-product">Ethylene</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="dashboard-footer">
        <div className="footer-left">
          <button className="footer-link"><Monitor className="icon-xxs" /> SYSTEM OVERVIEW</button>
          <button className="footer-link"><Settings className="icon-xxs" /> CONFIGURATION</button>
          <button 
            className={`footer-link ${isInspecting ? 'footer-link-active' : ''}`}
            onClick={handleInspection}
          >
            <Search className="icon-xxs" /> {isInspecting ? 'INSPECTION ACTIVE' : 'SMART INSPECTION'}
          </button>
        </div>
        <div className="footer-right">
          <span className="footer-stat">CPU: <span className="footer-value">12%</span></span>
          <span className="footer-stat">MEM: <span className="footer-value">4.2GB</span></span>
          <span className="footer-status">
            <div className="status-dot" /> ONLINE
          </span>
          <span className="footer-version">v3.0.1 build 2405</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverlay;
