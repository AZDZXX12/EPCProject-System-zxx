import React, { useState } from 'react';
import { Card, Form, InputNumber, Switch, Button, Table, message, Row, Col, Alert, Space, Statistic } from 'antd';
import { CalculatorOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import FormulaDisplay from './FormulaDisplay';

interface MaterialItem {
  key: string;
  name: string;
  spec: string;
  quantity: string;
  weight: string;
}

const LadderCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);

  const handleCalculate = (values: any) => {
    setLoading(true);
    try {
      const { height, width, hasCage } = values;

      // 计算平台数量（每6m一个）
      const platformCount = height > 6000 ? Math.floor(height / 6000) : 0;

      // 计算踏棍间距和数量
      const rungSpacing = height <= 3000 ? 300 : height <= 6000 ? 275 : 250;
      const rungCount = Math.ceil(height / rungSpacing);

      const materialList: MaterialItem[] = [];

      // 1. 梯梁角铁
      materialList.push({
        key: '1',
        name: '梯梁角铁',
        spec: '63×63×6',
        quantity: `${((height / 1000) * 2).toFixed(3)} m`,
        weight: `${((height / 1000) * 2 * 5.72).toFixed(2)} kg`,
      });

      // 2. 踏棍
      materialList.push({
        key: '2',
        name: '踏棍',
        spec: 'φ32×3.5钢管',
        quantity: `${rungCount} 根`,
        weight: `${(rungCount * (width / 1000) * 3.13).toFixed(2)} kg`,
      });

      // 3. 连接角钢
      materialList.push({
        key: '3',
        name: '连接角钢',
        spec: '50×50×5',
        quantity: `${((height / 1000) * 4).toFixed(3)} m`,
        weight: `${((height / 1000) * 4 * 3.77).toFixed(2)} kg`,
      });

      // 4-7. 平台材料
      if (platformCount > 0) {
        materialList.push({
          key: '4',
          name: '平台框架',
          spec: '12#槽钢',
          quantity: `${(platformCount * (width / 1000) * 4).toFixed(3)} m`,
          weight: `${(platformCount * (width / 1000) * 4 * 12.059).toFixed(2)} kg`,
        });

        materialList.push({
          key: '5',
          name: '平台面板',
          spec: '4mm花纹钢板',
          quantity: `${(platformCount * (width / 1000) * (width / 1000)).toFixed(3)} m²`,
          weight: `${(platformCount * (width / 1000) * (width / 1000) * 31.4).toFixed(2)} kg`,
        });

        materialList.push({
          key: '6',
          name: '平台护栏立杆',
          spec: '30×4扁铁',
          quantity: `${platformCount * 4} 根`,
          weight: `${(platformCount * 4 * 1 * 0.942).toFixed(2)} kg`,
        });

        materialList.push({
          key: '7',
          name: '平台护栏横杆',
          spec: '30×4扁铁',
          quantity: `${(platformCount * 2 * (width / 1000)).toFixed(3)} m`,
          weight: `${(platformCount * 2 * (width / 1000) * 0.942).toFixed(2)} kg`,
        });
      }

      // 8-9. 护笼材料
      if (hasCage) {
        const cageHeight = Math.max(0, height - 2000);
        if (cageHeight > 0) {
          const cagePoleCount = Math.ceil(cageHeight / 300) * 2;
          const cageRingCount = Math.ceil(cageHeight / 1500);

          materialList.push({
            key: '8',
            name: '护笼立杆',
            spec: '30×4扁铁',
            quantity: `${(cagePoleCount * (cageHeight / 1000)).toFixed(3)} m`,
            weight: `${(cagePoleCount * (cageHeight / 1000) * 0.942).toFixed(2)} kg`,
          });

          materialList.push({
            key: '9',
            name: '护笼环筋',
            spec: '30×4扁铁',
            quantity: `${(cageRingCount * (width / 1000) * 2).toFixed(3)} m`,
            weight: `${(cageRingCount * (width / 1000) * 2 * 0.942).toFixed(2)} kg`,
          });
        }
      }

      // 计算总重量
      let total = 0;
      materialList.forEach((item) => {
        const weightStr = item.weight.replace(' kg', '');
        total += parseFloat(weightStr);
      });

      setMaterials(materialList);
      setTotalWeight(total);
      message.success('计算完成');
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

  const ladderFormulas = [
    {
      name: '梯梁数量计算',
      formula: 'N_beam = 2 (固定值)',
      description: '爬梯两侧各需一根梯梁',
      variables: [
        { symbol: 'N_beam', name: '梯梁数量', unit: '根' }
      ],
      example: '标准爬梯固定使用2根梯梁'
    },
    {
      name: '梯梁长度计算',
      formula: 'L_beam = H / sin(α) + L_extend',
      description: '根据高度和倾角计算梯梁斜长',
      variables: [
        { symbol: 'L_beam', name: '梯梁长度', unit: 'm' },
        { symbol: 'H', name: '爬梯高度', unit: 'm' },
        { symbol: 'α', name: '倾斜角度', unit: '°' },
        { symbol: 'L_extend', name: '延伸长度', unit: 'm' }
      ],
      example: '例：高度10m，角度75°，延伸0.5m\nL_beam = 10/sin(75°) + 0.5 = 10.86m'
    },
    {
      name: '踏步数量计算',
      formula: 'N_step = floor(H / S_step)',
      description: '根据高度和踏步间距计算踏步数量',
      variables: [
        { symbol: 'N_step', name: '踏步数量', unit: '个' },
        { symbol: 'H', name: '爬梯高度', unit: 'm' },
        { symbol: 'S_step', name: '踏步间距', unit: 'm' }
      ],
      example: '例：高度10m，间距0.3m\nN_step = floor(10/0.3) = 33个'
    },
    {
      name: '护圈数量计算',
      formula: 'N_hoop = floor((H - H_start) / S_hoop)',
      description: '从起始高度开始，按间距设置护圈',
      variables: [
        { symbol: 'N_hoop', name: '护圈数量', unit: '个' },
        { symbol: 'H', name: '爬梯高度', unit: 'm' },
        { symbol: 'H_start', name: '起始高度', unit: 'm' },
        { symbol: 'S_hoop', name: '护圈间距', unit: 'm' }
      ],
      example: '例：高度10m，起始2.5m，间距0.8m\nN_hoop = floor((10-2.5)/0.8) = 9个'
    },
    {
      name: '槽钢重量计算',
      formula: 'W_channel = L_total × rho_channel',
      description: '计算梯梁槽钢总重量',
      variables: [
        { symbol: 'W_channel', name: '槽钢重量', unit: 'kg' },
        { symbol: 'L_total', name: '槽钢总长度', unit: 'm' },
        { symbol: 'ρ_channel', name: '槽钢线密度', unit: 'kg/m' }
      ],
      example: '例：总长21.72m，线密度7.85kg/m\nW_channel = 21.72 × 7.85 = 170.5kg'
    },
    {
      name: '圆钢重量计算',
      formula: 'W_round = (N_step × L_step + N_hoop × L_hoop) × rho_round',
      description: '计算踏步和护圈圆钢总重量',
      variables: [
        { symbol: 'W_round', name: '圆钢重量', unit: 'kg' },
        { symbol: 'N_step', name: '踏步数量', unit: '个' },
        { symbol: 'L_step', name: '单个踏步长度', unit: 'm' },
        { symbol: 'N_hoop', name: '护圈数量', unit: '个' },
        { symbol: 'L_hoop', name: '单个护圈周长', unit: 'm' },
        { symbol: 'ρ_round', name: '圆钢线密度', unit: 'kg/m' }
      ],
      example: '例：踏步33个×0.5m，护圈9个×2.5m，线密度0.888kg/m\nW = (33×0.5 + 9×2.5) × 0.888 = 34.6kg'
    }
  ];

  const ladderConstants = [
    { name: '标准倾角', value: '75°', description: '爬梯标准倾斜角度' },
    { name: '踏步间距', value: '0.3 m', description: '标准踏步垂直间距' },
    { name: '护圈起始高度', value: '2.5 m', description: '护圈开始设置的高度' },
    { name: '护圈间距', value: '0.8 m', description: '护圈垂直间距' },
    { name: '槽钢线密度', value: '7.85 kg/m', description: '10#槽钢线密度' },
    { name: '圆钢线密度', value: '0.888 kg/m', description: 'Φ12圆钢线密度' },
    { name: '踏步宽度', value: '0.5 m', description: '标准踏步宽度' },
    { name: '安全系数', value: '1.2', description: '结构设计安全系数' }
  ];

  return (
    <Card
      title={<Space><VerticalAlignTopOutlined style={{ color: '#52c41a' }} />爬梯计算器</Space>}
      bordered
    >
      <Alert
        message="功能说明"
        description="根据GB4053.1-2009标准，计算爬梯所需材料。平台每6m设置一个，护笼从2m开始设置。"
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
              height: 12000,
              width: 600,
              hasCage: true,
            }}
          >
            <Form.Item
              label="爬梯高度 (mm)"
              name="height"
              rules={[{ required: true, message: '请输入高度' }]}
            >
              <InputNumber min={1000} max={50000} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="爬梯宽度 (mm)"
              name="width"
              rules={[{ required: true, message: '请输入宽度' }]}
            >
              <InputNumber min={400} max={1000} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="是否设置护笼"
              name="hasCage"
              valuePropName="checked"
              tooltip="GB4053.1-2009规定：高度>3m应设护笼"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<CalculatorOutlined />}>
                开始计算
              </Button>
            </Form.Item>
          </Form>

          {totalWeight > 0 && (
            <Card size="small" style={{ marginTop: 16, background: '#f0f9ff' }}>
              <Statistic
                title="钢材总重量"
                value={totalWeight.toFixed(2)}
                suffix="kg"
                valueStyle={{ color: '#1890ff', fontWeight: 600, fontSize: 24 }}
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
        title="爬梯计算公式"
        formulas={ladderFormulas}
        constants={ladderConstants}
      />
    </Card>
  );
};

export default LadderCalculator;
