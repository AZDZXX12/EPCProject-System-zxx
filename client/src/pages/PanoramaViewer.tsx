import React, { useState, useEffect } from 'react';
import { Card, Spin } from 'antd';
import './PanoramaViewer.css';

const PanoramaViewer: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // iframe loading handler
    const handleLoad = () => {
      setLoading(false);
    };

    const iframe = document.getElementById('pano-frame') as HTMLIFrameElement;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
      }
    };
  }, []);

  // Add timestamp to force reload and bypass cache (only once on mount)
  const [timestamp] = useState(new Date().getTime());

  return (
    <div className="panorama-viewer-container" style={{ position: 'relative', width: '100%', height: '100%', padding: 0, overflow: 'hidden' }}>
      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f0f2f5',
          zIndex: 10
        }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#1890ff' }}>正在加载全景图编辑器...</div>
        </div>
      )}
      <iframe
        key="pano-frame"
        id="pano-frame"
        src={`/pano-viewer/index.html?v=${timestamp}`}
        title="Panoramic Viewer"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        allowFullScreen
      />
    </div>
  );
};

export default PanoramaViewer;
