import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import PowerIcon from '@mui/icons-material/Power';
import { CableParams, InstallationTypeLabels, StartupMethodLabels, StartupMethod } from '../types';
import { calculateCurrentFromPower, calculatePowerFromCurrent } from '../utils/powerCalculation';

interface CableInputFormProps {
  onSubmit: (params: CableParams) => void;
  loading?: boolean;
}

type InputMode = 'current' | 'power';

export default function CableInputForm({ onSubmit, loading = false }: CableInputFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>('current');
  const [formData, setFormData] = useState<CableParams>({
    voltage: 380,
    current: 100,
    length: 50,
    ambientTemp: 30,
    installation: 'tray',
    power: 0,
    powerFactor: 0.85,
    startupMethod: 'vfd',
  });

  // 当功率或电压改变时，自动计算电流
  useEffect(() => {
    if (inputMode === 'power' && formData.power && formData.power > 0) {
      // 计算额定电流（含效率）
      const ratedCurrent = calculateCurrentFromPower(
        formData.power,
        formData.voltage,
        formData.powerFactor || 0.85,
        0.9 // 电机效率
      );
      // 选型电流 = 额定电流 × 1.25（安全余量）
      const designCurrent = ratedCurrent * 1.25;
      setFormData(prev => ({ ...prev, current: Math.round(designCurrent * 10) / 10 }));
    }
  }, [formData.power, formData.voltage, formData.powerFactor, inputMode]);

  // 当电流或电压改变时，自动计算功率
  useEffect(() => {
    if (inputMode === 'current' && formData.current > 0) {
      const calculatedPower = calculatePowerFromCurrent(
        formData.current,
        formData.voltage,
        formData.powerFactor || 0.85
      );
      setFormData(prev => ({ ...prev, power: Math.round(calculatedPower * 100) / 100 }));
    }
  }, [formData.current, formData.voltage, inputMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: InputMode | null) => {
    if (newMode !== null) {
      setInputMode(newMode);
    }
  };

  return (
    <>
      <Box sx={{ mb: 4, pb: 3, borderBottom: '2px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          电缆参数输入
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          请填写完整的电缆使用参数
        </Typography>
      </Box>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <ToggleButtonGroup
              value={inputMode}
              exclusive
              onChange={handleModeChange}
              fullWidth
              color="primary"
              sx={{
                '& .MuiToggleButton-root': {
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }
              }}
            >
              <ToggleButton value="current">
                <BoltIcon sx={{ mr: 1 }} />
                直接输入电流
              </ToggleButton>
              <ToggleButton value="power">
                <PowerIcon sx={{ mr: 1 }} />
                通过功率计算
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>额定电压(V)</InputLabel>
              <Select
                value={formData.voltage}
                label="额定电压(V)"
                onChange={(e) => setFormData({ ...formData, voltage: e.target.value as 220 | 380 | 600 })}
              >
                <MenuItem value={220}>220V（单相）</MenuItem>
                <MenuItem value={380}>380V（三相）</MenuItem>
                <MenuItem value={600}>600V（三相）</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {inputMode === 'power' ? (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="设备功率(kW)"
                  type="number"
                  value={formData.power || ''}
                  onChange={(e) => setFormData({ ...formData, power: parseFloat(e.target.value) || 0 })}
                  inputProps={{ min: 0, step: 0.1 }}
                  helperText="输入设备总功率"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="功率因数"
                  type="number"
                  value={formData.powerFactor}
                  onChange={(e) => setFormData({ ...formData, powerFactor: parseFloat(e.target.value) || 0.85 })}
                  inputProps={{ min: 0, max: 1, step: 0.01 }}
                  helperText="一般取0.8-0.95"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="计算电流(A)"
                  type="number"
                  value={formData.current.toFixed(1)}
                  disabled
                  helperText="自动计算得出"
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      fontWeight: 600,
                    }
                  }}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="负载电流(A)"
                  type="number"
                  value={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: parseFloat(e.target.value) || 0 })}
                  inputProps={{ min: 0, step: 0.1 }}
                  helperText="已知负载电流"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="对应功率(kW)"
                  type="number"
                  value={formData.power?.toFixed(2) || '0'}
                  disabled
                  helperText="参考值"
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                    }
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>环境温度(℃)</InputLabel>
              <Select
                value={formData.ambientTemp}
                label="环境温度(℃)"
                onChange={(e) => setFormData({ ...formData, ambientTemp: e.target.value as 20 | 30 | 40 })}
              >
                <MenuItem value={20}>20℃</MenuItem>
                <MenuItem value={30}>30℃</MenuItem>
                <MenuItem value={40}>40℃</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="线路长度(m)"
              type="number"
              value={formData.length}
              onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) || 0 })}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>

          {inputMode === 'power' && formData.power && formData.power > 0 && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>启动方式</InputLabel>
                <Select
                  value={formData.startupMethod || 'vfd'}
                  label="启动方式"
                  onChange={(e) => setFormData({ ...formData, startupMethod: e.target.value as StartupMethod })}
                >
                  {Object.entries(StartupMethodLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                      {value === 'direct' && ' (≤11kW)'}
                      {value === 'soft_starter' && ' (11-55kW)'}
                      {value === 'vfd' && ' (>22kW或需调速)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} sm={inputMode === 'power' && formData.power && formData.power > 0 ? 6 : 12}>
            <FormControl fullWidth>
              <InputLabel>敷设方式</InputLabel>
              <Select
                value={formData.installation}
                label="敷设方式"
                onChange={(e) => setFormData({ ...formData, installation: e.target.value as any })}
              >
                {Object.entries(InstallationTypeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                py: 2,
                fontSize: '1.05rem',
                fontWeight: 700,
                borderRadius: 2,
                background: loading ? undefined : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                boxShadow: loading ? 0 : '0 4px 14px rgba(25, 118, 210, 0.4)',
                transition: 'all 0.3s',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)',
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
            >
              {loading ? '⏳ 计算中...' : '🔍 开始计算'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

