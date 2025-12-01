/**
 * PLC通信服务
 * 提供PLC数据读取、写入和实时监控功能
 */

import type { PLCDataPoint, DeviceStatus, ControlCommand } from '../types/industrial';
import { logger } from '../utils/logger';

class PLCService {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  
  private dataListeners: Map<string, (data: PLCDataPoint) => void> = new Map();
  private statusListeners: Map<string, (status: DeviceStatus) => void> = new Map();
  private commandListeners: Map<string, (cmd: ControlCommand) => void> = new Map();

  /**
   * 连接到PLC WebSocket服务器
   */
  connect(url: string = 'ws://localhost:8080/plc'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          logger.info('[PLC] WebSocket连接成功');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          logger.error('[PLC] WebSocket错误:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          logger.info('[PLC] WebSocket连接关闭');
          this.attemptReconnect(url);
        };
      } catch (error) {
        logger.error('[PLC] 连接失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('[PLC] 重连次数超过限制');
      return;
    }

    this.reconnectAttempts++;
    logger.info(`[PLC] 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.reconnectTimer = setTimeout(() => {
      this.connect(url).catch(err => logger.error('[PLC] 重连失败:', err));
    }, this.reconnectDelay);
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'data':
          this.notifyDataListeners(message.payload);
          break;
        case 'status':
          this.notifyStatusListeners(message.payload);
          break;
        case 'command_ack':
          this.notifyCommandListeners(message.payload);
          break;
        default:
          logger.warn('[PLC] 未知消息类型:', message.type);
      }
    } catch (error) {
      logger.error('[PLC] 消息解析失败:', error);
    }
  }

  /**
   * 读取PLC数据点
   */
  async readDataPoint(address: string): Promise<PLCDataPoint> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('PLC未连接'));
        return;
      }

      const requestId = `read_${Date.now()}`;
      
      const handler = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.requestId === requestId) {
          this.ws?.removeEventListener('message', handler);
          resolve(message.payload);
        }
      };

      this.ws.addEventListener('message', handler);
      
      this.ws.send(JSON.stringify({
        type: 'read',
        requestId,
        address
      }));

      // 超时处理
      setTimeout(() => {
        this.ws?.removeEventListener('message', handler);
        reject(new Error('读取超时'));
      }, 5000);
    });
  }

  /**
   * 写入PLC数据点
   */
  async writeDataPoint(address: string, value: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('PLC未连接'));
        return;
      }

      const requestId = `write_${Date.now()}`;
      
      const handler = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.requestId === requestId) {
          this.ws?.removeEventListener('message', handler);
          resolve(message.success);
        }
      };

      this.ws.addEventListener('message', handler);
      
      this.ws.send(JSON.stringify({
        type: 'write',
        requestId,
        address,
        value
      }));

      // 超时处理
      setTimeout(() => {
        this.ws?.removeEventListener('message', handler);
        reject(new Error('写入超时'));
      }, 5000);
    });
  }

  /**
   * 发送控制命令
   */
  async sendCommand(command: ControlCommand): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('PLC未连接'));
        return;
      }

      this.ws.send(JSON.stringify({
        type: 'command',
        payload: command
      }));

      resolve(true);
    });
  }

  /**
   * 订阅数据点更新
   */
  subscribeDataPoint(id: string, callback: (data: PLCDataPoint) => void): void {
    this.dataListeners.set(id, callback);
    
    // 发送订阅请求
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        dataPointId: id
      }));
    }
  }

  /**
   * 取消订阅数据点
   */
  unsubscribeDataPoint(id: string): void {
    this.dataListeners.delete(id);
    
    // 发送取消订阅请求
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        dataPointId: id
      }));
    }
  }

  /**
   * 订阅设备状态
   */
  subscribeDeviceStatus(deviceId: string, callback: (status: DeviceStatus) => void): void {
    this.statusListeners.set(deviceId, callback);
  }

  /**
   * 取消订阅设备状态
   */
  unsubscribeDeviceStatus(deviceId: string): void {
    this.statusListeners.delete(deviceId);
  }

  /**
   * 订阅命令响应
   */
  subscribeCommand(callback: (cmd: ControlCommand) => void): void {
    this.commandListeners.set('default', callback);
  }

  /**
   * 通知数据监听器
   */
  private notifyDataListeners(data: PLCDataPoint): void {
    const listener = this.dataListeners.get(data.id);
    if (listener) {
      listener(data);
    }
  }

  /**
   * 通知状态监听器
   */
  private notifyStatusListeners(status: DeviceStatus): void {
    const listener = this.statusListeners.get(status.id);
    if (listener) {
      listener(status);
    }
  }

  /**
   * 通知命令监听器
   */
  private notifyCommandListeners(cmd: ControlCommand): void {
    this.commandListeners.forEach(listener => listener(cmd));
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 批量读取数据点
   */
  async readMultipleDataPoints(addresses: string[]): Promise<PLCDataPoint[]> {
    const promises = addresses.map(addr => this.readDataPoint(addr));
    return Promise.all(promises);
  }

  /**
   * 批量写入数据点
   */
  async writeMultipleDataPoints(writes: Array<{ address: string; value: any }>): Promise<boolean[]> {
    const promises = writes.map(w => this.writeDataPoint(w.address, w.value));
    return Promise.all(promises);
  }
}

// 导出单例
export const plcService = new PLCService();
export default plcService;
