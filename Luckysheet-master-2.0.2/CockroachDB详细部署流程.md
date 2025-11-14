# 🪳 CockroachDB Serverless 详细部署流程（永久免费）

> **为什么选择CockroachDB？**
> - ✅ 5GB免费存储（远超需求）
> - ✅ 永久免费（Serverless层级）
> - ✅ 无需信用卡
> - ✅ 完全兼容PostgreSQL
> - ✅ 自动扩展和备份
> - ✅ 全球分布式架构

---

## 📋 前提条件

- ✅ GitHub账号或Email（已有）
- ✅ 项目已推送到GitHub（已完成）
- ⏱️ 预计时间：8-10分钟

---

## 🆚 CockroachDB vs Neon 快速对比

| 特性 | CockroachDB Serverless | Neon |
|------|----------------------|------|
| **免费存储** | 5GB | 3GB |
| **免费计算** | 50M Request Units/月 | 100小时/月 |
| **永久性** | ✅ 永久免费 | ✅ 永久免费 |
| **PostgreSQL兼容** | ✅ 完全兼容 | ✅ 完全兼容 |
| **自动休眠** | ❌ 不休眠 | ✅ 5分钟休眠 |
| **分布式** | ✅ 全球分布 | ❌ 单区域 |
| **备份** | ✅ 自动备份 | ✅ 7天PITR |
| **需要信用卡** | ❌ 不需要 | ❌ 不需要 |

**推荐指数**：⭐⭐⭐⭐⭐

---

## 第一步：注册CockroachDB账号（2分钟）

### 1.1 访问CockroachDB Cloud

在浏览器中打开：
```
https://cockroachlabs.cloud
```

或直接访问注册页面：
```
https://cockroachlabs.cloud/signup
```

### 1.2 选择注册方式

页面会显示几种注册选项：

#### 推荐方式1：GitHub登录 ⭐
- 点击 **"Continue with GitHub"** 按钮
- 优点：
  - ✅ 一键登录
  - ✅ 无需填写表单
  - ✅ 自动验证

#### 推荐方式2：Google登录 ⭐
- 点击 **"Continue with Google"** 按钮
- 使用Gmail账号登录

#### 方式3：Email注册
- 输入邮箱地址
- 设置密码（至少8个字符）
- 点击 **"Sign Up"**
- 需要验证邮箱

### 1.3 完成授权

如果选择GitHub或Google登录：

1. **GitHub授权**：
   - 跳转到GitHub
   - 显示授权请求
   - 点击 **"Authorize CockroachDB Cloud"**
   - 可能需要输入GitHub密码确认

2. **Google授权**：
   - 选择Google账号
   - 允许访问基本信息
   - 自动跳转回CockroachDB

### 1.4 验证邮箱（如果需要）

如果使用Email注册：

1. 检查邮箱收件箱
2. 找到来自 CockroachDB 的邮件
   - 发件人：`noreply@cockroachlabs.com`
   - 主题：`Verify your email for CockroachDB Cloud`
3. 点击邮件中的 **"Verify Email"** 链接
4. 自动跳转并完成验证

### 1.5 进入控制台

- 注册成功后，自动进入CockroachDB Cloud控制台
- 显示欢迎页面或创建集群引导
- ✅ 账号创建完成！

---

## 第二步：创建Serverless集群（4分钟）

### 2.1 开始创建集群

在控制台首页：

1. **点击创建按钮**：
   - 如果是首次登录，会看到 **"Create Cluster"** 大按钮
   - 或者点击 **"Clusters"** → **"Create Cluster"**

2. **进入集群创建页面**

### 2.2 选择集群类型

CockroachDB提供三种集群类型：

| 类型 | 说明 | 价格 | 推荐 |
|------|------|------|------|
| **Serverless** | 按需计费，免费层级 | 免费/付费 | ⭐⭐⭐⭐⭐ |
| **Dedicated** | 专用集群，高性能 | 付费 | ❌ |
| **Self-Hosted** | 自己部署 | 免费 | ❌ |

**选择 Serverless** ⚠️ 重要！

1. 找到 **"Serverless"** 卡片
2. 点击 **"Create free cluster"** 或 **"Select"**

