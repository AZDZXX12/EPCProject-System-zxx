/**
 * 文件名输入对话框工具
 * 用于在保存Excel/PDF之前让用户输入自定义文件名
 */

/**
 * 显示文件名输入对话框
 * @param {string} message - 对话框标题
 * @param {string} defaultName - 默认文件名
 * @param {string} extension - 文件扩展名（如 '.xlsx' 或 '.pdf'）
 * @returns {Promise<string|null>} 用户输入的文件名，如果取消则返回null
 */
window.promptFileName = async function(message, defaultName, extension = '') {
    return new Promise((resolve) => {
        // 创建模态对话框
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
        
        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:white;padding:30px;border-radius:12px;min-width:450px;max-width:600px;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
        
        dialog.innerHTML = `
            <h3 style="margin:0 0 20px 0;font-size:18px;color:#1a1f36;font-weight:600;">
                💾 ${message}
            </h3>
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:8px;font-size:14px;color:#6b7280;font-weight:500;">
                    文件名称
                </label>
                <input 
                    type="text" 
                    id="fileNameInput" 
                    value="${defaultName}" 
                    style="width:100%;padding:12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;font-family:inherit;box-sizing:border-box;"
                    placeholder="请输入文件名称"
                />
            </div>
            <p style="margin:10px 0 20px 0;font-size:12px;color:#9ca3af;">
                💡 提示：请输入您希望保存的文件名称${extension ? '（将自动添加' + extension + '扩展名）' : ''}
            </p>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button 
                    id="cancelBtn" 
                    style="padding:10px 24px;background:#f3f4f6;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.3s;">
                    取消
                </button>
                <button 
                    id="confirmBtn" 
                    style="padding:10px 24px;background:linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.3s;box-shadow:0 2px 8px rgba(0, 212, 255, 0.3);">
                    保存
                </button>
            </div>
        `;
        
        modal.appendChild(dialog);
        document.body.appendChild(modal);
        
        const input = dialog.querySelector('#fileNameInput');
        const confirmBtn = dialog.querySelector('#confirmBtn');
        const cancelBtn = dialog.querySelector('#cancelBtn');
        
        // 自动聚焦并选中文本
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
        
        // 按钮悬停效果
        confirmBtn.onmouseenter = () => {
            confirmBtn.style.transform = 'translateY(-2px)';
            confirmBtn.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.4)';
        };
        confirmBtn.onmouseleave = () => {
            confirmBtn.style.transform = 'translateY(0)';
            confirmBtn.style.boxShadow = '0 2px 8px rgba(0, 212, 255, 0.3)';
        };
        
        cancelBtn.onmouseenter = () => {
            cancelBtn.style.background = '#e5e7eb';
        };
        cancelBtn.onmouseleave = () => {
            cancelBtn.style.background = '#f3f4f6';
        };
        
        // 确认按钮点击
        confirmBtn.onclick = () => {
            const fileName = input.value.trim();
            if (!fileName) {
                input.style.borderColor = '#ff4d4f';
                input.focus();
                return;
            }
            modal.remove();
            resolve(fileName);
        };
        
        // 取消按钮点击
        cancelBtn.onclick = () => {
            modal.remove();
            resolve(null);
        };
        
        // 点击背景关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(null);
            }
        };
        
        // 键盘事件
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmBtn.click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelBtn.click();
            }
        };
        
        // 输入时移除错误样式
        input.oninput = () => {
            input.style.borderColor = '#e5e7eb';
        };
    });
};

console.log('✅ 文件名输入对话框工具已加载');

