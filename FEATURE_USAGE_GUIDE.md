# 📚 EPC项目管理系统 - 功能使用指南

**版本**：2.0  
**更新日期**：2025-12-01

---

## 🎯 新增功能概览

### 1. AI智能助手 🤖
- ✅ Groq真实AI集成
- ✅ 自然语言任务解析
- ✅ 智能进度预测
- ✅ 风险识别分析
- ✅ 资源优化建议

### 2. 移动端优化 📱
- ✅ 响应式布局
- ✅ 手势识别
- ✅ 触摸反馈
- ✅ 底部导航
- ✅ 安全区域适配

### 3. 批量操作 📊
- ✅ Excel导入导出
- ✅ 数据验证
- ✅ 批量创建/更新/删除
- ✅ 模板下载

### 4. 施工管理增强 🏗️
- ✅ 照片压缩和水印
- ✅ GPS定位记录
- ✅ 语音输入
- ✅ 离线缓存

### 5. 快速操作面板 ⚡
- ✅ 常用功能快捷入口
- ✅ 今日概览
- ✅ 任务提醒

---

## 📖 详细使用说明

### 一、AI智能助手

#### 1.1 配置AI服务

**环境变量配置**：
```bash
# client/.env.local
REACT_APP_AI_PROVIDER=groq
REACT_APP_AI_API_KEY=your_api_key_here
REACT_APP_ENABLE_AI=true
```

**支持的AI提供商**：
- `groq` - Groq (推荐，免费14,400次/天)
- `siliconflow` - 硅基流动 (完全免费)
- `deepseek` - DeepSeek (¥1/百万tokens)
- `openai` - OpenAI GPT-4
- `local` - 本地模拟

#### 1.2 使用AI功能

**任务解析**：
```typescript
import { aiAssistant } from '../services/AIAssistant';

// 自然语言创建任务
const result = await aiAssistant.parseNaturalLanguageTask(
  '创建一个紧急的前端优化任务，需要在本周完成'
);

// 返回结构化数据
{
  title: "前端优化任务",
  priority: "high",
  estimatedDuration: 16,
  suggestedAssignee: "前端工程师",
  confidence: 0.95
}
```

**进度预测**：
```typescript
const prediction = await aiAssistant.predictProjectProgress('PROJ-001');

// 返回预测结果
{
  predictedCompletionDate: "2025-06-15",
  confidenceLevel: 0.85,
  bottlenecks: ["资源不足", "依赖任务延期"],
  recommendations: ["增加人力", "调整计划"]
}
```

**风险识别**：
```typescript
const risks = await aiAssistant.identifyRisks('PROJ-001');

// 返回风险列表
[
  {
    riskLevel: "high",
    riskType: "进度风险",
    description: "关键路径任务延期",
    mitigation: "增加资源投入",
    probability: 0.7,
    impact: 0.9
  }
]
```

---

### 二、批量操作

#### 2.1 Excel导入

**下载模板**：
```typescript
import { ExcelHandler } from '../utils/batchOperations';

// 下载任务模板
ExcelHandler.downloadTemplate('tasks');

// 下载资源模板
ExcelHandler.downloadTemplate('resources');

// 下载成本模板
ExcelHandler.downloadTemplate('costs');
```

**导入数据**：
```typescript
// 读取Excel文件
const file = event.target.files[0];
const data = await ExcelHandler.readExcel(file);

// 验证数据
const validation = DataValidator.validateRequired(data, ['任务名称', '开始日期']);
if (!validation.valid) {
  console.error('验证失败:', validation.errors);
  return;
}

// 批量创建
const result = await BatchOperations.batchCreate(
  data,
  async (item) => {
    return await createTask({
      name: item['任务名称'],
      startDate: item['开始日期'],
      endDate: item['结束日期'],
      assignee: item['负责人'],
      priority: item['优先级'],
    });
  },
  {
    batchSize: 10,
    onProgress: (current, total) => {
      console.log(`进度: ${current}/${total}`);
    }
  }
);

console.log(`成功: ${result.success}, 失败: ${result.failed}`);
```

#### 2.2 Excel导出

```typescript
// 导出项目数据
const projects = await getProjects();
ExcelHandler.exportToExcel(projects, 'projects.xlsx');

// 导出任务数据
const tasks = await getTasks();
ExcelHandler.exportToExcel(tasks, 'tasks.xlsx');

// CSV导出
DataTransformer.downloadCsv(projects, 'projects.csv');
```

