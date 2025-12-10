/**
 * 工艺流程图组件（P&ID）
 * 可视化显示化工工艺流程，支持实时数据叠加和交互控制
 */

import React, { useState } from 'react';
import { useDCS } from '../../contexts/DCSContext';
import { Play, Square, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './ProcessFlowDiagram.css';

export const ProcessFlowDiagram: React.FC = () => {
  const { processData, controlEquipment, setLoopSetpoint } = useDCS();
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [editingSP, setEditingSP] = useState<{ loopId: string; value: string } | null>(null);

  // 获取设备状态颜色
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running': return '#10b981';
      case 'stopped': return '#6b7280';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // 获取阀门位置
  const getValvePosition = (equipmentId: string): number => {
    const equipment = processData.equipment.find(eq => eq.id === equipmentId);
    return equipment?.position || 0;
  };

  // 获取控制回路数据
  const getLoopData = (loopId: string) => {
    return processData.controlLoops.find(loop => loop.id === loopId);
  };

  // 处理设备控制
  const handleControl = (equipmentId: string, command: 'start' | 'stop') => {
    controlEquipment(equipmentId, command);
  };

  // 处理设定值修改
  const handleSPChange = (loopId: string) => {
    if (editingSP && editingSP.loopId === loopId) {
      const newValue = parseFloat(editingSP.value);
      if (!isNaN(newValue)) {
        setLoopSetpoint(loopId, newValue);
      }
      setEditingSP(null);
    }
  };

  const ticLoop = getLoopData('TIC-101');
  const picLoop = getLoopData('PIC-203');
  const ficLoop = getLoopData('FIC-301');
  const lic101 = getLoopData('LIC-101');
  const lic201 = getLoopData('LIC-201');

  const furnace = processData.equipment.find(eq => eq.id === 'F-101');
  const pump = processData.equipment.find(eq => eq.id === 'P-101A');
  const compressor = processData.equipment.find(eq => eq.id === 'C-201A');
  const tk101 = processData.equipment.find(eq => eq.id === 'TK-101');
  const tk201 = processData.equipment.find(eq => eq.id === 'TK-201');

  return (
    <div className="process-flow-diagram">
      <div className="pfd-header">
        <h3>工艺流程图 P&ID</h3>
        <div className="pfd-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#10b981' }} />
            <span>运行</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#f59e0b' }} />
            <span>报警</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#ef4444' }} />
            <span>故障</span>
          </div>
        </div>
      </div>

      <svg className="pfd-canvas" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* 管道箭头 */}
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#06b6d4" />
          </marker>
          {/* 流体渐变 */}
          <linearGradient id="fluidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0.3 }} />
            <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.3 }} />
          </linearGradient>
        </defs>

        {/* 背景网格 */}
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="0.5"/>
        </pattern>
        <rect width="1200" height="600" fill="url(#grid)" />

        {/* 进料段 */}
        <g id="feed-section">
          {/* 原料罐 TK-101 */}
          <g transform="translate(100, 250)">
            <rect x="-40" y="-80" width="80" height="160" fill="none" stroke={getStatusColor(tk101?.status || 'stopped')} strokeWidth="3" rx="5" />
            <rect x="-35" y={-80 + (160 * (1 - (lic101?.pv || 0) / 100))} width="70" height={160 * ((lic101?.pv || 0) / 100)} 
                  fill="url(#fluidGradient)" opacity="0.6" />
            <text x="0" y="-100" textAnchor="middle" fill="#22d3ee" fontSize="14" fontWeight="bold">TK-101</text>
            <text x="0" y="-85" textAnchor="middle" fill="#06b6d4" fontSize="11">粗汽油</text>
            <text x="0" y="0" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
              {lic101?.pv.toFixed(1)}%
            </text>
          </g>

          {/* 进料泵 P-101A */}
          <g transform="translate(250, 250)">
            <circle cx="0" cy="0" r="35" fill="none" stroke={getStatusColor(pump?.status || 'stopped')} strokeWidth="3" />
            <path d="M -15,-15 L 15,0 L -15,15 Z" fill={getStatusColor(pump?.status || 'stopped')} />
            <text x="0" y="-50" textAnchor="middle" fill="#22d3ee" fontSize="14" fontWeight="bold">P-101A</text>
            {pump?.status === 'running' && (
              <g>
                <circle cx="0" cy="0" r="40" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.5">
                  <animate attributeName="r" from="35" to="45" dur="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </g>

          {/* 进料管道 */}
          <line x1="180" y1="250" x2="215" y2="250" stroke="#06b6d4" strokeWidth="4" markerEnd="url(#arrow)" />
          {ficLoop && (
            <g transform="translate(195, 220)">
              <rect x="-30" y="-25" width="60" height="50" fill="rgba(0,0,0,0.8)" stroke="#06b6d4" strokeWidth="1" rx="3" />
              <text x="0" y="-10" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="bold">{ficLoop.tag}</text>
              <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12">{ficLoop.pv.toFixed(1)}</text>
              <text x="0" y="18" textAnchor="middle" fill="#06b6d4" fontSize="9">{ficLoop.unit}</text>
            </g>
          )}

          {/* 调节阀 V-101 */}
          <g transform="translate(350, 250)">
            <path d="M -20,-30 L 0,0 L -20,30 Z" fill={getStatusColor('running')} stroke="#06b6d4" strokeWidth="2" />
            <path d="M 0,0 L 20,-30 L 20,30 Z" fill={getStatusColor('running')} stroke="#06b6d4" strokeWidth="2" />
            <text x="0" y="-45" textAnchor="middle" fill="#22d3ee" fontSize="12">V-101</text>
            <text x="0" y="50" textAnchor="middle" fill="white" fontSize="11">{getValvePosition('V-101').toFixed(0)}%</text>
          </g>

          <line x1="285" y1="250" x2="330" y2="250" stroke="#06b6d4" strokeWidth="4" markerEnd="url(#arrow)" />
          <line x1="370" y1="250" x2="450" y2="250" stroke="#06b6d4" strokeWidth="4" markerEnd="url(#arrow)" />
        </g>

        {/* 裂解炉段 */}
        <g id="furnace-section">
          <g transform="translate(550, 250)">
            {/* 裂解炉 F-101 */}
            <rect x="-60" y="-100" width="120" height="200" fill="none" stroke={getStatusColor(furnace?.status || 'stopped')} 
                  strokeWidth="4" rx="8" />
            <rect x="-55" y="-95" width="110" height="190" fill="rgba(239,68,68,0.1)" rx="5" />
            
            {/* 火焰效果 */}
            {furnace?.status === 'running' && (
              <>
                <ellipse cx="0" cy="50" rx="40" ry="60" fill="rgba(251,146,60,0.3)">
                  <animate attributeName="ry" values="60;70;60" dur="2s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="0" cy="40" rx="30" ry="50" fill="rgba(252,211,77,0.4)">
                  <animate attributeName="ry" values="50;60;50" dur="1.5s" repeatCount="indefinite" />
                </ellipse>
              </>
            )}
            
            <text x="0" y="-115" textAnchor="middle" fill="#22d3ee" fontSize="16" fontWeight="bold">F-101</text>
            <text x="0" y="-98" textAnchor="middle" fill="#06b6d4" fontSize="12">裂解炉</text>
            
            {ticLoop && (
              <g transform="translate(0, 0)">
                <text x="0" y="-30" textAnchor="middle" fill="#22d3ee" fontSize="11">{ticLoop.tag}</text>
                <text x="0" y="-10" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                  {ticLoop.pv.toFixed(1)}
                </text>
                <text x="0" y="10" textAnchor="middle" fill="#06b6d4" fontSize="11">{ticLoop.unit}</text>
                <text x="0" y="30" textAnchor="middle" fill={ticLoop.alarm.current ? '#ef4444' : '#10b981'} fontSize="10">
                  SP: {ticLoop.sp.toFixed(0)}°C
                </text>
              </g>
            )}
          </g>

          <line x1="450" y1="250" x2="490" y2="250" stroke="#06b6d4" strokeWidth="4" markerEnd="url(#arrow)" />
          <line x1="610" y1="250" x2="700" y2="250" stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrow)" />
        </g>

        {/* 压缩段 */}
        <g id="compression-section">
          <g transform="translate(800, 250)">
            {/* 压缩机 C-201A */}
            <rect x="-50" y="-50" width="100" height="100" fill="none" stroke={getStatusColor(compressor?.status || 'stopped')} 
                  strokeWidth="3" rx="10" />
            <circle cx="0" cy="0" r="35" fill="none" stroke={getStatusColor(compressor?.status || 'stopped')} strokeWidth="2" />
            
            {compressor?.status === 'running' && (
              <>
                <path d="M -20,-20 L 20,20 M -20,20 L 20,-20" stroke={getStatusColor('running')} strokeWidth="3">
                  <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" 
                                    dur="2s" repeatCount="indefinite" />
                </path>
              </>
            )}
            
            <text x="0" y="-65" textAnchor="middle" fill="#22d3ee" fontSize="14" fontWeight="bold">C-201A</text>
            <text x="0" y="70" textAnchor="middle" fill="white" fontSize="11">{compressor?.speed} RPM</text>
          </g>

          {picLoop && (
            <g transform="translate(900, 220)">
              <rect x="-30" y="-25" width="60" height="50" fill="rgba(0,0,0,0.8)" stroke="#06b6d4" strokeWidth="1" rx="3" />
              <text x="0" y="-10" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="bold">{picLoop.tag}</text>
              <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12">{picLoop.pv.toFixed(2)}</text>
              <text x="0" y="18" textAnchor="middle" fill="#06b6d4" fontSize="9">{picLoop.unit}</text>
            </g>
          )}

          <line x1="700" y1="250" x2="750" y2="250" stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrow)" />
          <line x1="850" y1="250" x2="950" y2="250" stroke="#06b6d4" strokeWidth="4" markerEnd="url(#arrow)" />
        </g>

        {/* 储罐段 */}
        <g id="storage-section">
          {/* 乙烯储罐 TK-201 */}
          <g transform="translate(1050, 250)">
            <rect x="-40" y="-80" width="80" height="160" fill="none" stroke={getStatusColor(tk201?.status || 'stopped')} 
                  strokeWidth="3" rx="5" />
            <rect x="-35" y={-80 + (160 * (1 - (lic201?.pv || 0) / 100))} width="70" height={160 * ((lic201?.pv || 0) / 100)} 
                  fill="url(#fluidGradient)" opacity="0.6" />
            
            {lic201?.alarm.current && (
              <g>
                <circle cx="50" cy="-90" r="8" fill="#ef4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                </circle>
                <text x="50" y="-87" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">!</text>
              </g>
            )}
            
            <text x="0" y="-100" textAnchor="middle" fill="#22d3ee" fontSize="14" fontWeight="bold">TK-201</text>
            <text x="0" y="-85" textAnchor="middle" fill="#06b6d4" fontSize="11">乙烯</text>
            <text x="0" y="0" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
              {lic201?.pv.toFixed(1)}%
            </text>
            <text x="0" y="90" textAnchor="middle" fill="#06b6d4" fontSize="10">
              {tk201?.temperature?.toFixed(1)}°C
            </text>
          </g>

          <line x1="950" y1="250" x2="1010" y2="250" stroke="#06b6d4" strokeWidth="4" markerEnd="url(#arrow)" />
        </g>

        {/* 底部流程标注 */}
        <g transform="translate(600, 550)">
          <text x="0" y="0" textAnchor="middle" fill="#06b6d4" fontSize="12" fontFamily="monospace">
            乙烯裂解生产流程 | Ethylene Cracking Process
          </text>
        </g>
      </svg>

      {/* 设备快速控制面板 */}
      <div className="pfd-controls">
        <div className="pfd-control-group">
          <div className="pfd-control-label">设备控制</div>
          <div className="pfd-control-buttons">
            {[pump, compressor, furnace].filter(Boolean).map(eq => (
              <div key={eq!.id} className="pfd-equipment-control">
                <span className="pfd-eq-name">{eq!.name}</span>
                <div className="pfd-eq-buttons">
                  <button 
                    className={`pfd-btn ${eq!.status === 'running' ? 'active' : ''}`}
                    onClick={() => handleControl(eq!.id, 'start')}
                    disabled={eq!.status === 'running'}
                  >
                    <Play size={14} /> 启动
                  </button>
                  <button 
                    className={`pfd-btn ${eq!.status === 'stopped' ? 'active' : ''}`}
                    onClick={() => handleControl(eq!.id, 'stop')}
                    disabled={eq!.status === 'stopped'}
                  >
                    <Square size={14} /> 停止
                  </button>
                </div>
                <span className={`pfd-status pfd-status-${eq!.status}`}>
                  {eq!.status === 'running' ? '运行中' : '已停止'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
