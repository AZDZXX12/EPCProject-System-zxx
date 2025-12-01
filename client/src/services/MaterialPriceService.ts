/**
 * 材料价格监控服务
 * 提供钢材、型材、板材、电缆等建材价格实时监控
 */

export interface MaterialPrice {
  id: string;
  category: string;
  name: string;
  specification: string;
  unit: string;
  currentPrice: number;
  previousPrice: number;
  changeRate: number;
  changeAmount: number;
  trend: 'up' | 'down' | 'stable';
  updateTime: string;
  supplier?: string;
  region: string;
  province?: string; // 可选：省份
  city?: string; // 可选：城市
  quality: string;
  marketIndex?: number; // 可选：市场指数
  tradingVolume?: number; // 可选：交易量
}

export interface RegionData {
  province: string;
  cities: string[];
  avgPrice: number;
  priceIndex: number;
}

export interface PriceHistory {
  date: string;
  price: number;
  volume?: number;
}

export interface MaterialCategory {
  id: string;
  name: string;
  icon: string;
  materials: MaterialPrice[];
}

export interface MarketAnalysis {
  category: string;
  avgPrice: number;
  priceRange: { min: number; max: number };
  volatility: number;
  forecast: 'bullish' | 'bearish' | 'neutral';
  recommendation: string;
}

class MaterialPriceService {
  private priceUpdateInterval: any = null;
  private subscribers: Map<string, (prices: MaterialPrice[]) => void> = new Map();

  /**
   * 创建完整的MaterialPrice对象
   */
  private createMaterialPrice(data: any): MaterialPrice {
    const regionMap: Record<string, string> = {
      '上海': '上海市',
      '北京': '北京市',
      '辽宁': '沈阳市',
      '江苏': '南京市',
      '湖北': '武汉市',
      '安徽': '合肥市',
      '山东': '济南市',
      '河北': '石家庄市',
      '内蒙古': '呼和浩特市',
      '浙江': '杭州市',
      '新疆': '乌鲁木齐市',
      '湖南': '长沙市',
      '广东': '广州市'
    };
    
    return {
      ...data,
      province: data.region || '上海',
      city: regionMap[data.region] || data.region + '市',
      marketIndex: 100 + Math.random() * 20,
      tradingVolume: Math.round(Math.random() * 10000 + 5000)
    };
  }

  /**
   * 获取所有材料价格数据
   */
  async getAllPrices(): Promise<MaterialCategory[]> {
    // 模拟实时价格数据（实际应从API获取）
    return [
      {
        id: 'steel',
        name: '钢材',
        icon: '🏗️',
        materials: this.generateSteelPrices()
      },
      {
        id: 'profile',
        name: '型材',
        icon: '📐',
        materials: this.generateProfilePrices()
      },
      {
        id: 'plate',
        name: '板材',
        icon: '📋',
        materials: this.generatePlatePrices()
      },
      {
        id: 'cable',
        name: '电缆',
        icon: '🔌',
        materials: this.generateCablePrices()
      },
      {
        id: 'electrical',
        name: '电器设备',
        icon: '⚡',
        materials: this.generateElectricalPrices()
      },
      {
        id: 'crane',
        name: '吊装设备',
        icon: '🏗️',
        materials: this.generateCranePrices()
      },
      {
        id: 'utilities',
        name: '水电材料',
        icon: '💧',
        materials: this.generateUtilityPrices()
      }
    ];
  }

