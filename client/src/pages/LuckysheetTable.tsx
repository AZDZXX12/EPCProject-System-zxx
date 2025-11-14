import React, { useRef, useState, useEffect } from 'react';
import { message } from 'antd';

const LuckysheetTable: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = () => {
        setLoading(false);
        console.log('Luckysheet表格系统加载完成');
      };

      iframe.onerror = () => {
        setLoading(false);
        message.error('表格系统加载失败，请刷新重试');
      };
    }
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 1000,
            fontSize: '14px',
            color: '#999',
          }}
        >
          加载中...
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/selection-tools/index.html"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          display: 'block',
        }}
        title="设备选型系统"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          message.error('设备选型系统加载失败');
        }}
      />
    </div>
  );
};

export default LuckysheetTable;
