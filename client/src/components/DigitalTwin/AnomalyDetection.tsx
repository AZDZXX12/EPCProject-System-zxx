import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Badge, Space, Button, Timeline, Alert, Statistic, Row, Col, Modal } from 'antd';
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  BellOutlined,
  EyeOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './AnomalyDetection.css';

interface Anomaly {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'temperature' | 'vibration' | 'pressure' | 'efficiency' | 'power';
  severity: 'critical' | 'high' | 'medium' | 'low';
  value: number;
  normalRange: [number, number];
  deviation: number;
  detectedAt: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  description: string;
  aiConfidence: number;
}

interface AnomalyDetectionProps {
  equipmentId?: string;
}

const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({ equipmentId }) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  useEffect(() => {
    // 模拟实时异常检测
    const mockAnomalies: Anomaly[] = [
      {
        id: 'a1',
        equipmentId: 'eq-001',
        equipmentName: '反应釜A',
        type: 'temperature',
        severity: 'critical',
        value: 185,
        normalRange: [60, 120],
        deviation: 54.2,
        detectedAt: new Date(Date.now() - 5 * 60 * 1000),
        status: 'active',
        description: '温度异常升高，超出正常范围54.2%，可能导致设备损坏',
        aiConfidence: 96
      },
      {
        id: 'a2',
        equipmentId: 'eq-003',
        equipmentName: '输送泵C',
        type: 'vibration',
        severity: 'high',
        value: 8.5,
        normalRange: [0, 5],
        deviation: 70,
        detectedAt: new Date(Date.now() - 15 * 60 * 1000),
        status: 'active',
        description: '振动幅度异常，超出正常范围70%，建议立即检查轴承',
        aiConfidence: 89
      },
      {
        id: 'a3',
        equipmentId: 'eq-005',
        equipmentName: '冷却塔B',
        type: 'efficiency',
        severity: 'medium',
        value: 72,
        normalRange: [85, 95],
        deviation: -15.3,
        detectedAt: new Date(Date.now() - 30 * 60 * 1000),
        status: 'acknowledged',
        description: '冷却效率下降15.3%，可能是填料堵塞导致',
        aiConfidence: 82
      },
      {
        id: 'a4',
        equipmentId: 'eq-007',
        equipmentName: '压缩机D',
        type: 'pressure',
        severity: 'high',
        value: 12.5,
        normalRange: [8, 10],
        deviation: 25,
        detectedAt: new Date(Date.now() - 45 * 60 * 1000),
        status: 'active',
        description: '出口压力异常升高25%，可能存在管路堵塞',
        aiConfidence: 91
      },
      {
        id: 'a5',
        equipmentId: 'eq-002',
        equipmentName: '搅拌器B',
        type: 'power',
        severity: 'low',
        value: 8.2,
        normalRange: [10, 15],
        deviation: -18,
        detectedAt: new Date(Date.now() - 60 * 60 * 1000),
        status: 'resolved',
        description: '功率消耗异常降低，已确认为空载运行',
        aiConfidence: 75
      }
    ];

    setAnomalies(mockAnomalies);

    // 模拟新异常检测
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAnomaly: Anomaly = {
          id: `a${Date.now()}`,
          equipmentId: 'eq-' + Math.floor(Math.random() * 10).toString().padStart(3, '0'),
          equipmentName: '设备' + String.fromCharCode(65 + Math.floor(Math.random() * 10)),
          type: ['temperature', 'vibration', 'pressure', 'efficiency', 'power'][Math.floor(Math.random() * 5)] as any,
          severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any,
          value: 100 + Math.random() * 50,
          normalRange: [60, 120],
          deviation: 20 + Math.random() * 60,
          detectedAt: new Date(),
          status: 'active',
          description: '检测到异常数据',
          aiConfidence: 70 + Math.random() * 30
        };
        setAnomalies(prev => [newAnomaly, ...prev].slice(0, 10));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [equipmentId]);

  const getSeverityConfig = (severity: string) => {
    const configs = {
      critical: { color: 'error', text: '严重', icon: <CloseCircleOutlined /> },
      high: { color: 'warning', text: '高', icon: <ExclamationCircleOutlined /> },
      medium: { color: 'processing', text: '中', icon: <WarningOutlined /> },
      low: { color: 'default', text: '低', icon: <CheckCircleOutlined /> }
    };
    return configs[severity as keyof typeof configs] || configs.low;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      temperature: '温度',
      vibration: '振动',
      pressure: '压力',
      efficiency: '效率',
      power: '功率'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { color: 'red', text: '活跃' },
      acknowledged: { color: 'orange', text: '已确认' },
      resolved: { color: 'green', text: '已解决' }
    };
    return configs[status as keyof typeof configs] || configs.active;
  };

  const handleAcknowledge = (anomaly: Anomaly) => {
    setAnomalies(prev =>
      prev.map(a => a.id === anomaly.id ? { ...a, status: 'acknowledged' } : a)
    );
  };

  const handleResolve = (anomaly: Anomaly) => {
    Modal.confirm({
      title: '确认解决异常',
      content: `确认 ${anomaly.equipmentName} 的 ${getTypeLabel(anomaly.type)} 异常已解决？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setAnomalies(prev =>
          prev.map(a => a.id === anomaly.id ? { ...a, status: 'resolved' } : a)
        );
      }
    });
  };

  const handleViewDetail = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
    setDetailModalVisible(true);
  };

  const columns: ColumnsType<Anomaly> = [
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 120,
      render: (text) => <span className="equipment-name-text">{text}</span>
    },
    {
      title: '异常类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => <Tag color="blue">{getTypeLabel(type)}</Tag>
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => {
        const config = getSeverityConfig(severity);
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      }
    },
    {
      title: '当前值',
      dataIndex: 'value',
      key: 'value',
      width: 100,
      render: (value) => <span className="value-text">{value.toFixed(1)}</span>
    },
    {
      title: '偏差',
      dataIndex: 'deviation',
      key: 'deviation',
      width: 100,
      render: (deviation) => (
        <span className={deviation > 0 ? 'deviation-positive' : 'deviation-negative'}>
          {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
        </span>
      )
    },
    {
      title: 'AI置信度',
      dataIndex: 'aiConfidence',
      key: 'aiConfidence',
      width: 120,
      render: (confidence) => (
        <div className="confidence-cell">
          <div className={`confidence-bar confidence-bar-${Math.floor(confidence / 20)}`} />
          <span className="confidence-text">{confidence}%</span>
        </div>
      )
    },
    {
      title: '检测时间',
      dataIndex: 'detectedAt',
      key: 'detectedAt',
      width: 100,
      render: (date: Date) => {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        return <span className="time-ago">{minutes}分钟前</span>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = getStatusConfig(status);
        return <Badge status={config.color as any} text={config.text} />;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'active' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleAcknowledge(record)}
            >
              确认
            </Button>
          )}
          {record.status === 'acknowledged' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleResolve(record)}
            >
              解决
            </Button>
          )}
        </Space>
      )
    }
  ];

  const activeAnomalies = anomalies.filter(a => a.status === 'active');
  const criticalCount = activeAnomalies.filter(a => a.severity === 'critical').length;
  const highCount = activeAnomalies.filter(a => a.severity === 'high').length;

  return (
    <div className="anomaly-detection">
      {criticalCount > 0 && (
        <Alert
          message="检测到严重异常"
          description={`当前有 ${criticalCount} 个严重异常需要立即处理！`}
          type="error"
          showIcon
          icon={<WarningOutlined />}
          closable
          className="critical-alert"
        />
      )}

      <Card
        title={
          <Space>
            <BellOutlined />
            <span>AI异常检测</span>
            <Badge count={activeAnomalies.length} className="anomaly-badge" />
          </Space>
        }
        extra={
          <Tag color="purple" icon={<BellOutlined />}>
            实时监控中
          </Tag>
        }
        className="detection-card"
      >
        <Row gutter={16} className="stats-row">
          <Col span={6}>
            <Statistic
              title="活跃异常"
              value={activeAnomalies.length}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="严重异常"
              value={criticalCount}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="高级异常"
              value={highCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="24h检测总数"
              value={anomalies.length}
              prefix={<BellOutlined />}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={anomalies}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条异常记录`
          }}
          className="anomaly-table"
          rowClassName={(record) => `anomaly-row anomaly-row-${record.severity}`}
        />
      </Card>

      {/* 详情Modal */}
      <Modal
        title={
          <Space>
            <WarningOutlined />
            <span>异常详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          selectedAnomaly?.status === 'active' && (
            <Button
              key="acknowledge"
              type="primary"
              onClick={() => {
                if (selectedAnomaly) {
                  handleAcknowledge(selectedAnomaly);
                  setDetailModalVisible(false);
                }
              }}
            >
              确认异常
            </Button>
          )
        ]}
        width={700}
        className="anomaly-detail-modal"
      >
        {selectedAnomaly && (
          <div className="anomaly-detail">
            <div className="detail-header">
              <Space size="large">
                <div className="detail-item">
                  <span className="detail-label">设备名称：</span>
                  <span className="detail-value">{selectedAnomaly.equipmentName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">异常类型：</span>
                  <Tag color="blue">{getTypeLabel(selectedAnomaly.type)}</Tag>
                </div>
                <div className="detail-item">
                  <span className="detail-label">严重程度：</span>
                  <Tag color={getSeverityConfig(selectedAnomaly.severity).color} icon={getSeverityConfig(selectedAnomaly.severity).icon}>
                    {getSeverityConfig(selectedAnomaly.severity).text}
                  </Tag>
                </div>
              </Space>
            </div>

            <div className="detail-section">
              <h4>异常数据</h4>
              <Row gutter={16}>
                <Col span={8}>
                  <div className="data-box">
                    <div className="data-label">当前值</div>
                    <div className="data-value critical">{selectedAnomaly.value.toFixed(2)}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="data-box">
                    <div className="data-label">正常范围</div>
                    <div className="data-value normal">
                      {selectedAnomaly.normalRange[0]} - {selectedAnomaly.normalRange[1]}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="data-box">
                    <div className="data-label">偏差幅度</div>
                    <div className={`data-value ${selectedAnomaly.deviation > 0 ? 'positive' : 'negative'}`}>
                      {selectedAnomaly.deviation > 0 ? '+' : ''}{selectedAnomaly.deviation.toFixed(1)}%
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            <div className="detail-section">
              <h4>AI分析</h4>
              <div className="ai-analysis">
                <div className="analysis-item">
                  <span className="analysis-label">置信度：</span>
                  <div className="confidence-progress">
                    <div className={`confidence-bar-full confidence-bar-full-${Math.floor(selectedAnomaly.aiConfidence / 20)}`} />
                    <span className="confidence-percentage">{selectedAnomaly.aiConfidence}%</span>
                  </div>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">描述：</span>
                  <p className="analysis-description">{selectedAnomaly.description}</p>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>处理建议</h4>
              <Timeline
                items={[
                  { children: '立即停机检查设备运行状态', color: 'red' },
                  { children: '检查相关传感器是否正常', color: 'orange' },
                  { children: '联系维护人员进行详细诊断', color: 'blue' },
                  { children: '记录异常数据用于后续分析', color: 'green' }
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AnomalyDetection;
