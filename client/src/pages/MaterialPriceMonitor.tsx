import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Statistic,
  Tabs,
  Alert,
  Space,
  Select,
  DatePicker,
  Button,
  Badge,
  Tooltip,
  Progress,
  Typography,
  Divider,
  Modal,
  List,
  Empty,
  message
} from 'antd';
import { logger } from '../utils/logger';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  AlertOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ExportOutlined,
  ReloadOutlined,
  SettingOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { 
  enhancedMaterialPriceService as materialPriceService, 
  MaterialPrice, 
  MaterialCategory,
  PriceHistory,
  MarketAnalysis,
  CHINA_CITIES
} from '../services/EnhancedMaterialPriceService';
import './MaterialPriceMonitor.css';
import { eventBus, EVENTS, PriceAlertEventData, ProcurementEventData } from '../utils/EventBus';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const MaterialPriceMonitor: React.FC = () => {
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('steel');
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialPrice | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState<number>(30);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailHistory, setDetailHistory] = useState<PriceHistory[]>([]);

  const mainCities: string[] = React.useMemo(() => {
    const set = new Set<string>();
    Object.values(CHINA_CITIES).forEach((region: any) => {
      Object.values(region).forEach((cities: any) => {
        if (Array.isArray(cities) && cities[0]) set.add(cities[0]);
      });
    });
    return Array.from(set);
  }, []);

  useEffect(() => {
    loadPriceData();
    loadPriceAlerts();
    
    // 订阅价格更新
    const unsubscribe = materialPriceService.subscribeToPriceUpdates(handlePriceUpdate);
    
    // 设置自动刷新倒计时
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRefresh();
          setLastUpdateTime(new Date());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      unsubscribe();
      clearInterval(countdownTimer);
    };
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryData(selectedCategory);
    }
  }, [selectedCategory, selectedRegion]);

  const loadPriceData = async () => {
    setLoading(true);
    try {
      const data = await materialPriceService.getAllPrices();
      setCategories(data);
    } catch (error) {
      logger.error('[材料价格监控] 加载价格数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryData = async (category: string) => {
    try {
      const key = `${category}|${selectedRegion}`;
      const [history, analysis] = await Promise.all([
        materialPriceService.getPriceHistory(key, 30),
        materialPriceService.getMarketAnalysis(category)
      ]);
      setPriceHistory(history);
      // 确保analysis有效
      if (analysis && typeof analysis === 'object') {
        setMarketAnalysis(analysis);
      } else {
        logger.warn('[材料价格监控] 市场分析数据无效:', analysis);
        setMarketAnalysis(null);
      }
    } catch (error) {
      logger.error('[材料价格监控] 加载品类数据失败:', error);
      setMarketAnalysis(null);
    }
  };

  const loadPriceAlerts = async () => {
    try {
      const alerts = await materialPriceService.getPriceAlerts();
      setPriceAlerts(alerts);
      // 触发高优先级价格预警事件
      alerts.forEach((alert: any) => {
        if (alert.severity === 'high') {
          eventBus.emit(EVENTS.PRICE_ALERT_TRIGGERED, {
            materialId: alert.id,
            materialName: alert.materialName || alert.material,
            currentPrice: alert.currentPrice,
            previousPrice: alert.threshold || alert.currentPrice * 0.9,
            change: alert.currentPrice - (alert.threshold || alert.currentPrice * 0.9),
            changePercent: alert.changeRate || 0,
            threshold: alert.threshold || alert.currentPrice * 1.1,
            severity: alert.severity,
            region: alert.region,
          } as PriceAlertEventData);
        }
      });
    } catch (error) {
      logger.error('[材料价格监控] 加载价格预警失败:', error);
    }
  };

  const handlePriceUpdate = (prices: MaterialPrice[]) => {
    // 更新价格数据
    setCategories(prev => {
      return prev.map(category => ({
        ...category,
        materials: category.materials.map(material => {
          const updated = prices.find(p => p.id === material.id);
          return updated || material;
        })
      }));
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadPriceData(),
      loadPriceAlerts(),
      selectedCategory && loadCategoryData(selectedCategory)
    ]);
    setRefreshing(false);
  };

  const showMaterialDetail = async (material: MaterialPrice) => {
    setSelectedMaterial(material);
    const hist = await materialPriceService.getPriceHistory(material.id, 30);
    setDetailHistory(hist);
    setDetailModalVisible(true);
  };

  // 批量加入采购清单
  const handleBatchAddToProcurement = () => {
    if (selectedRowKeys.length === 0) {
      Modal.warning({ title: '请先选择材料', content: '请至少选择一个材料加入采购清单' });
      return;
    }

    const currentCategory = categories.find(c => c.id === selectedCategory);
    const selectedMaterials = currentCategory?.materials.filter(m => selectedRowKeys.includes(m.id)) || [];

    selectedMaterials.forEach(material => {
      eventBus.emit(EVENTS.PROCUREMENT_ITEM_ADDED, {
        materialId: material.id,
        materialName: material.name,
        specification: material.specification,
        quantity: 0,
        estimatedPrice: material.currentPrice,
        urgency: 'medium',
        reason: '材料价格监控-批量添加',
      } as ProcurementEventData);
    });

    Modal.success({
      title: '已加入采购清单',
      content: `已将 ${selectedMaterials.length} 个材料加入采购清单，请前往采购管理模块查看。`,
    });

    setSelectedRowKeys([]);
  };

  const renderPriceChange = (change: number, trend: 'up' | 'down' | 'stable') => {
    const color = trend === 'up' ? '#ff4d4f' : trend === 'down' ? '#52c41a' : '#d9d9d9';
    const Icon = trend === 'up' ? ArrowUpOutlined : trend === 'down' ? ArrowDownOutlined : MinusOutlined;
    
    return (
      <Space>
        <Icon style={{ color }} />
        <Text style={{ color }}>
          {trend !== 'stable' && (change > 0 ? '+' : '')}{change.toFixed(2)}%
        </Text>
      </Space>
    );
  };

  const columns = [
    {
      title: '材料名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left' as const,
      render: (text: string, record: MaterialPrice) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong>{text}</Text>
            <Button
              type="link"
              size="small"
              icon={<ShoppingCartOutlined />}
              onClick={() => {
                eventBus.emit(EVENTS.PROCUREMENT_ITEM_ADDED, {
                  materialId: record.id,
                  materialName: record.name,
                  specification: record.specification,
                  quantity: 0,
                  estimatedPrice: record.currentPrice,
                  urgency: 'medium',
                  reason: '材料价格监控-单项添加',
                } as ProcurementEventData);
                message.success(`已将"${text}"加入采购清单`);
              }}
            >
              加入采购
            </Button>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.specification}</Text>
        </Space>
      )
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80
    },
    {
      title: '当前价格',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (price: number) => (
        <Text strong style={{ fontSize: 16 }}>
          ¥{price.toLocaleString()}
        </Text>
      )
    },
    {
      title: '涨跌幅',
      key: 'change',
      render: (_: any, record: MaterialPrice) => renderPriceChange(record.changeRate, record.trend)
    },
    {
      title: '涨跌额',
      dataIndex: 'changeAmount',
      key: 'changeAmount',
      render: (amount: number, record: MaterialPrice) => (
        <Text style={{ color: record.trend === 'up' ? '#ff4d4f' : record.trend === 'down' ? '#52c41a' : '#d9d9d9' }}>
          {amount > 0 ? '+' : ''}{amount}
        </Text>
      )
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier'
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      render: (region: string) => <Tag>{region}</Tag>
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (time: string) => new Date(time).toLocaleString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: MaterialPrice) => (
        <Button type="link" size="small" onClick={() => showMaterialDetail(record)}>
          详情
        </Button>
      )
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // 计算统计数据
  const currentCategory = categories.find(c => c.id === selectedCategory);
  const totalMaterials = currentCategory?.materials.length || 0;
  const upCount = currentCategory?.materials.filter(m => m.trend === 'up').length || 0;
  const downCount = currentCategory?.materials.filter(m => m.trend === 'down').length || 0;
  const stableCount = currentCategory?.materials.filter(m => m.trend === 'stable').length || 0;

  const pieData = [
    { name: '上涨', value: upCount },
    { name: '下跌', value: downCount },
    { name: '持平', value: stableCount }
  ];

  return (
    <div className="material-price-monitor">
      {/* 页面标题 */}
      <Card className="page-header-card">
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <DollarOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <Title level={3} style={{ margin: 0 }}>材料价格监控中心</Title>
              <Badge status="processing" text="实时更新" />
              <Divider type="vertical" />
              <Text type="secondary">最后更新: {lastUpdateTime.toLocaleTimeString('zh-CN')}</Text>
              <Text>下次更新: {countdown}秒</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined spin={refreshing} />} onClick={handleRefresh}>
                刷新数据
              </Button>
              <Button icon={<ExportOutlined />}>导出报表</Button>
              <Button icon={<SettingOutlined />}>设置预警</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 价格预警 */}
      {priceAlerts.length > 0 && (
        <Alert
          message="价格预警"
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              {priceAlerts.slice(0, 3).map((alert, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <WarningOutlined style={{ color: alert.severity === 'high' ? '#ff4d4f' : '#faad14' }} />
                    <Text style={{ marginLeft: 8 }}>
                      {alert.materialName || alert.material}: {alert.message}
                    </Text>
                  </div>
                  <Button 
                    size="small" 
                    type="link"
                    onClick={() => {
                      eventBus.emit(EVENTS.PROCUREMENT_PLAN_CREATED, {
                        materialId: alert.id,
                        materialName: alert.materialName || alert.material,
                        specification: alert.specification || '',
                        quantity: 0,
                        estimatedPrice: alert.currentPrice || 0,
                        urgency: alert.severity,
                        reason: `价格预警：${alert.message}`,
                      } as ProcurementEventData);
                      Modal.success({
                        title: '采购计划已创建',
                        content: `已为"${alert.materialName || alert.material}"生成采购计划草稿，请前往采购管理模块查看。`,
                      });
                    }}
                  >
                    生成采购计划
                  </Button>
                </div>
              ))}
            </Space>
          }
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="监控材料总数"
              value={totalMaterials}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="价格上涨"
              value={upCount}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  ({totalMaterials > 0 ? ((upCount / totalMaterials) * 100).toFixed(1) : 0}%)
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="价格下跌"
              value={downCount}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  ({totalMaterials > 0 ? ((downCount / totalMaterials) * 100).toFixed(1) : 0}%)
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="市场波动率"
              value={marketAnalysis?.volatility || 0}
              suffix="%"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主内容区 */}
      <Card>
        <Tabs 
          activeKey={selectedCategory} 
          onChange={setSelectedCategory}
          tabBarExtraContent={
            <Space>
              <Select
                placeholder="选择地区"
                style={{ width: 160 }}
                value={selectedRegion}
                onChange={(v) => setSelectedRegion(v)}
                options={[{ value: 'all', label: '全国' }, ...mainCities.map((c) => ({ value: c, label: c }))]}
              />
              <RangePicker />
            </Space>
          }
          items={categories.map(category => ({
            key: category.id,
            label: (
              <Space>
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <Badge count={category.materials.length} />
              </Space>
            ),
            children: (
              <Row gutter={16}>
                {/* 左侧价格表格 */}
                <Col xs={24} lg={16}>
                  <Card 
                    title="实时价格" 
                    extra={
                      <Space>
                        {selectedRowKeys.length > 0 && (
                          <Button 
                            type="primary" 
                            icon={<ShoppingCartOutlined />}
                            onClick={handleBatchAddToProcurement}
                          >
                            批量加入采购 ({selectedRowKeys.length})
                          </Button>
                        )}
                        <Text type="secondary">
                          最后更新: {new Date().toLocaleString('zh-CN')}
                        </Text>
                      </Space>
                    }
                  >
                    <Table
                      columns={columns}
                      dataSource={selectedRegion === 'all' ? category.materials : category.materials.filter(m => m.city === selectedRegion)}
                      rowKey="id"
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      size="small"
                      scroll={{ x: 1200 }}
                      rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        selections: [
                          Table.SELECTION_ALL,
                          Table.SELECTION_INVERT,
                          Table.SELECTION_NONE,
                        ],
                      }}
                    />
                  </Card>
                </Col>

                {/* 右侧图表 */}
                <Col xs={24} lg={8}>
                  {/* 价格走势图 */}
                  <Card title="价格走势" style={{ marginBottom: 16 }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).getDate() + '日'}
                        />
                        <YAxis />
                        <ChartTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#1890ff" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* 涨跌分布 */}
                  <Card title="涨跌分布">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* 市场分析 */}
                  {marketAnalysis && marketAnalysis.avgPrice !== undefined && (
                    <Card title="市场分析" style={{ marginTop: 16 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text type="secondary">平均价格</Text>
                          <div>
                            <Text strong style={{ fontSize: 20 }}>
                              ¥{(marketAnalysis.avgPrice || 0).toLocaleString()}
                            </Text>
                          </div>
                        </div>
                        <div>
                          <Text type="secondary">价格区间</Text>
                          <div>
                            <Text>¥{marketAnalysis.priceRange?.min || 0} - ¥{marketAnalysis.priceRange?.max || 0}</Text>
                          </div>
                        </div>
                        <div>
                          <Text type="secondary">市场趋势</Text>
                          <div>
                            <Tag color={
                              marketAnalysis.forecast === 'bullish' ? 'red' : 
                              marketAnalysis.forecast === 'bearish' ? 'green' : 'blue'
                            }>
                              {marketAnalysis.forecast === 'bullish' ? '看涨' : 
                               marketAnalysis.forecast === 'bearish' ? '看跌' : '震荡'}
                            </Tag>
                          </div>
                        </div>
                        <Alert
                          message="采购建议"
                          description={marketAnalysis.recommendation}
                          type="info"
                          showIcon
                          icon={<InfoCircleOutlined />}
                        />
                      </Space>
                    </Card>
                  )}
                </Col>
              </Row>
            )
          }))}
        />
      </Card>

      {/* 材料详情弹窗 */}
      <Modal
        title="材料价格详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedMaterial && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="基本信息">
                  <Descriptions column={1}>
                    <Descriptions.Item label="材料名称">
                      {selectedMaterial.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="规格型号">
                      {selectedMaterial.specification}
                    </Descriptions.Item>
                    <Descriptions.Item label="计量单位">
                      {selectedMaterial.unit}
                    </Descriptions.Item>
                    <Descriptions.Item label="质量等级">
                      {selectedMaterial.quality}
                    </Descriptions.Item>
                    <Descriptions.Item label="供应商">
                      {selectedMaterial.supplier}
                    </Descriptions.Item>
                    <Descriptions.Item label="所在地区">
                      {selectedMaterial.city || selectedMaterial.province || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="价格信息">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Statistic
                      title="当前价格"
                      value={selectedMaterial.currentPrice}
                      prefix="¥"
                      valueStyle={{ color: '#1890ff' }}
                    />
                    <Statistic
                      title="昨日价格"
                      value={selectedMaterial.previousPrice}
                      prefix="¥"
                    />
                    <div>
                      <Text type="secondary">涨跌幅</Text>
                      <div>{renderPriceChange(selectedMaterial.changeRate, selectedMaterial.trend)}</div>
                    </div>
                    <div>
                      <Text type="secondary">更新时间</Text>
                      <div>{new Date(selectedMaterial.updateTime).toLocaleString('zh-CN')}</div>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
            
            <Card title="历史价格走势" style={{ marginTop: 16 }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={detailHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Area type="monotone" dataKey="price" stroke="#1890ff" fill="#1890ff" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

// 补充缺失的Descriptions组件
const Descriptions: any = ({ children, column }: any) => (
  <div className="descriptions">
    {children}
  </div>
);

Descriptions.Item = ({ label, children }: any) => (
  <div className="descriptions-item">
    <Text type="secondary">{label}:</Text> <Text strong>{children}</Text>
  </div>
);

export default MaterialPriceMonitor;