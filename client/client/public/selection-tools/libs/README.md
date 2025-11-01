# 本地库文件说明

## ExcelJS 库

为了实现完整的Excel格式导出（边框、居中、字体、颜色等），需要使用 ExcelJS 库。

### 下载方式

由于网络原因，CDN可能无法访问，请手动下载 ExcelJS 到此目录：

#### 方法1：直接下载（推荐）
1. 访问：https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js
2. 或访问：https://registry.npmmirror.com/exceljs/4.4.0/files/dist/exceljs.min.js （国内镜像）
3. 将文件保存为：`src/libs/exceljs.min.js`

#### 方法2：使用npm（如果已安装Node.js）
```bash
cd src/libs
npm install exceljs
cp node_modules/exceljs/dist/exceljs.min.js ./
```

#### 方法3：使用国内镜像下载
```bash
curl -o src/libs/exceljs.min.js https://registry.npmmirror.com/exceljs/4.4.0/files/dist/exceljs.min.js
```

### 文件大小
- exceljs.min.js: 约 1.5 MB

### 如果没有 ExcelJS
系统会自动降级使用 XLSX.js，但会丢失以下格式：
- ❌ 边框
- ❌ 居中对齐
- ❌ 字体样式
- ❌ 背景色
- ✅ 公式（保留）
- ✅ 合并单元格（保留）
- ✅ 列宽行高（保留）

### 验证是否加载成功
打开浏览器控制台，输入：
```javascript
typeof ExcelJS
```
如果返回 `"object"` 则加载成功，返回 `"undefined"` 则未加载。
