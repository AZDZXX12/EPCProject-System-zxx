/**
 * 文档管理服务
 * 提供文档的上传、下载、版本控制、权限管理、全文搜索等功能
 */

import { StorageManager } from '../utils/StorageManager';
import { logger } from '../utils/logger';
import { eventBus, EVENTS } from '../utils/EventBus';

// ==================== 类型定义 ====================

export interface Document {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  category: DocumentCategory;
  fileType: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  content?: string;
  tags: string[];
  author: string;
  department: string;
  projectId?: string;
  createTime: string;
  updateTime: string;
  version: string;
  status: DocumentStatus;
  permissions: DocumentPermission;
  metadata: DocumentMetadata;
  versions: DocumentVersion[];
  comments: DocumentComment[];
  approvals: ApprovalRecord[];
  downloads: number;
  views: number;
  checkoutUser?: string;
  checkoutTime?: string;
  relatedDocs: string[];
}

export type DocumentType = 
  | 'contract'        // 合同
  | 'proposal'        // 方案
  | 'report'          // 报告
  | 'drawing'         // 图纸
  | 'specification'   // 规范
  | 'manual'          // 手册
  | 'procedure'       // 程序
  | 'record'          // 记录
  | 'certificate'     // 证书
  | 'other';          // 其他

export type DocumentCategory = 
  | 'project'         // 项目文档
  | 'technical'       // 技术文档
  | 'quality'         // 质量文档
  | 'safety'          // 安全文档
  | 'procurement'     // 采购文档
  | 'construction'    // 施工文档
  | 'management'      // 管理文档
  | 'finance'         // 财务文档
  | 'legal'           // 法务文档
  | 'template';       // 模板文档

export type DocumentStatus = 
  | 'draft'           // 草稿
  | 'reviewing'       // 审核中
  | 'approved'        // 已批准
  | 'published'       // 已发布
  | 'archived'        // 已归档
  | 'obsolete';       // 已作废

export interface DocumentPermission {
  public: boolean;
  departments: string[];
  roles: string[];
  users: string[];
  canEdit: string[];
  canApprove: string[];
  canDelete: string[];
}

export interface DocumentMetadata {
  keywords: string[];
  language: string;
  confidentiality: 'public' | 'internal' | 'confidential' | 'secret';
  retentionPeriod: number; // 保存期限（月）
  expiryDate?: string;
  checksum?: string;
  digitalSignature?: string;
}

export interface DocumentVersion {
  versionNumber: string;
  versionDate: string;
  author: string;
  changeLog: string;
  fileSize: number;
  filePath: string;
  checksum: string;
}

export interface DocumentComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  parentId?: string;
  attachments?: string[];
}

export interface ApprovalRecord {
  id: string;
  approver: string;
  approvalDate: string;
  status: 'approved' | 'rejected' | 'pending';
  comments: string;
  signature?: string;
}

export interface DocumentSearchParams {
  query?: string;
  type?: DocumentType;
  category?: DocumentCategory;
  status?: DocumentStatus;
  author?: string;
  department?: string;
  projectId?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'title' | 'date' | 'size' | 'downloads' | 'views';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DocumentStatistics {
  totalCount: number;
  byType: Map<DocumentType, number>;
  byCategory: Map<DocumentCategory, number>;
  byStatus: Map<DocumentStatus, number>;
  totalSize: number;
  recentUploads: number;
  pendingApprovals: number;
  expiringDocuments: number;
  popularDocuments: Document[];
}

// ==================== 文档管理服务 ====================

export class DocumentService {
  private documents: Map<string, Document>;
  private static instance: DocumentService;
  private searchIndex: Map<string, Set<string>>; // 搜索索引

