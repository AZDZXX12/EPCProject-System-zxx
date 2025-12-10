/**
 * 通知服务
 * 提供站内消息、邮件、短信等多种通知方式
 */

export type NotificationType = 'system' | 'task' | 'approval' | 'reminder' | 'alert';
export type NotificationPriority = 'normal' | 'important' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  content: string;
  link?: string;
  data?: any;
  sender?: string;
  receiver: string;
  createdAt: string;
  readAt?: string;
  archivedAt?: string;
}

export interface NotificationFilter {
  type?: NotificationType;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  startDate?: string;
  endDate?: string;
}

export interface NotificationSettings {
  enableSound: boolean;
  enableDesktop: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string; // HH:mm
  types: {
    [key in NotificationType]: boolean;
  };
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Map<string, Set<(notification: Notification) => void>> = new Map();
  private settings: NotificationSettings;
  private storageKey = 'notifications';
  private settingsKey = 'notificationSettings';

  constructor() {
    this.loadNotifications();
    this.settings = this.loadSettings();
    this.requestPermission();
  }

  // 加载通知
  private loadNotifications(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.notifications = JSON.parse(data);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
      this.notifications = [];
    }
  }

  // 保存通知
  private saveNotifications(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('保存通知失败:', error);
    }
  }

  // 加载设置
  private loadSettings(): NotificationSettings {
    try {
      const data = localStorage.getItem(this.settingsKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('加载通知设置失败:', error);
    }

    // 默认设置
    return {
      enableSound: true,
      enableDesktop: true,
      enableEmail: false,
      enableSMS: false,
      types: {
        system: true,
        task: true,
        approval: true,
        reminder: true,
        alert: true,
      },
    };
  }

  // 保存设置
  saveSettings(settings: NotificationSettings): void {
    this.settings = settings;
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.error('保存通知设置失败:', error);
    }
  }

  // 获取设置
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // 请求桌面通知权限
  private async requestPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  // 检查是否在静音时段
  private isQuietHours(): boolean {
    if (!this.settings.quietHoursStart || !this.settings.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return currentTime >= this.settings.quietHoursStart && currentTime <= this.settings.quietHoursEnd;
  }

  // 发送通知
  send(notification: Omit<Notification, 'id' | 'status' | 'createdAt'>): string {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    // 检查类型是否启用
    if (!this.settings.types[notification.type]) {
      return id;
    }

    this.notifications.unshift(newNotification);
    this.saveNotifications();

    // 触发监听器
    this.notifyListeners('new', newNotification);

    // 显示桌面通知
    if (this.settings.enableDesktop && !this.isQuietHours()) {
      this.showDesktopNotification(newNotification);
    }

    // 播放声音
    if (this.settings.enableSound && !this.isQuietHours()) {
      this.playSound(newNotification.priority);
    }

    // 发送邮件（如果启用）
    if (this.settings.enableEmail) {
      this.sendEmail(newNotification);
    }

    // 发送短信（如果启用）
    if (this.settings.enableSMS) {
      this.sendSMS(newNotification);
    }

    return id;
  }

  // 显示桌面通知
  private showDesktopNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: notification.content,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
      };

      const desktopNotif = new Notification(notification.title, options);
      
      desktopNotif.onclick = () => {
        window.focus();
        if (notification.link) {
          window.location.href = notification.link;
        }
        desktopNotif.close();
      };
    }
  }

  // 播放声音
  private playSound(priority: NotificationPriority): void {
    try {
      const audio = new Audio();
      switch (priority) {
        case 'urgent':
          audio.src = '/sounds/urgent.mp3';
          break;
        case 'important':
          audio.src = '/sounds/important.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      audio.play().catch(err => console.warn('播放声音失败:', err));
    } catch (error) {
      console.warn('播放声音失败:', error);
    }
  }

  // 发送邮件（需要后端支持）
  private async sendEmail(notification: Notification): Promise<void> {
    try {
      // TODO: 调用后端API发送邮件
      console.log('发送邮件通知:', notification);
    } catch (error) {
      console.error('发送邮件失败:', error);
    }
  }

  // 发送短信（需要后端支持）
  private async sendSMS(notification: Notification): Promise<void> {
    try {
      // TODO: 调用后端API发送短信
      console.log('发送短信通知:', notification);
    } catch (error) {
      console.error('发送短信失败:', error);
    }
  }

  // 获取通知列表
  getList(filter?: NotificationFilter): Notification[] {
    let result = [...this.notifications];

    if (filter) {
      if (filter.type) {
        result = result.filter(n => n.type === filter.type);
      }
      if (filter.priority) {
        result = result.filter(n => n.priority === filter.priority);
      }
      if (filter.status) {
        result = result.filter(n => n.status === filter.status);
      }
      if (filter.startDate) {
        result = result.filter(n => n.createdAt >= filter.startDate!);
      }
      if (filter.endDate) {
        result = result.filter(n => n.createdAt <= filter.endDate!);
      }
    }

    return result;
  }

  // 获取未读数量
  getUnreadCount(type?: NotificationType): number {
    let notifications = this.notifications.filter(n => n.status === 'unread');
    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }
    return notifications.length;
  }

  // 标记为已读
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && notification.status === 'unread') {
      notification.status = 'read';
      notification.readAt = new Date().toISOString();
      this.saveNotifications();
      this.notifyListeners('read', notification);
    }
  }

  // 全部标记为已读
  markAllAsRead(type?: NotificationType): void {
    let notifications = this.notifications.filter(n => n.status === 'unread');
    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    notifications.forEach(notification => {
      notification.status = 'read';
      notification.readAt = new Date().toISOString();
    });

    this.saveNotifications();
    this.notifyListeners('readAll', null as any);
  }

  // 归档通知
  archive(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.status = 'archived';
      notification.archivedAt = new Date().toISOString();
      this.saveNotifications();
      this.notifyListeners('archive', notification);
    }
  }

  // 删除通知
  delete(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      const notification = this.notifications[index];
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.notifyListeners('delete', notification);
    }
  }

  // 清空通知
  clear(filter?: NotificationFilter): void {
    if (!filter) {
      this.notifications = [];
    } else {
      const toDelete = this.getList(filter);
      toDelete.forEach(n => {
        const index = this.notifications.findIndex(notif => notif.id === n.id);
        if (index !== -1) {
          this.notifications.splice(index, 1);
        }
      });
    }
    this.saveNotifications();
    this.notifyListeners('clear', null as any);
  }

  // 订阅通知事件
  subscribe(event: string, callback: (notification: Notification) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // 返回取消订阅函数
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // 通知监听器
  private notifyListeners(event: string, notification: Notification): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(notification);
        } catch (error) {
          console.error('通知监听器执行失败:', error);
        }
      });
    }
  }

  // 获取通知详情
  getById(id: string): Notification | undefined {
    return this.notifications.find(n => n.id === id);
  }

  // 批量操作
  batchMarkAsRead(ids: string[]): void {
    ids.forEach(id => this.markAsRead(id));
  }

  batchDelete(ids: string[]): void {
    ids.forEach(id => this.delete(id));
  }

  batchArchive(ids: string[]): void {
    ids.forEach(id => this.archive(id));
  }
}

// 导出单例
export const notificationService = new NotificationService();
export default notificationService;
