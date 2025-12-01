import React, { useState, useEffect } from 'react';
import { Card, Alert, Progress, Tag, Button, Space, List, Badge, Modal, Descriptions } from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import './PredictiveMaintenance.css';

interface MaintenancePrediction {
  id: string;
  equipmentId: string;
  equipmentName: string;
  predictedFailureDate: Date;
  daysUntilFailure: number;
  confidence: number;
  severity: 'high' | 'medium' | 'low';
  reasons: string[];
  recommendations: string[];
  affectedComponents: string[];
  estimatedCost?: number;
  estimatedDowntime?: number;
}

interface PredictiveMaintenanceProps {
  equipmentId?: string;
}

const PredictiveMaintenance: React.FC<PredictiveMaintenanceProps> = ({ equipmentId }) => {
  const [predictions, setPredictions] = useState<MaintenancePrediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<MaintenancePrediction | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    // 模拟AI预测数据
    const mockPredictions: MaintenancePrediction[] = [
      {
        id: '1',
        equipmentId: 'eq-001',
        equipmentName: '反应釜A',
        predictedFailureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        daysUntilFailure: 7,
        confidence: 89,
        severity: 'high',
        reasons: [
          '温度波动异常增大（+15%）',
          '振动频率超出正常范围',
          '运行时长已达8500小时（临近维护周期）'
        ],
        recommendations: [
          '建议7天内安排停机检修',
          '重点检查密封件和轴承',
          '准备备用反应釜应急启用',
          '提前采购密封件（型号：SB-458）'
        ],
        affectedComponents: ['密封件', '主轴承', '温度传感器'],
        estimatedCost: 12500,
        estimatedDowntime: 8
      },
      {
        id: '2',
        equipmentId: 'eq-003',
        equipmentName: '输送泵C',
        predictedFailureDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        daysUntilFailure: 14,
        confidence: 76,
        severity: 'medium',
        reasons: [
          '电机电流波动加剧',
          '出口压力不稳定',
          '累计运行15000小时'
        ],
        recommendations: [
          '建议14天内安排维护保养',
          '检查泵叶轮磨损情况',
          '清洁过滤器',
          '更换润滑油'
        ],
        affectedComponents: ['叶轮', '机械密封', '电机'],
        estimatedCost: 3800,
        estimatedDowntime: 4
      },
      {
        id: '3',
        equipmentId: 'eq-005',
        equipmentName: '冷却塔B',
        predictedFailureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        daysUntilFailure: 30,
        confidence: 62,
        severity: 'low',
        reasons: [
          '冷却效率轻微下降（-3%）',
          '填料使用时间较长',
          '水质检测指标接近临界值'
        ],
        recommendations: [
          '30天内安排常规保养',
          '清洗填料',
          '检查水质处理系统',
          '补充冷却水'
        ],
        affectedComponents: ['填料', '喷淋系统', '收水器'],
        estimatedCost: 1500,
        estimatedDowntime: 2
      }
    ];

    setPredictions(mockPredictions);
  }, [equipmentId]);

  const getSeverityConfig = (severity: string) => {
    const configs = {
      high: { color: 'error', icon: <WarningOutlined />, text: '高风险' },
      medium: { color: 'warning', icon: <ClockCircleOutlined />, text: '中风险' },
      low: { color: 'success', icon: <CheckCircleOutlined />, text: '低风险' }
    };
    return configs[severity as keyof typeof configs] || configs.low;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#ff4d4f';
    if (confidence >= 60) return '#faad14';
    return '#52c41a';
  };

  const handleShowDetail = (prediction: MaintenancePrediction) => {
    setSelectedPrediction(prediction);
    setDetailModalVisible(true);
  };

  const handleScheduleMaintenance = (prediction: MaintenancePrediction) => {
    Modal.confirm({
      title: '安排维护计划',
      content: `确认为 ${prediction.equipmentName} 安排维护计划？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        // 这里实现安排维护的逻辑
        console.log('安排维护:', prediction);
      }
    });
  };

  return (
    <div className="predictive-maintenance">
      <Card
        title={
          <Space>
            <ThunderboltOutlined />
            <span>AI预测性维护</span>
            <Badge count={predictions.length} className="prediction-badge" />
          </Space>
        }
        extra={
          <Tag color="purple" icon={<ThunderboltOutlined />}>
            AI引擎运行中
          </Tag>
        }
        className="maintenance-card"
      >
        {predictions.length === 0 ? (
          <Alert
            message="系统运行正常"
            description="当前所有设备运行状态良好，暂无需要关注的预测性维护项目。"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        ) : (
          <List
            dataSource={predictions}
            renderItem={pred => {
              const severityConfig = getSeverityConfig(pred.severity);
              return (
                <List.Item className="prediction-item">
                  <Card
                    className={`prediction-card prediction-${pred.severity}`}
                    hoverable
                  >
                    <div className="prediction-header">
                      <Space>
                        <Badge status={severityConfig.color as any} />
                        <span className="equipment-name">{pred.equipmentName}</span>
                        <Tag color={severityConfig.color}>{severityConfig.text}</Tag>
                      </Space>
                      <div className="prediction-days">
                        <span className="days-number">{pred.daysUntilFailure}</span>
                        <span className="days-label">天后需维护</span>
                      </div>
                    </div>

                    <div className="prediction-content">
                      <div className="confidence-section">
                        <div className="confidence-label">
                          <InfoCircleOutlined /> AI置信度
                        </div>
                        <Progress
                          percent={pred.confidence}
                          strokeColor={getConfidenceColor(pred.confidence)}
                          className="confidence-progress"
                        />
                      </div>

                      <div className="reasons-section">
                        <div className="section-title">主要原因</div>
                        <ul className="reasons-list">
                          {pred.reasons.slice(0, 2).map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                          {pred.reasons.length > 2 && (
                            <li className="more-link" onClick={() => handleShowDetail(pred)}>
                              +{pred.reasons.length - 2} 更多...
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="recommendations-section">
                        <div className="section-title">维护建议</div>
                        <div className="recommendation-preview">
                          {pred.recommendations[0]}
                        </div>
                      </div>

                      {(pred.estimatedCost || pred.estimatedDowntime) && (
                        <div className="estimates-section">
                          <Space size="large">
                            {pred.estimatedCost && (
                              <div className="estimate-item">
                                <span className="estimate-label">预计费用</span>
                                <span className="estimate-value">¥{pred.estimatedCost.toLocaleString()}</span>
                              </div>
                            )}
                            {pred.estimatedDowntime && (
                              <div className="estimate-item">
                                <span className="estimate-label">停机时长</span>
                                <span className="estimate-value">{pred.estimatedDowntime}小时</span>
                              </div>
                            )}
                          </Space>
                        </div>
                      )}
                    </div>

                    <div className="prediction-actions">
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          icon={<ToolOutlined />}
                          onClick={() => handleScheduleMaintenance(pred)}
                        >
                          安排维护
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleShowDetail(pred)}
                        >
                          查看详情
                        </Button>
                      </Space>
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      {/* 详情Modal */}
      <Modal
        title={
          <Space>
            <ThunderboltOutlined />
            <span>维护预测详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="schedule"
            type="primary"
            icon={<ToolOutlined />}
            onClick={() => {
              if (selectedPrediction) {
                handleScheduleMaintenance(selectedPrediction);
                setDetailModalVisible(false);
              }
            }}
          >
            安排维护计划
          </Button>
        ]}
        width={700}
        className="prediction-detail-modal"
      >
        {selectedPrediction && (
          <div className="prediction-detail">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="设备名称" span={2}>
                {selectedPrediction.equipmentName}
              </Descriptions.Item>
              <Descriptions.Item label="预计故障时间">
                {selectedPrediction.predictedFailureDate.toLocaleDateString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="剩余天数">
                <Tag color="red">{selectedPrediction.daysUntilFailure}天</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="风险等级">
                <Tag color={getSeverityConfig(selectedPrediction.severity).color}>
                  {getSeverityConfig(selectedPrediction.severity).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="AI置信度">
                <Progress
                  percent={selectedPrediction.confidence}
                  strokeColor={getConfidenceColor(selectedPrediction.confidence)}
                  size="small"
                />
              </Descriptions.Item>
              {selectedPrediction.estimatedCost && (
                <Descriptions.Item label="预计费用">
                  ¥{selectedPrediction.estimatedCost.toLocaleString()}
                </Descriptions.Item>
              )}
              {selectedPrediction.estimatedDowntime && (
                <Descriptions.Item label="预计停机时长">
                  {selectedPrediction.estimatedDowntime}小时
                </Descriptions.Item>
              )}
            </Descriptions>

            <div className="detail-section">
              <h4>故障原因分析</h4>
              <ul>
                {selectedPrediction.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="detail-section">
              <h4>维护建议</h4>
              <ol>
                {selectedPrediction.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ol>
            </div>

            <div className="detail-section">
              <h4>受影响组件</h4>
              <Space wrap>
                {selectedPrediction.affectedComponents.map((component, index) => (
                  <Tag key={index} color="blue">{component}</Tag>
                ))}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PredictiveMaintenance;
