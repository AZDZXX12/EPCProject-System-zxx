import React, { useState } from 'react';
import { Card, Row, Col, Tabs, Input, InputNumber, Select, Button, Space, Divider, Statistic, message } from 'antd';
import { CalculatorOutlined, SwapOutlined, FileTextOutlined, LinkOutlined, DollarOutlined, ClockCircleOutlined, ToolOutlined } from '@ant-design/icons';
import './EnhancedUtilities.css';
import ProfilePlateCalculator from '../components/Utilities/ProfilePlateCalculator';
import CableCalculator from '../components/Utilities/CableCalculator';
import PipeCalculator from '../components/Utilities/PipeCalculator';
import LadderCalculator from '../components/Utilities/LadderCalculator';
import StairCalculator from '../components/Utilities/StairCalculator';
import PlatformCalculator from '../components/Utilities/PlatformCalculator';
import GuardrailCalculator from '../components/Utilities/GuardrailCalculator';
import BurnerCalculator from '../components/Utilities/BurnerCalculator';
import CycloneCalculator from '../components/Utilities/CycloneCalculator';
import BeltSupportCalculator from '../components/Utilities/BeltSupportCalculator';
const { TextArea } = Input;

const EnhancedUtilities: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  // 材料计算器状态
  const [materialType, setMaterialType] = useState('concrete');
  const [volume, setVolume] = useState(0);
  const [materialResult, setMaterialResult] = useState<any>(null);

  // 成本估算器状态
  const [laborCost, setLaborCost] = useState(0);
  const [materialCost, setMaterialCost] = useState(0);
  const [equipmentCost, setEquipmentCost] = useState(0);
  const [contingency, setContingency] = useState(10);

  // 工期计算器状态
  const [totalTasks, setTotalTasks] = useState(0);
  const [avgDuration, setAvgDuration] = useState(0);
  const [parallelism, setParallelism] = useState(1);

  // 单位转换器状态
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [inputValue, setInputValue] = useState(0);
  const [convertedValue, setConvertedValue] = useState(0);

  // 汇率转换器状态
  const [fromCurrency, setFromCurrency] = useState('CNY');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState(0);
  const [exchangeResult, setExchangeResult] = useState(0);

  // 材料计算
  const calculateMaterial = () => {
    const materials: any = {
      concrete: { name: '混凝土', ratio: 2400, unit: 'kg/m³', cement: 350, sand: 700, gravel: 1100, water: 180 },
      steel: { name: '钢筋', ratio: 7850, unit: 'kg/m³', weight: volume * 7850 },
      brick: { name: '砖', ratio: 1800, unit: 'kg/m³', count: Math.ceil(volume * 512) },
    };
    setMaterialResult(materials[materialType]);
    messageApi.success('计算完成');
  };

  // 成本估算
  const calculateCost = () => {
    const total = laborCost + materialCost + equipmentCost;
    const contingencyAmount = total * (contingency / 100);
    return {
      subtotal: total,
      contingency: contingencyAmount,
      total: total + contingencyAmount,
    };
  };

  // 工期计算
  const calculateDuration = () => {
    if (parallelism === 0) return 0;
    return Math.ceil(totalTasks * avgDuration / parallelism);
  };

  // 单位转换
  const convertUnit = () => {
    const conversions: any = {
      m_ft: 3.28084,
      ft_m: 0.3048,
      kg_lb: 2.20462,
      lb_kg: 0.453592,
      m2_ft2: 10.7639,
      ft2_m2: 0.092903,
    };
    const key = `${fromUnit}_${toUnit}`;
    const result = inputValue * (conversions[key] || 1);
    setConvertedValue(parseFloat(result.toFixed(4)));
    messageApi.success('转换完成');
  };

  // 汇率转换
  const convertCurrency = () => {
    const rates: any = {
      CNY_USD: 0.14,
      USD_CNY: 7.2,
      CNY_EUR: 0.13,
      EUR_CNY: 7.8,
      USD_EUR: 0.92,
      EUR_USD: 1.09,
    };
    const key = `${fromCurrency}_${toCurrency}`;
    const result = amount * (rates[key] || 1);
    setExchangeResult(parseFloat(result.toFixed(2)));
    messageApi.success('转换完成');
  };

  const costEstimate = calculateCost();

  return (
    <div className="eu-container">
      {contextHolder}
      <div className="eu-header">
        <h1 className="eu-title">实用工具</h1>
        <p className="eu-subtitle">工程计算、单位转换、快速估算工具集</p>
      </div>

      <Tabs
        defaultActiveKey="profilePlate"
        tabPosition="left"
        items={[
          // 材料优化类
          {
            label: '📦 型材/板材优化',
            key: 'profilePlate',
            children: (<ProfilePlateCalculator />),
          },
          // 电气设计类
          {
            label: '⚡ 电缆选型',
            key: 'cable',
            children: (<CableCalculator />),
          },
          // 通风除尘类
          {
            label: '💨 管道计算',
            key: 'pipe',
            children: (<PipeCalculator />),
          },
          {
            label: '🌪️ 旋风除尘器',
            key: 'cyclone',
            children: (<CycloneCalculator />),
          },
          // 热源设备类
          {
            label: '🔥 燃烧器选型',
            key: 'burner',
            children: (<BurnerCalculator />),
          },
          // 钢结构类
          {
            label: '🪜 爬梯计算',
            key: 'ladder',
            children: (<LadderCalculator />),
          },
          {
            label: '🪜 楼梯计算',
            key: 'stair',
            children: (<StairCalculator />),
          },
          {
            label: '🏗️ 平台计算',
            key: 'platform',
            children: (<PlatformCalculator />),
          },
          {
            label: '🛡️ 护栏计算',
            key: 'guardrail',
            children: (<GuardrailCalculator />),
          },
          {
            label: '🏗️ 皮带支架',
            key: 'beltSupport',
            children: (<BeltSupportCalculator />),
          },
          // 基础工具类
          {
            label: '🧮 材料计算',
            key: 'calculator',
            children: (
              <Card>
                <Space direction="vertical" className="eu-full-width" size="large">
                  <Row gutter={16}>
                    <Col span={8}>
                      <label>材料类型：</label>
                      <Select value={materialType} onChange={setMaterialType} className="eu-full-width">
                        <Select.Option value="concrete">混凝土</Select.Option>
                        <Select.Option value="steel">钢筋</Select.Option>
                        <Select.Option value="brick">砖</Select.Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <label>体积（m³）：</label>
                      <InputNumber min={0} value={volume} onChange={(v) => setVolume(v || 0)} className="eu-full-width" />
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                      <Button type="primary" onClick={calculateMaterial} block icon={<CalculatorOutlined />}>开始计算</Button>
                    </Col>
                  </Row>
                  {materialResult && (
                    <Card size="small" title="计算结果" className="eu-result-card">
                      <Row gutter={[16, 16]}>
                        <Col span={6}><Statistic title="材料名称" value={materialResult.name} /></Col>
                        <Col span={6}><Statistic title="密度" value={materialResult.ratio} suffix={materialResult.unit} /></Col>
                        {materialResult.cement && (
                          <>
                            <Col span={6}><Statistic title="水泥" value={materialResult.cement * volume} suffix="kg" /></Col>
                            <Col span={6}><Statistic title="砂" value={materialResult.sand * volume} suffix="kg" /></Col>
                          </>
                        )}
                      </Row>
                    </Card>
                  )}
                </Space>
              </Card>
            ),
          },
          {
            label: '💰 成本估算',
            key: 'cost',
            children: (
              <Card>
                <Space direction="vertical" className="eu-full-width" size="large">
                  <Row gutter={16}>
                    <Col span={8}>
                      <label>人工费（元）：</label>
                      <InputNumber min={0} value={laborCost} onChange={(v) => setLaborCost(v || 0)} className="eu-full-width" />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <label>材料费（元）：</label>
                      <InputNumber min={0} value={materialCost} onChange={(v) => setMaterialCost(v || 0)} className="eu-full-width" />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <label>设备费（元）：</label>
                      <InputNumber min={0} value={equipmentCost} onChange={(v) => setEquipmentCost(v || 0)} className="eu-full-width" />
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <label>不可预见费（%）：</label>
                      <InputNumber min={0} max={100} value={contingency} onChange={(v) => setContingency(v || 0)} className="eu-full-width" />
                    </Col>
                  </Row>
                  <Divider />
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8}>
                      <Card size="small" bordered className="eu-stat-card">
                        <Statistic title="小计" value={costEstimate.subtotal} precision={2} suffix="元" />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" bordered className="eu-stat-card">
                        <Statistic title="不可预见费" value={costEstimate.contingency} precision={2} suffix="元" valueStyle={{ color: '#faad14' }} />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small" bordered className="eu-stat-card eu-stat-highlight">
                        <Statistic title="总计" value={costEstimate.total} precision={2} suffix="元" valueStyle={{ color: '#52c41a', fontWeight: 600, fontSize: 24 }} />
                      </Card>
                    </Col>
                  </Row>
                </Space>
              </Card>
            ),
          },
          {
            label: '⏱️ 工期计算',
            key: 'duration',
            children: (
              <Card>
                <Space direction="vertical" className="eu-full-width" size="large">
                  <Row gutter={16}>
                    <Col span={8}>
                      <label>任务总数：</label>
                      <InputNumber min={0} value={totalTasks} onChange={(v) => setTotalTasks(v || 0)} className="eu-full-width" />
                    </Col>
                    <Col xs={24} sm={8}>
                      <label>平均工期（天）：</label>
                      <InputNumber min={0} value={avgDuration} onChange={(v) => setAvgDuration(v || 0)} className="eu-full-width" />
                    </Col>
                    <Col xs={24} sm={8}>
                      <label>并行度：</label>
                      <InputNumber min={1} value={parallelism} onChange={(v) => setParallelism(v || 1)} className="eu-full-width" />
                    </Col>
                  </Row>
                  <Divider />
                  <Card size="small" bordered className="eu-stat-card eu-stat-highlight">
                    <Statistic title="预计总工期" value={calculateDuration()} suffix="天" valueStyle={{ color: '#1890ff', fontWeight: 600, fontSize: 32 }} />
                  </Card>
                </Space>
              </Card>
            ),
          },
          {
            label: '🔄 单位转换',
            key: 'unit',
            children: (
              <Card>
                <Space direction="vertical" className="eu-full-width" size="large">
                  <Row gutter={16}>
                    <Col span={8}>
                      <label>原始单位：</label>
                      <Select value={fromUnit} onChange={setFromUnit} className="eu-full-width">
                        <Select.Option value="m">米 (m)</Select.Option>
                        <Select.Option value="ft">英尺 (ft)</Select.Option>
                        <Select.Option value="kg">千克 (kg)</Select.Option>
                        <Select.Option value="lb">磅 (lb)</Select.Option>
                        <Select.Option value="m2">平方米 (m²)</Select.Option>
                        <Select.Option value="ft2">平方英尺 (ft²)</Select.Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={8}>
                      <label>目标单位：</label>
                      <Select value={toUnit} onChange={setToUnit} className="eu-full-width">
                        <Select.Option value="m">米 (m)</Select.Option>
                        <Select.Option value="ft">英尺 (ft)</Select.Option>
                        <Select.Option value="kg">千克 (kg)</Select.Option>
                        <Select.Option value="lb">磅 (lb)</Select.Option>
                        <Select.Option value="m2">平方米 (m²)</Select.Option>
                        <Select.Option value="ft2">平方英尺 (ft²)</Select.Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={8}>
                      <label>输入值：</label>
                      <InputNumber value={inputValue} onChange={(v) => setInputValue(v || 0)} className="eu-full-width" />
                    </Col>
                  </Row>
                  <Button type="primary" onClick={convertUnit} block icon={<SwapOutlined />}>开始转换</Button>
                  {convertedValue > 0 && (
                    <Card size="small" bordered className="eu-result-card">
                      <Statistic title="转换结果" value={convertedValue} suffix={toUnit} valueStyle={{ color: '#52c41a', fontWeight: 600, fontSize: 24 }} />
                    </Card>
                  )}
                </Space>
              </Card>
            ),
          },
          {
            label: '💱 汇率转换',
            key: 'currency',
            children: (
              <Card>
                <Space direction="vertical" className="eu-full-width" size="large">
                  <Row gutter={16}>
                    <Col span={8}>
                      <label>原始货币：</label>
                      <Select value={fromCurrency} onChange={setFromCurrency} className="eu-full-width">
                        <Select.Option value="CNY">人民币 (CNY)</Select.Option>
                        <Select.Option value="USD">美元 (USD)</Select.Option>
                        <Select.Option value="EUR">欧元 (EUR)</Select.Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={8}>
                      <label>目标货币：</label>
                      <Select value={toCurrency} onChange={setToCurrency} className="eu-full-width">
                        <Select.Option value="CNY">人民币 (CNY)</Select.Option>
                        <Select.Option value="USD">美元 (USD)</Select.Option>
                        <Select.Option value="EUR">欧元 (EUR)</Select.Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={8}>
                      <label>金额：</label>
                      <InputNumber value={amount} onChange={(v) => setAmount(v || 0)} className="eu-full-width" />
                    </Col>
                  </Row>
                  <Button type="primary" onClick={convertCurrency} block icon={<DollarOutlined />}>开始转换</Button>
                  {exchangeResult > 0 && (
                    <Card size="small" bordered className="eu-result-card">
                      <Statistic title="转换结果" value={exchangeResult} prefix={toCurrency} valueStyle={{ color: '#1890ff', fontWeight: 600, fontSize: 24 }} />
                    </Card>
                  )}
                </Space>
              </Card>
            ),
          },
          {
            label: '📄 文档模板',
            key: 'templates',
            children: (
              <Card bordered className="eu-tool-card">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <Card hoverable className="eu-template-card">
                      <h3>项目方案模板</h3>
                      <p>标准项目实施方案文档</p>
                      <Button type="primary" block>下载</Button>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card hoverable>
                      <h3>技术交底模板</h3>
                      <p>施工技术交底记录表</p>
                      <Button type="primary" block>下载</Button>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card hoverable>
                      <h3>验收报告模板</h3>
                      <p>工程验收报告标准格式</p>
                      <Button type="primary" block>下载</Button>
                    </Card>
                  </Col>
                </Row>
              </Card>
            ),
          },
          {
            label: '🔗 常用链接',
            key: 'links',
            children: (
              <Card bordered className="eu-tool-card">
                <Row gutter={[16, 16]}>
                  {[
                    { name: '国家标准全文公开系统', url: 'http://www.gb688.cn/bzgk/gb/' },
                    { name: '中国电力企业联合会', url: 'https://www.cec.org.cn/' },
                    { name: '中国建筑标准设计网', url: 'https://www.chinabuilding.com.cn/' },
                    { name: '工程建设标准化', url: 'http://www.ccsn.org.cn/' },
                  ].map((link) => (
                    <Col span={12} key={link.name}>
                      <Card hoverable size="small">
                        <Space>
                          <LinkOutlined className="eu-link-icon" />
                          <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default EnhancedUtilities;
