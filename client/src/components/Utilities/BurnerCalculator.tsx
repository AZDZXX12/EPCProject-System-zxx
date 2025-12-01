import React, { useState } from 'react';
import { Form, InputNumber, Select, Button, Descriptions, message, Statistic, Divider, Card, Row, Col } from 'antd';
import { CalculatorOutlined, FireOutlined } from '@ant-design/icons';
import CalculatorLayout from './CalculatorLayout';
import FormulaDisplay from './FormulaDisplay';

const { Option } = Select;

interface BurnerResult {
  waterEvap: number;
  dryMaterial: number;
  evapHeat: number;
  materialHeat: number;
  totalHeat: number;
  biomassConsumption: number;
  gasConsumption: number;
  steamConsumption: number;
  burnerPower: number;
  recommendedModel: string;
}

const BurnerCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BurnerResult | null>(null);

  const handleCalculate = (values: any) => {
    setLoading(true);
    try {
      const { throughput, initialMoisture, targetMoisture, hotAirTemp, initialTemp, fuelType } = values;

      // 常量定义
      const SPECIFIC_HEAT = 0.3; // 物料比热 kcal/kg·℃
      const SYSTEM_EFFICIENCY = 0.6; // 系统热效率
      const WATER_EVAP_HEAT = 595; // 水蒸发潜热 kcal/kg
      const STEAM_HEAT_VALUE = 600; // 蒸汽热值 kcal/kg
      const BIOMASS_HEAT_VALUE = 4000; // 生物质热值 kcal/kg
      const GAS_HEAT_VALUE = 8500; // 天然气热值 kcal/m³

      // 单位转换 (吨/小时 → kg/h)
      const throughputKg = throughput * 1000;

      // 计算蒸发水量
      const waterEvap = throughputKg * ((initialMoisture / 100 - targetMoisture / 100) / (1 - targetMoisture / 100));

      // 计算干物料量
      const dryMaterial = throughputKg - waterEvap;

      // 计算蒸发水分所需热量 (Q1)
      const evapHeat = waterEvap * (WATER_EVAP_HEAT + 0.45 * hotAirTemp - initialTemp);

      // 计算加热物料所需热量 (Q2)
      const materialHeat = dryMaterial * SPECIFIC_HEAT * (hotAirTemp - initialTemp);

      // 计算总热负荷 (考虑热效率)
      const totalHeat = (evapHeat + materialHeat) / SYSTEM_EFFICIENCY;

      // 计算不同热源需求
      const biomassConsumption = totalHeat / BIOMASS_HEAT_VALUE;
      const gasConsumption = totalHeat / GAS_HEAT_VALUE;
      const steamConsumption = totalHeat / STEAM_HEAT_VALUE;

      // 计算燃烧器功率 (kW)
      const burnerPower = (totalHeat * 1.163) / 1000; // 1 kcal/h = 1.163 W

      // 推荐燃烧器型号
      let recommendedModel = '';
      if (burnerPower < 100) {
        recommendedModel = 'RG1-100 (小型燃烧器)';
      } else if (burnerPower < 300) {
        recommendedModel = 'RG2-300 (中型燃烧器)';
      } else if (burnerPower < 600) {
        recommendedModel = 'RG3-600 (大型燃烧器)';
      } else if (burnerPower < 1200) {
        recommendedModel = 'RG4-1200 (超大型燃烧器)';
      } else {
        recommendedModel = 'RG5-2000+ (工业级燃烧器，建议多台并联)';
      }

      setResult({
        waterEvap: Math.round(waterEvap * 10) / 10,
        dryMaterial: Math.round(dryMaterial * 10) / 10,
        evapHeat: Math.round(evapHeat),
        materialHeat: Math.round(materialHeat),
        totalHeat: Math.round(totalHeat),
        biomassConsumption: Math.round(biomassConsumption * 10) / 10,
        gasConsumption: Math.round(gasConsumption * 10) / 10,
        steamConsumption: Math.round(steamConsumption * 10) / 10,
        burnerPower: Math.round(burnerPower * 10) / 10,
        recommendedModel,
      });

      message.success('计算完成');
    } catch (error) {
      message.error('计算失败，请检查输入参数');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleCalculate}
      initialValues={{
        throughput: 5,
        initialMoisture: 15,
        targetMoisture: 1,
        hotAirTemp: 180,
        initialTemp: 20,
        fuelType: 'gas',
      }}
    >
      <Form.Item
        label="物料处理量 (吨/小时)"
        name="throughput"
        rules={[{ required: true, message: '请输入处理量' }]}
      >
        <InputNumber min={0.1} max={100} step={0.1} className="calculator-input" />
      </Form.Item>

      <Form.Item
        label="初始水分 (%)"
        name="initialMoisture"
        rules={[{ required: true, message: '请输入初始水分' }]}
        tooltip="物料初始含水率"
      >
        <InputNumber min={0} max={90} step={0.1} className="calculator-input" />
      </Form.Item>

      <Form.Item
        label="目标水分 (%)"
        name="targetMoisture"
        rules={[{ required: true, message: '请输入目标水分' }]}
        tooltip="烘干后目标含水率"
      >
        <InputNumber min={0} max={50} step={0.1} className="calculator-input" />
      </Form.Item>

      <Form.Item
        label="热风温度 (℃)"
        name="hotAirTemp"
        rules={[{ required: true, message: '请输入热风温度' }]}
        tooltip="建议范围：100-300℃"
      >
        <InputNumber min={100} max={300} className="calculator-input" />
      </Form.Item>

      <Form.Item
        label="初始温度 (℃)"
        name="initialTemp"
        rules={[{ required: true, message: '请输入初始温度' }]}
      >
        <InputNumber min={-20} max={50} className="calculator-input" />
      </Form.Item>

      <Form.Item
        label="燃料类型"
        name="fuelType"
        rules={[{ required: true, message: '请选择燃料类型' }]}
      >
        <Select className="calculator-input">
          <Option value="gas">天然气 (8500 kcal/m³)</Option>
          <Option value="biomass">生物质 (4000 kcal/kg)</Option>
          <Option value="steam">蒸汽 (600 kcal/kg)</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block icon={<CalculatorOutlined />}>
          开始计算
        </Button>
      </Form.Item>
    </Form>
  );

  const resultContent = result ? (
    <>
      <Card title="热负荷计算" bordered className="result-card-warning">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="蒸发水量"
              value={result.waterEvap}
              suffix="kg/h"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="干物料量"
              value={result.dryMaterial}
              suffix="kg/h"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="总热负荷"
              value={result.totalHeat.toLocaleString()}
              suffix="kcal/h"
              valueStyle={{ color: '#ff4d4f', fontWeight: 600 }}
            />
          </Col>
        </Row>
        <Divider />
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="蒸发热量">{result.evapHeat.toLocaleString()} kcal/h</Descriptions.Item>
          <Descriptions.Item label="物料加热">{result.materialHeat.toLocaleString()} kcal/h</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="燃料消耗" bordered className="result-card-success">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="天然气"
              value={result.gasConsumption}
              suffix="m³/h"
              valueStyle={{ color: '#faad14', fontWeight: 600 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="生物质"
              value={result.biomassConsumption}
              suffix="kg/h"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="蒸汽"
              value={result.steamConsumption}
              suffix="kg/h"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
      </Card>

      <Card title="燃烧器选型" bordered className="result-card-primary">
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="所需功率"
              value={result.burnerPower}
              suffix="kW"
              valueStyle={{ color: '#ff4d4f', fontWeight: 600, fontSize: 24 }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="推荐型号"
              value={result.recommendedModel}
              valueStyle={{ fontSize: 16, color: '#1890ff' }}
            />
          </Col>
        </Row>
      </Card>
    </>
  ) : undefined;

  const burnerFormulas = [
    {
      name: '蒸发水量计算',
      formula: 'W_evap = G × (M1 - M2) / (1 - M2)',
      description: '根据物料处理量和水分变化计算需要蒸发的水量',
      variables: [
        { symbol: 'W_evap', name: '蒸发水量', unit: 'kg/h' },
        { symbol: 'G', name: '物料处理量', unit: 't/h' },
        { symbol: 'M1', name: '初始水分', unit: '%' },
        { symbol: 'M2', name: '目标水分', unit: '%' }
      ],
      example: '例：处理量5t/h，初始水分15%，目标水分1%\nW_evap = 5000 × (0.15 - 0.01) / (1 - 0.01) = 707.1 kg/h'
    },
    {
      name: '蒸发热量计算',
      formula: 'Q_evap = W_evap × [L + C_w × (T_hot - T_init)]',
      description: '计算蒸发水分所需的热量，包括汽化潜热和加热显热',
      variables: [
        { symbol: 'Q_evap', name: '蒸发热量', unit: 'kcal/h' },
        { symbol: 'W_evap', name: '蒸发水量', unit: 'kg/h' },
        { symbol: 'L', name: '汽化潜热', unit: 'kcal/kg' },
        { symbol: 'C_w', name: '水的比热', unit: 'kcal/kg·℃' },
        { symbol: 'T_hot', name: '热风温度', unit: '℃' },
        { symbol: 'T_init', name: '初始温度', unit: '℃' }
      ],
      example: '例：蒸发水量707.1kg/h，热风180℃，初始20℃\nQ_evap = 707.1 × [595 + 1.0 × (180 - 20)] = 533,425 kcal/h'
    },
    {
      name: '物料加热热量',
      formula: 'Q_material = G_dry × C_p × (T_hot - T_init)',
      description: '计算干物料从初始温度加热到热风温度所需的热量',
      variables: [
        { symbol: 'Q_material', name: '物料加热热量', unit: 'kcal/h' },
        { symbol: 'G_dry', name: '干物料量', unit: 'kg/h' },
        { symbol: 'C_p', name: '物料比热', unit: 'kcal/kg·℃' },
        { symbol: 'T_hot', name: '热风温度', unit: '℃' },
        { symbol: 'T_init', name: '初始温度', unit: '℃' }
      ],
      example: '例：干物料4293kg/h，比热0.3kcal/kg·℃\nQ_material = 4293 × 0.3 × (180 - 20) = 206,064 kcal/h'
    },
    {
      name: '总热负荷计算',
      formula: 'Q_total = (Q_evap + Q_material) / η',
      description: '考虑系统热效率的总热负荷计算',
      variables: [
        { symbol: 'Q_total', name: '总热负荷', unit: 'kcal/h' },
        { symbol: 'Q_evap', name: '蒸发热量', unit: 'kcal/h' },
        { symbol: 'Q_material', name: '物料加热热量', unit: 'kcal/h' },
        { symbol: 'η', name: '系统热效率', unit: '-' }
      ],
      example: '例：蒸发热量533,425 + 物料加热206,064，效率60%\nQ_total = (533,425 + 206,064) / 0.6 = 1,232,481 kcal/h'
    },
    {
      name: '燃料消耗计算',
      formula: 'V_fuel = Q_total / H_fuel',
      description: '根据总热负荷和燃料热值计算燃料消耗量',
      variables: [
        { symbol: 'V_fuel', name: '燃料消耗量', unit: 'm³/h或kg/h' },
        { symbol: 'Q_total', name: '总热负荷', unit: 'kcal/h' },
        { symbol: 'H_fuel', name: '燃料热值', unit: 'kcal/m³或kcal/kg' }
      ],
      example: '例：总热负荷1,232,481 kcal/h，天然气热值8500 kcal/m³\nV_fuel = 1,232,481 / 8500 = 145.0 m³/h'
    }
  ];

  const burnerConstants = [
    { name: '汽化潜热 (L)', value: '595 kcal/kg', description: '水在100℃时的汽化潜热' },
    { name: '水的比热 (C_w)', value: '1.0 kcal/kg·℃', description: '液态水的比热容' },
    { name: '物料比热 (C_p)', value: '0.3 kcal/kg·℃', description: '一般有机物料的比热容' },
    { name: '系统热效率 (η)', value: '60%', description: '烘干系统的综合热效率' },
    { name: '天然气热值', value: '8500 kcal/m³', description: '标准工况下天然气低位热值' },
    { name: '生物质热值', value: '4000 kcal/kg', description: '干燥生物质燃料热值' },
    { name: '蒸汽热值', value: '600 kcal/kg', description: '饱和蒸汽的有效热值' }
  ];

  const formulaContent = (
    <FormulaDisplay
      title="燃烧器选型计算公式"
      formulas={burnerFormulas}
      constants={burnerConstants}
    />
  );

  const tips = [
    '系统热效率按60%计算，实际需根据设备调整',
    '物料比热按0.3 kcal/kg·℃计算',
    '建议选择功率略大于计算值的燃烧器',
    '天然气热值按8500 kcal/m³计算（标准工况）',
    '大功率需求建议采用多台燃烧器并联运行'
  ];

  return (
    <CalculatorLayout
      title="天然气燃烧器选型计算器"
      icon={<FireOutlined />}
      iconColor="#ff4d4f"
      description="根据物料吨位、水分含量、目标温度等参数，计算热负荷、燃料消耗量，并推荐合适的燃烧器型号。"
      formContent={formContent}
      resultContent={resultContent}
      formulaContent={formulaContent}
      tips={tips}
    />
  );
};

export default BurnerCalculator;
