/**
 * 🏭 数字孪生 SCADA 系统界面
 * Digital Twin SCADA System Dashboard
 * Version: 5.0.0
 * Date: 2025-12-02
 */

import React, { useState, useEffect } from 'react';
import { useDCS } from '../../contexts/DCSContext';
import { 
  Activity, 
  AlertTriangle, 
  Settings, 
  TrendingUp, 
  Droplet,
  Thermometer,
  Gauge,
  Factory,
  PlayCircle,
  StopCircle,
  AlertOctagon,
  BarChart2,
  Power,
  CheckCircle2,
  Clock,
  Timer,
  Zap,
  Eye,
  Maximize2,
  Minus,
  Plus,
  Check,
  Bell,
  FileText,
  Database,
  LineChart,
  PieChart,
  RefreshCw,
  Save,
  Share2,
  AlertCircle,
  User
} from 'lucide-react';
import './DigitalTwinSCADA.css';

interface DashboardOverlaySCADAProps {
  onSwitchMode: (mode: 'monitor' | 'editor') => void;
  onInspection: (active: boolean) => void;
  file: any;
  modelStats: any;
}

const DashboardOverlaySCADA: React.FC<DashboardOverlaySCADAProps> = ({
  onSwitchMode,
  onInspection,
  file,
  modelStats
}) => {
  const { processData, controlEquipment, setLoopSetpoint } = useDCS();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeProcess, setActiveProcess] = useState('ethylene-cracking');
  const [selectedLoop, setSelectedLoop] = useState<string | null>(null);
  const [editingSetpoint, setEditingSetpoint] = useState<{loopId: string, value: number} | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [dataHistory, setDataHistory] = useState<any[]>([]);

  // 更新时钟
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 获取控制回路数据
  const ticLoop = processData.controlLoops.find(l => l.id === 'TIC-101');
  const picLoop = processData.controlLoops.find(l => l.id === 'PIC-203');
  const ficLoop = processData.controlLoops.find(l => l.id === 'FIC-305');
  const licLoop = processData.controlLoops.find(l => l.id === 'LIC-407');

  // 获取KPI数据
  const loadRate = processData.kpis.loadFactor || 0;
  const energyConsumption = processData.kpis.energyConsumption || 0;
  const production = processData.kpis.productionRate || 0;
  const efficiency = processData.kpis.efficiency || 0;

  // 工艺单元列表
  const processUnits = [
    { id: 'ethylene-cracking', name: '乙烯裂解', status: 'running', icon: '🔥' },
    { id: 'heat-exchange', name: '热交换', status: 'running', icon: '🔄' },
    { id: 'compression', name: '压缩分离', status: 'running', icon: '💨' },
    { id: 'storage', name: '储存外输', status: 'running', icon: '📦' },
  ];

  // 设备列表（增强版 - 参考北京齿轮工厂）
  const devices = [
    { id: 'gear1', name: '裂解炉1', icon: '🔥', current: 158, power: 1029, status: 'running', efficiency: 98 },
    { id: 'gear2', name: '裂解炉2', icon: '🔥', current: 160, power: 1041, status: 'running', efficiency: 97 },
    { id: 'pump1', name: '进料泵', icon: '⚡', current: 10, power: 20, status: 'running', efficiency: 95 },
    { id: 'pump2', name: '循环泵', icon: '⚡', current: 10, power: 20, status: 'running', efficiency: 96 },
    { id: 'comp1', name: '压缩机', icon: '💨', current: 80, power: 520, status: 'running', efficiency: 92 },
    { id: 'sep1', name: '分离塔', icon: '🏗️', current: 5, power: 12, status: 'running', efficiency: 99 },
  ];

  // 传统设备列表
  const equipment = [
    { id: 'P-101', name: '进料泵', status: 'running' },
    { id: 'C-201', name: '压缩机', status: 'running' },
    { id: 'V-301', name: '分离塔', status: 'running' },
  ];

  // 储罐数据
  const tanks = [
    { id: 'TK-101', product: 'C-201A', level: 70.2, capacity: 1250, status: 'warning' },
    { id: 'TK-102', product: 'C-301', level: 45.8, capacity: 850, status: 'normal' },
    { id: 'TK-103', product: 'H2', level: 25.3, capacity: 480, status: 'normal' },
  ];

  // 报警列表
  const alarms = processData.alarms.filter(a => !a.acknowledged).slice(0, 4);

  // 生产数据表格（参考质检数据）
  const productionData = [
    { id: 1, equipmentId: '设备SA13', processName: '工序1', goodCount: 1450, badCount: 50, output: 2450 },
    { id: 2, equipmentId: '电动机S04', processName: '工序2', goodCount: 980, badCount: 20, output: 1100 },
    { id: 3, equipmentId: '电动机A13', processName: '工序3', goodCount: 2710, badCount: 90, output: 2800 },
    { id: 4, equipmentId: '齿轮S044', processName: '工序4', goodCount: 1820, badCount: 80, output: 1900 },
    { id: 5, equipmentId: '齿轮S044', processName: '工序5', goodCount: 980, badCount: 20, output: 1200 },
    { id: 6, equipmentId: '齿轮SA12', processName: '工序6', goodCount: 870, badCount: 30, output: 1200 },
  ];

  // 生产线数据（参考产线进度）
  const productionLines = [
    { id: 'line01', name: '产线01', progress: 51, target: 1000, current: 510 },
    { id: 'line02', name: '产线02', progress: 92, target: 1000, current: 920 },
    { id: 'line03', name: '产线03', progress: 45, target: 1000, current: 450 },
    { id: 'line04', name: '产线04', progress: 93, target: 1000, current: 930 },
    { id: 'line05', name: '产线05', progress: 57, target: 1000, current: 570 },
  ];

  // 消息通知数据
  const notifications = [
    { id: 1, time: '14:32', content: '裂解炉1温度达到设定值', type: 'info' },
    { id: 2, time: '14:15', content: '进料泵启动成功', type: 'success' },
    { id: 3, time: '13:58', content: '压力控制回路自动调节', type: 'info' },
    { id: 4, time: '13:45', content: '系统性能优化完成', type: 'success' },
  ];

  // 视频监控数据
  const cameras = [
    { id: 'cam1', name: '生产线1', active: true },
    { id: 'cam2', name: '生产线2', active: true },
    { id: 'cam3', name: '生产线3', active: true },
    { id: 'cam4', name: '生产线4', active: true },
  ];

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="scada-container">
      {/* 顶部导航栏 */}
      <header className="scada-header">
        <div className="scada-logo">
          <Factory className="scada-logo-icon" />
          <div className="scada-logo-text">
            <div className="scada-logo-title">化工生产线数字孪生</div>
            <div className="scada-logo-subtitle">Chemical Plant Digital Twin System</div>
          </div>
        </div>

        <div className="scada-toolbar">
          <div className="scada-toolbar-group">
            <button className="scada-btn scada-btn-primary">
              <Activity className="scada-btn-icon" />
              监控
            </button>
            <button className="scada-btn">
              <Settings className="scada-btn-icon" />
              设置
            </button>
            <button className="scada-btn">
              <BarChart2 className="scada-btn-icon" />
              分析
            </button>
          </div>

          <div className="scada-toolbar-group">
            <div className="scada-status-bar">
              <div className="scada-status-item">
                <div className="scada-status-dot scada-status-dot-online" />
                <span>系统正常</span>
              </div>
              <div className="scada-status-item">
                <AlertCircle size={16} />
                <span>{alarms.length} 报警</span>
              </div>
              <div className="scada-status-item">
                <User size={16} />
                <span>操作员</span>
              </div>
              <div className="scada-clock">
                {formatTime(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 左侧工艺监控面板 */}
      <aside className="scada-sidebar-left">
        {/* 设备状态展示 - 参考北京齿轮工厂 */}
        <div className="scada-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <Zap className="scada-panel-icon" />
              设备联盟展示
            </div>
            <div className="scada-panel-badge">{devices.length}个</div>
          </div>
          <div className="scada-panel-body">
            <div className="scada-devices-grid">
              {devices.map(device => (
                <div key={device.id} className="scada-device-card">
                  <div className="device-icon">{device.icon}</div>
                  <div className="device-name">{device.name}</div>
                  <div className="device-data">
                    <span className="current">{device.current}A</span>
                    <span className="separator"> / </span>
                    <span className="power">{device.power}W</span>
                  </div>
                  <div className="device-efficiency">{device.efficiency}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 生产数据表格 - 参考质检数据 */}
        <div className="scada-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <Database className="scada-panel-icon" />
              质检数据生产预警
            </div>
          </div>
          <div className="scada-panel-body">
            <div className="scada-data-table-container">
              <table className="scada-data-table">
                <thead>
                  <tr>
                    <th>设备编号</th>
                    <th>工序</th>
                    <th>良品</th>
                    <th>不良</th>
                    <th>产量</th>
                  </tr>
                </thead>
                <tbody>
                  {productionData.slice(0, 5).map(row => (
                    <tr key={row.id}>
                      <td className="equipment-id">{row.equipmentId}</td>
                      <td>{row.processName}</td>
                      <td className="good-count">{row.goodCount}</td>
                      <td className="bad-count">{row.badCount}</td>
                      <td>{row.output}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 工艺单元面板 */}
        <div className="scada-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <Factory className="scada-panel-icon" />
              工艺单元
            </div>
            <div className="scada-panel-badge">4个</div>
          </div>
          <div className="scada-panel-body">
            <div className="scada-process-tree">
              {processUnits.map(unit => (
                <div 
                  key={unit.id}
                  className={`scada-process-node ${activeProcess === unit.id ? 'scada-process-node-active' : ''}`}
                  onClick={() => setActiveProcess(unit.id)}
                >
                  <div className="scada-process-node-name">
                    <span style={{ marginRight: '8px' }}>{unit.icon}</span>
                    {unit.name}
                  </div>
                  <div className="scada-process-node-status">
                    {unit.status === 'running' ? '运行中' : '停止'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPI仪表盘 */}
        <div className="scada-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <Gauge className="scada-panel-icon" />
              关键指标
            </div>
          </div>
          <div className="scada-panel-body">
            <div className="scada-kpi-grid">
              <div className="scada-kpi-card">
                <div className="scada-kpi-label">负荷率</div>
                <div className="scada-kpi-value">
                  {loadRate.toFixed(1)}
                  <span className="scada-kpi-unit">%</span>
                </div>
                <div className="scada-kpi-trend scada-kpi-trend-up">
                  <TrendingUp size={12} />
                  <span>+2.3%</span>
                </div>
              </div>

              <div className="scada-kpi-card">
                <div className="scada-kpi-label">能耗</div>
                <div className="scada-kpi-value">
                  {Math.round(energyConsumption)}
                  <span className="scada-kpi-unit">kwh/t</span>
                </div>
                <div className="scada-kpi-trend scada-kpi-trend-down">
                  <TrendingUp size={12} style={{ transform: 'rotate(180deg)' }} />
                  <span>-1.2%</span>
                </div>
              </div>

              <div className="scada-kpi-card">
                <div className="scada-kpi-label">产量</div>
                <div className="scada-kpi-value">
                  {Math.round(production)}
                  <span className="scada-kpi-unit">t/h</span>
                </div>
                <div className="scada-kpi-trend scada-kpi-trend-up">
                  <TrendingUp size={12} />
                  <span>+1.5%</span>
                </div>
              </div>

              <div className="scada-kpi-card">
                <div className="scada-kpi-label">效率</div>
                <div className="scada-kpi-value">
                  {efficiency.toFixed(1)}
                  <span className="scada-kpi-unit">%</span>
                </div>
                <div className="scada-kpi-trend scada-kpi-trend-up">
                  <TrendingUp size={12} />
                  <span>+0.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HSE安全看板 */}
        <div className="scada-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <CheckCircle2 className="scada-panel-icon" />
              HSE安全看板
            </div>
          </div>
          <div className="scada-panel-body">
            <div className="scada-hse-card">
              <div className="scada-hse-label">✅ 安全运行天数</div>
              <div className="scada-hse-value">1284</div>
              <div className="scada-hse-unit">Days Without Incident</div>
            </div>
          </div>
        </div>

        {/* 设备健康度 */}
        <div className="scada-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <Activity className="scada-panel-icon" />
              设备健康度
            </div>
          </div>
          <div className="scada-panel-body">
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              <div style={{ marginBottom: '8px' }}>设备总数: <span style={{ color: '#22d3ee', fontWeight: 700 }}>156</span></div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgb(74, 222, 128)', marginRight: '8px' }} />
                <span>正常: 152 (97%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgb(253, 224, 71)', marginRight: '8px' }} />
                <span>警告: 3 (2%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgb(248, 113, 113)', marginRight: '8px' }} />
                <span>故障: 1 (1%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 能耗监控 */}
        <div className="scada-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <Zap className="scada-panel-icon" />
              能耗监控
            </div>
          </div>
          <div className="scada-panel-body">
            <div className="scada-energy-monitor">
              <div className="energy-item">
                <div className="energy-label">实时功率</div>
                <div className="energy-value">2,850 <span className="energy-unit">kW</span></div>
                <div className="energy-trend up">↑ 5.2%</div>
              </div>
              <div className="energy-item">
                <div className="energy-label">今日用电</div>
                <div className="energy-value">45,230 <span className="energy-unit">kWh</span></div>
                <div className="energy-trend down">↓ 2.1%</div>
              </div>
              <div className="energy-item">
                <div className="energy-label">月度预算</div>
                <div className="energy-value">72.5 <span className="energy-unit">%</span></div>
                <div className="energy-progress">
                  <div className="energy-progress-fill" style={{width: '72.5%'}} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 储罐监控 */}
        <div className="scada-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <Droplet className="scada-panel-icon" />
              储罐状态
            </div>
          </div>
          <div className="scada-panel-body">
            <div className="scada-tank-list">
              {tanks.map(tank => (
                <div key={tank.id} className="tank-item">
                  <div className="tank-header">
                    <span className="tank-id">{tank.id}</span>
                    <span className={`tank-status tank-status-${tank.status}`}>
                      {tank.status === 'warning' ? '⚠️' : '✓'}
                    </span>
                  </div>
                  <div className="tank-product">{tank.product}</div>
                  <div className="tank-level-bar">
                    <div 
                      className={`tank-level-fill tank-level-${tank.status}`}
                      style={{height: `${tank.level}%`}}
                    />
                    <span className="tank-level-text">{tank.level}%</span>
                  </div>
                  <div className="tank-capacity">{tank.capacity}m³</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* 中心3D展示区域 */}
      <main className="scada-main">
        {/* 3D场景在这里渲染（由Scene组件处理） */}
      </main>

      {/* 右侧DCS控制面板 */}
      <aside className="scada-sidebar-right">
        {/* 消息通知 - 参考北京齿轮工厂 */}
        <div className="scada-panel scada-notifications-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <Bell className="scada-panel-icon" />
              最新消息通知
            </div>
          </div>
          <div className="scada-panel-body">
            <div className="scada-notifications-list">
              {notifications.map(notif => (
                <div key={notif.id} className={`scada-notification-item scada-notification-${notif.type}`}>
                  <div className="notification-time">{notif.time}</div>
                  <div className="notification-content">{notif.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 生产线进度 - 参考产线进度条 */}
        <div className="scada-panel scada-progress-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <TrendingUp className="scada-panel-icon" />
              生产进度
            </div>
          </div>
          <div className="scada-panel-body">
            <div className="scada-production-progress">
              {productionLines.map(line => (
                <div key={line.id} className="scada-progress-item">
                  <div className="progress-label">
                    <span className="line-name">{line.name}</span>
                    <span className="progress-value">{line.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${line.progress}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 视频监控 - 参考4宫格视频 */}
        <div className="scada-panel scada-video-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <Eye className="scada-panel-icon" />
              视频监控
            </div>
          </div>
          <div className="scada-panel-body">
            <div className="scada-video-grid">
              {cameras.map(cam => (
                <div key={cam.id} className="scada-video-item">
                  <div className="video-placeholder">
                    <PlayCircle size={24} style={{opacity: 0.3}} />
                  </div>
                  <div className="video-label">{cam.name}</div>
                  <div className="video-status">
                    <div className={`status-indicator ${cam.active ? 'active' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TIC-101 温度控制回路 */}
        {ticLoop && (
          <div className="scada-dcs-loop">
            <div className="scada-dcs-header">
              <div>
                <div className="scada-dcs-tag">TIC-101</div>
                <div className="scada-dcs-desc">🌡️ {ticLoop.description}</div>
              </div>
              <div className="scada-dcs-mode">AUTO</div>
            </div>
            <div className="scada-dcs-body">
              <div className="scada-dcs-params">
                <div className="scada-dcs-param">
                  <div className="scada-dcs-param-label">PV</div>
                  <div className="scada-dcs-param-value scada-dcs-param-pv">
                    {ticLoop.pv.toFixed(1)}
                  </div>
                </div>
                <div className="scada-dcs-param">
                  <div className="scada-dcs-param-label">SP</div>
                  <div className="scada-dcs-param-value scada-dcs-param-sp">
                    {ticLoop.sp.toFixed(1)}
                  </div>
                </div>
                <div className="scada-dcs-param">
                  <div className="scada-dcs-param-label">OP</div>
                  <div className="scada-dcs-param-value scada-dcs-param-op">
                    {ticLoop.op.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="scada-dcs-bars">
                <div className="scada-dcs-bar-wrapper">
                  <div className="scada-dcs-bar-container">
                    <div 
                      className="scada-dcs-bar-fill scada-dcs-bar-fill-pv"
                      style={{ height: `${Math.min(100, (ticLoop.pv / 1000) * 100)}%` }}
                    />
                  </div>
                  <div className="scada-dcs-bar-label">PV</div>
                </div>
                <div className="scada-dcs-bar-wrapper">
                  <div className="scada-dcs-bar-container">
                    <div 
                      className="scada-dcs-bar-fill scada-dcs-bar-fill-op"
                      style={{ height: `${ticLoop.op}%` }}
                    />
                  </div>
                  <div className="scada-dcs-bar-label">OP</div>
                </div>
              </div>

              {/* 参数调节控制 */}
              <div className="scada-dcs-controls">
                <div className="scada-control-row">
                  <span className="scada-control-label">设定值:</span>
                  <div className="scada-control-input-group">
                    <button 
                      className="scada-control-btn"
                      onClick={() => {
                        const newSP = Math.max(800, ticLoop.sp - 5);
                        setLoopSetpoint(ticLoop.id, newSP);
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <input 
                      className="scada-control-input"
                      type="number"
                      value={ticLoop.sp.toFixed(1)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val) && val >= 800 && val <= 900) {
                          setLoopSetpoint(ticLoop.id, val);
                        }
                      }}
                      aria-label="温度设定值"
                      title="温度设定值 (800-900°C)"
                    />
                    <button 
                      className="scada-control-btn"
                      onClick={() => {
                        const newSP = Math.min(900, ticLoop.sp + 5);
                        setLoopSetpoint(ticLoop.id, newSP);
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="scada-control-unit">°C</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PIC-203 压力控制回路 */}
        {picLoop && (
          <div className="scada-dcs-loop">
            <div className="scada-dcs-header">
              <div>
                <div className="scada-dcs-tag">PIC-203</div>
                <div className="scada-dcs-desc">📊 {picLoop.description}</div>
              </div>
              <div className="scada-dcs-mode">AUTO</div>
            </div>
            <div className="scada-dcs-body">
              <div className="scada-dcs-params">
                <div className="scada-dcs-param">
                  <div className="scada-dcs-param-label">PV</div>
                  <div className="scada-dcs-param-value scada-dcs-param-pv">
                    {picLoop.pv.toFixed(2)}
                  </div>
                </div>
                <div className="scada-dcs-param">
                  <div className="scada-dcs-param-label">SP</div>
                  <div className="scada-dcs-param-value scada-dcs-param-sp">
                    {picLoop.sp.toFixed(2)}
                  </div>
                </div>
                <div className="scada-dcs-param">
                  <div className="scada-dcs-param-label">OP</div>
                  <div className="scada-dcs-param-value scada-dcs-param-op">
                    {picLoop.op.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="scada-dcs-bars">
                <div className="scada-dcs-bar-wrapper">
                  <div className="scada-dcs-bar-container">
                    <div 
                      className="scada-dcs-bar-fill scada-dcs-bar-fill-pv"
                      style={{ height: `${Math.min(100, (picLoop.pv / 60) * 100)}%` }}
                    />
                  </div>
                  <div className="scada-dcs-bar-label">PV</div>
                </div>
                <div className="scada-dcs-bar-wrapper">
                  <div className="scada-dcs-bar-container">
                    <div 
                      className="scada-dcs-bar-fill scada-dcs-bar-fill-op"
                      style={{ height: `${picLoop.op}%` }}
                    />
                  </div>
                  <div className="scada-dcs-bar-label">OP</div>
                </div>
              </div>

              {/* 参数调节控制 */}
              <div className="scada-dcs-controls">
                <div className="scada-control-row">
                  <span className="scada-control-label">设定值:</span>
                  <div className="scada-control-input-group">
                    <button 
                      className="scada-control-btn"
                      onClick={() => {
                        const newSP = Math.max(30, picLoop.sp - 0.5);
                        setLoopSetpoint(picLoop.id, newSP);
                      }}
                      title="减小设定值"
                    >
                      <Minus size={14} />
                    </button>
                    <input 
                      className="scada-control-input"
                      type="number"
                      step="0.1"
                      value={picLoop.sp.toFixed(2)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val) && val >= 30 && val <= 60) {
                          setLoopSetpoint(picLoop.id, val);
                        }
                      }}
                      aria-label="压力设定值"
                    />
                    <button 
                      className="scada-control-btn"
                      onClick={() => {
                        const newSP = Math.min(60, picLoop.sp + 0.5);
                        setLoopSetpoint(picLoop.id, newSP);
                      }}
                      title="增大设定值"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="scada-control-unit">MPa</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 设备控制面板 */}
        <div className="scada-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <Zap className="scada-panel-icon" />
              设备控制
            </div>
          </div>
          <div className="scada-panel-body">
            {equipment.map(eq => (
              <div key={eq.id} style={{ 
                padding: '10px', 
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                    {eq.id} {eq.name}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'rgb(74, 222, 128)'
                  }}>
                    <div style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      background: 'rgb(74, 222, 128)' 
                    }} />
                    运行中
                  </div>
                </div>
                <div className="scada-equipment-controls">
                  <button 
                    className="scada-btn scada-btn-success" 
                    onClick={() => {
                      controlEquipment(eq.id, 'start');
                      console.log(`✅ ${eq.name} 启动成功`);
                    }}
                    disabled={eq.status === 'running'}
                    title="启动设备"
                  >
                    <PlayCircle size={12} />
                    启动
                  </button>
                  <button 
                    className="scada-btn scada-btn-warning" 
                    onClick={() => {
                      controlEquipment(eq.id, 'stop');
                      console.log(`⏸️ ${eq.name} 已停止`);
                    }}
                    disabled={eq.status === 'stopped'}
                    title="停止设备"
                  >
                    <StopCircle size={12} />
                    停止
                  </button>
                  <button 
                    className="scada-btn scada-btn-danger" 
                    onClick={() => {
                      if (window.confirm(`确认紧急停止 ${eq.name}？`)) {
                        controlEquipment(eq.id, 'stop');
                        console.log(`🚨 ${eq.name} 紧急停止`);
                      }
                    }}
                    title="紧急停止"
                  >
                    <Power size={12} />
                    急停
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 储罐监控 */}
        <div className="scada-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <Factory className="scada-panel-icon" />
              储罐状态
            </div>
          </div>
          <div className="scada-panel-body">
            {tanks.map(tank => (
              <div key={tank.id} style={{ 
                padding: '10px',
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  fontSize: '12px'
                }}>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{tank.id}</span>
                  <span style={{ color: '#94a3b8' }}>{tank.product}</span>
                </div>
                <div style={{ 
                  height: '6px',
                  background: 'rgba(71, 85, 105, 0.5)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '6px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${tank.level}%`,
                    background: tank.status === 'warning' 
                      ? 'linear-gradient(to right, rgb(253, 224, 71), rgb(251, 191, 36))'
                      : 'linear-gradient(to right, rgb(34, 211, 238), rgb(6, 182, 212))',
                    transition: 'width 0.5s'
                  }} />
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  <span>{tank.level.toFixed(1)}%</span>
                  <span>{Math.round(tank.capacity * tank.level / 100)} / {tank.capacity} t</span>
                </div>
                {tank.status === 'warning' && (
                  <div style={{ 
                    marginTop: '6px',
                    padding: '4px 8px',
                    background: 'rgba(253, 224, 71, 0.15)',
                    border: '1px solid rgba(253, 224, 71, 0.3)',
                    borderRadius: '3px',
                    fontSize: '10px',
                    color: 'rgb(253, 224, 71)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <AlertTriangle size={12} />
                    接近上限
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 报警列表 */}
        <div className="scada-panel">
          <div className="scada-panel-header">
            <div className="scada-panel-title">
              <AlertCircle className="scada-panel-icon" />
              实时报警
            </div>
            <div className="scada-panel-badge">{alarms.length}</div>
          </div>
          <div className="scada-panel-body">
            {alarms.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                color: '#94a3b8',
                fontSize: '12px'
              }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <div>无活动报警</div>
              </div>
            ) : (
              alarms.map((alarm, idx) => (
                <div key={idx} className="scada-alarm-card">
                  <div className="scada-alarm-header">
                    <div className="scada-alarm-info">
                      <AlertTriangle size={14} />
                      <span style={{ fontWeight: 600 }}>{alarm.tag}</span>
                      <span style={{ 
                        padding: '2px 6px',
                        background: 'rgba(248, 113, 113, 0.2)',
                        borderRadius: '3px',
                        fontSize: '9px',
                        textTransform: 'uppercase'
                      }}>
                        {alarm.severity}
                      </span>
                    </div>
                    <div className="scada-alarm-actions">
                      <button 
                        className="scada-btn-icon"
                        onClick={() => {
                          console.log(`✅ 报警 ${alarm.tag} 已确认`);
                          // 实际应用中会调用: acknowledgeAlarm(alarm.id)
                        }}
                        title="确认报警"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        className="scada-btn-icon"
                        onClick={() => {
                          console.log(`🔇 报警 ${alarm.tag} 已静音`);
                          // 实际应用中会调用: silenceAlarm(alarm.id)
                        }}
                        title="静音报警"
                      >
                        <Bell size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="scada-alarm-message">
                    {alarm.description}
                  </div>
                  <div className="scada-alarm-footer">
                    <span>{alarm.timestamp.toLocaleTimeString('zh-CN')}</span>
                    {alarm.value && alarm.limit && (
                      <span>当前: {alarm.value} | 限值: {alarm.limit}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* 底部状态和趋势面板 */}
      <footer className="scada-footer">
        {/* 操作按钮栏 - 参考北京齿轮工厂 */}
        <div className="scada-footer-actions">
          <button 
            className="scada-action-btn scada-action-btn-primary"
            onClick={() => {
              onInspection(true);
              console.log('🚶 启动车间巡检模式');
            }}
            title="启动3D巡检模式，自动游览工厂关键区域"
          >
            <Eye className="action-icon" />
            <span>车间巡检</span>
          </button>
          
          <button 
            className="scada-action-btn"
            onClick={() => {
              setShowTrends(!showTrends);
              console.log('📊 查看历史数据');
            }}
            title="查看历史运行数据和趋势分析"
          >
            <Clock className="action-icon" />
            <span>历史回顾</span>
          </button>
          
          <button 
            className="scada-action-btn"
            onClick={() => {
              setShowExport(!showExport);
              console.log('📄 生成数据报表');
            }}
            title="导出当前监控数据报表（PDF/Excel）"
          >
            <FileText className="action-icon" />
            <span>数据报表</span>
          </button>

          
          <button 
            className="scada-action-btn"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                console.log('🖥️ 进入全屏模式');
              } else {
                document.exitFullscreen();
                console.log('🖥️ 退出全屏模式');
              }
            }}
            title="切换全屏显示"
          >
            <Maximize2 className="action-icon" />
            <span>全屏模式</span>
          </button>
        </div>

        {/* 温度趋势 */}
        <div className="scada-trend-panel">
          <div className="scada-trend-header">
            <div className="scada-trend-title">🌡️ 温度趋势</div>
            <div className="scada-trend-value">{ticLoop?.pv.toFixed(1)}°C</div>
          </div>
          <div className="scada-trend-chart">
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i}
                className="scada-trend-bar"
                style={{ 
                  height: `${30 + Math.random() * 70}%`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* 压力趋势 */}
        <div className="scada-trend-panel">
          <div className="scada-trend-header">
            <div className="scada-trend-title">📊 压力趋势</div>
            <div className="scada-trend-value">{picLoop?.pv.toFixed(2)} MPa</div>
          </div>
          <div className="scada-trend-chart">
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i}
                className="scada-trend-bar"
                style={{ 
                  height: `${40 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* 流量趋势 */}
        <div className="scada-trend-panel">
          <div className="scada-trend-header">
            <div className="scada-trend-title">💧 流量趋势</div>
            <div className="scada-trend-value">{ficLoop ? `${ficLoop.pv.toFixed(1)} t/h` : '--'}</div>
          </div>
          <div className="scada-trend-chart">
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i}
                className="scada-trend-bar"
                style={{ 
                  height: `${50 + Math.random() * 50}%`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* 操作日志 */}
        <div className="scada-trend-panel">
          <div className="scada-trend-header">
            <div className="scada-trend-title">
              <FileText size={16} style={{ marginRight: '6px' }} />
              操作日志
            </div>
          </div>
          <div style={{ 
            height: '80px',
            overflowY: 'auto',
            fontSize: '11px',
            color: '#94a3b8'
          }}>
            <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>
              {formatTime(currentTime)} 系统正常运行
            </div>
            <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>
              08:05 操作员 调整TIC-101设定值
            </div>
            <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>
              08:00 操作员 系统登录
            </div>
            <div style={{ padding: '4px 0' }}>
              07:45 系统 自检完成
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardOverlaySCADA;
