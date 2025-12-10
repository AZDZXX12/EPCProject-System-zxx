import React, { useState, useRef } from 'react';
import { Upload, Button, message, Progress, Modal, Image } from 'antd';
import {
  UploadOutlined,
  InboxOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import './FileUpload.css';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // MB
  maxCount?: number;
  multiple?: boolean;
  listType?: 'text' | 'picture' | 'picture-card';
  disabled?: boolean;
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>; // 返回文件URL列表
  onPreview?: (file: UploadFile) => void;
  onRemove?: (file: UploadFile) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*',
  maxSize = 10,
  maxCount = 10,
  multiple = true,
  listType = 'picture-card',
  disabled = false,
  value = [],
  onChange,
  onUpload,
  onPreview,
  onRemove,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(value);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // 获取文件图标
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return <FileImageOutlined style={{ fontSize: 48, color: '#1890ff' }} />;
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: 48, color: '#f5222d' }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ fontSize: 48, color: '#1890ff' }} />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined style={{ fontSize: 48, color: '#52c41a' }} />;
      default:
        return <FileTextOutlined style={{ fontSize: 48, color: '#8c8c8c' }} />;
    }
  };

  // 验证文件
  const validateFile = (file: File): boolean => {
    // 检查文件大小
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`文件大小不能超过 ${maxSize}MB!`);
      return false;
    }

    // 检查文件类型
    if (accept !== '*') {
      const acceptTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      const isAccepted = acceptTypes.some(type => {
        if (type.includes('*')) {
          // 处理 image/* 这种格式
          const mainType = type.split('/')[0];
          return fileType.startsWith(mainType);
        }
        return type === fileType || type === fileExt;
      });

      if (!isAccepted) {
        message.error(`不支持的文件类型！支持的类型：${accept}`);
        return false;
      }
    }

    return true;
  };

  // 自定义上传
  const customUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    const uploadFile = file as File;

    try {
      // 模拟上传进度
      let progress = 0;
      const timer = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
          onProgress?.({ percent: progress });
        }
      }, 200);

      // 调用上传接口
      let fileUrls: string[] = [];
      if (onUpload) {
        fileUrls = await onUpload([uploadFile]);
      } else {
        // 默认使用本地存储（开发环境）
        const reader = new FileReader();
        reader.readAsDataURL(uploadFile);
        await new Promise((resolve) => {
          reader.onload = () => {
            fileUrls = [reader.result as string];
            resolve(null);
          };
        });
      }

      clearInterval(timer);
      onProgress?.({ percent: 100 });
      onSuccess?.(fileUrls[0]);

      message.success(`${uploadFile.name} 上传成功`);
    } catch (error) {
      console.error('上传失败:', error);
      onError?.(error as Error);
      message.error(`${uploadFile.name} 上传失败`);
    }
  };

  // 文件列表变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    onChange?.(newFileList);
  };

  // 预览文件
  const handlePreview = async (file: UploadFile) => {
    if (onPreview) {
      onPreview(file);
      return;
    }

    // 默认预览逻辑
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }

    setPreviewImage(file.url || file.preview || '');
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    setPreviewVisible(true);
  };

  // 移除文件
  const handleRemove = (file: UploadFile) => {
    if (onRemove) {
      onRemove(file);
    }
    return true;
  };

  // 转换为Base64
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 上传按钮
  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>上传文件</div>
    </div>
  );

  return (
    <div className="file-upload-container">
      <Upload
        accept={accept}
        multiple={multiple}
        listType={listType}
        fileList={fileList}
        disabled={disabled}
        customRequest={customUpload}
        beforeUpload={validateFile}
        onChange={handleChange}
        onPreview={handlePreview}
        onRemove={handleRemove}
        maxCount={maxCount}
        className="file-upload"
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>

      {/* 图片预览 */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <Image
          alt="preview"
          style={{ width: '100%' }}
          src={previewImage}
          preview={false}
        />
      </Modal>

      {/* 上传提示 */}
      <div className="upload-tips">
        <p>支持格式：{accept === '*' ? '所有格式' : accept}</p>
        <p>文件大小：最大 {maxSize}MB</p>
        <p>文件数量：最多 {maxCount} 个</p>
      </div>
    </div>
  );
};

export default FileUpload;
