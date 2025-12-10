/**
 * 编辑器控制面板组件
 */

import React, { useState } from 'react';
import { ViewerSettings, EnvironmentPreset, ViewMode } from './types';
import { TransformMode } from './EditorControls';
import { 
  Settings2, Sun, Box, Move, Grid, RefreshCw, Upload, Trash2, 
  Activity, Hexagon, Palette, Maximize, Layers, Lightbulb, 
  Monitor, ChevronLeft, Ghost, Blend, Plus, RotateCw, Scaling, Circle
} from 'lucide-react';
import './DigitalTwin3D.css';

interface ControlsProps {
  settings: ViewerSettings;
  setSettings: React.Dispatch<React.SetStateAction<ViewerSettings>>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string | null;
  onClear: () => void;
  onSwitchMode: (mode: ViewMode) => void;
  onAddObject?: (type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus') => void;
  onTransformModeChange?: (mode: TransformMode) => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  settings, 
  setSettings, 
  onUpload, 
  fileName, 
  onClear, 
  onSwitchMode,
  onAddObject,
  onTransformModeChange
}) => {
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const presets: EnvironmentPreset[] = [
    'studio', 'royal_esplanade', 'venice_sunset', 'moonless_golf', 
    'peppermint_powerplant', 'forest_slope', 'brown_photostudio',
    'aerodynamics_workshop', 'city'
  ];
  
  const presetLabels: Record<EnvironmentPreset, string> = {
    studio: '专业摄影棚',
    royal_esplanade: '皇家广场',
    venice_sunset: '威尼斯日落',
    moonless_golf: '高尔夫夜景',
    peppermint_powerplant: '工业电厂',
    forest_slope: '森林坡地',
    brown_photostudio: '暖色摄影棚',
    aerodynamics_workshop: '工厂车间',
    city: '城市广场'
  };

  const handleUpdate = <K extends keyof ViewerSettings>(key: K, value: ViewerSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleMaterialUpdate = (key: keyof ViewerSettings['materialConfig'], value: any) => {
    setSettings(prev => ({
      ...prev,
      materialConfig: {
        ...prev.materialConfig,
        [key]: value
      }
    }));
  };

  // 添加对象处理
  const handleAddObject = (type: 'box' | 'sphere' | 'cylinder') => {
    if (onAddObject) {
      onAddObject(type);
    }
  };

  // 切换变换模式
  const handleTransformMode = (mode: TransformMode) => {
    setTransformMode(mode);
    if (onTransformModeChange) {
      onTransformModeChange(mode);
    }
  };

  return (
    <div className="controls-panel">
      <div className="controls-panel-bg" />
      <div className="controls-corner-tl" />
      <div className="controls-corner-br" />

      {/* Header */}
      <div className="controls-header">
        <div className="controls-header-content">
          <button onClick={() => onSwitchMode('monitor')} className="controls-back-btn" title="返回监控">
             <ChevronLeft className="icon-sm" />
          </button>
          <div className="controls-title-group">
            <Hexagon className="icon-sm" strokeWidth={2} />
            <h2 className="controls-title">资产配置</h2>
          </div>
        </div>
        <div className="controls-header-accent">
           <div className="accent-bar accent-bar-1" />
           <div className="accent-bar accent-bar-2" />
        </div>
      </div>

      <div className="controls-content">
        
        {/* 资产信息 */}
        <div className="control-section">
           {!fileName ? (
            <div className="upload-zone">
              <input
                type="file"
                accept=".glb,.gltf"
                onChange={onUpload}
                className="upload-input"
              />
              <div className="upload-content">
                <Upload className="upload-icon" />
                <p className="upload-text">导入模型资产</p>
                <p className="upload-hint">DRAG & DROP .GLB / .GLTF</p>
              </div>
            </div>
          ) : (
             <div className="asset-info">
                <div className="asset-info-content">
                   <span className="asset-label">CURRENT ASSET</span>
                   <span className="asset-name">{fileName}</span>
                </div>
                <button onClick={onClear} className="asset-clear-btn" title="移除">
                  <Trash2 className="icon-sm" />
                </button>
             </div>
          )}
        </div>

        {/* 显示控制 */}
        <div className="control-section">
          <div className="section-header">
            <Monitor className="icon-xs" />
            <h3 className="section-title">显示控制</h3>
          </div>
          <div className="control-grid">
            <div className="toggle-item" onClick={() => handleUpdate('autoRotate', !settings.autoRotate)}>
              <div className="toggle-label">
                <RefreshCw className="icon-xs" />
                <span>自动旋转</span>
              </div>
              <div className={`toggle-switch ${settings.autoRotate ? 'active' : ''}`}>
                <div className="toggle-slider" />
              </div>
            </div>
            
            <div className="toggle-item" onClick={() => handleUpdate('grid', !settings.grid)}>
              <div className="toggle-label">
                <Grid className="icon-xs" />
                <span>地面网格</span>
              </div>
              <div className={`toggle-switch ${settings.grid ? 'active' : ''}`}>
                <div className="toggle-slider" />
              </div>
            </div>
            
            <div className="toggle-item" onClick={() => handleUpdate('axes', !settings.axes)}>
              <div className="toggle-label">
                <Move className="icon-xs" />
                <span>坐标轴</span>
              </div>
              <div className={`toggle-switch ${settings.axes ? 'active' : ''}`}>
                <div className="toggle-slider" />
              </div>
            </div>
            
            <div className="toggle-item" onClick={() => handleUpdate('wireframe', !settings.wireframe)}>
              <div className="toggle-label">
                <Hexagon className="icon-xs" />
                <span>线框模式</span>
              </div>
              <div className={`toggle-switch ${settings.wireframe ? 'active' : ''}`}>
                <div className="toggle-slider" />
              </div>
            </div>
          </div>
        </div>

        {/* 3D编辑工具 */}
        <div className="control-section">
          <div className="section-header">
            <Box className="icon-xs" />
            <h3 className="section-title">3D编辑工具</h3>
          </div>
          
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <span className="toolbar-label">添加对象</span>
              <div className="toolbar-buttons">
                <button 
                  className="toolbar-btn" 
                  onClick={() => handleAddObject('box')}
                  title="添加立方体"
                >
                  <Box size={16} />
                  <span>立方体</span>
                </button>
                <button 
                  className="toolbar-btn" 
                  onClick={() => handleAddObject('sphere')}
                  title="添加球体"
                >
                  <Circle size={16} />
                  <span>球体</span>
                </button>
                <button 
                  className="toolbar-btn" 
                  onClick={() => handleAddObject('cylinder')}
                  title="添加圆柱"
                >
                  <Activity size={16} />
                  <span>圆柱</span>
                </button>
              </div>
            </div>

            <div className="toolbar-group">
              <span className="toolbar-label">变换模式</span>
              <div className="toolbar-buttons">
                <button 
                  className={`toolbar-btn ${transformMode === 'translate' ? 'active' : ''}`}
                  onClick={() => handleTransformMode('translate')}
                  title="移动 (G)"
                >
                  <Move size={16} />
                  <span>移动</span>
                </button>
                <button 
                  className={`toolbar-btn ${transformMode === 'rotate' ? 'active' : ''}`}
                  onClick={() => handleTransformMode('rotate')}
                  title="旋转 (R)"
                >
                  <RotateCw size={16} />
                  <span>旋转</span>
                </button>
                <button 
                  className={`toolbar-btn ${transformMode === 'scale' ? 'active' : ''}`}
                  onClick={() => handleTransformMode('scale')}
                  title="缩放 (S)"
                >
                  <Scaling size={16} />
                  <span>缩放</span>
                </button>
              </div>
            </div>

            <div className="toolbar-hint">
              <span>💡 提示：选中对象后可使用变换工具</span>
            </div>
          </div>
        </div>

        {/* 变换 & 材质 */}
        <div className="control-section">
           <div className="section-header">
             <Layers className="icon-xs" />
             <h3 className="section-title">变换 & 材质</h3>
           </div>
           
           <div className="slider-control">
              <div className="slider-header">
                <label className="slider-label">模型缩放 (Scale)</label>
                <span className="slider-value">{settings.scale.toFixed(1)}x</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="5" 
                step="0.1"
                value={settings.scale}
                onChange={(e) => handleUpdate('scale', parseFloat(e.target.value))}
                className="slider-input"
              />
           </div>
           
           <div className="divider" />
           
           <div className="color-control">
              <span className="color-label">
                <Palette className="icon-xs" /> 基础颜色
              </span>
              <div className="color-picker-wrapper">
                <input 
                  type="color" 
                  value={settings.materialConfig.color}
                  onChange={(e) => handleMaterialUpdate('color', e.target.value)}
                  className="color-input"
                />
                <div className="color-preview" style={{ backgroundColor: settings.materialConfig.color }} />
              </div>
           </div>
           
           <div className="slider-control">
              <div className="slider-header">
                <label className="slider-label">金属度 (Metalness)</label>
                <span className="slider-value">{settings.materialConfig.metalness.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={settings.materialConfig.metalness}
                onChange={(e) => handleMaterialUpdate('metalness', parseFloat(e.target.value))}
                className="slider-input"
              />
            </div>
            
            <div className="slider-control">
              <div className="slider-header">
                <label className="slider-label">粗糙度 (Roughness)</label>
                <span className="slider-value">{settings.materialConfig.roughness.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.04" 
                max="1" 
                step="0.05"
                value={settings.materialConfig.roughness}
                onChange={(e) => handleMaterialUpdate('roughness', parseFloat(e.target.value))}
                className="slider-input"
              />
            </div>
            
            <div className="divider" />
            
            <div className="slider-control">
              <div className="slider-header">
                <label className="slider-label">透明度 (Opacity)</label>
                <span className="slider-value">{settings.materialConfig.opacity.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={settings.materialConfig.opacity}
                onChange={(e) => handleMaterialUpdate('opacity', parseFloat(e.target.value))}
                className="slider-input"
              />
            </div>
            
            <div className="select-control">
               <span className="select-label">
                 <Blend className="icon-xs" /> 混合模式
               </span>
               <select 
                 value={settings.materialConfig.blending}
                 onChange={(e) => handleMaterialUpdate('blending', e.target.value)}
                 className="select-input"
               >
                 <option value="normal">Normal</option>
                 <option value="additive">Additive</option>
                 <option value="subtractive">Subtractive</option>
                 <option value="multiply">Multiply</option>
               </select>
            </div>
            
            <div className="toggle-item" onClick={() => handleMaterialUpdate('transparent', !settings.materialConfig.transparent)}>
              <div className="toggle-label">
                <Ghost className="icon-xs" />
                <span>开启透明</span>
              </div>
              <div className={`toggle-switch ${settings.materialConfig.transparent ? 'active' : ''}`}>
                <div className="toggle-slider" />
              </div>
            </div>
        </div>

        {/* 光照环境 */}
        <div className="control-section">
            <div className="section-header">
              <Lightbulb className="icon-xs" />
              <h3 className="section-title">光照环境</h3>
            </div>
            
            <label className="input-label">环境预设 (HDRI)</label>
            <select 
              value={settings.preset}
              onChange={(e) => handleUpdate('preset', e.target.value as EnvironmentPreset)}
              className="preset-select"
            >
              {presets.map(p => (
                <option key={p} value={p}>{presetLabels[p]}</option>
              ))}
            </select>

            <div className="slider-control">
              <div className="slider-header">
                <label className="slider-label">环境光强度</label>
                <span className="slider-value">{settings.intensity.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="0.1"
                value={settings.intensity}
                onChange={(e) => handleUpdate('intensity', parseFloat(e.target.value))}
                className="slider-input"
              />
            </div>
            
            <div className="slider-control">
              <div className="slider-header">
                <label className="slider-label">环境旋转</label>
                <span className="slider-value">{settings.envRotation}°</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="360" 
                step="1"
                value={settings.envRotation}
                onChange={(e) => handleUpdate('envRotation', parseFloat(e.target.value))}
                className="slider-input"
              />
            </div>
            
            <div className="toggle-item" onClick={() => handleUpdate('showEnvBackground', !settings.showEnvBackground)}>
              <div className="toggle-label">
                <Maximize className="icon-xs" />
                <span>显示环境背景</span>
              </div>
              <div className={`toggle-switch ${settings.showEnvBackground ? 'active' : ''}`}>
                <div className="toggle-slider" />
              </div>
            </div>
            
            <div className="shadow-controls">
               <button 
                 className={`shadow-btn ${settings.contactShadow ? 'active' : ''}`}
                 onClick={() => handleUpdate('contactShadow', !settings.contactShadow)}
               >
                 <Sun className="icon-xs" />
                 接触阴影
               </button>
               <button 
                 className={`shadow-btn ${settings.shadows ? 'active' : ''}`}
                 onClick={() => handleUpdate('shadows', !settings.shadows)}
               >
                 <Box className="icon-xs" />
                 投射阴影
               </button>
            </div>
        </div>
        
        {/* 系统信息 */}
        <div className="control-section">
           <div className="section-header">
             <Activity className="icon-xs" />
             <h3 className="section-title">系统信息</h3>
           </div>
           <div className="toggle-item" onClick={() => handleUpdate('showStats', !settings.showStats)}>
              <div className="toggle-label">
                <Activity className="icon-xs" />
                <span>性能监测</span>
              </div>
              <div className={`toggle-switch ${settings.showStats ? 'active' : ''}`}>
                <div className="toggle-slider" />
              </div>
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default Controls;
