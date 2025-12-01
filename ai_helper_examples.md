# 🎯 AI代码助手实战示例

## 示例1：优化AI助手的性能

### 场景
你想优化 `AIAssistantPanel.tsx` 的性能

### 操作步骤
```
选择功能: 2 (修改代码文件)
文件路径: client/src/components/AIAssistant/AIAssistantPanel.tsx
修改指令: 优化组件性能，添加React.memo和useCallback，减少不必要的重渲染
```

### AI会做什么
1. 分析组件结构
2. 识别性能瓶颈
3. 添加性能优化代码
4. 返回优化后的完整代码

---

## 示例2：修复拖拽窗口的bug

### 场景
拖拽后窗口定位有问题

### 操作步骤
```
选择功能: 3 (代码问答)
文件路径: client/src/pages/Workspace.tsx
问题: 拖拽窗口后为什么会跟随页面滚动？如何修复？
```

### AI会回答
- 分析拖拽代码逻辑
- 指出问题原因
- 提供修复方案

然后：
```
选择功能: 2 (修改代码)
文件路径: client/src/pages/Workspace.tsx
修改指令: 修复拖拽功能，确保拖拽后窗口保持fixed定位，不跟随页面滚动
```

---

## 示例3：添加新功能

### 场景
为AI助手添加语音输入功能

### 操作步骤
```
选择功能: 2
文件路径: client/src/components/AIAssistant/AIAssistantPanel.tsx
修改指令: 添加语音输入功能，使用Web Speech API，添加一个麦克风按钮，点击后可以语音输入
```

### AI会做什么
1. 添加语音识别代码
2. 创建麦克风按钮UI
3. 集成到现有组件
4. 添加错误处理

---

## 示例4：代码重构

### 场景
将RealAIService重构为更模块化的结构

### 操作步骤
```
选择功能: 1 (先分析)
文件路径: client/src/services/RealAIService.ts

然后:
选择功能: 2 (修改)
文件路径: client/src/services/RealAIService.ts
修改指令: 重构代码，将每个AI提供商拆分为独立的类，使用策略模式，提高可维护性
```

---

## 示例5：添加类型定义

### 场景
为JavaScript文件添加TypeScript类型

### 操作步骤
```
选择功能: 2
文件路径: client/src/utils/helpers.js
修改指令: 将此文件转换为TypeScript，添加完整的类型定义和接口
```

---

## 示例6：批量分析项目文件

### 创建批量分析脚本

在 `ai_code_helper.py` 中添加：

```python
def batch_analyze_project():
    """批量分析项目关键文件"""
    files = [
        "client/src/components/AIAssistant/AIAssistantPanel.tsx",
        "client/src/services/RealAIService.ts",
        "client/src/pages/Workspace.tsx",
    ]
    
    for file_path in files:
        print(f"\n{'='*60}")
        print(f"分析文件: {file_path}")
        print('='*60)
        helper.analyze_code(file_path)
        input("按Enter继续下一个文件...")
```

---

## 示例7：生成单元测试

### 操作步骤
```
选择功能: 2
文件路径: client/src/services/RealAIService.ts
修改指令: 为这个服务类生成完整的Jest单元测试文件，包括所有方法的测试用例
```

保存为: `client/src/services/RealAIService.test.ts`

---

## 示例8：代码审查

### 操作步骤
```
选择功能: 1
文件路径: client/src/components/AIAssistant/AIAssistantPanel.tsx
```

AI会提供：
- 代码质量评分
- 潜在bug
- 性能问题
- 安全隐患
- 最佳实践建议

---

## 示例9：添加错误处理

### 操作步骤
```
选择功能: 2
文件路径: client/src/services/RealAIService.ts
修改指令: 为所有API调用添加完善的错误处理，包括网络超时、重试机制、错误日志记录
```

---

## 示例10：国际化支持

### 操作步骤
```
选择功能: 2
文件路径: client/src/components/AIAssistant/AIAssistantPanel.tsx
修改指令: 添加国际化支持，使用i18next，提取所有中文文本到语言文件，支持中英文切换
```

---

## 💡 高级技巧

### 1. 组合使用
先分析 → 再问答 → 最后修改

### 2. 渐进式修改
不要一次性大改，分步骤小改

### 3. 验证修改
每次修改后立即测试功能

### 4. 保留备份
重要修改前手动复制一份

### 5. 详细指令
指令越详细，AI修改越准确

---

## 🎯 实战工作流

### 新功能开发
```
1. 分析现有代码结构
2. 询问实现方案
3. 让AI生成代码
4. 测试并调整
5. 优化性能
```

### Bug修复
```
1. 分析问题代码
2. 询问bug原因
3. 让AI修复
4. 验证修复效果
```

### 代码优化
```
1. 分析代码质量
2. 获取优化建议
3. 逐步优化
4. 性能测试
```

---

## 📝 常用指令模板

### 性能优化
```
优化{功能}的性能，减少{具体问题}，提高{性能指标}
```

### 功能添加
```
添加{功能名称}，实现{具体需求}，使用{技术方案}
```

### Bug修复
```
修复{具体bug}，问题表现为{现象}，期望{正确行为}
```

### 代码重构
```
重构{模块名}，使用{设计模式}，提高{质量指标}
```

---

开始使用这些示例，让AI成为你的编程助手！🚀
