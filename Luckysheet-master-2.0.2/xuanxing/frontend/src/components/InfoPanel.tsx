import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function InfoPanel() {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          使用说明
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" paragraph sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <CheckCircleIcon sx={{ fontSize: 16, mr: 1, mt: 0.3, color: 'success.main' }} />
          输入负载电流、线路长度等参数
        </Typography>
        <Typography variant="body2" paragraph sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <CheckCircleIcon sx={{ fontSize: 16, mr: 1, mt: 0.3, color: 'success.main' }} />
          选择环境温度和敷设方式
        </Typography>
        <Typography variant="body2" paragraph sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <CheckCircleIcon sx={{ fontSize: 16, mr: 1, mt: 0.3, color: 'success.main' }} />
          点击"计算推荐电缆"获取方案
        </Typography>
        <Typography variant="body2" paragraph sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <CheckCircleIcon sx={{ fontSize: 16, mr: 1, mt: 0.3, color: 'success.main' }} />
          查看3D模型和详细参数
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box>
        <Typography variant="subtitle2" gutterBottom color="primary">
          技术标准
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          • IEC 60287-1-1: 载流量计算
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          • IEC 60512: 温度校正
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          • IEC 60364-5-52: 敷设方式校正
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          • GB/T 50217: 电缆设计规范
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Typography variant="subtitle2" gutterBottom color="warning.main">
          注意事项
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • 电压降应控制在5%以内
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • 建议预留10-20%载流量裕度
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • 实际工程需专业工程师审核
        </Typography>
      </Box>
    </Paper>
  );
}