### 2.3 配置集群

现在进入Serverless集群配置页面：

#### ① 云服务商（Cloud Provider）

**选择其中一个**：

| 选项 | 推荐度 | 区域覆盖 |
|------|--------|---------|
| **AWS** | ⭐⭐⭐⭐⭐ | 最多区域选择 |
| **GCP** | ⭐⭐⭐⭐ | 较好的全球覆盖 |
| **Azure** | ⭐⭐⭐ | 区域较少 |

**推荐：选择 AWS**（区域最多，性能稳定）

#### ② 区域（Region）⚠️ 重要

**根据你的位置选择最近的区域**：

**中国用户推荐**：
```
AWS Asia Pacific (Singapore) - ap-southeast-1
或
AWS Asia Pacific (Tokyo) - ap-northeast-1
```

**其他区域选项**：
- **美国**：`us-east-1` (N. Virginia) 或 `us-west-2` (Oregon)
- **欧洲**：`eu-west-1` (Ireland) 或 `eu-central-1` (Frankfurt)
- **亚洲**：
  - `ap-southeast-1` (Singapore) ⭐ 推荐
  - `ap-northeast-1` (Tokyo)
  - `ap-south-1` (Mumbai)

#### ③ 集群名称（Cluster Name）

输入集群名称（用于识别）：
```
cable-selector-db
```
或
```
luckysheet-backend-db
```

> 💡 名称仅用于识别，可以随意填写

#### ④ 预算限制（Spend Limit）

CockroachDB会显示：
- **默认免费额度**：0美元
- 表示使用免费层级

**保持默认**：
- Spend Limit: `$0` (Free Tier)
- 这样确保不会产生费用

### 2.4 查看免费层级配置

页面会显示免费层级包含的内容：

```
✅ 5 GB storage
✅ 50M Request Units per month
✅ No credit card required
✅ Automatic backups
```

### 2.5 创建集群

1. **检查所有配置**：
   ```
   Cluster Type: Serverless
   Cloud Provider: AWS
   Region: ap-southeast-1 (Singapore)
   Cluster Name: cable-selector-db
   Spend Limit: $0 (Free Tier)
   ```

2. **点击创建按钮**：
   - 点击页面底部的 **"Create cluster"** 按钮（绿色大按钮）

3. **等待创建**：
   - 显示创建进度："Creating cluster..."
   - 预计需要 1-3 分钟
   - 可以看到初始化步骤：
     ```
     ✓ Provisioning infrastructure
     ✓ Starting nodes
     ✓ Initializing cluster
     ```

4. **创建完成**：
   - 显示 "Cluster created successfully" 或类似提示
   - 状态变为 "Ready" 或 "Available"
   - ✅ 集群创建成功！

---

## 第三步：创建数据库用户和数据库（2分钟）

### 3.1 设置SQL用户

集群创建完成后，CockroachDB会引导你创建SQL用户：

#### 自动弹出的设置向导（推荐）

如果看到 "Connect to cluster" 或 "Getting Started" 弹窗：

1. **创建SQL用户**：
   - **Username**: 输入用户名（推荐使用默认）
     ```
     admin
     ```
     或
     ```
     cable_user
     ```
   
   - **Password**: 点击 **"Generate & save password"**
     - 系统会自动生成强密码
     - ⚠️ **立即复制并保存密码**（只显示一次！）
     - 或者手动设置密码（至少12个字符）
   
   - 点击 **"Create"** 或 **"Next"**

#### 手动创建（如果跳过了向导）

1. 进入集群详情页
2. 点击左侧菜单 **"SQL Users"** 或 **"Access"**
3. 点击 **"Create User"** 或 **"Add user"**
4. 填写用户名和密码
5. 点击 **"Create"**

### 3.2 创建数据库

#### 方式A：使用SQL Shell（推荐）

1. **打开SQL Shell**：
   - 在集群页面，找到并点击 **"SQL Shell"** 按钮
   - 或在左侧菜单点击 **"SQL Shell"**

2. **执行创建数据库命令**：
   ```sql
   CREATE DATABASE cable_selector;
   ```

3. **验证创建**：
   ```sql
   SHOW DATABASES;
   ```
   
   应该看到：
   ```
   database_name
   -----------------
   cable_selector
   defaultdb
   postgres
   system
   ```

