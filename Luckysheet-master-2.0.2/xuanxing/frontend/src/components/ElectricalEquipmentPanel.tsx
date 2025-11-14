import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import WarningIcon from '@mui/icons-material/Warning';
import { ElectricalEquipment } from '../utils/enhancedCalculator';

interface ElectricalEquipmentPanelProps {
  equipment: ElectricalEquipment | null;
  ratedCurrent: number;
}

export default function ElectricalEquipmentPanel({ equipment, ratedCurrent }: ElectricalEquipmentPanelProps) {
  if (!equipment) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          请先计算电缆规格，系统将自动推荐配电设备
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      <Box sx={{ mb: 4, pb: 3, borderBottom: '2px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
        <SettingsInputComponentIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>配电柜设备选型</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            推荐的配套电气设备
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }} icon={<ElectricBoltIcon />}>
        <strong>额定电流：{ratedCurrent.toFixed(1)}A</strong> | 
        启动电流：{equipment.startingCurrent.min.toFixed(0)}-{equipment.startingCurrent.max.toFixed(0)}A 
        （{equipment.startingCurrent.multiplier}）
      </Alert>

      <Grid container spacing={3}>
        {/* 断路器 */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            bgcolor: '#e3f2fd', 
            borderRadius: 2, 
            height: '100%',
            border: '2px solid',
            borderColor: 'primary.light',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              transform: 'translateY(-2px)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PowerSettingsNewIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                断路器（空开）
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" gutterBottom>
              <strong>型号：</strong>{equipment.circuitBreaker.type}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>规格：</strong>
              <Chip 
                label={`${equipment.circuitBreaker.rating}A`} 
                size="small" 
                color="primary" 
                sx={{ ml: 1, fontWeight: 600 }}
              />
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {equipment.circuitBreaker.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              • 选型依据：1.5-2.5倍额定电流
            </Typography>
          </Box>
        </Grid>

        {/* 接触器 */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            bgcolor: '#e8f5e9', 
            borderRadius: 2, 
            height: '100%',
            border: '2px solid',
            borderColor: 'success.light',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
              transform: 'translateY(-2px)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FlashOnIcon sx={{ mr: 1.5, color: 'success.main', fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                交流接触器
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" gutterBottom>
              <strong>型号：</strong>{equipment.contactor.model}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>规格：</strong>
              <Chip 
                label={equipment.contactor.rating} 
                size="small" 
                color="success" 
                sx={{ ml: 1, fontWeight: 600 }}
              />
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {equipment.contactor.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              • 选型依据：1.2-1.5倍额定电流
            </Typography>
          </Box>
        </Grid>

        {/* 热继电器 */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            bgcolor: '#fff3e0', 
            borderRadius: 2, 
            height: '100%',
            border: '2px solid',
            borderColor: 'warning.light',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(237, 108, 2, 0.2)',
              transform: 'translateY(-2px)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ThermostatIcon sx={{ mr: 1.5, color: 'warning.main', fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                热继电器（过载保护）
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" gutterBottom>
              <strong>型号：</strong>{equipment.thermalRelay.model}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>调节范围：</strong>
              <Chip 
                label={equipment.thermalRelay.range} 
                size="small" 
                color="warning" 
                sx={{ ml: 1, fontWeight: 600 }}
              />
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ color: 'error.main', fontWeight: 600 }}>
              <strong>建议整定：</strong>{equipment.thermalRelay.setting}A
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {equipment.thermalRelay.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              • 整定值：1.05-1.15倍额定电流
            </Typography>
          </Box>
        </Grid>

        {/* 熔断器 */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            bgcolor: '#ffebee', 
            borderRadius: 2, 
            height: '100%',
            border: '2px solid',
            borderColor: 'error.light',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
              transform: 'translateY(-2px)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon sx={{ mr: 1.5, color: 'error.main', fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                熔断器（短路保护）
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" gutterBottom>
              <strong>型号：</strong>{equipment.fuse.type}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>规格：</strong>
              <Chip 
                label={`${equipment.fuse.rating}A`} 
                size="small" 
                color="error" 
                sx={{ ml: 1, fontWeight: 600 }}
              />
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {equipment.fuse.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              • 选型依据：1.5-2.5倍额定电流
            </Typography>
          </Box>
        </Grid>

        {/* 变频器（仅变频启动时显示） */}
        {equipment.vfd && (
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              p: 3, 
              bgcolor: '#f3e5f5', 
              borderRadius: 2, 
              height: '100%',
              border: '2px solid',
              borderColor: 'secondary.light',
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(156, 39, 176, 0.2)',
                transform: 'translateY(-2px)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SettingsInputComponentIcon sx={{ mr: 1.5, color: 'secondary.main', fontSize: 24 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  变频器（VFD）
                </Typography>
                <Chip label="变频启动" size="small" color="secondary" sx={{ ml: 1, fontWeight: 600 }} />
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" gutterBottom>
                <strong>型号：</strong>{equipment.vfd.model}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>功率：</strong>
                <Chip 
                  label={`${equipment.vfd.power}kW`} 
                  size="small" 
                  color="secondary" 
                  sx={{ ml: 1, fontWeight: 600 }}
                />
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>电压：</strong>{equipment.vfd.voltage}V
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>输出电流：</strong>{equipment.vfd.current}A
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                {equipment.vfd.description}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • 选型依据：1.1-1.2倍电机功率
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • 优势：软启动、调速、节能、保护功能完善
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          💡 配电方案说明
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • 断路器：主要用于短路保护和过载保护，同时作为隔离开关
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • 接触器：用于频繁通断控制，可实现远程控制
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • 热继电器：电机过载保护，需根据实际负载调整整定值
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • 熔断器：短路保护备用方案，熔断速度快
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mt: 2 }} icon={<WarningIcon />}>
        <Typography variant="caption">
          <strong>重要提示：</strong>以上推荐仅供参考，实际选型应由专业电气工程师根据现场情况确定，
          并符合GB7251、GB14048等相关标准要求。
        </Typography>
      </Alert>
    </Paper>
  );
}

