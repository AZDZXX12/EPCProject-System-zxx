import { getCorrectedCurrent, getTempCorrection, getGroupingCorrection } from '../utils/currentCorrection';

describe('Current Correction Utils', () => {
  describe('getCorrectedCurrent', () => {
    test('高温环境载流量校正', () => {
      const ratedCurrent = 100;
      const factors = { temp: 50, grouping: 1 };
      const corrected = getCorrectedCurrent(ratedCurrent, factors);
      
      // 高温环境下，载流量应该降低
      expect(corrected).toBeCloseTo(82.92, 1);
      expect(corrected).toBeLessThan(ratedCurrent);
    });

    test('多根并列敷设校正', () => {
      const ratedCurrent = 100;
      const factors = { temp: 30, grouping: 4 };
      const corrected = getCorrectedCurrent(ratedCurrent, factors);
      
      // 30℃是基准温度，但多根并列会降低载流量
      expect(corrected).toBeCloseTo(90.0, 1);
      expect(corrected).toBeLessThan(ratedCurrent);
    });

    test('标准环境单根敷设', () => {
      const ratedCurrent = 100;
      const factors = { temp: 30, grouping: 1 };
      const corrected = getCorrectedCurrent(ratedCurrent, factors);
      
      // 标准环境，单根敷设，载流量应该不变
      expect(corrected).toBeCloseTo(100, 1);
    });

    test('低温环境提升载流量', () => {
      const ratedCurrent = 100;
      const factors = { temp: 20, grouping: 1 };
      const corrected = getCorrectedCurrent(ratedCurrent, factors);
      
      // 低温环境下，载流量应该提升
      expect(corrected).toBeGreaterThan(ratedCurrent);
    });
  });

  describe('getTempCorrection', () => {
    test('基准温度30℃校正系数为1', () => {
      const k = getTempCorrection(30);
      expect(k).toBeCloseTo(1.0, 2);
    });

    test('高温40℃校正系数小于1', () => {
      const k = getTempCorrection(40);
      expect(k).toBeLessThan(1.0);
      expect(k).toBeCloseTo(0.91, 2);
    });

    test('低温20℃校正系数大于1', () => {
      const k = getTempCorrection(20);
      expect(k).toBeGreaterThan(1.0);
    });
  });

  describe('getGroupingCorrection', () => {
    test('桥架敷设校正系数', () => {
      const k = getGroupingCorrection('tray');
      expect(k).toBe(0.95);
    });

    test('管道敷设校正系数', () => {
      const k = getGroupingCorrection('conduit');
      expect(k).toBe(0.80);
    });

    test('直埋敷设校正系数', () => {
      const k = getGroupingCorrection('direct_burial');
      expect(k).toBe(1.0);
    });

    test('未知敷设方式返回默认值1.0', () => {
      const k = getGroupingCorrection('unknown');
      expect(k).toBe(1.0);
    });
  });
});

