/**
 * 数据导入导出
 */

import React, { useState } from 'react';
import { Modal, Upload, Button, Select, Space, Progress, message } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const DataImportExport: React.FC = () => {
  const [importVisible, setImportVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [progress, setProgress] = useState(0);

  const handleImport = () => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          message.success('导入成功');
          setImportVisible(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleExport = (format: string) => {
    message.success(`导出${format}成功`);
    setExportVisible(false);
  };

  return (
    <>
      <Space>
        <Button icon={<UploadOutlined />} onClick={() => setImportVisible(true)}>
          导入数据
        </Button>
        <Button icon={<DownloadOutlined />} onClick={() => setExportVisible(true)}>
          导出数据
        </Button>
      </Space>

      <Modal title="导入数据" open={importVisible} onCancel={() => setImportVisible(false)} onOk={handleImport}>
        <Upload
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          accept=".xlsx,.xls,.csv"
        >
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
        {progress > 0 && <Progress percent={progress} style={{ marginTop: 16 }} />}
      </Modal>

      <Modal
        title="导出数据"
        open={exportVisible}
        onCancel={() => setExportVisible(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button block onClick={() => handleExport('Excel')}>
            导出为Excel
          </Button>
          <Button block onClick={() => handleExport('CSV')}>
            导出为CSV
          </Button>
          <Button block onClick={() => handleExport('JSON')}>
            导出为JSON
          </Button>
          <Button block onClick={() => handleExport('PDF')}>
            导出为PDF
          </Button>
        </Space>
      </Modal>
    </>
  );
};

export default DataImportExport;
