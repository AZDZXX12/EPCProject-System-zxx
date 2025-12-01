/**
 * 增强版材料价格监控服务
 * 覆盖全国主要城市，包含更全面的材料种类
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
  province: string;
  city: string;
  quality: string;
  marketIndex: number;
  tradingVolume: number;
}

export interface MaterialCategory {
  id: string;
  name: string;
  icon: string;
  materials: MaterialPrice[];
}

export interface PriceHistory {
  date: string;
  price: number;
  volume?: number;
}

export interface MarketAnalysis {
  category: string;
  avgPrice: number;
  priceRange: { min: number; max: number };
  volatility: number;
  forecast: 'bullish' | 'bearish' | 'neutral';
  recommendation: string;
}

// 全国主要城市数据
export const CHINA_CITIES = {
  '华北': {
    '北京市': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区'],
    '天津市': ['和平区', '河东区', '河西区', '南开区', '河北区'],
    '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '保定市'],
    '山西省': ['太原市', '大同市', '阳泉市', '长治市', '晋城市'],
    '内蒙古': ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市'],
  },
  '东北': {
    '辽宁省': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市'],
    '吉林省': ['长春市', '吉林市', '四平市', '辽源市', '通化市'],
    '黑龙江': ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市'],
  },
  '华东': {
    '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区'],
    '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市'],
    '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市'],
    '安徽省': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市'],
    '福建省': ['福州市', '厦门市', '莆田市', '三明市', '泉州市'],
    '江西省': ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市'],
    '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市'],
  },
  '华中': {
    '河南省': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市'],
    '湖北省': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市'],
    '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市'],
  },
  '华南': {
    '广东省': ['广州市', '韶关市', '深圳市', '珠海市', '汕头市', '佛山市', '东莞市'],
    '广西': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市'],
    '海南省': ['海口市', '三亚市', '三沙市', '儋州市'],
  },
  '西南': {
    '重庆市': ['渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区'],
    '四川省': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市'],
    '贵州省': ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市'],
    '云南省': ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市'],
    '西藏': ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市'],
  },
  '西北': {
    '陕西省': ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市'],
    '甘肃省': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市'],
    '青海省': ['西宁市', '海东市'],
    '宁夏': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
    '新疆': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市'],
  },
};

// 扩充的材料分类
export const MATERIAL_CATEGORIES = {
  // 1. 钢材类（扩充）
  steel: {
    name: '钢材',
    icon: '🏗️',
    items: [
      { name: '螺纹钢', specs: ['HRB400 Φ12', 'HRB400 Φ14', 'HRB400 Φ16', 'HRB400 Φ18', 'HRB400 Φ20', 'HRB400 Φ22', 'HRB400 Φ25', 'HRB400 Φ28', 'HRB400 Φ32'], unit: '吨' },
      { name: '线材', specs: ['HPB300 Φ6.5', 'HPB300 Φ8', 'HPB300 Φ10'], unit: '吨' },
      { name: '圆钢', specs: ['Q235 Φ16', 'Q235 Φ18', 'Q235 Φ20', 'Q235 Φ22', 'Q235 Φ25'], unit: '吨' },
      { name: '盘螺', specs: ['HPB300 Φ8', 'HPB300 Φ10'], unit: '吨' },
    ]
  },
  
  // 2. 型材类（扩充）
  profile: {
    name: '型材',
    icon: '📐',
    items: [
      { name: 'H型钢', specs: ['200×100×5.5×8', '250×125×6×9', '300×150×6.5×9', '350×175×7×11', '400×200×8×13', '500×200×10×16'], unit: '吨' },
      { name: 'I型钢', specs: ['10#', '12#', '14#', '16#', '18#', '20#', '22#', '25#'], unit: '吨' },
      { name: '槽钢', specs: ['8#', '10#', '12#', '14#', '16#', '18#', '20#', '22#'], unit: '吨' },
      { name: '角钢', specs: ['∠40×4', '∠50×5', '∠63×6', '∠75×8', '∠100×10'], unit: '吨' },
      { name: '方管', specs: ['40×40×2.5', '50×50×3', '60×60×3', '80×80×4', '100×100×5'], unit: '吨' },
      { name: '矩形管', specs: ['40×80×3', '50×100×3', '60×120×4', '80×160×5'], unit: '吨' },
    ]
  },
  
  // 3. 板材类（扩充）
  plate: {
    name: '板材',
    icon: '📋',
    items: [
      { name: '热轧板', specs: ['Q235 3mm', 'Q235 4mm', 'Q235 5mm', 'Q235 6mm', 'Q235 8mm', 'Q235 10mm', 'Q235 12mm'], unit: '吨' },
      { name: '冷轧板', specs: ['SPCC 0.5mm', 'SPCC 0.8mm', 'SPCC 1.0mm', 'SPCC 1.2mm', 'SPCC 1.5mm'], unit: '吨' },
      { name: '镀锌板', specs: ['DX51D 0.5mm', 'DX51D 0.8mm', 'DX51D 1.0mm', 'DX51D 1.2mm'], unit: '吨' },
      { name: '花纹板', specs: ['Q235 3mm', 'Q235 4mm', 'Q235 5mm', 'Q235 6mm'], unit: '吨' },
      { name: '不锈钢板', specs: ['304 1.0mm', '304 1.5mm', '304 2.0mm', '316L 1.0mm', '316L 2.0mm'], unit: '吨' },
      { name: '铝板', specs: ['1060 1.0mm', '1060 2.0mm', '5052 1.5mm', '5052 2.0mm'], unit: '吨' },
    ]
  },
  
  // 4. 电缆类（扩充）
  cable: {
    name: '电缆',
    icon: '⚡',
    items: [
      { name: '电力电缆', specs: ['YJV 3×25+1×16', 'YJV 3×35+1×16', 'YJV 3×50+1×25', 'YJV 3×70+1×35', 'YJV 3×95+1×50', 'YJV 3×120+1×70', 'YJV 3×150+1×70', 'YJV 3×185+1×95', 'YJV 3×240+1×120'], unit: '米' },
      { name: '铜芯线', specs: ['BV 1.5mm²', 'BV 2.5mm²', 'BV 4mm²', 'BV 6mm²', 'BV 10mm²', 'BV 16mm²'], unit: '米' },
      { name: '控制电缆', specs: ['KVV 4×1.5', 'KVV 7×1.5', 'KVV 10×1.5', 'KVV 14×1.5'], unit: '米' },
      { name: '铝芯电缆', specs: ['YJLV 3×50+1×25', 'YJLV 3×70+1×35', 'YJLV 3×95+1×50'], unit: '米' },
      { name: '架空线', specs: ['LGJ-95/15', 'LGJ-120/20', 'LGJ-150/25', 'LGJ-185/30'], unit: '米' },
    ]
  },
  
  // 5. 电气设备类（扩充）
  electrical: {
    name: '电气设备',
    icon: '🔌',
    items: [
      { name: '变压器', specs: ['S11-M-50kVA', 'S11-M-100kVA', 'S11-M-200kVA', 'S11-M-315kVA', 'S11-M-500kVA', 'S11-M-630kVA', 'S11-M-800kVA', 'S11-M-1000kVA'], unit: '台' },
      { name: '开关柜', specs: ['GGD 380V', 'GCK 380V', 'MNS 380V', 'KYN28 10kV'], unit: '面' },
      { name: '断路器', specs: ['DZ47-63 C16', 'DZ47-63 C32', 'DZ47-63 C63', 'NSX100F 100A', 'NSX250F 250A'], unit: '个' },
      { name: '电动机', specs: ['Y132S-4 5.5kW', 'Y132M-4 7.5kW', 'Y160M-4 11kW', 'Y160L-4 15kW', 'Y180M-4 18.5kW'], unit: '台' },
      { name: '配电箱', specs: ['PZ30 12回路', 'PZ30 18回路', 'PZ30 24回路'], unit: '个' },
      { name: '接触器', specs: ['CJX2-0910', 'CJX2-1210', 'CJX2-1810', 'CJX2-2510', 'CJX2-3210'], unit: '个' },
    ]
  },
  
  // 6. 吊装设备类（扩充）
  lifting: {
    name: '吊装设备',
    icon: '🏗️',
    items: [
      { name: '塔吊', specs: ['QTZ63(5013)', 'QTZ80(5610)', 'QTZ125(6015)', 'QTZ160(6517)'], unit: '台·月' },
      { name: '汽车吊', specs: ['25吨', '50吨', '70吨', '100吨', '130吨', '160吨', '200吨'], unit: '台·天' },
      { name: '履带吊', specs: ['50吨', '80吨', '150吨', '200吨', '300吨', '400吨'], unit: '台·天' },
      { name: '施工升降机', specs: ['SC200/200', 'SC100/100'], unit: '台·月' },
      { name: '门式起重机', specs: ['5吨', '10吨', '16吨', '20吨', '32吨'], unit: '台·月' },
    ]
  },
  
  // 7. 水暖管材类（扩充）
  plumbing: {
    name: '水暖管材',
    icon: '🚰',
    items: [
      { name: 'PPR管', specs: ['DN20', 'DN25', 'DN32', 'DN40', 'DN50', 'DN63', 'DN75', 'DN90', 'DN110'], unit: '米' },
      { name: 'PVC管', specs: ['DN50', 'DN75', 'DN110', 'DN160', 'DN200', 'DN250'], unit: '米' },
      { name: '镀锌钢管', specs: ['DN15', 'DN20', 'DN25', 'DN32', 'DN40', 'DN50', 'DN65', 'DN80', 'DN100'], unit: '米' },
      { name: '无缝钢管', specs: ['Φ57×3.5', 'Φ76×4', 'Φ89×4.5', 'Φ108×4.5', 'Φ133×5', 'Φ159×6'], unit: '米' },
      { name: '闸阀', specs: ['DN50', 'DN65', 'DN80', 'DN100', 'DN125', 'DN150', 'DN200'], unit: '个' },
      { name: '水泵', specs: ['ISG50-125 3kW', 'ISG65-160 5.5kW', 'ISG80-200 11kW'], unit: '台' },
    ]
  },
  
  // 8. 水泥混凝土类（新增）
  concrete: {
    name: '水泥混凝土',
    icon: '🏭',
    items: [
      { name: '水泥', specs: ['P.O 42.5', 'P.O 52.5', 'P.C 32.5'], unit: '吨' },
      { name: '商品混凝土', specs: ['C15', 'C20', 'C25', 'C30', 'C35', 'C40', 'C45', 'C50'], unit: '立方米' },
      { name: '砂浆', specs: ['M5', 'M7.5', 'M10', 'M15', 'M20'], unit: '立方米' },
      { name: '砂石', specs: ['中砂', '粗砂', '碎石5-10mm', '碎石10-20mm', '碎石20-40mm'], unit: '吨' },
    ]
  },
  
  // 9. 装饰材料类（新增）
  decoration: {
    name: '装饰材料',
    icon: '🎨',
    items: [
      { name: '瓷砖', specs: ['600×600mm', '800×800mm', '600×1200mm'], unit: '平方米' },
      { name: '石材', specs: ['大理石', '花岗岩', '人造石'], unit: '平方米' },
      { name: '涂料', specs: ['乳胶漆', '外墙涂料', '防水涂料'], unit: '桶' },
      { name: '木地板', specs: ['实木地板', '复合地板', '强化地板'], unit: '平方米' },
      { name: '吊顶材料', specs: ['铝扣板', '石膏板', '矿棉板'], unit: '平方米' },
    ]
  },
  
  // 10. 保温防水类（新增）
  insulation: {
    name: '保温防水',
    icon: '🛡️',
    items: [
      { name: '岩棉板', specs: ['50mm', '80mm', '100mm', '120mm'], unit: '立方米' },
      { name: '挤塑板', specs: ['30mm', '50mm', '80mm', '100mm'], unit: '立方米' },
      { name: '防水卷材', specs: ['SBS 3mm', 'SBS 4mm', 'APP 3mm', 'APP 4mm'], unit: '平方米' },
      { name: '防水涂料', specs: ['聚氨酯', '丙烯酸', 'JS复合'], unit: '桶' },
      { name: '玻璃棉', specs: ['50mm', '75mm', '100mm'], unit: '立方米' },
    ]
  },
};

class EnhancedMaterialPriceService {
  private priceUpdateInterval: any = null;
  private subscribers: Map<string, (prices: MaterialPrice[]) => void> = new Map();

  private basePrice: Record<string, number> = {
    // 钢材基准价（元/吨）
    '螺纹钢': 4200,
    '线材': 4300,
    '圆钢': 4100,
    '盘螺': 4250,
    // 型材基准价
    'H型钢': 4500,
    'I型钢': 4400,
    '槽钢': 4350,
    '角钢': 4450,
    '方管': 4600,
    '矩形管': 4650,
    // 板材基准价
    '热轧板': 4300,
    '冷轧板': 4800,
    '镀锌板': 5200,
    '花纹板': 4500,
    '不锈钢板': 15000,
    '铝板': 18000,
    // 电缆基准价（元/米）
    '电力电缆': 25,
    '铜芯线': 3.5,
    '控制电缆': 8,
    '铝芯电缆': 15,
    '架空线': 12,
    // 电气设备基准价
    '变压器': 8000,
    '开关柜': 12000,
    '断路器': 150,
    '电动机': 2500,
    '配电箱': 800,
    '接触器': 80,
    // 吊装设备基准价（元/台·月或台·天）
    '塔吊': 15000,
    '汽车吊': 2500,
    '履带吊': 3500,
    '施工升降机': 8000,
    '门式起重机': 10000,
    // 水暖管材基准价
    'PPR管': 8,
    'PVC管': 6,
    '镀锌钢管': 12,
    '无缝钢管': 15,
    '闸阀': 200,
    '水泵': 1500,
    // 水泥混凝土基准价
    '水泥': 450,
    '商品混凝土': 350,
    '砂浆': 280,
    '砂石': 120,
    // 装饰材料基准价
    '瓷砖': 80,
    '石材': 200,
    '涂料': 350,
    '木地板': 150,
    '吊顶材料': 60,
    // 保温防水基准价
    '岩棉板': 800,
    '挤塑板': 600,
    '防水卷材': 35,
    '防水涂料': 280,
    '玻璃棉': 500,
  };

  // 地区价格系数
  private regionPriceIndex: Record<string, number> = {
    // 一线城市
    '北京市': 1.15,
    '上海市': 1.18,
    '广州市': 1.12,
    '深圳市': 1.20,
    // 新一线城市
    '成都市': 1.05,
    '杭州市': 1.10,
    '重庆市': 1.03,
    '西安市': 1.02,
    '苏州市': 1.08,
    '武汉市': 1.04,
    '南京市': 1.07,
    '天津市': 1.06,
    '郑州市': 1.00,
    '长沙市': 1.02,
    '沈阳市': 0.98,
    '青岛市': 1.05,
    '宁波市': 1.08,
    '东莞市': 1.10,
    '无锡市': 1.06,
    '佛山市': 1.08,
    // 二线城市
    '合肥市': 0.98,
    '福州市': 1.00,
    '厦门市': 1.05,
    '哈尔滨市': 0.95,
    '济南市': 1.00,
    '大连市': 1.02,
    '昆明市': 0.98,
    '太原市': 0.96,
    '石家庄市': 0.95,
    '南昌市': 0.94,
    '贵阳市': 0.93,
    '南宁市': 0.95,
    '兰州市': 0.92,
    '乌鲁木齐市': 0.90,
    '呼和浩特市': 0.91,
    '银川市': 0.90,
    '西宁市': 0.88,
    '拉萨市': 0.85,
    // 其他城市默认系数
    '其他': 0.93,
  };

  /**
   * 生成材料价格数据
   */
  generateMaterialPrices(category: string, items: any[], cities: string[]): MaterialPrice[] {
    const prices: MaterialPrice[] = [];
    const now = new Date();
    
    items.forEach((item) => {
      item.specs.forEach((spec: string) => {
        cities.forEach((city) => {
          const basePrice = this.basePrice[item.name] || 1000;
          const regionIndex = (this.regionPriceIndex[city] ?? this.regionPriceIndex['其他'] ?? 1);
          const randomFactor = 0.95 + Math.random() * 0.1; // ±5%波动
          
          const currentPrice = Math.round(basePrice * regionIndex * randomFactor);
          const previousPrice = Math.round(currentPrice * (0.98 + Math.random() * 0.04));
          const changeAmount = currentPrice - previousPrice;
          const changeRate = ((changeAmount / previousPrice) * 100);
          
          prices.push({
            id: `${category}-${item.name}-${spec}-${city}`,
            category,
            name: item.name,
            specification: spec,
            unit: item.unit,
            currentPrice,
            previousPrice,
            changeRate: Number(changeRate.toFixed(2)),
            changeAmount,
            trend: changeAmount > 0 ? 'up' : changeAmount < 0 ? 'down' : 'stable',
            updateTime: now.toISOString(),
            province: city.includes('市') ? city.replace('市', '省') : city,
            city,
            quality: '国标',
            marketIndex: Math.round(100 + Math.random() * 20),
            tradingVolume: Math.round(Math.random() * 10000 + 5000),
          });
        });
      });
    });
    
    return prices;
  }

  /**
   * 获取所有材料价格（覆盖全国主要城市）
   */
  async getAllPrices(): Promise<any[]> {
    // 获取所有城市列表
    const allCities: string[] = [];
    Object.values(CHINA_CITIES).forEach((region) => {
      Object.entries(region).forEach(([_province, cities]) => {
        if (Array.isArray(cities)) {
          // 如果是城市数组，取主要城市
          const firstCity = cities[0];
          if (firstCity) allCities.push(firstCity);
        }
      });
    });

    const categories: any[] = [];
    
    for (const [key, config] of Object.entries(MATERIAL_CATEGORIES)) {
      categories.push({
        id: key,
        name: config.name,
        icon: config.icon,
        materials: this.generateMaterialPrices(config.name, config.items, allCities),
      });
    }
    
    return categories;
  }

  /**
   * 按城市筛选价格
   */
  async getPricesByCity(city: string): Promise<any[]> {
    const allPrices = await this.getAllPrices();
    return allPrices.map((category) => ({
      ...category,
      materials: category.materials.filter((m: MaterialPrice) => m.city === city),
    }));
  }

  /**
   * 按材料类别筛选
   */
  async getPricesByCategory(categoryId: string): Promise<any> {
    const allPrices = await this.getAllPrices();
    return allPrices.find((c) => c.id === categoryId);
  }

  /**
   * 搜索材料
   */
  async searchMaterials(keyword: string): Promise<MaterialPrice[]> {
    const allPrices = await this.getAllPrices();
    const allMaterials: MaterialPrice[] = [];
    
    allPrices.forEach((category) => {
      allMaterials.push(...category.materials);
    });
    
    return allMaterials.filter((m) =>
      m.name.includes(keyword) ||
      m.specification.includes(keyword) ||
      m.city.includes(keyword)
    );
  }

  /**
   * 获取价格历史数据（基于key的确定性生成）
   * key 可传入 materialId 或 categoryId 或二者组合，确保不同品类/材料曲线不同
   */
  async getPriceHistory(key: string, days: number = 30): Promise<any[]> {
    const history: any[] = [];
    const now = new Date();

    // 基于key生成稳定seed
    const seedFromKey = (str: string) => {
      let h = 2166136261 >>> 0; // FNV-1a 基础
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    };

    const seed = seedFromKey(key);
    let state = seed || 1;
    const rand = () => {
      // 线性同余生成器 LCG
      state = (1664525 * state + 1013904223) >>> 0;
      return (state & 0xffffffff) / 0x100000000;
    };

    // 基线与波动：不同key生成不同基线与趋势
    const base = 3000 + Math.floor((seed % 2000));
    const trend = (seed % 3) - 1; // -1, 0, 1
    const amp = 100 + Math.floor((seed % 200));

    let current = base + Math.floor(rand() * 50);
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // 组合：缓慢趋势 + 轻微随机 + 周期性波动
      const drift = trend * (days - i) * 2; // 线性漂移
      const noise = Math.floor((rand() - 0.5) * 20);
      const seasonal = Math.floor(Math.sin((i / 6.28) * 2) * (amp / 10));
      current = Math.max(10, current + drift / days + noise + seasonal);

      history.push({
        date: date.toISOString().slice(0, 10),
        price: Math.round(current),
        volume: Math.round(3000 + rand() * 5000),
      });
    }

    return history;
  }

  /**
   * 获取市场分析（支持按类别获取）
   */
  async getMarketAnalysis(categoryId?: string): Promise<any> {
    const allAnalysis = Object.entries(MATERIAL_CATEGORIES).map(([key, config]) => ({
      id: key,
      category: config.name,
      avgPrice: Math.round(4000 + Math.random() * 1000),
      priceRange: {
        min: Math.round(3500 + Math.random() * 500),
        max: Math.round(4500 + Math.random() * 500),
      },
      volatility: Number((Math.random() * 10).toFixed(2)),
      forecast: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)] as any,
      recommendation: '建议关注市场动态，适时采购',
    }));

    // 如果指定了类别，返回单个分析对象
    if (categoryId) {
      return allAnalysis.find(a => a.id === categoryId) || allAnalysis[0];
    }
    
    // 否则返回所有分析
    return allAnalysis;
  }

  /**
   * 获取价格预警
   */
  async getPriceAlerts(): Promise<any[]> {
    return [
      {
        id: '1',
        materialName: '螺纹钢 HRB400 Φ20',
        type: 'price_surge',
        severity: 'high',
        message: '价格上涨超过10%，建议尽快采购',
        currentPrice: 4620,
        threshold: 4200,
        changeRate: 10.5,
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        materialName: '电力电缆 YJV 3×95+1×50',
        type: 'price_drop',
        severity: 'medium',
        message: '价格下降5%，可考虑采购',
        currentPrice: 23.75,
        threshold: 25,
        changeRate: -5.0,
        timestamp: new Date().toISOString(),
      },
      {
        id: '3',
        materialName: '商品混凝土 C30',
        type: 'volatility',
        severity: 'low',
        message: '价格波动较大，建议关注',
        currentPrice: 365,
        threshold: 350,
        changeRate: 4.3,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  /**
   * 订阅价格更新
   */
  subscribeToPriceUpdates(
    callback: (prices: MaterialPrice[]) => void
  ): () => void {
    const id = Math.random().toString(36).substr(2, 9);
    this.subscribers.set(id, callback);

    // 启动定时更新（如果还没启动）
    if (!this.priceUpdateInterval) {
      this.priceUpdateInterval = setInterval(async () => {
        const allPrices = await this.getAllPrices();
        const allMaterials: MaterialPrice[] = [];
        allPrices.forEach((category) => {
          allMaterials.push(...category.materials);
        });

        // 通知所有订阅者
        this.subscribers.forEach((cb) => cb(allMaterials));
      }, 30000); // 每30秒更新一次
    }

    // 返回取消订阅函数
    return () => {
      this.subscribers.delete(id);
      if (this.subscribers.size === 0 && this.priceUpdateInterval) {
        clearInterval(this.priceUpdateInterval);
        this.priceUpdateInterval = null;
      }
    };
  }

  /**
   * 停止所有价格更新
   */
  stopPriceUpdates(): void {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }
    this.subscribers.clear();
  }
}

export const enhancedMaterialPriceService = new EnhancedMaterialPriceService();
export default enhancedMaterialPriceService;
