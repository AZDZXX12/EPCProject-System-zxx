import React, { useState } from 'react';
import { Card, Form, InputNumber, Switch, Button, Table, message, Row, Col, Alert, Space, Statistic } from 'antd';
import { CalculatorOutlined, AppstoreOutlined } from '@ant-design/icons';
import FormulaDisplay from './FormulaDisplay';

interface MaterialItem {
  key: string;
  name: string;
  spec: string;
  quantity: string;
  weight: string;
}

const PlatformCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);

  const handleCalculate = (values: any) => {
    setLoading(true);
    try {
      const { length, width, height, equipmentWeight, isSquareTube } = values;

      // 材料选型
      let mainMaterial, mainSpec, mainWeight, secondaryMaterial, secondarySpec, secondaryWeight;

      if (equipmentWeight <= 1000) {
        if (isSquareTube) {
          mainMaterial = '焊接方管';
          mainSpec = '100×100×4';
          mainWeight = 11.73;
          secondaryMaterial = '焊接方管';
          secondarySpec = '80×80×3.5';
          secondaryWeight = 8.38;
        } else {
          mainMaterial = '槽钢';
          mainSpec = '14#';
          mainWeight = 14.535;
          secondaryMaterial = '槽钢';
          secondarySpec = '12#';
          secondaryWeight = 12.059;
        }
      } else if (equipmentWeight <= 3000) {
        if (isSquareTube) {
          mainMaterial = '焊接方管';
          mainSpec = '120×120×5';
          mainWeight = 17.85;
          secondaryMaterial = '焊接方管';
          secondarySpec = '100×100×4';
          secondaryWeight = 11.73;
        } else {
          mainMaterial = '槽钢';
          mainSpec = '16#';
          mainWeight = 17.24;
          secondaryMaterial = '槽钢';
          secondarySpec = '14#';
          secondaryWeight = 14.535;
        }
      } else {
        if (isSquareTube) {
          mainMaterial = '焊接方管';
          mainSpec = '150×150×6';
          mainWeight = 26.39;
          secondaryMaterial = '焊接方管';
          secondarySpec = '120×120×5';
          secondaryWeight = 17.85;
        } else {
          mainMaterial = '槽钢';
          mainSpec = '18#';
          mainWeight = 20.17;
          secondaryMaterial = '槽钢';
          secondarySpec = '16#';
          secondaryWeight = 17.24;
        }
      }

      const materialList: MaterialItem[] = [];

      // 1. 主梁
      const mainBeamLength = length * 2;
      materialList.push({
        key: '1',
        name: `主梁(${mainMaterial})`,
        spec: mainSpec,
        quantity: `${mainBeamLength.toFixed(3)} m`,
        weight: `${(mainBeamLength * mainWeight).toFixed(2)} kg`,
      });

      // 2. 次梁
      const secondaryBeamCount = Math.max(2, Math.ceil(width / 1.2));
      materialList.push({
        key: '2',
        name: `次梁(${secondaryMaterial})`,
        spec: secondarySpec,
        quantity: `${(secondaryBeamCount * width).toFixed(3)} m`,
        weight: `${(secondaryBeamCount * width * secondaryWeight).toFixed(2)} kg`,
      });

      // 3. 立柱
      const columnCount = Math.max(4, Math.ceil(length / 2.5) * 2);
      materialList.push({
        key: '3',
        name: `立柱(${mainMaterial})`,
        spec: mainSpec,
        quantity: `${columnCount} 根, ${height.toFixed(3)} m/根`,
        weight: `${(columnCount * height * mainWeight).toFixed(2)} kg`,
      });

      // 4. 平台面板
      materialList.push({
        key: '4',
        name: '平台面板',
        spec: '4mm花纹钢板',
        quantity: `${(length * width).toFixed(3)} m²`,
        weight: `${(length * width * 31.4).toFixed(2)} kg`,
      });

      // 5. 连接角钢
      materialList.push({
        key: '5',
        name: '连接角钢',
        spec: '50×50×5',
        quantity: `${(columnCount * 0.5).toFixed(3)} m`,
        weight: `${(columnCount * 0.5 * 3.77).toFixed(2)} kg`,
      });

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

  const platformFormulas = [
    {
      name: '平台面积计算',
      formula: 'A_platform = L × W',
      description: '根据长度和宽度计算平台面积',
      variables: [
        { symbol: 'A_platform', name: '平台面积', unit: 'm²' },
        { symbol: 'L', name: '平台长度', unit: 'm' },
        { symbol: 'W', name: '平台宽度', unit: 'm' }
      ],
      example: '例：长度6m，宽度2m\nA_platform = 6×2 = 12m²'
    },
    {
      name: '主梁数量计算',
      formula: 'N_main = ceil(W / S_main) + 1',
      description: '根据宽度和主梁间距计算数量',
      variables: [
        { symbol: 'N_main', name: '主梁数量', unit: '根' },
        { symbol: 'W', name: '平台宽度', unit: 'm' },
        { symbol: 'S_main', name: '主梁间距', unit: 'm' }
      ],
      example: '例：宽度2m，间距0.8m\nN_main = ceil(2/0.8) + 1 = 4根'
    },
    {
      name: '次梁数量计算',
      formula: 'N_sec = ceil(L / S_sec) + 1',
      description: '根据长度和次梁间距计算数量',
      variables: [
        { symbol: 'N_sec', name: '次梁数量', unit: '根' },
        { symbol: 'L', name: '平台长度', unit: 'm' },
        { symbol: 'S_sec', name: '次梁间距', unit: 'm' }
      ],
      example: '例：长度6m，间距1.2m\nN_sec = ceil(6/1.2) + 1 = 6根'
    },
    {
      name: '花纹板面积计算',
      formula: 'A_plate = A_platform × (1 + K_loss)',
      description: '考虑损耗系数的花纹板面积',
      variables: [
        { symbol: 'A_plate', name: '花纹板面积', unit: 'm²' },
        { symbol: 'A_platform', name: '平台面积', unit: 'm²' },
        { symbol: 'K_loss', name: '损耗系数', unit: '-' }
      ],
      example: '例：面积12m²，损耗5%\nA_plate = 12×1.05 = 12.6m²'
    },
    {
      name: '花纹板重量计算',
      formula: 'W_plate = A_plate × ρ_plate',
      description: '根据面积和面密度计算重量',
      variables: [
        { symbol: 'W_plate', name: '花纹板重量', unit: 'kg' },
        { symbol: 'A_plate', name: '花纹板面积', unit: 'm²' },
        { symbol: 'ρ_plate', name: '花纹板面密度', unit: 'kg/m²' }
      ],
      example: '例：面积12.6m²，面密度40kg/m²\nW_plate = 12.6×40 = 504kg'
    }
  ];

  const platformConstants = [
    { name: '主梁标准间距', value: '0.8 m', description: '主梁的标准间距' },
    { name: '次梁标准间距', value: '1.2 m', description: '次梁的标准间距' },
    { name: '花纹板损耗率', value: '5%', description: '花纹板裁切损耗' },
    { name: '花纹板面密度', value: '40 kg/m²', description: '5mm花纹板面密度' },
    { name: '槽钢线密度', value: '12.06 kg/m', description: '12#槽钢线密度' },
    { name: '设计荷载', value: '3.5 kN/m²', description: '平台标准设计荷载' },
    { name: '安全系数', value: '1.5', description: '平台结构安全系数' }
  ];

  return (
    <Card
      title={<Space><AppstoreOutlined style={{ color: '#52c41a' }} />平台计算器</Space>}
      bordered
    >
      <Alert
        message="功能说明"
        description="根据平台尺寸和设备重量，自动选择合适的材料规格并计算用量。"
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
              length: 4,
              width: 3,
              height: 2,
              equipmentWeight: 1500,
              isSquareTube: false,
            }}
          >
            <Form.Item
              label="平台长度 (m)"
              name="length"
              rules={[{ required: true, message: '请输入长度' }]}
            >
              <InputNumber min={1} max={20} step={0.1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="平台宽度 (m)"
              name="width"
              rules={[{ required: true, message: '请输入宽度' }]}
            >
              <InputNumber min={1} max={10} step={0.1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="平台高度 (m)"
              name="height"
              rules={[{ required: true, message: '请输入高度' }]}
            >
              <InputNumber min={0.5} max={10} step={0.1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="设备重量 (kg)"
              name="equipmentWeight"
              rules={[{ required: true, message: '请输入设备重量' }]}
            >
              <InputNumber min={0} max={10000} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="使用方管"
              name="isSquareTube"
              valuePropName="checked"
              tooltip="选择使用焊接方管或槽钢"
            >
              <Switch checkedChildren="方管" unCheckedChildren="槽钢" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<CalculatorOutlined />}>
                开始计算
              </Button>
            </Form.Item>
          </Form>

          {totalWeight > 0 && (
            <Card size="small" style={{ marginTop: 16, background: '#f6ffed' }}>
              <Statistic
                title="平台结构总重量"
                value={totalWeight.toFixed(2)}
                suffix="kg"
                valueStyle={{ color: '#52c41a', fontWeight: 600, fontSize: 24 }}
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
        title="平台计算公式"
        formulas={platformFormulas}
        constants={platformConstants}
      />
    </Card>
  );
};

export default PlatformCalculator;
