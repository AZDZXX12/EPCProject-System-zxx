import IdGenerator from '../IdGenerator';

describe('IdGenerator', () => {
  describe('generateUUID', () => {
    it('should generate valid UUID v4', () => {
      const uuid = IdGenerator.generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = IdGenerator.generateUUID();
      const uuid2 = IdGenerator.generateUUID();
      
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generateShortId', () => {
    it('should generate short ID with default length', () => {
      const shortId = IdGenerator.generateShortId();
      
      expect(shortId).toHaveLength(8);
      expect(shortId).toMatch(/^[A-Z0-9]+$/);
    });

    it('should generate short ID with custom length', () => {
      const shortId = IdGenerator.generateShortId(12);
      
      expect(shortId).toHaveLength(12);
    });
  });

  describe('generateTaskId', () => {
    it('should generate task ID with correct format', () => {
      const taskId = IdGenerator.generateTaskId('P001');
      
      expect(taskId).toMatch(/^P001-T\d{3}$/);
    });

    it('should generate sequential task IDs', () => {
      const existingIds = ['P001-T001', 'P001-T002'];
      const newId = IdGenerator.generateTaskId('P001', existingIds);
      
      expect(newId).toBe('P001-T003');
    });
  });

  describe('generateProjectId', () => {
    it('should generate project ID with correct format', () => {
      const projectId = IdGenerator.generateProjectId();
      
      expect(projectId).toMatch(/^P\d{3}$/);
    });

    it('should generate sequential project IDs', () => {
      const existingIds = ['P001', 'P002'];
      const newId = IdGenerator.generateProjectId(existingIds);
      
      expect(newId).toBe('P003');
    });
  });

  describe('checkIdConflict', () => {
    it('should detect ID conflicts', () => {
      const existingIds = ['ID001', 'ID002', 'ID003'];
      
      expect(IdGenerator.checkIdConflict('ID002', existingIds)).toBe(true);
      expect(IdGenerator.checkIdConflict('ID004', existingIds)).toBe(false);
    });
  });

  describe('IdValidator', () => {
    it('should validate UUID format', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const invalidUuid = 'not-a-uuid';
      
      expect(IdGenerator.IdValidator.isValidUUID(validUuid)).toBe(true);
      expect(IdGenerator.IdValidator.isValidUUID(invalidUuid)).toBe(false);
    });
  });
});
