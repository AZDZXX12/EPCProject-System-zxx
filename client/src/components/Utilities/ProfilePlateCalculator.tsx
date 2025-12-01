import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Divider, InputNumber, message, Row, Space, Statistic, Table, Tag, Typography, Select, Switch, Progress, Popconfirm, Alert, Modal, List } from 'antd';
import * as XLSX from 'xlsx';
import { UploadOutlined, DownloadOutlined, CalculatorOutlined, DeleteOutlined, ClearOutlined, HistoryOutlined, SaveOutlined } from '@ant-design/icons';
import { exportMultipleSheets, exportToImage, exportToPDF } from '../../utils/exportUtils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { logger } from '../../utils/EnhancedLogger';

const { Paragraph, Text } = Typography;

type ProfileItem = {
  category?: string;
  spec?: string;
  lengthMm: number;
  quantity: number;
  unitWeightKgPerM?: number;
};

type PlateItem = {
  material?: string;
  thicknessMm: number;
  lengthMm: number;
  widthMm: number;
  quantity: number;
  densityKgPerM3?: number;
};

type PackedBin = { items: number[]; used: number; waste: number };

// 简单双向旋转 + 层架（Shelf）算法的二维装箱，用于板材组合展示
type PlatePiece = { lengthMm: number; widthMm: number };
type Shelf = { y: number; height: number; usedWidth: number; items: PlatePiece[] };
type PlateSheetPlan = { shelves: Shelf[]; usedArea: number; wasteArea: number };

