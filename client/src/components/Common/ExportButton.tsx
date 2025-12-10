/**
 * 统一导出按钮组件
 * 支持导出为Excel、PDF、CSV等格式
 */
import React, { useState } from 'react';
import { Button, Dropdown, Menu, message } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, FileTextOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  data: any[];
  filename?: string;
  columns?: Array<{
    title: string;
    dataIndex: string;
    key: string;
  }>;
  type?: 'button' | 'icon';
  size?: 'small' | 'middle' | 'large';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename = 'export',
  columns,
  type = 'button',
  size = 'middle'
}) => {
  const [loading, setLoading] = useState(false);

  // 导出为Excel
  const exportToExcel = () => {
    try {
      setLoading(true);

      // 准备数据
      let exportData = data;
      if (columns && columns.length > 0) {
        exportData = data.map(item => {
          const row: any = {};
          columns.forEach(col => {
            row[col.title] = item[col.dataIndex];
          });
          return row;
        });
      }

      // 创建工作表
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      // 下载文件
      XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 导出为CSV
  const exportToCSV = () => {
    try {
      setLoading(true);

      // 准备数据
      let exportData = data;
      if (columns && columns.length > 0) {
        exportData = data.map(item => {
          const row: any = {};
          columns.forEach(col => {
            row[col.title] = item[col.dataIndex];
          });
          return row;
        });
      }

      // 创建CSV内容
      const ws = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(ws);

      // 下载文件
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${Date.now()}.csv`;
      link.click();

      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 导出为JSON
  const exportToJSON = () => {
    try {
      setLoading(true);

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${Date.now()}.json`;
      link.click();

      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const menu = (
    <Menu
      items={[
        {
          key: 'excel',
          label: 'Excel格式',
          icon: <FileExcelOutlined />,
          onClick: exportToExcel
        },
        {
          key: 'csv',
          label: 'CSV格式',
          icon: <FileTextOutlined />,
          onClick: exportToCSV
        },
        {
          key: 'json',
          label: 'JSON格式',
          icon: <FileTextOutlined />,
          onClick: exportToJSON
        }
      ]}
    />
  );

  if (type === 'icon') {
    return (
      <Dropdown overlay={menu} placement="bottomRight">
        <Button
          icon={<DownloadOutlined />}
          size={size}
          loading={loading}
          disabled={!data || data.length === 0}
        />
      </Dropdown>
    );
  }

  return (
    <Dropdown overlay={menu} placement="bottomRight">
      <Button
        icon={<DownloadOutlined />}
        size={size}
        loading={loading}
        disabled={!data || data.length === 0}
      >
        导出
      </Button>
    </Dropdown>
  );
};

export default ExportButton;
