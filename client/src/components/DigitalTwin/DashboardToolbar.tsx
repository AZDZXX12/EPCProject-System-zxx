import React from 'react';
import { Space, Radio, DatePicker, Select, Button } from 'antd';
import {
  EyeOutlined,
  BarChartOutlined,
  LayoutOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import './DashboardToolbar.css';

const { RangePicker } = DatePicker;

interface DashboardToolbarProps {
  viewMode: 'scene' | 'data' | 'split';
  onViewModeChange: (mode: 'scene' | 'data' | 'split') => void;
  selectedEquipment: string[];
  onEquipmentChange: (ids: string[]) => void;
  equipmentOptions: Array<{ label: string; value: string }>;
  onExport: () => void;
  onFullscreen: () => void;
  onRefresh: () => void;
}

const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  viewMode,
  onViewModeChange,
  selectedEquipment,
  onEquipmentChange,
  equipmentOptions,
  onExport,
  onFullscreen,
  onRefresh
}) => {
  return (
    <div className="dashboard-toolbar">
      <Space size="middle" wrap>
        {/* 视图切换 */}
        <Radio.Group 
          value={viewMode} 
          onChange={e => onViewModeChange(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="scene">
            <EyeOutlined /> 3D视图
          </Radio.Button>
          <Radio.Button value="data">
            <BarChartOutlined /> 数据视图
          </Radio.Button>
          <Radio.Button value="split">
            <LayoutOutlined /> 分屏
          </Radio.Button>
        </Radio.Group>

        {/* 时间范围选择 */}
        <RangePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder={['开始时间', '结束时间']}
          style={{ width: 360 }}
        />

        {/* 设备筛选 */}
        <Select
          mode="multiple"
          placeholder="全部设备"
          value={selectedEquipment}
          onChange={onEquipmentChange}
          style={{ minWidth: 200 }}
          options={equipmentOptions}
          maxTagCount="responsive"
        />

        {/* 操作按钮 */}
        <Button icon={<DownloadOutlined />} onClick={onExport}>
          导出
        </Button>
        <Button icon={<FullscreenOutlined />} onClick={onFullscreen}>
          全屏
        </Button>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          刷新
        </Button>
      </Space>
    </div>
  );
};

export default DashboardToolbar;
