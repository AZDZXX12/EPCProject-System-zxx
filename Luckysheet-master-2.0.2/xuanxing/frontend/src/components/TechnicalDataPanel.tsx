import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableViewIcon from '@mui/icons-material/TableView';
import DescriptionIcon from '@mui/icons-material/Description';
import { YJV_CABLE_DATA } from '../data/yjv_cable_data';

// 如果导入失败，使用空数组（避免编译错误）
const safeYJVData = YJV_CABLE_DATA || [];

// 备用数据（如果yjv_cable_data.ts不存在）
const FALLBACK_YJV_DATA = [
  { spec: "1×1.5", insulation: "0.7", sheath: "1.0", approx_outer_diameter: "5.4", approx_weight: "33", max_conductor_dc_resistance: "13.3", test_voltage: "3.5", air_current: "19", soil_current: "24" },
  { spec: "1×2.5", insulation: "0.7", sheath: "1.0", approx_outer_diameter: "5.9", approx_weight: "44", max_conductor_dc_resistance: "7.98", test_voltage: "3.5", air_current: "26", soil_current: "32" },
  { spec: "1×4", insulation: "0.7", sheath: "1.0", approx_outer_diameter: "6.5", approx_weight: "58", max_conductor_dc_resistance: "4.95", test_voltage: "3.5", air_current: "35", soil_current: "42" },
  { spec: "1×6", insulation: "0.7", sheath: "1.0", approx_outer_diameter: "7.1", approx_weight: "74", max_conductor_dc_resistance: "3.3", test_voltage: "3.5", air_current: "45", soil_current: "54" },
  { spec: "1×10", insulation: "0.7", sheath: "1.0", approx_outer_diameter: "8.3", approx_weight: "112", max_conductor_dc_resistance: "1.91", test_voltage: "3.5", air_current: "63", soil_current: "74" },
  { spec: "1×16", insulation: "0.7", sheath: "1.2", approx_outer_diameter: "9.6", approx_weight: "164", max_conductor_dc_resistance: "1.21", test_voltage: "3.5", air_current: "85", soil_current: "99" },
  { spec: "1×25", insulation: "0.9", sheath: "1.2", approx_outer_diameter: "11.4", approx_weight: "255", max_conductor_dc_resistance: "0.78", test_voltage: "3.5", air_current: "112", soil_current: "129" },
  { spec: "1×35", insulation: "0.9", sheath: "1.2", approx_outer_diameter: "12.6", approx_weight: "330", max_conductor_dc_resistance: "0.554", test_voltage: "3.5", air_current: "138", soil_current: "158" },
  { spec: "1×50", insulation: "1", sheath: "1.4", approx_outer_diameter: "14.4", approx_weight: "460", max_conductor_dc_resistance: "0.386", test_voltage: "3.5", air_current: "171", soil_current: "194" },
  { spec: "1×70", insulation: "1.1", sheath: "1.4", approx_outer_diameter: "16.5", approx_weight: "630", max_conductor_dc_resistance: "0.272", test_voltage: "3.5", air_current: "216", soil_current: "242" },
  { spec: "1×95", insulation: "1.1", sheath: "1.6", approx_outer_diameter: "18.7", approx_weight: "830", max_conductor_dc_resistance: "0.206", test_voltage: "3.5", air_current: "261", soil_current: "290" },
  { spec: "1×120", insulation: "1.2", sheath: "1.6", approx_outer_diameter: "20.6", approx_weight: "1020", max_conductor_dc_resistance: "0.161", test_voltage: "3.5", air_current: "300", soil_current: "334" },
  { spec: "1×150", insulation: "1.4", sheath: "1.8", approx_outer_diameter: "23.2", approx_weight: "1300", max_conductor_dc_resistance: "0.129", test_voltage: "3.5", air_current: "343", soil_current: "379" },
  { spec: "1×185", insulation: "1.6", sheath: "1.8", approx_outer_diameter: "26.1", approx_weight: "1610", max_conductor_dc_resistance: "0.106", test_voltage: "3.5", air_current: "391", soil_current: "430" },
  { spec: "1×240", insulation: "1.7", sheath: "2.0", approx_outer_diameter: "29.3", approx_weight: "2080", max_conductor_dc_resistance: "0.0801", test_voltage: "3.5", air_current: "456", soil_current: "499" },
  { spec: "1×300", insulation: "1.8", sheath: "2.2", approx_outer_diameter: "32.3", approx_weight: "2550", max_conductor_dc_resistance: "0.0641", test_voltage: "3.5", air_current: "520", soil_current: "566" },
  { spec: "1×400", insulation: "2.0", sheath: "2.4", approx_outer_diameter: "37.0", approx_weight: "3360", max_conductor_dc_resistance: "0.0486", test_voltage: "3.5", air_current: "606", soil_current: "655" },
  { spec: "2×1.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "9.1", approx_weight: "90", max_conductor_dc_resistance: "13.3", test_voltage: "3.5", air_current: "19", soil_current: "24" },
  { spec: "2×2.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "10.2", approx_weight: "123", max_conductor_dc_resistance: "7.98", test_voltage: "3.5", air_current: "26", soil_current: "33" },
  { spec: "2×4", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "11.4", approx_weight: "168", max_conductor_dc_resistance: "4.95", test_voltage: "3.5", air_current: "35", soil_current: "43" },
  { spec: "2×6", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "12.7", approx_weight: "220", max_conductor_dc_resistance: "3.3", test_voltage: "3.5", air_current: "45", soil_current: "56" },
  { spec: "2×10", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "15.2", approx_weight: "337", max_conductor_dc_resistance: "1.91", test_voltage: "3.5", air_current: "62", soil_current: "77" },
  { spec: "2×16", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "17.9", approx_weight: "498", max_conductor_dc_resistance: "1.21", test_voltage: "3.5", air_current: "84", soil_current: "103" },
  { spec: "2×25", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "21.8", approx_weight: "776", max_conductor_dc_resistance: "0.78", test_voltage: "3.5", air_current: "111", soil_current: "134" },
  { spec: "2×35", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "24.3", approx_weight: "1010", max_conductor_dc_resistance: "0.554", test_voltage: "3.5", air_current: "136", soil_current: "165" },
  { spec: "2×50", insulation: "1.0", sheath: "1.8", approx_outer_diameter: "27.9", approx_weight: "1410", max_conductor_dc_resistance: "0.386", test_voltage: "3.5", air_current: "169", soil_current: "202" },
  { spec: "2×70", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "32.3", approx_weight: "1940", max_conductor_dc_resistance: "0.272", test_voltage: "3.5", air_current: "212", soil_current: "252" },
  { spec: "2×95", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "37.1", approx_weight: "2560", max_conductor_dc_resistance: "0.206", test_voltage: "3.5", air_current: "256", soil_current: "303" },
  { spec: "2×120", insulation: "1.2", sheath: "2.0", approx_outer_diameter: "41.3", approx_weight: "3160", max_conductor_dc_resistance: "0.161", test_voltage: "3.5", air_current: "294", soil_current: "347" },
  { spec: "2×150", insulation: "1.4", sheath: "2.2", approx_outer_diameter: "46.9", approx_weight: "4030", max_conductor_dc_resistance: "0.129", test_voltage: "3.5", air_current: "336", soil_current: "394" },
  { spec: "2×185", insulation: "1.6", sheath: "2.4", approx_outer_diameter: "52.6", approx_weight: "5010", max_conductor_dc_resistance: "0.106", test_voltage: "3.5", air_current: "383", soil_current: "447" },
  { spec: "2×240", insulation: "1.7", sheath: "2.6", approx_outer_diameter: "59.4", approx_weight: "6490", max_conductor_dc_resistance: "0.0801", test_voltage: "3.5", air_current: "446", soil_current: "519" },
  { spec: "3×1.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "9.9", approx_weight: "112", max_conductor_dc_resistance: "13.3", test_voltage: "3.5", air_current: "19", soil_current: "24" },
  { spec: "3×2.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "11.2", approx_weight: "156", max_conductor_dc_resistance: "7.98", test_voltage: "3.5", air_current: "26", soil_current: "33" },
  { spec: "3×4", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "12.7", approx_weight: "217", max_conductor_dc_resistance: "4.95", test_voltage: "3.5", air_current: "35", soil_current: "43" },
  { spec: "3×6", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "14.1", approx_weight: "285", max_conductor_dc_resistance: "3.3", test_voltage: "3.5", air_current: "45", soil_current: "56" },
  { spec: "3×10", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "17.1", approx_weight: "441", max_conductor_dc_resistance: "1.91", test_voltage: "3.5", air_current: "62", soil_current: "77" },
  { spec: "3×16", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "20.3", approx_weight: "660", max_conductor_dc_resistance: "1.21", test_voltage: "3.5", air_current: "84", soil_current: "103" },
  { spec: "3×25", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "24.8", approx_weight: "1030", max_conductor_dc_resistance: "0.78", test_voltage: "3.5", air_current: "111", soil_current: "134" },
  { spec: "3×35", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "27.7", approx_weight: "1350", max_conductor_dc_resistance: "0.554", test_voltage: "3.5", air_current: "136", soil_current: "165" },
  { spec: "3×50", insulation: "1.0", sheath: "1.8", approx_outer_diameter: "31.9", approx_weight: "1890", max_conductor_dc_resistance: "0.386", test_voltage: "3.5", air_current: "169", soil_current: "202" },
  { spec: "3×70", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "37.0", approx_weight: "2610", max_conductor_dc_resistance: "0.272", test_voltage: "3.5", air_current: "212", soil_current: "252" },
  { spec: "3×95", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "42.5", approx_weight: "3450", max_conductor_dc_resistance: "0.206", test_voltage: "3.5", air_current: "256", soil_current: "303" },
  { spec: "3×120", insulation: "1.2", sheath: "2.0", approx_outer_diameter: "47.5", approx_weight: "4280", max_conductor_dc_resistance: "0.161", test_voltage: "3.5", air_current: "294", soil_current: "347" },
  { spec: "3×150", insulation: "1.4", sheath: "2.2", approx_outer_diameter: "54.0", approx_weight: "5480", max_conductor_dc_resistance: "0.129", test_voltage: "3.5", air_current: "336", soil_current: "394" },
  { spec: "3×185", insulation: "1.6", sheath: "2.4", approx_outer_diameter: "60.6", approx_weight: "6830", max_conductor_dc_resistance: "0.106", test_voltage: "3.5", air_current: "383", soil_current: "447" },
  { spec: "3×240", insulation: "1.7", sheath: "2.6", approx_outer_diameter: "68.5", approx_weight: "8860", max_conductor_dc_resistance: "0.0801", test_voltage: "3.5", air_current: "446", soil_current: "519" },
  { spec: "3×300", insulation: "1.8", sheath: "2.8", approx_outer_diameter: "75.8", approx_weight: "10900", max_conductor_dc_resistance: "0.0641", test_voltage: "3.5", air_current: "509", soil_current: "590" },
  { spec: "3×400", insulation: "2.0", sheath: "3.0", approx_outer_diameter: "86.9", approx_weight: "14400", max_conductor_dc_resistance: "0.0486", test_voltage: "3.5", air_current: "593", soil_current: "683" },
  { spec: "3×1.5+1×1.0", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "10.5", approx_weight: "126", max_conductor_dc_resistance: "13.3", test_voltage: "3.5", air_current: "19", soil_current: "24" },
  { spec: "3×2.5+1×1.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "11.8", approx_weight: "173", max_conductor_dc_resistance: "7.98", test_voltage: "3.5", air_current: "26", soil_current: "33" },
  { spec: "3×4+1×2.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "13.4", approx_weight: "242", max_conductor_dc_resistance: "4.95", test_voltage: "3.5", air_current: "35", soil_current: "43" },
  { spec: "3×6+1×4", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "14.9", approx_weight: "320", max_conductor_dc_resistance: "3.3", test_voltage: "3.5", air_current: "45", soil_current: "56" },
  { spec: "3×10+1×6", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "18.2", approx_weight: "499", max_conductor_dc_resistance: "1.91", test_voltage: "3.5", air_current: "62", soil_current: "77" },
  { spec: "3×16+1×10", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "21.7", approx_weight: "750", max_conductor_dc_resistance: "1.21", test_voltage: "3.5", air_current: "84", soil_current: "103" },
  { spec: "3×25+1×16", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "26.6", approx_weight: "1180", max_conductor_dc_resistance: "0.78", test_voltage: "3.5", air_current: "111", soil_current: "134" },
  { spec: "3×35+1×16", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "29.5", approx_weight: "1510", max_conductor_dc_resistance: "0.554", test_voltage: "3.5", air_current: "136", soil_current: "165" },
  { spec: "3×50+1×25", insulation: "1.0", sheath: "1.8", approx_outer_diameter: "34.2", approx_weight: "2140", max_conductor_dc_resistance: "0.386", test_voltage: "3.5", air_current: "169", soil_current: "202" },
  { spec: "3×70+1×35", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "39.8", approx_weight: "2970", max_conductor_dc_resistance: "0.272", test_voltage: "3.5", air_current: "212", soil_current: "252" },
  { spec: "3×95+1×50", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "45.8", approx_weight: "3950", max_conductor_dc_resistance: "0.206", test_voltage: "3.5", air_current: "256", soil_current: "303" },
  { spec: "3×120+1×70", insulation: "1.2", sheath: "2.0", approx_outer_diameter: "51.5", approx_weight: "4940", max_conductor_dc_resistance: "0.161", test_voltage: "3.5", air_current: "294", soil_current: "347" },
  { spec: "3×150+1×70", insulation: "1.4", sheath: "2.2", approx_outer_diameter: "57.3", approx_weight: "6160", max_conductor_dc_resistance: "0.129", test_voltage: "3.5", air_current: "336", soil_current: "394" },
  { spec: "3×185+1×95", insulation: "1.6", sheath: "2.4", approx_outer_diameter: "64.5", approx_weight: "7750", max_conductor_dc_resistance: "0.106", test_voltage: "3.5", air_current: "383", soil_current: "447" },
  { spec: "3×240+1×120", insulation: "1.7", sheath: "2.6", approx_outer_diameter: "73.1", approx_weight: "10100", max_conductor_dc_resistance: "0.0801", test_voltage: "3.5", air_current: "446", soil_current: "519" },
  { spec: "3×300+1×150", insulation: "1.8", sheath: "2.8", approx_outer_diameter: "81.1", approx_weight: "12500", max_conductor_dc_resistance: "0.0641", test_voltage: "3.5", air_current: "509", soil_current: "590" },
  { spec: "3×400+1×185", insulation: "2.0", sheath: "3.0", approx_outer_diameter: "92.9", approx_weight: "16500", max_conductor_dc_resistance: "0.0486", test_voltage: "3.5", air_current: "593", soil_current: "683" },
  { spec: "3×1.5+2×1.0", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "11.0", approx_weight: "139", max_conductor_dc_resistance: "13.3", test_voltage: "3.5", air_current: "19", soil_current: "24" },
  { spec: "3×2.5+2×1.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "12.5", approx_weight: "192", max_conductor_dc_resistance: "7.98", test_voltage: "3.5", air_current: "26", soil_current: "33" },
  { spec: "3×4+2×2.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "14.2", approx_weight: "270", max_conductor_dc_resistance: "4.95", test_voltage: "3.5", air_current: "35", soil_current: "43" },
  { spec: "3×6+2×4", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "15.8", approx_weight: "359", max_conductor_dc_resistance: "3.3", test_voltage: "3.5", air_current: "45", soil_current: "56" },
  { spec: "3×10+2×6", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "19.4", approx_weight: "564", max_conductor_dc_resistance: "1.91", test_voltage: "3.5", air_current: "62", soil_current: "77" },
  { spec: "3×16+2×10", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "23.3", approx_weight: "852", max_conductor_dc_resistance: "1.21", test_voltage: "3.5", air_current: "84", soil_current: "103" },
  { spec: "3×25+2×16", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "28.5", approx_weight: "1350", max_conductor_dc_resistance: "0.78", test_voltage: "3.5", air_current: "111", soil_current: "134" },
  { spec: "3×35+2×16", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "31.6", approx_weight: "1680", max_conductor_dc_resistance: "0.554", test_voltage: "3.5", air_current: "136", soil_current: "165" },
  { spec: "3×50+2×25", insulation: "1.0", sheath: "1.8", approx_outer_diameter: "36.8", approx_weight: "2410", max_conductor_dc_resistance: "0.386", test_voltage: "3.5", air_current: "169", soil_current: "202" },
  { spec: "3×70+2×35", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "42.9", approx_weight: "3350", max_conductor_dc_resistance: "0.272", test_voltage: "3.5", air_current: "212", soil_current: "252" },
  { spec: "3×95+2×50", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "49.5", approx_weight: "4470", max_conductor_dc_resistance: "0.206", test_voltage: "3.5", air_current: "256", soil_current: "303" },
  { spec: "3×120+2×70", insulation: "1.2", sheath: "2.0", approx_outer_diameter: "55.9", approx_weight: "5620", max_conductor_dc_resistance: "0.161", test_voltage: "3.5", air_current: "294", soil_current: "347" },
  { spec: "3×150+2×70", insulation: "1.4", sheath: "2.2", approx_outer_diameter: "61.8", approx_weight: "6850", max_conductor_dc_resistance: "0.129", test_voltage: "3.5", air_current: "336", soil_current: "394" },
  { spec: "3×185+2×95", insulation: "1.6", sheath: "2.4", approx_outer_diameter: "69.7", approx_weight: "8680", max_conductor_dc_resistance: "0.106", test_voltage: "3.5", air_current: "383", soil_current: "447" },
  { spec: "3×240+2×120", insulation: "1.7", sheath: "2.6", approx_outer_diameter: "79.1", approx_width: "11300", max_conductor_dc_resistance: "0.0801", test_voltage: "3.5", air_current: "446", soil_current: "519" },
  { spec: "3×300+2×150", insulation: "1.8", sheath: "2.8", approx_outer_diameter: "87.8", approx_weight: "14100", max_conductor_dc_resistance: "0.0641", test_voltage: "3.5", air_current: "509", soil_current: "590" },
  { spec: "3×400+2×185", insulation: "2.0", sheath: "3.0", approx_outer_diameter: "100.8", approx_weight: "18700", max_conductor_dc_resistance: "0.0486", test_voltage: "3.5", air_current: "593", soil_current: "683" },
  { spec: "4×1.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "10.6", approx_weight: "134", max_conductor_dc_resistance: "13.3", test_voltage: "3.5", air_current: "19", soil_current: "24" },
  { spec: "4×2.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "12.0", approx_weight: "186", max_conductor_dc_resistance: "7.98", test_voltage: "3.5", air_current: "26", soil_current: "33" },
  { spec: "4×4", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "13.6", approx_weight: "259", max_conductor_dc_resistance: "4.95", test_voltage: "3.5", air_current: "35", soil_current: "43" },
  { spec: "4×6", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "15.2", approx_weight: "343", max_conductor_dc_resistance: "3.3", test_voltage: "3.5", air_current: "45", soil_current: "56" },
  { spec: "4×10", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "18.6", approx_weight: "534", max_conductor_dc_resistance: "1.91", test_voltage: "3.5", air_current: "62", soil_current: "77" },
  { spec: "4×16", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "22.3", approx_weight: "805", max_conductor_dc_resistance: "1.21", test_voltage: "3.5", air_current: "84", soil_current: "103" },
  { spec: "4×25", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "27.2", approx_weight: "1270", max_conductor_dc_resistance: "0.78", test_voltage: "3.5", air_current: "111", soil_current: "134" },
  { spec: "4×35", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "30.4", approx_weight: "1660", max_conductor_dc_resistance: "0.554", test_voltage: "3.5", air_current: "136", soil_current: "165" },
  { spec: "4×50", insulation: "1.0", sheath: "1.8", approx_outer_diameter: "35.1", approx_weight: "2330", max_conductor_dc_resistance: "0.386", test_voltage: "3.5", air_current: "169", soil_current: "202" },
  { spec: "4×70", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "40.8", approx_weight: "3220", max_conductor_dc_resistance: "0.272", test_voltage: "3.5", air_current: "212", soil_current: "252" },
  { spec: "4×95", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "47.0", approx_weight: "4270", max_conductor_dc_resistance: "0.206", test_voltage: "3.5", air_current: "256", soil_current: "303" },
  { spec: "4×120", insulation: "1.2", sheath: "2.0", approx_outer_diameter: "52.7", approx_weight: "5310", max_conductor_dc_resistance: "0.161", test_voltage: "3.5", air_current: "294", soil_current: "347" },
  { spec: "4×150", insulation: "1.4", sheath: "2.2", approx_outer_diameter: "59.8", approx_weight: "6810", max_conductor_dc_resistance: "0.129", test_voltage: "3.5", air_current: "336", soil_current: "394" },
  { spec: "4×185", insulation: "1.6", sheath: "2.4", approx_outer_diameter: "67.1", approx_weight: "8500", max_conductor_dc_resistance: "0.106", test_voltage: "3.5", air_current: "383", soil_current: "447" },
  { spec: "4×240", insulation: "1.7", sheath: "2.6", approx_outer_diameter: "76.0", approx_weight: "11000", max_conductor_dc_resistance: "0.0801", test_voltage: "3.5", air_current: "446", soil_current: "519" },
  { spec: "4×300", insulation: "1.8", sheath: "2.8", approx_outer_diameter: "84.1", approx_weight: "13700", max_conductor_dc_resistance: "0.0641", test_voltage: "3.5", air_current: "509", soil_current: "590" },
  { spec: "4×400", insulation: "2.0", sheath: "3.0", approx_outer_diameter: "96.5", approx_weight: "18000", max_conductor_dc_resistance: "0.0486", test_voltage: "3.5", air_current: "593", soil_current: "683" },
  { spec: "4×1.5+1×1.0", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "11.3", approx_weight: "153", max_conductor_dc_resistance: "13.3", test_voltage: "3.5", air_current: "19", soil_current: "24" },
  { spec: "4×2.5+1×1.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "12.8", approx_weight: "211", max_conductor_dc_resistance: "7.98", test_voltage: "3.5", air_current: "26", soil_current: "33" },
  { spec: "4×4+1×2.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "14.6", approx_weight: "296", max_conductor_dc_resistance: "4.95", test_voltage: "3.5", air_current: "35", soil_current: "43" },
  { spec: "4×6+1×4", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "16.3", approx_weight: "393", max_conductor_dc_resistance: "3.3", test_voltage: "3.5", air_current: "45", soil_current: "56" },
  { spec: "4×10+1×6", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "20.0", approx_weight: "618", max_conductor_dc_resistance: "1.91", test_voltage: "3.5", air_current: "62", soil_current: "77" },
  { spec: "4×16+1×10", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "24.0", approx_weight: "936", max_conductor_dc_resistance: "1.21", test_voltage: "3.5", air_current: "84", soil_current: "103" },
  { spec: "4×25+1×16", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "29.4", approx_weight: "1490", max_conductor_dc_resistance: "0.78", test_voltage: "3.5", air_current: "111", soil_current: "134" },
  { spec: "4×35+1×16", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "32.8", approx_weight: "1940", max_conductor_dc_resistance: "0.554", test_voltage: "3.5", air_current: "136", soil_current: "165" },
  { spec: "4×50+1×25", insulation: "1.0", sheath: "1.8", approx_outer_diameter: "37.9", approx_weight: "2730", max_conductor_dc_resistance: "0.386", test_voltage: "3.5", air_current: "169", soil_current: "202" },
  { spec: "4×70+1×35", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "44.2", approx_weight: "3790", max_conductor_dc_resistance: "0.272", test_voltage: "3.5", air_current: "212", soil_current: "252" },
  { spec: "4×95+1×50", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "51.1", approx_weight: "5060", max_conductor_dc_resistance: "0.206", test_voltage: "3.5", air_current: "256", soil_current: "303" },
  { spec: "4×120+1×70", insulation: "1.2", sheath: "2.0", approx_outer_diameter: "57.5", approx_weight: "6350", max_conductor_dc_resistance: "0.161", test_voltage: "3.5", air_current: "294", soil_current: "347" },
  { spec: "4×150+1×70", insulation: "1.4", sheath: "2.2", approx_outer_diameter: "64.2", approx_weight: "7930", max_conductor_dc_resistance: "0.129", test_voltage: "3.5", air_current: "336", soil_current: "394" },
  { spec: "4×185+1×95", insulation: "1.6", sheath: "2.4", approx_outer_diameter: "72.3", approx_weight: "10000", max_conductor_dc_resistance: "0.106", test_voltage: "3.5", air_current: "383", soil_current: "447" },
  { spec: "4×240+1×120", insulation: "1.7", sheath: "2.6", approx_outer_diameter: "82.1", approx_weight: "13000", max_conductor_dc_resistance: "0.0801", test_voltage: "3.5", air_current: "446", soil_current: "519" },
  { spec: "4×300+1×150", insulation: "1.8", sheath: "2.8", approx_outer_diameter: "91.2", approx_weight: "16300", max_conductor_dc_resistance: "0.0641", test_voltage: "3.5", air_current: "509", soil_current: "590" },
  { spec: "5×1.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "11.3", approx_weight: "152", max_conductor_dc_resistance: "13.3", test_voltage: "3.5", air_current: "19", soil_current: "24" },
  { spec: "5×2.5", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "12.8", approx_weight: "211", max_conductor_dc_resistance: "7.98", test_voltage: "3.5", air_current: "26", soil_current: "33" },
  { spec: "5×4", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "14.5", approx_weight: "295", max_conductor_dc_resistance: "4.95", test_voltage: "3.5", air_current: "35", soil_current: "43" },
  { spec: "5×6", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "16.2", approx_weight: "391", max_conductor_dc_resistance: "3.3", test_voltage: "3.5", air_current: "45", soil_current: "56" },
  { spec: "5×10", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "19.9", approx_weight: "609", max_conductor_dc_resistance: "1.91", test_voltage: "3.5", air_current: "62", soil_current: "77" },
  { spec: "5×16", insulation: "0.7", sheath: "1.5", approx_outer_diameter: "23.9", approx_weight: "920", max_conductor_dc_resistance: "1.21", test_voltage: "3.5", air_current: "84", soil_current: "103" },
  { spec: "5×25", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "29.2", approx_weight: "1460", max_conductor_dc_resistance: "0.78", test_voltage: "3.5", air_current: "111", soil_current: "134" },
  { spec: "5×35", insulation: "0.9", sheath: "1.5", approx_outer_diameter: "32.6", approx_weight: "1910", max_conductor_dc_resistance: "0.554", test_voltage: "3.5", air_current: "136", soil_current: "165" },
  { spec: "5×50", insulation: "1.0", sheath: "1.8", approx_outer_diameter: "37.6", approx_weight: "2680", max_conductor_dc_resistance: "0.386", test_voltage: "3.5", air_current: "169", soil_current: "202" },
  { spec: "5×70", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "43.8", approx_weight: "3720", max_conductor_dc_resistance: "0.272", test_voltage: "3.5", air_current: "212", soil_current: "252" },
  { spec: "5×95", insulation: "1.1", sheath: "1.8", approx_outer_diameter: "50.6", approx_weight: "4940", max_conductor_dc_resistance: "0.206", test_voltage: "3.5", air_current: "256", soil_current: "303" },
  { spec: "5×120", insulation: "1.2", sheath: "2.0", approx_outer_diameter: "56.9", approx_weight: "6180", max_conductor_dc_resistance: "0.161", test_voltage: "3.5", air_current: "294", soil_current: "347" },
  { spec: "5×150", insulation: "1.4", sheath: "2.2", approx_outer_diameter: "63.5", approx_weight: "7730", max_conductor_dc_resistance: "0.129", test_voltage: "3.5", air_current: "336", soil_current: "394" },
  { spec: "5×185", insulation: "1.6", sheath: "2.4", approx_outer_diameter: "71.5", approx_weight: "9750", max_conductor_dc_resistance: "0.106", test_voltage: "3.5", air_current: "383", soil_current: "447" },
  { spec: "5×240", insulation: "1.7", sheath: "2.6", approx_outer_diameter: "81.1", approx_weight: "12700", max_conductor_dc_resistance: "0.0801", test_voltage: "3.5", air_current: "446", soil_current: "519" },
  { spec: "5×300", insulation: "1.8", sheath: "2.8", approx_outer_diameter: "89.9", approx_weight: "15800", max_conductor_dc_resistance: "0.0641", test_voltage: "3.5", air_current: "509", soil_current: "590" },
  { spec: "5×400", insulation: "2.0", sheath: "3.0", approx_outer_diameter: "103.1", approx_weight: "20900", max_conductor_dc_resistance: "0.0486", test_voltage: "3.5", air_current: "593", soil_current: "683" }
];

export default function TechnicalDataPanel() {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TableViewIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          技术资料库
        </Typography>
      </Box>

      <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab label="电缆规格表" />
        <Tab label="电器规格表" />
        <Tab label="国标文件" />
      </Tabs>

      {/* Tab 0: 电缆规格表 */}
      {currentTab === 0 && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="caption">
                                    <strong>数据来源：</strong>YJV 0.6/1KV 交联聚乙烯绝缘聚氯乙烯护套电力电缆数据表（数据库.xlsx）
            </Typography>
          </Alert>

          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                YJV 0.6/1KV 交联聚乙烯绝缘聚氯乙烯护套电力电缆（共{safeYJVData.length}种规格）
          </Typography>
          
                            <TableContainer sx={{ mb: 3, maxHeight: '600px' }}>
                                <Table size="small" stickyHeader>
              <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 600 }}>型号规格<br/>(mm²)</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 600 }}>绝缘层厚度<br/>(mm)</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 600 }}>护套层厚度<br/>(mm)</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 600 }}>电缆近似外径<br/>(mm)</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 600 }}>电缆近似重量<br/>(kg/km)</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 600 }}>导体最大直流电阻<br/>(Ω/km)</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 600 }}>试验电压<br/>(KV)</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'success.dark', color: 'white', fontWeight: 600 }}>在空气中载流量<br/>(A)</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: 'info.dark', color: 'white', fontWeight: 600 }}>直埋土壤中载流量<br/>(A)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                                        {safeYJVData.map((cable, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>{cable.spec}</TableCell>
                                                <TableCell align="center">{cable.insulation || '-'}</TableCell>
                                                <TableCell align="center">{cable.sheath || '-'}</TableCell>
                                                <TableCell align="center">{cable.approx_outer_diameter || '-'}</TableCell>
                                                <TableCell align="center">{cable.approx_weight || '-'}</TableCell>
                                                <TableCell align="center">{cable.max_conductor_dc_resistance || '-'}</TableCell>
                                                <TableCell align="center">{cable.test_voltage || '-'}</TableCell>
                                                <TableCell align="center" sx={{ bgcolor: 'success.lighter', fontWeight: 600 }}>{cable.air_current || '-'}</TableCell>
                                                <TableCell align="center" sx={{ bgcolor: 'info.lighter', fontWeight: 600 }}>{cable.soil_current || '-'}</TableCell>
                </TableRow>
                                        ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ p: 1.5, bgcolor: 'warning.lighter', borderRadius: 1 }}>
            <Typography variant="caption" display="block" gutterBottom>
                                    <strong>📌 数据说明：</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
                                    • 本表包含{safeYJVData.length}种YJV电缆规格，数据直接从Excel提取
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
                                    • 载流量分为在空气中和直埋土壤中两种敷设方式
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
                                    • 所有技术参数符合GB/T 12706-2020标准
            </Typography>
          </Box>
        </Box>
      )}

      {/* Tab 1: 电器规格表 */}
      {currentTab === 1 && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="caption">
              <strong>数据来源：</strong>施耐德、ABB等主流品牌产品规格手册
            </Typography>
          </Alert>

          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            低压断路器（塑壳断路器）规格表
          </Typography>
          
          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'error.dark' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>系列</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>额定电流(A)</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>脱扣方式</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>极数</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>应用场合</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>C65N</TableCell>
                  <TableCell align="center">6-63A</TableCell>
                  <TableCell>热磁脱扣</TableCell>
                  <TableCell align="center">1P/2P/3P/4P</TableCell>
                  <TableCell>照明、小功率动力</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>NS100</TableCell>
                  <TableCell align="center">16-100A</TableCell>
                  <TableCell>电子脱扣</TableCell>
                  <TableCell align="center">3P/4P</TableCell>
                  <TableCell>动力配电</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>NS160</TableCell>
                  <TableCell align="center">100-160A</TableCell>
                  <TableCell>电子脱扣</TableCell>
                  <TableCell align="center">3P/4P</TableCell>
                  <TableCell>中等功率动力</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>NS250</TableCell>
                  <TableCell align="center">160-250A</TableCell>
                  <TableCell>电子脱扣</TableCell>
                  <TableCell align="center">3P/4P</TableCell>
                  <TableCell>大功率动力</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>NS400</TableCell>
                  <TableCell align="center">250-400A</TableCell>
                  <TableCell>电子脱扣</TableCell>
                  <TableCell align="center">3P/4P</TableCell>
                  <TableCell>配电主干线</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>NS630</TableCell>
                  <TableCell align="center">400-630A</TableCell>
                  <TableCell>电子脱扣</TableCell>
                  <TableCell align="center">3P/4P</TableCell>
                  <TableCell>总配电</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            交流接触器规格表
          </Typography>
          
          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'success.dark' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>系列</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>额定电流(A)</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>主触点</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>辅助触点</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>适用功率(kW@380V)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>LC1D09</TableCell>
                  <TableCell align="center">9A</TableCell>
                  <TableCell align="center">3NO</TableCell>
                  <TableCell align="center">1NO+1NC</TableCell>
                  <TableCell>≤4kW</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>LC1D18</TableCell>
                  <TableCell align="center">18A</TableCell>
                  <TableCell align="center">3NO</TableCell>
                  <TableCell align="center">1NO+1NC</TableCell>
                  <TableCell>5.5-7.5kW</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>LC1D25</TableCell>
                  <TableCell align="center">25A</TableCell>
                  <TableCell align="center">3NO</TableCell>
                  <TableCell align="center">1NO+1NC</TableCell>
                  <TableCell>11kW</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>LC1D32</TableCell>
                  <TableCell align="center">32A</TableCell>
                  <TableCell align="center">3NO</TableCell>
                  <TableCell align="center">1NO+1NC</TableCell>
                  <TableCell>15kW</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>LC1D40</TableCell>
                  <TableCell align="center">40A</TableCell>
                  <TableCell align="center">3NO</TableCell>
                  <TableCell align="center">1NO+1NC</TableCell>
                  <TableCell>18.5kW</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>LC1D65</TableCell>
                  <TableCell align="center">65A</TableCell>
                  <TableCell align="center">3NO</TableCell>
                  <TableCell align="center">1NO+1NC</TableCell>
                  <TableCell>30kW</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tab 2: 国标文件 */}
      {currentTab === 2 && (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="caption">
              <strong>📚 以下标准文件可供查阅参考</strong>
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* GB/T 12706-2020 */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DescriptionIcon color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      GB/T 12706-2020
                    </Typography>
                    <Chip label="最新版" size="small" color="success" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    额定电压1kV(Um=1.2kV)到35kV(Um=40.5kV)挤包绝缘电力电缆及附件
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    发布日期：2020-03-31 | 实施日期：2020-10-01
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  onClick={() => alert('标准文件为版权保护内容，请通过官方渠道获取')}
                >
                  查看详情
                </Button>
              </Box>
            </Paper>

            {/* GB 50217-2018 */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DescriptionIcon color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      GB 50217-2018
                    </Typography>
                    <Chip label="现行有效" size="small" color="primary" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    电力工程电缆设计标准
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    发布日期：2018-01-16 | 实施日期：2018-10-01
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  onClick={() => alert('标准文件为版权保护内容，请通过官方渠道获取')}
                >
                  查看详情
                </Button>
              </Box>
            </Paper>

            {/* IEC 60287-1-1 */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DescriptionIcon color="info" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      IEC 60287-1-1:2023
                    </Typography>
                    <Chip label="国际标准" size="small" color="info" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Electric cables - Calculation of the current rating
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    发布日期：2023-05-22 | IEC国际电工委员会
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  onClick={() => window.open('https://webstore.iec.ch/publication/73271', '_blank')}
                >
                  IEC官网
                </Button>
              </Box>
            </Paper>

            {/* GB 50054-2011 */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DescriptionIcon color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      GB 50054-2011
                    </Typography>
                    <Chip label="现行有效" size="small" color="primary" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    低压配电设计规范
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    发布日期：2011-06-16 | 实施日期：2012-06-01
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  onClick={() => alert('标准文件为版权保护内容，请通过官方渠道获取')}
                >
                  查看详情
                </Button>
              </Box>
            </Paper>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Alert severity="warning">
            <Typography variant="caption">
              <strong>⚠️ 版权声明：</strong>以上标准文件均受版权保护，仅供参考。如需完整标准文本，请通过以下官方渠道获取：<br />
              • 中国国家标准化管理委员会：<a href="http://www.sac.gov.cn" target="_blank" rel="noopener noreferrer">www.sac.gov.cn</a><br />
              • 国家标准全文公开系统：<a href="http://openstd.samr.gov.cn" target="_blank" rel="noopener noreferrer">openstd.samr.gov.cn</a><br />
              • IEC国际电工委员会：<a href="https://www.iec.ch" target="_blank" rel="noopener noreferrer">www.iec.ch</a>
            </Typography>
          </Alert>
        </Box>
      )}
    </Paper>
  );
}

