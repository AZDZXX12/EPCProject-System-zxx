/**
 * 供应商智能推荐服务
 * 基于多维度评估和市场数据提供智能推荐
 */

import { eventBus, EVENTS } from '../utils/EventBus';

export interface Supplier {
  id: string;
  name: string;
  category: string[];
  rating: number;
  
  // 基础评估维度
  qualityScore: number;
  priceScore: number;
  deliveryScore: number;
  serviceScore: number;
  
  // 市场指标
  marketIndex: number;
  tradingVolume: number;
  
  // 历史数据
  cooperationCount: number;
  onTimeDeliveryRate: number;
  qualityPassRate: number;
  averageResponseTime: number; // 小时
  
  // 财务信息
  creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B';
  paymentTerms: string;
  
  // 联系信息
  contact: string;
  phone: string;
  address: string;
  
  // 其他
  certifications: string[];
  specialties: string[];
  lastCooperationDate?: string;
}

export interface RecommendationCriteria {
  materialCategory: string;
  urgency: 'high' | 'medium' | 'low';
  budgetRange?: [number, number];
  qualityRequirement: 'high' | 'medium' | 'low';
  preferredSuppliers?: string[];
}

export interface RecommendationResult {
  supplier: Supplier;
  score: number;
  rank: number;
  matchReasons: string[];
  warnings: string[];
  estimatedDeliveryDays: number;
  recommendedReason: string;
}

/**
 * 供应商推荐服务
 */
export class SupplierRecommendationService {
  private suppliers: Supplier[] = [];
  private weights = {
    quality: 0.25,
    price: 0.20,
    delivery: 0.20,
    service: 0.15,
    marketIndex: 0.10,
    tradingVolume: 0.05,
    cooperation: 0.05,
  };

  constructor() {
    this.initializeMockSuppliers();
  }

  /**
   * 初始化模拟供应商数据
   */
  private initializeMockSuppliers() {
    this.suppliers = [
      {
        id: 'SUP-001',
        name: '宝钢集团',
        category: ['钢材', '型材', '板材'],
        rating: 4.8,
        qualityScore: 95,
        priceScore: 75,
        deliveryScore: 90,
        serviceScore: 88,
        marketIndex: 92,
        tradingVolume: 95,
        cooperationCount: 25,
        onTimeDeliveryRate: 96,
        qualityPassRate: 98,
        averageResponseTime: 2,
        creditRating: 'AAA',
        paymentTerms: '月结60天',
        contact: '张经理',
        phone: '021-12345678',
        address: '上海市宝山区',
        certifications: ['ISO9001', 'ISO14001', 'OHSAS18001'],
        specialties: ['大型钢结构', '特种钢材'],
      },
      {
        id: 'SUP-002',
        name: '远东电缆',
        category: ['电缆', '电器'],
        rating: 4.6,
        qualityScore: 92,
        priceScore: 82,
        deliveryScore: 88,
        serviceScore: 85,
        marketIndex: 88,
        tradingVolume: 90,
        cooperationCount: 18,
        onTimeDeliveryRate: 94,
        qualityPassRate: 97,
        averageResponseTime: 3,
        creditRating: 'AA',
        paymentTerms: '月结45天',
        contact: '李经理',
        phone: '0510-87654321',
        address: '江苏省宜兴市',
        certifications: ['ISO9001', 'CCC认证'],
        specialties: ['电力电缆', '特种电缆'],
      },
      {
        id: 'SUP-003',
        name: '中联重科',
        category: ['吊装', '设备'],
        rating: 4.7,
        qualityScore: 90,
        priceScore: 70,
        deliveryScore: 92,
        serviceScore: 90,
        marketIndex: 85,
        tradingVolume: 88,
        cooperationCount: 12,
        onTimeDeliveryRate: 95,
        qualityPassRate: 96,
        averageResponseTime: 4,
        creditRating: 'AA',
        paymentTerms: '月结30天',
        contact: '王经理',
        phone: '0731-88888888',
        address: '湖南省长沙市',
        certifications: ['ISO9001', 'CE认证'],
        specialties: ['大型吊装', '设备租赁'],
      },
      {
        id: 'SUP-004',
        name: '金牛管业',
        category: ['水电', '管材'],
        rating: 4.5,
        qualityScore: 88,
        priceScore: 85,
        deliveryScore: 86,
        serviceScore: 82,
        marketIndex: 82,
        tradingVolume: 85,
        cooperationCount: 15,
        onTimeDeliveryRate: 92,
        qualityPassRate: 95,
        averageResponseTime: 5,
        creditRating: 'A',
        paymentTerms: '月结30天',
        contact: '赵经理',
        phone: '028-66666666',
        address: '四川省成都市',
        certifications: ['ISO9001', '卫生许可证'],
        specialties: ['PPR管', 'PVC管'],
      },
      {
        id: 'SUP-005',
        name: '华通电气',
        category: ['电器', '电缆'],
        rating: 4.4,
        qualityScore: 85,
        priceScore: 88,
        deliveryScore: 84,
        serviceScore: 80,
        marketIndex: 78,
        tradingVolume: 80,
        cooperationCount: 10,
        onTimeDeliveryRate: 90,
        qualityPassRate: 94,
        averageResponseTime: 6,
        creditRating: 'A',
        paymentTerms: '月结45天',
        contact: '刘经理',
        phone: '0571-77777777',
        address: '浙江省杭州市',
        certifications: ['ISO9001', 'CCC认证'],
        specialties: ['变压器', '开关柜'],
      },
      {
        id: 'SUP-006',
        name: '鞍钢集团',
        category: ['钢材', '型材', '板材'],
        rating: 4.7,
        qualityScore: 93,
        priceScore: 78,
        deliveryScore: 89,
        serviceScore: 86,
        marketIndex: 90,
        tradingVolume: 92,
        cooperationCount: 20,
        onTimeDeliveryRate: 95,
        qualityPassRate: 97,
        averageResponseTime: 3,
        creditRating: 'AAA',
        paymentTerms: '月结60天',
        contact: '孙经理',
        phone: '0412-55555555',
        address: '辽宁省鞍山市',
        certifications: ['ISO9001', 'ISO14001'],
        specialties: ['高强度钢材', '耐候钢'],
      },
    ];
  }

