/**
 * 甘特图右键菜单
 */

import { logger } from './logger';

interface MenuItem {
  text?: string;
  icon?: string;
  action?: string | (() => void);
  separator?: boolean;
  disabled?: boolean;
}

export class GanttContextMenu {
  private gantt: any;
  private menu: HTMLElement | null = null;
  
  constructor(gantt: any) {
    this.gantt = gantt;
    this.init();
  }
  
  private init(): void {
    // 监听右键点击
    this.gantt.attachEvent('onContextMenu', (taskId: string, linkId: string, event: MouseEvent) => {
      event.preventDefault();
      
      if (taskId) {
        this.showTaskMenu(taskId, event);
      } else if (linkId) {
        this.showLinkMenu(linkId, event);
      }
      
      return false;
    });
    
    // 点击其他地方关闭菜单
    document.addEventListener('click', () => this.hideMenu());
  }
  
  private showTaskMenu(taskId: string, event: MouseEvent): void {
    const task = this.gantt.getTask(taskId);
    
    const menuItems: MenuItem[] = [
      {
        text: '✏️ 编辑任务',
        action: () => this.editTask(taskId)
      },
      {
        text: '➕ 添加子任务',
        action: () => this.addSubtask(taskId)
      },
      {
        text: '📋 复制任务',
        action: () => this.copyTask(taskId)
      },
      {
        separator: true
      },
      {
        text: '🎯 设为里程碑',
        action: () => this.setMilestone(taskId),
        disabled: task.type === 'milestone'
      },
      {
        text: '⚠️ 标记为关键',
        action: () => this.markCritical(taskId)
      },
      {
        separator: true
      },
      {
        text: '🔗 管理依赖关系',
        action: () => this.manageDependencies(taskId)
      },
      {
        text: '📸 添加到基线',
        action: () => this.addToBaseline(taskId)
      },
      {
        separator: true
      },
      {
        text: '🗑️ 删除任务',
        action: () => this.deleteTask(taskId)
      }
    ];
    
    this.renderMenu(menuItems, event.clientX, event.clientY);
  }
  
  private showLinkMenu(linkId: string, event: MouseEvent): void {
    const menuItems: MenuItem[] = [
      {
        text: '✏️ 编辑依赖类型',
        action: () => this.editLink(linkId)
      },
      {
        text: '🗑️ 删除依赖',
        action: () => this.deleteLink(linkId)
      }
    ];
    
    this.renderMenu(menuItems, event.clientX, event.clientY);
  }
  
  private renderMenu(items: MenuItem[], x: number, y: number): void {
    this.hideMenu();
    
    const menu = document.createElement('div');
    menu.className = 'gantt-context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    
    items.forEach(item => {
      if (item.separator) {
        const separator = document.createElement('div');
        separator.className = 'menu-separator';
        menu.appendChild(separator);
      } else {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        if (item.disabled) {
          menuItem.classList.add('disabled');
        }
        menuItem.textContent = item.text || '';
        
        if (!item.disabled) {
          menuItem.onclick = (e) => {
            e.stopPropagation();
            if (typeof item.action === 'function') {
              item.action();
            }
            this.hideMenu();
          };
        }
        
        menu.appendChild(menuItem);
      }
    });
    
    document.body.appendChild(menu);
    this.menu = menu;
  }
  
  private hideMenu(): void {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }
  }
  
  // 菜单操作实现
  private editTask(taskId: string): void {
    // 触发编辑事件
    this.gantt.showLightbox(taskId);
  }
  
  private addSubtask(taskId: string): void {
    const task = this.gantt.getTask(taskId);
    const newTask = {
      text: '新子任务',
      start_date: task.start_date,
      duration: 1,
      parent: taskId
    };
    this.gantt.addTask(newTask, taskId);
  }
  
  private copyTask(taskId: string): void {
    const task = this.gantt.getTask(taskId);
    sessionStorage.setItem('copiedTask', JSON.stringify(task));
    logger.info('[甘特图菜单] 任务已复制到剪贴板', { taskId });
  }
  
  private setMilestone(taskId: string): void {
    const task = this.gantt.getTask(taskId);
    task.type = 'milestone';
    task.duration = 0;
    this.gantt.updateTask(taskId);
  }
  
  private markCritical(taskId: string): void {
    const task = this.gantt.getTask(taskId);
    task.isCritical = !task.isCritical;
    this.gantt.updateTask(taskId);
  }
  
  private manageDependencies(taskId: string): void {
    logger.info('[甘特图菜单] 管理依赖关系', { taskId });
    // 可以打开依赖管理对话框
  }
  
  private addToBaseline(taskId: string): void {
    logger.info('[甘特图菜单] 添加任务到基线', { taskId });
    // 可以调用基线管理器
  }
  
  private deleteTask(taskId: string): void {
    // TODO: 使用Antd Modal.confirm替代
    this.gantt.deleteTask(taskId);
  }
  
  private editLink(linkId: string): void {
    logger.info('[甘特图菜单] 编辑依赖关系', { linkId });
    // 可以打开依赖编辑对话框
  }
  
  private deleteLink(linkId: string): void {
    // TODO: 使用Antd Modal.confirm替代
    this.gantt.deleteLink(linkId);
  }
  
  destroy(): void {
    this.hideMenu();
  }
}

/**
 * 应用右键菜单到甘特图
 */
export function applyContextMenu(gantt: any): GanttContextMenu {
  return new GanttContextMenu(gantt);
}
