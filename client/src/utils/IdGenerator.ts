/**
 * 馃啍 ID鐢熸垚鍣?
 *
 * 鍔熻兘锛?
 * 1. UUID v4鐢熸垚
 * 2. 鐭璉D鐢熸垚锛圢anoID椋庢牸锛?
 * 3. 椤圭洰涓撳睘ID鐢熸垚
 * 4. ID鍐茬獊妫€娴?
 */

/**
 * 鐢熸垚UUID v4
 */
export function generateUUID(): string {
  // 浣跨敤crypto API锛堢幇浠ｆ祻瑙堝櫒鏀寔锛?
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // 鍥為€€鏂规
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 鐢熸垚鐭璉D锛堢被浼糔anoID锛?
 * @param length ID闀垮害锛岄粯璁?2
 */
export function generateShortId(length: number = 12): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let id = '';

  // 浣跨敤crypto.getRandomValues纭繚闅忔満鎬?
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      id += chars[randomValues[i] % chars.length];
    }
  } else {
    // 鍥為€€鏂规
    for (let i = 0; i < length; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return id;
}

/**
 * 鐢熸垚椤圭洰涓撳睘浠诲姟ID
 * @param projectId 椤圭洰ID
 * @param taskNumber 浠诲姟搴忓彿锛堝彲閫夛級
 */
export function generateTaskId(projectId: string, taskNumber?: number): string {
  if (taskNumber !== undefined) {
    // 浣跨敤搴忓彿锛歅ROJ-001-TASK-001
    return `${projectId}-TASK-${String(taskNumber).padStart(3, '0')}`;
  } else {
    // 浣跨敤鐭璉D锛歅ROJ-001-TASK-AbC123
    return `${projectId}-TASK-${generateShortId(6)}`;
  }
}

/**
 * 鐢熸垚椤圭洰涓撳睘鏃ュ織ID
 * @param projectId 椤圭洰ID
 */
export function generateLogId(projectId: string): string {
  const timestamp = Date.now().toString(36); // 36杩涘埗鏃堕棿鎴?
  const random = generateShortId(4);
  return `${projectId}-LOG-${timestamp}-${random}`;
}

/**
 * 鐢熸垚椤圭洰ID锛堥€掑锛?
 * @param existingProjects 鐜版湁椤圭洰鍒楄〃
 */
export function generateProjectId(existingProjects: Array<{ id: string }>): string {
  const maxId = existingProjects.reduce((max, project) => {
    const match = project.id.match(/PROJ-(\d+)/);
    if (match) {
      const num = parseInt(match[1]);
      return num > max ? num : max;
    }
    return max;
  }, 0);

  return `PROJ-${String(maxId + 1).padStart(3, '0')}`;
}

/**
 * 妫€鏌D鏄惁鍐茬獊
 * @param id 寰呮鏌ョ殑ID
 * @param existingIds 鐜版湁ID鍒楄〃
 */
export function checkIdConflict(id: string, existingIds: string[]): boolean {
  return existingIds.includes(id);
}

/**
 * 鐢熸垚鍞竴ID锛堣嚜鍔ㄩ伩鍏嶅啿绐侊級
 * @param prefix ID鍓嶇紑
 * @param existingIds 鐜版湁ID鍒楄〃
 * @param maxAttempts 鏈€澶у皾璇曟鏁?
 */
export function generateUniqueId(
  prefix: string,
  existingIds: string[],
  maxAttempts: number = 10
): string {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const id = `${prefix}-${generateShortId(8)}`;
    if (!checkIdConflict(id, existingIds)) {
      return id;
    }
  }

  // 濡傛灉10娆￠兘鍐茬獊锛屼娇鐢║UID锛堝嚑涔庝笉鍙兘鍐茬獊锛?
  return `${prefix}-${generateUUID()}`;
}

/**
 * 瑙ｆ瀽椤圭洰ID锛岃幏鍙栧簭鍙?
 * @param projectId 椤圭洰ID锛堝 PROJ-001锛?
 */
export function parseProjectNumber(projectId: string): number | null {
  const match = projectId.match(/PROJ-(\d+)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * 瑙ｆ瀽浠诲姟ID锛岃幏鍙栦换鍔″簭鍙?
 * @param taskId 浠诲姟ID锛堝 PROJ-001-TASK-005锛?
 */
export function parseTaskNumber(taskId: string): number | null {
  const match = taskId.match(/TASK-(\d+)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * 楠岃瘉ID鏍煎紡
 */
export const IdValidator = {
  /**
   * 楠岃瘉椤圭洰ID鏍煎紡
   */
  isValidProjectId(id: string): boolean {
    return /^PROJ-\d{3}$/.test(id);
  },

  /**
   * 楠岃瘉浠诲姟ID鏍煎紡
   */
  isValidTaskId(id: string): boolean {
    return /^PROJ-\d{3}-TASK-[\w]+$/.test(id);
  },

  /**
   * 楠岃瘉鏃ュ織ID鏍煎紡
   */
  isValidLogId(id: string): boolean {
    return /^PROJ-\d{3}-LOG-[\w]+-[\w]+$/.test(id);
  },

  /**
   * 楠岃瘉UUID鏍煎紡
   */
  isValidUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  },
};

const IdGenerator = {
  generateUUID,
  generateShortId,
  generateTaskId,
  generateLogId,
  generateProjectId,
  checkIdConflict,
  generateUniqueId,
  parseProjectNumber,
  parseTaskNumber,
  IdValidator,
};

export default IdGenerator;