  /**
   * 智能推荐供应商
   */
  recommend(criteria: RecommendationCriteria): RecommendationResult[] {
    // 1. 筛选符合类别的供应商
    let candidates = this.suppliers.filter((s) =>
      s.category.includes(criteria.materialCategory)
    );

    if (candidates.length === 0) {
      // 如果没有精确匹配，返回所有供应商
      candidates = this.suppliers;
    }

    // 2. 计算每个供应商的推荐分数
    const results: RecommendationResult[] = candidates.map((supplier) => {
      const score = this.calculateRecommendationScore(supplier, criteria);
      const matchReasons = this.generateMatchReasons(supplier, criteria);
      const warnings = this.generateWarnings(supplier, criteria);
      const estimatedDeliveryDays = this.estimateDeliveryDays(supplier, criteria);
      const recommendedReason = this.generateRecommendedReason(supplier, criteria);

      return {
        supplier,
        score,
        rank: 0, // 稍后设置
        matchReasons,
        warnings,
        estimatedDeliveryDays,
        recommendedReason,
      };
    });

    // 3. 按分数排序并设置排名
    results.sort((a, b) => b.score - a.score);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    // 4. 触发推荐事件
    eventBus.emit(EVENTS.SUPPLIER_EVALUATED, {
      criteria,
      resultsCount: results.length,
      topSupplier: results[0]?.supplier.name,
    });

    return results;
  }

  /**
   * 计算推荐分数
   */
  private calculateRecommendationScore(
    supplier: Supplier,
    criteria: RecommendationCriteria
  ): number {
    let score = 0;

    // 基础评分
    score += supplier.qualityScore * this.weights.quality;
    score += supplier.priceScore * this.weights.price;
    score += supplier.deliveryScore * this.weights.delivery;
    score += supplier.serviceScore * this.weights.service;
    score += supplier.marketIndex * this.weights.marketIndex;
    score += supplier.tradingVolume * this.weights.tradingVolume;

    // 合作历史加分
    const cooperationBonus = Math.min(supplier.cooperationCount * 0.5, 10);
    score += cooperationBonus * this.weights.cooperation;

    // 紧急程度调整
    if (criteria.urgency === 'high') {
      // 紧急情况下，交付能力权重翻倍
      score += supplier.deliveryScore * this.weights.delivery;
      score += supplier.onTimeDeliveryRate * 0.1;
    }

    // 质量要求调整
    if (criteria.qualityRequirement === 'high') {
      // 高质量要求下，质量分数权重翻倍
      score += supplier.qualityScore * this.weights.quality;
      score += supplier.qualityPassRate * 0.1;
    }

    // 优先供应商加分
    if (criteria.preferredSuppliers?.includes(supplier.id)) {
      score += 10;
    }

    // 信用等级加分
    const creditBonus = {
      AAA: 10,
      AA: 8,
      A: 6,
      BBB: 4,
      BB: 2,
      B: 0,
    };
    score += creditBonus[supplier.creditRating];

    return Math.min(Math.round(score), 100);
  }

