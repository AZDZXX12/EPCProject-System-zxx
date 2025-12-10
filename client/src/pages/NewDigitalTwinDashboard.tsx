/**
 * 数字孪生3D查看器 - 化工生产线监控系统
 * 整合了3D模型查看、实时监控、设备控制等功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { message } from 'antd';
import Scene from '../components/DigitalTwin3D/Scene';
import DashboardOverlaySCADA from '../components/DigitalTwin3D/DashboardOverlaySCADA';
import Controls from '../components/DigitalTwin3D/Controls';
import { DCSDebugPanel } from '../components/DigitalTwin3D/DCSDebugPanel';
import { ViewerSettings, UploadedFile, ViewMode, ModelStats } from '../components/DigitalTwin3D/types';
import { DCSProvider } from '../contexts/DCSContext';
import './NewDigitalTwinDashboard.css';

const NewDigitalTwinDashboard: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('monitor');
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  
  const [settings, setSettings] = useState<ViewerSettings>({
    autoRotate: true,
    shadows: true,
    contactShadow: true,
    intensity: 1.5,
    preset: 'city',
    envRotation: 0,
    grid: true,
    axes: false,
    backgroundColor: '#000000',
    wireframe: false,
    showStats: false,
    scale: 1,
    materialConfig: { 
      color: '#ffffff', 
      metalness: 0.8, 
      roughness: 0.2, 
      opacity: 1, 
      blending: 'normal', 
      transparent: false 
    },
    showEnvBackground: false
  });

  const loadFile = (fileObj: File) => {
    if (fileObj) {
      if (file) URL.revokeObjectURL(file.url);
      setFile({ 
        name: fileObj.name, 
        url: URL.createObjectURL(fileObj), 
        size: fileObj.size 
      });
      setModelStats(null);
      message.success(`模型 "${fileObj.name}" 加载成功`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) loadFile(selectedFile);
  };

  const handleClearModel = () => {
    if (file) {
      URL.revokeObjectURL(file.url);
      setFile(null);
      setModelStats(null);
      message.info('模型已清除');
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(true); 
  }, []);
  
  const onDragLeave = useCallback((e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(false); 
  }, []);
  
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.glb') || droppedFile.name.endsWith('.gltf'))) {
      loadFile(droppedFile);
    } else {
      message.error('请上传 .glb 或 .gltf 格式的3D模型文件');
    }
  }, [file]);

  // 添加对象处理
  const handleAddObject = useCallback((type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus') => {
    message.success(`添加${type === 'box' ? '立方体' : type === 'sphere' ? '球体' : '圆柱'}成功！`);
    console.log('添加对象:', type);
    // 这里将来会调用Scene中的ModelEditor
  }, []);

  // 变换模式切换
  const handleTransformModeChange = useCallback((mode: 'translate' | 'rotate' | 'scale') => {
    setTransformMode(mode);
    const modeNames = { translate: '移动', rotate: '旋转', scale: '缩放' };
    message.info(`切换到${modeNames[mode]}模式`);
  }, []);

  return (
    <DCSProvider>
      <div 
        className="digital-twin-3d-viewer"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="twin-scene-container">
          <Scene 
            fileUrl={file?.url || null} 
            settings={settings} 
            onStatsUpdate={setModelStats}
            viewMode={viewMode}
            isInspecting={isInspecting}
          />
        </div>

        <div className="twin-overlay-container">
          {viewMode === 'monitor' ? (
            <DashboardOverlaySCADA 
              onSwitchMode={setViewMode} 
              onInspection={setIsInspecting}
              file={file} 
              modelStats={modelStats} 
            />
          ) : (
            <Controls 
              settings={settings} 
              setSettings={setSettings}
              onUpload={handleFileUpload}
              fileName={file?.name || null}
              onClear={handleClearModel}
              onSwitchMode={setViewMode}
              onAddObject={handleAddObject}
              onTransformModeChange={handleTransformModeChange}
            />
          )}
        </div>

        {/* DCS调试面板 - 显示实时数据（开发模式） */}
        {process.env.NODE_ENV === 'development' && <DCSDebugPanel />}

        {/* 拖拽上传提示：只在 Editor 模式显示 */}
        {viewMode === 'editor' && (!file || isDragging) && (
          <div className={`drag-hint ${isDragging ? 'drag-hint-hidden' : ''}`}>
             <div className="drag-hint-content">
                <Upload className="drag-hint-icon" />
                拖拽模型文件至此 或 点击左侧导入
             </div>
          </div>
        )}

        {isDragging && (
          <div className="drag-overlay">
              <div className="drag-overlay-border" />
              <div className="drag-overlay-content">
                <Upload className="drag-overlay-icon" />
                <span className="drag-overlay-text">释放导入模型</span>
              </div>
          </div>
        )}
      </div>
    </DCSProvider>
  );
};

export default NewDigitalTwinDashboard;
