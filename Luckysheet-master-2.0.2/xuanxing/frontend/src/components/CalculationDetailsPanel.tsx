import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalculateIcon from '@mui/icons-material/Calculate';

interface CalculationDetailsPanelProps {
  power: number;
  voltage: number;
  powerFactor: number;
  ratedCurrent: number;
  designCurrent: number;
}

export default function CalculationDetailsPanel({
  power,
  voltage,
  powerFactor,
  ratedCurrent,
  designCurrent
}: CalculationDetailsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const efficiency = 0.9;
  const safetyFactor = 1.25;

  return (
    <Accordion 
      expanded={expanded} 
      onChange={() => setExpanded(!expanded)} 
      sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        '&:before': {
          display: 'none'
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          bgcolor: '#e3f2fd',
          borderBottom: expanded ? '1px solid' : 'none',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: '#bbdefb'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <CalculateIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Typography variant="subtitle1" fontWeight={700}>
            电流计算详情
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip 
            label={`${ratedCurrent.toFixed(1)}A → ${designCurrent.toFixed(1)}A`} 
            size="small" 
            color="primary"
            sx={{ fontWeight: 700 }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3 }}>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="body2" fontWeight={700} display="block" gutterBottom>
            ① 额定电流计算：I = P / (√3 × U × cosφ × η)
          </Typography>
          <Box sx={{ pl: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {power}kW / (1.732 × {voltage}V × {powerFactor} × {efficiency}) ≈{' '}
              <Typography component="span" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1.05rem' }}>
                {ratedCurrent.toFixed(1)}A
              </Typography>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 2, bgcolor: '#fff8e1', borderRadius: 2, mb: 2, border: '1px solid #ffe082' }}>
          <Typography variant="body2" fontWeight={700} display="block" gutterBottom>
            ② 选型电流（含25%安全余量）：I_设计 = I_额定 × 1.25
          </Typography>
          <Box sx={{ pl: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {ratedCurrent.toFixed(1)}A × {safetyFactor} ≈{' '}
              <Typography component="span" sx={{ color: 'warning.main', fontWeight: 700, fontSize: '1.05rem' }}>
                {designCurrent.toFixed(1)}A
              </Typography>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            💡 选型电流用于电缆和设备选型，已考虑启动和过载因素
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

