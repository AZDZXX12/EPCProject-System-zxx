# 🔧 SCADA界面交互功能修复方案
## SCADA Interactive Features Fix Plan

**修复时间**: 2025年12月2日 08:35  
**问题**: 3D场景不显示、面板缺少交互功能、实用工具跳转页面  
**状态**: 🚧 修复中

---

## 🐛 发现的问题

### 1. 3D场景显示问题 ✅ 已修复
```
❌ 问题：中间区域是黑色，看不到3D模型
✅ 原因：SCADA Grid布局覆盖了3D场景
✅ 解决：调整z-index和pointer-events

修复代码：
.scada-main {
  background: transparent;  /* 改为透明 */
  pointer-events: none;      /* 禁用指针事件 */
  z-index: 1;
}

.twin-scene-container {
  z-index: 0;
  pointer-events: auto;      /* 允许3D交互 */
}
```

### 2. 实用工具跳转问题
```
❌ 问题：点击"编辑器"后跳转到独立页面
✅ 解决：所有功能在当前页面内操作

需要修改：
- 编辑器按钮：切换到editor模式，不跳转
- 巡检按钮：启动巡检动画，不跳转
- 全屏按钮：当前页面全屏
- 导出按钮：下载当前模型
```

### 3. 数据面板缺少交互
```
❌ 问题：所有面板只显示数据，不能操作
✅ 需要添加：
- DCS控制回路：参数调节功能
- 设备控制：启动/停止按钮实际功能
- 储罐监控：液位调节功能
- 报警列表：确认/关闭按钮
```

---

## 🔧 需要添加的交互功能

### 1. DCS控制回路 - 参数调节

#### TIC-101 温度控制
```tsx
<div className="scada-dcs-loop">
  {/* 现有的PV/SP/OP显示 */}
  
  {/* 新增：参数调节区域 */}
  <div className="scada-dcs-controls">
    <div className="scada-control-row">
      <label>设定值 (SP):</label>
      <div className="scada-control-input">
        <button onClick={() => adjustSetpoint(ticLoop.id, -1)}>
          <Minus size={14} />
        </button>
        <input 
          type="number"
          value={ticLoop.sp}
          onChange={(e) => handleSetpointChange(ticLoop.id, Number(e.target.value))}
        />
        <button onClick={() => adjustSetpoint(ticLoop.id, +1)}>
          <Plus size={14} />
        </button>
      </div>
      <span>°C</span>
    </div>

    <div className="scada-control-row">
      <label>控制模式:</label>
      <div className="scada-mode-switch">
        <button 
          className={loop.mode === 'auto' ? 'active' : ''}
          onClick={() => switchMode(ticLoop.id, 'auto')}
        >
          AUTO
        </button>
        <button 
          className={loop.mode === 'manual' ? 'active' : ''}
          onClick={() => switchMode(ticLoop.id, 'manual')}
        >
          MANUAL
        </button>
      </div>
    </div>

    {loop.mode === 'manual' && (
      <div className="scada-control-row">
        <label>手动输出 (OP):</label>
        <input 
          type="range"
          min="0"
          max="100"
          value={ticLoop.op}
          onChange={(e) => setManualOutput(ticLoop.id, Number(e.target.value))}
        />
        <span>{ticLoop.op.toFixed(1)}%</span>
      </div>
    )}

    <button 
      className="scada-btn scada-btn-primary"
      onClick={() => applyChanges(ticLoop.id)}
    >
      <Check size={14} />
      应用修改
    </button>
  </div>
</div>
```

#### 功能实现
```tsx
// 调整设定值
const adjustSetpoint = (loopId: string, delta: number) => {
  const loop = processData.controlLoops.find(l => l.id === loopId);
  if (!loop) return;
  
  const newSP = loop.sp + delta;
  setLoopSetpoint(loopId, newSP);
};

// 处理输入变化
const handleSetpointChange = (loopId: string, value: number) => {
  setEditingSetpoint({ loopId, value });
};

// 应用修改
const applyChanges = (loopId: string) => {
  if (!editingSetpoint) return;
  setLoopSetpoint(loopId, editingSetpoint.value);
  setEditingSetpoint(null);
};

// 切换控制模式
const switchMode = (loopId: string, mode: 'auto' | 'manual') => {
  // 调用DCS服务切换模式
  console.log(`切换 ${loopId} 到 ${mode} 模式`);
};

// 设置手动输出
const setManualOutput = (loopId: string, op: number) => {
  // 调用DCS服务设置输出
  console.log(`设置 ${loopId} 输出为 ${op}%`);
};
```

