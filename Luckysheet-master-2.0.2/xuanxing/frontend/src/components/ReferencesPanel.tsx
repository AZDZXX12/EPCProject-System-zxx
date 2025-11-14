import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PublicIcon from '@mui/icons-material/Public';
import FlagIcon from '@mui/icons-material/Flag';

export default function ReferencesPanel() {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <MenuBookIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          参考文献与标准
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />

      {/* 国际标准 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <PublicIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            国际电工委员会标准（IEC）
          </Typography>
        </Box>
        <List dense>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2">
                  <strong>IEC 60287-1-1:2006+AMD1:2014</strong>
                </Typography>
              }
              secondary="Electric cables - Calculation of the current rating"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2">
                  <strong>IEC 60512-2:2013</strong>
                </Typography>
              }
              secondary="Connectors for electronic equipment - Tests and measurements"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2">
                  <strong>IEC 60364-5-52:2009</strong>
                </Typography>
              }
              secondary="Low-voltage electrical installations - Wiring systems"
            />
          </ListItem>
        </List>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 中国国家标准 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <FlagIcon sx={{ mr: 1, fontSize: 20, color: 'error.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            中国国家标准（GB/T）
          </Typography>
        </Box>
        <List dense>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2">
                  <strong>GB/T 50217-2018</strong>
                </Typography>
              }
              secondary="电力工程电缆设计标准"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2">
                  <strong>GB/T 12706-2020</strong>
                </Typography>
              }
              secondary="额定电压1kV到35kV挤包绝缘电力电缆及附件"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2">
                  <strong>DL/T 5221-2016</strong>
                </Typography>
              }
              secondary="城市电力电缆线路设计技术规定"
            />
          </ListItem>
        </List>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 电缆型号说明 */}
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          常用电缆型号说明
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
          <Box sx={{ p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              YJV - 交联聚乙烯绝缘
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Y-聚乙烯，J-交联，V-聚氯乙烯护套 | 工作温度90℃
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              VV - 聚氯乙烯绝缘
            </Typography>
            <Typography variant="caption" color="text.secondary">
              V-聚氯乙烯绝缘，V-聚氯乙烯护套 | 工作温度70℃
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              YJV22 - 钢带铠装
            </Typography>
            <Typography variant="caption" color="text.secondary">
              22-钢带铠装 | 适用于直埋或机械防护要求高的场所
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 免责声明 */}
      <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          <strong>⚠️ 免责声明</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          本工具提供的计算结果仅供参考，实际工程应用应由专业电气工程师审核，并遵守当地规范要求。
        </Typography>
      </Box>
    </Paper>
  );
}

