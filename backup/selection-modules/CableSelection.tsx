import React, { useRef, useState, useEffect } from 'react';
import { Button, Space, message } from 'antd';
import {
  ArrowLeftOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const CableSelection: React.FC = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = () => {
        setLoading(false);
        console.log('YJV电缆选型系统加载完成');
      };

      iframe.onerror = () => {
        setLoading(false);
        message.error('电缆选型系统加载失败，请刷新重试');
      };
    }
  }, []);

  const handleFullscreen = () => {
    if (iframeRef.current && iframeRef.current.requestFullscreen) {
      iframeRef.current.requestFullscreen();
    } else {
      message.warning('当前浏览器不支持全屏功能');
    }
  };

  const handleReload = () => {
    if (iframeRef.current) {
      setLoading(true);
      // 重新加载iframe内容
      iframeRef.current.contentWindow?.location.reload();
      message.info('正在重新加载...');
    }
  };

  const showInstructions = () => {
    message.info({
      content: (
        <div>
          <p>
            <strong>使用说明：</strong>
          </p>
          <p>1. 查看YJV电缆完整规格表</p>
          <p>2. 使用搜索框快速查找型号</p>
          <p>3. 对比不同规格的载流量</p>
          <p>4. 支持按芯数、规格筛选</p>
        </div>
      ),
      duration: 5,
    });
  };

  return (
    <div
      style={{
        height: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f7fa',
      }}
    >
      <div
        style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Space size="middle">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/selection')}
            type="default"
          >
            返回选型工具
          </Button>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#52c41a',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ThunderboltOutlined />
            YJV电缆选型系统
          </div>
        </Space>

        <Space size="middle">
          <Button icon={<InfoCircleOutlined />} onClick={showInstructions}>
            使用说明
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReload}>
            刷新
          </Button>
          <Button
            icon={<FullscreenOutlined />}
            onClick={handleFullscreen}
            type="primary"
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            全屏显示
          </Button>
        </Space>
      </div>

      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="loading-spinner"
            style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #52c41a',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <div style={{ color: '#666' }}>正在加载电缆选型系统...</div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src="/selection-tools/cable-selector-table.html"
        style={{
          flex: 1,
          border: 'none',
          width: '100%',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s',
        }}
        title="YJV电缆选型系统"
      />
    </div>
  );
};

export default CableSelection;
