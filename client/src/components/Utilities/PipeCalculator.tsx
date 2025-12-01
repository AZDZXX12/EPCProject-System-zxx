import React, { useState } from 'react';
import { Card, Form, InputNumber, Select, Button, Table, message, Row, Col, Divider, Alert, Space, Statistic } from 'antd';
import { CalculatorOutlined, DashboardOutlined } from '@ant-design/icons';
import FormulaDisplay from './FormulaDisplay';

const { Option } = Select;

interface PipeResult {
  circleDiameter: number;
  rectangleWidth: number;
  rectangleHeight: number;
  circleResistance: number;
  rectangleResistance: number;
  fanPower: number;
  systemFlow: number;
  systemPressure: number;
}

const PipeCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipeResult | null>(null);

  const PI = 3.14159265358979;
  const rho = 1.2; // 空气密度 kg/m³
  const nu = 0.000015; // 空气运动粘度 m²/s
  const epsilon = 0.00015; // 管道粗糙度 m
  const K_bend = 0.3; // 弯头阻力系数

  // 计算圆形管道直径
  const calculateCircleDiameter = (Q: number, V: number): number => {
    const Q_m3s = Q / 3600;
    const A = Q_m3s / V;
    return Math.sqrt((4 * A) / PI);
  };

  // 计算矩形管道尺寸
  const calculateRectangleDimensions = (Q: number, V: number, aspectRatio: number = 4): { width: number; height: number } => {
    const Q_m3s = Q / 3600;
    const A = Q_m3s / V;
    const height = Math.sqrt(A / aspectRatio);
    const width = aspectRatio * height;
    return { width, height };
  };

  // 计算当量直径
  const calculateEquivalentDiameter = (width: number, height: number): number => {
    return (2 * width * height) / (width + height);
  };

  // 计算雷诺数
  const calculateReynoldsNumber = (V: number, D: number): number => {
    return (V * D) / nu;
  };

  // 计算摩擦系数 (Haaland公式)
  const calculateFrictionFactor = (Re: number, RelativeRoughness: number): number => {
    const term = Math.pow(RelativeRoughness / 3.7, 1.11) + 6.9 / Re;
    if (term <= 0) return 0.02;
    return 1 / Math.pow(-1.8 * Math.log10(term), 2);
  };

  // 计算沿程阻力
  const calculateLinearResistance = (f: number, L: number, D: number, V: number): number => {
    return f * (L / D) * (rho * Math.pow(V, 2) / 2);
  };

  // 计算局部阻力
  const calculateLocalResistance = (N: number, V: number): number => {
    return K_bend * N * (rho * Math.pow(V, 2) / 2);
  };

  // 计算总阻力
  const calculateTotalResistance = (L: number, Q: number, V: number, N: number, D: number): number => {
    const Re = calculateReynoldsNumber(V, D);
    const RelRough = epsilon / D;
    const f = calculateFrictionFactor(Re, RelRough);
    const deltaP_f = calculateLinearResistance(f, L, D, V);
    const deltaP_l = calculateLocalResistance(N, V);
    return deltaP_f + deltaP_l;
  };

  // 计算风机功率
  const calculateFanPower = (totalFlow: number, totalResistance: number, equipmentResistance: number) => {
    const airLeakageRate = 1.05;
    const dustAccumulationRate = 1.1;
    const safetyMargin = 1.15;
    const mechanicalEfficiency = 0.95;
    const fanEfficiency = 0.8;
    const safetyFactor = 1.3;

    const systemFlow = totalFlow * airLeakageRate;
    const systemPressure = totalResistance * dustAccumulationRate * safetyMargin + equipmentResistance;
    const fanPower = (systemFlow / (3600 * 1000 * mechanicalEfficiency * fanEfficiency)) * systemPressure * safetyFactor;

    return { systemFlow, systemPressure, fanPower };
  };

  const handleCalculate = async (values: any) => {
    setLoading(true);
    try {
      const { pipeLength, airFlow, airSpeed, bendCount, equipmentResistance } = values;

      // 计算圆形管道
      const circleDiameter = calculateCircleDiameter(airFlow, airSpeed);
      const circleResistance = calculateTotalResistance(pipeLength, airFlow, airSpeed, bendCount, circleDiameter);

      // 计算矩形管道
      const { width, height } = calculateRectangleDimensions(airFlow, airSpeed);
      const equivalentDiameter = calculateEquivalentDiameter(width, height);
      const rectangleResistance = calculateTotalResistance(pipeLength, airFlow, airSpeed, bendCount, equivalentDiameter);

      // 计算风机功率
      const { systemFlow, systemPressure, fanPower } = calculateFanPower(airFlow, circleResistance, equipmentResistance);

      setResult({
        circleDiameter: Math.round(circleDiameter * 1000 * 10) / 10,
        rectangleWidth: Math.round(width * 1000),
        rectangleHeight: Math.round(height * 1000),
        circleResistance: Math.round(circleResistance * 10) / 10,
        rectangleResistance: Math.round(rectangleResistance * 10) / 10,
        fanPower: Math.round(fanPower * 100) / 100,
        systemFlow: Math.round(systemFlow),
        systemPressure: Math.round(systemPressure),
      });

      message.success('计算完成');
    } catch (error) {
      message.error('计算失败，请检查输入参数');
    } finally {
      setLoading(false);
    }
  };

  const pipeFormulas = [
    {
      name: '圆形管道直径计算',
      formula: 'D = sqrt(4 × Q / (pi × V × 3600))',
      description: '根据风量和风速计算圆形管道直径',
      variables: [
        { symbol: 'D', name: '管道直径', unit: 'm' },
        { symbol: 'Q', name: '风量', unit: 'm³/h' },
        { symbol: 'V', name: '风速', unit: 'm/s' },
        { symbol: 'π', name: '圆周率', unit: '-' }
      ],
      example: '例：风量5000m³/h，风速12m/s\nD = √(4×5000/(π×12×3600)) = 0.332 m'
    },
    {
      name: '雷诺数计算',
      formula: 'Re = V × D / nu',
      description: '判断流动状态的无量纲数',
      variables: [
        { symbol: 'Re', name: '雷诺数', unit: '-' },
        { symbol: 'V', name: '流速', unit: 'm/s' },
        { symbol: 'D', name: '管径', unit: 'm' },
        { symbol: 'ν', name: '运动粘度', unit: 'm²/s' }
      ],
      example: '例：流速12m/s，管径0.332m，粘度1.5×10⁻⁵m²/s\nRe = 12×0.332/(1.5×10⁻⁵) = 265,600'
    },
    {
      name: '摩擦系数计算(Haaland公式)',
      formula: 'f = 1 / [-1.8 × log10((ε/D/3.7)^1.11 + 6.9/Re)]²',
      description: '计算管道摩擦系数，适用于湍流',
      variables: [
        { symbol: 'f', name: '摩擦系数', unit: '-' },
        { symbol: 'ε', name: '绝对粗糙度', unit: 'm' },
        { symbol: 'D', name: '管径', unit: 'm' },
        { symbol: 'Re', name: '雷诺数', unit: '-' }
      ],
      example: '例：钢管ε=0.045mm，D=332mm，Re=265,600\nf = 0.0185'
    },
    {
      name: '沿程阻力计算',
      formula: 'deltaP_f = f × (L/D) × (rho × V²/2)',
      description: '计算管道沿程摩擦阻力损失',
      variables: [
        { symbol: 'ΔP_f', name: '沿程阻力', unit: 'Pa' },
        { symbol: 'f', name: '摩擦系数', unit: '-' },
        { symbol: 'L', name: '管道长度', unit: 'm' },
        { symbol: 'D', name: '管径', unit: 'm' },
        { symbol: 'ρ', name: '空气密度', unit: 'kg/m³' },
        { symbol: 'V', name: '流速', unit: 'm/s' }
      ],
      example: '例：f=0.0185，L=100m，D=0.332m，ρ=1.2kg/m³，V=12m/s\nΔP_f = 0.0185×(100/0.332)×(1.2×12²/2) = 467 Pa'
    },
    {
      name: '局部阻力计算',
      formula: 'deltaP_l = K × N × (rho × V²/2)',
      description: '计算弯头、三通等局部阻力损失',
      variables: [
        { symbol: 'ΔP_l', name: '局部阻力', unit: 'Pa' },
        { symbol: 'K', name: '局部阻力系数', unit: '-' },
        { symbol: 'N', name: '局部件数量', unit: '个' },
        { symbol: 'ρ', name: '空气密度', unit: 'kg/m³' },
        { symbol: 'V', name: '流速', unit: 'm/s' }
      ],
      example: '例：弯头K=0.3，数量5个，ρ=1.2kg/m³，V=12m/s\nΔP_l = 0.3×5×(1.2×12²/2) = 129.6 Pa'
    },
    {
      name: '风机功率计算',
      formula: 'P = Q × deltaP_total / (3600 × eta_fan × eta_motor)',
      description: '计算风机所需轴功率',
      variables: [
        { symbol: 'P', name: '风机功率', unit: 'kW' },
        { symbol: 'Q', name: '风量', unit: 'm³/h' },
        { symbol: 'ΔP_total', name: '总阻力', unit: 'Pa' },
        { symbol: 'η_fan', name: '风机效率', unit: '-' },
        { symbol: 'η_motor', name: '电机效率', unit: '-' }
      ],
      example: '例：Q=5000m³/h，ΔP=600Pa，η_fan=0.8，η_motor=0.95\nP = 5000×600/(3600×0.8×0.95) = 1.10 kW'
    }
  ];

  const pipeConstants = [
    { name: '空气密度 (ρ)', value: '1.2 kg/m³', description: '标准状态下空气密度' },
    { name: '运动粘度 (ν)', value: '1.5×10⁻⁵ m²/s', description: '20℃空气运动粘度' },
    { name: '钢管粗糙度 (ε)', value: '0.045 mm', description: '普通钢管绝对粗糙度' },
    { name: '风机效率', value: '0.8', description: '离心风机典型效率' },
    { name: '电机效率', value: '0.95', description: '电机机械效率' },
    { name: '弯头阻力系数', value: '0.3', description: '90°弯头局部阻力系数' },
    { name: '漏风系数', value: '1.05', description: '系统漏风修正系数' },
    { name: '安全系数', value: '1.15', description: '设计安全裕量系数' }
  ];

  return (
    <Card
      title={<Space><DashboardOutlined style={{ color: '#13c2c2' }} />管道计算器</Space>}
      bordered
      style={{ marginBottom: 16 }}
    >
      <Alert
        message="功能说明"
        description="根据风量、风速、管道长度等参数，计算圆形和矩形管道尺寸、阻力损失及风机功率。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={24}>
        <Col xs={24} lg={10}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCalculate}
            initialValues={{
              pipeLength: 50,
              airFlow: 10000,
              airSpeed: 12,
              bendCount: 5,
              equipmentResistance: 500,
            }}
          >
            <Form.Item
              label="管道长度 (m)"
              name="pipeLength"
              rules={[{ required: true, message: '请输入管道长度' }]}
            >
              <InputNumber min={1} max={1000} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="风量 (m³/h)"
              name="airFlow"
              rules={[{ required: true, message: '请输入风量' }]}
            >
              <InputNumber min={100} max={100000} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="风速 (m/s)"
              name="airSpeed"
              rules={[{ required: true, message: '请输入风速' }]}
              tooltip="推荐范围：主管道12-15m/s，支管道8-12m/s"
            >
              <InputNumber min={5} max={25} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="弯头数量"
              name="bendCount"
              rules={[{ required: true, message: '请输入弯头数量' }]}
            >
              <InputNumber min={0} max={50} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="设备阻力 (Pa)"
              name="equipmentResistance"
              rules={[{ required: true, message: '请输入设备阻力' }]}
            >
              <InputNumber min={0} max={5000} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<CalculatorOutlined />}>
                开始计算
              </Button>
            </Form.Item>
          </Form>
        </Col>

        <Col xs={24} lg={14}>
          {result && (
            <>
              <Card title="管道尺寸" bordered style={{ marginBottom: 16, background: '#f0f9ff' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="圆形管道直径"
                      value={result.circleDiameter}
                      suffix="mm"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="圆管阻力"
                      value={result.circleResistance}
                      suffix="Pa"
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="矩形宽度"
                      value={result.rectangleWidth}
                      suffix="mm"
                      valueStyle={{ color: '#13c2c2' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="矩形高度"
                      value={result.rectangleHeight}
                      suffix="mm"
                      valueStyle={{ color: '#13c2c2' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="矩形阻力"
                      value={result.rectangleResistance}
                      suffix="Pa"
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                </Row>
              </Card>

              <Card title="风机参数" bordered style={{ background: '#e6fffb' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="系统风量"
                      value={result.systemFlow}
                      suffix="m³/h"
                      valueStyle={{ color: '#52c41a', fontWeight: 600 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="系统风压"
                      value={result.systemPressure}
                      suffix="Pa"
                      valueStyle={{ color: '#ff4d4f', fontWeight: 600 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="风机功率"
                      value={result.fanPower}
                      suffix="kW"
                      valueStyle={{ color: '#1890ff', fontWeight: 600, fontSize: 24 }}
                    />
                  </Col>
                </Row>
                <Divider />
                <Alert
                  message="计算说明"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>已考虑漏风率1.05、积尘系数1.1、安全余量1.15</li>
                      <li>风机效率按0.8计算，机械效率按0.95计算</li>
                      <li>矩形管道宽高比按4:1设计</li>
                      <li>建议选用功率略大于计算值的风机</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                />
              </Card>
            </>
          )}
        </Col>
      </Row>

      <FormulaDisplay
        title="管道计算公式"
        formulas={pipeFormulas}
        constants={pipeConstants}
      />
    </Card>
  );
};

export default PipeCalculator;