  /**
   * 生成钢材价格数据
   */
  private generateSteelPrices(): MaterialPrice[] {
    const baseDate = new Date().toISOString();
    return [
      this.createMaterialPrice({
        id: 'rebar-12',
        category: 'steel',
        name: '螺纹钢',
        specification: 'HRB400E Φ12mm',
        unit: '吨',
        currentPrice: 4280,
        previousPrice: 4250,
        changeRate: 0.71,
        changeAmount: 30,
        trend: 'up',
        updateTime: baseDate,
        supplier: '宝钢集团',
        region: '上海',
        quality: '国标一级'
      }),
      this.createMaterialPrice({
        id: 'rebar-16',
        category: 'steel',
        name: '螺纹钢',
        specification: 'HRB400E Φ16mm',
        unit: '吨',
        currentPrice: 4260,
        previousPrice: 4280,
        changeRate: -0.47,
        changeAmount: -20,
        trend: 'down',
        updateTime: baseDate,
        supplier: '鞍钢集团',
        region: '辽宁',
        quality: '国标一级'
      }),
      this.createMaterialPrice({
        id: 'rebar-20',
        category: 'steel',
        name: '螺纹钢',
        specification: 'HRB400E Φ20mm',
        unit: '吨',
        currentPrice: 4240,
        previousPrice: 4240,
        changeRate: 0,
        changeAmount: 0,
        trend: 'stable',
        updateTime: baseDate,
        supplier: '首钢集团',
        region: '北京',
        quality: '国标一级'
      }),
      this.createMaterialPrice({
        id: 'wire-rod',
        category: 'steel',
        name: '线材',
        specification: 'HPB300 Φ6.5mm',
        unit: '吨',
        currentPrice: 4380,
        previousPrice: 4350,
        changeRate: 0.69,
        changeAmount: 30,
        trend: 'up',
        updateTime: baseDate,
        supplier: '沙钢集团',
        region: '江苏',
        quality: '国标'
      }),
      this.createMaterialPrice({
        id: 'round-bar',
        category: 'steel',
        name: '圆钢',
        specification: 'Q235B Φ20mm',
        unit: '吨',
        currentPrice: 4150,
        previousPrice: 4120,
        changeRate: 0.73,
        changeAmount: 30,
        trend: 'up',
        updateTime: baseDate,
        supplier: '武钢集团',
        region: '湖北',
        quality: '国标'
      })
    ];
  }

  /**
   * 生成型材价格数据
   */
  private generateProfilePrices(): MaterialPrice[] {
    const baseDate = new Date().toISOString();
    return [
      {
        id: 'h-beam-200',
        category: 'profile',
        name: 'H型钢',
        specification: '200×200×8×12',
        unit: '吨',
        currentPrice: 4520,
        previousPrice: 4480,
        changeRate: 0.89,
        changeAmount: 40,
        trend: 'up',
        updateTime: baseDate,
        supplier: '马钢集团',
        region: '安徽',
        quality: '国标'
      },
      {
        id: 'i-beam-16',
        category: 'profile',
        name: '工字钢',
        specification: '16#',
        unit: '吨',
        currentPrice: 4380,
        previousPrice: 4400,
        changeRate: -0.45,
        changeAmount: -20,
        trend: 'down',
        updateTime: baseDate,
        supplier: '莱钢集团',
        region: '山东',
        quality: '国标'
      },
      {
        id: 'channel-10',
        category: 'profile',
        name: '槽钢',
        specification: '10#',
        unit: '吨',
        currentPrice: 4420,
        previousPrice: 4420,
        changeRate: 0,
        changeAmount: 0,
        trend: 'stable',
        updateTime: baseDate,
        supplier: '唐钢集团',
        region: '河北',
        quality: '国标'
      },
      {
        id: 'angle-50',
        category: 'profile',
        name: '角钢',
        specification: '50×50×5',
        unit: '吨',
        currentPrice: 4350,
        previousPrice: 4320,
        changeRate: 0.69,
        changeAmount: 30,
        trend: 'up',
        updateTime: baseDate,
        supplier: '包钢集团',
        region: '内蒙古',
        quality: '国标'
      }
    ];
  }

  /**
   * 生成板材价格数据
   */
  private generatePlatePrices(): MaterialPrice[] {
    const baseDate = new Date().toISOString();
    return [
      {
        id: 'hot-plate-6',
        category: 'plate',
        name: '热轧板',
        specification: '6mm Q235B',
        unit: '吨',
        currentPrice: 4450,
        previousPrice: 4420,
        changeRate: 0.68,
        changeAmount: 30,
        trend: 'up',
        updateTime: baseDate,
        supplier: '宝钢集团',
        region: '上海',
        quality: '国标'
      },
      {
        id: 'cold-plate-2',
        category: 'plate',
        name: '冷轧板',
        specification: '2mm SPCC',
        unit: '吨',
        currentPrice: 4980,
        previousPrice: 4950,
        changeRate: 0.61,
        changeAmount: 30,
        trend: 'up',
        updateTime: baseDate,
        supplier: '鞍钢集团',
        region: '辽宁',
        quality: '国标'
      },
      {
        id: 'galvanized-1',
        category: 'plate',
        name: '镀锌板',
        specification: '1mm DX51D',
        unit: '吨',
        currentPrice: 5280,
        previousPrice: 5300,
        changeRate: -0.38,
        changeAmount: -20,
        trend: 'down',
        updateTime: baseDate,
        supplier: '首钢集团',
        region: '北京',
        quality: '国标'
      },
      {
        id: 'checkered-plate',
        category: 'plate',
        name: '花纹板',
        specification: '4mm Q235B',
        unit: '吨',
        currentPrice: 4680,
        previousPrice: 4680,
        changeRate: 0,
        changeAmount: 0,
        trend: 'stable',
        updateTime: baseDate,
        supplier: '武钢集团',
        region: '湖北',
        quality: '国标'
      }
    ];
  }