---

### 三、照片处理

#### 3.1 照片压缩和水印

```typescript
import { PhotoUtils } from '../utils/photoUtils';

// 处理单张照片
const file = event.target.files[0];
const watermarkText = `${projectName} ${new Date().toLocaleDateString()}`;
const processedBlob = await PhotoUtils.processPhoto(file, watermarkText);

// 转换为File并上传
const processedFile = PhotoUtils.blobToFile(
  processedBlob,
  `processed_${file.name}`
);
await uploadPhoto(processedFile);
```

#### 3.2 批量处理照片

```typescript
// 批量处理
const files = Array.from(event.target.files);
const watermarkText = `${projectName} ${new Date().toLocaleDateString()}`;

const processedBlobs = await PhotoUtils.batchProcessPhotos(
  files,
  watermarkText,
  (current, total) => {
    console.log(`处理进度: ${current}/${total}`);
  }
);

// 批量上传
for (const blob of processedBlobs) {
  const file = PhotoUtils.blobToFile(blob, `photo_${Date.now()}.jpg`);
  await uploadPhoto(file);
}
```

#### 3.3 GPS定位

```typescript
// 获取当前位置
const location = await PhotoUtils.getCurrentLocation();

console.log('位置信息:', {
  latitude: location.latitude,
  longitude: location.longitude,
  accuracy: location.accuracy,
});

// 保存到施工日志
await createConstructionLog({
  content: '设备基础施工',
  location: {
    lat: location.latitude,
    lng: location.longitude,
  },
  photos: processedPhotos,
});
```

---

### 四、语音输入

#### 4.1 基本使用

```typescript
import { VoiceInput } from '../utils/voiceInput';

// 创建语音输入实例
const voice = new VoiceInput();

// 设置回调
voice.onResult((result) => {
  if (result.isFinal) {
    // 最终结果
    setFormValue('description', result.transcript);
  } else {
    // 临时结果
    setTempText(result.transcript);
  }
});

voice.onError((error) => {
  console.error('语音识别错误:', error);
});

// 开始识别
voice.start({
  lang: 'zh-CN',
  continuous: false,
  interimResults: true,
});

// 停止识别
voice.stop();
```

#### 4.2 快速语音转文字

```typescript
import { voiceToText } from '../utils/voiceInput';

// 一次性语音转文字
const text = await voiceToText({ lang: 'zh-CN' });
console.log('识别结果:', text);
```

#### 4.3 在表单中使用

```tsx
import { AudioOutlined } from '@ant-design/icons';
import { VoiceInput } from '../utils/voiceInput';

const MyForm = () => {
  const [voice] = useState(() => new VoiceInput());
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceInput = () => {
    if (isRecording) {
      voice.stop();
      setIsRecording(false);
    } else {
      voice.onResult((result) => {
        if (result.isFinal) {
          form.setFieldValue('description', result.transcript);
          setIsRecording(false);
        }
      });
      
      voice.start({ lang: 'zh-CN' });
      setIsRecording(true);
    }
  };

  return (
    <Form.Item label="描述">
      <Input.TextArea
        placeholder="请输入描述或点击麦克风图标使用语音输入"
        suffix={
          <AudioOutlined
            onClick={handleVoiceInput}
            style={{ color: isRecording ? '#ff4d4f' : '#1890ff' }}
          />
        }
      />
    </Form.Item>
  );
};
```

---

### 五、移动端功能

#### 5.1 响应式Hook

```typescript
import { useResponsive } from '../hooks/useResponsive';

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop, breakpoints } = useResponsive();

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
};
```

#### 5.2 手势识别

```typescript
import { GestureRecognizer } from '../utils/mobileOptimization';

useEffect(() => {
  const element = document.getElementById('my-element');
  if (!element) return;

  const gesture = new GestureRecognizer(element);
  
  gesture.onSwipeLeft = () => {
    console.log('向左滑动');
    navigate('/next-page');
  };
  
  gesture.onSwipeRight = () => {
    console.log('向右滑动');
    navigate(-1);
  };
  
  gesture.onLongPress = () => {
    console.log('长按');
    showContextMenu();
  };

  return () => gesture.destroy();
}, []);
```

#### 5.3 移动端优化

```typescript
import { optimizeMobilePerformance } from '../utils/mobileOptimization';

useEffect(() => {
  // 自动优化移动端性能
  optimizeMobilePerformance();
}, []);
```

