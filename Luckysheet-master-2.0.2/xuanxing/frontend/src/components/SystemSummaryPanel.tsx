import React, { useMemo } from 'react';
import {
  Paper,
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CableIcon from '@mui/icons-material/Cable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StraightenIcon from '@mui/icons-material/Straighten';
import CategoryIcon from '@mui/icons-material/Category';
import PowerIcon from '@mui/icons-material/Power';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { CableItem, CableSpecSummary } from '../types';
import DistributionCabinetPanel from './DistributionCabinetPanel';

interface SystemSummaryPanelProps {
  cables: CableItem[];
}

const SystemSummaryPanel: React.FC<SystemSummaryPanelProps> = ({ cables }) => {
  // 计算电缆规格汇总
  const specsSummary = useMemo(() => {
    const specsMap = new Map<string, CableSpecSummary>();
    
    cables.forEach(cable => {
      const spec = `${cable.result.type} ${cable.result.specification}mm²`;
      if (!specsMap.has(spec)) {
        specsMap.set(spec, {
          type: spec,
          count: 0,
          totalLength: 0,
          totalPrice: 0,
          items: [],
        });
      }
      
      const summary = specsMap.get(spec)!;
      summary.count += 1;
      summary.totalLength += cable.params.length;
      summary.totalPrice += (cable.result.total_price || 0);
      summary.items.push(cable.name);
    });
    
    return Array.from(specsMap.values()).sort((a, b) => b.totalPrice - a.totalPrice);
  }, [cables]);

  // 计算电器设备汇总
  const equipmentSummary = useMemo(() => {
    const summary = {
      circuitBreakers: new Map<string, number>(),
      contactors: new Map<string, number>(),
      thermalRelays: new Map<string, number>(),
      fuses: new Map<string, number>(),
      vfds: new Map<string, number>(),
    };

    cables.forEach(cable => {
      if (cable.equipment) {
        // 断路器
        const cbKey = `${cable.equipment.circuitBreaker.type} ${cable.equipment.circuitBreaker.rating}A`;
        summary.circuitBreakers.set(cbKey, (summary.circuitBreakers.get(cbKey) || 0) + 1);

        // 接触器
        const contactorKey = cable.equipment.contactor.model;
        summary.contactors.set(contactorKey, (summary.contactors.get(contactorKey) || 0) + 1);

        // 热继电器
        const relayKey = cable.equipment.thermalRelay.model;
        summary.thermalRelays.set(relayKey, (summary.thermalRelays.get(relayKey) || 0) + 1);

        // 熔断器
        const fuseKey = `${cable.equipment.fuse.type} ${cable.equipment.fuse.rating}A`;
        summary.fuses.set(fuseKey, (summary.fuses.get(fuseKey) || 0) + 1);

        // 变频器
        if (cable.equipment.vfd) {
          const vfdKey = cable.equipment.vfd.model;
          summary.vfds.set(vfdKey, (summary.vfds.get(vfdKey) || 0) + 1);
        }
      }
    });

    return summary;
  }, [cables]);

  // 总体统计
  const totalStats = useMemo(() => {
    let totalLength = 0;
    let totalPrice = 0;
    let totalPower = 0;
    let totalCurrent = 0;

    cables.forEach(cable => {
      totalLength += cable.params.length;
      totalPrice += (cable.result.total_price || 0);
      if (cable.params.power) {
        totalPower += cable.params.power;
      }
      totalCurrent += cable.params.current;
    });

    return { totalLength, totalPrice, totalPower, totalCurrent };
  }, [cables]);

  if (cables.length === 0) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 8, 
          textAlign: 'center',
          bgcolor: '#f8f9fa',
          borderRadius: 3,
          border: '2px dashed',
          borderColor: 'divider'
        }}
      >
        <CategoryIcon sx={{ fontSize: 72, color: 'grey.400', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
          暂无数据
        </Typography>
        <Typography variant="body2" color="text.secondary">
          请先添加电缆后查看统计汇总
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* 总体统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'primary.light',
              bgcolor: 'primary.lighter',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(25, 118, 210, 0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: 'primary.main', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <CableIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="primary.main" sx={{ mb: 1 }}>
                {cables.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                电缆总数（根）
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'success.light',
              bgcolor: '#e8f5e9',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(46, 125, 50, 0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: 'success.main', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <StraightenIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="success.main" sx={{ mb: 1 }}>
                {totalStats.totalLength}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                电缆总长（米）
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'warning.light',
              bgcolor: '#fff8e1',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(237, 108, 2, 0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: 'warning.main', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <AttachMoneyIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="warning.main" sx={{ mb: 1 }}>
                {totalStats.totalPrice.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                电缆总价（元）
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'secondary.light',
              bgcolor: '#f3e5f5',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(156, 39, 176, 0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: 'secondary.main', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <PowerIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="secondary.main" sx={{ mb: 1 }}>
                {totalStats.totalPower.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                总功率（kW）
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 额外统计信息 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <ElectricBoltIcon sx={{ color: 'info.main', fontSize: 28 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={700}>总电流负荷</Typography>
                <Typography variant="h4" color="info.main" fontWeight={800}>
                  {totalStats.totalCurrent.toFixed(1)} A
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <CategoryIcon sx={{ color: 'error.main', fontSize: 28 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={700}>电缆规格种类</Typography>
                <Typography variant="h4" color="error.main" fontWeight={800}>
                  {specsSummary.length} 种
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 电缆规格汇总表 */}
      <Accordion 
        defaultExpanded
        elevation={0}
        sx={{ 
          mb: 3, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            borderRadius: '12px 12px 0 0',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TrendingUpIcon />
            <Typography variant="h6" fontWeight={800}>
              电缆规格汇总
            </Typography>
            <Chip 
              label={`${specsSummary.length} 种`} 
              size="small" 
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>序号</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>规格型号</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }} align="center">数量(根)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }} align="center">总长度(m)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }} align="center">单价(元/m)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }} align="center">总价(元)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>使用位置</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {specsSummary.map((spec, index) => (
                  <TableRow 
                    key={index} 
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      borderLeft: index === 0 ? '4px solid' : 'none',
                      borderColor: 'primary.main'
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={`#${index + 1}`} 
                        size="small" 
                        color={index === 0 ? "primary" : "default"}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {spec.type}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={spec.count} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {spec.totalLength}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {(spec.totalPrice / spec.totalLength).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700} color="warning.main">
                        ¥{spec.totalPrice.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {spec.items.map((item, idx) => (
                          <Chip 
                            key={idx} 
                            label={item} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 总计行 */}
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderTop: '2px solid', borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" fontWeight={700}>
                  总计：{cables.length} 根电缆，{specsSummary.length} 种规格
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" fontWeight={700} color="success.main">
                  总长度：{totalStats.totalLength} 米
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" fontWeight={700} color="warning.main">
                  总价：¥{totalStats.totalPrice.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 电器设备汇总 */}
      <Accordion 
        defaultExpanded
        elevation={0}
        sx={{ 
          mb: 3, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            background: 'linear-gradient(135deg, #43a047 0%, #66bb6a 100%)', 
            color: 'white',
            borderRadius: '12px 12px 0 0',
            '&:hover': { background: 'linear-gradient(135deg, #388e3c 0%, #43a047 100%)' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ElectricBoltIcon />
            <Typography variant="h6" fontWeight={800}>
              电器设备汇总
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* 断路器 */}
            {equipmentSummary.circuitBreakers.size > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
                    🔌 断路器
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>规格型号</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>数量</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.from(equipmentSummary.circuitBreakers.entries()).map(([spec, count]) => (
                          <TableRow key={spec} hover>
                            <TableCell>{spec}</TableCell>
                            <TableCell align="center">
                              <Chip label={count} size="small" color="primary" sx={{ fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}

            {/* 接触器 */}
            {equipmentSummary.contactors.size > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'success.main' }}>
                    ⚡ 接触器
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>规格型号</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>数量</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.from(equipmentSummary.contactors.entries()).map(([spec, count]) => (
                          <TableRow key={spec} hover>
                            <TableCell>{spec}</TableCell>
                            <TableCell align="center">
                              <Chip label={count} size="small" color="success" sx={{ fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}

            {/* 热继电器 */}
            {equipmentSummary.thermalRelays.size > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'warning.main' }}>
                    🌡️ 热继电器
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>规格型号</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>数量</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.from(equipmentSummary.thermalRelays.entries()).map(([spec, count]) => (
                          <TableRow key={spec} hover>
                            <TableCell>{spec}</TableCell>
                            <TableCell align="center">
                              <Chip label={count} size="small" color="warning" sx={{ fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}

            {/* 熔断器 */}
            {equipmentSummary.fuses.size > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'error.main' }}>
                    ⚠️ 熔断器
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>规格型号</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>数量</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.from(equipmentSummary.fuses.entries()).map(([spec, count]) => (
                          <TableRow key={spec} hover>
                            <TableCell>{spec}</TableCell>
                            <TableCell align="center">
                              <Chip label={count} size="small" color="error" sx={{ fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}

            {/* 变频器 */}
            {equipmentSummary.vfds.size > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'secondary.main' }}>
                    🔄 变频器（VFD）
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>规格型号</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>数量</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.from(equipmentSummary.vfds.entries()).map(([spec, count]) => (
                          <TableRow key={spec} hover>
                            <TableCell>{spec}</TableCell>
                            <TableCell align="center">
                              <Chip label={count} size="small" color="secondary" sx={{ fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* 配电柜配置方案 */}
      <Box>
        <DistributionCabinetPanel cables={cables} />
      </Box>
    </Box>
  );
};

export default SystemSummaryPanel;