#### 方式B：使用控制台（图形界面）

1. 点击左侧菜单 **"Databases"**
2. 点击 **"Create Database"** 按钮
3. 输入数据库名称：`cable_selector`
4. 点击 **"Create"**

### 3.3 保存凭证

**重要信息记录**：

```
用户名: admin (或你设置的用户名)
密码: [刚才生成/设置的密码]
数据库名: cable_selector
```

> ⚠️ **密码只显示一次**，务必保存到安全位置！

---

## 第四步：获取连接字符串（2分钟）

### 4.1 进入连接信息页面

1. **在集群详情页**：
   - 点击页面右上角的 **"Connect"** 按钮
   - 或点击左侧菜单的 **"Connect"**

2. **进入连接引导页面**

### 4.2 选择连接方式

页面会显示多种连接选项：

#### 选择 "Connection string" 或 "General connection string"

1. 找到 **"Select option"** 下拉菜单
2. 选择 **"Connection string"** 或 **"General connection string"**
3. 或选择 **"Parameters only"**

### 4.3 选择编程语言

在 "Select your OS" 或 "Language" 下拉菜单：

1. 选择 **"Python"** 或 **"General"**
2. 选择 **"psycopg2"** 驱动（Django使用的）

### 4.4 获取连接字符串

页面会显示连接字符串，格式类似：

#### 格式1：完整URL（推荐）
```
postgresql://<username>:<password>@<host>:<port>/<database>?sslmode=verify-full&sslrootcert=<path-to-cert>
```

#### 格式2：参数形式
```
Host: free-tier.gcp-us-central1.cockroachlabs.cloud
Port: 26257
Database: cable_selector
Username: admin
Password: <your-password>
```

### 4.5 构建Django兼容的连接字符串

CockroachDB的连接字符串需要稍微调整才能用于Django：

#### 原始连接字符串示例：
```
postgresql://admin:AbCd1234EfGh@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/cable_selector?sslmode=verify-full
```

#### 调整为Django兼容格式：

**方式A：简化SSL模式（推荐）**
```
postgresql://admin:AbCd1234EfGh@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/cable_selector?sslmode=require
```

只需将 `sslmode=verify-full` 改为 `sslmode=require`

**方式B：完整格式**
```
cockroachdb://admin:AbCd1234EfGh@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/cable_selector?sslmode=require
```

### 4.6 复制并保存

1. **复制调整后的连接字符串**
2. **保存到记事本或密码管理器**
3. 确保密码正确（替换 `<your-password>` 为实际密码）

**连接字符串格式检查**：
- ✅ 以 `postgresql://` 或 `cockroachdb://` 开头
- ✅ 包含用户名和密码
- ✅ 包含主机地址和端口
- ✅ 包含数据库名 `cable_selector`
- ✅ 以 `?sslmode=require` 结尾

---

## 第五步：配置Render使用CockroachDB（2分钟）

### 5.1 登录Render

1. 打开新标签页
2. 访问：https://render.com
3. 登录你的账号

### 5.2 进入Web Service

1. 在Render控制台，找到你的后端服务
   - 服务名称：`cable-selector-backend`
2. 点击服务名称进入详情页

### 5.3 更新数据库环境变量

1. **点击 "Environment" 标签**

2. **找到 DATABASE_URL 变量**
   - 向下滚动或搜索 "DATABASE_URL"

3. **点击编辑按钮**（铅笔图标）

4. **替换值**
   - 清空原来的值
   - 粘贴CockroachDB的连接字符串
   - 例如：
     ```
     postgresql://admin:AbCd1234@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/cable_selector?sslmode=require
     ```

5. **保存更改**
   - 点击 **"Save Changes"** 按钮

### 5.4 触发重新部署

1. **自动部署**：
   - Render检测到环境变量更改
   - 询问是否重新部署
   - 点击 **"Deploy"** 确认

2. **手动部署**（如果没有自动触发）：
   - 点击右上角 **"Manual Deploy"**
   - 选择 **"Deploy latest commit"**

3. **等待部署**（约2-3分钟）

### 5.5 观察部署日志