  private constructor() {
    this.documents = new Map();
    this.searchIndex = new Map();
    this.loadFromStorage();
  }

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  // 从存储加载数据
  private loadFromStorage(): void {
    const cached = StorageManager.load<Document[]>('documents_data');
    if (cached) {
      cached.forEach(doc => {
        this.documents.set(doc.id, doc);
        this.updateSearchIndex(doc);
      });
      logger.info('[DocumentService] 加载文档数据', { count: cached.length });
    } else {
      this.initSampleData();
    }
  }

  // 保存到存储
  private saveToStorage(): void {
    const data = Array.from(this.documents.values());
    StorageManager.save('documents_data', data);
  }

  // 初始化示例数据
  private initSampleData(): void {
    const sampleDocuments: Document[] = [
      {
        id: 'DOC001',
        title: 'EPC项目总包流程',
        description: 'EPC项目总包施工完整流程文档',
        type: 'procedure',
        category: 'project',
        fileType: 'docx',
        fileName: '总包流程.docx',
        filePath: '/docs/process/总包流程.docx',
        fileSize: 256000,
        tags: ['EPC', '流程', '总包'],
        author: '张经理',
        department: '项目管理部',
        createTime: '2025-01-01 10:00:00',
        updateTime: '2025-11-20 15:30:00',
        version: '2.0',
        status: 'published',
        permissions: {
          public: true,
          departments: [],
          roles: [],
          users: [],
          canEdit: ['admin', 'manager'],
          canApprove: ['manager', 'director'],
          canDelete: ['admin'],
        },
        metadata: {
          keywords: ['EPC', '项目管理', '流程'],
          language: 'zh-CN',
          confidentiality: 'internal',
          retentionPeriod: 60,
        },
        versions: [
          {
            versionNumber: '1.0',
            versionDate: '2025-01-01 10:00:00',
            author: '张经理',
            changeLog: '初始版本',
            fileSize: 250000,
            filePath: '/docs/process/总包流程_v1.0.docx',
            checksum: 'abc123',
          },
          {
            versionNumber: '2.0',
            versionDate: '2025-11-20 15:30:00',
            author: '张经理',
            changeLog: '更新施工阶段流程',
            fileSize: 256000,
            filePath: '/docs/process/总包流程_v2.0.docx',
            checksum: 'def456',
          },
        ],
        comments: [],
        approvals: [
          {
            id: 'APR001',
            approver: '李总',
            approvalDate: '2025-01-05 14:00:00',
            status: 'approved',
            comments: '流程清晰，批准发布',
          },
        ],
        downloads: 156,
        views: 892,
        relatedDocs: ['DOC002', 'DOC003'],
      },
      {
        id: 'DOC002',
        title: '施工组织设计样板',
        description: '施工组织设计标准样板文件',
        type: 'specification',
        category: 'technical',
        fileType: 'pdf',
        fileName: '施工组织设计.pdf',
        filePath: '/docs/technical/施工组织设计.pdf',
        fileSize: 1024000,
        tags: ['施工', '设计', '样板'],
        author: '王工',
        department: '技术部',
        createTime: '2025-02-01 09:00:00',
        updateTime: '2025-02-01 09:00:00',
        version: '1.0',
        status: 'published',
        permissions: {
          public: true,
          departments: [],
          roles: [],
          users: [],
          canEdit: ['admin', 'engineer'],
          canApprove: ['manager'],
          canDelete: ['admin'],
        },
        metadata: {
          keywords: ['施工', '组织设计'],
          language: 'zh-CN',
          confidentiality: 'public',
          retentionPeriod: 36,
        },
        versions: [],
        comments: [],
        approvals: [],
        downloads: 89,
        views: 456,
        relatedDocs: ['DOC001'],
      },
    ];

    sampleDocuments.forEach(doc => {
      this.documents.set(doc.id, doc);
      this.updateSearchIndex(doc);
    });
    this.saveToStorage();
  }

  // ==================== 搜索索引管理 ====================

