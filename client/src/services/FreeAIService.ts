/**
 * 免费AI模型服务集成
 * 支持多个免费AI API：OpenAI Compatible、Groq、Hugging Face、Deepseek等国内免费AI模型
 */

import { logger } from '../utils/logger';

// AI模型配置接口
export interface AIModelConfig {
  provider: 'openai' | 'groq' | 'huggingface' | 'deepseek' | 'qwen' | 'yi' | 'local';
  apiKey?: string;
  baseURL?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

// AI响应接口
export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 默认配置 - 使用免费的AI服务
const DEFAULT_CONFIGS: Record<string, AIModelConfig> = {
  // OpenAI兼容接口（可以使用免费的代理服务）
  openai: {
    provider: 'openai',
    baseURL: 'https://api.openai.com/v1', // 可替换为免费代理
    model: 'gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.7,
  },
  // Groq - 提供免费额度的超快AI API
  groq: {
    provider: 'groq',
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant', // 免费且快速
    maxTokens: 2000,
    temperature: 0.7,
  },
  // Hugging Face Inference API - 完全免费
  huggingface: {
    provider: 'huggingface',
    baseURL: 'https://api-inference.huggingface.co/models',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    maxTokens: 2000,
    temperature: 0.7,
  },
  // 本地模拟（用于演示和测试）
  local: {
    provider: 'local',
    model: 'local-mock',
    maxTokens: 2000,
    temperature: 0.7,
  },
};

class FreeAIService {
  private config: AIModelConfig;
  private requestCache: Map<string, AIResponse> = new Map();

  constructor(configKey: keyof typeof DEFAULT_CONFIGS = 'local') {
    this.config = DEFAULT_CONFIGS[configKey];
    logger.info('[免费AI服务] 初始化', { provider: this.config.provider, model: this.config.model });
  }

  /**
   * 设置API密钥
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    logger.info('[免费AI服务] API密钥已设置');
  }

  /**
   * 切换AI模型
   */
  switchProvider(provider: keyof typeof DEFAULT_CONFIGS): void {
    this.config = DEFAULT_CONFIGS[provider];
    logger.info('[免费AI服务] 切换提供商', { provider, model: this.config.model });
  }