查看日志输出，确认数据库连接成功：

**正常流程**：
```
==> Building...
✓ pip install -r requirements.txt

==> Running migrations...
✓ Operations to perform:
    Apply all migrations: admin, auth, cables, ...
✓ Applying cables.0001_initial... OK

==> Loading initial data...
✓ Installed 150 object(s) from 1 fixture(s)

==> Starting application...
✓ Listening at: http://0.0.0.0:10000
```

**成功标志**：
- ✅ 没有数据库连接错误
- ✅ 迁移成功执行
- ✅ 数据加载成功
- ✅ 服务状态变为 "Live"（绿色）

---

## 第六步：验证CockroachDB连接（2分钟）

### 6.1 测试后端API

1. **获取后端URL**
   - 在Render服务页面顶部
   - 复制：`https://你的服务名.onrender.com`

2. **访问API端点**
   ```
   https://你的服务名.onrender.com/api/cables/
   ```

3. **验证响应**

   **成功的响应**：
   ```json
   [
     {
       "id": 1,
       "type": "YJV-0.6/1kV",
       "cross_section": 1.5,
       "current_rating": 22,
       ...
     }
   ]
   ```

   ✅ 看到JSON数据 = 连接成功！

### 6.2 在CockroachDB控制台验证

返回CockroachDB Cloud控制台：

1. **进入SQL Shell**
   - 点击左侧菜单 **"SQL Shell"**

2. **切换到你的数据库**
   ```sql
   \c cable_selector
   ```

3. **查询数据**
   ```sql
   SELECT COUNT(*) FROM cables_cablespecification;
   ```

4. **查看结果**
   - 应该显示记录数（例如：150）
   - ✅ 数据成功加载到CockroachDB！

### 6.3 检查集群状态

在CockroachDB控制台：

1. **进入集群Dashboard**
   - 点击 **"Overview"** 或 **"Metrics"**

2. **查看指标**：
   - **Storage Used**: 应该显示几MB
   - **Request Units**: 显示当前使用的RU
   - **Connections**: 显示活跃连接数

3. **确认免费额度**：
   - Storage: < 100MB / 5GB ✅
   - Request Units: 远低于50M/月 ✅

---

## 第七步：优化CockroachDB配置（可选）

### 7.1 启用自动备份

CockroachDB Serverless自动提供备份：

1. 进入 **"Backups"** 标签
2. 查看备份策略：
   - 每日自动备份
   - 保留30天（免费层级）
3. 无需额外配置 ✅

### 7.2 配置连接池

在Django settings中优化（`xuanxing/backend/cable_selector/settings.py`）：

```python
DATABASES = {
    'default': {
        ...
        'CONN_MAX_AGE': 600,  # 连接池：保持连接10分钟
        'OPTIONS': {
            'sslmode': 'require',
        }
    }
}
```

### 7.3 监控使用情况

定期检查CockroachDB控制台：

1. **Storage使用**：
   - 查看 "Overview" → "Storage"
   - 确保 < 5GB

2. **Request Units**：
   - 查看 "Overview" → "Request Units"
   - 确保 < 50M/月

3. **设置告警**（可选）：
   - 进入 "Alerts"
   - 设置接近限制时的邮件通知

---

## 📊 配置完成清单

检查以下所有项目：

- [ ] ✅ CockroachDB账号已创建
- [ ] ✅ Serverless集群已创建
- [ ] ✅ SQL用户已创建
- [ ] ✅ 数据库 cable_selector 已创建
- [ ] ✅ 连接字符串已获取并保存
- [ ] ✅ Render DATABASE_URL 已更新
- [ ] ✅ Render重新部署成功
- [ ] ✅ API测试通过（/api/cables/）
- [ ] ✅ CockroachDB中可以查到数据

全部打勾？恭喜！CockroachDB配置完成！🎉

---

## 🔧 故障排查

### ❌ 问题1：部署失败 "SSL connection required"

**错误信息**：
```
django.db.utils.OperationalError: connection to server failed: SSL required
```

**解决方案**：

检查连接字符串是否包含SSL参数：
```
?sslmode=require
```

完整示例：
```
postgresql://admin:password@host:26257/cable_selector?sslmode=require
```

