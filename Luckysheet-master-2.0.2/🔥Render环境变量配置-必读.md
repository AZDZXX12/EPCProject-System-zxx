# 🔥 Render环境变量配置 - 必读

## 问题原因

你保存文件后没有历史记录，是因为：
- ✅ **本地下载成功**（Excel文件已下载到你的电脑）
- ❌ **云端备份失败**（CORS跨域限制，无法访问后端API）

## 解决方案（5分钟搞定）

### 步骤1：登录Render Dashboard

访问：https://dashboard.render.com/

### 步骤2：找到后端服务

在Dashboard中找到：**`luckysheet-backend`** 或类似名称的Web Service

### 步骤3：配置环境变量

1. 点击进入该服务
2. 点击左侧菜单 **"Environment"** 标签
3. 查找是否有 `CORS_ALLOWED_ORIGINS` 变量：

#### 情况A：已存在该变量

- 点击变量右侧的 **"Edit"** 按钮
- 修改值为：
  ```
  http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,https://luckysheet-selection-system.onrender.com,https://luckysheet-frontend.onrender.com
  ```

#### 情况B：不存在该变量

- 点击 **"Add Environment Variable"** 按钮
- **Key**: `CORS_ALLOWED_ORIGINS`
- **Value**: 
  ```
  http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,https://luckysheet-selection-system.onrender.com,https://luckysheet-frontend.onrender.com
  ```

### 步骤4：保存并等待重启

1. 点击 **"Save Changes"** 按钮
2. Render会自动重启服务（约30-60秒）
3. 等待页面顶部显示 "🟢 Deploy live"

### 步骤5：测试功能

1. **刷新浏览器页面**：`http://localhost:8000/index.html`
2. 填写选型数据
3. 点击 **"保存"** 按钮
4. 观察提示：
   - ✅ 如果显示 **"✅ 已自动备份到云端"** → 成功！
   - ❌ 如果显示 **"⚠️ 云端备份失败"** → 配置还未生效，再等30秒刷新重试

5. **打开历史记录页面**：`http://localhost:8000/selection-history.html`
6. 点击 **"🔄 刷新"** 按钮
7. 应该能看到刚才保存的文件记录

---

## 📸 配置截图示例

```
Environment Variables
┌─────────────────────────────────────────────────────────────────┐
│ Key: CORS_ALLOWED_ORIGINS                                       │
│ Value: http://localhost:3000,http://127.0.0.1:3000,...        │
│                                                    [Edit] [Del]  │
└─────────────────────────────────────────────────────────────────┘
[+ Add Environment Variable]                      [Save Changes]
```

---

## ❓ 常见问题

### Q1: 配置后还是报错怎么办？

**A:** 等待1-2分钟让Render服务完全重启，然后：
1. 刷新浏览器页面（Ctrl+F5 强制刷新）
2. 清除浏览器缓存
3. 重新测试保存功能

### Q2: 如何确认配置生效？

**A:** 打开浏览器开发者工具（F12）：
1. 切换到 **Console** 标签
2. 保存文件后查看日志
3. 应该看到：
   ```
   📤 自动上传到云端: 选型文件_20251026_1315
   ✅ 文件已自动备份到云端
   ```

### Q3: 为什么本地能下载，但没有历史记录？

**A:** 本地下载和云端备份是两个独立的功能：
- **本地下载**：直接生成Excel文件，不依赖后端
- **云端备份**：需要通过API上传到后端数据库，受CORS限制

### Q4: 我可以不配置CORS，只用本地下载吗？

**A:** 可以的！如果你不需要：
- 多设备同步查看历史记录
- 在线历史记录管理
- 云端备份

那么只用本地下载功能就足够了。但配置CORS后，你将获得：
- ✅ 云端自动备份，数据不会丢失
- ✅ 历史记录管理，随时查看、下载、删除
- ✅ 多设备访问历史记录

---

## 🎯 快速检查清单

- [ ] 登录 Render Dashboard
- [ ] 找到 `luckysheet-backend` 服务
- [ ] 进入 Environment 标签
- [ ] 添加/修改 `CORS_ALLOWED_ORIGINS` 变量
- [ ] 保存并等待重启完成
- [ ] 刷新浏览器页面
- [ ] 测试保存功能
- [ ] 查看历史记录页面

---

**配置完成后，告诉我结果！我会帮你验证功能是否正常！** 🚀