---

### 2. 设备控制 - 实际功能

```tsx
<div className="scada-panel">
  <div className="scada-panel-header">
    <div className="scada-panel-title">
      <Zap className="scada-panel-icon" />
      设备控制
    </div>
  </div>
  <div className="scada-panel-body">
    {equipment.map(eq => (
      <div key={eq.id} className="scada-equipment-card">
        <div className="scada-equipment-header">
          <div>
            <div className="scada-equipment-name">{eq.id} {eq.name}</div>
            <div className="scada-equipment-status">
              <div className={`status-dot status-${eq.status}`} />
              {eq.status === 'running' ? '运行中' : 
               eq.status === 'stopped' ? '已停止' : '故障'}
            </div>
          </div>
          <div className="scada-equipment-params">
            <div>功率: {eq.power || 0} kW</div>
            <div>温度: {eq.temp || 0}°C</div>
          </div>
        </div>

        <div className="scada-equipment-controls">
          <button 
            className="scada-btn scada-btn-success"
            onClick={() => handleEquipmentControl(eq.id, 'start')}
            disabled={eq.status === 'running'}
          >
            <PlayCircle size={14} />
            启动
          </button>
          
          <button 
            className="scada-btn scada-btn-warning"
            onClick={() => handleEquipmentControl(eq.id, 'stop')}
            disabled={eq.status === 'stopped'}
          >
            <StopCircle size={14} />
            停止
          </button>
          
          <button 
            className="scada-btn scada-btn-danger"
            onClick={() => handleEquipmentEmergencyStop(eq.id)}
          >
            <Power size={14} />
            急停
          </button>
        </div>

        {/* 进度条 */}
        <div className="scada-equipment-progress">
          <div className="progress-label">负荷率</div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${eq.load || 0}%` }}
            />
          </div>
          <div className="progress-value">{eq.load || 0}%</div>
        </div>
      </div>
    ))}
  </div>
</div>
```

#### 功能实现
```tsx
// 设备控制
const handleEquipmentControl = (equipmentId: string, action: 'start' | 'stop') => {
  controlEquipment(equipmentId, action);
  
  // 显示确认消息
  if (action === 'start') {
    console.log(`✅ 设备 ${equipmentId} 启动成功`);
  } else {
    console.log(`⏸️ 设备 ${equipmentId} 已停止`);
  }
};

// 紧急停止
const handleEquipmentEmergencyStop = (equipmentId: string) => {
  // 弹出确认对话框
  if (window.confirm(`确认紧急停止设备 ${equipmentId}？`)) {
    controlEquipment(equipmentId, 'emergency-stop');
    console.log(`🚨 设备 ${equipmentId} 紧急停止`);
  }
};
```

---

### 3. 储罐监控 - 液位调节

```tsx
<div className="scada-panel">
  <div className="scada-panel-header">
    <div className="scada-panel-title">
      <Factory className="scada-panel-icon" />
      储罐状态
    </div>
  </div>
  <div className="scada-panel-body">
    {tanks.map(tank => (
      <div key={tank.id} className="scada-tank-card">
        <div className="scada-tank-header">
          <span>{tank.id}</span>
          <span>{tank.product}</span>
        </div>

        {/* 液位进度条（可拖动） */}
        <div className="scada-tank-level">
          <div className="level-bar-container">
            <div 
              className={`level-bar level-${tank.status}`}
              style={{ height: `${tank.level}%` }}
            />
            <div 
              className="level-indicator"
              style={{ bottom: `${tank.level}%` }}
              draggable
              onDrag={(e) => handleLevelAdjust(tank.id, e)}
            />
          </div>
          
          <div className="level-marks">
            <div className="mark">100%</div>
            <div className="mark">75%</div>
            <div className="mark">50%</div>
            <div className="mark">25%</div>
            <div className="mark">0%</div>
          </div>
        </div>

        <div className="scada-tank-info">
          <div>当前: {tank.level.toFixed(1)}%</div>
          <div>容量: {tank.capacity} t</div>
          <div>存量: {Math.round(tank.capacity * tank.level / 100)} t</div>
        </div>

        {/* 液位调节按钮 */}
        <div className="scada-tank-controls">
          <button 
            className="scada-btn"
            onClick={() => adjustTankLevel(tank.id, -5)}
          >
            <ArrowDown size={14} />
            排放
          </button>
          
          <button 
            className="scada-btn"
            onClick={() => adjustTankLevel(tank.id, +5)}
          >
            <ArrowUp size={14} />
            注入
          </button>

          <button 
            className="scada-btn scada-btn-primary"
            onClick={() => setTankTarget(tank.id, 70)}
          >
            <Target size={14} />
            目标70%
          </button>
        </div>

        {/* 报警提示 */}
        {tank.status === 'warning' && (
          <div className="scada-tank-alert">
            <AlertTriangle size={14} />
            液位接近上限
          </div>
        )}
      </div>
    ))}
  </div>
