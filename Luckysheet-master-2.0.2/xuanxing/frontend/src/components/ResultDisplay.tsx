import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CableIcon from '@mui/icons-material/Cable';
import { CableResult } from '../types';

interface ResultDisplayProps {
  results: CableResult[];
}

export default function ResultDisplay({ results }: ResultDisplayProps) {
  if (results.length === 0) {
    return (
      <Box>
        <Box sx={{ mb: 4, pb: 3, borderBottom: '2px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            计算结果
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            推荐的电缆选型方案
          </Typography>
        </Box>
        
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
          <CableIcon sx={{ fontSize: 72, color: 'grey.400', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
            等待计算
          </Typography>
          <Typography variant="body2" color="text.secondary">
            输入参数后点击"开始计算"查看推荐方案
          </Typography>
        </Paper>
      </Box>
    );
  }

  const bestOption = results[0];
  const hasWarning = bestOption.voltage_drop > 5;

  // 格式化电缆型号名称（使用标准规格标识）
  const formatCableName = (result: CableResult) => {
    return `${result.type} ${result.specification || result.core_count + '×' + result.cross_section}mm²`;
  };

  return (
    <Box>
      {/* 标题区域 */}
      <Box sx={{ mb: 4, pb: 3, borderBottom: '2px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            计算结果
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            推荐的电缆选型方案
          </Typography>
        </Box>
        <Chip 
          label={`${results.length} 个方案`} 
          color="primary" 
          size="small" 
          sx={{ fontWeight: 700 }}
        />
      </Box>

      {/* 推荐方案卡片 */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 4, 
          borderRadius: 3,
          border: '2px solid',
          borderColor: hasWarning ? 'warning.main' : 'success.main',
          bgcolor: hasWarning ? '#fff8e1' : '#f1f8e9',
          boxShadow: hasWarning ? '0 4px 16px rgba(237, 108, 2, 0.12)' : '0 4px 16px rgba(46, 125, 50, 0.12)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {hasWarning ? (
              <WarningIcon sx={{ color: 'warning.main', mr: 1.5, fontSize: 28 }} />
            ) : (
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1.5, fontSize: 28 }} />
            )}
            <Typography variant="h6" fontWeight={800}>
              {hasWarning ? '⚠️ 建议优化' : '✅ 最佳方案'}
            </Typography>
          </Box>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">电缆规格</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {formatCableName(bestOption)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="caption" color="text.secondary">载流量</Typography>
              <Typography variant="h6" fontWeight="bold">
                {bestOption.current_rating}A
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="caption" color="text.secondary">电压降</Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                color={bestOption.voltage_drop <= 3 ? 'success.main' : bestOption.voltage_drop <= 5 ? 'warning.main' : 'error.main'}
              >
                {bestOption.voltage_drop}%
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={2}>
              <Typography variant="caption" color="text.secondary">单价</Typography>
              <Typography variant="h6" fontWeight="bold">
                ¥{bestOption.price_per_meter}/m
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">总价</Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                ¥{bestOption.total_price?.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>

          {hasWarning && (
            <Alert severity="warning" sx={{ mt: 2 }} icon={<WarningIcon />}>
              电压降超过5%，建议：① 选择更大截面电缆 ② 缩短线路长度 ③ 提高供电电压等级
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 所有方案对比表 */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={800}>
            电缆方案对比
          </Typography>
          <Chip 
            label={`共 ${results.length} 个方案`} 
            size="small" 
            sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700 }}
          />
        </Box>
        
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>排序</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>电缆型号</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>规格标识</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>相线截面(mm²)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>载流量(A)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>电压降(%)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>单价(¥/m)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>总价(¥)</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>绝缘</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result, index) => {
                const isRecommended = index === 0;
                const voltagDropStatus = result.voltage_drop <= 3 ? 'success' : result.voltage_drop <= 5 ? 'warning' : 'error';
                
                return (
                  <TableRow
                    key={index}
                    sx={{
                      bgcolor: isRecommended ? 'success.lighter' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderLeft: isRecommended ? '4px solid #4caf50' : 'none'
                    }}
                  >
                    <TableCell>
                      {isRecommended ? (
                        <Chip 
                          label="推荐" 
                          size="small" 
                          color="success" 
                          icon={<CheckCircleIcon />}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          #{index + 1}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={isRecommended ? 700 : 500}>
                        {result.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {result.specification || `${result.core_count}×${result.cross_section}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={isRecommended ? 600 : 400}>
                        {result.cross_section}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {result.current_rating}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${result.voltage_drop}%`}
                        size="small"
                        color={voltagDropStatus}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        ¥{result.price_per_meter}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={isRecommended ? 600 : 400}>
                        ¥{result.total_price?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.insulation_material}
                        size="small"
                        sx={{
                          bgcolor: result.insulationColor,
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 选型说明 */}
        <Box sx={{ p: 2.5, bgcolor: 'info.lighter' }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            💡 选型说明
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                ✓ 规格标识：<strong>4×25+1×16mm²</strong> = 4芯25mm²+PE线16mm²
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                ✓ 符合标准：GB/T 12706-2020、GB 50217-2018
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
