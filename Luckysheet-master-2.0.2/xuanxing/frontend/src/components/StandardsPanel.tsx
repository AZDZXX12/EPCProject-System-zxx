import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VerifiedIcon from '@mui/icons-material/Verified';
import CalculateIcon from '@mui/icons-material/Calculate';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import RouteIcon from '@mui/icons-material/Route';

export default function StandardsPanel() {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <VerifiedIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            选型标准与计算依据
          </Typography>
        </Box>
        <Chip label="最新标准" color="success" size="small" />
      </Box>
      
      <Box sx={{ mb: 2, p: 1.5, bgcolor: 'success.lighter', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
        <Typography variant="caption" display="block" gutterBottom>
          <strong>✅ 电缆规格标准（GB/T 12706-2020）</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • 规格标识：<strong>4×25+1×16mm²</strong> = 3根相线+N线（25mm²）+ PE线（16mm²）
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • PE线截面：≤16mm²时与相线相同，&gt;16mm²时可为相线的1/2（向上取标准值）
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • 标准截面系列：1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300 mm²
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />

      {/* IEC 60287-1-1 */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <CalculateIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              IEC 60287-1-1
            </Typography>
            <Chip 
              label="载流量计算" 
              size="small" 
              color="success" 
              sx={{ ml: 'auto' }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            <strong>标准名称：</strong>电缆载流量计算 - 电流额定值方程（100%负载系数）和损耗计算
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>应用：</strong>计算电缆在恒定负载下的额定载流量，考虑电缆损耗和散热
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
            <Typography variant="caption" display="block">
              I = √[ΔT / (R × Rt × (1 + λ₁ + λ₂))]
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              其中：I-载流量(A)，ΔT-允许温升(K)，R-导体电阻(Ω/m)
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* IEC 60512 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <ThermostatIcon sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              IEC 60512
            </Typography>
            <Chip 
              label="温度校正" 
              size="small" 
              color="warning" 
              sx={{ ml: 'auto' }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            <strong>标准名称：</strong>电气连接器测试和测量标准
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>温度校正系数公式：</strong>
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
            <Typography variant="caption" display="block">
              k_temp = √[(T_max - T_ambient) / (T_max - T_base)]
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              T_max=90℃(XLPE), T_base=30℃, T_ambient=环境温度
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" display="block" gutterBottom>
              <strong>温度对照表：</strong>
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
              <Chip label="20℃: k=1.10" size="small" variant="outlined" />
              <Chip label="30℃: k=1.00" size="small" variant="outlined" />
              <Chip label="40℃: k=0.91" size="small" variant="outlined" />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* IEC 60364-5-52 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <RouteIcon sx={{ mr: 1, color: 'info.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              IEC 60364-5-52
            </Typography>
            <Chip 
              label="敷设校正" 
              size="small" 
              color="info" 
              sx={{ ml: 'auto' }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            <strong>标准名称：</strong>低压电气装置 - 布线系统的选择和安装
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>敷设方式校正系数：</strong>
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">桥架敷设</Typography>
              <Chip label="k = 0.95" size="small" color="primary" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">管道敷设</Typography>
              <Chip label="k = 0.80" size="small" color="primary" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">直埋敷设</Typography>
              <Chip label="k = 1.00" size="small" color="primary" />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* GB/T 50217 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <CalculateIcon sx={{ mr: 1, color: 'error.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              GB 50217-2018
            </Typography>
            <Chip 
              label="电压降计算" 
              size="small" 
              color="error" 
              sx={{ ml: 'auto' }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            <strong>标准名称：</strong>电力工程电缆设计标准（现行有效版本）
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>电压降计算公式：</strong>
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
            <Typography variant="caption" display="block">
              ΔU% = (√3 × I × L × (R×cosφ + X×sinφ)) / U × 100
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              I-负载电流(A), L-长度(km), R-电阻(Ω/km), cosφ=0.85
            </Typography>
          </Box>
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="caption" color="warning.dark">
              <strong>⚠️ 电压降限值：</strong>照明≤3%，动力≤5%
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ p: 1.5, bgcolor: 'info.lighter', borderRadius: 1 }}>
        <Typography variant="caption" display="block" gutterBottom>
          <strong>📌 标准版本说明：</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • GB/T 12706-2020：额定电压1kV到35kV挤包绝缘电力电缆（最新版）
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • GB 50217-2018：电力工程电缆设计标准（现行有效）
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • IEC 60287-1-1:2023：电缆载流量计算（最新国际标准）
        </Typography>
      </Box>
    </Paper>
  );
}

