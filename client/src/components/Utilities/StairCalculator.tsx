import React, { useState } from 'react';
import { Card, Form, InputNumber, Select, Button, Descriptions, message, Row, Col, Alert, Space, Statistic } from 'antd';
import { CalculatorOutlined, RiseOutlined } from '@ant-design/icons';
import FormulaDisplay from './FormulaDisplay';

const { Option } = Select;

const StairCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = (values: any) => {
    setLoading(true);
    try {
      const { stairAngle, stairHeight, guardrailHeight } = values;

      // 根据角度确定踏步尺寸
      let riserHeight = 175; // 踏步高度mm
      let treadWidth = 300; // 踏步宽度mm

      if (stairAngle === 30) {
        riserHeight = 150;
        treadWidth = 300;
      } else if (stairAngle === 35) {
        riserHeight = 175;
        treadWidth = 300;
      } else if (stairAngle === 40) {
        riserHeight = 200;
        treadWidth = 300;
      } else if (stairAngle === 45) {
        riserHeight = 225;
        treadWidth = 300;
      }

      // 计算踏步数量
      const stepsCount = Math.ceil(stairHeight / riserHeight);

      // 计算槽钢长度
      const angleRad = (stairAngle * Math.PI) / 180;
      const channelLength = (stairHeight / Math.sin(angleRad)) * 2 / 1000;

      // 计算栏杆长度
      let railingLength = 0;
      if (guardrailHeight <= 2000) {
        const baseCount = Math.ceil((channelLength * 1000) / 500) + 2;
        const rawLength = baseCount * guardrailHeight + channelLength * 1000;
        railingLength = Math.ceil(rawLength) / 1000;
      }

      // 计算扁铁长度
      let flatIronFactor = 0;
      if (guardrailHeight > 2000) flatIronFactor = 0;
      else if (guardrailHeight >= 1800) flatIronFactor = 4;
      else if (guardrailHeight >= 1400) flatIronFactor = 3;
      else if (guardrailHeight > 1050) flatIronFactor = 2;
      else flatIronFactor = 1;

      const flatIronLength = (Math.ceil(channelLength * 1000) * flatIronFactor) / 1000;

      // 计算总重量
      const totalWeight =
        channelLength * 14.535 + // 14#槽钢
        stepsCount * 6.804 + // 踏步
        railingLength * 2.42 + // 栏杆φ32X3.5
        flatIronLength * 0.942; // 30X4扁铁

      setResult({
        stepsCount,
        channelLength: channelLength.toFixed(3),
        railingLength: railingLength.toFixed(3),
        flatIronLength: flatIronLength.toFixed(3),
        totalWeight: totalWeight.toFixed(2),
        riserHeight,
        treadWidth,
      });

      message.success('计算完成');
    } catch (error) {
      message.error('计算失败');
    } finally {
      setLoading(false);
    }
  };

  const stairFormulas = [
    {
      name: '踏步数量计算',
      formula: 'N_step = ceil(H / H_riser)',
      description: '根据总高度和踏步高度计算踏步数量',
      variables: [
        { symbol: 'N_step', name: '踏步数量', unit: '块' },
        { symbol: 'H', name: '楼梯总高度', unit: 'mm' },
        { symbol: 'H_riser', name: '单级踏步高度', unit: 'mm' }
      ],
      example: '例：总高度3000mm，踏步高度175mm\nN_step = ceil(3000/175) = 18块'
    },
    {
      name: '踏步宽度计算',
      formula: 'W_tread = L_total / N_step',
      description: '根据总长度和踏步数量计算踏步宽度',
      variables: [
        { symbol: 'W_tread', name: '踏步宽度', unit: 'mm' },
        { symbol: 'L_total', name: '楼梯总长度', unit: 'mm' },
        { symbol: 'N_step', name: '踏步数量', unit: '块' }
      ],
      example: '例：总长度5000mm，踏步18块\nW_tread = 5000/18 = 278mm'
    },
    {
      name: '槽钢长度计算',
      formula: 'L_channel = 2 × sqrt(H² + L²)',
      description: '两侧斜梁槽钢总长度',
      variables: [
        { symbol: 'L_channel', name: '槽钢长度', unit: 'm' },
        { symbol: 'H', name: '楼梯高度', unit: 'm' },
        { symbol: 'L', name: '楼梯长度', unit: 'm' }
      ],
      example: '例：高度3m，长度5m\nL_channel = 2×√(3²+5²) = 11.66m'
    },
    {
      name: '栏杆长度计算',
      formula: 'L_railing = 2 × sqrt(H² + L²) + 2 × W_stair',
      description: '两侧斜栏杆加上下平台栏杆',
      variables: [
        { symbol: 'L_railing', name: '栏杆长度', unit: 'm' },
        { symbol: 'H', name: '楼梯高度', unit: 'm' },
        { symbol: 'L', name: '楼梯长度', unit: 'm' },
        { symbol: 'W_stair', name: '楼梯宽度', unit: 'm' }
      ],
      example: '例：高3m，长5m，宽1m\nL_railing = 2×√(3²+5²) + 2×1 = 13.66m'
    },
    {
      name: '扁铁长度计算',
      formula: 'L_flat = N_step × W_stair × 2',
      description: '踏步两侧扁铁总长度',
      variables: [
        { symbol: 'L_flat', name: '扁铁长度', unit: 'm' },
        { symbol: 'N_step', name: '踏步数量', unit: '块' },
        { symbol: 'W_stair', name: '楼梯宽度', unit: 'm' }
      ],
      example: '例：踏步18块，宽度1m\nL_flat = 18×1×2 = 36m'
    },
    {
      name: '总重量计算',
      formula: 'W_total = L_channel×ρ_channel + L_railing×ρ_railing + L_flat×ρ_flat',
      description: '各材料重量之和',
      variables: [
        { symbol: 'W_total', name: '总重量', unit: 'kg' },
        { symbol: 'L_channel', name: '槽钢长度', unit: 'm' },
        { symbol: 'ρ_channel', name: '槽钢线密度', unit: 'kg/m' },
        { symbol: 'L_railing', name: '栏杆长度', unit: 'm' },
        { symbol: 'ρ_railing', name: '栏杆线密度', unit: 'kg/m' },
        { symbol: 'L_flat', name: '扁铁长度', unit: 'm' },
        { symbol: 'ρ_flat', name: '扁铁线密度', unit: 'kg/m' }
      ],
      example: '例：槽钢11.66m×16.69kg/m + 栏杆13.66m×3.33kg/m + 扁铁36m×0.942kg/m\nW = 194.6 + 45.5 + 33.9 = 274kg'
    }
  ];

  const stairConstants = [
    { name: '标准踏步高度', value: '150-180 mm', description: '舒适的踏步高度范围' },
    { name: '标准踏步宽度', value: '250-300 mm', description: '舒适的踏步宽度范围' },
    { name: '楼梯坡度', value: '30-35°', description: '标准楼梯坡度角' },
    { name: '14#槽钢线密度', value: '16.69 kg/m', description: '14#槽钢的线密度' },
    { name: 'φ32×3.5管线密度', value: '3.33 kg/m', description: '栏杆管材线密度' },
    { name: '30×4扁铁线密度', value: '0.942 kg/m', description: '扁铁线密度' },
    { name: '栏杆高度', value: '900-1100 mm', description: '标准栏杆高度' },
    { name: '安全系数', value: '1.3', description: '楼梯结构安全系数' }
  ];

  return (
    <Card
      title={<Space><RiseOutlined style={{ color: '#eb2f96' }} />楼梯计算器</Space>}
      bordered
    >
      <Alert
        message="功能说明"
        description="根据楼梯角度、高度和护栏高度，计算所需材料和重量。"
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
              stairAngle: 35,
              stairHeight: 3500,
              guardrailHeight: 1050,
            }}
          >
            <Form.Item
              label="楼梯角度 (度)"
              name="stairAngle"
              rules={[{ required: true, message: '请选择角度' }]}
            >
              <Select>
                <Option value={30}>30° (缓坡)</Option>
                <Option value={35}>35° (标准)</Option>
                <Option value={40}>40° (陡坡)</Option>
                <Option value={45}>45° (最陡)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="楼梯高度 (mm)"
              name="stairHeight"
              rules={[{ required: true, message: '请输入高度' }]}
            >
              <InputNumber min={1000} max={10000} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="护栏高度 (mm)"
              name="guardrailHeight"
              rules={[{ required: true, message: '请输入护栏高度' }]}
              tooltip="标准护栏高度1050mm"
            >
              <InputNumber min={900} max={2000} style={{ width: '100%' }} />
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
              <Card title="计算结果" bordered style={{ marginBottom: 16, background: '#fff1f0' }}>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="踏步数量">{result.stepsCount} 块</Descriptions.Item>
                  <Descriptions.Item label="踏步高度">{result.riserHeight} mm</Descriptions.Item>
                  <Descriptions.Item label="踏步宽度">{result.treadWidth} mm</Descriptions.Item>
                  <Descriptions.Item label="14#槽钢">{result.channelLength} m</Descriptions.Item>
                  <Descriptions.Item label="栏杆φ32X3.5">{result.railingLength} m</Descriptions.Item>
                  <Descriptions.Item label="30X4扁铁">{result.flatIronLength} m</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card size="small" bordered style={{ background: '#f0f9ff' }}>
                <Statistic
                  title="钢材总重量"
                  value={result.totalWeight}
                  suffix="kg"
                  valueStyle={{ color: '#eb2f96', fontWeight: 600, fontSize: 24 }}
                />
              </Card>
            </>
          )}
        </Col>
      </Row>

      <FormulaDisplay
        title="楼梯计算公式"
        formulas={stairFormulas}
        constants={stairConstants}
      />
    </Card>
  );
};

export default StairCalculator;