function packPlatesShelf(pieces: PlatePiece[], sheetWidthMm: number, sheetLengthMm: number, kerfMm: number, marginMm: number): PlateSheetPlan[] {
  const sorted = [...pieces].sort((a, b) => (b.lengthMm * b.widthMm) - (a.lengthMm * a.widthMm));
  const sheets: PlateSheetPlan[] = [];
  const sheetArea = (sheetWidthMm / 1000) * (sheetLengthMm / 1000);
  const widthE = Math.max(0, sheetWidthMm - 2 * marginMm);
  const lengthE = Math.max(0, sheetLengthMm - 2 * marginMm);

  for (const p0 of sorted) {
    let placed = false;
    // 尝试在现有sheet放置
    for (const sheet of sheets) {
      for (const orientation of [p0, { lengthMm: p0.widthMm, widthMm: p0.lengthMm }]) {
        // 依次尝试每个shelf
        for (const shelf of sheet.shelves) {
          const addKerf = shelf.items.length > 0 ? kerfMm : 0;
          if (orientation.lengthMm <= shelf.height && shelf.usedWidth + addKerf + orientation.widthMm <= widthE) {
            shelf.items.push(orientation);
            shelf.usedWidth += addKerf + orientation.widthMm;
            sheet.usedArea += (orientation.lengthMm / 1000) * (orientation.widthMm / 1000);
            sheet.wasteArea = Math.max(0, sheetArea - sheet.usedArea);
            placed = true;
            break;
          }
        }
        if (placed) break;
        // 新建shelf
        const usedHeight = sheet.shelves.reduce((s, sh) => s + sh.height, 0) + (sheet.shelves.length > 0 ? kerfMm : 0);
        if (usedHeight + orientation.lengthMm <= lengthE && orientation.widthMm <= widthE) {
          const newShelf: Shelf = { y: usedHeight, height: orientation.lengthMm, usedWidth: orientation.widthMm, items: [orientation] };
          sheet.shelves.push(newShelf);
          sheet.usedArea += (orientation.lengthMm / 1000) * (orientation.widthMm / 1000);
          sheet.wasteArea = Math.max(0, sheetArea - sheet.usedArea);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    if (!placed) {
      // 新建sheet
      for (const orientation of [p0, { lengthMm: p0.widthMm, widthMm: p0.lengthMm }]) {
        if (orientation.lengthMm <= lengthE && orientation.widthMm <= widthE) {
          const newSheet: PlateSheetPlan = { shelves: [], usedArea: 0, wasteArea: 0 };
          const shelf: Shelf = { y: 0, height: orientation.lengthMm, usedWidth: orientation.widthMm, items: [orientation] };
          newSheet.shelves.push(shelf);
          newSheet.usedArea = (orientation.lengthMm / 1000) * (orientation.widthMm / 1000);
          newSheet.wasteArea = Math.max(0, sheetArea - newSheet.usedArea);
          sheets.push(newSheet);
          placed = true;
          break;
        }
      }
      // 如果依然放不下（比母板更大），跳过（现实中应报错/手动处理）
      if (!placed) {
        logger.warn('板材件尺寸超过母板，无法排版', p0, 'ProfilePlateCalculator');
      }
    }
  }
  return sheets;
}

function parseNumber(v: any): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = typeof v === 'string' ? Number(String(v).replace(/[^\d.-]/g, '')) : Number(v);
  return isFinite(n) ? n : 0;
}

const sanitizeId = (s: string) => (s || '').replace(/[^a-zA-Z0-9_-]/g, '_');

const mmToPx = (mm: number, scale: number) => Math.max(0, Math.round(mm * scale));

function pack1D(items: number[], binSize: number, kerf: number, method: 'BFD' | 'FFD' | 'NFD'): PackedBin[] {
  const arr = [...items].sort((a, b) => b - a).filter((x) => x > 0);
  const bins: PackedBin[] = [];

  const canFit = (bin: PackedBin, x: number) => bin.used + (bin.items.length > 0 ? kerf : 0) + x <= binSize;

  for (const x of arr) {
    if (method === 'NFD' && bins.length > 0) {
      const b = bins[bins.length - 1];
      if (canFit(b, x)) {
        b.items.push(x);
        b.used += (b.items.length > 1 ? kerf : 0) + x;
        b.waste = Math.max(0, binSize - b.used);
        continue;
      }
    }

    if (method === 'FFD') {
      let placed = false;
      for (let i = 0; i < bins.length; i++) {
        if (canFit(bins[i], x)) {
          bins[i].items.push(x);
          bins[i].used += (bins[i].items.length > 1 ? kerf : 0) + x;
          bins[i].waste = Math.max(0, binSize - bins[i].used);
          placed = true;
          break;
        }
      }
      if (placed) continue;
    }

    if (method === 'BFD') {
      let bestIdx = -1;
      let bestRemain = Number.POSITIVE_INFINITY;
      for (let i = 0; i < bins.length; i++) {
        const need = (bins[i].items.length > 0 ? kerf : 0) + x;
        const remain = binSize - bins[i].used;
        if (remain >= need && remain - need < bestRemain) {
          bestRemain = remain - need;
          bestIdx = i;
        }
      }
      if (bestIdx !== -1) {
        bins[bestIdx].items.push(x);
        bins[bestIdx].used += (bins[bestIdx].items.length > 1 ? kerf : 0) + x;
        bins[bestIdx].waste = Math.max(0, binSize - bins[bestIdx].used);
        continue;
      }
    }

    bins.push({ items: [x], used: x, waste: Math.max(0, binSize - x) });
  }
  return bins;
}

function packMultiStrategy(items: number[], binSize: number, kerf: number): PackedBin[] {
  const methods: Array<'BFD' | 'FFD' | 'NFD'> = ['BFD', 'FFD', 'NFD'];
  let best: { bins: PackedBin[]; waste: number; count: number } | null = null;
  for (const m of methods) {
    const bins = pack1D(items, binSize, kerf, m);
    const waste = bins.reduce((s, b) => s + (binSize - b.used), 0);
    const state = { bins, waste, count: bins.length };
    if (!best || waste < best.waste || (waste === best.waste && bins.length < best.count)) best = state;
  }
  return best!.bins;
}

function groupBy<T>(arr: T[], keyFn: (x: T) => string): Record<string, T[]> {
  return arr.reduce((acc, it) => {
    const k = keyFn(it) || '未分组';
    (acc[k] ||= []).push(it);
    return acc;
  }, {} as Record<string, T[]>);
}

const ProfilePlateCalculator: React.FC = () => {
  const [profileItems, setProfileItems] = useState<ProfileItem[]>([]);
  const [plateItems, setPlateItems] = useState<PlateItem[]>([]);

  const [profileLengthUnit, setProfileLengthUnit] = useState<'mm' | 'm'>('mm');
  const [plateLengthUnit, setPlateLengthUnit] = useState<'mm' | 'm'>('mm');

  const [defaultBarLenMm, setDefaultBarLenMm] = useState<number>(6000);
  const [profileKerfMm, setProfileKerfMm] = useState<number>(3);
  const [profileStrategy, setProfileStrategy] = useState<'BFD' | 'FFD' | 'NFD' | 'AUTO'>('AUTO');
  const [useGroupBarLen, setUseGroupBarLen] = useState<boolean>(false);
  const [groupBarLenMap, setGroupBarLenMap] = useState<Record<string, number>>({});
  const [defaultDensity, setDefaultDensity] = useState<number>(7850);

  const [sheetLenMm, setSheetLenMm] = useState<number>(6000);
  const [sheetWidMm, setSheetWidMm] = useState<number>(2000);
  const [plateKerfMm, setPlateKerfMm] = useState<number>(3);
  const [plateMarginMm, setPlateMarginMm] = useState<number>(0);

  const [calculating, setCalculating] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [calculationHistory, setCalculationHistory] = useState<Array<{
    id: string;
    timestamp: number;
    profileCount: number;
    plateCount: number;
    totalWeight: number;
    profileItems: ProfileItem[];
    plateItems: PlateItem[];
    settings: any;
  }>>([]);

  const [messageApi, contextHolder] = message.useMessage();

  const settingsKey = 'ppc_settings_v1';
  useEffect(() => {
    try {
      const raw = localStorage.getItem(settingsKey);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.profileLengthUnit) setProfileLengthUnit(s.profileLengthUnit);
        if (s.plateLengthUnit) setPlateLengthUnit(s.plateLengthUnit);
        if (typeof s.defaultBarLenMm === 'number') setDefaultBarLenMm(s.defaultBarLenMm);
        if (typeof s.profileKerfMm === 'number') setProfileKerfMm(s.profileKerfMm);
        if (s.profileStrategy) setProfileStrategy(s.profileStrategy);
        if (typeof s.useGroupBarLen === 'boolean') setUseGroupBarLen(s.useGroupBarLen);
        if (s.groupBarLenMap) setGroupBarLenMap(s.groupBarLenMap);
        if (typeof s.defaultDensity === 'number') setDefaultDensity(s.defaultDensity);
        if (typeof s.sheetLenMm === 'number') setSheetLenMm(s.sheetLenMm);
        if (typeof s.sheetWidMm === 'number') setSheetWidMm(s.sheetWidMm);
        if (typeof s.plateKerfMm === 'number') setPlateKerfMm(s.plateKerfMm);
        if (typeof s.plateMarginMm === 'number') setPlateMarginMm(s.plateMarginMm);
      }
      const historyRaw = localStorage.getItem('ppc_history_v1');
      if (historyRaw) {
        const history = JSON.parse(historyRaw);
        setCalculationHistory(history);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const s = {
        profileLengthUnit,
        plateLengthUnit,
        defaultBarLenMm,
        profileKerfMm,
        profileStrategy,
        useGroupBarLen,
        groupBarLenMap,
        defaultDensity,
        sheetLenMm,
        sheetWidMm,
        plateKerfMm,
        plateMarginMm,
      };
      localStorage.setItem(settingsKey, JSON.stringify(s));
    } catch {}
  }, [profileLengthUnit, plateLengthUnit, defaultBarLenMm, profileKerfMm, profileStrategy, useGroupBarLen, groupBarLenMap, defaultDensity, sheetLenMm, sheetWidMm, plateKerfMm, plateMarginMm]);

  const resetSettings = () => {
    try {
      localStorage.removeItem(settingsKey);
    } catch {}
    setProfileLengthUnit('mm');
    setPlateLengthUnit('mm');
    setDefaultBarLenMm(6000);
    setProfileKerfMm(3);
    setProfileStrategy('AUTO');
    setUseGroupBarLen(false);
    setGroupBarLenMap({});
    setDefaultDensity(7850);
    setSheetLenMm(6000);
    setSheetWidMm(2000);
    setPlateKerfMm(3);
    setPlateMarginMm(0);
    messageApi.success('已重置设置');
  };

  const countOversizeProfiles = (items: ProfileItem[]): number => {
    let n = 0;
    for (const it of items) {
      const group = (it.spec?.trim() || it.category?.trim() || '未分组');
      const barLen = useGroupBarLen ? (groupBarLenMap[group] || defaultBarLenMm) : defaultBarLenMm;
      if (it.lengthMm > barLen) n += (it.quantity || 1);
    }
    return n;
  };

  const countOversizePlates = (items: PlateItem[]): number => {
    const widthE = Math.max(0, sheetWidMm - 2 * plateMarginMm);
    const lengthE = Math.max(0, sheetLenMm - 2 * plateMarginMm);
    let n = 0;
    for (const it of items) {
      const fit = (it.lengthMm <= lengthE && it.widthMm <= widthE) || (it.widthMm <= lengthE && it.lengthMm <= widthE);
      if (!fit) n += (it.quantity || 1);
    }
    return n;
  };

  const handleImportProfiles = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: '' });

      const items: ProfileItem[] = rows.map((r) => {
        const category = r['类别'] ?? r['型材类别'] ?? r['Category'] ?? r['种类'] ?? r['类型'] ?? r['category'];
        const spec = r['规格'] ?? r['型号'] ?? r['Spec'] ?? r['spec'];
        let length = r['长度'] ?? r['下料长度'] ?? r['切割长度'] ?? r['Length'] ?? r['length'];
        const quantity = r['数量'] ?? r['数量(件)'] ?? r['数量(根)'] ?? r['Qty'] ?? r['qty'];
        let unitWeight = r['单位重量'] ?? r['单位重量kg/m'] ?? r['单重'] ?? r['理论重量'] ?? r['kg/m'] ?? r['unitWeight'];

        let lengthMm = parseNumber(length);
        if (profileLengthUnit === 'm') lengthMm = lengthMm * 1000;
        const item: ProfileItem = {
          category: category ? String(category) : undefined,
          spec: spec ? String(spec) : undefined,
          lengthMm,
          quantity: Math.max(0, Math.floor(parseNumber(quantity) || 1)),
          unitWeightKgPerM: unitWeight !== undefined && unitWeight !== '' ? parseNumber(unitWeight) : undefined,
        };
        return item;
      });

      setProfileItems(items);
      messageApi.success(`已导入型材 ${items.length} 行`);
      const over = countOversizeProfiles(items);
      if (over > 0) {
        messageApi.warning(`存在 ${over} 件型材长度超过标准料长`);
        logger.warn('Profile items exceed bar length', { over }, 'ProfilePlateCalculator');
      }
      logger.info('Profiles imported', { count: items.length }, 'ProfilePlateCalculator');
    } catch (e) {
      messageApi.error('导入型材Excel失败');
      logger.error('Import profiles failed', { e }, 'ProfilePlateCalculator');
    }
  };

  const handleImportPlates = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: '' });

      const items: PlateItem[] = rows.map((r) => {
        const material = r['材质'] ?? r['材料'] ?? r['Material'] ?? r['material'];
        const thickness = r['厚度'] ?? r['板厚'] ?? r['t'] ?? r['Thickness'] ?? r['thickness'];
        const length = r['长度'] ?? r['Length'] ?? r['length'];
        const width = r['宽度'] ?? r['Width'] ?? r['width'];
        const quantity = r['数量'] ?? r['Qty'] ?? r['qty'];
        const density = r['密度'] ?? r['Density'] ?? r['density'];

        let lengthMm = parseNumber(length);
        let widthMm = parseNumber(width);
        let thicknessMm = parseNumber(thickness);
        if (plateLengthUnit === 'm') {
          lengthMm *= 1000; widthMm *= 1000; thicknessMm *= 1000;
        }
        const it: PlateItem = {
          material: material ? String(material) : undefined,
          thicknessMm,
          lengthMm,
          widthMm,
          quantity: Math.max(0, Math.floor(parseNumber(quantity) || 1)),
          densityKgPerM3: density ? parseNumber(density) : undefined,
        };
        return it;
      });

      setPlateItems(items);
      messageApi.success(`已导入板材 ${items.length} 行`);
      const over = countOversizePlates(items);
      if (over > 0) {
        messageApi.warning(`存在 ${over} 件板材超出母板尺寸/边距`);
        logger.warn('Plate items exceed sheet size', { over }, 'ProfilePlateCalculator');
      }
      logger.info('Plates imported', { count: items.length }, 'ProfilePlateCalculator');
    } catch (e) {
      messageApi.error('导入板材Excel失败');
      logger.error('Import plates failed', { e }, 'ProfilePlateCalculator');
    }
  };

  const profileGroups = useMemo(() => {
    return groupBy(profileItems, (x) => (x.spec?.trim() || x.category?.trim() || '未分组'));
  }, [profileItems]);

  const profileResults = useMemo(() => {
    const res: Array<{
      key: string;
      group: string;
      barLenMm: number;
      cuts: number;
      bars: number;
      usedMm: number;
      wasteMm: number;
      wasteRate: number;
      netWeightKg: number;
      buyWeightKg: number;
      plan: PackedBin[];
    }> = [];

    for (const [group, items] of Object.entries(profileGroups)) {
      const barLen = useGroupBarLen ? (groupBarLenMap[group] || defaultBarLenMm) : defaultBarLenMm;
      const lengths: number[] = [];
      items.forEach((it) => {
        for (let i = 0; i < (it.quantity || 0); i++) lengths.push(it.lengthMm);
      });
      const strategy = profileStrategy;
      const kerf = profileKerfMm;
      const bins = strategy === 'AUTO' ? packMultiStrategy(lengths, barLen, kerf) : pack1D(lengths, barLen, kerf, strategy);
      const used = bins.reduce((s, b) => s + b.used, 0);
      const bars = bins.length;
      const buyLen = bars * barLen;
      const waste = Math.max(0, buyLen - used);
      const wasteRate = buyLen > 0 ? waste / buyLen : 0;

      let netWeightKg = 0;
      for (const it of items) {
        const lenM = (it.lengthMm / 1000) * (it.quantity || 0);
        const uw = it.unitWeightKgPerM ?? 0;
        netWeightKg += lenM * uw;
      }
      const avgUw = (() => {
        const arr = items.map((i) => i.unitWeightKgPerM).filter((v) => v && v > 0) as number[];
        if (!arr.length) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
      })();
      const buyWeightKg = (buyLen / 1000) * avgUw;

      res.push({
        key: group,
        group,
        barLenMm: barLen,
        cuts: lengths.length,
        bars,
        usedMm: used,
        wasteMm: waste,
        wasteRate,
        netWeightKg: Number(netWeightKg.toFixed(2)),
        buyWeightKg: Number(buyWeightKg.toFixed(2)),
        plan: bins,
      });
    }
    return res;
  }, [profileGroups, defaultBarLenMm, profileKerfMm, profileStrategy, useGroupBarLen, groupBarLenMap]);

  const plateGroups = useMemo(() => {
    return groupBy(plateItems, (x) => `${x.material || '未分组'}_${x.thicknessMm || 0}`);
  }, [plateItems]);

  const plateResults = useMemo(() => {
    const res: Array<{
      key: string;
      group: string;
      thicknessMm: number;
      sheets: number;
      totalAreaM2: number;
      sheetAreaM2: number;
      netWeightKg: number;
      buyWeightKg: number;
      plan: PlateSheetPlan[];
      actualUtilization: number;
    }> = [];

    const sheetArea = (sheetLenMm / 1000) * (sheetWidMm / 1000);

    for (const [group, items] of Object.entries(plateGroups)) {
      let totalArea = 0;
      let totalVolumeM3 = 0;
      let totalNetWeight = 0;
      const thicknessMm = items[0]?.thicknessMm || 0;
      const density = items[0]?.densityKgPerM3 || defaultDensity;
      const pieces: PlatePiece[] = [];
      for (const it of items) {
        const areaOne = (it.lengthMm / 1000) * (it.widthMm / 1000);
        const volOne = areaOne * (it.thicknessMm / 1000);
        for (let i = 0; i < (it.quantity || 0); i++) {
          pieces.push({ lengthMm: it.lengthMm, widthMm: it.widthMm });
          totalArea += areaOne;
          totalVolumeM3 += volOne;
          totalNetWeight += volOne * (it.densityKgPerM3 || defaultDensity);
        }
      }

      const plan = packPlatesShelf(pieces, sheetWidMm, sheetLenMm, plateKerfMm, plateMarginMm);
      const sheets = plan.length;
      const usedAreaSum = plan.reduce((s, sh) => s + sh.usedArea, 0);
      const actualUtilization = sheets > 0 ? usedAreaSum / (sheets * sheetArea) : 0;
      const buyVolumeM3 = sheets * sheetArea * (thicknessMm / 1000);
      const buyWeightKg = buyVolumeM3 * density;

      res.push({
        key: group,
        group,
        thicknessMm,
        sheets,
        totalAreaM2: Number(totalArea.toFixed(3)),
        sheetAreaM2: Number(sheetArea.toFixed(3)),
        netWeightKg: Number(totalNetWeight.toFixed(2)),
        buyWeightKg: Number(buyWeightKg.toFixed(2)),
        plan,
        actualUtilization: Number((actualUtilization * 100).toFixed(1)),
      });
    }
    return res;
  }, [plateGroups, sheetLenMm, sheetWidMm, plateKerfMm, plateMarginMm, defaultDensity]);

  const totals = useMemo(() => {
    const profileBuy = profileResults.reduce((s, x) => s + x.buyWeightKg, 0);
    const plateBuy = plateResults.reduce((s, x) => s + x.buyWeightKg, 0);
    const netProfile = profileResults.reduce((s, x) => s + x.netWeightKg, 0);
    const netPlate = plateResults.reduce((s, x) => s + x.netWeightKg, 0);
    return {
      buyTotalKg: Number((profileBuy + plateBuy).toFixed(2)),
      netTotalKg: Number((netProfile + netPlate).toFixed(2)),
    };
  }, [profileResults, plateResults]);

  const profileSummary = useMemo(() => {
    const totalBars = profileResults.reduce((s, r) => s + r.bars, 0);
    const totalCuts = profileResults.reduce((s, r) => s + r.cuts, 0);
    const totalBuyLenMm = profileResults.reduce((s, r) => s + r.barLenMm * r.bars, 0);
    const totalUsedMm = profileResults.reduce((s, r) => s + r.usedMm, 0);
    const totalWasteMm = Math.max(0, totalBuyLenMm - totalUsedMm);
    const wasteRate = totalBuyLenMm > 0 ? totalWasteMm / totalBuyLenMm : 0;
    return {
      totalBars,
      totalCuts,
      totalBuyLenM: Number((totalBuyLenMm / 1000).toFixed(2)),
      totalWasteM: Number((totalWasteMm / 1000).toFixed(2)),
      wasteRate: Number((wasteRate * 100).toFixed(2)),
    };
  }, [profileResults]);

  const plateSummary = useMemo(() => {
    const totalSheets = plateResults.reduce((s, r) => s + r.sheets, 0);
    const buyArea = plateResults.reduce((s, r) => s + r.sheets * r.sheetAreaM2, 0);
    const usedArea = plateResults.reduce((s, r) => s + r.totalAreaM2, 0);
    const wasteArea = Math.max(0, buyArea - usedArea);
    const utilization = buyArea > 0 ? (usedArea / buyArea) * 100 : 0;
    return {
      totalSheets,
      buyArea: Number(buyArea.toFixed(2)),
      usedArea: Number(usedArea.toFixed(2)),
      wasteArea: Number(wasteArea.toFixed(2)),
      utilization: Number(utilization.toFixed(2)),
    };
  }, [plateResults]);

  const runCalculate = () => {
    setCalculating(true);
    try {
      const overP = countOversizeProfiles(profileItems);
      const overS = countOversizePlates(plateItems);
      if (overP > 0) messageApi.warning(`存在 ${overP} 件型材长度超过标准料长`);
      if (overS > 0) messageApi.warning(`存在 ${overS} 件板材超出母板尺寸/边距`);
      messageApi.success('计算完成');
      logger.info('Calculation finished', {}, 'ProfilePlateCalculator');
    } finally {
      setCalculating(false);
    }
  };

  const saveToHistory = () => {
    if (!profileItems.length && !plateItems.length) {
      messageApi.warning('无数据可保存');
      return;
    }
    const record = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      profileCount: profileItems.length,
      plateCount: plateItems.length,
      totalWeight: totals.buyTotalKg,
      profileItems: [...profileItems],
      plateItems: [...plateItems],
      settings: {
        profileLengthUnit, plateLengthUnit, defaultBarLenMm, profileKerfMm, profileStrategy,
        useGroupBarLen, groupBarLenMap, defaultDensity, sheetLenMm, sheetWidMm, plateKerfMm, plateMarginMm,
      },
    };
    const newHistory = [record, ...calculationHistory].slice(0, 10);
    setCalculationHistory(newHistory);
    try {
      localStorage.setItem('ppc_history_v1', JSON.stringify(newHistory));
      messageApi.success('已保存到历史记录');
      logger.info('Saved to history', { id: record.id }, 'ProfilePlateCalculator');
    } catch (e) {
      messageApi.error('保存失败');
      logger.error('Save history failed', { e }, 'ProfilePlateCalculator');
    }
  };

  const loadFromHistory = (record: any) => {
    setProfileItems(record.profileItems || []);
    setPlateItems(record.plateItems || []);
    if (record.settings) {
      const s = record.settings;
      if (s.profileLengthUnit) setProfileLengthUnit(s.profileLengthUnit);
      if (s.plateLengthUnit) setPlateLengthUnit(s.plateLengthUnit);
      if (typeof s.defaultBarLenMm === 'number') setDefaultBarLenMm(s.defaultBarLenMm);
      if (typeof s.profileKerfMm === 'number') setProfileKerfMm(s.profileKerfMm);
      if (s.profileStrategy) setProfileStrategy(s.profileStrategy);
      if (typeof s.useGroupBarLen === 'boolean') setUseGroupBarLen(s.useGroupBarLen);
      if (s.groupBarLenMap) setGroupBarLenMap(s.groupBarLenMap);
      if (typeof s.defaultDensity === 'number') setDefaultDensity(s.defaultDensity);
      if (typeof s.sheetLenMm === 'number') setSheetLenMm(s.sheetLenMm);
      if (typeof s.sheetWidMm === 'number') setSheetWidMm(s.sheetWidMm);
      if (typeof s.plateKerfMm === 'number') setPlateKerfMm(s.plateKerfMm);
      if (typeof s.plateMarginMm === 'number') setPlateMarginMm(s.plateMarginMm);
    }
    setHistoryModalVisible(false);
    messageApi.success('已加载历史记录');
    logger.info('Loaded from history', { id: record.id }, 'ProfilePlateCalculator');
  };

  const deleteHistoryRecord = (id: string) => {
    const newHistory = calculationHistory.filter((r) => r.id !== id);
    setCalculationHistory(newHistory);
    try {
      localStorage.setItem('ppc_history_v1', JSON.stringify(newHistory));
      messageApi.success('已删除');
    } catch {}
  };

  const exportResults = () => {
    if (!profileResults.length && !plateResults.length) {
      messageApi.warning('无可导出的结果');
      return;
    }
    // 汇总结果
    const sheetsSummary = [
      {
        sheetName: '型材结果',
        columns: [
          { title: '组', dataIndex: 'group' },
          { title: '标准长度(mm)', dataIndex: 'barLenMm' },
          { title: '下料总数', dataIndex: 'cuts' },
          { title: '根数', dataIndex: 'bars' },
          { title: '利用长度(mm)', dataIndex: 'usedMm' },
          { title: '浪费(mm)', dataIndex: 'wasteMm' },
          { title: '浪费率', dataIndex: 'wasteRate', render: (v: number) => `${(v * 100).toFixed(2)}%` },
          { title: '净重(kg)', dataIndex: 'netWeightKg' },
          { title: '采购重量(kg)', dataIndex: 'buyWeightKg' },
        ],
        data: profileResults,
      },
      {
        sheetName: '板材结果',
        columns: [
          { title: '组', dataIndex: 'group' },
          { title: '厚度(mm)', dataIndex: 'thicknessMm' },
          { title: '需求面积(m²)', dataIndex: 'totalAreaM2' },
          { title: '单张面积(m²)', dataIndex: 'sheetAreaM2' },
          { title: '实际利用率(%)', dataIndex: 'actualUtilization' },
          { title: '张数', dataIndex: 'sheets' },
          { title: '净重(kg)', dataIndex: 'netWeightKg' },
          { title: '采购重量(kg)', dataIndex: 'buyWeightKg' },
        ],
        data: plateResults,
      },
    ];

    // 组合明细
    const profileDetailRows = profileResults.flatMap((g) =>
      g.plan.map((bin, idx) => ({
        group: g.group,
        barIndex: idx + 1,
        usedMm: bin.used,
        wasteMm: bin.waste,
        cuts: bin.items.join(' + '),
      }))
    );
    const plateDetailRows = plateResults.flatMap((g) =>
      g.plan.map((sheet, idx) => ({
        group: g.group,
        sheetIndex: idx + 1,
        usedAreaM2: Number(sheet.usedArea.toFixed(3)),
        wasteAreaM2: Number(sheet.wasteArea.toFixed(3)),
        pieces: sheet.shelves.flatMap((s) => s.items.map((it) => `${it.lengthMm}x${it.widthMm}`)).join(', '),
      }))
    );

    exportMultipleSheets([
      ...sheetsSummary,
      {
        sheetName: '型材组合明细',
        columns: [
          { title: '组', dataIndex: 'group' },
          { title: '根序号', dataIndex: 'barIndex' },
          { title: '利用长度(mm)', dataIndex: 'usedMm' },
          { title: '浪费(mm)', dataIndex: 'wasteMm' },
          { title: '切割组合(mm)', dataIndex: 'cuts' },
        ],
        data: profileDetailRows,
      },
      {
        sheetName: '板材组合明细',
        columns: [
          { title: '组', dataIndex: 'group' },
          { title: '张序号', dataIndex: 'sheetIndex' },
          { title: '已用面积(m²)', dataIndex: 'usedAreaM2' },
          { title: '浪费面积(m²)', dataIndex: 'wasteAreaM2' },
          { title: '组合(长x宽,mm)', dataIndex: 'pieces' },
        ],
        data: plateDetailRows,
      },
    ], '型材_板材计算结果');
  };

  const downloadTemplates = () => {
    const wb = XLSX.utils.book_new();
    const profileHeaders = [['类别', '规格', '长度', '数量', '单位重量kg/m']];
    const profileSample = [['角钢', 'L50x5', 1200, 10, 3.77]];
    const ws1 = XLSX.utils.aoa_to_sheet([...profileHeaders, ...profileSample]);
    XLSX.utils.book_append_sheet(wb, ws1, '型材模板');

    const plateHeaders = [['材质', '厚度', '长度', '宽度', '数量', '密度']];
    const plateSample = [['Q235', 10, 1200, 800, 6, 7850]];
    const ws2 = XLSX.utils.aoa_to_sheet([...plateHeaders, ...plateSample]);
    XLSX.utils.book_append_sheet(wb, ws2, '板材模板');

    XLSX.writeFile(wb, '型材_板材_模板.xlsx');
  };

  const exportAllPlatePreviewsToPDF = async () => {
    if (!plateResults.length) {
      messageApi.warning('无板材结果可导出');
      return;
    }
    try {
      messageApi.loading({ content: '正在生成PDF...', key: 'pdf-export', duration: 0 });
      const pdf = new jsPDF('l', 'mm', 'a4');
      let isFirstPage = true;

      for (const group of plateResults) {
        for (let idx = 0; idx < group.plan.length; idx++) {
          const elementId = `plate_svg_${sanitizeId(group.group)}_${idx}`;
          const element = document.getElementById(elementId);
          if (!element) continue;

          const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' } as any);
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 280;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (!isFirstPage) pdf.addPage();
          pdf.text(`${group.group} - 第${idx + 1}张`, 10, 10);
          pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);
          isFirstPage = false;
        }
      }

      pdf.save('板材排版_全部预览.pdf');
      messageApi.success({ content: 'PDF导出成功', key: 'pdf-export' });
      logger.info('Batch PDF export completed', {}, 'ProfilePlateCalculator');
    } catch (e) {
      messageApi.error({ content: 'PDF导出失败', key: 'pdf-export' });
      logger.error('Batch PDF export failed', { e }, 'ProfilePlateCalculator');
    }
  };

  const profileColumns = [
    { title: '类别', dataIndex: 'category' },
    { title: '规格', dataIndex: 'spec' },
    { title: '长度(mm)', dataIndex: 'lengthMm', render: (v: number) => Math.round(v) },
    { title: '数量', dataIndex: 'quantity' },
    {
      title: '单位重量(kg/m)',
      dataIndex: 'unitWeightKgPerM',
      render: (_: any, record: ProfileItem, idx: number) => (
        <InputNumber
          min={0}
          value={record.unitWeightKgPerM}
          onChange={(val) => {
            const arr = [...profileItems];
            arr[idx] = { ...arr[idx], unitWeightKgPerM: val || 0 };
            setProfileItems(arr);
          }}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, __: any, idx: number) => (
        <Popconfirm title="确认删除？" onConfirm={() => {
          const arr = [...profileItems];
          arr.splice(idx, 1);
          setProfileItems(arr);
          messageApi.success('已删除');
        }}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const plateColumns = [
    { title: '材质', dataIndex: 'material' },
    { title: '厚度(mm)', dataIndex: 'thicknessMm' },
    { title: '长度(mm)', dataIndex: 'lengthMm' },
    { title: '宽度(mm)', dataIndex: 'widthMm' },
    { title: '数量', dataIndex: 'quantity' },
    {
      title: '密度(kg/m³)',
      dataIndex: 'densityKgPerM3',
      render: (_: any, record: PlateItem, idx: number) => (
        <InputNumber
          min={0}
          value={record.densityKgPerM3 ?? defaultDensity}
          onChange={(val) => {
            const arr = [...plateItems];
            arr[idx] = { ...arr[idx], densityKgPerM3: val || 0 };
            setPlateItems(arr);
          }}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, __: any, idx: number) => (
        <Popconfirm title="确认删除？" onConfirm={() => {
          const arr = [...plateItems];
          arr.splice(idx, 1);
          setPlateItems(arr);
          messageApi.success('已删除');
        }}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const renderSheetPreview = (sheet: PlateSheetPlan, idx: number, groupKey: string): JSX.Element => {
    const id = `plate_svg_${sanitizeId(groupKey)}_${idx}`;
    const maxW = 600; // px
    const maxH = 360; // px
    const scale = Math.min(maxW / sheetWidMm, maxH / sheetLenMm);
    const outerW = mmToPx(sheetWidMm, scale);
    const outerH = mmToPx(sheetLenMm, scale);
    const margin = plateMarginMm;

    const rects: Array<{ x: number; y: number; w: number; h: number }> = [];
    sheet.shelves.forEach((shelf) => {
      let xAcc = margin;
      const yMm = margin + shelf.y;
      shelf.items.forEach((it, j) => {
        if (j > 0) xAcc += plateKerfMm;
        const wMm = it.widthMm;
        const hMm = shelf.height;
        rects.push({ x: mmToPx(xAcc, scale), y: mmToPx(yMm, scale), w: mmToPx(wMm, scale), h: mmToPx(hMm, scale) });
        xAcc += it.widthMm;
      });
    });

    return (
      <div style={{ marginTop: 8 }}>
        <div id={id} style={{ display: 'inline-block', background: '#fff' }}>
          <svg width={outerW + 2} height={outerH + 2}>
            <rect x={1} y={1} width={outerW} height={outerH} fill="#fafafa" stroke="#ccc" />
            {rects.map((r, i) => (
              <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#69c0ff" fillOpacity={0.35} stroke="#096dd9" />
            ))}
          </svg>
        </div>
        <div>
          <Button size="small" style={{ marginTop: 8 }} onClick={() => exportToImage(id, `板材排版_${groupKey}_Sheet${idx + 1}`, 'png')}>导出该张预览</Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {contextHolder}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={24}>
            <Card 
              title={<Space><CalculatorOutlined style={{ color: '#1890ff' }} />型材/板材计算</Space>}
              headStyle={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card 
                    size="small" 
                    title={<Space><Tag color="blue">型材数据</Tag></Space>} 
                    bordered
                    headStyle={{ background: '#e6f7ff', borderBottom: '2px solid #1890ff' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Space wrap>
                      <label>长度单位：</label>
                      <Select value={profileLengthUnit} onChange={(v) => setProfileLengthUnit(v)} style={{ width: 100 }}>
                        <Select.Option value="mm">mm</Select.Option>
                        <Select.Option value="m">m</Select.Option>
                      </Select>
                      <Button icon={<UploadOutlined />} onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.xlsx,.xls';
                        input.onchange = () => {
                          const f = input.files?.[0];
                          if (f) handleImportProfiles(f);
                        };
                        input.click();
                      }}>导入型材Excel</Button>
                      {profileItems.length > 0 && (
                        <Popconfirm title="确认清空所有型材数据？" onConfirm={() => {
                          setProfileItems([]);
                          messageApi.success('已清空型材数据');
                        }}>
                          <Button icon={<ClearOutlined />} danger>清空</Button>
                        </Popconfirm>
                      )}
                    </Space>
                    <Space wrap>
                      <label>标准长度(mm)：</label>
                      <InputNumber min={1000} step={100} value={defaultBarLenMm} onChange={(v) => setDefaultBarLenMm(v || 0)} />
                      <label>锯缝(mm)：</label>
                      <InputNumber min={0} step={0.5} value={profileKerfMm} onChange={(v) => setProfileKerfMm(v || 0)} />
                      <label>策略：</label>
                      <Select value={profileStrategy} onChange={(v) => setProfileStrategy(v)} style={{ width: 120 }}>
                        <Select.Option value="AUTO">自动(AUTO)</Select.Option>
                        <Select.Option value="BFD">最佳适配(BFD)</Select.Option>
                        <Select.Option value="FFD">首次适配(FFD)</Select.Option>
                        <Select.Option value="NFD">下一个适配(NFD)</Select.Option>
                      </Select>
                      <label>按组料长：</label>
                      <Switch checked={useGroupBarLen} onChange={(checked) => setUseGroupBarLen(checked)} />
                    </Space>
                    <Table 
                      rowKey={(r) => `${r.category || ''}-${r.spec || ''}-${r.lengthMm}-${r.quantity}`}
                      dataSource={profileItems}
                      columns={profileColumns as any}
                      size="small"
                      bordered
                      pagination={{ pageSize: 5, simple: true }}
                      locale={{ emptyText: '暂无数据，请导入Excel' }}
                    />
                  </Space>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card 
                    size="small" 
                    title={<Space><Tag color="cyan">板材数据</Tag></Space>} 
                    bordered
                    headStyle={{ background: '#e6fffb', borderBottom: '2px solid #13c2c2' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Space wrap>
                      <label>长度单位：</label>
                      <Select value={plateLengthUnit} onChange={(v) => setPlateLengthUnit(v)} style={{ width: 100 }}>
                        <Select.Option value="mm">mm</Select.Option>
                        <Select.Option value="m">m</Select.Option>
                      </Select>
                      <Button icon={<UploadOutlined />} onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.xlsx,.xls';
                        input.onchange = () => {
                          const f = input.files?.[0];
                          if (f) handleImportPlates(f);
                        };
                        input.click();
                      }}>导入板材Excel</Button>
                      {plateItems.length > 0 && (
                        <Popconfirm title="确认清空所有板材数据？" onConfirm={() => {
                          setPlateItems([]);
                          messageApi.success('已清空板材数据');
                        }}>
                          <Button icon={<ClearOutlined />} danger>清空</Button>
                        </Popconfirm>
                      )}
                    </Space>
                    <Space wrap>
                      <label>母板尺寸(mm)：</label>
                      <InputNumber min={100} step={10} value={sheetLenMm} onChange={(v) => setSheetLenMm(v || 0)} />
                      <span>x</span>
                      <InputNumber min={100} step={10} value={sheetWidMm} onChange={(v) => setSheetWidMm(v || 0)} />
                      <label>锯缝(mm)：</label>
                      <InputNumber min={0} step={0.5} value={plateKerfMm} onChange={(v) => setPlateKerfMm(v || 0)} />
                      <label>边距(mm)：</label>
                      <InputNumber min={0} step={1} value={plateMarginMm} onChange={(v) => setPlateMarginMm(v || 0)} />
                      <label>默认密度(kg/m³)：</label>
                      <InputNumber min={1000} max={9000} step={10} value={defaultDensity} onChange={(v) => setDefaultDensity(v || 0)} />
                    </Space>
                    <Table 
                      rowKey={(r) => `${r.material || ''}-${r.thicknessMm}-${r.lengthMm}-${r.widthMm}-${r.quantity}`}
                      dataSource={plateItems}
                      columns={plateColumns as any}
                      size="small"
                      bordered
                      pagination={{ pageSize: 5, simple: true }}
                      locale={{ emptyText: '暂无数据，请导入Excel' }}
                    />
                  </Space>
                  </Card>
                </Col>
              </Row>
              <Divider />
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={12} md={8}>
                  <Space wrap>
                    <Button type="primary" size="large" loading={calculating} onClick={runCalculate} icon={<CalculatorOutlined />}>开始计算</Button>
                  </Space>
                </Col>
                <Col xs={24} sm={12} md={16}>
                  <Space wrap>
                    <Button icon={<DownloadOutlined />} onClick={exportResults}>导出Excel</Button>
                    <Button icon={<DownloadOutlined />} onClick={downloadTemplates}>下载模板</Button>
                    {plateResults.length > 0 && (
                      <Button type="dashed" icon={<DownloadOutlined />} onClick={exportAllPlatePreviewsToPDF}>导出PDF</Button>
                    )}
                    <Divider type="vertical" />
                    <Button icon={<SaveOutlined />} onClick={saveToHistory}>保存</Button>
                    <Button icon={<HistoryOutlined />} onClick={() => setHistoryModalVisible(true)}>历史</Button>
                    <Button onClick={resetSettings}>重置</Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <Card 
              title={<Space><Tag color="blue">型材结果</Tag><Text type="secondary">切割方案</Text></Space>} 
              bordered
              headStyle={{ background: '#f0f5ff', borderBottom: '2px solid #1890ff' }}
            >
              <Table
                rowKey={(r) => r.key}
                dataSource={profileResults}
                size="small"
                pagination={{ pageSize: 5 }}
                columns={[
                  { title: '组(规格/类别)', dataIndex: 'group' },
                  { title: '标准长度(mm)', dataIndex: 'barLenMm', render: (v: number, record: any) => (
                    useGroupBarLen ? (
                      <InputNumber
                        min={1000}
                        step={100}
                        value={groupBarLenMap[record.group] ?? defaultBarLenMm}
                        onChange={(val) => setGroupBarLenMap({ ...groupBarLenMap, [record.group]: val || defaultBarLenMm })}
                        style={{ width: 120 }}
                      />
                    ) : v
                  ) },
                  { title: '下料总数', dataIndex: 'cuts' },
                  { title: '根数', dataIndex: 'bars' },
                  { title: '利用长度(mm)', dataIndex: 'usedMm' },
                  { title: '浪费(mm)', dataIndex: 'wasteMm' },
                  { title: '浪费率', dataIndex: 'wasteRate', render: (v: number) => <Tag color={v > 0.15 ? 'orange' : 'blue'}>{(v * 100).toFixed(2)}%</Tag> },
                  { title: '净重(kg)', dataIndex: 'netWeightKg' },
                  { title: '采购重量(kg)', dataIndex: 'buyWeightKg' },
                ] as any}
                expandable={{
                  expandedRowRender: (record: any) => (
                    <Table
                      size="small"
                      pagination={false}
                      dataSource={record.plan.map((bin: PackedBin, idx: number) => ({
                        key: `${record.key}-${idx}`,
                        bar: idx + 1,
                        usedMm: bin.used,
                        wasteMm: bin.waste,
                        cuts: bin.items.join(' + '),
                      }))}
                      columns={[
                        { title: '根序号', dataIndex: 'bar', width: 80 },
                        { title: '切割组合(mm)', dataIndex: 'cuts' },
                        { title: '利用长度(mm)', dataIndex: 'usedMm', width: 140 },
                        { title: '浪费(mm)', dataIndex: 'wasteMm', width: 120 },
                      ] as any}
                    />
                  ),
                }}
              />
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card 
              title={<Space><Tag color="cyan">板材结果</Tag><Text type="secondary">排版方案</Text></Space>} 
              bordered
              headStyle={{ background: '#e6fffb', borderBottom: '2px solid #13c2c2' }}
            >
              <Table
                rowKey={(r) => r.key}
                dataSource={plateResults}
                size="small"
                pagination={{ pageSize: 5 }}
                columns={[
                  { title: '组(材质_厚度)', dataIndex: 'group' },
                  { title: '厚度(mm)', dataIndex: 'thicknessMm' },
                  { title: '需求面积(m²)', dataIndex: 'totalAreaM2' },
                  { title: '单张面积(m²)', dataIndex: 'sheetAreaM2' },
                  { title: '张数', dataIndex: 'sheets' },
                  { title: '实际利用率(%)', dataIndex: 'actualUtilization' },
                  { title: '净重(kg)', dataIndex: 'netWeightKg' },
                  { title: '采购重量(kg)', dataIndex: 'buyWeightKg' },
                ] as any}
                expandable={{
                  expandedRowRender: (record: any) => (
                    <div>
                      <Table
                        size="small"
                        pagination={false}
                        dataSource={record.plan.map((sheet: PlateSheetPlan, idx: number) => ({
                          key: `${record.key}-sheet-${idx}`,
                          sheet: idx + 1,
                          usedAreaM2: Number(sheet.usedArea.toFixed(3)),
                          wasteAreaM2: Number(sheet.wasteArea.toFixed(3)),
                          pieces: sheet.shelves.flatMap((s: Shelf) => s.items.map((it: PlatePiece) => `${it.lengthMm}x${it.widthMm}`)).join(', '),
                        }))}
                        columns={[
                          { title: '张序号', dataIndex: 'sheet', width: 80 },
                          { title: '组合(长x宽,mm)', dataIndex: 'pieces' },
                          { title: '已用面积(m²)', dataIndex: 'usedAreaM2', width: 140 },
                          { title: '浪费面积(m²)', dataIndex: 'wasteAreaM2', width: 160 },
                        ] as any}
                      />
                      <Divider style={{ margin: '10px 0' }} />
                      {record.plan.map((sheet: PlateSheetPlan, idx: number) => (
                        <div key={`${record.key}-svg-${idx}`}>
                          {renderSheetPreview(sheet, idx, record.group)}
                          <Space size="small">
                            <Button size="small" onClick={() => exportToPDF(`plate_svg_${sanitizeId(record.group)}_${idx}`, `板材排版_${record.group}_Sheet${idx + 1}`)}>导出该张PDF</Button>
                          </Space>
                        </div>
                      ))}
                    </div>
                  ),
                }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card 
              title={<Space><Tag color="green">汇总统计</Tag><Text style={{ color: '#fff' }}>材料利用分析</Text></Space>} 
              bordered
              headStyle={{ background: 'linear-gradient(135deg, #1890ff 0%, #13c2c2 100%)', color: '#fff', borderBottom: 'none' }}
              bodyStyle={{ background: '#f0f9ff' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Card size="small" bordered hoverable style={{ borderLeft: '4px solid #52c41a' }}>
                    <Statistic title="净重合计" value={totals.netTotalKg} precision={2} suffix="kg" valueStyle={{ color: '#52c41a', fontWeight: 600 }} />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small" bordered hoverable style={{ borderLeft: '4px solid #ff4d4f' }}>
                    <Statistic title="采购重量" value={totals.buyTotalKg} precision={2} suffix="kg" valueStyle={{ color: '#ff4d4f', fontWeight: 600 }} />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small" bordered hoverable style={{ borderLeft: '4px solid #1890ff' }}>
                    <Statistic title="型材根数" value={profileSummary.totalBars} suffix="根" valueStyle={{ color: '#1890ff', fontWeight: 600 }} />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small" bordered hoverable style={{ borderLeft: '4px solid #13c2c2' }}>
                    <Statistic title="板材张数" value={plateSummary.totalSheets} suffix="张" valueStyle={{ color: '#13c2c2', fontWeight: 600 }} />
                  </Card>
                </Col>
              </Row>
              <Divider />
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Card size="small" bordered hoverable style={{ borderLeft: '4px solid #722ed1' }}>
                    <Statistic title="采购长度" value={profileSummary.totalBuyLenM} precision={2} suffix="m" valueStyle={{ fontWeight: 600 }} />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small" bordered hoverable style={{ borderLeft: '4px solid #faad14' }}>
                    <Statistic title="型材浪费" value={profileSummary.totalWasteM} precision={2} suffix="m" valueStyle={{ color: '#faad14', fontWeight: 600 }} />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small" bordered hoverable style={{ borderLeft: '4px solid #eb2f96' }}>
                    <Statistic title="采购面积" value={plateSummary.buyArea} precision={2} suffix="m²" valueStyle={{ fontWeight: 600 }} />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small" bordered hoverable style={{ borderLeft: '4px solid #fa8c16' }}>
                    <Statistic title="板材浪费" value={plateSummary.wasteArea} precision={2} suffix="m²" valueStyle={{ color: '#fa8c16', fontWeight: 600 }} />
                  </Card>
                </Col>
              </Row>
              <Divider />
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="型材浪费率" bordered style={{ borderTop: '3px solid #1890ff' }}>
                    <Progress
                      percent={profileSummary.wasteRate}
                      status={profileSummary.wasteRate > 15 ? 'exception' : profileSummary.wasteRate > 10 ? 'normal' : 'success'}
                      strokeColor={profileSummary.wasteRate > 15 ? '#ff4d4f' : profileSummary.wasteRate > 10 ? '#faad14' : '#52c41a'}
                    />
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                      目标: &lt;10% 优秀 | 10-15% 良好 | &gt;15% 需优化
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" title="板材利用率" bordered style={{ borderTop: '3px solid #13c2c2' }}>
                    <Progress
                      percent={plateSummary.utilization}
                      status={plateSummary.utilization < 70 ? 'exception' : plateSummary.utilization < 85 ? 'normal' : 'success'}
                      strokeColor={plateSummary.utilization >= 85 ? '#52c41a' : plateSummary.utilization >= 70 ? '#faad14' : '#ff4d4f'}
                    />
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                      目标: &gt;85% 优秀 | 70-85% 良好 | &lt;70% 需优化
                    </div>
                  </Card>
                </Col>
              </Row>
              <Divider />
              <Alert 
                message="算法说明" 
                description="型材采用多策略一维装箱（含锯缝），支持按组设置标准料长；板材采用二维层架排版（含锯缝与边距）计算组合与利用率。实际下料可能优于或劣于该估算，请结合现场优化。" 
                type="info" 
                showIcon 
                style={{ background: '#fff', border: '1px solid #d9d9d9' }}
              />
            </Card>
          </Col>
        </Row>
      </Space>

      <Modal
        title="计算历史记录"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={700}
      >
        {calculationHistory.length === 0 ? (
          <Alert message="暂无历史记录" type="info" showIcon />
        ) : (
          <List
            dataSource={calculationHistory}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => loadFromHistory(item)}>加载</Button>,
                  <Popconfirm title="确认删除？" onConfirm={() => deleteHistoryRecord(item.id)}>
                    <Button type="link" danger>删除</Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={`${new Date(item.timestamp).toLocaleString()} - 总重: ${item.totalWeight}kg`}
                  description={`型材: ${item.profileCount}项 | 板材: ${item.plateCount}项`}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProfilePlateCalculator;
