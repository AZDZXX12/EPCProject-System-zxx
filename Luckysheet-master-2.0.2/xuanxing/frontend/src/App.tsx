import React, { useState } from 'react';
import {
  Container,
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Paper,
  Stack,
} from '@mui/material';
import CableIcon from '@mui/icons-material/Cable';
import CableInputForm from './components/CableInputForm';
import ResultDisplay from './components/ResultDisplay';
import CableListManager from './components/CableListManager';
import SystemSummaryPanel from './components/SystemSummaryPanel';
import TechnicalDataPanel from './components/TechnicalDataPanel';
import ElectricalEquipmentPanel from './components/ElectricalEquipmentPanel';
import CalculationDetailsPanel from './components/CalculationDetailsPanel';
import StandardsPanel from './components/StandardsPanel';
import ReferencesPanel from './components/ReferencesPanel';
import { CableParams, CableResult, CableItem } from './types';
import { calculateCableSelection, validateParams } from './utils/cableCalculator';
import { generateElectricalScheme, ElectricalEquipment } from './utils/enhancedCalculator';
import { calculateCurrentFromPower } from './utils/powerCalculation';

function App() {
  const [cables, setCables] = useState<CableItem[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [cableName, setCableName] = useState('');
  const [tempResults, setTempResults] = useState<CableResult[]>([]);
  const [tempParams, setTempParams] = useState<CableParams | null>(null);
  const [tempEquipment, setTempEquipment] = useState<ElectricalEquipment | null>(null);
  const [tempRatedCurrent, setTempRatedCurrent] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCalculate = (params: CableParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const validationError = validateParams(params);
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }
      
      setTimeout(() => {
        try {
          const calculatedResults = calculateCableSelection(params);
          
          if (calculatedResults.length === 0) {
            setError('未找到符合要求的电缆规格，请降低电流要求或增加环境温度容限');
            setTempResults([]);
            setTempEquipment(null);
          } else {
            setTempResults(calculatedResults);
            setTempParams(params);
            
            // 生成配电设备推荐
            if (params.power && params.power > 0) {
              const actualCurrent = calculateCurrentFromPower(
                params.power,
                params.voltage,
                params.powerFactor || 0.85,
                0.9
              );
              setTempRatedCurrent(actualCurrent);
              
              const equipment = generateElectricalScheme(
                params.power,
                params.voltage,
                params.powerFactor || 0.85,
                0.9,
                params.startupMethod || 'direct'
              );
              setTempEquipment(equipment);
            } else {
              setTempEquipment(null);
              setTempRatedCurrent(params.current);
            }

              // 自动弹出命名对话框，并生成默认名称
              const defaultName = `电缆-${cables.length + 1}`;
              setCableName(defaultName);
              setShowAddDialog(true);
          }
        } catch (err: any) {
          setError(err.message || '计算失败，请检查输入参数');
          console.error('Calculation error:', err);
        } finally {
          setLoading(false);
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || '计算失败，请检查输入参数');
      setLoading(false);
    }
  };

  const handleAddCable = () => {
    if (!cableName.trim()) {
      setError('请输入电缆名称');
      return;
    }

    if (tempResults.length === 0 || !tempParams) {
      setError('请先进行计算');
      return;
    }

    const newCable: CableItem = {
      id: editingId || `cable-${Date.now()}`,
      name: cableName.trim(),
      params: tempParams,
      result: tempResults[0], // 使用第一个推荐结果
      equipment: tempEquipment,
      ratedCurrent: tempRatedCurrent,
    };

    if (editingId) {
      // 编辑模式
      setCables(cables.map(c => c.id === editingId ? newCable : c));
      setEditingId(null);
    } else {
      // 新增模式
      setCables([...cables, newCable]);
    }

    // 清空对话框数据，但保留计算结果
    setCableName('');
    setShowAddDialog(false);
    // 不清空 tempResults, tempParams, tempEquipment，保持结果显示
    // 不切换标签页，让用户继续添加电缆
  };

  const handleDeleteCable = (id: string) => {
    setCables(cables.filter(c => c.id !== id));
  };

  const handleEditCable = (id: string) => {
    const cable = cables.find(c => c.id === id);
    if (cable) {
      setEditingId(id);
      setCableName(cable.name);
      setTempParams(cable.params);
      setTempResults([cable.result]);
      setTempEquipment(cable.equipment);
      setTempRatedCurrent(cable.ratedCurrent || 0);
      setShowAddDialog(true);
      setCurrentTab(0); // 切换到输入标签
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f7fa', pb: '120px' }}>
      {/* 顶部导航栏 */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1.5, px: 0 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5
            }}>
              <Box sx={{
                bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                p: 1,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              }}>
                <CableIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                  产线电缆选型系统
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  智能计算 · 精准选型 · 符合国标
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip 
                icon={<CableIcon />}
                label={cables.length === 0 ? '暂无电缆' : `已添加 ${cables.length} 条`}
                size="medium" 
                color={cables.length > 0 ? "primary" : "default"}
                sx={{ 
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  px: 1
                }}
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2, mb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'white', 
            borderRadius: 3, 
            mb: 4,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Tabs 
            value={currentTab} 
            onChange={(_event: React.SyntheticEvent, newValue: number) => setCurrentTab(newValue)} 
            variant="standard"
            sx={{ 
              px: 2,
              '& .MuiTab-root': { 
                fontWeight: 700,
                py: 2.5,
                px: 3,
                fontSize: '1rem',
                textTransform: 'none',
                minHeight: 64,
                color: 'text.secondary',
                transition: 'all 0.3s',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'primary.lighter'
                }
              },
              '& .Mui-selected': {
                color: 'primary.main',
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0',
                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
              }
            }}
          >
            <Tab label="添加电缆" />
            <Tab label={`电缆列表 ${cables.length > 0 ? `(${cables.length})` : ''}`} />
            <Tab label="统计汇总" disabled={cables.length === 0} />
            <Tab label="技术资料" />
          </Tabs>
        </Paper>

        {/* Tab 0: 添加电缆 */}
        {currentTab === 0 && (
          <Grid container spacing={4}>
            <Grid item xs={12} lg={5}>
              <Box sx={{ position: 'sticky', top: 24 }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                  }}
                >
                  <CableInputForm onSubmit={handleCalculate} loading={loading} />
                </Paper>
              </Box>
            </Grid>

            <Grid item xs={12} lg={7}>
              <Stack spacing={3}>
                {/* 计算详情 */}
                {tempEquipment && tempResults.length > 0 && tempParams && tempParams.power && (
                  <CalculationDetailsPanel
                    power={tempParams.power}
                    voltage={tempParams.voltage}
                    powerFactor={tempParams.powerFactor || 0.85}
                    ratedCurrent={tempRatedCurrent}
                    designCurrent={tempParams.current}
                  />
                )}

                {/* 计算结果 - 一直显示 */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                  }}
                >
                  <ResultDisplay results={tempResults} />
                </Paper>

                {/* 配电设备推荐 */}
                {tempEquipment && (
                  <ElectricalEquipmentPanel 
                    equipment={tempEquipment} 
                    ratedCurrent={tempRatedCurrent}
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* Tab 1: 电缆列表 */}
        {currentTab === 1 && (
          <CableListManager 
            cables={cables} 
            onDelete={handleDeleteCable}
            onEdit={handleEditCable}
          />
        )}

        {/* Tab 2: 统计汇总 */}
        {currentTab === 2 && (
          <SystemSummaryPanel cables={cables} />
        )}

        {/* Tab 3: 选型标准 */}
        {currentTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StandardsPanel />
            </Grid>
            <Grid item xs={12}>
              <TechnicalDataPanel />
            </Grid>
            <Grid item xs={12}>
              <ReferencesPanel />
            </Grid>
          </Grid>
        )}
      </Container>

      {/* 添加电缆对话框 */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? '编辑电缆' : '添加电缆到列表'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="电缆名称/用途"
            fullWidth
            value={cableName}
            onChange={(e) => setCableName(e.target.value)}
            placeholder="例如：主电机M1、冷却泵P2、照明回路等"
            helperText="请输入电缆的用途或设备名称，方便识别"
          />
          {tempResults.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.lighter', borderRadius: 1, border: '2px solid', borderColor: 'success.main' }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                ✅ 已选方案：
              </Typography>
              <Typography variant="body1" fontWeight={700} color="primary.main">
                {tempResults[0].type} {tempResults[0].specification}mm²
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`载流量 ${tempResults[0].current_rating}A`} size="small" color="primary" />
                <Chip label={`电压降 ${tempResults[0].voltage_drop}%`} size="small" color={tempResults[0].voltage_drop <= 3 ? 'success' : 'warning'} />
                <Chip label={`总价 ¥${tempResults[0].total_price?.toFixed(2)}`} size="small" color="error" />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>取消</Button>
          <Button onClick={handleAddCable} variant="contained">
            {editingId ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 页脚 - 固定在底部 */}
      <Box 
        component="footer" 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          py: 2.5, 
          px: 3, 
          bgcolor: '#1a1a2e',
          color: 'white',
          borderTop: '3px solid',
          borderColor: 'primary.main',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 1 }}>
            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                产线电缆选型系统 v2.0
              </Typography>
              <Typography variant="caption" sx={{ color: 'grey.400' }}>
                基于 GB/T 12706-2020、GB 50217-2018、IEC 60287-1-1:2023、IEC 60364-5-52 标准
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="caption" display="block" sx={{ color: 'warning.light', fontWeight: 600 }}>
                ⚠️ 本工具计算结果仅供参考
              </Typography>
              <Typography variant="caption" sx={{ color: 'grey.400' }}>
                实际工程应用请咨询专业电气工程师
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