  /**
   * 生成电缆价格数据
   */
  private generateCablePrices(): MaterialPrice[] {
    const baseDate = new Date().toISOString();
    return [
      {
        id: 'cable-yjv-4x95',
        category: 'cable',
        name: '电力电缆',
        specification: 'YJV-4×95+1×50',
        unit: '米',
        currentPrice: 285,
        previousPrice: 280,
        changeRate: 1.79,
        changeAmount: 5,
        trend: 'up',
        updateTime: baseDate,
        supplier: '远东电缆',
        region: '江苏',
        quality: '国标3C'
      },
      {
        id: 'cable-yjv-4x50',
        category: 'cable',
        name: '电力电缆',
        specification: 'YJV-4×50+1×25',
        unit: '米',
        currentPrice: 158,
        previousPrice: 155,
        changeRate: 1.94,
        changeAmount: 3,
        trend: 'up',
        updateTime: baseDate,
        supplier: '宝胜电缆',
        region: '江苏',
        quality: '国标3C'
      },
      {
        id: 'cable-bv-4',
        category: 'cable',
        name: '铜芯线',
        specification: 'BV-4mm²',
        unit: '米',
        currentPrice: 8.5,
        previousPrice: 8.3,
        changeRate: 2.41,
        changeAmount: 0.2,
        trend: 'up',
        updateTime: baseDate,
        supplier: '正泰电缆',
        region: '浙江',
        quality: '国标'
      },
      {
        id: 'cable-rvv-3x2.5',
        category: 'cable',
        name: '控制电缆',
        specification: 'RVV-3×2.5',
        unit: '米',
        currentPrice: 12.8,
        previousPrice: 12.8,
        changeRate: 0,
        changeAmount: 0,
        trend: 'stable',
        updateTime: baseDate,
        supplier: '德力西电缆',
        region: '浙江',
        quality: '国标'
      }
    ];
  }

  /**
   * 生成电器设备价格数据
   */
  private generateElectricalPrices(): MaterialPrice[] {
    const baseDate = new Date().toISOString();
    return [
      {
        id: 'transformer-1000',
        category: 'electrical',
        name: '变压器',
        specification: '1000KVA 10/0.4KV',
        unit: '台',
        currentPrice: 185000,
        previousPrice: 182000,
        changeRate: 1.65,
        changeAmount: 3000,
        trend: 'up',
        updateTime: baseDate,
        supplier: '特变电工',
        region: '新疆',
        quality: '国标'
      },
      {
        id: 'switchgear-gck',
        category: 'electrical',
        name: '低压开关柜',
        specification: 'GCK型',
        unit: '面',
        currentPrice: 12800,
        previousPrice: 12500,
        changeRate: 2.4,
        changeAmount: 300,
        trend: 'up',
        updateTime: baseDate,
        supplier: '施耐德电气',
        region: '上海',
        quality: '进口'
      },
      {
        id: 'circuit-breaker-400',
        category: 'electrical',
        name: '断路器',
        specification: 'DW15-400A',
        unit: '个',
        currentPrice: 2850,
        previousPrice: 2850,
        changeRate: 0,
        changeAmount: 0,
        trend: 'stable',
        updateTime: baseDate,
        supplier: 'ABB',
        region: '北京',
        quality: '进口'
      },
      {
        id: 'motor-75kw',
        category: 'electrical',
        name: '电动机',
        specification: 'Y2-75KW',
        unit: '台',
        currentPrice: 18500,
        previousPrice: 18200,
        changeRate: 1.65,
        changeAmount: 300,
        trend: 'up',
        updateTime: baseDate,
        supplier: '西门子',
        region: '江苏',
        quality: '进口'
      }
    ];
  }

