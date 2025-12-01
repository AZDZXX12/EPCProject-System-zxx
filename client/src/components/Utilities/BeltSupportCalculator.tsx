import React, { useState } from 'react';
import { Card, Form, InputNumber, Switch, Button, Descriptions, message, Row, Col, Alert, Space, Statistic, Divider, Select } from 'antd';
import { CalculatorOutlined, BuildOutlined } from '@ant-design/icons';
import FormulaDisplay from './FormulaDisplay';

const { Option } = Select;

interface BeltSupportResult {
  endHeight: number;
  avgSpacing: number;
  legCount: number;
  legInfo: string;
  crossCount: number;
  diagonalCount: number;
  edgeLegCount: number;
  edgeBeamLength: number;
  totalChannelSteel: number;
  totalAngleIron: number;
  channelWeight: number;
  angleWeight: number;
  weldingRodWeight: number;
  totalWeight: number;
}

const BeltSupportCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BeltSupportResult | null>(null);

  const handleCalculate = (values: any) => {
    setLoading(true);
    try {
      const { beltAngle, beltWidth, minHeight, beltLength, hasOverlap, overlapDist, edgeCount } = values;

      const PI = 3.14159265358979;
      const FRAME_WIDTH_EXTENSION = 0.4; // 支架宽度扩展量(m)
      const MIN_LEG_COUNT = 2;
      const MAX_SPACING = 6; // 最大支腿间距(m)
      const MIN_SPACING = 3; // 最小支腿间距(m)
      const LEG_BASE_HEIGHT = 0.05; // 支腿基础高度(5cm)
      const CROSS_SPACING = 1.5; // 横撑间距(m)
      const EDGE_LEG_SPACING = 1.3; // 挡边支腿间距(m)
      const EDGE_LEG_HEIGHT = 0.8; // 挡边支腿高度(m)
      const CHANNEL_DENSITY = 7.85; // 槽钢密度(kg/m)
      const ANGLE_DENSITY = 3.77; // 角铁密度(kg/m)
      const WELDING_ROD_PER_METER = 0.3; // 每米材料焊条用量(kg/m)

      // 基本参数计算
      const theta = (beltAngle * PI) / 180;
      let Lh, Hd, tanTheta;

      if (Math.abs(beltAngle) < 0.001) {
        Lh = beltLength;
        Hd = 0;
        tanTheta = 0;
      } else {
        Lh = beltLength * Math.cos(theta);
        Hd = beltLength * Math.sin(theta);
        tanTheta = Math.tan(theta);
      }

      const endHeight = minHeight + Hd;
      const frameWidth = beltWidth / 1000 + FRAME_WIDTH_EXTENSION;

      // 支腿计算
      let legCount = Math.round(Lh / ((MIN_SPACING + MAX_SPACING) / 2));
      if (legCount < MIN_LEG_COUNT) legCount = MIN_LEG_COUNT;

      let avgSpacing = Lh / (legCount - 1);
      if (avgSpacing > MAX_SPACING) {
        legCount = legCount + 1;
        avgSpacing = Lh / (legCount - 1);
      } else if (avgSpacing < MIN_SPACING) {
        legCount = legCount - 1;
        if (legCount < MIN_LEG_COUNT) legCount = MIN_LEG_COUNT;
        avgSpacing = Lh / (legCount - 1);
      }

      const legHeights: number[] = [];
      const legCrossCount: number[] = [];
      let crossCount = 0;
      let legInfo = '';
      let totalLegLength = 0;

      for (let i = 0; i < legCount; i++) {
        const x = legCount > 1 ? i * avgSpacing : 0;
        const legHeight = minHeight + x * tanTheta + LEG_BASE_HEIGHT;
        legHeights.push(legHeight);

        const nTiers = Math.ceil(legHeight / CROSS_SPACING);
        legCrossCount.push(nTiers);
        crossCount += nTiers;

        totalLegLength += legHeight;

        if (legInfo !== '') legInfo += ', ';
        legInfo += `${legHeight.toFixed(2)}m(${nTiers}横撑)`;
      }

      // 横撑总长度
      const totalCrossLength = crossCount * frameWidth;

      // 斜拉杆计算
      const diagLength = Math.sqrt(Math.pow(frameWidth / 2, 2) + Math.pow(CROSS_SPACING, 2));
      let diagonalCount = 0;
      let totalDiagLength = 0;

      if (legCount > 1) {
        for (let i = 0; i < legCount - 1; i++) {
          const maxH = Math.max(legHeights[i], legHeights[i + 1]);
          const nTiers = Math.ceil(maxH / CROSS_SPACING);

          if (nTiers > 2) {
            diagonalCount += (nTiers - 1) * 2;
            totalDiagLength += diagLength * (nTiers - 1) * 2;
          }
        }
      }

      // 挡边计算
      let edgeBeamLength, edgeLegCount;
      if (hasOverlap) {
        edgeBeamLength = overlapDist;
        const singleEdgeLegCount = Math.round(overlapDist / EDGE_LEG_SPACING) + 2;
        edgeLegCount = singleEdgeLegCount * edgeCount + 2;
      } else {
        edgeBeamLength = frameWidth;
        const singleEdgeLegCount = Math.round(frameWidth / EDGE_LEG_SPACING) + 2;
        edgeLegCount = singleEdgeLegCount * edgeCount + 2;
      }

      // 材料总计
      const totalChannelSteel = totalLegLength + totalCrossLength;
      const totalAngleIron = totalDiagLength + edgeLegCount * EDGE_LEG_HEIGHT + edgeBeamLength;

      // 计算重量
      const channelWeight = totalChannelSteel * CHANNEL_DENSITY;
      const angleWeight = totalAngleIron * ANGLE_DENSITY;
      const weldingRodWeight = (totalChannelSteel + totalAngleIron) * WELDING_ROD_PER_METER;
      const totalWeight = channelWeight + angleWeight;

      setResult({
        endHeight: Math.round(endHeight * 100) / 100,
        avgSpacing: Math.round(avgSpacing * 10) / 10,
        legCount,
        legInfo,
        crossCount,
        diagonalCount,
        edgeLegCount,
        edgeBeamLength: Math.round(edgeBeamLength * 100) / 100,
        totalChannelSteel: Math.round(totalChannelSteel * 100) / 100,
        totalAngleIron: Math.round(totalAngleIron * 100) / 100,
        channelWeight: Math.round(channelWeight * 10) / 10,
        angleWeight: Math.round(angleWeight * 10) / 10,
        weldingRodWeight: Math.round(weldingRodWeight * 10) / 10,
        totalWeight: Math.round(totalWeight * 10) / 10,
      });

      message.success('计算完成');
    } catch (error) {
      message.error('计算失败，请检查输入参数');
    } finally {
      setLoading(false);
    }
  };

  const beltFormulas = [
    {
      name: '支腿数量计算',
      formula: 'N_leg = floor(L / S_max) + 1',
      description: '根据皮带长度和最大间距计算支腿数量',
      variables: [
        { symbol: 'N_leg', name: '支腿数量', unit: '个' },
        { symbol: 'L', name: '皮带长度', unit: 'm' },
        { symbol: 'S_max', name: '最大间距', unit: 'm' }
      ],
      example: '例：皮带长度50m，最大间距6m\nN_leg = floor(50/6) + 1 = 9个'
    },
    {
      name: '平均间距计算',
      formula: 'S_avg = L / (N_leg - 1)',
      description: '计算支腿的平均间距',
      variables: [
        { symbol: 'S_avg', name: '平均间距', unit: 'm' },
        { symbol: 'L', name: '皮带长度', unit: 'm' },
        { symbol: 'N_leg', name: '支腿数量', unit: '个' }
      ],
      example: '例：皮带长度50m，支腿9个\nS_avg = 50/(9-1) = 6.25m'
    },
    {
      name: '横撑数量计算',
      formula: 'N_cross = ceil(H_max / S_cross) × N_leg',
      description: '根据最大高度和横撑间距计算横撑数量',
      variables: [
        { symbol: 'N_cross', name: '横撑数量', unit: '根' },
        { symbol: 'H_max', name: '最大高度', unit: 'm' },
        { symbol: 'S_cross', name: '横撑间距', unit: 'm' },
        { symbol: 'N_leg', name: '支腿数量', unit: '个' }
      ],
      example: '例：最大高度8m，横撑间距1.5m，支腿9个\nN_cross = ceil(8/1.5) × 9 = 6 × 9 = 54根'
    },
    {
      name: '斜拉杆数量计算',
      formula: 'N_diag = (N_leg - 1) × N_layer × 2',
      description: '计算斜拉杆数量，每跨每层2根',
      variables: [
        { symbol: 'N_diag', name: '斜拉杆数量', unit: '根' },
        { symbol: 'N_leg', name: '支腿数量', unit: '个' },
        { symbol: 'N_layer', name: '横撑层数', unit: '层' }
      ],
      example: '例：支腿9个，横撑6层\nN_diag = (9-1) × 6 × 2 = 96根'
    },
    {
      name: '槽钢重量计算',
      formula: 'W_channel = L_total × rho_channel',
      description: '计算槽钢总重量',
      variables: [
        { symbol: 'W_channel', name: '槽钢重量', unit: 'kg' },
        { symbol: 'L_total', name: '槽钢总长度', unit: 'm' },
        { symbol: 'ρ_channel', name: '槽钢线密度', unit: 'kg/m' }
      ],
      example: '例：槽钢总长度200m，线密度7.85kg/m\nW_channel = 200 × 7.85 = 1570 kg'
    },
    {
      name: '角铁重量计算',
      formula: 'W_angle = (N_cross + N_diag) × L_avg × rho_angle',
      description: '计算角铁总重量',
      variables: [
        { symbol: 'W_angle', name: '角铁重量', unit: 'kg' },
        { symbol: 'N_cross', name: '横撑数量', unit: '根' },
        { symbol: 'N_diag', name: '斜拉杆数量', unit: '根' },
        { symbol: 'L_avg', name: '平均长度', unit: 'm' },
        { symbol: 'ρ_angle', name: '角铁线密度', unit: 'kg/m' }
      ],
      example: '例：横撑54根，斜拉杆96根，平均长度2m，线密度3.77kg/m\nW_angle = (54+96) × 2 × 3.77 = 1131 kg'
    }
  ];

  const beltConstants = [
    { name: '最大支腿间距', value: '6 m', description: '皮带支架支腿最大允许间距' },
    { name: '最小支腿间距', value: '3 m', description: '皮带支架支腿最小间距' },
    { name: '横撑标准间距', value: '1.5 m', description: '横撑的标准间距' },
    { name: '槽钢线密度', value: '7.85 kg/m', description: '10#槽钢的线密度' },
    { name: '角铁线密度', value: '3.77 kg/m', description: 'L50×5角铁的线密度' },
    { name: '焊条系数', value: '0.3 kg/m', description: '每米材料焊条用量' },
    { name: '挡边支腿系数', value: '1.2', description: '挡边支腿高度修正系数' },
    { name: '安全系数', value: '1.1', description: '结构设计安全系数' }
  ];

  return (
    <Card
      title={<Space><BuildOutlined style={{ color: '#722ed1' }} />皮带支架计算器</Space>}
      bordered
    >
      <Alert
        message="功能说明"
        description="根据皮带角度、长度、宽度等参数，计算支架所需的槽钢、角铁用量及焊条消耗。"
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
              beltAngle: 15,
              beltWidth: 800,
              minHeight: 2,
              beltLength: 20,
              hasOverlap: false,
              overlapDist: 3,
              edgeCount: 2,
            }}
          >
            <Form.Item
              label="皮带角度 (度)"
              name="beltAngle"
              rules={[{ required: true, message: '请输入角度' }]}
              tooltip="0度表示水平皮带"
            >
              <InputNumber min={0} max={45} step={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="皮带宽度 (mm)"
              name="beltWidth"
              rules={[{ required: true, message: '请输入宽度' }]}
            >
              <InputNumber min={400} max={2000} step={50} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="最低点高度 (m)"
              name="minHeight"
              rules={[{ required: true, message: '请输入高度' }]}
            >
              <InputNumber min={0.5} max={20} step={0.1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="皮带长度 (m)"
              name="beltLength"
              rules={[{ required: true, message: '请输入长度' }]}
            >
              <InputNumber min={3} max={100} step={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="是否有重叠段"
              name="hasOverlap"
              valuePropName="checked"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>

            <Form.Item
              label="重叠距离 (m)"
              name="overlapDist"
              tooltip="仅在有重叠段时有效"
            >
              <InputNumber min={1} max={10} step={0.1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="挡边数量"
              name="edgeCount"
              rules={[{ required: true, message: '请选择挡边数量' }]}
            >
              <Select>
                <Option value={0}>无挡边</Option>
                <Option value={1}>单侧挡边</Option>
                <Option value={2}>双侧挡边</Option>
              </Select>
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
              <Card title="支架参数" bordered style={{ marginBottom: 16, background: '#f9f0ff' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="支腿数量"
                      value={result.legCount}
                      suffix="个"
                      valueStyle={{ color: '#722ed1', fontWeight: 600 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="平均间距"
                      value={result.avgSpacing}
                      suffix="m"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="末端高度"
                      value={result.endHeight}
                      suffix="m"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                </Row>
                <Divider />
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="支腿详情">{result.legInfo}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="构件统计" bordered style={{ marginBottom: 16, background: '#e6f7ff' }}>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="横撑数量">{result.crossCount} 个</Descriptions.Item>
                  <Descriptions.Item label="斜拉杆数量">{result.diagonalCount} 根</Descriptions.Item>
                  <Descriptions.Item label="挡边支腿">{result.edgeLegCount} 个</Descriptions.Item>
                  <Descriptions.Item label="挡边横梁">{result.edgeBeamLength} m</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="材料用量" bordered style={{ marginBottom: 16, background: '#f6ffed' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="槽钢总长"
                      value={result.totalChannelSteel}
                      suffix="m"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="角铁总长"
                      value={result.totalAngleIron}
                      suffix="m"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="焊条用量"
                      value={result.weldingRodWeight}
                      suffix="kg"
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                </Row>
              </Card>

              <Card title="重量统计" bordered style={{ background: '#fff1f0' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="槽钢重量"
                      value={result.channelWeight}
                      suffix="kg"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="角铁重量"
                      value={result.angleWeight}
                      suffix="kg"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="钢材总重"
                      value={result.totalWeight}
                      suffix="kg"
                      valueStyle={{ color: '#ff4d4f', fontWeight: 600, fontSize: 24 }}
                    />
                  </Col>
                </Row>
                <Divider />
                <Alert
                  message="计算说明"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>支腿间距控制在3-6米之间</li>
                      <li>横撑间距按1.5米设置</li>
                      <li>槽钢密度按7.85 kg/m计算</li>
                      <li>角铁密度按3.77 kg/m计算</li>
                      <li>焊条用量按每米材料0.3kg估算</li>
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
        title="皮带支架计算公式"
        formulas={beltFormulas}
        constants={beltConstants}
      />
    </Card>
  );
};

export default BeltSupportCalculator;