  // 更新搜索索引
  private updateSearchIndex(doc: Document): void {
    // 索引标题
    this.addToIndex(doc.title.toLowerCase(), doc.id);
    
    // 索引描述
    this.addToIndex(doc.description.toLowerCase(), doc.id);
    
    // 索引标签
    doc.tags.forEach(tag => {
      this.addToIndex(tag.toLowerCase(), doc.id);
    });
    
    // 索引关键词
    doc.metadata.keywords.forEach(keyword => {
      this.addToIndex(keyword.toLowerCase(), doc.id);
    });
  }

  // 添加到索引
  private addToIndex(text: string, docId: string): void {
    const words = text.split(/\s+/);
    words.forEach(word => {
      if (word.length > 1) {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, new Set());
        }
        this.searchIndex.get(word)?.add(docId);
      }
    });
  }

  // ==================== CRUD操作 ====================

  // 获取所有文档
  getAllDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  // 获取单个文档
  getDocumentById(id: string): Document | null {
    const doc = this.documents.get(id) || null;
    if (doc) {
      // 增加浏览次数
      doc.views++;
      this.saveToStorage();
    }
    return doc;
  }

  // 上传文档
  uploadDocument(document: Omit<Document, 'id'>): Document {
    const id = `DOC${Date.now()}`;
    const newDocument: Document = {
      ...document,
      id,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      downloads: 0,
      views: 0,
    };
    
    this.documents.set(id, newDocument);
    this.updateSearchIndex(newDocument);
    this.saveToStorage();
    
    eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
      type: 'success',
      message: '文档上传成功',
      description: `${newDocument.title} 已上传`,
    });
    
    logger.info('[DocumentService] 文档上传', { id, title: newDocument.title });
    
    return newDocument;
  }

  // 更新文档
  updateDocument(id: string, updates: Partial<Document>): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    // 创建新版本
    if (updates.content || updates.filePath) {
      const newVersion: DocumentVersion = {
        versionNumber: this.incrementVersion(doc.version),
        versionDate: new Date().toISOString(),
        author: updates.author || '系统',
        changeLog: '文档更新',
        fileSize: updates.fileSize || doc.fileSize,
        filePath: updates.filePath || doc.filePath,
        checksum: this.generateChecksum(updates.content || ''),
      };
      
      if (!doc.versions) doc.versions = [];
      doc.versions.push(newVersion);
      
      updates.version = newVersion.versionNumber;
    }

    const updated = {
      ...doc,
      ...updates,
      updateTime: new Date().toISOString(),
    };
    
    this.documents.set(id, updated);
    this.updateSearchIndex(updated);
    this.saveToStorage();
    
    return true;
  }

  // 删除文档
  deleteDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    // 检查权限
    if (doc.status === 'published' || doc.status === 'approved') {
      logger.warn('[DocumentService] 不能删除已发布或已批准的文档', { id });
      return false;
    }

    const result = this.documents.delete(id);
    if (result) {
      this.saveToStorage();
      logger.info('[DocumentService] 文档已删除', { id, title: doc.title });
    }
    return result;
  }

  // ==================== 搜索功能 ====================

  // 搜索文档
  searchDocuments(params: DocumentSearchParams): {
    results: Document[];
    total: number;
  } {
    let results = Array.from(this.documents.values());

    // 全文搜索
    if (params.query) {
      const queryLower = params.query.toLowerCase();
      const matchingIds = new Set<string>();
      
      // 从索引中查找
      this.searchIndex.forEach((docIds, word) => {
        if (word.includes(queryLower)) {
          docIds.forEach(id => matchingIds.add(id));
        }
      });
      
      results = results.filter(doc => 
        matchingIds.has(doc.id) ||
        doc.content?.toLowerCase().includes(queryLower)
      );
    }

    // 按类型筛选
    if (params.type) {
      results = results.filter(doc => doc.type === params.type);
    }

    // 按分类筛选
    if (params.category) {
      results = results.filter(doc => doc.category === params.category);
    }

    // 按状态筛选
    if (params.status) {
      results = results.filter(doc => doc.status === params.status);
    }

    // 按作者筛选
    if (params.author) {
      results = results.filter(doc => doc.author === params.author);
    }

    // 按部门筛选
    if (params.department) {
      results = results.filter(doc => doc.department === params.department);
    }

    // 按项目筛选
    if (params.projectId) {
      results = results.filter(doc => doc.projectId === params.projectId);
    }

    // 按标签筛选
    if (params.tags && params.tags.length > 0) {
      results = results.filter(doc =>
        params.tags!.some(tag => doc.tags.includes(tag))
      );
    }

    // 日期范围筛选
    if (params.dateFrom || params.dateTo) {
      results = results.filter(doc => {
        const docDate = new Date(doc.createTime);
        if (params.dateFrom && docDate < new Date(params.dateFrom)) return false;
        if (params.dateTo && docDate > new Date(params.dateTo)) return false;
        return true;
      });
    }

    // 排序
    if (params.sortBy) {
      results.sort((a, b) => {
        let compareValue = 0;
        switch (params.sortBy) {
          case 'title':
            compareValue = a.title.localeCompare(b.title);
            break;
          case 'date':
            compareValue = new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime();
            break;
          case 'size':
            compareValue = b.fileSize - a.fileSize;
            break;
          case 'downloads':
            compareValue = b.downloads - a.downloads;
            break;
          case 'views':
            compareValue = b.views - a.views;
            break;
        }
        return params.sortOrder === 'asc' ? compareValue : -compareValue;
      });
    }

    // 分页
    const total = results.length;
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      results = results.slice(start, end);
    }

    return { results, total };
  }

  // ==================== 版本控制 ====================

  // 获取文档版本历史
  getDocumentVersions(docId: string): DocumentVersion[] {
    const doc = this.documents.get(docId);
    return doc?.versions || [];
  }

  // 回滚到指定版本
  rollbackToVersion(docId: string, versionNumber: string): boolean {
    const doc = this.documents.get(docId);
    if (!doc) return false;

    const version = doc.versions.find(v => v.versionNumber === versionNumber);
    if (!version) return false;

    // 创建新版本作为回滚记录
    const rollbackVersion: DocumentVersion = {
      versionNumber: this.incrementVersion(doc.version),
      versionDate: new Date().toISOString(),
      author: '系统',
      changeLog: `回滚到版本 ${versionNumber}`,
      fileSize: version.fileSize,
      filePath: version.filePath,
      checksum: version.checksum,
    };

    doc.versions.push(rollbackVersion);
    doc.version = rollbackVersion.versionNumber;
    doc.filePath = version.filePath;
    doc.fileSize = version.fileSize;
    doc.updateTime = new Date().toISOString();

    this.documents.set(docId, doc);
    this.saveToStorage();
    
    logger.info('[DocumentService] 文档版本回滚', { docId, toVersion: versionNumber });
    
    return true;
  }

  // ==================== 审批流程 ====================

  // 提交审批
  submitForApproval(docId: string, approverId: string): boolean {
    const doc = this.documents.get(docId);
    if (!doc) return false;

    doc.status = 'reviewing';
    
    const approval: ApprovalRecord = {
      id: `APR${Date.now()}`,
      approver: approverId,
      approvalDate: '',
      status: 'pending',
      comments: '',
    };
    
    if (!doc.approvals) doc.approvals = [];
    doc.approvals.push(approval);
    
    this.documents.set(docId, doc);
    this.saveToStorage();
    
    eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
      type: 'info',
      message: '文档已提交审批',
      description: `${doc.title} 正在等待审批`,
    });
    
    return true;
  }

  // 审批文档
  approveDocument(
    docId: string,
    approvalId: string,
    approved: boolean,
    comments: string
  ): boolean {
    const doc = this.documents.get(docId);
    if (!doc || !doc.approvals) return false;

    const approval = doc.approvals.find(a => a.id === approvalId);
    if (!approval) return false;

    approval.status = approved ? 'approved' : 'rejected';
    approval.comments = comments;
    approval.approvalDate = new Date().toISOString();

    // 更新文档状态
    if (approved) {
      doc.status = 'approved';
    } else {
      doc.status = 'draft';
    }

    this.documents.set(docId, doc);
    this.saveToStorage();
    
    return true;
  }

  // ==================== 统计分析 ====================

  // 获取文档统计
  getDocumentStatistics(): DocumentStatistics {
    const stats: DocumentStatistics = {
      totalCount: this.documents.size,
      byType: new Map(),
      byCategory: new Map(),
      byStatus: new Map(),
      totalSize: 0,
      recentUploads: 0,
      pendingApprovals: 0,
      expiringDocuments: 0,
      popularDocuments: [],
    };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.documents.forEach(doc => {
      // 按类型统计
      const typeCount = stats.byType.get(doc.type) || 0;
      stats.byType.set(doc.type, typeCount + 1);

      // 按分类统计
      const catCount = stats.byCategory.get(doc.category) || 0;
      stats.byCategory.set(doc.category, catCount + 1);

      // 按状态统计
      const statusCount = stats.byStatus.get(doc.status) || 0;
      stats.byStatus.set(doc.status, statusCount + 1);

      // 总大小
      stats.totalSize += doc.fileSize;

      // 最近上传
      if (new Date(doc.createTime) > thirtyDaysAgo) {
        stats.recentUploads++;
      }

      // 待审批
      if (doc.status === 'reviewing') {
        stats.pendingApprovals++;
      }

      // 即将过期
      if (doc.metadata.expiryDate) {
        const expiryDate = new Date(doc.metadata.expiryDate);
        const daysToExpiry = (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
        if (daysToExpiry > 0 && daysToExpiry <= 30) {
          stats.expiringDocuments++;
        }
      }
    });

    // 热门文档（按下载量排序）
    stats.popularDocuments = Array.from(this.documents.values())
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);

    return stats;
  }

  // ==================== 工具方法 ====================

  // 生成校验和
  private generateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // 版本号递增
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const minor = parseInt(parts[1] || '0') + 1;
    return `${parts[0]}.${minor}`;
  }

  // 下载文档
  downloadDocument(docId: string): Document | null {
    const doc = this.documents.get(docId);
    if (!doc) return null;

    doc.downloads++;
    this.saveToStorage();
    
    logger.info('[DocumentService] 文档下载', { id: docId, title: doc.title });
    
    return doc;
  }

  // 签出文档（锁定编辑）
  checkoutDocument(docId: string, userId: string): boolean {
    const doc = this.documents.get(docId);
    if (!doc) return false;

    if (doc.checkoutUser && doc.checkoutUser !== userId) {
      logger.warn('[DocumentService] 文档已被其他用户签出', {
        docId,
        currentUser: doc.checkoutUser,
      });
      return false;
    }

    doc.checkoutUser = userId;
    doc.checkoutTime = new Date().toISOString();
    this.documents.set(docId, doc);
    this.saveToStorage();
    
    return true;
  }

  // 签入文档（解锁编辑）
  checkinDocument(docId: string, userId: string): boolean {
    const doc = this.documents.get(docId);
    if (!doc) return false;

    if (doc.checkoutUser !== userId) {
      logger.warn('[DocumentService] 只有签出用户可以签入文档', {
        docId,
        checkoutUser: doc.checkoutUser,
        currentUser: userId,
      });
      return false;
    }

    doc.checkoutUser = undefined;
    doc.checkoutTime = undefined;
    this.documents.set(docId, doc);
    this.saveToStorage();
    
    return true;
  }
}

// 导出单例
export const documentService = DocumentService.getInstance();
