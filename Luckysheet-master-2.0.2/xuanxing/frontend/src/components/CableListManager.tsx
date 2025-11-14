import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { CableItem, InstallationTypeLabels, StartupMethodLabels } from '../types';

interface CableListManagerProps {
  cables: CableItem[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const CableListManager: React.FC<CableListManagerProps> = ({ cables, onDelete, onEdit }) => {
  if (cables.length === 0) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 6, 
          textAlign: 'center',
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '2px dashed',
          borderColor: 'grey.300'
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          暂无电缆
        </Typography>
        <Typography variant="body2" color="text.secondary">
          请在"添加电缆"页面添加第一条电缆
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2} sx={{ maxHeight: 600, borderRadius: 2 }}>
      <Table stickyHeader size="medium">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white', py: 2 }}>序号</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white', py: 2 }}>名称/用途</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white', py: 2 }}>选型结果</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white', py: 2 }}>长度(m)</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white', py: 2 }}>功率/电流</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white', py: 2 }}>启动方式</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white', py: 2 }}>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cables.map((cable, index) => (
            <TableRow key={cable.id} hover>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {cable.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {cable.result.type}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cable.result.specification}mm² | {cable.result.insulation_material}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{cable.params.length}</TableCell>
              <TableCell>
                {cable.params.power && cable.params.power > 0 ? (
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {cable.params.power}kW
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cable.params.current}A
                    </Typography>
                  </Box>
                ) : (
                  <Chip 
                    label={`${cable.params.current}A`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
              </TableCell>
              <TableCell>
                {cable.params.startupMethod ? (
                  <Chip 
                    label={StartupMethodLabels[cable.params.startupMethod]} 
                    size="small" 
                    color={cable.params.startupMethod === 'vfd' ? 'primary' : cable.params.startupMethod === 'soft_starter' ? 'secondary' : 'default'}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">-</Typography>
                )}
              </TableCell>
              <TableCell>
                <Tooltip title="编辑">
                  <IconButton size="small" onClick={() => onEdit(cable.id)} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="删除">
                  <IconButton size="small" onClick={() => onDelete(cable.id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CableListManager;

