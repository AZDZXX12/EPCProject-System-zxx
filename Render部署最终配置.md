# Render部署最终配置

## 后端配置（epc-backend）

### Settings
- **Build Command:** `pip install -r server/requirements_render.txt`
- **Start Command:** `cd server && python quick-start-sqlite.py`

### Environment
```
PYTHON_VERSION=3.11.0
PORT=8000
```

---

## 前端配置（epc-frontend）

### Settings
- **Build Command:** `cd client && npm install && npm run build`
- **Publish Directory:** `client/build`

### Environment
```
NODE_VERSION=20
REACT_APP_API_URL=https://epc-backend.onrender.com
GENERATE_SOURCEMAP=false
```

---

## 待推送的更改

```bash
git push origin main
```

包含：
- SPA路由配置 (`client/public/_redirects`)
- API URL修复

---

## 推送后操作

1. 等待Render自动部署（2-3分钟）
2. 清除浏览器缓存（Ctrl+Shift+Delete）
3. 强制刷新（Ctrl+Shift+R）
4. 访问：https://epc-frontend.onrender.com

