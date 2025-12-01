/**
 * 施工照片管理组件
 * 
 * 功能特性：
 * 1. 照片分类标签系统
 * 2. 位置地图标注
 * 3. 时间轴展示
 * 4. 对比视图（前后对比）
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Upload,
  Image,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Timeline,
  Tabs,
  Empty,
  message,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  CameraOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilterOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import './PhotoManagement.css';

const { TextArea } = Input;
const { TabPane } = Tabs;

// 照片分类
enum PhotoCategory {
  FOUNDATION = 'foundation',      // 基础施工
  STRUCTURE = 'structure',        // 结构施工
  DECORATION = 'decoration',      // 装饰装修
  EQUIPMENT = 'equipment',        // 设备安装
  PIPELINE = 'pipeline',          // 管道安装
  ELECTRICAL = 'electrical',      // 电气安装
  SAFETY = 'safety',             // 安全文明
  QUALITY = 'quality',           // 质量检查
  PROGRESS = 'progress',         // 进度记录
  OTHER = 'other',               // 其他
}

// 照片接口
interface ConstructionPhoto {
  id: string;
  title: string;
  category: PhotoCategory;
  tags: string[];
  url: string;
  thumbnail: string;
  location: {
    name: string;
    lat?: number;
    lng?: number;
  };
  captureDate: string;
  uploadDate: string;
  uploader: string;
  description?: string;
  relatedTask?: string;
}

// 对比照片组
interface ComparisonGroup {
  id: string;
  title: string;
  before: ConstructionPhoto;
  after: ConstructionPhoto;
  description: string;
}

const PhotoManagement: React.FC = () => {
  const [photos, setPhotos] = useState<ConstructionPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<ConstructionPhoto[]>([]);
  const [comparisonGroups, setComparisonGroups] = useState<ComparisonGroup[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<ConstructionPhoto | null>(null);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isCompareModalVisible, setIsCompareModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  // 分类配置
  const categoryConfig: Record<PhotoCategory, { text: string; color: string }> = {
    [PhotoCategory.FOUNDATION]: { text: '基础施工', color: 'blue' },
    [PhotoCategory.STRUCTURE]: { text: '结构施工', color: 'cyan' },
    [PhotoCategory.DECORATION]: { text: '装饰装修', color: 'purple' },
    [PhotoCategory.EQUIPMENT]: { text: '设备安装', color: 'orange' },
    [PhotoCategory.PIPELINE]: { text: '管道安装', color: 'green' },
    [PhotoCategory.ELECTRICAL]: { text: '电气安装', color: 'gold' },
    [PhotoCategory.SAFETY]: { text: '安全文明', color: 'red' },
    [PhotoCategory.QUALITY]: { text: '质量检查', color: 'magenta' },
    [PhotoCategory.PROGRESS]: { text: '进度记录', color: 'lime' },
    [PhotoCategory.OTHER]: { text: '其他', color: 'default' },
  };

  // 初始化模拟数据
  useEffect(() => {
    const mockPhotos: ConstructionPhoto[] = [
      {
        id: 'P-001',
        title: '基础开挖完成',
        category: PhotoCategory.FOUNDATION,
        tags: ['基础', '开挖', '验收'],
        url: 'https://via.placeholder.com/800x600/1890ff/ffffff?text=基础开挖',
        thumbnail: 'https://via.placeholder.com/200x150/1890ff/ffffff?text=基础开挖',
        location: { name: 'A区基础', lat: 31.2304, lng: 121.4737 },
        captureDate: '2025-01-15 10:30:00',
        uploadDate: '2025-01-15 14:20:00',
        uploader: '张工',
        description: 'A区基础开挖已完成，深度符合设计要求',
      },
      {
        id: 'P-002',
        title: '主体结构浇筑',
        category: PhotoCategory.STRUCTURE,
        tags: ['主体', '混凝土', '浇筑'],
        url: 'https://via.placeholder.com/800x600/52c41a/ffffff?text=主体浇筑',
        thumbnail: 'https://via.placeholder.com/200x150/52c41a/ffffff?text=主体浇筑',
        location: { name: 'B区3层', lat: 31.2305, lng: 121.4738 },
        captureDate: '2025-01-18 08:00:00',
        uploadDate: '2025-01-18 09:15:00',
        uploader: '李工',
        description: 'B区3层主体结构混凝土浇筑中',
      },
      {
        id: 'P-003',
        title: '设备吊装',
        category: PhotoCategory.EQUIPMENT,
        tags: ['设备', '吊装', '变压器'],
        url: 'https://via.placeholder.com/800x600/faad14/ffffff?text=设备吊装',
        thumbnail: 'https://via.placeholder.com/200x150/faad14/ffffff?text=设备吊装',
        location: { name: '配电室', lat: 31.2306, lng: 121.4739 },
        captureDate: '2025-01-19 14:30:00',
        uploadDate: '2025-01-19 16:00:00',
        uploader: '王工',
        description: '1000kVA变压器吊装就位',
      },
      {
        id: 'P-004',
        title: '安全检查',
        category: PhotoCategory.SAFETY,
        tags: ['安全', '检查', '整改'],
        url: 'https://via.placeholder.com/800x600/ff4d4f/ffffff?text=安全检查',
        thumbnail: 'https://via.placeholder.com/200x150/ff4d4f/ffffff?text=安全检查',
        location: { name: '施工现场', lat: 31.2307, lng: 121.4740 },
        captureDate: '2025-01-20 09:00:00',
        uploadDate: '2025-01-20 10:30:00',
        uploader: '赵工',
        description: '每周安全检查，发现隐患3处已整改',
      },
    ];

    const mockComparisons: ComparisonGroup[] = [
      {
        id: 'C-001',
        title: 'A区基础施工前后对比',
        before: mockPhotos[0],
        after: {
          ...mockPhotos[0],
          id: 'P-001-after',
          title: '基础回填完成',
          url: 'https://via.placeholder.com/800x600/52c41a/ffffff?text=基础回填',
          thumbnail: 'https://via.placeholder.com/200x150/52c41a/ffffff?text=基础回填',
          captureDate: '2025-01-17 16:00:00',
        },
        description: 'A区基础从开挖到回填完成，历时2天',
      },
    ];

    setPhotos(mockPhotos);
    setFilteredPhotos(mockPhotos);
    setComparisonGroups(mockComparisons);
  }, []);

  // 筛选照片
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, photos]);

  // 上传照片
  const handleUpload = async (values: any) => {
    const newPhoto: ConstructionPhoto = {
      id: `P-${Date.now()}`,
      title: values.title,
      category: values.category,
      tags: values.tags || [],
      url: 'https://via.placeholder.com/800x600/1890ff/ffffff?text=' + encodeURIComponent(values.title),
      thumbnail: 'https://via.placeholder.com/200x150/1890ff/ffffff?text=' + encodeURIComponent(values.title),
      location: {
        name: values.location,
      },
      captureDate: values.captureDate.format('YYYY-MM-DD HH:mm:ss'),
      uploadDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      uploader: values.uploader,
      description: values.description,
    };

    setPhotos([newPhoto, ...photos]);
    message.success('照片上传成功');
    setIsUploadModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  // 删除照片
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这张照片吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setPhotos(photos.filter(p => p.id !== id));
        message.success('照片已删除');
      },
    });
  };

  // 统计数据
  const stats = {
    total: photos.length,
    today: photos.filter(p => dayjs(p.uploadDate).isSame(dayjs(), 'day')).length,
    byCategory: Object.keys(PhotoCategory).reduce((acc, key) => {
      const category = PhotoCategory[key as keyof typeof PhotoCategory];
      acc[category] = photos.filter(p => p.category === category).length;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="photo-management">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="stat-item">
              <CameraOutlined className="stat-icon" />
              <div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">总照片数</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="stat-item">
              <ClockCircleOutlined className="stat-icon" />
              <div>
                <div className="stat-value">{stats.today}</div>
                <div className="stat-label">今日上传</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="stat-item">
              <FilterOutlined className="stat-icon" />
              <div>
                <div className="stat-value">{Object.keys(categoryConfig).length}</div>
                <div className="stat-label">分类数量</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="stat-item">
              <SwapOutlined className="stat-icon" />
              <div>
                <div className="stat-value">{comparisonGroups.length}</div>
                <div className="stat-label">对比组</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Card className="action-card">
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsUploadModalVisible(true)}
          >
            上传照片
          </Button>
          <Button
            icon={<SwapOutlined />}
            onClick={() => setIsCompareModalVisible(true)}
          >
            创建对比
          </Button>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 150 }}
            placeholder="选择分类"
          >
            <Select.Option value="all">全部分类</Select.Option>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <Select.Option key={key} value={key}>
                <Tag color={config.color}>{config.text}</Tag>
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* 主内容区 */}
      <Card>
        <Tabs defaultActiveKey="grid">
          {/* 网格视图 */}
          <TabPane
            tab={
              <span>
                <CameraOutlined />
                网格视图
              </span>
            }
            key="grid"
          >
            {filteredPhotos.length > 0 ? (
              <Row gutter={[16, 16]}>
                {filteredPhotos.map((photo) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={photo.id}>
                    <Card
                      hoverable
                      className="photo-card"
                      cover={
                        <div className="photo-cover">
                          <Image
                            src={photo.thumbnail}
                            alt={photo.title}
                            preview={{
                              src: photo.url,
                            }}
                          />
                          <div className="photo-overlay">
                            <Space>
                              <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={() => setSelectedPhoto(photo)}
                              >
                                详情
                              </Button>
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                onClick={() => handleDelete(photo.id)}
                              >
                                删除
                              </Button>
                            </Space>
                          </div>
                        </div>
                      }
                    >
                      <Card.Meta
                        title={
                          <Tooltip title={photo.title}>
                            <div className="photo-title">{photo.title}</div>
                          </Tooltip>
                        }
                        description={
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Tag color={categoryConfig[photo.category].color}>
                              {categoryConfig[photo.category].text}
                            </Tag>
                            <div className="photo-info">
                              <EnvironmentOutlined /> {photo.location.name}
                            </div>
                            <div className="photo-info">
                              <ClockCircleOutlined /> {dayjs(photo.captureDate).format('MM-DD HH:mm')}
                            </div>
                          </Space>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="暂无照片" />
            )}
          </TabPane>

          {/* 时间轴视图 */}
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                时间轴
              </span>
            }
            key="timeline"
          >
            <Timeline mode="left">
              {filteredPhotos
                .sort((a, b) => dayjs(b.captureDate).unix() - dayjs(a.captureDate).unix())
                .map((photo) => (
                  <Timeline.Item
                    key={photo.id}
                    label={dayjs(photo.captureDate).format('YYYY-MM-DD HH:mm')}
                    color={categoryConfig[photo.category].color}
                  >
                    <Card size="small" className="timeline-card">
                      <Row gutter={16}>
                        <Col span={8}>
                          <Image src={photo.thumbnail} alt={photo.title} />
                        </Col>
                        <Col span={16}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <strong>{photo.title}</strong>
                            <Tag color={categoryConfig[photo.category].color}>
                              {categoryConfig[photo.category].text}
                            </Tag>
                            <div>
                              <EnvironmentOutlined /> {photo.location.name}
                            </div>
                            <div>上传人: {photo.uploader}</div>
                            {photo.description && (
                              <div className="photo-desc">{photo.description}</div>
                            )}
                          </Space>
                        </Col>
                      </Row>
                    </Card>
                  </Timeline.Item>
                ))}
            </Timeline>
          </TabPane>

          {/* 对比视图 */}
          <TabPane
            tab={
              <span>
                <SwapOutlined />
                对比视图
                <Badge count={comparisonGroups.length} offset={[10, 0]} />
              </span>
            }
            key="comparison"
          >
            {comparisonGroups.length > 0 ? (
              <Row gutter={[16, 16]}>
                {comparisonGroups.map((group) => (
                  <Col xs={24} key={group.id}>
                    <Card title={group.title} className="comparison-card">
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <div className="comparison-item">
                            <div className="comparison-label">施工前</div>
                            <Image src={group.before.url} alt="施工前" />
                            <div className="comparison-date">
                              {dayjs(group.before.captureDate).format('YYYY-MM-DD HH:mm')}
                            </div>
                          </div>
                        </Col>
                        <Col xs={24} md={12}>
                          <div className="comparison-item">
                            <div className="comparison-label">施工后</div>
                            <Image src={group.after.url} alt="施工后" />
                            <div className="comparison-date">
                              {dayjs(group.after.captureDate).format('YYYY-MM-DD HH:mm')}
                            </div>
                          </div>
                        </Col>
                      </Row>
                      <div className="comparison-desc">{group.description}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="暂无对比照片" />
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* 上传照片弹窗 */}
      <Modal
        title="上传施工照片"
        open={isUploadModalVisible}
        onCancel={() => {
          setIsUploadModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item label="照片上传" required>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              {fileList.length < 5 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传照片</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            label="照片标题"
            name="title"
            rules={[{ required: true, message: '请输入照片标题' }]}
          >
            <Input placeholder="请输入照片标题" />
          </Form.Item>
          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {Object.entries(categoryConfig).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  <Tag color={config.color}>{config.text}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="标签" name="tags">
            <Select mode="tags" placeholder="输入标签后按回车" />
          </Form.Item>
          <Form.Item
            label="拍摄位置"
            name="location"
            rules={[{ required: true, message: '请输入拍摄位置' }]}
          >
            <Input placeholder="请输入拍摄位置" prefix={<EnvironmentOutlined />} />
          </Form.Item>
          <Form.Item
            label="拍摄时间"
            name="captureDate"
            rules={[{ required: true, message: '请选择拍摄时间' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="上传人"
            name="uploader"
            rules={[{ required: true, message: '请输入上传人' }]}
          >
            <Input placeholder="请输入上传人姓名" />
          </Form.Item>
          <Form.Item label="照片描述" name="description">
            <TextArea rows={4} placeholder="请输入照片描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 照片详情弹窗 */}
      <Modal
        title="照片详情"
        open={!!selectedPhoto}
        onCancel={() => setSelectedPhoto(null)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />}>
            下载
          </Button>,
          <Button key="close" onClick={() => setSelectedPhoto(null)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedPhoto && (
          <div>
            <Image src={selectedPhoto.url} alt={selectedPhoto.title} style={{ width: '100%' }} />
            <div style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <strong>标题：</strong>
                  {selectedPhoto.title}
                </div>
                <div>
                  <strong>分类：</strong>
                  <Tag color={categoryConfig[selectedPhoto.category].color}>
                    {categoryConfig[selectedPhoto.category].text}
                  </Tag>
                </div>
                {selectedPhoto.tags.length > 0 && (
                  <div>
                    <strong>标签：</strong>
                    {selectedPhoto.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                )}
                <div>
                  <strong>位置：</strong>
                  <EnvironmentOutlined /> {selectedPhoto.location.name}
                </div>
                <div>
                  <strong>拍摄时间：</strong>
                  {dayjs(selectedPhoto.captureDate).format('YYYY-MM-DD HH:mm:ss')}
                </div>
                <div>
                  <strong>上传时间：</strong>
                  {dayjs(selectedPhoto.uploadDate).format('YYYY-MM-DD HH:mm:ss')}
                </div>
                <div>
                  <strong>上传人：</strong>
                  {selectedPhoto.uploader}
                </div>
                {selectedPhoto.description && (
                  <div>
                    <strong>描述：</strong>
                    <div>{selectedPhoto.description}</div>
                  </div>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PhotoManagement;
