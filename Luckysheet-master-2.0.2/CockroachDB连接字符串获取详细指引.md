# 🔍 CockroachDB 连接字符串获取详细指引

> 如果你在CockroachDB控制台找不到连接字符串，按照这个详细指引操作

---

## 📍 你现在在哪里？

先确认你的当前位置：

### 场景1：刚创建完集群

如果你刚刚创建完Serverless集群，应该会看到：

```
✓ Cluster created successfully!
```

**接下来会发生什么**：

1. **自动弹出连接引导窗口**
   - 标题可能是："Connect to your cluster" 或 "Get started"
   - 这是最简单的方式！

2. **如果看到这个弹窗**：
   - ✅ 太好了！继续看"方法1：从欢迎弹窗获取"

3. **如果没看到弹窗或已关闭**：
   - 没关系！继续看"方法2：从集群页面获取"

---

## 方法1：从欢迎弹窗获取（最简单）⭐⭐⭐⭐⭐

### 步骤1：查看弹窗

集群创建成功后，会自动弹出一个大的欢迎窗口。

**窗口标题可能是**：
- "Connect to your cluster"
- "Get started with your cluster"
- "Set up your connection"

### 步骤2：创建SQL用户（如果还没创建）

弹窗第一步通常是创建用户：

1. **看到 "Create a SQL user" 或类似字样**
2. **填写信息**：
   ```
   Username: admin （或使用默认）
   Password: [点击 "Generate & save password"]
   ```
3. ⚠️ **立即保存生成的密码**（只显示一次！）
4. 点击 **"Create"** 或 **"Next"**

### 步骤3：选择连接方式

创建用户后，进入下一步：

1. **看到 "Select a connection method"**
2. **选择 "Connection string"** 或 **"General connection string"**
   - 不要选 "CockroachDB Client"
   - 不要选 "Application"

### 步骤4：复制连接字符串

现在会显示连接字符串！

**显示位置**：
- 在一个大的文本框中
- 或在代码块中高亮显示

**连接字符串格式**：
```
postgresql://admin:YOUR_PASSWORD@free-tier14-aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Dyour-cluster-name
```

**操作**：
1. 点击文本框右侧的 **"Copy"** 按钮（复制图标）
2. 或手动选择全部文本并复制（Ctrl+C）

### 步骤5：调整连接字符串

需要做两处修改：

#### 修改1：数据库名
将 `defaultdb` 改为 `cable_selector`

**原始**：
```
postgresql://admin:password@host:26257/defaultdb?sslmode=...
```

**修改后**：
```
postgresql://admin:password@host:26257/cable_selector?sslmode=...
```

#### 修改2：简化SSL模式
将 `sslmode=verify-full&options=--cluster%3D...` 改为 `sslmode=require`

**原始**：
```
...cable_selector?sslmode=verify-full&options=--cluster%3Dyour-cluster-name
```

**修改后**：
```
...cable_selector?sslmode=require
```

### 最终格式示例

```
postgresql://admin:AbCd1234@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/cable_selector?sslmode=require
```

✅ 完成！这就是你需要的连接字符串！

---

## 方法2：从集群页面获取（任何时候都可用）⭐⭐⭐⭐⭐

### 步骤1：进入集群详情页

1. **登录 CockroachDB Cloud**
   ```
   https://cockroachlabs.cloud
   ```

2. **找到你的集群**
   - 在主页面（Overview）
   - 或点击左侧 **"Clusters"** 菜单
   - 看到集群列表

3. **点击集群名称**
   - 例如：`cable-selector-db`
   - 进入集群详情页

### 步骤2：点击 Connect 按钮

在集群详情页，找到 **"Connect"** 按钮：

**可能的位置**：
- ✅ 页面**右上角**（最常见）
- ✅ 集群名称旁边
- ✅ 页面中间的快速操作区

**按钮样式**：
- 通常是绿色或蓝色按钮
- 文字：**"Connect"** 或 **"Connect to cluster"**

**点击按钮**，会打开连接引导窗口。

### 步骤3：选择连接类型

弹出的窗口中：

1. **看到 "Select option" 或 "How would you like to connect?"**

2. **选择以下任一选项**：
   - ✅ **"Connection string"**（推荐）
   - ✅ **"General connection string"**
   - ✅ **"Connection parameters"**

3. **不要选择**：
   - ❌ "CockroachDB Client"（这是CLI工具）
   - ❌ "Application specific"（除非选Python/Django）

### 步骤4：选择编程语言（可选）

如果看到 "Select language" 或 "Framework"：

1. 下拉菜单中选择：
   - **"Python"** 或
   - **"General"**

2. 如果有 "Driver" 选项：
   - 选择 **"psycopg2"**（Django使用的驱动）

### 步骤5：查找连接字符串

现在应该能看到连接字符串了！

**显示方式**：

#### 方式A：直接显示URL（最常见）
```
Connection string:
postgresql://admin:password@host:26257/defaultdb?sslmode=verify-full...
```

右侧有 **"Copy"** 按钮，点击复制。

#### 方式B：显示各个参数
```
Host: free-tier.gcp-us-central1.cockroachlabs.cloud
Port: 26257
Database: defaultdb
User: admin
Password: [YOUR_PASSWORD]
SSL Mode: verify-full
```

**如果是这种方式**，你需要手动构建连接字符串：
```
postgresql://[User]:[Password]@[Host]:[Port]/[Database]?sslmode=require
```

示例：
```
postgresql://admin:AbCd1234@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/cable_selector?sslmode=require
```

### 步骤6：修改连接字符串

