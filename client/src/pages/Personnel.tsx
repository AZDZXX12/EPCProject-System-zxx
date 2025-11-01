import React, { useState } from 'react';
import { Card, Table, Tag, Avatar, Space, Button, Row, Col, Statistic, Tabs, Timeline, Input, Select, message, DatePicker } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  IdcardOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const { Search } = Input;

const Personnel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  // 人员数据（需要先定义，因为generateAttendanceData会使用）
  const personnel = [
    {
      id: 1,
      name: '张三',
      jobNumber: 'EMP-001',
      position: '项目经理',
      certification: ['建造师一级', '安全工程师'],
      experience: '15年',
      status: 'active',
      phone: '138-0000-0001',
      safetyTraining: '2024-01-01',
      workDays: 15,
    },
    {
      id: 2,
      name: '李四',
      jobNumber: 'EMP-002',
      position: '电气工程师',
      certification: ['电气工程师', '高压电工证'],
      experience: '10年',
      status: 'active',
      phone: '138-0000-0002',
      safetyTraining: '2024-01-01',
      workDays: 15,
    },
    {
      id: 3,
      name: '王五',
      jobNumber: 'EMP-003',
      position: '高级焊工',
      certification: ['高级焊工证', '压力容器焊接证'],
      experience: '8年',
      status: 'active',
      phone: '138-0000-0003',
      safetyTraining: '2024-01-01',
      workDays: 15,
    },
    {
      id: 4,
      name: '赵六',
      jobNumber: 'EMP-004',
      position: '设备工程师',
      certification: ['设备工程师', '机械工程师'],
      experience: '12年',
      status: 'active',
      phone: '138-0000-0004',
      safetyTraining: '2024-01-01',
      workDays: 15,
    },
    {
      id: 5,
      name: '孙七',
      jobNumber: 'EMP-005',
      position: '安全员',
      certification: ['安全工程师', '注册安全工程师'],
      experience: '7年',
      status: 'active',
      phone: '138-0000-0005',
      safetyTraining: '2024-01-01',
      workDays: 15,
    },
    {
      id: 6,
      name: '周八',
      jobNumber: 'EMP-006',
      position: '质检员',
      certification: ['质量工程师', '无损检测证'],
      experience: '9年',
      status: 'vacation',
      phone: '138-0000-0006',
      safetyTraining: '2024-01-01',
      workDays: 13,
    },
  ];

  // 生成考勤数据（最近30天）
  const generateAttendanceData = () => {
    const data: any[] = [];
    const startDate = selectedMonth.startOf('month');
    const endDate = selectedMonth.endOf('month');
    const daysInMonth = endDate.date();

    personnel.forEach(person => {
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = startDate.date(day);
        const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;
        const isFuture = currentDate.isAfter(dayjs(), 'day');
        
        if (isFuture) continue; // 未来日期不生成考勤
        
        let status = 'present';
        let checkIn = '08:00';
        let checkOut = '18:00';
        let overtime = 0;
        
        if (isWeekend) {
          // 周末可能不上班或加班
          const rand = Math.random();
          if (rand < 0.8) {
            status = 'rest';
            checkIn = '-';
            checkOut = '-';
          } else {
            status = 'overtime';
            checkIn = '09:00';
            checkOut = '15:00';
            overtime = 6;
          }
        } else {
          // 工作日
          const rand = Math.random();
          if (rand < 0.02) {
            status = 'absent';
            checkIn = '-';
            checkOut = '-';
          } else if (rand < 0.05) {
            status = 'late';
            checkIn = '08:' + (10 + Math.floor(Math.random() * 50)).toString().padStart(2, '0');
            checkOut = '18:00';
          } else if (rand < 0.08) {
            status = 'leave';
            checkIn = '-';
            checkOut = '-';
          } else {
            // 正常上班，可能加班
            if (Math.random() < 0.3) {
              checkOut = (19 + Math.floor(Math.random() * 3)) + ':00';
              overtime = parseInt(checkOut) - 18;
            }
          }
        }
        
        data.push({
          key: `${person.jobNumber}-${day}`,
          date: currentDate.format('YYYY-MM-DD'),
          day: day,
          weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][currentDate.day()],
          name: person.name,
          jobNumber: person.jobNumber,
          position: person.position,
          status,
          checkIn,
          checkOut,
          overtime,
          workHours: status === 'present' || status === 'late' ? 8 : (status === 'overtime' ? overtime : 0)
        });
      }
    });
    
    return data;
  };

  const attendanceData = generateAttendanceData();

  // 导出考勤Excel
  const handleExportAttendance = () => {
    try {
      const exportData = attendanceData.map(record => ({
        '日期': record.date,
        '星期': record.weekday,
        '工号': record.jobNumber,
        '姓名': record.name,
        '岗位': record.position,
        '考勤状态': record.status === 'present' ? '正常' : 
                   record.status === 'late' ? '迟到' :
                   record.status === 'absent' ? '缺勤' :
                   record.status === 'leave' ? '请假' :
                   record.status === 'overtime' ? '加班' : '休息',
        '签到时间': record.checkIn,
        '签退时间': record.checkOut,
        '工时': record.workHours,
        '加班时长': record.overtime
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedMonth.format('YYYY年MM月')}考勤`);

      // 设置列宽
      const colWidths = [
        { wch: 12 }, // 日期
        { wch: 6 },  // 星期
        { wch: 10 }, // 工号
        { wch: 10 }, // 姓名
        { wch: 14 }, // 岗位
        { wch: 10 }, // 考勤状态
        { wch: 10 }, // 签到
        { wch: 10 }, // 签退
        { wch: 6 },  // 工时
        { wch: 10 }  // 加班
      ];
      worksheet['!cols'] = colWidths;

      const fileName = `EPC项目考勤表_${selectedMonth.format('YYYY年MM月')}_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      message.success(`✅ 考勤表已导出：${fileName}`);
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  // 导出考勤汇总
  const handleExportSummary = () => {
    try {
      const summary: any[] = [];
      
      personnel.forEach(person => {
        const personRecords = attendanceData.filter(r => r.jobNumber === person.jobNumber);
        const presentDays = personRecords.filter(r => r.status === 'present').length;
        const lateDays = personRecords.filter(r => r.status === 'late').length;
        const absentDays = personRecords.filter(r => r.status === 'absent').length;
        const leaveDays = personRecords.filter(r => r.status === 'leave').length;
        const overtimeDays = personRecords.filter(r => r.status === 'overtime').length;
        const totalOvertime = personRecords.reduce((sum, r) => sum + r.overtime, 0);
        const totalWorkDays = presentDays + lateDays + overtimeDays;

        summary.push({
          '工号': person.jobNumber,
          '姓名': person.name,
          '岗位': person.position,
          '出勤天数': presentDays,
          '迟到次数': lateDays,
          '缺勤天数': absentDays,
          '请假天数': leaveDays,
          '加班天数': overtimeDays,
          '总加班时长': totalOvertime,
          '实际工作天数': totalWorkDays,
          '出勤率': ((totalWorkDays / (totalWorkDays + absentDays + leaveDays)) * 100).toFixed(1) + '%'
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(summary);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '考勤汇总');

      // 设置列宽
      worksheet['!cols'] = [
        { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 12 }, { wch: 14 }, { wch: 10 }
      ];

      const fileName = `EPC项目考勤汇总_${selectedMonth.format('YYYY年MM月')}_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      message.success(`✅ 考勤汇总已导出：${fileName}`);
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  const totalPersonnel = personnel.length;
  const activePersonnel = personnel.filter(p => p.status === 'active').length;
  const vacationPersonnel = personnel.filter(p => p.status === 'vacation').length;

  const columns = [
    {
      title: '工号',
      dataIndex: 'jobNumber',
      key: 'jobNumber',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          {name}
        </Space>
      ),
    },
    {
      title: '岗位',
      dataIndex: 'position',
      key: 'position',
      width: 120,
    },
    {
      title: '资质证书',
      dataIndex: 'certification',
      key: 'certification',
      render: (certs: string[]) => (
        <Space direction="vertical" size={2}>
          {certs.map(cert => (
            <Tag key={cert} color="blue" icon={<SafetyCertificateOutlined />} style={{ marginBottom: 4 }}>
              {cert}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '工作经验',
      dataIndex: 'experience',
      key: 'experience',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '安全培训',
      dataIndex: 'safetyTraining',
      key: 'safetyTraining',
      width: 120,
    },
    {
      title: '出勤天数',
      dataIndex: 'workDays',
      key: 'workDays',
      width: 100,
      render: (days: number) => <span>{days} 天</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '在岗' : '休假'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: () => (
        <Space>
          <Button type="link" size="small">查看详情</Button>
          <Button type="link" size="small">考勤记录</Button>
        </Space>
      ),
    },
  ];

  const attendanceLogs = [
    { time: '08:00', event: '张三 签到', type: 'checkin' },
    { time: '08:05', event: '李四 签到', type: 'checkin' },
    { time: '08:10', event: '王五 签到', type: 'checkin' },
    { time: '12:00', event: '张三 午休', type: 'break' },
    { time: '13:00', event: '李四 复工', type: 'resume' },
    { time: '18:00', event: '王五 签退', type: 'checkout' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
          <TeamOutlined /> 施工人员管理
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          化工设备安装工程施工人员信息与考勤管理
        </p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总人数"
              value={totalPersonnel}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在岗人数"
              value={activePersonnel}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="休假人数"
              value={vacationPersonnel}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="持证率"
              value={100}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'list',
            label: (
              <span>
                <IdcardOutlined /> 人员名单
              </span>
            ),
            children: (
              <Card 
                title={<span style={{ fontSize: 16, fontWeight: 600 }}>施工人员信息</span>}
                extra={
                  <Space>
                    <Search placeholder="搜索人员姓名" style={{ width: 200 }} />
                    <Select
                      placeholder="岗位筛选"
                      style={{ width: 150 }}
                      options={[
                        { label: '全部', value: 'all' },
                        { label: '项目经理', value: '项目经理' },
                        { label: '工程师', value: '工程师' },
                        { label: '焊工', value: '焊工' },
                      ]}
                    />
                    <Button type="primary" icon={<UserAddOutlined />}>添加人员</Button>
                  </Space>
                }
              >
                <Table 
                  columns={columns} 
                  dataSource={personnel} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1400 }}
                />
              </Card>
            ),
          },
          {
            key: 'attendance',
            label: (
              <span>
                <ClockCircleOutlined /> 今日考勤
              </span>
            ),
            children: (
              <Card title={<span style={{ fontSize: 16, fontWeight: 600 }}>今日考勤记录</span>}>
                <Timeline
                  items={attendanceLogs.map((log, index) => ({
                    key: index,
                    color: log.type === 'checkin' ? 'green' : log.type === 'checkout' ? 'red' : 'blue',
                    children: (
                      <>
                        <p style={{ margin: 0, fontWeight: 600 }}>{log.time}</p>
                        <p style={{ margin: 0, color: '#666' }}>{log.event}</p>
                      </>
                    ),
                  }))}
                />
              </Card>
            ),
          },
          {
            key: 'monthly',
            label: (
              <span>
                <CalendarOutlined /> 考勤管理
              </span>
            ),
            children: (
              <Card 
                title={<span style={{ fontSize: 16, fontWeight: 600 }}>月度考勤统计</span>}
                extra={
                  <Space>
                    <DatePicker
                      picker="month"
                      value={selectedMonth}
                      onChange={(date) => setSelectedMonth(date || dayjs())}
                      placeholder="选择月份"
                      style={{ width: 150 }}
                    />
                    <Button 
                      type="primary" 
                      icon={<FileExcelOutlined />}
                      onClick={handleExportAttendance}
                    >
                      导出考勤明细
                    </Button>
                    <Button 
                      type="default" 
                      icon={<DownloadOutlined />}
                      onClick={handleExportSummary}
                    >
                      导出考勤汇总
                    </Button>
                  </Space>
                }
              >
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  <Col span={4}>
                    <Statistic
                      title="总记录数"
                      value={attendanceData.length}
                      valueStyle={{ color: '#1890ff', fontSize: 20 }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="正常出勤"
                      value={attendanceData.filter(r => r.status === 'present').length}
                      valueStyle={{ color: '#52c41a', fontSize: 20 }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="迟到"
                      value={attendanceData.filter(r => r.status === 'late').length}
                      valueStyle={{ color: '#faad14', fontSize: 20 }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="缺勤"
                      value={attendanceData.filter(r => r.status === 'absent').length}
                      valueStyle={{ color: '#f5222d', fontSize: 20 }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="请假"
                      value={attendanceData.filter(r => r.status === 'leave').length}
                      valueStyle={{ color: '#722ed1', fontSize: 20 }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="加班"
                      value={attendanceData.filter(r => r.status === 'overtime').length}
                      valueStyle={{ color: '#13c2c2', fontSize: 20 }}
                    />
                  </Col>
                </Row>

                <Table
                  columns={[
                    {
                      title: '日期',
                      dataIndex: 'date',
                      key: 'date',
                      width: 110,
                      fixed: 'left',
                    },
                    {
                      title: '星期',
                      dataIndex: 'weekday',
                      key: 'weekday',
                      width: 70,
                      render: (text: string) => (
                        <Tag color={text === '周日' || text === '周六' ? 'red' : 'blue'}>
                          {text}
                        </Tag>
                      ),
                    },
                    {
                      title: '工号',
                      dataIndex: 'jobNumber',
                      key: 'jobNumber',
                      width: 100,
                    },
                    {
                      title: '姓名',
                      dataIndex: 'name',
                      key: 'name',
                      width: 100,
                    },
                    {
                      title: '岗位',
                      dataIndex: 'position',
                      key: 'position',
                      width: 140,
                    },
                    {
                      title: '考勤状态',
                      dataIndex: 'status',
                      key: 'status',
                      width: 100,
                      render: (status: string) => {
                        const statusMap: Record<string, { text: string; color: string }> = {
                          present: { text: '正常', color: 'success' },
                          late: { text: '迟到', color: 'warning' },
                          absent: { text: '缺勤', color: 'error' },
                          leave: { text: '请假', color: 'purple' },
                          overtime: { text: '加班', color: 'cyan' },
                          rest: { text: '休息', color: 'default' },
                        };
                        const info = statusMap[status] || { text: status, color: 'default' };
                        return <Tag color={info.color}>{info.text}</Tag>;
                      },
                      filters: [
                        { text: '正常', value: 'present' },
                        { text: '迟到', value: 'late' },
                        { text: '缺勤', value: 'absent' },
                        { text: '请假', value: 'leave' },
                        { text: '加班', value: 'overtime' },
                        { text: '休息', value: 'rest' },
                      ],
                      onFilter: (value: any, record: any) => record.status === value,
                    },
                    {
                      title: '签到时间',
                      dataIndex: 'checkIn',
                      key: 'checkIn',
                      width: 100,
                      render: (text: string) => (
                        <span style={{ color: text === '-' ? '#999' : '#000' }}>{text}</span>
                      ),
                    },
                    {
                      title: '签退时间',
                      dataIndex: 'checkOut',
                      key: 'checkOut',
                      width: 100,
                      render: (text: string) => (
                        <span style={{ color: text === '-' ? '#999' : '#000' }}>{text}</span>
                      ),
                    },
                    {
                      title: '工时',
                      dataIndex: 'workHours',
                      key: 'workHours',
                      width: 80,
                      render: (hours: number) => (
                        <span style={{ fontWeight: 600, color: hours >= 8 ? '#52c41a' : '#faad14' }}>
                          {hours}h
                        </span>
                      ),
                    },
                    {
                      title: '加班时长',
                      dataIndex: 'overtime',
                      key: 'overtime',
                      width: 100,
                      render: (hours: number) => (
                        <span style={{ fontWeight: 600, color: hours > 0 ? '#1890ff' : '#999' }}>
                          {hours > 0 ? `${hours}h` : '-'}
                        </span>
                      ),
                    },
                  ]}
                  dataSource={attendanceData}
                  pagination={{
                    pageSize: 15,
                    showTotal: (total) => `共 ${total} 条记录`,
                    showSizeChanger: true,
                    pageSizeOptions: ['15', '30', '50', '100'],
                  }}
                  scroll={{ x: 1200, y: 500 }}
                  size="small"
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Personnel;

