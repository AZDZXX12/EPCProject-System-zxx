import React, { useState } from 'react';
import { Card, Collapse, Typography, Tag, Divider, Space } from 'antd';
import { FunctionOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './FormulaDisplay.css';
import './FormulaMobile.css';

const { Panel } = Collapse;
const { Text, Title } = Typography;

interface FormulaItem {
  name: string;
  formula: string;
  description: string;
  variables: { symbol: string; name: string; unit?: string }[];
  example?: string;
}

interface FormulaDisplayProps {
  title: string;
  formulas: FormulaItem[];
  constants?: { name: string; value: string; description: string }[];
}

const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ title, formulas, constants }) => {
  const [activeKey, setActiveKey] = useState<string | string[]>(['0']);

  const renderFormula = (formula: string) => {
    // 简单的数学公式渲染，将常见符号转换为更好看的形式
    return formula
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/sqrt\(/g, '√(')
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/pi/g, 'π')
      .replace(/delta/g, 'Δ')
      .replace(/rho/g, 'ρ')
      .replace(/mu/g, 'μ')
      .replace(/eta/g, 'η');
  };

  return (
    <Card 
      className="formula-display-card"
      title={
        <Space>
          <FunctionOutlined className="formula-icon" />
          <span>{title}</span>
        </Space>
      }
    >
      <Collapse 
        activeKey={activeKey} 
        onChange={setActiveKey}
        className="formula-collapse"
      >
        {formulas.map((formula, index) => (
          <Panel 
            header={
              <Space>
                <Tag color="blue">{`公式 ${index + 1}`}</Tag>
                <Text strong>{formula.name}</Text>
              </Space>
            } 
            key={index.toString()}
          >
            <div className="formula-content">
              <div className="formula-section">
                <Title level={5}>
                  <InfoCircleOutlined className="section-icon" />
                  计算公式
                </Title>
                <div className="formula-box">
                  <Text code className="formula-text">
                    {renderFormula(formula.formula)}
                  </Text>
                </div>
              </div>

              <Divider />

              <div className="formula-section">
                <Title level={5}>变量说明</Title>
                <div className="variables-grid">
                  {formula.variables.map((variable, idx) => (
                    <div key={idx} className="variable-item">
                      <Text strong className="variable-symbol">{variable.symbol}</Text>
                      <Text className="variable-name">{variable.name}</Text>
                      {variable.unit && (
                        <Tag className="variable-unit">{variable.unit}</Tag>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Divider />

              <div className="formula-section">
                <Title level={5}>说明</Title>
                <Text className="formula-description">{formula.description}</Text>
              </div>

              {formula.example && (
                <>
                  <Divider />
                  <div className="formula-section">
                    <Title level={5}>计算示例</Title>
                    <div className="example-box">
                      <Text className="example-text">{formula.example}</Text>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Panel>
        ))}
      </Collapse>

      {constants && constants.length > 0 && (
        <>
          <Divider />
          <div className="constants-section">
            <Title level={5}>
              <InfoCircleOutlined className="section-icon" />
              常用常数
            </Title>
            <div className="constants-grid">
              {constants.map((constant, index) => (
                <div key={index} className="constant-item">
                  <Text strong>{constant.name}</Text>
                  <Text code>{constant.value}</Text>
                  <Text type="secondary" className="constant-desc">
                    {constant.description}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default FormulaDisplay;
