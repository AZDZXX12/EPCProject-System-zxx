/**
 * 甘特图增强工具
 * 提供拖拽、快捷键、批量操作等高级功能
 */

export class GanttEnhancer {
  private gantt: any;
  
  constructor(gantt: any) {
    this.gantt = gantt;
  }
  
  /**
   * 启用快捷键
   */
  enableKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      const selectedTask = this.gantt.getSelectedId();
      
      // Ctrl+D: 删除任务
      if (e.ctrlKey && e.key === 'd' && selectedTask) {
        e.preventDefault();
        this.gantt.deleteTask(selectedTask);
      }
      
      // Ctrl+C: 复制任务
      if (e.ctrlKey && e.key === 'c' && selectedTask) {
        e.preventDefault();
        const task = this.gantt.getTask(selectedTask);
        sessionStorage.setItem('copiedTask', JSON.stringify(task));
      }
      
      // Ctrl+V: 粘贴任务
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        const copied = sessionStorage.getItem('copiedTask');
        if (copied) {
          const task = JSON.parse(copied);
          delete task.id;
          this.gantt.addTask(task);
        }
      }
      
      // Delete: 删除任务
      if (e.key === 'Delete' && selectedTask) {
        e.preventDefault();
        this.gantt.deleteTask(selectedTask);
      }
    });
  }
  
  /**
   * 批量更新进度
   */
  batchUpdateProgress(taskIds: string[], progress: number): void {
    taskIds.forEach(id => {
      try {
        const task = this.gantt.getTask(id);
        task.progress = progress / 100;
        this.gantt.updateTask(id);
      } catch (e) {
        // 任务不存在
      }
    });
  }
  
  /**
   * 批量更新负责人
   */
  batchUpdateOwner(taskIds: string[], owner: string): void {
    taskIds.forEach(id => {
      try {
        const task = this.gantt.getTask(id);
        task.owner = owner;
        this.gantt.updateTask(id);
      } catch (e) {
        // 任务不存在
      }
    });
  }
  
  /**
   * 缩放到适应
   */
  zoomToFit(): void {
    this.gantt.ext.zoom.setLevel('day');
  }
  
  /**
   * 滚动到今天
   */
  scrollToToday(): void {
    const today = new Date();
    this.gantt.showDate(today);
  }
  
  /**
   * 展开/折叠所有任务
   */
  toggleAllTasks(expand: boolean): void {
    this.gantt.eachTask((task: any) => {
      if (expand) {
        this.gantt.open(task.id);
      } else {
        this.gantt.close(task.id);
      }
    });
  }
  
  /**
   * 高亮任务
   */
  highlightTasks(taskIds: string[]): void {
    this.gantt.eachTask((task: any) => {
      task.highlighted = taskIds.includes(task.id);
    });
    this.gantt.render();
  }
  
  /**
   * 筛选任务
   */
  filterTasks(predicate: (task: any) => boolean): void {
    this.gantt.attachEvent('onBeforeTaskDisplay', (_id: any, task: any) => {
      return predicate(task);
    });
    this.gantt.render();
  }
  
  /**
   * 清除筛选
   */
  clearFilter(): void {
    this.gantt.detachEvent('onBeforeTaskDisplay');
    this.gantt.render();
  }
}

/**
 * 应用增强功能到甘特图
 */
export function enhanceGantt(gantt: any): GanttEnhancer {
  const enhancer = new GanttEnhancer(gantt);
  enhancer.enableKeyboardShortcuts();
  return enhancer;
}