  /**
   * 生成吊装设备价格数据
   */
  private generateCranePrices(): MaterialPrice[] {
    const baseDate = new Date().toISOString();
    return [
      {
        id: 'tower-crane-63',
        category: 'crane',
        name: '塔吊租赁',
        specification: 'QTZ63(5610)',
        unit: '月',
        currentPrice: 28000,
        previousPrice: 27500,
        changeRate: 1.82,
        changeAmount: 500,
        trend: 'up',
        updateTime: baseDate,
        supplier: '中联重科',
        region: '湖南',
        quality: '标准'
      },
      {
        id: 'mobile-crane-25',
        category: 'crane',
        name: '汽车吊租赁',
        specification: '25吨',
        unit: '天',
        currentPrice: 2800,
        previousPrice: 2800,
        changeRate: 0,
        changeAmount: 0,
        trend: 'stable',
        updateTime: baseDate,
        supplier: '徐工集团',
        region: '江苏',
        quality: '标准'
      },
      {
        id: 'crawler-crane-50',
        category: 'crane',
        name: '履带吊租赁',
        specification: '50吨',
        unit: '天',
        currentPrice: 5500,
        previousPrice: 5400,
        changeRate: 1.85,
        changeAmount: 100,
        trend: 'up',
        updateTime: baseDate,
        supplier: '三一重工',
        region: '湖南',
        quality: '标准'
      }
    ];
  }

  /**
   * 生成水电材料价格数据
   */
  private generateUtilityPrices(): MaterialPrice[] {
    const baseDate = new Date().toISOString();
    return [
      {
        id: 'ppr-pipe-25',
        category: 'utilities',
        name: 'PPR水管',
        specification: 'DN25 PN2.0',
        unit: '米',
        currentPrice: 12.5,
        previousPrice: 12.3,
        changeRate: 1.63,
        changeAmount: 0.2,
        trend: 'up',
        updateTime: baseDate,
        supplier: '伟星管业',
        region: '浙江',
        quality: '国标'
      },
      {
        id: 'pvc-pipe-110',
        category: 'utilities',
        name: 'PVC排水管',
        specification: 'DN110',
        unit: '米',
        currentPrice: 18.5,
        previousPrice: 18.5,
        changeRate: 0,
        changeAmount: 0,
        trend: 'stable',
        updateTime: baseDate,
        supplier: '联塑管业',
        region: '广东',
        quality: '国标'
      },
      {
        id: 'valve-dn50',
        category: 'utilities',
        name: '闸阀',
        specification: 'DN50 PN16',
        unit: '个',
        currentPrice: 185,
        previousPrice: 180,
        changeRate: 2.78,
        changeAmount: 5,
        trend: 'up',
        updateTime: baseDate,
        supplier: '埃美柯',
        region: '浙江',
        quality: '国标'
      },
      {
        id: 'water-pump-15kw',
        category: 'utilities',
        name: '水泵',
        specification: '15KW 扬程32m',
        unit: '台',
        currentPrice: 8500,
        previousPrice: 8300,
        changeRate: 2.41,
        changeAmount: 200,
        trend: 'up',
        updateTime: baseDate,
        supplier: '格兰富',
        region: '江苏',
        quality: '进口'
      }
    ];
  }

  /**
   * 获取价格历史数据
   */
  async getPriceHistory(_materialId: string, days: number = 30): Promise<PriceHistory[]> {
    const history: PriceHistory[] = [];
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // 模拟价格波动
      const basePrice = 4200;
      const randomFactor = Math.sin(i * 0.3) * 0.05 + 1;
      const trendFactor = 1 + (days - i) * 0.001; // 轻微上涨趋势
      
      history.push({
        date: date.toISOString().slice(0, 10),
        price: Math.round(basePrice * randomFactor * trendFactor),
        volume: Math.round(Math.random() * 1000 + 500)
      });
    }
    
