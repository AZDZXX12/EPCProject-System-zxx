/**
 * 批量操作工具
 * 提供批量数据处理、导入导出等功能
 */

import { message } from 'antd';
import * as XLSX from 'xlsx';
import { logger } from './EnhancedLogger';

/**
 * Excel导入导出
 */
export class ExcelHandler {
  /**
   * 读取Excel文件
   */
  static async readExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          logger.info('[Excel导入] 成功读取', { rows: jsonData.length });
          resolve(jsonData);
        } catch (error) {
          logger.error('[Excel导入] 读取失败', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsBinaryString(file);
    });
  }

  /**
   * 导出为Excel
   */
  static exportToExcel(data: any[], filename: string = 'export.xlsx') {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      
      // 设置列宽
      const maxWidth = 20;
      const cols = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
      worksheet['!cols'] = cols;
      
      XLSX.writeFile(workbook, filename);
      logger.info('[Excel导出] 成功导出', { filename, rows: data.length });
      message.success(`成功导出 ${data.length} 条数据`);
    } catch (error) {
      logger.error('[Excel导出] 导出失败', error);
      message.error('导出失败');
    }
  }

  /**
   * 下载模板
   */
  static downloadTemplate(type: 'tasks' | 'resources' | 'costs' | 'materials') {
    const templates: Record<string, any[]> = {
      tasks: [
        {
          '任务名称': '示例任务',
          '开始日期': '2025-01-01',
          '结束日期': '2025-01-10',
          '负责人': '张三',
          '优先级': '高',
          '进度(%)': 0,
          '备注': '',
        },
      ],
      resources: [
        {
          '姓名': '张三',
          '角色': '工程师',
          '技能': 'React,Node.js',
          '可用性(%)': 100,
          '日薪(元)': 500,
        },
      ],
      costs: [
        {
          '项目': '项目A',
          '类别': '人工',
          '金额(元)': 50000,
          '日期': '2025-01-01',
          '备注': '',
        },
      ],
      materials: [
        {
          '材料名称': '螺纹钢',
          '规格': 'HRB400 Φ12',
          '单位': '吨',
          '数量': 100,
          '单价(元)': 4500,
          '供应商': '某钢铁公司',
        },
      ],
    };

    this.exportToExcel(templates[type], `${type}_template.xlsx`);
  }
}

/**
 * 数据验证
 */
export class DataValidator {
  /**
   * 验证必填字段
   */
  static validateRequired(data: any[], requiredFields: string[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      requiredFields.forEach((field) => {
        if (!row[field] || row[field] === '') {
          errors.push(`第 ${index + 1} 行缺少必填字段: ${field}`);
        }
      });
    });
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证日期格式
   */
  static validateDates(data: any[], dateFields: string[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    data.forEach((row, index) => {
      dateFields.forEach((field) => {
        if (row[field] && !dateRegex.test(row[field])) {
          errors.push(`第 ${index + 1} 行日期格式错误: ${field} (应为 YYYY-MM-DD)`);
        }
      });
    });
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证数字范围
   */
  static validateNumberRange(
    data: any[],
    field: string,
    min: number,
    max: number
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      const value = Number(row[field]);
      if (isNaN(value) || value < min || value > max) {
        errors.push(
          `第 ${index + 1} 行 ${field} 超出范围 (${min}-${max}): ${row[field]}`
        );
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * 批量操作
 */
export class BatchOperations {
  /**
   * 批量创建
   */
  static async batchCreate<T>(
    items: T[],
    createFn: (item: T) => Promise<any>,
    options: {
      batchSize?: number;
      onProgress?: (current: number, total: number) => void;
    } = {}
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    const { batchSize = 10, onProgress } = options;
    const results = { success: 0, failed: 0, errors: [] as any[] };
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const promises = batch.map(async (item) => {
        try {
          await createFn(item);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({ item, error });
          logger.error('[批量创建] 失败', { item, error });
        }
      });
      
      await Promise.all(promises);
      
      if (onProgress) {
        onProgress(Math.min(i + batchSize, items.length), items.length);
      }
    }
    
    logger.info('[批量创建] 完成', results);
    return results;
  }

  /**
   * 批量更新
   */
  static async batchUpdate<T>(
    items: T[],
    updateFn: (item: T) => Promise<any>,
    options: {
      batchSize?: number;
      onProgress?: (current: number, total: number) => void;
    } = {}
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    return this.batchCreate(items, updateFn, options);
  }

  /**
   * 批量删除
   */
  static async batchDelete(
    ids: string[],
    deleteFn: (id: string) => Promise<any>,
    options: {
      batchSize?: number;
      onProgress?: (current: number, total: number) => void;
    } = {}
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    return this.batchCreate(ids, deleteFn, options);
  }
}

/**
 * 数据转换
 */
export class DataTransformer {
  /**
   * CSV转JSON
   */
  static csvToJson(csv: string): any[] {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map((line) => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim();
      });
      return obj;
    });
  }

  /**
   * JSON转CSV
   */
  static jsonToCsv(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * 下载CSV
   */
  static downloadCsv(data: any[], filename: string = 'export.csv') {
    const csv = this.jsonToCsv(data);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    
    logger.info('[CSV导出] 成功', { filename, rows: data.length });
    message.success(`成功导出 ${data.length} 条数据`);
  }
}

/**
 * 数据压缩
 */
export class DataCompressor {
  /**
   * 压缩数据
   */
  static compress(data: any): string {
    try {
      const json = JSON.stringify(data);
      return btoa(encodeURIComponent(json));
    } catch (error) {
      logger.error('[数据压缩] 失败', error);
      throw error;
    }
  }

  /**
   * 解压数据
   */
  static decompress(compressed: string): any {
    try {
      const json = decodeURIComponent(atob(compressed));
      return JSON.parse(json);
    } catch (error) {
      logger.error('[数据解压] 失败', error);
      throw error;
    }
  }
}

export default {
  ExcelHandler,
  DataValidator,
  BatchOperations,
  DataTransformer,
  DataCompressor,
};
