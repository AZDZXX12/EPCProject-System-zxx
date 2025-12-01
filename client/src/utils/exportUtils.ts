/**
 * 数据导出工具集 - 支持多种格式导出
 * 
 * 功能：
 * - Excel导出（.xlsx）
 * - CSV导出
 * - PDF导出
 * - JSON导出
 * - 图片导出
 * - 批量导出
 * - 自定义模板
 */

import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { logger } from './EnhancedLogger';

// 浏览器下载工具，替代 file-saver 以避免类型解析问题
const downloadBlob = (filename: string, blob: Blob) => {
  // 兼容性处理（旧版Edge）
  // @ts-ignore
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    // @ts-ignore
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export interface ExportColumn {
  title: string;
  dataIndex: string;
  width?: number;
  render?: (value: any, record: any) => any;
}

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  columns?: ExportColumn[];
  data: any[];
  format?: 'xlsx' | 'csv' | 'json' | 'pdf';
  includeHeader?: boolean;
  dateFormat?: string;
}

/**
 * 导出为Excel
 */
export const exportToExcel = (options: ExportOptions): void => {
  const {
    filename = 'export',
    sheetName = 'Sheet1',
    columns,
    data,
    includeHeader = true,
  } = options;

  try {
    // 准备数据
    const exportData = prepareData(data, columns);

    // 创建工作簿
    const ws = XLSX.utils.json_to_sheet(exportData, {
      header: columns?.map((col) => col.dataIndex),
      skipHeader: !includeHeader,
    });

    // 设置列宽
    if (columns) {
      const colWidths = columns.map((col) => ({
        wch: col.width || 15,
      }));
      ws['!cols'] = colWidths;
    }

    // 设置表头样式
    if (includeHeader && columns) {
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!ws[address]) continue;
        ws[address].v = columns[C]?.title || ws[address].v;
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 导出文件
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    logger.error('Excel export error:', error);
    throw new Error('导出Excel失败');
  }
};

/**
 * 导出为CSV
 */
export const exportToCSV = (options: ExportOptions): void => {
  const {
    filename = 'export',
    columns,
    data,
    includeHeader = true,
  } = options;

  try {
    const exportData = prepareData(data, columns);

    // 创建CSV内容
    let csvContent = '';

    // 添加表头
    if (includeHeader && columns) {
      csvContent += columns.map((col) => `"${col.title}"`).join(',') + '\n';
    }

    // 添加数据行
    exportData.forEach((row) => {
      const values = columns
        ? columns.map((col) => {
            const value = row[col.dataIndex];
            return `"${value !== null && value !== undefined ? value : ''}"`;
          })
        : Object.values(row).map((v) => `"${v}"`);
      csvContent += values.join(',') + '\n';
    });

    // 创建Blob并下载
    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    downloadBlob(`${filename}.csv`, blob);
  } catch (error) {
    logger.error('CSV export error:', error);
    throw new Error('导出CSV失败');
  }
};

/**
 * 导出为JSON
 */
export const exportToJSON = (options: ExportOptions): void => {
  const { filename = 'export', columns, data } = options;

  try {
    const exportData = prepareData(data, columns);
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(`${filename}.json`, blob);
  } catch (error) {
    logger.error('JSON export error:', error);
    throw new Error('导出JSON失败');
  }
};

/**
 * 导出为PDF
 */
export const exportToPDF = async (
  elementId: string,
  filename: string = 'export'
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('未找到要导出的元素');
    }

    // 使用html2canvas截图
    const canvas = await html2canvas(
      element,
      {
        scale: 2,
        useCORS: true,
        logging: false,
      } as any
    );

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
    });

    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    logger.error('PDF export error:', error);
    throw new Error('导出PDF失败');
  }
};

/**
 * 导出为图片
 */
export const exportToImage = async (
  elementId: string,
  filename: string = 'export',
  format: 'png' | 'jpeg' = 'png'
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('未找到要导出的元素');
    }

    const canvas = await html2canvas(
      element,
      {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      } as any
    );

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(`${filename}.${format}`, blob);
      }
    }, `image/${format}`);
  } catch (error) {
    logger.error('Image export error:', error);
    throw new Error('导出图片失败');
  }
};

/**
 * 批量导出多个表格
 */
export const exportMultipleSheets = (
  sheets: Array<{
    sheetName: string;
    columns: ExportColumn[];
    data: any[];
  }>,
  filename: string = 'export'
): void => {
  try {
    const wb = XLSX.utils.book_new();

    sheets.forEach(({ sheetName, columns, data }) => {
      const exportData = prepareData(data, columns);
      const ws = XLSX.utils.json_to_sheet(exportData, {
        header: columns.map((col) => col.dataIndex),
      });

      // 设置表头
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!ws[address]) continue;
        ws[address].v = columns[C]?.title || ws[address].v;
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    logger.error('Multiple sheets export error:', error);
    throw new Error('批量导出失败');
  }
};

/**
 * 导出带样式的Excel
 */
export const exportStyledExcel = (options: ExportOptions & {
  headerStyle?: any;
  dataStyle?: any;
}): void => {
  const {
    filename = 'export',
    sheetName = 'Sheet1',
    columns,
    data,
    headerStyle,
    dataStyle,
  } = options;

  try {
    const exportData = prepareData(data, columns);
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 设置样式（需要xlsx-style库）
    // 这里提供基础实现，完整样式需要额外库支持
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    logger.error('Styled Excel export error:', error);
    throw new Error('导出样式化Excel失败');
  }
};

/**
 * 准备导出数据
 */
const prepareData = (data: any[], columns?: ExportColumn[]): any[] => {
  if (!columns) {
    return data;
  }

  return data.map((record) => {
    const row: any = {};
    columns.forEach((col) => {
      const value = getNestedValue(record, col.dataIndex);
      row[col.dataIndex] = col.render
        ? col.render(value, record)
        : value;
    });
    return row;
  });
};

/**
 * 获取嵌套对象的值
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * 格式化日期
 */
export const formatDate = (
  date: Date | string,
  format: string = 'YYYY-MM-DD'
): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 通用导出函数
 */
export const exportData = (options: ExportOptions): void => {
  const format = options.format || 'xlsx';

  switch (format) {
    case 'xlsx':
      exportToExcel(options);
      break;
    case 'csv':
      exportToCSV(options);
      break;
    case 'json':
      exportToJSON(options);
      break;
    default:
      exportToExcel(options);
  }
};

/**
 * 使用示例：
 * 
 * // 1. 导出Excel
 * exportToExcel({
 *   filename: '项目列表',
 *   sheetName: 'Projects',
 *   columns: [
 *     { title: '项目名称', dataIndex: 'name', width: 20 },
 *     { title: '状态', dataIndex: 'status', width: 10 },
 *     { title: '进度', dataIndex: 'progress', width: 10, render: (v) => `${v}%` },
 *   ],
 *   data: projects,
 * });
 * 
 * // 2. 导出CSV
 * exportToCSV({
 *   filename: '任务列表',
 *   columns: taskColumns,
 *   data: tasks,
 * });
 * 
 * // 3. 导出PDF
 * await exportToPDF('gantt-chart', '甘特图');
 * 
 * // 4. 批量导出
 * exportMultipleSheets([
 *   { sheetName: '项目', columns: projectColumns, data: projects },
 *   { sheetName: '任务', columns: taskColumns, data: tasks },
 *   { sheetName: '设备', columns: equipmentColumns, data: equipments },
 * ], '完整报告');
 */
