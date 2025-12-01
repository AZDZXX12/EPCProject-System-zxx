import React, { useState } from 'react';
import { Form, InputNumber, Button, Descriptions, message, Row, Col, Statistic, Divider, Card } from 'antd';
import { CalculatorOutlined, CloudOutlined } from '@ant-design/icons';
import CalculatorLayout from './CalculatorLayout';
import FormulaDisplay from './FormulaDisplay';

interface CycloneResult {
  inletHeight: number;
  inletWidth: number;
  cylinderDiameter: number;
  outletDiameter: number;
  outletInsertionDepth: number;
  straightSectionHeight: number;
  coneHeight: number;
  dustOutletDiameter: number;
  pressureLoss: number;
}

const CycloneCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState<CycloneResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (values: any) => {
    setLoading(true);
    try {
      const {
        inletAirflow,
        inletVelocity,
        cylinderLengthRatio,
        coneLengthRatio,
        outletDiameterRatio,
        innerCylinderLengthRatio,
        inletHeightRatio,
        dustOutletRatio,
        inletWidthRatio,
      } = values;

      // 计算进口面积 (m²)
      const inletArea = inletAirflow / (inletVelocity * 3600);
      
      // 计算进口高度 (mm)
      const inletHeight = Math.sqrt(inletArea / inletWidthRatio) * 1000;
      
      // 计算进口宽度 (mm)
      const inletWidth = inletHeight * inletWidthRatio;
      
      // 计算筒体直径 (mm)
      const cylinderDiameter = inletHeight / inletHeightRatio;
      
      // 计算其他尺寸
      const outletDiameter = cylinderDiameter * outletDiameterRatio;
      const outletInsertionDepth = cylinderDiameter * innerCylinderLengthRatio;
      const straightSectionHeight = cylinderDiameter * cylinderLengthRatio;
      const coneHeight = cylinderDiameter * coneLengthRatio;
      const dustOutletDiameter = cylinderDiameter * dustOutletRatio;

      // 计算压力损失 (Pa)
      const airDensity = 1.2; // kg/m³
      const resistanceCoefficient = 16 * (inletArea / (Math.PI * Math.pow(outletDiameter / 2000, 2)));
      const pressureLoss = resistanceCoefficient * airDensity * Math.pow(inletVelocity, 2) / 2;

      setResult({
        inletHeight: Math.round(inletHeight),
        inletWidth: Math.round(inletWidth),
        cylinderDiameter: Math.round(cylinderDiameter),
        outletDiameter: Math.round(outletDiameter),
        outletInsertionDepth: Math.round(outletInsertionDepth),
        straightSectionHeight: Math.round(straightSectionHeight),
        coneHeight: Math.round(coneHeight),
        dustOutletDiameter: Math.round(dustOutletDiameter),
        pressureLoss: Math.round(pressureLoss),
      });

      message.success('计算完成');
    } catch (error) {
      message.error('计算失败，请检查输入参数');
    } finally {
      setLoading(false);
    }
  };

  const cycloneFormulas = [
    {
      name: '进口面积计算',
      formula: 'A_inlet = Q / (V_inlet × 3600)',
      description: '根据进口风量和风速计算进口截面积',
      variables: [
        { symbol: 'A_inlet', name: '进口面积', unit: 'm²' },
        { symbol: 'Q', name: '进口风量', unit: 'm³/h' },
        { symbol: 'V_inlet', name: '进口风速', unit: 'm/s' }
      ],
      example: '例：风量10000m³/h，风速18m/s\nA_inlet = 10000 / (18 × 3600) = 0.154 m²'
    },
    {
      name: '进口高度计算',
      formula: 'H_inlet = sqrt(A_inlet / R_width) × 1000',
      description: '根据进口面积和宽高比计算进口高度',
      variables: [
        { symbol: 'H_inlet', name: '进口高度', unit: 'mm' },
        { symbol: 'A_inlet', name: '进口面积', unit: 'm²' },
        { symbol: 'R_width', name: '宽高比', unit: '-' }
      ],
      example: '例：进口面积0.154m²，宽高比0.5\nH_inlet = √(0.154 / 0.5) × 1000 = 555 mm'
    },
    {
      name: '筒体直径计算',
      formula: 'D_cylinder = H_inlet / R_height',
      description: '根据进口高度和高径比计算筒体直径',
      variables: [
        { symbol: 'D_cylinder', name: '筒体直径', unit: 'mm' },
        { symbol: 'H_inlet', name: '进口高度', unit: 'mm' },
        { symbol: 'R_height', name: '高径比', unit: '-' }
      ],
      example: '例：进口高度555mm，高径比0.5\nD_cylinder = 555 / 0.5 = 1110 mm'
    },
    {
      name: '压力损失计算',
      formula: 'deltaP = K × rho × V_inlet² / 2',
      description: '根据阻力系数和进口风速计算压力损失',
      variables: [
        { symbol: 'ΔP', name: '压力损失', unit: 'Pa' },
        { symbol: 'K', name: '阻力系数', unit: '-' },
        { symbol: 'ρ', name: '空气密度', unit: 'kg/m³' },
        { symbol: 'V_inlet', name: '进口风速', unit: 'm/s' }
      ],
      example: '例：阻力系数8.0，空气密度1.2kg/m³，风速18m/s\nΔP = 8.0 × 1.2 × 18² / 2 = 1555 Pa'
    }
  ];

  const cycloneConstants = [
    { name: '空气密度 (ρ)', value: '1.2 kg/m³', description: '标准状态下空气密度' },
    { name: '进口宽高比', value: '0.5', description: '标准旋风器进口宽高比' },
    { name: '出口直径比', value: '0.5', description: '出口直径与筒体直径比' },
    { name: '筒体长度比', value: '2.0', description: '筒体长度与直径比' },
    { name: '锥体长度比', value: '2.0', description: '锥体长度与直径比' },
    { name: '排灰口直径比', value: '0.25', description: '排灰口与筒体直径比' },
    { name: '阻力系数范围', value: '6-10', description: '典型旋风器阻力系数' }
  ];

  const formulaContent = (
    <FormulaDisplay
      title="旋风除尘器设计计算公式"
      formulas={cycloneFormulas}
      constants={cycloneConstants}
    />
  );

  const formContent = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleCalculate}
      initialValues={{
        inletAirflow: 10000,
        inletVelocity: 18,
        cylinderLengthRatio: 2,
        coneLengthRatio: 2,
        outletDiameterRatio: 0.5,
        innerCylinderLengthRatio: 0.25,
        inletHeightRatio: 0.5,
        dustOutletRatio: 0.25,
        inletWidthRatio: 0.5,
      }}
    >
      <Form.Item
        label="进口风量 (m³/h)"
        name="inletAirflow"
        rules={[{ required: true, message: '请输入进口风量' }]}
      >
        <InputNumber min={1000} max={100000} className="calculator-input" />
      </Form.Item>

      <Form.Item
        label="进口风速 (m/s)"
        name="inletVelocity"
        rules={[{ required: true, message: '请输入进口风速' }]}
        tooltip="建议范围：15-25 m/s"
      >
        <InputNumber min={10} max={30} className="calculator-input" />
      </Form.Item>

      <Divider orientation="left">比例参数</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="筒体长/筒径"
            name="cylinderLengthRatio"
            tooltip="建议范围：1.5-4"
          >
            <InputNumber min={1.5} max={4} step={0.1} className="calculator-input" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="锥体长/筒径"
            name="coneLengthRatio"
            tooltip="建议范围：1.5-4"
          >
            <InputNumber min={1.5} max={4} step={0.1} className="calculator-input" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="出口径/筒径"
            name="outletDiameterRatio"
            tooltip="建议范围：0.4-0.7"
          >
            <InputNumber min={0.4} max={0.7} step={0.05} className="calculator-input" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="内筒长/筒径"
            name="innerCylinderLengthRatio"
          >
            <InputNumber min={0.2} max={0.5} step={0.05} className="calculator-input" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="入口高/筒径"
            name="inletHeightRatio"
          >
            <InputNumber min={0.3} max={0.7} step={0.05} className="calculator-input" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="灰口径/筒径"
            name="dustOutletRatio"
          >
            <InputNumber min={0.2} max={0.4} step={0.05} className="calculator-input" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="入口宽/入口高"
        name="inletWidthRatio"
      >
        <InputNumber min={0.3} max={0.7} step={0.05} className="calculator-input" />
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
      <Card title="进口参数" bordered className="result-card-primary">
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="进口高度">{result.inletHeight} mm</Descriptions.Item>
          <Descriptions.Item label="进口宽度">{result.inletWidth} mm</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="筒体参数" bordered className="result-card-info">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="筒体直径"
              value={result.cylinderDiameter}
              suffix="mm"
              valueStyle={{ color: '#1890ff', fontWeight: 600 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="直段高度"
              value={result.straightSectionHeight}
              suffix="mm"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="锥体高度"
              value={result.coneHeight}
              suffix="mm"
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
        </Row>
        <Divider />
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="出口直径">{result.outletDiameter} mm</Descriptions.Item>
          <Descriptions.Item label="插入深度">{result.outletInsertionDepth} mm</Descriptions.Item>
          <Descriptions.Item label="排灰口直径">{result.dustOutletDiameter} mm</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="性能参数" bordered className="result-card-warning">
        <Statistic
          title="压力损失"
          value={result.pressureLoss}
          suffix="Pa"
          valueStyle={{ color: '#ff4d4f', fontWeight: 600, fontSize: 24 }}
        />
      </Card>
    </>
  ) : undefined;

  const tips = [
    '进口风速建议范围：15-25 m/s',
    '筒体直径根据进口高度和标准比例确定',
    '压力损失按标准阻力系数8.0计算',
    '所有尺寸按标准旋风器比例参数设计',
    '适用于一般工业除尘，分离粒径≥10μm'
  ];

  return (
    <CalculatorLayout
      title="旋风除尘器计算器"
      icon={<CloudOutlined />}
      iconColor="#1890ff"
      description="根据进口风量和风速，按照标准比例参数计算旋风除尘器各部分尺寸和压力损失。"
      formContent={formContent}
      resultContent={resultContent}
      formulaContent={formulaContent}
      tips={tips}
    />
  );
};

export default CycloneCalculator;
