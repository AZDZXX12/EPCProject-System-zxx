import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Progress,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Input,
  Typography,
} from 'antd';
import {
  ExperimentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  FileSearchOutlined,
  RiseOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import PageContainer from '../components/Layout/PageContainer';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Title, Text } = Typography;

const Quality: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('全部');

  const qualityRecords = [
    {
      id: 1,
      deviceName: '聚合反应釜',
      deviceId: 'CHEM-R-001',
      testType: '压力试验',
      testDate: '2024-01-15',
      inspector: '张三',
      result: '合格',
      score: 98,
      remarks: '设备运行正常，各项指标符合标准',
    },
    {
      id: 2,
      deviceName: '列管式换热器',
      deviceId: 'CHEM-H-001',
      testType: '密封性测试',
      testDate: '2024-01-14',
      inspector: '李四',
      result: '合格',
      score: 95,
      remarks: '密封性能良好',
    },
    {
      id: 3,
      deviceName: '原料储罐',
      deviceId: 'CHEM-T-001',
      testType: '焊缝检测',
      testDate: '2024-01-13',
      inspector: '王五',
      result: '不合格',
      score: 65,
      remarks: '部分焊缝存在气孔，需返工处理',
    },
    {
      id: 4,
      deviceName: '离心泵',
      deviceId: 'CHEM-P-001',
      testType: '性能测试',
      testDate: '2024-01-12',
      inspector: '赵六',
      result: '合格',
      score: 92,
      remarks: '泵效满足设计要求',
    },
    {
      id: 5,
      deviceName: '压缩机',
      deviceId: 'CHEM-C-001',
      testType: '振动测试',
      testDate: '2024-01-11',
      inspector: '孙七',
      result: '合格',
      score: 88,
      remarks: '振动值在允许范围内',
    },
    {
      id: 6,
      deviceName: '气液分离器',
      deviceId: 'CHEM-S-001',
      testType: '材质检验',
      testDate: '2024-01-10',
      inspector: '周八',
      result: '合格',
      score: 96,
      remarks: '材料符合设计要求',
    },
    {
      id: 7,
      deviceName: '真空泵',
      deviceId: 'CHEM-V-001',
      testType: '气密性试验',
      testDate: '2024-01-09',
      inspector: '吴九',
      result: '待复检',
      score: 75,
      remarks: '首次检测发现微小泄漏，已整改待复检',
    },
    {
      id: 8,
      deviceName: '精馏塔',
      deviceId: 'CHEM-D-001',
      testType: '外观检验',
      testDate: '2024-01-08',
      inspector: '郑十',
      result: '合格',
      score: 94,
      remarks: '塔体外观良好，无明显缺陷',
    },
  ];

  const filteredRecords =
    filterType === '全部' ? qualityRecords : qualityRecords.filter((r) => r.result === filterType);

  const totalTests = qualityRecords.length;
  const passedTests = qualityRecords.filter((r) => r.result === '合格').length;
  const failedTests = qualityRecords.filter((r) => r.result === '不合格').length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  const columns = [
    {
      title: '设备编号',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width: 120,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 140,
    },
    {
      title: '检测类型',
      dataIndex: 'testType',
      key: 'testType',
      width: 120,
    },
    {
      title: '检测日期',
      dataIndex: 'testDate',
      key: 'testDate',
      width: 120,
    },
    {
      title: '检测人员',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 100,
    },
    {
      title: '检测结果',
      dataIndex: 'result',
      key: 'result',
      width: 120,
      render: (result: string) => {
        let color = 'success';
        let icon = <CheckCircleOutlined />;
        if (result === '不合格') {
          color = 'error';
          icon = <CloseCircleOutlined />;
        } else if (result === '待复检') {
          color = 'warning';
          icon = <WarningOutlined />;
        }
        return (
          <Tag color={color} icon={icon}>
            {result}
          </Tag>
        );
      },
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      width: 150,
      render: (score: number) => (
        <Progress
          percent={score}
          size={['100%', 12]}
          status={score >= 90 ? 'success' : score >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: () => (
        <Space>
          <Button type="link" size="small">
            查看详情
          </Button>
          <Button type="link" size="small">
            下载报告
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <div>
        {/* 页面标题 */}
        <div style={{ marginBottom: 24 }}>
          <Title
            level={2}
            style={{ margin: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <SafetyCertificateOutlined style={{ color: '#722ed1' }} />
            质量检测记录
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            化工设备安装工程质量检测与验收管理
          </Text>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                borderTop: '3px solid #1890ff',
                transition: 'all 0.3s ease',
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <Statistic
                title={<span style={{ fontSize: 14, color: '#666' }}>检测总数</span>}
                value={totalTests}
                prefix={<FileSearchOutlined style={{ color: '#1890ff', fontSize: 24 }} />}
                valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 700 }}
                suffix={<span style={{ fontSize: 16, color: '#666' }}>项</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                borderTop: '3px solid #52c41a',
                transition: 'all 0.3s ease',
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <Statistic
                title={<span style={{ fontSize: 14, color: '#666' }}>合格数量</span>}
                value={passedTests}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />}
                valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 700 }}
                suffix={<span style={{ fontSize: 16, color: '#666' }}>项</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                borderTop: '3px solid #ff4d4f',
                transition: 'all 0.3s ease',
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <Statistic
                title={<span style={{ fontSize: 14, color: '#666' }}>不合格数量</span>}
                value={failedTests}
                prefix={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />}
                valueStyle={{ color: '#ff4d4f', fontSize: 32, fontWeight: 700 }}
                suffix={<span style={{ fontSize: 16, color: '#666' }}>项</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                borderTop: '3px solid #52c41a',
                transition: 'all 0.3s ease',
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <Statistic
                title={<span style={{ fontSize: 14, color: '#666' }}>合格率</span>}
                value={passRate}
                prefix={<RiseOutlined style={{ color: '#52c41a', fontSize: 24 }} />}
                valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 700 }}
                suffix={<span style={{ fontSize: 16, color: '#666' }}>%</span>}
              />
            </Card>
          </Col>
        </Row>

        {/* 检测记录表格 */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ExperimentOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              <span style={{ fontSize: 18, fontWeight: 600 }}>检测记录查询</span>
            </div>
          }
          extra={
            <Space wrap>
              <Button type="primary" icon={<PlusOutlined />}>
                新增检测
              </Button>
              <RangePicker placeholder={['开始日期', '结束日期']} />
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: 120 }}
                options={[
                  { label: '全部', value: '全部' },
                  { label: '合格', value: '合格' },
                  { label: '不合格', value: '不合格' },
                  { label: '待复检', value: '待复检' },
                ]}
              />
              <Search placeholder="搜索设备名称" style={{ width: 200 }} allowClear />
            </Space>
          }
          style={{ borderRadius: 12 }}
          styles={{ body: { padding: '24px' } }}
        >
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default Quality;