</div>
```

---

### 4. 报警列表 - 确认功能

```tsx
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
      <div className="scada-empty-state">
        <CheckCircle size={32} />
        <div>无活动报警</div>
      </div>
    ) : (
      alarms.map((alarm, idx) => (
        <div key={idx} className="scada-alarm-card">
          <div className="scada-alarm-header">
            <div className="scada-alarm-info">
              <AlertTriangle size={14} />
              <span className="alarm-tag">{alarm.tag}</span>
              <span className="alarm-severity">{alarm.severity}</span>
            </div>
            <div className="scada-alarm-actions">
              <button 
                className="scada-btn-icon"
                onClick={() => acknowledgeAlarm(alarm.id)}
                title="确认报警"
              >
                <Check size={14} />
              </button>
              <button 
                className="scada-btn-icon"
                onClick={() => silenceAlarm(alarm.id)}
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
```

#### 功能实现
```tsx
// 确认报警
const acknowledgeAlarm = (alarmId: string) => {
  console.log(`✅ 报警 ${alarmId} 已确认`);
  // 调用DCS服务确认报警
};

// 静音报警
const silenceAlarm = (alarmId: string) => {
  console.log(`🔇 报警 ${alarmId} 已静音`);
  // 调用DCS服务静音报警
};
```

---

### 5. 实用工具 - 在页面内操作

```tsx
{/* 实用工具模块 */}
<div className="scada-panel">
  <div className="scada-panel-header">
    <div className="scada-panel-title">
      <Box className="scada-panel-icon" />
      实用工具
    </div>
  </div>
  <div className="scada-panel-body">
    {/* 模型上传 */}
    <button 
      className="scada-btn scada-btn-primary"
      onClick={handleFileUpload}
    >
      <Upload className="scada-btn-icon" />
      上传3D模型
    </button>

    {/* 快捷功能 */}
    <div className="scada-tools-grid">
      {/* 编辑器 - 在当前页面切换 */}
      <button 
        className="scada-tool-btn"
        onClick={() => onSwitchMode('editor')}
      >
        <Grid3x3 size={20} />
        <span>编辑器</span>
      </button>
      
      {/* 巡检 - 启动动画 */}
      <button 
        className="scada-tool-btn"
        onClick={() => onInspection(true)}
      >
        <Eye size={20} />
        <span>巡检</span>
      </button>

      {/* 全屏 - 实现功能 */}
      <button 
        className="scada-tool-btn"
        onClick={handleFullscreen}
      >
        <Maximize2 size={20} />
        <span>全屏</span>
      </button>

      {/* 导出 - 实现功能 */}
      <button 
        className="scada-tool-btn"
        onClick={handleExport}
      >
        <Download size={20} />
        <span>导出</span>
      </button>
    </div>

    {/* 模型统计和文件信息保持不变 */}
  </div>
</div>
```

#### 功能实现
```tsx
// 文件上传（已有onFileUpload prop）
const handleFileUpload = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.glb,.gltf';
  input.onchange = (e: any) => {
    const file = e.target?.files?.[0];
    if (file) {
      // 触发父组件的上传逻辑
      console.log('上传文件:', file.name);
    }
  };
  input.click();
};

// 全屏功能
const handleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    setFullscreen(true);
  } else {
    document.exitFullscreen();
    setFullscreen(false);
  }
};

// 导出模型
const handleExport = () => {
  if (!file) {
    alert('没有加载的模型');
    return;
  }
  
  // 导出当前模型
  const link = document.createElement('a');
  link.href = file.url;
  link.download = file.name;
  link.click();
  
  console.log('导出模型:', file.name);
};
```

---

## 🎨 新增CSS样式

### 控制按钮样式
```css
/* 设备控制按钮 */
.scada-btn-success {
  background: rgba(74, 222, 128, 0.15);
  border-color: rgba(74, 222, 128, 0.5);
  color: rgb(74, 222, 128);
}

.scada-btn-success:hover {
  background: rgba(74, 222, 128, 0.25);
}