  /**
   * 生成匹配原因
   */
  private generateMatchReasons(
    supplier: Supplier,
    criteria: RecommendationCriteria
  ): string[] {
    const reasons: string[] = [];

    // 类别匹配
    if (supplier.category.includes(criteria.materialCategory)) {
      reasons.push(`专业供应${criteria.materialCategory}`);
    }

    // 高评分
    if (supplier.rating >= 4.5) {
      reasons.push(`综合评分${supplier.rating}星，口碑优秀`);
    }

    // 合作历史
    if (supplier.cooperationCount > 10) {
      reasons.push(`已合作${supplier.cooperationCount}次，信誉良好`);
    }

    // 准时交付
    if (supplier.onTimeDeliveryRate >= 95) {
      reasons.push(`准时交付率${supplier.onTimeDeliveryRate}%`);
    }

    // 质量保证
    if (supplier.qualityPassRate >= 95) {
      reasons.push(`质量合格率${supplier.qualityPassRate}%`);
    }

    // 市场指标
    if (supplier.marketIndex >= 85) {
      reasons.push(`市场指数${supplier.marketIndex}，行业领先`);
    }

    // 响应速度
    if (supplier.averageResponseTime <= 3) {
      reasons.push(`平均响应时间${supplier.averageResponseTime}小时`);
    }

    // 信用等级
    if (supplier.creditRating === 'AAA' || supplier.creditRating === 'AA') {
      reasons.push(`信用等级${supplier.creditRating}`);
    }

    return reasons.slice(0, 5); // 最多返回5个原因
  }

  /**
   * 生成警告信息
   */
  private generateWarnings(
    supplier: Supplier,
    criteria: RecommendationCriteria
  ): string[] {
    const warnings: string[] = [];

    // 价格较高
    if (supplier.priceScore < 75) {
      warnings.push('价格相对较高，建议议价');
    }

    // 交付延迟风险
    if (supplier.onTimeDeliveryRate < 90) {
      warnings.push(`准时交付率仅${supplier.onTimeDeliveryRate}%，存在延迟风险`);
    }

    // 质量风险
    if (supplier.qualityPassRate < 95) {
      warnings.push(`质量合格率${supplier.qualityPassRate}%，需加强质检`);
    }

    // 响应慢
    if (supplier.averageResponseTime > 5) {
      warnings.push(`响应时间较长（${supplier.averageResponseTime}小时）`);
    }

    // 合作次数少
    if (supplier.cooperationCount < 5) {
      warnings.push('合作次数较少，建议小批量试单');
    }

    // 信用等级低
    if (supplier.creditRating === 'BBB' || supplier.creditRating === 'BB' || supplier.creditRating === 'B') {
      warnings.push(`信用等级${supplier.creditRating}，建议预付款或担保`);
    }

    return warnings;
  }

  /**
   * 估算交付天数
   */
  private estimateDeliveryDays(
    supplier: Supplier,
    criteria: RecommendationCriteria
  ): number {
    let baseDays = 15; // 基础交付天数

    // 根据交付评分调整
    if (supplier.deliveryScore >= 90) {
      baseDays -= 3;
    } else if (supplier.deliveryScore < 80) {
      baseDays += 3;
    }

    // 根据紧急程度调整
    if (criteria.urgency === 'high') {
      baseDays = Math.max(baseDays - 5, 5);
    } else if (criteria.urgency === 'low') {
      baseDays += 5;
    }

    // 根据历史准时率调整
    if (supplier.onTimeDeliveryRate < 90) {
      baseDays += 3;
    }

    return baseDays;
  }

  /**
   * 生成推荐理由
   */
  private generateRecommendedReason(
    supplier: Supplier,
    criteria: RecommendationCriteria
  ): string {
    const reasons: string[] = [];

    if (supplier.rating >= 4.7) {
      reasons.push('综合评分优秀');
    }

    if (supplier.cooperationCount > 15) {
      reasons.push('长期合作伙伴');
    }

    if (supplier.marketIndex >= 90) {
      reasons.push('市场领先地位');
    }

    if (supplier.onTimeDeliveryRate >= 95 && criteria.urgency === 'high') {
      reasons.push('准时交付保障');
    }

    if (supplier.qualityPassRate >= 97 && criteria.qualityRequirement === 'high') {
      reasons.push('质量可靠');
    }

    if (supplier.priceScore >= 85) {
      reasons.push('价格优势');
    }

    if (reasons.length === 0) {
      return '综合评估推荐';
    }

    return reasons.slice(0, 3).join('、');
  }

  /**
   * 获取所有供应商
   */
  getAllSuppliers(): Supplier[] {
    return this.suppliers;
  }

  /**
   * 根据类别获取供应商
   */
  getSuppliersByCategory(category: string): Supplier[] {
    return this.suppliers.filter((s) => s.category.includes(category));
  }

  /**
   * 获取供应商详情
   */
  getSupplierById(id: string): Supplier | undefined {
    return this.suppliers.find((s) => s.id === id);
  }

  /**
   * 更新权重配置
   */
  updateWeights(weights: Partial<typeof this.weights>): void {
    this.weights = { ...this.weights, ...weights };
  }
}

// 导出单例
export const supplierRecommendationService = new SupplierRecommendationService();
