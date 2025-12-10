/**
 * 系统初始化工具
 * 初始化管理员账号和默认数据
 */

export interface UserAccount {
  username: string;
  password: string;
  email: string;
  phone: string;
  realName: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt?: string;
}

/**
 * 初始化系统
 * 创建默认管理员账号
 */
export const initializeSystem = (): void => {
  // 检查是否已初始化
  const initialized = localStorage.getItem('systemInitialized');
  
  if (initialized === 'true') {
    console.log('[系统初始化] 系统已初始化，跳过');
    return;
  }

  console.log('[系统初始化] 开始初始化系统...');

  // 创建默认管理员账号
  const defaultAdmin: UserAccount = {
    username: 'admin',
    password: 'admin123',
    email: 'admin@epc-system.com',
    phone: '18968563368', // 管理员手机号
    realName: '系统管理员',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  // 获取现有账号
  const accounts: UserAccount[] = JSON.parse(localStorage.getItem('userAccounts') || '[]');
  
  // 检查管理员是否已存在
  const adminExists = accounts.some(acc => acc.username === 'admin' || acc.phone === '18968563368');
  
  if (!adminExists) {
    accounts.push(defaultAdmin);
    localStorage.setItem('userAccounts', JSON.stringify(accounts));
    console.log('[系统初始化] 默认管理员账号已创建');
    console.log('[系统初始化] 用户名: admin');
    console.log('[系统初始化] 密码: admin123');
    console.log('[系统初始化] 手机: 18968563368');
  } else {
    console.log('[系统初始化] 管理员账号已存在');
  }

  // 标记系统已初始化
  localStorage.setItem('systemInitialized', 'true');
  console.log('[系统初始化] 系统初始化完成');
};

/**
 * 重置系统（清除所有数据）
 */
export const resetSystem = (): void => {
  if (window.confirm('确定要重置系统吗？这将清除所有数据！')) {
    localStorage.clear();
    sessionStorage.clear();
    console.log('[系统重置] 系统已重置');
    window.location.reload();
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = (): UserAccount | null => {
  const username = sessionStorage.getItem('username');
  if (!username) return null;

  const accounts: UserAccount[] = JSON.parse(localStorage.getItem('userAccounts') || '[]');
  return accounts.find(acc => acc.username === username) || null;
};

/**
 * 检查是否是管理员
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

/**
 * 检查用户权限
 */
export const checkPermission = (requiredRole: 'admin' | 'user'): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (requiredRole === 'admin') {
    return user.role === 'admin';
  }
  
  return true; // 普通用户权限
};

/**
 * 更新用户信息
 */
export const updateUserAccount = (username: string, updates: Partial<UserAccount>): boolean => {
  try {
    const accounts: UserAccount[] = JSON.parse(localStorage.getItem('userAccounts') || '[]');
    const index = accounts.findIndex(acc => acc.username === username);
    
    if (index === -1) {
      console.error('[更新用户] 用户不存在:', username);
      return false;
    }

    accounts[index] = {
      ...accounts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('userAccounts', JSON.stringify(accounts));
    console.log('[更新用户] 用户信息已更新:', username);
    return true;
  } catch (error) {
    console.error('[更新用户] 更新失败:', error);
    return false;
  }
};

/**
 * 获取所有用户账号
 */
export const getAllUsers = (): UserAccount[] => {
  return JSON.parse(localStorage.getItem('userAccounts') || '[]');
};

/**
 * 删除用户账号
 */
export const deleteUserAccount = (username: string): boolean => {
  try {
    if (username === 'admin') {
      console.error('[删除用户] 不能删除管理员账号');
      return false;
    }

    const accounts: UserAccount[] = JSON.parse(localStorage.getItem('userAccounts') || '[]');
    const filtered = accounts.filter(acc => acc.username !== username);
    
    localStorage.setItem('userAccounts', JSON.stringify(filtered));
    console.log('[删除用户] 用户已删除:', username);
    return true;
  } catch (error) {
    console.error('[删除用户] 删除失败:', error);
    return false;
  }
};