.scada-btn-warning {
  background: rgba(253, 224, 71, 0.15);
  border-color: rgba(253, 224, 71, 0.5);
  color: rgb(253, 224, 71);
}

.scada-btn-danger {
  background: rgba(248, 113, 113, 0.15);
  border-color: rgba(248, 113, 113, 0.5);
  color: rgb(248, 113, 113);
}

/* 参数调节控制 */
.scada-dcs-controls {
  margin-top: 12px;
  padding: 12px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(71, 85, 105, 0.5);
}

.scada-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.scada-control-input {
  display: flex;
  align-items: center;
  gap: 4px;
}

.scada-control-input input {
  width: 80px;
  padding: 6px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 4px;
  color: rgb(34, 211, 238);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 700;
}

.scada-mode-switch {
  display: flex;
  gap: 4px;
}

.scada-mode-switch button {
  padding: 4px 12px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 3px;
  color: rgb(148, 163, 184);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.scada-mode-switch button.active {
  background: rgba(34, 211, 238, 0.2);
  border-color: rgba(34, 211, 238, 0.5);
  color: rgb(34, 211, 238);
}

/* 设备卡片 */
.scada-equipment-card {
  padding: 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 6px;
  margin-bottom: 8px;
}

.scada-equipment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.scada-equipment-controls {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.scada-equipment-controls button {
  flex: 1;
  padding: 6px;
  font-size: 11px;
}

.scada-equipment-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(71, 85, 105, 0.5);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, 
    rgba(74, 222, 128, 0.8), 
    rgba(34, 197, 94, 1));
  transition: width 0.5s;
}

/* 储罐卡片 */
.scada-tank-card {
  padding: 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 6px;
  margin-bottom: 8px;
}

.scada-tank-level {
  display: flex;
  gap: 10px;
  height: 100px;
  margin: 10px 0;
}

.level-bar-container {
  flex: 1;
  position: relative;
  background: rgba(71, 85, 105, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 4px;
}

.level-bar {
  position: absolute;
  bottom: 0;
  width: 100%;
  transition: height 0.5s;
}

.level-bar.level-normal {
  background: linear-gradient(to top, 
    rgba(34, 211, 238, 0.6), 
    rgba(6, 182, 212, 0.8));
}

.level-bar.level-warning {
  background: linear-gradient(to top, 
    rgba(253, 224, 71, 0.6), 
    rgba(251, 191, 36, 0.8));
}

.level-indicator {
  position: absolute;
  width: 100%;
  height: 3px;
  background: white;
  cursor: ns-resize;
}

/* 报警卡片 */
.scada-alarm-card {
  padding: 10px;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 4px;
  margin-bottom: 6px;
}

.scada-alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.scada-alarm-actions {
  display: flex;
  gap: 4px;
}

.scada-btn-icon {
  padding: 4px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 3px;
  color: rgb(148, 163, 184);
  cursor: pointer;
  transition: all 0.2s;
}

.scada-btn-icon:hover {
  background: rgba(51, 65, 85, 0.8);
  color: rgb(34, 211, 238);
}
```

---

## 🚀 实施步骤

### 1. 修复3D场景显示 ✅
- 已完成CSS修改
- 调整z-index层级
- 设置pointer-events

### 2. 添加DCS参数调节 🔄
- 添加状态管理
- 创建调节界面
- 实现调节逻辑

### 3. 实现设备控制 🔄
- 添加控制按钮
- 实现启动/停止/急停
- 显示设备状态

### 4. 完善储罐控制 🔄
- 液位调节功能
- 目标设定
- 排放/注入按钮

### 5. 报警确认功能 🔄
- 确认按钮
- 静音按钮
- 状态更新

### 6. 优化实用工具 🔄
- 在页面内操作
- 全屏功能
- 导出功能

---

## 📊 预期效果

### 交互性提升
| 功能 | 之前 | 现在 | 提升 |
|------|------|------|------|
| DCS控制 | 只读 | 可调节 | +100% |
| 设备控制 | 假按钮 | 真功能 | +100% |
| 储罐管理 | 只显示 | 可控制 | +100% |
| 报警处理 | 只看 | 可确认 | +100% |
| 实用工具 | 跳转 | 内操作 | 体验⬆️ |

---

**修复进度**: 1/6 完成  
**预计时间**: 30-40分钟  
**状态**: 🚧 继续修复中

---

> 💡 **注意**: 由于修改量较大，建议分批实施，每次实施后测试一个功能。

**END OF FIX PLAN**
