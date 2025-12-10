/**
 * 照片处理工具
 * 提供照片压缩、水印、EXIF信息提取等功能
 */

import { message } from 'antd';
import { logger } from './EnhancedLogger';

/**
 * 照片压缩选项
 */
export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  mimeType?: string;
}

/**
 * 水印选项
 */
export interface WatermarkOptions {
  text: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  fontSize?: number;
  color?: string;
  opacity?: number;
}

/**
 * GPS坐标
 */
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp?: number;
}

/**
 * 照片工具类
 */
export class PhotoUtils {
  /**
   * 压缩图片
   */
  static async compressImage(
    file: File,
    options: CompressOptions = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      mimeType = 'image/jpeg',
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          
          // 计算缩放比例
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法获取canvas上下文'));
            return;
          }
          
          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height);
          
          // 转换为Blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const originalSize = file.size;
                const compressedSize = blob.size;
                const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
                
                logger.info('[照片压缩] 完成', {
                  original: `${(originalSize / 1024).toFixed(1)}KB`,
                  compressed: `${(compressedSize / 1024).toFixed(1)}KB`,
                  ratio: `${ratio}%`,
                });
                
                resolve(blob);
              } else {
                reject(new Error('压缩失败'));
              }
            },
            mimeType,
            quality
          );
        };
        
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 添加水印
   */
  static async addWatermark(
    blob: Blob,
    options: WatermarkOptions
  ): Promise<Blob> {
    const {
      text,
      position = 'bottom-right',
      fontSize = 16,
      color = '#ffffff',
      opacity = 0.7,
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法获取canvas上下文'));
            return;
          }
          
          // 绘制原图
          ctx.drawImage(img, 0, 0);
          
          // 设置水印样式
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = color;
          ctx.globalAlpha = opacity;
          
          // 计算水印位置
          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = fontSize;
          const padding = 10;
          
          let x = padding;
          let y = padding + textHeight;
          
          switch (position) {
            case 'top-right':
              x = canvas.width - textWidth - padding;
              y = padding + textHeight;
              break;
            case 'bottom-left':
              x = padding;
              y = canvas.height - padding;
              break;
            case 'bottom-right':
              x = canvas.width - textWidth - padding;
              y = canvas.height - padding;
              break;
            case 'center':
              x = (canvas.width - textWidth) / 2;
              y = canvas.height / 2;
              break;
          }
          
          // 绘制水印背景
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(x - 5, y - textHeight - 5, textWidth + 10, textHeight + 10);
          
          // 绘制水印文字
          ctx.fillStyle = color;
          ctx.fillText(text, x, y);
          
          // 转换为Blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                logger.info('[水印添加] 完成', { text, position });
                resolve(blob);
              } else {
                reject(new Error('添加水印失败'));
              }
            },
            'image/jpeg',
            0.9
          );
        };
        
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 获取GPS位置
   */
  static async getCurrentLocation(): Promise<GPSCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理定位'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GPSCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            timestamp: position.timestamp,
          };
          
          logger.info('[GPS定位] 成功', coords);
          resolve(coords);
        },
        (error) => {
          logger.error('[GPS定位] 失败', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * 处理照片（压缩+水印）
   */
  static async processPhoto(
    file: File,
    watermarkText?: string
  ): Promise<Blob> {
    try {
      // 压缩
      let blob = await this.compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
      });
      
      // 添加水印
      if (watermarkText) {
        blob = await this.addWatermark(blob, {
          text: watermarkText,
          position: 'bottom-right',
          fontSize: 14,
          color: '#ffffff',
          opacity: 0.8,
        });
      }
      
      return blob;
    } catch (error) {
      logger.error('[照片处理] 失败', error);
      throw error;
    }
  }

  /**
   * 批量处理照片
   */
  static async batchProcessPhotos(
    files: File[],
    watermarkText?: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob[]> {
    const results: Blob[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const blob = await this.processPhoto(files[i], watermarkText);
        results.push(blob);
        
        if (onProgress) {
          onProgress(i + 1, files.length);
        }
      } catch (error) {
        logger.error(`[批量处理] 第${i + 1}张失败`, error);
        message.error(`第${i + 1}张照片处理失败`);
      }
    }
    
    return results;
  }

  /**
   * 将Blob转换为File
   */
  static blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, {
      type: blob.type,
      lastModified: Date.now(),
    });
  }

  /**
   * 预览图片
   */
  static previewImage(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * 释放预览URL
   */
  static revokePreviewUrl(url: string) {
    URL.revokeObjectURL(url);
  }
}

export default PhotoUtils;