---

### ❌ 问题2：认证失败

**错误信息**：
```
authentication failed for user "admin"
```

**可能原因**：
1. 密码错误
2. 用户名错误

**解决方案**：

1. **重置密码**：
   - 进入CockroachDB控制台
   - SQL Users → 选择用户 → Reset password
   - 生成新密码
   - 更新Render的DATABASE_URL

2. **检查用户名**：
   - 确认是否为 `admin` 或你创建的用户名

---

### ❌ 问题3：找不到数据库

**错误信息**：
```
database "cable_selector" does not exist
```

**解决方案**：

1. **在SQL Shell中创建**：
   ```sql
   CREATE DATABASE cable_selector;
   ```

2. **更新连接字符串**：
   确保URL中的数据库名是 `cable_selector`

---

### ❌ 问题4：Request Units超限

**症状**：请求被限制，响应变慢

**解决方案**：

1. **检查使用量**：
   - Dashboard → Overview → Request Units

2. **优化查询**：
   - 添加索引
   - 减少不必要的查询

3. **升级计划**（如果需要）：
   - 设置更高的spend limit
   - 按需付费

---

## 📈 CockroachDB使用技巧

### 1. 性能优化

**添加索引**：
```sql
-- 为常用查询字段添加索引
CREATE INDEX idx_cables_cross_section 
ON cables_cablespecification(cross_section);
```

**使用连接池**：
- Django自动使用连接池
- 配置 `CONN_MAX_AGE` 优化连接复用

### 2. 监控和告警

**设置使用量告警**：
1. Dashboard → Alerts
2. 创建告警规则：
   - Storage > 4GB
   - Request Units > 40M
3. 接收邮件通知

### 3. 数据备份

**手动触发备份**（Serverless自动备份）：
1. Backups → View backups
2. 查看自动备份历史
3. 可以从任意备份恢复

### 4. 性能分析

**查看慢查询**：
1. SQL Activity → Statements
2. 查看执行时间最长的查询
3. 优化SQL或添加索引

---

## 🎉 部署成功！

恭喜！你现在使用的是：

- ✅ **永久免费** 的CockroachDB Serverless
- ✅ **5GB存储空间**（超过需求）
- ✅ **50M Request Units/月**（充足）
- ✅ **自动备份**（30天保留）
- ✅ **全球分布式**（高可用）
- ✅ **不会休眠**（始终在线）

---

## 📝 记录你的配置信息

| 项目 | 信息 |
|------|------|
| **CockroachDB集群名** | cable-selector-db |
| **云服务商** | AWS |
| **区域** | Singapore (ap-southeast-1) |
| **数据库名** | cable_selector |
| **用户名** | admin |
| **密码** | [保密] |
| **连接URL** | postgresql://[保密] |
| **存储限制** | 5GB |
| **当前使用** | ~5MB |

---

## 🆚 CockroachDB vs 其他方案

### 最终对比

| 数据库 | 存储 | 永久性 | 休眠 | 推荐度 |
|--------|------|--------|------|--------|
| **CockroachDB** | 5GB | ✅ | ❌ | ⭐⭐⭐⭐⭐ |
| **Neon** | 3GB | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Supabase** | 500MB | ✅ | ✅ | ⭐⭐⭐⭐ |
| **ElephantSQL** | 20MB | ✅ | ❌ | ⭐⭐⭐⭐ |
| Render | 1GB | ❌ | ❌ | ⭐⭐⭐ |

### 选择建议

- **最大存储空间**：CockroachDB (5GB)
- **最稳定不休眠**：CockroachDB 或 ElephantSQL
- **最简单配置**：Neon
- **功能最丰富**：Supabase

**本项目推荐**：CockroachDB 或 Neon 都很好！

---

## 🚀 下一步

现在数据库已配置完成，继续部署流程：

1. ✅ GitHub - 已完成
2. ✅ CockroachDB数据库 - 刚刚完成
3. ⏭️ Render后端 - 继续完成其他配置
4. ⏭️ Vercel前端 - 下一步
5. ⏭️ 连接前后端 - 最后步骤

**返回主部署文档：** `完整部署指南-从零开始.md`

---

**祝你部署顺利！** 🪳✨

