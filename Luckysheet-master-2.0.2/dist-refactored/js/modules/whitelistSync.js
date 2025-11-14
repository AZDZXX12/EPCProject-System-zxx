/**
 * 白名单云端同步模块
 * 解决跨设备白名单不同步的问题
 */

const WhitelistSync = {
    // API_BASE_URL: 'http://localhost:8001/api/selections',  // 本地开发
    API_BASE_URL: 'https://luckysheet-backend.onrender.com/api/selections',  // 生产环境
    
    /**
     * 从云端同步白名单到本地
     */
    async syncFromCloud() {
        try {
            console.log('📡 正在从云端同步白名单...');
            
            const response = await fetch(`${this.API_BASE_URL}/whitelist/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const whitelist = data.whitelist || ['18968563368'];
                
                // 更新本地存储
                localStorage.setItem('phoneWhitelist', JSON.stringify(whitelist));
                localStorage.setItem('whitelistLastSync', new Date().toISOString());
                
                console.log('✅ 白名单同步成功:', whitelist);
                return whitelist;
            } else {
                console.warn('⚠️ 云端白名单不可用，使用本地缓存');
                return this.getLocalWhitelist();
            }
        } catch (error) {
            console.error('❌ 白名单同步失败:', error);
            // 网络错误时使用本地缓存
            return this.getLocalWhitelist();
        }
    },
    
    /**
     * 上传白名单到云端
     */
    async uploadToCloud(whitelist) {
        try {
            console.log('📤 正在上传白名单到云端...', whitelist);
            
            const response = await fetch(`${this.API_BASE_URL}/whitelist/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    whitelist: whitelist,
                    updated_at: new Date().toISOString(),
                    updated_by: this.getCurrentUser()
                })
            });
            
            if (response.ok) {
                console.log('✅ 白名单上传成功');
                localStorage.setItem('whitelistLastSync', new Date().toISOString());
                return true;
            } else {
                console.error('❌ 白名单上传失败:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ 白名单上传失败:', error);
            return false;
        }
    },
    
    /**
     * 获取本地白名单
     */
    getLocalWhitelist() {
        const whitelist = localStorage.getItem('phoneWhitelist');
        if (!whitelist) {
            const defaultWhitelist = ['18968563368'];
            localStorage.setItem('phoneWhitelist', JSON.stringify(defaultWhitelist));
            return defaultWhitelist;
        }
        return JSON.parse(whitelist);
    },
    
    /**
     * 保存白名单（本地+云端）
     */
    async saveWhitelist(whitelist) {
        // 先保存到本地
        localStorage.setItem('phoneWhitelist', JSON.stringify(whitelist));
        
        // 再上传到云端
        await this.uploadToCloud(whitelist);
    },
    
    /**
     * 添加用户到白名单
     */
    async addUser(phone) {
        // 🔥 修复：先从云端同步最新白名单，防止覆盖其他管理员的操作
        const whitelist = await this.syncFromCloud();
        
        if (whitelist.includes(phone)) {
            return { success: false, message: '该手机号已存在' };
        }
        
        whitelist.push(phone);
        await this.saveWhitelist(whitelist);
        
        return { success: true, message: '添加成功' };
    },
    
    /**
     * 从白名单删除用户
     */
    async removeUser(phone) {
        if (phone === '18968563368') {
            return { success: false, message: '不能删除管理员账号' };
        }
        
        // 🔥 修复：先从云端同步最新白名单，防止覆盖其他管理员的操作
        const whitelist = await this.syncFromCloud();
        const index = whitelist.indexOf(phone);
        
        if (index === -1) {
            return { success: false, message: '用户不存在' };
        }
        
        whitelist.splice(index, 1);
        await this.saveWhitelist(whitelist);
        
        return { success: true, message: '删除成功' };
    },
    
    /**
     * 获取当前登录用户
     */
    getCurrentUser() {
        try {
            const sessionInfo = sessionStorage.getItem('currentSession');
            if (sessionInfo) {
                const userInfo = JSON.parse(sessionInfo);
                return userInfo.phone || 'unknown';
            }
        } catch (e) {
            console.error('获取用户信息失败:', e);
        }
        return 'unknown';
    },
    
    /**
     * 检查是否需要同步（超过5分钟自动同步）
     */
    needSync() {
        const lastSync = localStorage.getItem('whitelistLastSync');
        if (!lastSync) return true;
        
        const lastSyncTime = new Date(lastSync);
        const now = new Date();
        const diffMinutes = (now - lastSyncTime) / 1000 / 60;
        
        return diffMinutes > 5; // 超过5分钟
    },
    
    /**
     * 初始化：页面加载时自动同步
     */
    async init() {
        console.log('🔄 初始化白名单同步模块...');
        
        // 总是从云端同步最新数据
        await this.syncFromCloud();
        
        console.log('✅ 白名单同步模块初始化完成');
    }
};

// 页面加载时自动初始化
if (typeof window !== 'undefined') {
    window.WhitelistSync = WhitelistSync;
    
    // 自动初始化（但不阻塞页面加载）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            WhitelistSync.init();
        });
    } else {
        WhitelistSync.init();
    }
}

