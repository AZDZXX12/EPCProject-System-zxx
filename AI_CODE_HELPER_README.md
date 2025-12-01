# 🤖 AI代码助手使用指南

使用Gemini API读取和修改本地项目代码的Python脚本

---

## 📋 功能特性

✅ **代码分析** - AI分析代码质量、功能和改进建议  
✅ **代码修改** - 根据自然语言指令修改代码  
✅ **代码问答** - 询问关于代码的任何问题  
✅ **文件读取** - 查看文件内容  
✅ **自动备份** - 修改前自动备份原文件  
✅ **多AI支持** - 支持Gemini、OpenAI、Anthropic

---

## 🚀 快速开始

### 1. 获取Gemini API Key（免费）

访问：https://makersuite.google.com/app/apikey

1. 登录Google账号
2. 点击"Create API Key"
3. 复制生成的API Key

### 2. 配置脚本

打开 `ai_code_helper.py`，找到配置区域：

```python
# ==================== 配置区域 ====================
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"  # 粘贴你的API Key
AI_PROVIDER = "gemini"  # 使用Gemini
PROJECT_ROOT = Path(__file__).parent  # 项目根目录
# ==================================================
```

将 `YOUR_GEMINI_API_KEY_HERE` 替换为你的真实API Key。

### 3. 安装依赖

```bash
pip install requests
```

### 4. 运行脚本

```bash
python ai_code_helper.py
```

---

## 💡 使用示例

### 示例1：分析代码文件

```
请选择功能 (1-5): 1
请输入文件路径: client/src/components/AIAssistant/AIAssistantPanel.tsx

✅ 成功读取文件
🤖 正在调用Gemini API...
✅ API调用成功

📊 代码分析结果:
============================================================
这是一个React组件，实现了AI助手面板功能...
代码质量评分: 8/10
============================================================
```

### 示例2：修改代码

```
请选择功能 (1-5): 2
请输入文件路径: client/src/services/RealAIService.ts
请输入修改指令: 添加错误重试机制，失败后自动重试3次

✅ 成功读取文件
🤖 正在调用Gemini API...
✅ API调用成功

📝 修改后的代码:
============================================================
[显示修改后的代码预览]
============================================================

是否保存修改后的代码？(y/n): y
💾 已备份原文件到: RealAIService.ts.backup
✅ 代码已成功修改并保存！
```

### 示例3：代码问答

```
请选择功能 (1-5): 3
请输入文件路径: client/src/pages/Workspace.tsx
请输入你的问题: 这个文件中的拖拽功能是如何实现的？

✅ 成功读取文件
🤖 正在调用Gemini API...

💬 AI回答:
============================================================
拖拽功能通过以下方式实现：
1. onMouseDown事件监听...
2. handleMouseMove处理移动...
3. handleMouseUp清理事件...
============================================================
```

---

## 📝 常用修改指令示例

### 代码优化
```
优化这段代码的性能
重构这个函数，使其更易读
添加TypeScript类型定义
```

### 功能添加
```
添加错误处理机制
添加日志记录功能
添加单元测试
实现数据缓存
```

### Bug修复
```
修复这个内存泄漏问题
解决异步竞态条件
修复TypeScript类型错误
```

### 代码转换
```
将这段代码从JavaScript转换为TypeScript
将类组件改为函数组件
将回调改为async/await
```

---

## 🎯 最佳实践

### 1. 文件路径
使用相对于项目根目录的路径：
```
✅ 正确: client/src/components/AIAssistant/AIAssistantPanel.tsx
❌ 错误: C:\Users\...\AIAssistantPanel.tsx
```

### 2. 修改指令
指令要清晰具体：
```
✅ 好的指令: "添加错误重试机制，失败后自动重试3次，每次间隔2秒"
❌ 模糊指令: "改进一下"
```

### 3. 备份文件
- 修改前会自动创建 `.backup` 备份文件
- 如果修改出错，可以从备份恢复
- 定期清理旧的备份文件

### 4. 分批修改
对于大文件：
- 先分析代码结构
- 分批次修改不同部分
- 每次修改后测试功能

---

## 🔧 高级配置

### 切换AI提供商

```python
# 使用OpenAI
AI_PROVIDER = "openai"
OPENAI_API_KEY = "sk-..."

# 使用Anthropic Claude
AI_PROVIDER = "anthropic"
ANTHROPIC_API_KEY = "sk-ant-..."
```

### 自定义项目根目录

```python
# 指定其他项目目录
PROJECT_ROOT = Path("C:/Users/YourName/Projects/MyProject")
```

### 调整API参数

在 `call_gemini_api` 方法中修改：

```python
"generationConfig": {
    "temperature": 0.7,  # 创造性 (0-1)
    "maxOutputTokens": 8000,  # 最大输出长度
}
```

---

## ⚠️ 注意事项

### API限制
- **Gemini免费版**: 每分钟60次请求
- **大文件**: 超过8000 tokens可能被截断
- **网络**: 需要稳定的网络连接

### 安全建议
- ✅ 不要将API Key提交到Git
- ✅ 修改前检查备份文件
- ✅ 重要代码先在测试环境验证
- ❌ 不要在生产环境直接修改

### 文件类型
支持的文件类型：
- ✅ JavaScript (.js)
- ✅ TypeScript (.ts, .tsx)
- ✅ Python (.py)
- ✅ CSS (.css)
- ✅ HTML (.html)
- ✅ JSON (.json)
- ✅ Markdown (.md)

---

## 🐛 常见问题

### Q: API调用失败？
**A:** 检查：
1. API Key是否正确
2. 网络连接是否正常
3. 是否超过API限制

### Q: 文件读取失败？
**A:** 检查：
1. 文件路径是否正确
2. 文件是否存在
3. 文件编码是否为UTF-8

### Q: 修改后代码有问题？
**A:** 
1. 从 `.backup` 文件恢复
2. 使用更具体的修改指令
3. 分批次修改小部分代码

---

## 📊 使用流程图

```
开始
  ↓
选择功能
  ↓
输入文件路径 → 读取文件内容
  ↓
输入指令/问题 → 构建Prompt
  ↓
调用Gemini API → 获取AI响应
  ↓
显示结果
  ↓
[如果是修改] → 确认保存？
  ↓              ↓
 是            否
  ↓              ↓
备份原文件    取消
  ↓
写入新代码
  ↓
完成
```

---

## 🎓 进阶用法

### 批量处理文件

可以修改脚本添加批量处理功能：

```python
def batch_analyze(file_list):
    """批量分析多个文件"""
    for file_path in file_list:
        print(f"\n分析文件: {file_path}")
        helper.analyze_code(file_path)
```

### 项目级分析

```python
def analyze_project():
    """分析整个项目结构"""
    # 遍历项目文件
    # 生成项目报告
    pass
```

---

## 📞 支持

如果遇到问题：
1. 检查API Key配置
2. 查看错误信息
3. 参考常见问题
4. 查看Gemini API文档

---

## 🎉 开始使用

现在你可以：
1. 配置API Key
2. 运行脚本
3. 选择功能
4. 让AI帮你分析和修改代码！

**祝你使用愉快！** 🚀
