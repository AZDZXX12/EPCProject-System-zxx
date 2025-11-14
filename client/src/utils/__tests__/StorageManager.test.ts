import { StorageManager } from '../StorageManager';

describe('StorageManager', () => {
  beforeEach(() => {
    // 清理localStorage
    localStorage.clear();
  });

  describe('save and load', () => {
    it('should save and load data correctly', () => {
      const testData = { id: '1', name: 'Test Project' };
      const key = 'test-key';

      StorageManager.save(key, testData);
      const loaded = StorageManager.load(key);

      expect(loaded).toEqual(testData);
    });

    it('should return null for non-existent key', () => {
      const result = StorageManager.load('non-existent');
      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('invalid-json', 'not a json');
      const result = StorageManager.load('invalid-json');
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove data from storage', () => {
      const key = 'test-key';
      StorageManager.save(key, { test: 'data' });
      
      StorageManager.remove(key);
      const result = StorageManager.load(key);
      
      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all storage', () => {
      StorageManager.save('key1', { data: 1 });
      StorageManager.save('key2', { data: 2 });
      
      StorageManager.clear();
      
      expect(StorageManager.load('key1')).toBeNull();
      expect(StorageManager.load('key2')).toBeNull();
    });
  });

  describe('getSize', () => {
    it('should return storage size', () => {
      StorageManager.save('test', { data: 'test' });
      const size = StorageManager.getSize();
      
      expect(size).toBeGreaterThan(0);
    });
  });
});