    return history;
  }

  /**
   * 获取市场分析
   */
  async getMarketAnalysis(category: string): Promise<MarketAnalysis> {
    const prices = await this.getCategoryPrices(category);
    const avgPrice = prices.reduce((sum, p) => sum + p.currentPrice, 0) / prices.length;
    const priceArray = prices.map(p => p.currentPrice);
    
    // 计算价格波动率
    const mean = avgPrice;
    const variance = priceArray.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / priceArray.length;
    const volatility = Math.sqrt(variance) / mean * 100;
    
    // 判断市场趋势
    const upTrend = prices.filter(p => p.trend === 'up').length;
    const downTrend = prices.filter(p => p.trend === 'down').length;
    let forecast: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    
    if (upTrend > downTrend * 1.5) {
      forecast = 'bullish';
    } else if (downTrend > upTrend * 1.5) {
      forecast = 'bearish';
    }
    
    // 生成建议
    let recommendation = '';
    switch (forecast) {
      case 'bullish':
        recommendation = '市场价格呈上涨趋势，建议提前采购锁定价格，避免成本上升。';
        break;
      case 'bearish':
        recommendation = '市场价格呈下跌趋势，可适当延迟采购，等待更优价格。';
        break;
      default:
        recommendation = '市场价格相对稳定，可根据项目进度正常采购。';
    }
    
    return {
      category,
      avgPrice,
      priceRange: {
        min: Math.min(...priceArray),
        max: Math.max(...priceArray)
      },
      volatility: Number(volatility.toFixed(2)),
      forecast,
      recommendation
    };
  }

  /**
   * 获取分类价格
   */
  private async getCategoryPrices(category: string): Promise<MaterialPrice[]> {
    const allCategories = await this.getAllPrices();
    const categoryData = allCategories.find(c => c.id === category);
    return categoryData?.materials || [];
  }

  /**
   * 订阅价格更新
   */
  subscribeToPriceUpdates(id: string, callback: (prices: MaterialPrice[]) => void): void {
    this.subscribers.set(id, callback);
    
    // 如果是第一个订阅者，启动定时更新
    if (this.subscribers.size === 1) {
      this.startPriceUpdates();
    }
  }

  /**
   * 取消订阅
   */
  unsubscribeFromPriceUpdates(id: string): void {
    this.subscribers.delete(id);
    
    // 如果没有订阅者了，停止定时更新
    if (this.subscribers.size === 0) {
      this.stopPriceUpdates();
    }
  }

  /**
   * 开始价格更新
   */
  private startPriceUpdates(): void {
    // 每30秒更新一次价格
    this.priceUpdateInterval = setInterval(async () => {
      const categories = await this.getAllPrices();
      const allPrices = categories.flatMap(c => c.materials);
      
      // 模拟价格波动
      allPrices.forEach(price => {
        const change = (Math.random() - 0.5) * 20;
        price.previousPrice = price.currentPrice;
        price.currentPrice = Math.round(price.currentPrice + change);
        price.changeAmount = price.currentPrice - price.previousPrice;
        price.changeRate = Number(((price.changeAmount / price.previousPrice) * 100).toFixed(2));
        price.trend = price.changeAmount > 0 ? 'up' : price.changeAmount < 0 ? 'down' : 'stable';
        price.updateTime = new Date().toISOString();
      });
      
      // 通知所有订阅者
      this.subscribers.forEach(callback => {
        callback(allPrices);
      });
    }, 30000);
  }

  /**
   * 停止价格更新
   */
  private stopPriceUpdates(): void {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }
  }

  /**
   * 计算材料成本
   */
  calculateMaterialCost(materials: Array<{ id: string; quantity: number }>): number {
    // 这里应该根据实际价格计算
    return materials.reduce((total, item) => {
      // 简化计算，实际应查询价格
      return total + item.quantity * 1000;
    }, 0);
  }

  /**
   * 获取价格预警
   */
  async getPriceAlerts(): Promise<Array<{ material: string; message: string; severity: 'high' | 'medium' | 'low' }>> {
    const alerts: Array<{ material: string; message: string; severity: 'high' | 'medium' | 'low' }> = [];
    const categories = await this.getAllPrices();
    
    categories.forEach(category => {
      category.materials.forEach(material => {
        if (Math.abs(material.changeRate) > 5) {
          alerts.push({
            material: `${material.name} ${material.specification}`,
            message: `价格${material.trend === 'up' ? '上涨' : '下跌'} ${Math.abs(material.changeRate)}%`,
            severity: Math.abs(material.changeRate) > 10 ? 'high' : 'medium'
          });
        }
      });
    });
    
    return alerts;
  }
}

// 导出单例
export const materialPriceService = new MaterialPriceService();