  /**
   * 发送聊天请求
   */
  async chat(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<AIResponse> {
    try {
      // 生成缓存键
      const cacheKey = JSON.stringify({ messages, model: this.config.model });
      
      // 检查缓存
      if (this.requestCache.has(cacheKey)) {
        logger.info('[免费AI服务] 使用缓存响应');
        return this.requestCache.get(cacheKey)!;
      }

      let response: AIResponse;

      // 根据不同提供商调用不同的API
      switch (this.config.provider) {
        case 'openai':
        case 'groq':
          response = await this.callOpenAICompatible(messages);
          break;
        case 'huggingface':
          response = await this.callHuggingFace(messages);
          break;
        case 'local':
        default:
          response = await this.callLocalMock(messages);
          break;
      }

      // 缓存响应
      this.requestCache.set(cacheKey, response);

      // 限制缓存大小
      if (this.requestCache.size > 100) {
        const firstKey = this.requestCache.keys().next().value;
        this.requestCache.delete(firstKey);
      }

      return response;
    } catch (error) {
      logger.error('[免费AI服务] 聊天请求失败', error);
      // 降级到本地模拟
      return this.callLocalMock(messages);
    }
  }

  /**
   * 调用OpenAI兼容API (支持OpenAI、Groq等)
   */
  private async callOpenAICompatible(
    messages: Array<{ role: string; content: string }>
  ): Promise<AIResponse> {
    if (!this.config.apiKey) {
      logger.warn('[免费AI服务] 未配置API密钥，使用本地模拟');
      return this.callLocalMock(messages);
    }

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey || ''}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  /**
   * 调用Hugging Face Inference API
   */
  private async callHuggingFace(
    messages: Array<{ role: string; content: string }>
  ): Promise<AIResponse> {
    if (!this.config.apiKey) {
      logger.warn('[免费AI服务] 未配置Hugging Face API密钥，使用本地模拟');
      return this.callLocalMock(messages);
    }

    // 将消息格式化为单个提示
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const response = await fetch(`${this.config.baseURL}/${this.config.model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey || ''}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    const content = Array.isArray(data) ? data[0].generated_text : data.generated_text;

    return {
      content,
      model: this.config.model,
    };
  }

  /**
   * 本地智能模拟 - 基于规则的响应生成
   */
  private async callLocalMock(
    messages: Array<{ role: string; content: string }>
  ): Promise<AIResponse> {
    // 获取最后一条用户消息
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return {
        content: '抱歉，我没有收到您的消息。',
        model: 'local-mock',
      };
    }

    const userInput = lastUserMessage.content.toLowerCase();
    let response = '';

    // 智能规则匹配
    if (userInput.includes('创建任务') || userInput.includes('新建任务') || userInput.includes('添加任务')) {
      response = this.generateTaskCreationResponse(lastUserMessage.content);
    } else if (userInput.includes('进度') || userInput.includes('完成') || userInput.includes('预测')) {
      response = this.generateProgressAnalysis();
    } else if (userInput.includes('风险') || userInput.includes('问题') || userInput.includes('隐患')) {
      response = this.generateRiskAssessment();
    } else if (userInput.includes('优化') || userInput.includes('建议') || userInput.includes('改进')) {
      response = this.generateOptimizationSuggestions();
    } else if (userInput.includes('资源') || userInput.includes('人员') || userInput.includes('分配')) {
      response = this.generateResourceAllocation();
    } else if (userInput.includes('成本') || userInput.includes('预算') || userInput.includes('费用')) {
      response = this.generateCostAnalysis();
    } else if (userInput.includes('帮助') || userInput.includes('功能') || userInput.includes('怎么用')) {
      response = this.generateHelpText();
    } else {
      response = this.generateGeneralResponse(lastUserMessage.content);
    }

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      content: response,
      model: 'local-mock',
    };
  }

  /**
   * 生成任务创建响应
   */
  private generateTaskCreationResponse(input: string): string {
    // 提取关键信息
    const priorities = ['高', '中', '低'];
    const priority = priorities.find(p => input.includes(p)) || '中';
    
    const durationMatch = input.match(/(\d+)\s*天/);
    const duration = durationMatch ? durationMatch[1] : '3';

    return `✅ **理解了您的需求**

我已经分析了您的任务创建请求。基于您的描述，我为您规划了以下任务：

**任务建议：**
- 📋 任务名称：根据您的描述自动生成
- 🎯 优先级：${priority === '高' ? '🔴 高' : priority === '中' ? '🟡 中' : '🟢 低'}
- ⏱️ 预计工期：${duration}天
- 👤 建议分配：根据团队负载自动推荐
- 📅 建议开始时间：${new Date(Date.now() + 86400000).toLocaleDateString('zh-CN')}

**智能分析：**
- 任务依赖：已分析相关任务依赖关系
- 资源需求：评估了所需的人员和设备
- 风险评估：识别了潜在的风险点

点击下方"创建任务"按钮即可确认创建。`;
  }

  /**
   * 生成进度分析响应
   */
  private generateProgressAnalysis(): string {
    const currentProgress = 65 + Math.floor(Math.random() * 15);
    const predictedDelay = Math.floor(Math.random() * 20) - 5;
    const confidence = 75 + Math.floor(Math.random() * 20);

    return `📊 **项目进度分析报告**

**当前状态：**
- 📈 整体进度：${currentProgress}%
- 🎯 计划进度：68%
- 📉 进度偏差：${predictedDelay > 0 ? `延后${predictedDelay}天` : `提前${Math.abs(predictedDelay)}天`}
- 🎲 预测置信度：${confidence}%

**关键发现：**
${predictedDelay > 5 ? `
⚠️ **需要关注：** 项目存在一定延期风险
- 土建施工进度 78%（正常）
- 设备安装进度 52%（落后12%）
- 调试工作进度 35%（待加速）

**建议措施：**
1. 增加设备安装团队人手
2. 优化设备安装流程
3. 提前准备调试所需资源
` : `
✅ **运行良好：** 项目按计划顺利推进
- 各阶段进度均衡
- 未发现明显瓶颈
- 团队协作高效

**优化建议：**
1. 保持当前节奏
2. 关注即将到来的关键节点
3. 提前规划下阶段工作
`}

**预计完成时间：** ${new Date(Date.now() + (90 + predictedDelay) * 86400000).toLocaleDateString('zh-CN')}`;
  }

  /**
   * 生成风险评估响应
   */
  private generateRiskAssessment(): string {
    return `⚠️ **智能风险评估报告**

**风险等级分布：**
- 🔴 高风险：2项
- 🟡 中风险：5项
- 🟢 低风险：3项

**高风险项详情：**

**1. 关键设备供货延期风险**
- 风险类型：供应链风险
- 发生概率：75%
- 影响程度：严重（可能延期15-20天）
- 缓解措施：
  • 立即联系备选供应商
  • 准备替代方案
  • 更新采购计划

**2. 专业技术人员短缺**
- 风险类型：资源风险
- 发生概率：60%
- 影响程度：较高（影响关键任务）
- 缓解措施：
  • 提前招聘储备人才
  • 安排内部培训
  • 考虑外部技术支持

**中风险项摘要：**
- 天气影响施工进度
- 设计变更可能性
- 质量检查标准调整
- 成本超支风险
- 沟通协调效率

**智能建议：**
✓ 建立风险应对预案
✓ 每周进行风险评审
✓ 加强供应商管理
✓ 提升团队应变能力`;
  }

  /**
   * 生成优化建议响应
   */
  private generateOptimizationSuggestions(): string {
    return `💡 **智能优化建议**

**资源利用分析：**
- 当前利用率：78%
- 优化潜力：15-20%
- 预期收益：节省15-20个工作日

**优化方案：**

**1. 人员配置优化** 🔥
- 现状：设计团队利用率仅55%
- 建议：将2名设计人员临时调配至施工阶段
- 预期：施工效率提升20%，成本不变

**2. 工作流程优化**
- 现状：审批流程平均耗时3天
- 建议：引入并行审批机制
- 预期：审批时间缩短至1天

**3. 采购策略优化**
- 现状：分散采购，议价能力弱
- 建议：批量采购，与供应商建立长期合作
- 预期：采购成本降低8-12%

**4. 沟通效率提升**
- 现状：信息传递存在延迟
- 建议：每日站会+即时通讯工具
- 预期：问题响应速度提升50%

**实施优先级：**
🥇 人员配置优化（立即实施）
🥈 工作流程优化（本周内）
🥉 采购策略优化（逐步推进）

**预期整体收益：**
- ⚡ 效率提升：15-20%
- 💰 成本节约：10-15%
- ⏰ 时间节省：15-20天`;
  }

  /**
   * 生成资源分配响应
   */
  private generateResourceAllocation(): string {
    return `👥 **智能资源分配方案**

**当前资源状况：**
- 设计团队：8人（利用率 55%）
- 采购团队：6人（利用率 85%）
- 施工团队：15人（利用率 92%）
- 质检团队：4人（利用率 70%）

**优化分配建议：**

**阶段一：当前-未来2周**
- 施工团队 +2人（从设计团队调配）
- 采购团队保持
- 质检团队 +1人（提前准备）

**阶段二：未来2-4周**
- 施工团队继续保持高配置
- 调试团队开始介入（3-4人）
- 设计团队逐步转向收尾工作

**关键岗位需求：**
1. 资深电气工程师 x1（紧急）
2. 机械安装技工 x2（本周内）
3. 质量检验员 x1（两周内）

**成本影响分析：**
- 当前月成本：¥450,000
- 优化后成本：¥445,000
- 预期节省：¥5,000/月
- 效率提升：18%

**智能匹配推荐：**
✓ 张工（电气）→ 设备安装指导
✓ 李工（机械）→ 施工现场管理
✓ 王工（质检）→ 过程质量把控`;
  }

  /**
   * 生成成本分析响应
   */
  private generateCostAnalysis(): string {
    return `💰 **项目成本分析报告**

**预算执行情况：**
- 总预算：¥5,000,000
- 已使用：¥3,250,000 (65%)
- 剩余预算：¥1,750,000
- 预测最终：¥4,950,000

**分项成本分析：**

**设计阶段** ✅
- 预算：¥800,000
- 实际：¥750,000
- 节余：¥50,000 (6.3%)

**采购阶段** ⚠️
- 预算：¥2,000,000
- 实际：¥1,850,000
- 进度：92.5%
- 预警：部分设备价格上涨

**施工阶段** 🔄
- 预算：¥1,800,000
- 已用：¥1,100,000
- 预测：¥1,850,000
- 超支风险：2.8%

**调试阶段** 📋
- 预算：¥400,000
- 已用：¥50,000
- 预计：¥350,000

**成本优化建议：**
1. 采购环节可谈判降价约3-5%
2. 施工材料可集中采购节约8%
3. 加强现场管理减少浪费
4. 优化人员配置降低人工成本

**风险预警：**
- 材料价格波动风险：中等
- 人工成本上涨风险：较低
- 变更导致的成本增加：需控制

**预期结果：**
在预算范围内完成项目，可能节余¥50,000-100,000`;
  }

  /**
   * 生成帮助文本
   */
  private generateHelpText(): string {
    return `🤖 **AI智能助手使用指南**

**我能帮您做什么？**

**1. 📋 任务管理**
- "创建一个高优先级的设备安装任务"
- "帮我规划下周的工作任务"
- "分析当前任务的依赖关系"

**2. 📊 进度分析**
- "分析项目进度"
- "预测完成时间"
- "识别进度瓶颈"

**3. ⚠️ 风险管理**
- "评估项目风险"
- "识别潜在问题"
- "提供风险应对建议"

**4. 💡 优化建议**
- "优化资源分配"
- "提升工作效率"
- "降低项目成本"

**5. 👥 资源管理**
- "分析人员配置"
- "推荐任务分配"
- "评估团队负载"

**快捷命令：**
- 🎯 分析项目进度
- ⚠️ 识别风险因素
- 📊 优化资源分配
- ✅ 创建任务计划

**智能特性：**
✓ 自然语言理解
✓ 上下文记忆
✓ 多轮对话
✓ 实时数据分析
✓ 智能推荐

**提示：** 您可以用自然语言描述需求，我会理解并提供专业建议。`;
  }

  /**
   * 生成通用响应
   */
  private generateGeneralResponse(input: string): string {
    const responses = [
      `我理解您的问题是关于"${input.substring(0, 30)}..."。让我为您分析一下：\n\n基于项目当前情况，我建议您可以从以下几个方面入手：\n1. 查看项目进度报告了解整体情况\n2. 关注关键路径任务的执行\n3. 及时与团队沟通协调\n\n需要更具体的建议吗？`,
      
      `收到您的消息。关于"${input.substring(0, 30)}..."这个话题，\n\n我可以帮您：\n- 📊 分析相关数据\n- 💡 提供专业建议\n- 🎯 制定行动计划\n\n请告诉我您更关注哪个方面？`,
      
      `好的，我注意到您提到了"${input.substring(0, 30)}..."。\n\n作为您的AI助手，我可以：\n✓ 提供实时数据分析\n✓ 给出优化建议\n✓ 协助决策制定\n\n您希望我从哪个角度为您分析？`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.requestCache.clear();
    logger.info('[免费AI服务] 缓存已清除');
  }
}

// 导出单例
export const freeAIService = new FreeAIService('local');

// 导出配置函数
export const configureAI = (provider: keyof typeof DEFAULT_CONFIGS, apiKey?: string) => {
  freeAIService.switchProvider(provider);
  if (apiKey) {
    freeAIService.setApiKey(apiKey);
  }
};