---

### 六、快速操作面板

#### 6.1 使用快速操作

```tsx
import { QuickActionsPanel } from '../components/Workspace/QuickActionsPanel';

<QuickActionsPanel
  onCreateProject={() => setModalVisible(true)}
  onOpenAI={() => setAIDrawerVisible(true)}
  onImportData={() => setImportModalVisible(true)}
  onExportData={() => handleExport()}
/>
```

#### 6.2 今日概览

```tsx
import { TodayOverview } from '../components/Workspace/TodayOverview';

<TodayOverview projectId={currentProject?.id} />
```

---

### 七、错误处理

#### 7.1 全局错误边界

```tsx
import { GlobalErrorBoundary } from '../components/ErrorBoundary';

// 在App.tsx中使用
<GlobalErrorBoundary
  onError={(error, errorInfo) => {
    // 自定义错误处理
    console.error('全局错误:', error, errorInfo);
  }}
>
  <YourApp />
</GlobalErrorBoundary>
```

---

## 🎨 最佳实践

### 1. AI使用建议

**✅ 推荐做法**：
- 使用Groq或硅基流动（免费）
- 启用本地降级（提高可用性）
- 合理设置置信度阈值

**❌ 避免**：
- 在前端硬编码API密钥
- 过度依赖AI（保留本地处理）
- 忽略错误处理

### 2. 批量操作建议

**✅ 推荐做法**：
- 使用模板确保数据格式正确
- 先验证再导入
- 显示进度反馈
- 记录失败项

**❌ 避免**：
- 一次导入过多数据（建议<1000条）
- 跳过数据验证
- 忽略错误信息

### 3. 照片处理建议

**✅ 推荐做法**：
- 压缩后再上传（节省流量）
- 添加水印（防止盗用）
- 记录GPS信息（便于追溯）
- 批量处理时显示进度

**❌ 避免**：
- 上传原图（太大）
- 忘记释放预览URL（内存泄漏）
- 同时处理过多照片（性能问题）

### 4. 移动端开发建议

**✅ 推荐做法**：
- 使用响应式Hook
- 触摸目标最小44px
- 启用触觉反馈
- 适配安全区域

**❌ 避免**：
- 硬编码断点值
- 忽略横屏适配
- 过度使用动画（性能）

---

## 🔧 故障排除

### 问题1：AI功能不工作

**检查清单**：
1. ✅ 环境变量是否配置？
2. ✅ API密钥是否正确？
3. ✅ 网络是否正常？
4. ✅ 是否重启了服务？

**解决方法**：
```bash
# 检查环境变量
echo $REACT_APP_AI_PROVIDER
echo $REACT_APP_AI_API_KEY

# 重启前端
npm start
```

### 问题2：Excel导入失败

**常见原因**：
- 文件格式错误（需要.xlsx）
- 必填字段缺失
- 日期格式不正确
- 数据类型错误

**解决方法**：
1. 下载模板
2. 按模板填写数据
3. 检查验证错误信息
4. 修正后重新导入

### 问题3：语音识别不可用

**检查清单**：
1. ✅ 浏览器是否支持？（Chrome/Edge）
2. ✅ 是否授权麦克风？
3. ✅ 是否使用HTTPS？

**解决方法**：
```typescript
// 检查支持
if (!VoiceInput.isSupported()) {
  message.error('浏览器不支持语音识别');
}
```

### 问题4：移动端显示异常

**检查清单**：
1. ✅ 是否导入移动端CSS？
2. ✅ viewport meta标签是否正确？
3. ✅ 是否使用响应式组件？

**解决方法**：
```html
<!-- 确保有正确的viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 📞 获取帮助

### 文档
- `MODULE_ENHANCEMENT_PLAN.md` - 优化计划
- `MODULES_OPTIMIZED_2025-12-01.md` - 优化总结
- `OPTIMIZATION_PROGRESS_2025-12-01.md` - 进度报告

### 示例代码
- `client/src/utils/batchOperations.ts` - 批量操作示例
- `client/src/utils/photoUtils.ts` - 照片处理示例
- `client/src/utils/voiceInput.ts` - 语音输入示例

### 常用命令
```bash
# 开发环境
npm start

# 生产构建
npm run build

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

---

**最后更新**：2025-12-01  
**版本**：2.0.0
