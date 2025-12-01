import React, { useState } from 'react';
import { Card, Form, InputNumber, Select, Button, Table, message, Row, Col, Divider, Alert, Space } from 'antd';
import { CalculatorOutlined, ThunderboltOutlined } from '@ant-design/icons';
import FormulaDisplay from './FormulaDisplay';

const { Option } = Select;

interface CableResult {
  cableModel: string;
  ratedCurrent: number;
  startCurrent: number;
  runVoltageDrop: number;
  startVoltageDrop: number;
  recommendation: string;
}

const CableCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CableResult | null>(null);

  // 电机功率因数和效率数据
  const getMotorParams = (power: number): { efficiency: number; powerFactor: number } => {
    if (power <= 3) return { efficiency: 0.80, powerFactor: 0.81 };
    if (power <= 7.5) return { efficiency: 0.83, powerFactor: 0.83 };
    if (power <= 15) return { efficiency: 0.86, powerFactor: 0.85 };
    if (power <= 30) return { efficiency: 0.88, powerFactor: 0.87 };
    if (power <= 55) return { efficiency: 0.90, powerFactor: 0.88 };
    if (power <= 90) return { efficiency: 0.92, powerFactor: 0.89 };
    return { efficiency: 0.93, powerFactor: 0.89 };
  };

  // 计算额定电流
  const calculateRatedCurrent = (power: number, voltage: number, efficiency: number, powerFactor: number): number => {
    const voltageKV = voltage === 0.6 ? 0.4 : 6;
    return (power * 1000) / (voltageKV * 1000 * 1.732 * powerFactor * efficiency);
  };

  // 计算启动电流
  const calculateStartCurrent = (ratedCurrent: number, startMethod: string): number => {
    switch (startMethod) {
      case '直接启动': return ratedCurrent * 6;
      case '星三角启动': return ratedCurrent * 2;
      case '变频启动': return ratedCurrent * 1.5;
      default: return ratedCurrent * 6;
    }
  };

  // 推荐电缆截面
  const recommendCableSection = (power: number): number => {
    if (power <= 3) return 2.5;
    if (power <= 7.5) return 6;
    if (power <= 15) return 10;
    if (power <= 22) return 16;
    if (power <= 37) return 25;
    if (power <= 55) return 35;
    if (power <= 75) return 50;
    if (power <= 90) return 70;
    if (power <= 110) return 95;
    if (power <= 132) return 120;
    if (power <= 160) return 150;
    return 185;
  };

  // 计算电压降
  const calculateVoltageDrop = (
    length: number,
    current: number,
    section: number,
    powerFactor: number
  ): number => {
    const resistance = 0.0175 / section; // 铜电阻率
    const reactance = 0.08;
    const sinPhi = Math.sqrt(1 - powerFactor * powerFactor);
    return (1.732 * current * length * resistance * (powerFactor + reactance * sinPhi)) / 1000;
  };

  const handleCalculate = async (values: any) => {
    setLoading(true);
    try {
      const { motorPower, cableLength, startMethod, installationType, voltage, coreCount } = values;

      // 验证启动方式
      if (startMethod === '直接启动' && motorPower > 30) {
        message.warning('30kW以上电机不建议使用直接启动');
      }
      if (startMethod === '星三角启动' && motorPower < 15) {
        message.warning('15kW以下电机不建议使用星三角启动');
      }

      // 获取电机参数
      const { efficiency, powerFactor } = getMotorParams(motorPower);

      // 计算电流
      const ratedCurrent = calculateRatedCurrent(motorPower, voltage, efficiency, powerFactor);
      const startCurrent = calculateStartCurrent(ratedCurrent, startMethod);

      // 推荐电缆截面
      let section = recommendCableSection(motorPower);
      section = section * 1.2; // 提升一个等级

      // 计算电压降
      const runVoltageDrop = calculateVoltageDrop(cableLength, ratedCurrent, section, powerFactor);
      const startVoltageDrop = calculateVoltageDrop(cableLength, startCurrent, section, powerFactor);

      // 电压降限制
      const maxVoltageDrop = startMethod === '直接启动' ? 0.15 : startMethod === '星三角启动' ? 0.1 : 0.05;

      // 如果电压降超标，增大截面
      if (startVoltageDrop > maxVoltageDrop) {
        section = section * 1.5;
      }

      // 格式化电缆型号
      const voltageLevel = voltage === 0.6 ? '0.6/1KV' : '6/6KV';
      const coreConfig = coreCount === 3 ? '3芯' : coreCount === 4 ? '4芯' : '3+1芯';
      const cableModel = `YJV ${voltageLevel} ${coreConfig}×${section}mm²`;

      const recommendation = startVoltageDrop > maxVoltageDrop
        ? '⚠️ 启动电压降超标，建议缩短电缆长度或增大截面'
        : '✓ 电缆选型合适';

      setResult({
        cableModel,
        ratedCurrent: Math.round(ratedCurrent * 10) / 10,
        startCurrent: Math.round(startCurrent * 10) / 10,
        runVoltageDrop: Math.round(runVoltageDrop * 10000) / 100,
        startVoltageDrop: Math.round(startVoltageDrop * 10000) / 100,
        recommendation,
      });

      message.success('计算完成');
    } catch (error) {
      message.error('计算失败，请检查输入参数');
    } finally {
      setLoading(false);
    }
  };

  const resultColumns = [
    { title: '参数', dataIndex: 'param', key: 'param' },
    { title: '数值', dataIndex: 'value', key: 'value' },
  ];

  const resultData = result
    ? [
        { key: '1', param: '推荐电缆型号', value: result.cableModel },
        { key: '2', param: '额定电流', value: `${result.ratedCurrent} A` },
        { key: '3', param: '启动电流', value: `${result.startCurrent} A` },
        { key: '4', param: '运行电压降', value: `${result.runVoltageDrop}%` },
        { key: '5', param: '启动电压降', value: `${result.startVoltageDrop}%` },
        { key: '6', param: '选型建议', value: result.recommendation },
      ]
    : [];

  const cableFormulas = [
    {
      name: '额定电流计算',
      formula: 'I_rated = P × 1000 / (U × sqrt(3) × cos(φ) × η)',
      description: '根据电机功率、电压、功率因数和效率计算额定电流',
      variables: [
        { symbol: 'I_rated', name: '额定电流', unit: 'A' },
        { symbol: 'P', name: '电机功率', unit: 'kW' },
        { symbol: 'U', name: '线电压', unit: 'V' },
        { symbol: 'cos(φ)', name: '功率因数', unit: '-' },
        { symbol: 'η', name: '电机效率', unit: '-' }
      ],
      example: '例：30kW电机，400V，功率因数0.85，效率0.9\nI_rated = 30×1000 / (400×1.732×0.85×0.9) = 56.7 A'
    },
    {
      name: '启动电流计算',
      formula: 'I_start = I_rated × K_start',
      description: '根据启动方式确定启动电流倍数',
      variables: [
        { symbol: 'I_start', name: '启动电流', unit: 'A' },
        { symbol: 'I_rated', name: '额定电流', unit: 'A' },
        { symbol: 'K_start', name: '启动倍数', unit: '-' }
      ],
      example: '例：额定电流56.7A，直接启动\nI_start = 56.7 × 6 = 340.2 A'
    },
    {
      name: '电压降计算',
      formula: 'ΔU = sqrt(3) × I × L × (R×cos(φ) + X×sin(φ)) / 1000',
      description: '计算电缆的电压降，考虑电阻和电抗',
      variables: [
        { symbol: 'ΔU', name: '电压降', unit: 'V' },
        { symbol: 'I', name: '电流', unit: 'A' },
        { symbol: 'L', name: '电缆长度', unit: 'm' },
        { symbol: 'R', name: '电阻', unit: 'Ω/km' },
        { symbol: 'X', name: '电抗', unit: 'Ω/km' },
        { symbol: 'cos(φ)', name: '功率因数', unit: '-' }
      ],
      example: '例：电流56.7A，长度100m，电阻0.387Ω/km\nΔU = 1.732×56.7×100×0.387/1000 = 3.8 V'
    },
    {
      name: '电压降百分比',
      formula: 'ΔU% = (ΔU / U_rated) × 100%',
      description: '计算电压降占额定电压的百分比',
      variables: [
        { symbol: 'ΔU%', name: '电压降百分比', unit: '%' },
        { symbol: 'ΔU', name: '电压降', unit: 'V' },
        { symbol: 'U_rated', name: '额定电压', unit: 'V' }
      ],
      example: '例：电压降3.8V，额定电压400V\nΔU% = (3.8 / 400) × 100% = 0.95%'
    },
    {
      name: '载流量校验',
      formula: 'I_cable ≥ I_rated × K_safety',
      description: '电缆载流量必须大于额定电流乘以安全系数',
      variables: [
        { symbol: 'I_cable', name: '电缆载流量', unit: 'A' },
        { symbol: 'I_rated', name: '额定电流', unit: 'A' },
        { symbol: 'K_safety', name: '安全系数', unit: '-' }
      ],
      example: '例：额定电流56.7A，安全系数1.25\n所需载流量 ≥ 56.7 × 1.25 = 70.9 A'
    }
  ];

  const cableConstants = [
    { name: '启动倍数 (直接)', value: '6倍', description: '直接启动电流为额定电流的6倍' },
    { name: '启动倍数 (星三角)', value: '2倍', description: '星三角启动电流为额定电流的2倍' },
    { name: '启动倍数 (变频)', value: '1.5倍', description: '变频启动电流为额定电流的1.5倍' },
    { name: '电压降限制 (直接)', value: '≤15%', description: '直接启动允许的最大电压降' },
    { name: '电压降限制 (星三角)', value: '≤10%', description: '星三角启动允许的最大电压降' },
    { name: '电压降限制 (变频)', value: '≤5%', description: '变频启动允许的最大电压降' },
    { name: '安全系数', value: '1.25', description: '载流量选择的安全裕量' },
    { name: '铜电阻率', value: '0.0175 Ω·mm²/m', description: '20℃时铜的电阻率' }
  ];

  return (
    <Card
      title={<Space><ThunderboltOutlined style={{ color: '#1890ff' }} />电缆选型计算器</Space>}
      bordered
      style={{ marginBottom: 16 }}
    >
      <Alert
        message="功能说明"
        description="根据电机功率、电缆长度、启动方式等参数，自动计算推荐电缆型号和电压降，符合GB规范要求。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCalculate}
            initialValues={{
              motorPower: 15,
              cableLength: 100,
              startMethod: '星三角启动',
              installationType: '桥架铺设',
              voltage: 0.6,
              coreCount: 3,
            }}
          >
            <Form.Item
              label="电机功率 (kW)"
              name="motorPower"
              rules={[{ required: true, message: '请输入电机功率' }]}
            >
              <InputNumber min={0.75} max={500} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="电缆长度 (m)"
              name="cableLength"
              rules={[{ required: true, message: '请输入电缆长度' }]}
            >
              <InputNumber min={1} max={1000} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="启动方式"
              name="startMethod"
              rules={[{ required: true, message: '请选择启动方式' }]}
            >
              <Select>
                <Option value="直接启动">直接启动 (≤30kW)</Option>
                <Option value="星三角启动">星三角启动 (≥15kW)</Option>
                <Option value="变频启动">变频启动 (任意功率)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="安装方式"
              name="installationType"
              rules={[{ required: true, message: '请选择安装方式' }]}
            >
              <Select>
                <Option value="桥架铺设">桥架铺设</Option>
                <Option value="直埋敷设">直埋敷设</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="电压等级 (kV)"
              name="voltage"
              rules={[{ required: true, message: '请选择电压等级' }]}
            >
              <Select>
                <Option value={0.6}>0.6/1KV (低压)</Option>
                <Option value={6}>6/6KV (高压)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="芯数配置"
              name="coreCount"
              rules={[{ required: true, message: '请选择芯数' }]}
            >
              <Select>
                <Option value={3}>3芯</Option>
                <Option value={4}>4芯</Option>
                <Option value={31}>3+1芯</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<CalculatorOutlined />}>
                开始计算
              </Button>
            </Form.Item>
          </Form>
        </Col>

        <Col xs={24} lg={12}>
          {result && (
            <Card title="计算结果" bordered style={{ background: '#f0f9ff' }}>
              <Table
                columns={resultColumns}
                dataSource={resultData}
                pagination={false}
                size="small"
                bordered
              />
              <Divider />
              <Alert
                message="注意事项"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>计算结果仅供参考，实际选型需考虑现场条件</li>
                    <li>电压降标准：直接启动≤15%，星三角≤10%，变频≤5%</li>
                    <li>建议选用铜芯交联聚乙烯绝缘电缆(YJV)</li>
                  </ul>
                }
                type="warning"
                showIcon
              />
            </Card>
          )}
        </Col>
      </Row>

      <FormulaDisplay
        title="电缆选型计算公式"
        formulas={cableFormulas}
        constants={cableConstants}
      />
    </Card>
  );
};

export default CableCalculator;
