# Blender二次开发指南

## 环境准备

### 所需工具
- Visual Studio 2019或2022（带C++开发组件）
- CMake 3.15+
- Git
- Python 3.10+
- SVN（用于下载库文件）

## 获取源码

```bash
git clone https://projects.blender.org/blender/blender.git
cd blender
git submodule update --init --recursive
```

## 构建步骤

### 1. 下载预编译库
```bash
cd blender
make update
```

### 2. 使用CMake生成项目
```bash
mkdir build
cd build
cmake .. -G "Visual Studio 17 2022" -A x64
```

### 3. 编译
```bash
cmake --build . --config Release
```

## 关于加密软件的兼容性问题

### 常见问题
如果winrdlv3或sdhelper2阻止了您自己编译的EXE运行：

### 解决方案

#### 方案1：添加白名单（推荐）
1. 将您的开发目录添加到加密软件的白名单/例外列表
2. 将编译输出的EXE路径加入信任区域

#### 方案2：代码签名
```bash
# 使用自签名证书（开发测试用）
# 1. 创建自签名证书
makecert -r -pe -n "CN=开发测试证书" -ss My -sr CurrentUser

# 2. 签名EXE
signtool sign /a /n "开发测试证书" /t http://timestamp.digicert.com blender.exe
```

#### 方案3：临时禁用（开发时）
- 开发和编译期间临时关闭加密软件
- 测试完成后重新启用

#### 方案4：使用虚拟机
- 在VMware/VirtualBox中建立纯净的开发环境
- 不安装这些加密软件

#### 方案5：修改编译参数
在CMake配置时添加：
```bash
cmake .. -DWITH_WINDOWS_BUNDLE_CRT=ON
cmake --build . --config Release
```

### 调试模式构建
如果只是自用，可以构建Debug版本（不太容易被拦截）：
```bash
cmake --build . --config Debug
```

## 二次开发示例

### 修改启动行为
编辑 `source/creator/creator.c` 添加自定义逻辑

### 添加自定义功能
在 `source/blender` 下添加您的模块

### 创建自定义打包
修改 `build_files/cmake/packaging/` 中的脚本

## 发布注意事项

1. **遵守GPL协议**：必须开源您的修改
2. **明确标识**：标注这是修改版本
3. **提供源码**：为用户提供访问源码的途径

## 常见问题

### Q: 为什么我的EXE被杀毒软件拦截？
A: 新编译的无签名程序容易被误报，需要代码签名或添加例外

### Q: 如何减少EXE体积？
A: 使用Release模式，启用链接时优化（LTCG）

### Q: 如何打包依赖？
A: 使用 `make install` 会自动打包所有依赖DLL

## 快速构建脚本示例

