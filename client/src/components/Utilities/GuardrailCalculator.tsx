import React, { useState } from 'react';
import { Card, Form, InputNumber, Switch, Button, Table, message, Row, Col, Alert, Space, Statistic } from 'antd';
import { CalculatorOutlined, BorderOutlined } from '@ant-design/icons';
import FormulaDisplay from './FormulaDisplay';

interface MaterialItem {
  key: string;
  name: string;
  spec: string;
  quantity: string;
  weight: string;
}

const GuardrailCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);

  const handleCalculate = (values: any) => {
    setLoading(true);
    try {
      const { length, height, isPlatform } = values;

      // 计算立柱数量（间距不大于1.1m）
      const postCount = Math.ceil(length / 1.1) + 1;

      // 计算横杆数量（高度≤1.05m时2道，>1.05m时3道）
      const railCount = height <= 1.05 ? 2 : 3;

      const materialList: MaterialItem[] = [];

      // 1. 立柱
      materialList.push({
        key: '1',
        name: '立柱',
        spec: 'φ32×3.5钢管',
        quantity: `${(postCount * height).toFixed(3)} m`,
        weight: `${(postCount * height * 3.13).toFixed(2)} kg`,
      });

      // 2. 横杆
      materialList.push({
        key: '2',
        name: '横杆',
        spec: 'φ32×3.5钢管',
        quantity: `${(railCount * length).toFixed(3)} m`,
        weight: `${(railCount * length * 3.13).toFixed(2)} kg`,
      });

      // 3. 连接扁铁
      const connectionLength = postCount * 0.2 * railCount;
      materialList.push({
        key: '3',
        name: '连接扁铁',
        spec: '30×4扁铁',
        quantity: `${connectionLength.toFixed(3)} m`,
        weight: `${(connectionLength * 0.942).toFixed(2)} kg`,
      });

      // 4. 踢脚线（仅平台护栏）
      if (isPlatform) {
        materialList.push({
          key: '4',
          name: '踢脚线',
          spec: '100×4扁铁',
          quantity: `${length.toFixed(3)} m`,
          weight: `${(length * 3.14).toFixed(2)} kg`,
        });
      }

      // 计算总重量
      let total = 0;
      materialList.forEach((item) => {
        const weightStr = item.weight.replace(' kg', '');
        total += parseFloat(weightStr);
      });

      setMaterials(materialList);
      setTotalWeight(total);

      // 检查高度是否符合标准
      if (height < 1.05) {
        message.warning('GB4053.3-2009规定：护栏高度不应小于1.05m');
      } else {
        message.success('计算完成');
      }
    } catch (error) {
      message.error('计算失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '材料名称', dataIndex: 'name', key: 'name' },
    { title: '规格', dataIndex: 'spec', key: 'spec' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '重量', dataIndex: 'weight', key: 'weight' },
  ];

  const guardrailFormulas = [
    {
      name: '立柱数量计算',
      formula: 'N_post = ceil(L / S_post) + 1',
      description: '根据总长度和立柱间距计算数量',
      variables: [
        { symbol: 'N_post', name: '立柱数量', unit: '根' },
        { symbol: 'L', name: '护栏总长度', unit: 'm' },
        { symbol: 'S_post', name: '立柱间距', unit: 'm' }
      ],
      example: '例：长度20m，间距1.5m\nN_post = ceil(20/1.5) + 1 = 15根'
    },
    {
      name: '横杆数量计算',
      formula: 'N_rail = N_layer × N_post',
      description: '根据层数和立柱数量计算横杆数量',
      variables: [
        { symbol: 'N_rail', name: '横杆数量', unit: '根' },
        { symbol: 'N_layer', name: '横杆层数', unit: '层' },
        { symbol: 'N_post', name: '立柱数量', unit: '根' }
      ],
      example: '例：3层横杆，15根立柱\nN_rail = 3×15 = 45根'
    },
    {
      name: '立柱总长度计算',
      formula: 'L_post_total = N_post × H_post',
      description: '所有立柱的总长度',
      variables: [
        { symbol: 'L_post_total', name: '立柱总长度', unit: 'm' },
        { symbol: 'N_post', name: '立柱数量', unit: '根' },
        { symbol: 'H_post', name: '单根立柱高度', unit: 'm' }
      ],
      example: '例：15根立柱，每根1.2m\nL_post_total = 15×1.2 = 18m'
    },
    {
      name: '横杆总长度计算',
      formula: 'L_rail_total = N_layer × L',
      description: '所有层横杆的总长度',
      variables: [
        { symbol: 'L_rail_total', name: '横杆总长度', unit: 'm' },
        { symbol: 'N_layer', name: '横杆层数', unit: '层' },
        { symbol: 'L', name: '护栏总长度', unit: 'm' }
      ],
      example: '例：3层横杆，总长20m\nL_rail_total = 3×20 = 60m'
    },
    {
      name: '总重量计算',
      formula: 'W_total = L_post_total×ρ_post + L_rail_total×ρ_rail',
      description: '立柱和横杆重量之和',
      variables: [
        { symbol: 'W_total', name: '总重量', unit: 'kg' },
        { symbol: 'L_post_total', name: '立柱总长度', unit: 'm' },
        { symbol: 'ρ_post', name: '立柱线密度', unit: 'kg/m' },
        { symbol: 'L_rail_total', name: '横杆总长度', unit: 'm' },
        { symbol: 'ρ_rail', name: '横杆线密度', unit: 'kg/m' }
      ],
      example: '例：立柱18m×3.85kg/m + 横杆60m×2.47kg/m\nW = 69.3 + 148.2 = 217.5kg'
    }
  ];

  const guardrailConstants = [
    { name: '立柱标准间距', value: '1.5 m', description: '护栏立柱的标准间距' },
    { name: '护栏标准高度', value: '1.0-1.2 m', description: '护栏顶部离地面高度' },
    { name: '横杆层数', value: '2-3 层', description: '标准护栏横杆层数' },
    { name: 'φ48×3管线密度', value: '3.85 kg/m', description: '立柱管材线密度' },
    { name: 'φ32×3管线密度', value: '2.47 kg/m', description: '横杆管材线密度' },
    { name: '踢脚板高度', value: '100-150 mm', description: '护栏底部踢脚板高度' },
    { name: '安全系数', value: '1.5', description: '护栏结构安全系数' }
  ];

  return (
    <Card
      title={<Space><BorderOutlined style={{ color: '#fa8c16' }} />护栏计算器</Space>}
      bordered
    >
      <Alert
        message="功能说明"
        description="根据GB4053.3-2009标准，计算护栏所需材料。立柱间距≤1.1m，高度≤1.05m时设2道横杆，>1.05m时设3道。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCalculate}
            initialValues={{
              length: 10,
              height: 1.05,
              isPlatform: true,
            }}
          >
            <Form.Item
              label="护栏长度 (m)"
              name="length"
              rules={[{ required: true, message: '请输入长度' }]}
            >
              <InputNumber min={1} max={100} step={0.1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="护栏高度 (m)"
              name="height"
              rules={[{ required: true, message: '请输入高度' }]}
              tooltip="GB4053.3-2009规定：护栏高度不应小于1.05m"
            >
              <InputNumber min={0.9} max={2} step={0.05} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="是否平台护栏"
              name="isPlatform"
              valuePropName="checked"
              tooltip="平台护栏需要设置踢脚线"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<CalculatorOutlined />}>
                开始计算
              </Button>
            </Form.Item>
          </Form>

          {totalWeight > 0 && (
            <Card size="small" style={{ marginTop: 16, background: '#fff7e6' }}>
              <Statistic
                title="钢材总重量"
                value={totalWeight.toFixed(2)}
                suffix="kg"
                valueStyle={{ color: '#fa8c16', fontWeight: 600, fontSize: 24 }}
              />
            </Card>
          )}
        </Col>

        <Col xs={24} lg={16}>
          {materials.length > 0 && (
            <Card title="材料清单" bordered>
              <Table
                columns={columns}
                dataSource={materials}
                pagination={false}
                size="small"
                bordered
              />
            </Card>
          )}
        </Col>
      </Row>

      <FormulaDisplay
        title="护栏计算公式"
        formulas={guardrailFormulas}
        constants={guardrailConstants}
      />
    </Card>
  );
};

export default GuardrailCalculator;
