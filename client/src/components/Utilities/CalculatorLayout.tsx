import React, { ReactNode } from 'react';
import { Card, Row, Col, Alert, Empty } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import './CalculatorLayout.css';
import './CalculatorMobile.css';

interface CalculatorLayoutProps {
  title: string;
  icon: ReactNode;
  description: string;
  formContent: ReactNode;
  resultContent?: ReactNode;
  formulaContent?: ReactNode;
  tips?: string[];
  iconColor?: string;
}

const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  title,
  icon,
  description,
  formContent,
  resultContent,
  formulaContent,
  tips,
  iconColor = '#1890ff',
}) => {
  return (
    <div className="calculator-layout">
      <Card
        className="calculator-card"
        title={
          <div className="calculator-header">
            <span className="calculator-icon" style={{ color: iconColor }}>
              {icon}
            </span>
            <span className="calculator-title">{title}</span>
          </div>
        }
      >
        <Alert
          message="功能说明"
          description={description}
          type="info"
          showIcon
          className="calculator-description"
        />

        <Row gutter={24} className="calculator-content">
          <Col xs={24} lg={10} className="calculator-form-col">
            <div className="calculator-form">
              {formContent}
            </div>
          </Col>

          <Col xs={24} lg={14} className="calculator-result-col">
            {resultContent ? (
              <div className="calculator-results">
                {resultContent}
              </div>
            ) : (
              <div className="calculator-placeholder">
                <div className="placeholder-icon">📊</div>
                <p className="placeholder-text">请输入参数并点击计算按钮</p>
                <p className="placeholder-subtext">计算结果将在此处显示</p>
              </div>
            )}
          </Col>
        </Row>

        {formulaContent && (
          <div className="calculator-formula-section">
            {formulaContent}
          </div>
        )}

        {tips && tips.length > 0 && (
          <Alert
            message="使用提示"
            description={
              <ul className="calculator-tips">
                {tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            }
            type="warning"
            showIcon
            className="calculator-tips-alert"
          />
        )}
      </Card>
    </div>
  );
};

export default CalculatorLayout;
