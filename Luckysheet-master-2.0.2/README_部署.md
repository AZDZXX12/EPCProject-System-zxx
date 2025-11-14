# 🚀 快速部署到免费服务器

本项目已经完全配置好，可以快速部署到免费云平台！

## 📁 已创建的部署文件

✅ `vercel.json` - Vercel前端部署配置
✅ `xuanxing/backend/render.yaml` - Render后端部署配置
✅ `部署指南.md` - 详细的分步部署说明
✅ `一键部署说明.txt` - 快速部署清单

## 🎯 部署步骤概览

### 1️⃣ 推送代码到 GitHub
```bash
git init
git add .
git commit -m "准备部署"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 2️⃣ 部署后端到 Render.com（免费）
- 访问 https://render.com 注册
- 创建 PostgreSQL 数据库（免费tier）
- 创建 Web Service 连接你的 GitHub 仓库
- 设置环境变量（详见`部署指南.md`）

### 3️⃣ 部署前端到 Vercel.com（免费）
- 访问 https://vercel.com 注册
- 导入 GitHub 仓库
- 一键部署完成！

### 4️⃣ 连接前后端
- 在 Render 配置 CORS 允许 Vercel 域名
- 在前端代码中更新后端 API 地址

## 📖 详细文档

请查看 **[部署指南.md](./部署指南.md)** 获取完整的分步说明。

或者查看 **[一键部署说明.txt](./一键部署说明.txt)** 获取快速清单。

## ⚡ 免费服务配额

| 服务 | 配额 | 限制 |
|------|------|------|
| **Vercel (前端)** | ✅ 无限带宽<br>✅ 全球CDN<br>✅ 自动HTTPS | 每月100GB带宽（够用） |
| **Render (后端)** | ✅ 512MB RAM<br>✅ 免费PostgreSQL | 15分钟无活动休眠<br>数据库90天后删除 |

## 🛠️ 技术栈

- **前端**: HTML + CSS + JavaScript（Luckysheet）
- **后端**: Django 4.2 + Django REST Framework
- **数据库**: PostgreSQL
- **部署**: Vercel + Render

## 🎉 部署后的功能

✅ Excel设备参数选型
✅ 离心风机选型计算
✅ 电缆选型（需要后端API）
✅ Word文档编辑器
✅ PDF导出
✅ 数据库管理

---

**祝你部署顺利！如有问题请查看详细文档。** 🚀

