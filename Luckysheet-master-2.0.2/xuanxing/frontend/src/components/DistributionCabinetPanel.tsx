import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CableItem } from '../types';

interface DistributionCabinetPanelProps {
  cables: CableItem[];
}

interface CabinetConfig {
  cabinetCount: number;
  cabinets: {
    id: number;
    name: string;
    cables: CableItem[];
    totalCurrent: number;
    mainBreakerRating: string;
    cabinetSize: string;
  }[];
  mainCabinetEquipment: {
    mainBreaker: string;
    currentTransformer: string;
    voltmeter: string;
    ammeter: string;
    powerMeter: string;
  };
}

const DistributionCabinetPanel: React.FC<DistributionCabinetPanelProps> = ({ cables }) => {
  const cabinetConfig = useMemo<CabinetConfig>(() => {
    if (cables.length === 0) {
      return {
        cabinetCount: 0,
        cabinets: [],
        mainCabinetEquipment: {
          mainBreaker: '',
          currentTransformer: '',
          voltmeter: '',
          ammeter: '',
          powerMeter: '',
        },
      };
    }

    // 计算总电流
    const totalCurrent = cables.reduce((sum, cable) => sum + cable.params.current, 0);
    
    // 按电流分组，每个配电柜最多容纳8-12个回路
    const maxCircuitsPerCabinet = 10;
    const cabinetCount = Math.ceil(cables.length / maxCircuitsPerCabinet);
    
    const cabinets = [];
    for (let i = 0; i < cabinetCount; i++) {
      const startIdx = i * maxCircuitsPerCabinet;
      const endIdx = Math.min((i + 1) * maxCircuitsPerCabinet, cables.length);
      const cabinetCables = cables.slice(startIdx, endIdx);
      const cabinetCurrent = cabinetCables.reduce((sum, c) => sum + c.params.current, 0);
      
      // 主开关容量（柜体总电流的1.2倍，向上取整到标准规格）
      const mainBreakerCurrent = Math.ceil(cabinetCurrent * 1.2 / 50) * 50;
      let mainBreakerRating = '';
      if (mainBreakerCurrent <= 100) mainBreakerRating = 'NS100N 100A';
      else if (mainBreakerCurrent <= 160) mainBreakerRating = 'NS160N 160A';
      else if (mainBreakerCurrent <= 250) mainBreakerRating = 'NS250N 250A';
      else if (mainBreakerCurrent <= 400) mainBreakerRating = 'NS400N 400A';
      else mainBreakerRating = 'NS630N 630A';
      
      // 柜体尺寸
      let cabinetSize = '';
      if (cabinetCables.length <= 6) cabinetSize = '800×600×2000mm';
      else if (cabinetCables.length <= 10) cabinetSize = '1000×600×2200mm';
      else cabinetSize = '1200×800×2200mm';
      
      cabinets.push({
        id: i + 1,
        name: `配电柜 #${i + 1}`,
        cables: cabinetCables,
        totalCurrent: Math.round(cabinetCurrent * 10) / 10,
        mainBreakerRating,
        cabinetSize,
      });
    }
    
    // 总配电柜设备
    const mainBreakerCurrent = Math.ceil(totalCurrent * 1.3 / 100) * 100;
    let mainBreaker = '';
    if (mainBreakerCurrent <= 630) mainBreaker = `NS${mainBreakerCurrent}N ${mainBreakerCurrent}A`;
    else if (mainBreakerCurrent <= 1600) mainBreaker = `NW${mainBreakerCurrent}H1 ${mainBreakerCurrent}A`;
    else mainBreaker = `NW${mainBreakerCurrent}H2 ${mainBreakerCurrent}A`;
    
    return {
      cabinetCount,
      cabinets,
      mainCabinetEquipment: {
        mainBreaker,
        currentTransformer: `LMZ1-0.66 ${Math.ceil(totalCurrent / 100) * 100}/5A`,
        voltmeter: 'PZ96-AV 数字电压表',
        ammeter: 'PZ96-AI 数字电流表',
        powerMeter: 'DTS1352 三相电能表',
      },
    };
  }, [cables]);

  if (cables.length === 0) {
    return null;
  }

  return (
    <Box>
      {/* 配电方案总览 */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Box sx={{ p: 2, bgcolor: 'error.dark', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ElectricalServicesIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              ⚡ 配电柜配置方案
            </Typography>
          </Box>
        </Box>

        <CardContent>
          <Alert severity="info" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>方案说明：</strong>根据{cables.length}条电缆负载，建议配置 <strong>{cabinetConfig.cabinetCount}</strong> 个分配电柜 + 1个总配电柜
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="caption" color="text.secondary">配电柜总数</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {cabinetConfig.cabinetCount + 1}
                  </Typography>
                  <Typography variant="caption">
                    {cabinetConfig.cabinetCount}个分柜 + 1个总柜
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="caption" color="text.secondary">总回路数</Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {cables.length}
                  </Typography>
                  <Typography variant="caption">条电缆回路</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="caption" color="text.secondary">总计算电流</Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {cables.reduce((sum, c) => sum + c.params.current, 0).toFixed(1)}
                  </Typography>
                  <Typography variant="caption">A（安培）</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>

      {/* 总配电柜 */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ p: 2, bgcolor: 'warning.main', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">
            🔌 总配电柜设备清单
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>设备名称</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>型号规格</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>数量</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>备注</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>主断路器</TableCell>
                <TableCell>
                  <Chip label={cabinetConfig.mainCabinetEquipment.mainBreaker} color="error" size="small" />
                </TableCell>
                <TableCell align="center">1</TableCell>
                <TableCell>施耐德/ABB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>电流互感器</TableCell>
                <TableCell>{cabinetConfig.mainCabinetEquipment.currentTransformer}</TableCell>
                <TableCell align="center">3</TableCell>
                <TableCell>A/B/C三相</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>数字电压表</TableCell>
                <TableCell>{cabinetConfig.mainCabinetEquipment.voltmeter}</TableCell>
                <TableCell align="center">1</TableCell>
                <TableCell>显示三相电压</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>数字电流表</TableCell>
                <TableCell>{cabinetConfig.mainCabinetEquipment.ammeter}</TableCell>
                <TableCell align="center">1</TableCell>
                <TableCell>显示三相电流</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>三相电能表</TableCell>
                <TableCell>{cabinetConfig.mainCabinetEquipment.powerMeter}</TableCell>
                <TableCell align="center">1</TableCell>
                <TableCell>RS485通讯</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>浪涌保护器</TableCell>
                <TableCell>PR40/3+NPE 40kA</TableCell>
                <TableCell align="center">1</TableCell>
                <TableCell>防雷保护</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 分配电柜详情 */}
      {cabinetConfig.cabinets.map((cabinet) => (
        <Paper key={cabinet.id} elevation={2} sx={{ mb: 2 }}>
          <Box sx={{ p: 1.5, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              📦 {cabinet.name}
            </Typography>
            <Box>
              <Chip label={`${cabinet.cables.length}个回路`} size="small" sx={{ bgcolor: 'white', color: 'primary.main', mr: 1 }} />
              <Chip label={`${cabinet.totalCurrent}A`} size="small" sx={{ bgcolor: 'white', color: 'primary.main' }} />
            </Box>
          </Box>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">主断路器</Typography>
                <Typography variant="body2" fontWeight={600}>{cabinet.mainBreakerRating}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">柜体尺寸</Typography>
                <Typography variant="body2" fontWeight={600}>{cabinet.cabinetSize}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">安装方式</Typography>
                <Typography variant="body2" fontWeight={600}>落地式/挂墙式</Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              包含回路：
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {cabinet.cables.map((cable) => (
                <Chip 
                  key={cable.id} 
                  label={`${cable.name} (${cable.params.current}A)`} 
                  size="small" 
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </Box>
        </Paper>
      ))}

      {/* 技术说明 */}
      <Alert severity="warning" icon={<WarningIcon />}>
        <Typography variant="body2" gutterBottom>
          <strong>⚠️ 重要说明：</strong>
        </Typography>
        <Typography variant="caption" display="block">
          1. 配电柜设计需符合GB7251.1、IEC61439标准
        </Typography>
        <Typography variant="caption" display="block">
          2. 主断路器需具备短路保护、过载保护、漏电保护功能
        </Typography>
        <Typography variant="caption" display="block">
          3. 需配置母排、端子排、导轨等配套附件
        </Typography>
        <Typography variant="caption" display="block">
          4. 本方案为初步建议，实际施工需持证电气工程师设计确认
        </Typography>
      </Alert>
    </Box>
  );
};

export default DistributionCabinetPanel;

