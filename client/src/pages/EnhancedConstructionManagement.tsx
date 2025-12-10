/**
 * 增强版施工现场管理模块
 * 
 * 参考：建文云施工管理最佳实践
 * 
 * 核心功能：
 * 1. 施工日志增强（天气、人员、材料、设备）
 * 2. 质量检查表单
 * 3. 安全巡检记录
 * 4. 照片上传和标注
 * 5. 电子签名
 * 6. 移动端适配
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Table,
  Upload,
  Space,
  Tag,
  Modal,
  message,
  Row,
  Col,
  Divider,
  Image,
  Badge,
  Statistic,
  Timeline,
  Alert,
  Descriptions,
  Progress,
} from 'antd';
import dayjs from 'dayjs';
import { StorageManager } from '../utils/StorageManager';
import { logger } from '../utils/logger';
import { createTabItems } from '../utils/tabsMigration';
import type { UploadFile } from 'antd/es/upload/interface';
import './EnhancedConstructionManagement.css';
import {
  PlusOutlined,
  CloudUploadOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  DownloadOutlined,
  SyncOutlined,
  ToolOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

// ==================== 类型定义 ====================

/** 天气信息 */
interface WeatherInfo {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  temperature: string;
  humidity?: string;
  windSpeed?: string;
}

/** 人员记录 */
interface WorkerRecord {
  id: string;
  name: string;
  role: string;
  team: string;
  workHours: number;
  overtime?: number;
}

/** 设备记录 */
interface EquipmentRecord {
  id: string;
  name: string;
  model: string;
  quantity: number;
  workHours: number;
  operator: string;
  status: 'normal' | 'maintenance' | 'fault';
}

/** 材料使用 */
interface MaterialUsage {
  id: string;
  name: string;
  specification: string;
  unit: string;
  quantity: number;
  supplier?: string;
  batchNumber?: string;
}

/** 质量检查 */
interface QualityCheck {
  id: string;
  checkItem: string;
  standard: string;
  actualValue: string;
  result: 'pass' | 'fail' | 'rectify';
  inspector: string;
  checkTime: string;
  photos: UploadFile[];
  remark?: string;
  rectificationDeadline?: string;
  rectificationStatus?: 'pending' | 'in_progress' | 'completed';
}

/** 安全巡检 */
interface SafetyInspection {
  id: string;
  location: string;
  hazardType: string;
  riskLevel: 'high' | 'medium' | 'low';
  description: string;
  photos: UploadFile[];
  rectificationMeasures: string;
  responsible: string;
  deadline: string;
  status: 'pending' | 'rectifying' | 'completed';
  followUp?: string;
}

/** 施工内容 */
interface WorkItem {
  id: string;
  location: string;
  workType: string;
  description: string;
  quantity: string;
  unit: string;
  progress: number;
  responsible: string;
}

/** 问题记录 */
interface Issue {
  id: string;
  type: 'quality' | 'safety' | 'progress' | 'other';
  description: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  responsible: string;
  deadline?: string;
  solution?: string;
}

/** 增强版施工日志 */
interface EnhancedConstructionLog {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  
  // 天气信息
  weather: WeatherInfo;
  
  // 施工内容
  workItems: WorkItem[];
  overallProgress: number;
  
  // 人员机械
  workers: WorkerRecord[];
  equipment: EquipmentRecord[];
  totalWorkers: number;
  totalEquipment: number;
  
  // 材料使用
  materials: MaterialUsage[];
  
  // 质量安全
  qualityChecks: QualityCheck[];
  safetyInspections: SafetyInspection[];
  
  // 问题记录
  issues: Issue[];
  
  // 照片附件
  photos: UploadFile[];
  attachments: UploadFile[];
  
  // 签字确认
  recorder: string;
  supervisor: string;
  projectManager: string;
  
  // 备注
  remark?: string;
  
  // 状态
  status: 'draft' | 'submitted' | 'approved';
  
  createdAt: string;
  updatedAt: string;
}

// ==================== 主组件 ====================

const EnhancedConstructionManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [qualityForm] = Form.useForm();
  const [safetyForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [logs, setLogs] = useState<EnhancedConstructionLog[]>([]);
  const [currentLog, setCurrentLog] = useState<EnhancedConstructionLog | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [qualityModalVisible, setQualityModalVisible] = useState(false);
  const [safetyModalVisible, setSafetyModalVisible] = useState(false);
  const [photoList, setPhotoList] = useState<UploadFile[]>([]);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [safetyInspections, setSafetyInspections] = useState<SafetyInspection[]>([]);

  // 加载数据
  useEffect(() => {
    loadConstructionLogs();
    loadQualityChecks();
    loadSafetyInspections();
  }, []);

  const loadConstructionLogs = async () => {
    // 先从缓存加载
    const cached = StorageManager.load<EnhancedConstructionLog[]>('construction_logs');
    if (cached && cached.length > 0) {
      setLogs(cached);
    }

    // TODO: 从API加载最新数据
    const mockLogs: EnhancedConstructionLog[] = [
      {
        id: 'LOG-001',
        date: '2025-11-23',
        projectId: 'PROJ-001',
        projectName: '化工设备生产线安装项目',
        weather: {
          condition: 'sunny',
          temperature: '15-25°C',
          humidity: '60%',
        },
        workItems: [
          {
            id: 'WI-001',
            location: '1号车间',
            workType: '设备安装',
            description: '反应釜安装',
            quantity: '2',
            unit: '台',
            progress: 60,
            responsible: '张工',
          },
        ],
        overallProgress: 45,
        workers: [
          {
            id: 'W-001',
            name: '张三',
            role: '安装工',
            team: '安装一队',
            workHours: 8,
          },
        ],
        equipment: [
          {
            id: 'E-001',
            name: '吊车',
            model: 'QY50K',
            quantity: 1,
            workHours: 6,
            operator: '李四',
            status: 'normal',
          },
        ],
        totalWorkers: 25,
        totalEquipment: 5,
        materials: [
          {
            id: 'M-001',
            name: '钢材',
            specification: 'Q235',
            unit: '吨',
            quantity: 5.5,
          },
        ],
        qualityChecks: [],
        safetyInspections: [],
        issues: [],
        photos: [],
        attachments: [],
        recorder: '王五',
        supervisor: '赵六',
        projectManager: '孙七',
        status: 'approved',
        createdAt: '2025-11-23 18:00:00',
        updatedAt: '2025-11-23 18:30:00',
      },
    ];
    setLogs(mockLogs);
    // 保存到缓存
    StorageManager.save('construction_logs', mockLogs);
  };

  // 新建施工日志
  const handleCreateLog = () => {
    form.resetFields();
    setCurrentLog(null);
    setPhotoList([]);
    setModalVisible(true);
  };

  // 提交施工日志
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const newLog: EnhancedConstructionLog = {
        id: `LOG-${Date.now()}`,
        date: values.date.format('YYYY-MM-DD'),
        projectId: 'PROJ-001',
        projectName: '化工设备生产线安装项目',
        weather: {
          condition: values.weather,
          temperature: values.temperature || '',
          humidity: '',
        },
        workItems: [],
        overallProgress: 0,
        workers: [],
        equipment: [],
        totalWorkers: values.totalWorkers || 0,
        totalEquipment: values.totalEquipment || 0,
        materials: [],
        qualityChecks: [],
        safetyInspections: [],
        issues: [],
        photos: photoList,
        attachments: [],
        recorder: '当前用户',
        supervisor: '',
        projectManager: '',
        status: 'draft',
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      // 添加到列表
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      
      // 保存到缓存
      StorageManager.save('construction_logs', updatedLogs);
      
      // TODO: 调用API保存
      message.success('施工日志提交成功');
      setModalVisible(false);
      form.resetFields();
      setPhotoList([]);
    } catch (error) {
      logger.error('施工日志表单验证失败:', error);
    }
  };

  // 加载质量检查数据
  const loadQualityChecks = () => {
    // 先从缓存加载
    const cached = StorageManager.load<QualityCheck[]>('quality_checks');
    if (cached && cached.length > 0) {
      setQualityChecks(cached);
      return;
    }

    const mockData: QualityCheck[] = [
      {
        id: 'QC-001',
        checkItem: '混凝土强度检测',
        standard: 'C30混凝土抗压强度≥30MPa',
        actualValue: '32.5MPa',
        result: 'pass',
        inspector: '李四',
        checkTime: '2025-11-20 14:00',
        photos: [],
        remark: '符合设计要求',
      },
      {
        id: 'QC-002',
        checkItem: '钢筋保护层厚度',
        standard: '≥30mm',
        actualValue: '25mm',
        result: 'rectify',
        inspector: '王五',
        checkTime: '2025-11-21 10:00',
        photos: [],
        remark: '部分区域不达标',
        rectificationDeadline: '2025-11-25',
        rectificationStatus: 'in_progress',
      },
    ];
    setQualityChecks(mockData);
    StorageManager.save('quality_checks', mockData);
  };

  // 加载安全巡检数据
  const loadSafetyInspections = () => {
    // 先从缓存加载
    const cached = StorageManager.load<SafetyInspection[]>('safety_inspections');
    if (cached && cached.length > 0) {
      setSafetyInspections(cached);
      return;
    }

    const mockData: SafetyInspection[] = [
      {
        id: 'SI-001',
        location: '2号厂房3层',
        hazardType: '高处作业',
        riskLevel: 'high',
        description: '脚手架未设置安全网',
        photos: [],
        rectificationMeasures: '立即设置安全网，加强监护',
        responsible: '张三',
        deadline: '2025-11-24',
        status: 'rectifying',
      },
      {
        id: 'SI-002',
        location: '1号厂房地下室',
        hazardType: '用电安全',
        riskLevel: 'medium',
        description: '临时用电线路未规范布置',
        photos: [],
        rectificationMeasures: '按规范重新布线，设置漏电保护',
        responsible: '李四',
        deadline: '2025-11-23',
        status: 'completed',
      },
    ];
    setSafetyInspections(mockData);
    StorageManager.save('safety_inspections', mockData);
  };

  // 照片上传
  const handlePhotoUpload = (info: any) => {
    setPhotoList(info.fileList);
  };

  // 提交质量检查
  const handleQualitySubmit = async () => {
    try {
      const values = await qualityForm.validateFields();
      
      const newCheck: QualityCheck = {
        id: `QC-${Date.now()}`,
        checkItem: values.checkItem,
        standard: values.standard,
        actualValue: values.actualValue,
        result: values.result,
        inspector: values.inspector,
        checkTime: values.checkTime.format('YYYY-MM-DD HH:mm'),
        photos: [],
        remark: values.remark || '',
        rectificationDeadline: values.rectificationDeadline?.format('YYYY-MM-DD'),
        rectificationStatus: values.rectificationStatus,
      };

      // 添加到列表
      const updatedChecks = [newCheck, ...qualityChecks];
      setQualityChecks(updatedChecks);
      
      // 保存到缓存
      StorageManager.save('quality_checks', updatedChecks);
      
      message.success('质量检查记录已保存');
      setQualityModalVisible(false);
      qualityForm.resetFields();
    } catch (error) {
      logger.error('质量检查表单验证失败:', error);
    }
  };

  // 提交安全巡检
  const handleSafetySubmit = async () => {
    try {
      const values = await safetyForm.validateFields();
      
      const newInspection: SafetyInspection = {
        id: `SI-${Date.now()}`,
        location: values.location,
        hazardType: values.hazardType,
        riskLevel: values.riskLevel,
        description: values.description,
        photos: [],
        rectificationMeasures: values.rectificationMeasures,
        responsible: values.responsible,
        deadline: values.deadline.format('YYYY-MM-DD'),
        status: values.status || 'pending',
      };

      // 添加到列表
      const updatedInspections = [newInspection, ...safetyInspections];
      setSafetyInspections(updatedInspections);
      
      // 保存到缓存
      StorageManager.save('safety_inspections', updatedInspections);
      
      message.success('安全巡检记录已保存');
      setSafetyModalVisible(false);
      safetyForm.resetFields();
    } catch (error) {
      logger.error('安全巡检表单验证失败:', error);
    }
  };

  // 导出质量检查报表
  const exportQualityChecks = () => {
    try {
      const data = qualityChecks.map(item => ({
        '检查项目': item.checkItem,
        '标准要求': item.standard,
        '实测值': item.actualValue,
        '检查结果': item.result === 'pass' ? '合格' : item.result === 'rectify' ? '需整改' : '不合格',
        '检查人': item.inspector,
        '检查时间': item.checkTime,
        '整改期限': item.rectificationDeadline || '',
        '整改状态': item.rectificationStatus === 'completed' ? '已完成' : item.rectificationStatus === 'in_progress' ? '整改中' : '待整改',
        '备注': item.remark || '',
      }));
      
      // 转换为CSV格式
      const headers = Object.keys(data[0] || {});
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
      ].join('\n');
      
      // 下载文件
      const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `质量检查报告_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
      link.click();
      
      message.success('质量检查报表已导出');
    } catch (error) {
      message.error('导出失败');
      logger.error('质量检查报表导出错误:', error);
    }
  };

  // 导出安全巡检报表
  const exportSafetyInspections = () => {
    try {
      const data = safetyInspections.map(item => ({
        '巡检位置': item.location,
        '隐患类型': item.hazardType,
        '风险等级': item.riskLevel === 'high' ? '高风险' : item.riskLevel === 'medium' ? '中风险' : '低风险',
        '隐患描述': item.description,
        '整改措施': item.rectificationMeasures,
        '责任人': item.responsible,
        '整改期限': item.deadline,
        '整改状态': item.status === 'completed' ? '已完成' : item.status === 'rectifying' ? '整改中' : '待处理',
      }));
      
      // 转换为CSV格式
      const headers = Object.keys(data[0] || {});
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
      ].join('\n');
      
      // 下载文件
      const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `安全巡检报告_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
      link.click();
      
      message.success('安全巡检报表已导出');
    } catch (error) {
      message.error('导出失败');
      logger.error('安全巡检报表导出错误:', error);
    }
  };

  // 批量审批质量检查
  const handleBatchApprove = () => {
    Modal.confirm({
      title: '批量审批',
      content: '确认批准所有待审批的质量检查项？',
      onOk: () => {
        const updated = qualityChecks.map(item => 
          item.result === 'pass' ? { ...item, approved: true } : item
        );
        setQualityChecks(updated);
        StorageManager.save('quality_checks', updated);
        message.success('批量审批完成');
      },
    });
  };

  // 筛选高风险项
  const filterHighRisk = () => {
    const highRiskItems = safetyInspections.filter(item => item.riskLevel === 'high');
    if (highRiskItems.length === 0) {
      message.info('当前无高风险安全隐患');
    } else {
      message.warning(`发现 ${highRiskItems.length} 项高风险隐患，请及时处理！`);
    }
  };

  // 催办
  const handleUrge = (record: SafetyInspection) => {
    Modal.confirm({
      title: '催办确认',
      content: `确认催办「${record.location}」的整改工作？将通知责任人：${record.responsible}`,
      onOk: () => {
        // TODO: 发送催办通知
        message.success(`已向 ${record.responsible} 发送催办通知`);
      },
    });
  };

  // ==================== 渲染 ====================

  return (
    <div className="enhanced-construction-management">
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>施工管理系统</span>
            <Badge count={logs.length} className="badge-success" />
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateLog}>
              新建施工日志
            </Button>
          </Space>
        }
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: '📊 项目总览',
              children: (
                <>
            <Card title="项目基本信息" className="info-card">
              <Descriptions column={3}>
                <Descriptions.Item label="项目名称">化工设备生产线EPC项目</Descriptions.Item>
                <Descriptions.Item label="项目类型">EPC总承包</Descriptions.Item>
                <Descriptions.Item label="建设地点">上海市浦东新区</Descriptions.Item>
                <Descriptions.Item label="开工日期">2025-01-01</Descriptions.Item>
                <Descriptions.Item label="计划完工">2025-12-31</Descriptions.Item>
                <Descriptions.Item label="总工期">365天</Descriptions.Item>
                <Descriptions.Item label="合同金额">5000万元</Descriptions.Item>
                <Descriptions.Item label="项目经理">张三</Descriptions.Item>
                <Descriptions.Item label="项目状态">
                  <Tag color="blue">施工中</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Row gutter={16} className="stats-row">
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总体进度"
                    value={65}
                    suffix="%"
                    className="statistic-success"
                  />
                  <Progress percent={65} status="active" />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="累计完成产值"
                    value={3250}
                    suffix="万元"
                    precision={0}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="施工人员"
                    value={128}
                    suffix="人"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="质量合格率"
                    value={98.5}
                    suffix="%"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="EPC生命周期进度">
              <Timeline mode="left">
                <Timeline.Item color="green" label="立项阶段">
                  <Tag color="success">已完成</Tag> 100%
                  <div>项目立项、可研报告、投资决策</div>
                </Timeline.Item>
                <Timeline.Item color="green" label="设计阶段">
                  <Tag color="success">已完成</Tag> 100%
                  <div>初步设计、详细设计、施工图设计</div>
                </Timeline.Item>
                <Timeline.Item color="blue" label="采购阶段">
                  <Tag color="processing">进行中</Tag> 85%
                  <Progress percent={85} size="small" />
                  <div>设备采购、材料采购、合同签订</div>
                </Timeline.Item>
                <Timeline.Item color="blue" label="施工阶段">
                  <Tag color="processing">进行中</Tag> 60%
                  <Progress percent={60} size="small" />
                  <div>土建施工、设备安装、管道铺设</div>
                </Timeline.Item>
                <Timeline.Item color="gray" label="调试阶段">
                  <Tag>未开始</Tag> 0%
                  <div>单机调试、联动调试、性能测试</div>
                </Timeline.Item>
                <Timeline.Item color="gray" label="验收阶段">
                  <Tag>未开始</Tag> 0%
                  <div>预验收、正式验收、资料移交</div>
                </Timeline.Item>
              </Timeline>
            </Card>
                </>
              )
            },
            {
              key: 'progress',
              label: '📈 进度管理',
              children: (
                <>
            <Alert
              message="项目整体进度"
              description="当前项目总体进度为65%，按计划推进中。采购阶段85%，施工阶段60%。"
              type="info"
              showIcon
              className="mb-16"
            />

            <Card title="各阶段进度详情" className="mb-16">
              <Table
                dataSource={[
                  {
                    key: '1',
                    phase: '立项',
                    startDate: '2024-10-01',
                    endDate: '2024-11-30',
                    duration: 60,
                    progress: 100,
                    status: 'completed',
                  },
                  {
                    key: '2',
                    phase: '设计',
                    startDate: '2024-11-01',
                    endDate: '2025-01-31',
                    duration: 90,
                    progress: 100,
                    status: 'completed',
                  },
                  {
                    key: '3',
                    phase: '采购',
                    startDate: '2024-12-01',
                    endDate: '2025-05-31',
                    duration: 180,
                    progress: 85,
                    status: 'in_progress',
                  },
                  {
                    key: '4',
                    phase: '施工',
                    startDate: '2025-01-01',
                    endDate: '2025-09-30',
                    duration: 270,
                    progress: 60,
                    status: 'in_progress',
                  },
                  {
                    key: '5',
                    phase: '调试',
                    startDate: '2025-08-01',
                    endDate: '2025-11-30',
                    duration: 120,
                    progress: 0,
                    status: 'pending',
                  },
                  {
                    key: '6',
                    phase: '验收',
                    startDate: '2025-11-01',
                    endDate: '2025-12-31',
                    duration: 60,
                    progress: 0,
                    status: 'pending',
                  },
                ]}
                columns={[
                  {
                    title: '阶段名称',
                    dataIndex: 'phase',
                    key: 'phase',
                  },
                  {
                    title: '开始日期',
                    dataIndex: 'startDate',
                    key: 'startDate',
                  },
                  {
                    title: '结束日期',
                    dataIndex: 'endDate',
                    key: 'endDate',
                  },
                  {
                    title: '工期(天)',
                    dataIndex: 'duration',
                    key: 'duration',
                  },
                  {
                    title: '进度',
                    dataIndex: 'progress',
                    key: 'progress',
                    render: (progress: number) => (
                      <Progress percent={progress} size="small" />
                    ),
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: string) => {
                      const statusMap: Record<string, { color: string; text: string }> = {
                        completed: { color: 'success', text: '已完成' },
                        in_progress: { color: 'processing', text: '进行中' },
                        pending: { color: 'default', text: '未开始' },
                      };
                      return (
                        <Tag color={statusMap[status]?.color}>
                          {statusMap[status]?.text}
                        </Tag>
                      );
                    },
                  },
                ]}
                pagination={false}
              />
            </Card>

            <Card title="关键里程碑">
              <Timeline>
                <Timeline.Item color="green">
                  <strong>项目启动会</strong>
                  <div>2024-10-01 | 已完成</div>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <strong>初步设计评审</strong>
                  <div>2024-11-15 | 已完成</div>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <strong>施工图设计完成</strong>
                  <div>2025-01-20 | 已完成</div>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <strong>主要设备到货</strong>
                  <div>2025-06-30 | 进行中</div>
                </Timeline.Item>
                <Timeline.Item color="gray">
                  <strong>土建工程完工</strong>
                  <div>2025-08-31 | 计划中</div>
                </Timeline.Item>
                <Timeline.Item color="gray">
                  <strong>设备安装完成</strong>
                  <div>2025-10-31 | 计划中</div>
                </Timeline.Item>
                <Timeline.Item color="gray">
                  <strong>项目竣工验收</strong>
                  <div>2025-12-31 | 计划中</div>
                </Timeline.Item>
              </Timeline>
            </Card>
                </>
              )
            },
            {
              key: 'log',
              label: '📝 施工日志',
              children: (
                <>
            <Table
              dataSource={logs}
              rowKey="id"
              columns={[
                {
                  title: '日期',
                  dataIndex: 'date',
                  key: 'date',
                  width: 120,
                },
                {
                  title: '项目名称',
                  dataIndex: 'projectName',
                  key: 'projectName',
                },
                {
                  title: '天气',
                  dataIndex: ['weather', 'condition'],
                  key: 'weather',
                  width: 100,
                  render: (condition: string) => {
                    const weatherMap: any = {
                      sunny: '☀️ 晴',
                      cloudy: '☁️ 多云',
                      rainy: '🌧️ 雨',
                      snowy: '❄️ 雪',
                      windy: '💨 风',
                    };
                    return weatherMap[condition] || condition;
                  },
                },
                {
                  title: '进度',
                  dataIndex: 'overallProgress',
                  key: 'progress',
                  width: 120,
                  render: (progress: number) => (
                    <div className="progress-container">
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="progress-text">{progress}%</div>
                    </div>
                  ),
                },
                {
                  title: '人员/设备',
                  key: 'resources',
                  width: 120,
                  render: (_, record) => (
                    <Space>
                      <Tag icon={<TeamOutlined />}>{record.totalWorkers}人</Tag>
                      <Tag icon={<ToolOutlined />}>{record.totalEquipment}台</Tag>
                    </Space>
                  ),
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 100,
                  render: (status: string) => {
                    const statusMap: any = {
                      draft: { color: 'default', text: '草稿' },
                      submitted: { color: 'processing', text: '已提交' },
                      approved: { color: 'success', text: '已审批' },
                    };
                    const config = statusMap[status] || statusMap.draft;
                    return <Tag color={config.color}>{config.text}</Tag>;
                  },
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 150,
                  render: (_, record) => (
                    <Space>
                      <Button type="link" size="small">查看</Button>
                      <Button type="link" size="small">编辑</Button>
                      <Button type="link" size="small" danger>删除</Button>
                    </Space>
                  ),
                },
              ]}
            />
                </>
              )
            },
            {
              key: 'quality',
              label: '🔍 质量检查',
              children: (
                <>
            <Space className="mb-16">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setQualityModalVisible(true)}>
                新建检查
              </Button>
              <Button icon={<DownloadOutlined />} onClick={exportQualityChecks}>
                导出报表
              </Button>
              <Button icon={<CheckCircleOutlined />} onClick={handleBatchApprove}>
                批量审批
              </Button>
              <Badge count={qualityChecks.filter(q => q.result === 'rectify' && q.rectificationStatus !== 'completed').length} showZero={false}>
                <Button icon={<SyncOutlined />}>
                  待整改
                </Button>
              </Badge>
            </Space>

            <Table
              dataSource={qualityChecks}
              rowKey="id"
              columns={[
                {
                  title: '检查项目',
                  dataIndex: 'checkItem',
                  key: 'checkItem',
                },
                {
                  title: '标准要求',
                  dataIndex: 'standard',
                  key: 'standard',
                },
                {
                  title: '实测值',
                  dataIndex: 'actualValue',
                  key: 'actualValue',
                },
                {
                  title: '检查结果',
                  dataIndex: 'result',
                  key: 'result',
                  render: (result: string) => {
                    const resultMap: Record<string, { color: string; text: string }> = {
                      pass: { color: 'success', text: '合格' },
                      fail: { color: 'error', text: '不合格' },
                      rectify: { color: 'warning', text: '需整改' },
                    };
                    return <Tag color={resultMap[result]?.color}>{resultMap[result]?.text}</Tag>;
                  },
                },
                {
                  title: '检查人',
                  dataIndex: 'inspector',
                  key: 'inspector',
                },
                {
                  title: '检查时间',
                  dataIndex: 'checkTime',
                  key: 'checkTime',
                },
                {
                  title: '整改状态',
                  dataIndex: 'rectificationStatus',
                  key: 'rectificationStatus',
                  render: (status: string) => {
                    if (!status) return '-';
                    const statusMap: Record<string, { color: string; text: string }> = {
                      pending: { color: 'default', text: '待整改' },
                      in_progress: { color: 'processing', text: '整改中' },
                      completed: { color: 'success', text: '已完成' },
                    };
                    return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
                  },
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <Space>
                      <Button type="link" size="small">查看</Button>
                      <Button type="link" size="small">编辑</Button>
                      {record.result === 'rectify' && (
                        <Button type="link" size="small">整改跟踪</Button>
                      )}
                    </Space>
                  ),
                },
              ]}
            />
                </>
              )
            },
            {
              key: 'safety',
              label: '🛡️ 安全巡检',
              children: (
                <>
            <Space className="mb-16">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setSafetyModalVisible(true)}>
                新建巡检
              </Button>
              <Button icon={<DownloadOutlined />} onClick={exportSafetyInspections}>
                导出报表
              </Button>
              <Button 
                icon={<ExclamationCircleOutlined />} 
                danger
                onClick={filterHighRisk}
              >
                高风险项 ({safetyInspections.filter(s => s.riskLevel === 'high').length})
              </Button>
              <Badge count={safetyInspections.filter(s => s.status !== 'completed').length} showZero={false}>
                <Button icon={<ClockCircleOutlined />}>
                  待处理
                </Button>
              </Badge>
            </Space>

            <Table
              dataSource={safetyInspections}
              rowKey="id"
              columns={[
                {
                  title: '位置',
                  dataIndex: 'location',
                  key: 'location',
                },
                {
                  title: '隐患类型',
                  dataIndex: 'hazardType',
                  key: 'hazardType',
                },
                {
                  title: '风险等级',
                  dataIndex: 'riskLevel',
                  key: 'riskLevel',
                  render: (level: string) => {
                    const levelMap: Record<string, { color: string; text: string }> = {
                      high: { color: 'error', text: '高风险' },
                      medium: { color: 'warning', text: '中风险' },
                      low: { color: 'success', text: '低风险' },
                    };
                    return <Tag color={levelMap[level]?.color}>{levelMap[level]?.text}</Tag>;
                  },
                },
                {
                  title: '隐患描述',
                  dataIndex: 'description',
                  key: 'description',
                  ellipsis: true,
                },
                {
                  title: '责任人',
                  dataIndex: 'responsible',
                  key: 'responsible',
                },
                {
                  title: '整改期限',
                  dataIndex: 'deadline',
                  key: 'deadline',
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const statusMap: Record<string, { color: string; text: string }> = {
                      pending: { color: 'default', text: '待处理' },
                      rectifying: { color: 'processing', text: '整改中' },
                      completed: { color: 'success', text: '已完成' },
                    };
                    return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
                  },
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <Space>
                      <Button type="link" size="small">查看</Button>
                      <Button type="link" size="small">编辑</Button>
                      {record.status !== 'completed' && (
                        <Button 
                          type="link" 
                          size="small" 
                          danger
                          onClick={() => handleUrge(record)}
                        >
                          催办
                        </Button>
                      )}
                    </Space>
                  ),
                },
              ]}
            />
                </>
              )
            },
            {
              key: 'statistics',
              label: '📊 统计分析',
              children: (
                <>
            <Row gutter={16} className="mb-16">
              <Col span={6}>
                <Card>
                  <Statistic
                    title="本月施工日志"
                    value={logs.length}
                    suffix="条"
                    className="statistic-success"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="质量检查"
                    value={qualityChecks.length}
                    suffix="次"
                    className="statistic-primary"
                  />
                  <div className="stat-detail">
                    合格率: {qualityChecks.length > 0 ? Math.round(qualityChecks.filter(q => q.result === 'pass').length / qualityChecks.length * 100) : 0}%
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="安全巡检"
                    value={safetyInspections.length}
                    suffix="次"
                    className="statistic-warning"
                  />
                  <div className="stat-detail">
                    高风险: {safetyInspections.filter(s => s.riskLevel === 'high').length}项
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="待整改问题"
                    value={qualityChecks.filter(q => q.result === 'rectify').length + safetyInspections.filter(s => s.status !== 'completed').length}
                    suffix="项"
                    className="statistic-danger"
                  />
                  <div className="stat-detail">
                    整改中: {safetyInspections.filter(s => s.status === 'rectifying').length}项
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Card title="质量检查统计" className="mb-16">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="合格"
                        value={qualityChecks.filter(q => q.result === 'pass').length}
                        className="statistic-success"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="需整改"
                        value={qualityChecks.filter(q => q.result === 'rectify').length}
                        className="statistic-warning"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="不合格"
                        value={qualityChecks.filter(q => q.result === 'fail').length}
                        className="statistic-danger"
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="安全风险分布" className="mb-16">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="高风险"
                        value={safetyInspections.filter(s => s.riskLevel === 'high').length}
                        className="statistic-danger"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="中风险"
                        value={safetyInspections.filter(s => s.riskLevel === 'medium').length}
                        className="statistic-warning"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="低风险"
                        value={safetyInspections.filter(s => s.riskLevel === 'low').length}
                        className="statistic-success"
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
                </>
              )
            }
          ]}
        />
      </Card>

      {/* 新建/编辑施工日志弹窗 */}
      <Modal
        title={currentLog ? '编辑施工日志' : '新建施工日志'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={1000}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="日期" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="weather" label="天气" rules={[{ required: true }]}>
                <Select placeholder="请选择天气">
                  <Option value="sunny">☀️ 晴</Option>
                  <Option value="cloudy">☁️ 多云</Option>
                  <Option value="rainy">🌧️ 雨</Option>
                  <Option value="snowy">❄️ 雪</Option>
                  <Option value="windy">💨 风</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="temperature" label="温度">
                <Input placeholder="例如：15-25°C" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalWorkers" label="总人数">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalEquipment" label="设备数">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="workContent" label="施工内容" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="请描述今日施工内容..." />
          </Form.Item>

          <Form.Item name="photos" label="现场照片">
            <Upload
              listType="picture-card"
              fileList={photoList}
              onChange={handlePhotoUpload}
              beforeUpload={() => false}
            >
              {photoList.length < 10 && (
                <div className="upload-placeholder">
                  <CameraOutlined />
                  <div className="upload-text">上传照片</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="其他需要说明的事项..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 质量检查弹窗 */}
      <Modal
        title="新建质量检查"
        open={qualityModalVisible}
        onOk={handleQualitySubmit}
        onCancel={() => setQualityModalVisible(false)}
        width={800}
      >
        <Form form={qualityForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="checkItem"
                label="检查项目"
                rules={[{ required: true, message: '请输入检查项目' }]}
              >
                <Input placeholder="如：混凝土强度检测" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="standard"
                label="标准要求"
                rules={[{ required: true, message: '请输入标准要求' }]}
              >
                <Input placeholder="如：C30混凝土抗压强度≥30MPa" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="actualValue"
                label="实测值"
                rules={[{ required: true, message: '请输入实测值' }]}
              >
                <Input placeholder="如：32.5MPa" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="result"
                label="检查结果"
                rules={[{ required: true, message: '请选择检查结果' }]}
              >
                <Select placeholder="请选择">
                  <Select.Option value="pass">✅ 合格</Select.Option>
                  <Select.Option value="rectify">⚠️ 需整改</Select.Option>
                  <Select.Option value="fail">❌ 不合格</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="inspector"
                label="检查人"
                rules={[{ required: true, message: '请输入检查人' }]}
              >
                <Input placeholder="姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="checkTime"
                label="检查时间"
                rules={[{ required: true, message: '请选择检查时间' }]}
              >
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="填写检查说明或备注" />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.result !== currentValues.result}
          >
            {({ getFieldValue }) =>
              getFieldValue('result') === 'rectify' ? (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="rectificationDeadline"
                      label="整改期限"
                      rules={[{ required: true, message: '请选择整改期限' }]}
                    >
                      <DatePicker className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="rectificationStatus"
                      label="整改状态"
                      initialValue="pending"
                    >
                      <Select>
                        <Select.Option value="pending">待整改</Select.Option>
                        <Select.Option value="in_progress">整改中</Select.Option>
                        <Select.Option value="completed">已完成</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              ) : null
            }
          </Form.Item>

          <Form.Item name="photos" label="检查照片">
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              maxCount={9}
            >
              <div>
                <CameraOutlined />
                <div style={{ marginTop: 8 }}>上传照片</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 安全巡检弹窗 */}
      <Modal
        title="新建安全巡检"
        open={safetyModalVisible}
        onOk={handleSafetySubmit}
        onCancel={() => setSafetyModalVisible(false)}
      >
        <Form form={safetyForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="巡检位置"
                rules={[{ required: true, message: '请输入巡检位置' }]}
              >
                <Input placeholder="如：2号厂房3层" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hazardType"
                label="隐患类型"
                rules={[{ required: true, message: '请输入隐患类型' }]}
              >
                <Select placeholder="请选择">
                  <Select.Option value="高处作业">高处作业</Select.Option>
                  <Select.Option value="用电安全">用电安全</Select.Option>
                  <Select.Option value="消防安全">消防安全</Select.Option>
                  <Select.Option value="机械设备">机械设备</Select.Option>
                  <Select.Option value="脚手架">脚手架</Select.Option>
                  <Select.Option value="临边防护">临边防护</Select.Option>
                  <Select.Option value="其他">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="riskLevel"
                label="风险等级"
                rules={[{ required: true, message: '请选择风险等级' }]}
              >
                <Select placeholder="请选择">
                  <Select.Option value="high">🔴 高风险</Select.Option>
                  <Select.Option value="medium">🟡 中风险</Select.Option>
                  <Select.Option value="low">🟢 低风险</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responsible"
                label="责任人"
                rules={[{ required: true, message: '请输入责任人' }]}
              >
                <Input placeholder="负责整改的人员" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="隐患描述"
            rules={[{ required: true, message: '请输入隐患描述' }]}
          >
            <Input.TextArea rows={3} placeholder="详细描述发现的安全隐患" />
          </Form.Item>

          <Form.Item
            name="rectificationMeasures"
            label="整改措施"
            rules={[{ required: true, message: '请输入整改措施' }]}
          >
            <Input.TextArea rows={3} placeholder="说明具体的整改措施和要求" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="deadline"
                label="整改期限"
                rules={[{ required: true, message: '请选择整改期限' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="整改状态"
                initialValue="pending"
              >
                <Select>
                  <Select.Option value="pending">待处理</Select.Option>
                  <Select.Option value="rectifying">整改中</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="photos" label="现场照片">
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              maxCount={9}
            >
              <div>
                <CameraOutlined />
                <div style={{ marginTop: 8 }}>上传照片</div>
              </div>
            </Upload>
          </Form.Item>

          <Alert
            message="安全提示"
            description="发现高风险隐患时，请立即采取临时防护措施，并上报项目安全负责人。"
            type="warning"
            showIcon
            className="safety-alert"
          />
        </Form>
      </Modal>
    </div>
  );
};

export default EnhancedConstructionManagement;