按照"方法1"的步骤5进行修改：
1. 将数据库名改为 `cable_selector`
2. 将SSL模式简化为 `sslmode=require`

---

## 方法3：从 SQL Shell 构建（高级）⭐⭐⭐

### 步骤1：打开 SQL Shell

1. 在集群页面，点击左侧菜单
2. 找到并点击 **"SQL Shell"**
3. SQL Shell会在浏览器中打开

### 步骤2：查看连接信息

在SQL Shell页面顶部，会显示：

```
Connected to cluster: your-cluster-name
Database: defaultdb
User: admin
```

### 步骤3：手动构建连接字符串

格式：
```
postgresql://[用户名]:[密码]@[主机地址]:26257/cable_selector?sslmode=require
```

**获取各部分信息**：

1. **用户名**：SQL Shell显示的 User
2. **密码**：你创建用户时保存的密码
3. **主机地址**：
   - 回到集群详情页
   - 点击 **"Connect"**
   - 查看 Host 参数

---

## 🔍 常见问题

### Q1：我忘记了密码怎么办？

**解决方案：重置密码**

1. 在集群页面，点击左侧 **"SQL Users"**
2. 找到你的用户（如 admin）
3. 点击用户行末尾的 **"..."** 或 **"Actions"**
4. 选择 **"Reset password"**
5. 选择 **"Generate & save password"**
6. ⚠️ 立即保存新密码！
7. 使用新密码更新连接字符串

### Q2：连接字符串中没有密码？

**这是正常的！**

CockroachDB出于安全考虑，不会在连接字符串中直接显示密码。

**你需要**：
1. 使用创建用户时保存的密码
2. 手动将密码插入连接字符串的对应位置

**示例**：
```
显示的：postgresql://admin@host:26257/db?sslmode=require
实际的：postgresql://admin:YOUR_PASSWORD@host:26257/db?sslmode=require
                              ↑插入密码
```

### Q3：我关闭了欢迎弹窗，还能再打开吗？

**可以！**

点击集群页面右上角的 **"Connect"** 按钮，会重新打开连接引导。

### Q4：连接字符串太长，是否正确？

**示例正常的连接字符串**：
```
postgresql://admin:password@free-tier14-aws-us-east-1.cockroachlabs.cloud:26257/cable_selector?sslmode=require
```

**长度约150-200个字符是正常的！**

包含的部分：
- 协议：`postgresql://`
- 用户名：`admin`
- 密码：`password`（你的实际密码）
- 主机：`free-tier14-aws-us-east-1.cockroachlabs.cloud`
- 端口：`26257`
- 数据库：`cable_selector`
- SSL参数：`?sslmode=require`

### Q5：sslmode 应该用哪个值？

**推荐使用 `require`**：
```
?sslmode=require
```

**不推荐**：
- ❌ `verify-full`（Django可能不支持，需要额外证书）
- ❌ `disable`（不安全）

---

## ✅ 快速检查清单

使用这个清单确认你的连接字符串正确：

- [ ] 以 `postgresql://` 开头
- [ ] 包含用户名（如 `admin`）
- [ ] 包含密码（在用户名后，用冒号分隔）
- [ ] 包含主机地址（以 `.cockroachlabs.cloud` 结尾）
- [ ] 包含端口 `:26257`
- [ ] 数据库名是 `cable_selector`（不是 `defaultdb`）
- [ ] 以 `?sslmode=require` 结尾

**示例完整检查**：
```
postgresql://admin:AbCd1234@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/cable_selector?sslmode=require
           ↑      ↑        ↑                                                ↑     ↑                ↑
        用户名   密码      主机地址                                          端口  数据库           SSL
```

---

## 📸 关键界面截图说明

### 界面1：集群详情页

```
┌─────────────────────────────────────────────────────────┐
│  ← Clusters    cable-selector-db          [Connect]    │  ← Connect按钮在这里
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Status: ● Available                                    │
│  Region: AWS US East 1                                  │
│  Storage: 5 MB / 5 GB                                   │
│                                                         │
│  Quick actions:                                         │
│  • SQL Shell                                            │
│  • Connect                                              │  ← 或这里
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 界面2：Connect 弹窗

```
┌─────────────────────────────────────────────────────────┐
│  Connect to cable-selector-db                      [×]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Select option:                                         │
│  ┌───────────────────────────────────┐                 │
│  │ Connection string              ▼│                 │  ← 选这个
│  └───────────────────────────────────┘                 │
│                                                         │
│  Connection string:                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ postgresql://admin@host:26257/db?sslmode=...  │ [📋]│  ← 连接字符串
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 界面3：SQL Users 页面（重置密码）

```
┌─────────────────────────────────────────────────────────┐
│  SQL Users                            [+ Create user]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User         Created            Actions                │
│  ──────────────────────────────────────────────────     │
│  admin        2 hours ago        [⋮]  ← 点这里           │
│                                   ↓                     │
│                              Reset password             │
│                              Delete user                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 最简单的方法（推荐）

如果上述方法都找不到，**最简单的办法**：

### 重新开始连接流程

1. **回到集群详情页**
2. **找到页面中的任何一个 "Connect" 按钮**
   - 右上角
   - 或页面中间
   - 肯定有一个！
3. **点击后，选择 "Connection string"**
4. **复制显示的字符串**
5. **按本文档修改**

---

## 💡 仍然找不到？

如果你真的找不到连接字符串，**联系我**，提供以下信息：

1. 你看到的页面标题
2. 你在哪个标签页（Clusters / Overview / 其他）
3. 截图（如果可以）

我会帮你精确定位！

---

**记住**：连接字符串一定在 **"Connect"** 按钮后面！找到这个按钮就成功了！🎉

