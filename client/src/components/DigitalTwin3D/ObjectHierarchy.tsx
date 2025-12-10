/**
 * 对象层级面板 - 类似Blender的Outliner
 * 显示场景中所有对象的树形结构
 */

import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2, Box, Circle, Cylinder as CylinderIcon } from 'lucide-react';
import { SceneObject } from './ModelEditor';

interface ObjectHierarchyProps {
  objects: SceneObject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ObjectHierarchy: React.FC<ObjectHierarchyProps> = ({
  objects,
  selectedId,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDuplicate,
  onDelete
}) => {
  const getIcon = (type: string, name: string) => {
    if (name.includes('Sphere')) return <Circle size={14} />;
    if (name.includes('Cylinder') || name.includes('Cone')) return <CylinderIcon size={14} />;
    return <Box size={14} />;
  };

  return (
    <div className="object-hierarchy">
      <div className="hierarchy-header">
        <span className="hierarchy-title">场景对象</span>
        <span className="object-count">{objects.length}</span>
      </div>

      <div className="hierarchy-list">
        {objects.length === 0 ? (
          <div className="hierarchy-empty">
            <Box size={32} opacity={0.3} />
            <p>场景中暂无对象</p>
            <p className="hint">点击"添加"按钮创建对象</p>
          </div>
        ) : (
          objects.map(obj => (
            <div
              key={obj.id}
              className={`hierarchy-item ${selectedId === obj.id ? 'selected' : ''} ${obj.locked ? 'locked' : ''}`}
              onClick={() => !obj.locked && onSelect(obj.id)}
            >
              <div className="item-icon">
                {getIcon(obj.type, obj.name)}
              </div>
              
              <div className="item-name">{obj.name}</div>

              <div className="item-actions">
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(obj.id);
                  }}
                  title={obj.visible ? '隐藏' : '显示'}
                >
                  {obj.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(obj.id);
                  }}
                  title={obj.locked ? '解锁' : '锁定'}
                >
                  {obj.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>

                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(obj.id);
                  }}
                  title="复制"
                >
                  <Copy size={14} />
                </button>

                <button
                  className="action-btn danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(obj.id);
                  }}
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ObjectHierarchy;
