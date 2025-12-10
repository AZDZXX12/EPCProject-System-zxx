/**
 * Blender风格编辑器页面
 * 独立的3D编辑器界面
 */

import React from 'react';
import BlenderLikeEditor from '../components/DigitalTwin3D/BlenderLikeEditor';
import './BlenderEditorPage.css';

const BlenderEditorPage: React.FC = () => {
  return (
    <div className="blender-editor-page">
      <BlenderLikeEditor />
    </div>
  );
};

export default BlenderEditorPage;
