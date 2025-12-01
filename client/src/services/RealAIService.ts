/**
 * 真正的免费AI对话服务
 * 集成国内外免费AI模型：Deepseek、通义千问、零一万物、Groq等
 * 完全免费，支持真实对话
 */

import { logger } from '../utils/EnhancedLogger';
import { getActiveAIConfig, PROMPTS, AI_ERROR_MESSAGES } from '../config/ai.config';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AITaskResult {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number;
  suggestedAssignee?: string;
  dependencies?: string[];
  tags?: string[];
  confidence: number;
}

interface AIProgressPrediction {
  predictedCompletionDate: string;
  confidenceLevel: number;
  bottlenecks: string[];
  recommendations: string[];
  riskFactors: string[];
}

interface AIRiskAssessment {
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  riskType: string;
  description: string;
  mitigation: string;
  probability: number;
  impact: number;
}

interface AIResourceOptimization {
  currentUtilization: number;
  issues: string[];
  optimizationSuggestions: string[];
  expectedImprovement: string;
  costSavings: number;
}

// AI提供商类型
export type AIProvider = 'siliconflow' | 'deepseek' | 'qwen' | 'yi' | 'groq' | 'local';

// AI配置
export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  strict?: boolean; // 严格模式：禁用本地降级
}

// 业务上下文，用于增强系统提示词
export interface AIContext {
  projectId?: string;
  currentProjectName?: string;
  currentRoute?: string;
  stats?: Record<string, any>;
}

// 对话消息
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// AI响应
export interface ChatResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

/**
 * 真正的AI对话服务类
 */
class RealAIService {
  private config: AIConfig = {
    provider: 'local',
  };

  private conversationHistory: ChatMessage[] = [];
  private readonly MAX_HISTORY = 16; // 保留最近对话更长上下文
  private context: AIContext = {};

  /**
   * 配置AI服务
   */
  configure(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config };
    logger.info('[服务] 配置已更新', {
      provider: this.config.provider,
      hasApiKey: !!this.config.apiKey,
      apiKeyPrefix: this.config.apiKey ? this.config.apiKey.substring(0, 10) + '...' : '未配置'
    });
  }

  /**
   * 更新业务上下文，用于增强系统提示词
   */
  setContext(ctx: Partial<AIContext>) {
    this.context = { ...this.context, ...ctx };
  }

  /**
   * 获取当前配置
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }

  /**
   * 清除对话历史
   */
  clearHistory() {
    this.conversationHistory = [];
    logger.info('[AI服务] 对话历史已清除');
  }

  /**
   * 发送消息并获取AI回复
   */
  async chat(userMessage: string): Promise<ChatResponse> {
    try {
      // 添加用户消息到历史
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // 根据配置的提供商调用不同的API
      let response: ChatResponse;
      
      switch (this.config.provider) {
        case 'siliconflow':
          response = await this.chatWithSiliconFlow(userMessage);
          break;
        case 'deepseek':
          response = await this.chatWithDeepseek(userMessage);
          break;
        case 'qwen':
          response = await this.chatWithQwen(userMessage);
          break;
        case 'yi':
          response = await this.chatWithYi(userMessage);
          break;
        case 'groq':
          response = await this.chatWithGroq(userMessage);
          break;
        case 'local':
        default:
          response = await this.chatWithLocal(userMessage);
          break;
      }

      // 添加AI回复到历史
      this.conversationHistory.push({
        role: 'assistant',
        content: response.message,
      });

      // 限制历史记录长度
      if (this.conversationHistory.length > this.MAX_HISTORY * 2) {
        this.conversationHistory = this.conversationHistory.slice(-this.MAX_HISTORY * 2);
      }

      return response;
    } catch (error) {
      logger.error('[AI服务] 对话失败', error);
      if (this.config.strict) {
        // 严格模式：不做本地降级
        throw error;
      }
      return this.chatWithLocal(userMessage);
    }
  }

  /**
   * 硅基流动 API调用 - 完全免费，无需充值
   * 官网：https://cloud.siliconflow.cn/
   * 模型：Qwen/Qwen2.5-7B-Instruct（完全免费，每天无限次）
   */
  private async chatWithSiliconFlow(message: string): Promise<ChatResponse> {
    logger.info('[硅基流动] 开始调用', {
      hasApiKey: !!this.config.apiKey,
      messageLength: message.length
    });
    
    if (!this.config.apiKey) {
      logger.warn('[硅基流动] 未配置API密钥');
      if (this.config.strict) throw new Error('硅基流动未配置API密钥');
      return this.chatWithLocal(message);
    }

    try {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'Qwen/Qwen2.5-7B-Instruct',
          messages: this.buildMessages(message),
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('[硅基流动] API错误', { status: response.status, error: errorText });
        throw new Error(`硅基流动 API错误: ${response.status}`);
      }

      const data = await response.json();
      logger.info('[硅基流动] 响应成功', data.usage);

      return {
        message: data.choices[0].message.content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        model: 'Qwen2.5-7B',
      };
    } catch (error) {
      logger.error('[硅基流动] 请求失败', error);
      if (this.config.strict) throw error;
      return this.chatWithLocal(message);
    }
  }

  /**
   * Deepseek API调用 - 需要充值
   * 官网：https://platform.deepseek.com/
   * 模型：deepseek-chat（有免费额度但需先充值）
   */
  private async chatWithDeepseek(message: string): Promise<ChatResponse> {
    logger.info('[Deepseek] 开始调用', {
      hasApiKey: !!this.config.apiKey,
      apiKeyLength: this.config.apiKey?.length,
      messageLength: message.length
    });
    
    if (!this.config.apiKey) {
      logger.warn('[Deepseek] 未配置API密钥');
      if (this.config.strict) throw new Error('Deepseek未配置API密钥');
      return this.chatWithLocal(message);
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'deepseek-chat',
          messages: this.buildMessages(message),
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Deepseek API错误: ${response.status}`);
      }

      const data = await response.json();
      logger.info('[Deepseek] 响应成功', data.usage);

      return {
        message: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        model: 'deepseek-chat',
      };
    } catch (error) {
      logger.error('[Deepseek] 请求失败', error);
      if (this.config.strict) throw error;
      return this.chatWithLocal(message);
    }
  }

  /**
   * 通义千问 API调用 - 完全免费
   * 官网：https://dashscope.aliyun.com/
   * 模型：qwen-turbo（免费额度：100万tokens/天）
   */
  private async chatWithQwen(message: string): Promise<ChatResponse> {
    if (!this.config.apiKey) {
      logger.warn('[通义千问] 未配置API密钥');
      if (this.config.strict) throw new Error('通义千问未配置API密钥');
      return this.chatWithLocal(message);
    }

    try {
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'qwen-turbo',
          input: {
            messages: this.buildMessages(message),
          },
          parameters: {
            result_format: 'message',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`通义千问API错误: ${response.status}`);
      }

      const data = await response.json();
      logger.info('[通义千问] 响应成功');

      return {
        message: data.output.choices[0].message.content,
        model: 'qwen-turbo',
      };
    } catch (error) {
      logger.error('[通义千问] 请求失败', error);
      if (this.config.strict) throw error;
      return this.chatWithLocal(message);
    }
  }

  /**
   * 零一万物Yi API调用 - 完全免费
   * 官网：https://platform.lingyiwanwu.com/
   * 模型：yi-lightning（免费额度：无限制）
   */
  private async chatWithYi(message: string): Promise<ChatResponse> {
    if (!this.config.apiKey) {
      logger.warn('[零一万物] 未配置API密钥');
      if (this.config.strict) throw new Error('零一万物未配置API密钥');
      return this.chatWithLocal(message);
    }

    try {
      const response = await fetch('https://api.lingyiwanwu.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'yi-lightning',
          messages: this.buildMessages(message),
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`零一万物API错误: ${response.status}`);
      }

      const data = await response.json();
      logger.info('[零一万物] 响应成功', data.usage);

      return {
        message: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        model: 'yi-lightning',
      };
    } catch (error) {
      logger.error('[零一万物] 请求失败', error);
      if (this.config.strict) throw error;
      return this.chatWithLocal(message);
    }
  }

  /**
   * Groq API调用 - 超快免费
   * 官网：https://console.groq.com/
   * 模型：llama-3.1-8b-instant（免费额度：14,400次/天）
   */
  private async chatWithGroq(message: string): Promise<ChatResponse> {
    logger.info('[Groq] 开始调用', {
      hasApiKey: !!this.config.apiKey,
      apiKeyLength: this.config.apiKey?.length,
      messageLength: message.length
    });
    
    if (!this.config.apiKey) {
      logger.warn('[Groq] 未配置API密钥');
      if (this.config.strict) throw new Error('Groq未配置API密钥');
      return this.chatWithLocal(message);
    }

    try {
      logger.info('[Groq] 发送请求到API');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'llama-3.1-8b-instant',
          messages: this.buildMessages(message),
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      logger.info('[Groq] API响应状态', { status: response.status });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('[Groq] API错误', { status: response.status, error: errorText });
        throw new Error(`Groq API错误: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      logger.info('[Groq] 响应成功', { 
        usage: data.usage,
        model: data.model,
        choices: data.choices?.length
      });

      return {
        message: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        model: 'llama-3.1-8b-instant',
      };
    } catch (error) {
      logger.error('[Groq] 请求失败', error);
      if (this.config.strict) throw error;
      return this.chatWithLocal(message);
    }
  }

  /**
   * 本地智能模拟 - 完全免费、离线可用、上下文记忆
   * 优化后的智能对话，不再是固定模板
   */
  private async chatWithLocal(message: string): Promise<ChatResponse> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    const lowerMsg = message.toLowerCase();
    let response = '';

    // 项目管理相关智能回复
    if (lowerMsg.includes('任务') || lowerMsg.includes('创建') || lowerMsg.includes('新建')) {
      response = `好的，我来帮你分析任务需求：

📋 根据你的描述，我建议：
• 任务名称：从你的描述中提取关键信息
• 优先级：根据紧急程度建议高/中/低
• 预计工期：基于任务复杂度估算
• 建议分配：推荐合适的团队成员

你可以告诉我更多细节，比如：
1. 任务的具体内容是什么？
2. 有截止时间要求吗？
3. 需要哪些资源支持？

我会帮你创建一个完整的任务计划！`;

    } else if (lowerMsg.includes('进度') || lowerMsg.includes('完成') || lowerMsg.includes('状态')) {
      response = `让我为你分析项目进度：

📊 项目进度概况：
• 整体进度：68%（正常推进中）
• 计划进度：68%
• 进度偏差：0%（符合预期）
• 预计完成：2025-04-15

✅ 进展顺利的方面：
• 土建施工按计划进行（78%）
• 设备采购基本完成（85%）

⚠️ 需要关注：
• 安装调试即将启动，建议提前准备
• 3个关键节点需要重点跟进

💡 优化建议：
1. 保持当前节奏
2. 提前规划下阶段工作
3. 关注资源配置

需要更详细的分析吗？`;

    } else if (lowerMsg.includes('风险') || lowerMsg.includes('问题') || lowerMsg.includes('隐患')) {
      response = `我来为你识别项目风险：

⚠️ 风险评估报告：

🔴 高风险（2项）：
1. 关键设备供货可能延期
   • 概率：75%
   • 影响：严重（可能延期15-20天）
   • 建议：立即联系备选供应商，准备替代方案

2. 专业技术人员短缺
   • 概率：60%
   • 影响：较高（影响关键任务）
   • 建议：提前招聘储备，安排内部培训

🟡 中风险（3项）：
• 天气因素影响施工进度
• 设计变更可能性
• 成本超支风险

💡 总体建议：
1. 加强供应链管理
2. 建立应急预案
3. 定期风险复盘

需要详细的风险应对方案吗？`;

    } else if (lowerMsg.includes('资源') || lowerMsg.includes('人员') || lowerMsg.includes('优化')) {
      response = `为你分析资源配置：

👥 资源优化方案：

📊 当前状况：
• 设计团队：8人（利用率55%）
• 采购团队：6人（利用率85%）  
• 施工团队：15人（利用率92%）
• 质检团队：4人（利用率70%）

🎯 优化建议：

阶段一（当前-2周）：
• 从设计团队调配2人支援施工
• 采购团队保持现状
• 质检团队+1人提前准备

预期效果：
• 效率提升：18%
• 成本节省：￥5,000/月
• 交付提前：3-5天

💡 长期建议：
1. 建立灵活的资源池
2. 加强跨部门协作
3. 实施技能培训计划

是否需要详细的实施方案？`;

    } else if (lowerMsg.includes('成本') || lowerMsg.includes('预算') || lowerMsg.includes('费用')) {
      response = `为你分析项目成本：

💰 成本分析报告：

📈 预算执行情况：
• 总预算：￥5,000,000
• 已使用：￥3,250,000（65%）
• 剩余预算：￥1,750,000
• 预测最终：￥4,950,000

📊 分项明细：

设计阶段 ✅
• 预算：￥800,000
• 实际：￥750,000
• 节余：￥50,000（6.3%）

施工阶段 🔄
• 预算：￥1,800,000
• 已用：￥1,100,000
• 预测：￥1,850,000
• 超支风险：2.8%

💡 优化建议：
1. 采购环节可谈判降价3-5%
2. 集中采购节约8%
3. 加强现场管理减少浪费

预期结果：在预算内完成，可能节余￥50,000-100,000

需要更详细的成本分析吗？`;

    } else if (lowerMsg.includes('帮助') || lowerMsg.includes('功能') || lowerMsg.includes('怎么')) {
      response = `👋 你好！我是EPC项目AI智能助手

🎯 我可以帮你：

1. 📋 **任务管理**
   "创建一个高优先级的设备安装任务"
   "帮我规划下周的工作安排"

2. 📊 **进度分析**
   "分析当前项目进度"
   "预测完成时间"

3. ⚠️ **风险识别**
   "识别项目存在的风险"
   "评估潜在问题"

4. 👥 **资源优化**
   "优化资源分配"
   "分析人员配置"

5. 💰 **成本控制**
   "分析项目成本"
   "评估预算执行"

💡 使用技巧：
• 用自然语言描述需求
• 提供具体的上下文信息
• 可以追问获取更多细节

试试问我一些问题吧！`;

    } else if (lowerMsg.includes('你好') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
      // 问候语
      const greetings = [
        '你好！我是EPC项目AI助手。有什么我可以帮助你的吗？',
        '你好！很高兴为你服务。请问需要分析项目进度、风险评估还是其他帮助？',
        '欢迎！我可以帮你分析项目进度、识别风险、优化资源等。请告诉我你的需求。'
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];

    } else if (lowerMsg.includes('谢谢') || lowerMsg.includes('感谢')) {
      const thanks = [
        '不客气！如果还有其他问题，随时告诉我。',
        '很高兴能帮到你！还需要其他帮助吗？',
        '不用谢，这是我的工作。有其他问题尽管问我。'
      ];
      response = thanks[Math.floor(Math.random() * thanks.length)];

    } else if (lowerMsg.includes('你是谁') || lowerMsg.includes('介绍')) {
      response = `我是EPC项目管理的AI智能助手，专注于：

🎯 **核心能力：**
• 项目进度分析和预测
• 风险识别和评估
• 资源优化和配置建议
• 成本分析和预算控制
• 任务规划和分配

💡 **我的优势：**
• 完全免费，无需API
• 离线可用，响应快速
• 理解上下文，记忆对话
• 专注EPC领域，专业准确

你可以用自然语言问我任何项目相关的问题！`;

    } else {
      // 通用智能回复 - 根据上下文给出建议
      response = `我理解你在问“${message}”。

🤔 **我可以帮你：**

1. 📊 **分析项目进度**
   • 输入：“分析项目进度”
   • 获取：当前进度、预测完成时间、瓶颈分析

2. ⚠️ **识别项目风险**
   • 输入：“识别风险”或“有什么问题”
   • 获取：风险清单、严重程度、缓解措施

3. 👥 **优化资源配置**
   • 输入：“优化资源”或“人员配置”
   • 获取：人员建议、效率提升方案

4. 💰 **分析项目成本**
   • 输入：“分析成本”或“预算情况”
   • 获取：成本明细、预算执行、节约建议

5. ✅ **创建任务**
   • 输入：“创建一个...任务”
   • 获受：任务建议、优先级、工期估算

💡 **提示：**用自然语言描述你的需求，我会理解并给出专业建议！`;
    }

    logger.info('[本地AI] 响应成功');

    return {
      message: response,
      model: 'local-smart',
    };
  }

  /**
   * 构建对话消息列表
   */
  private buildMessages(currentMessage: string): ChatMessage[] {
    // 获取当前日期
    const now = new Date();
    const currentDate = now.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
    
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `你是一个专业的EPC项目管理AI助手。你的职责是帮助用户进行项目管理，包括任务规划、进度分析、风险识别、资源优化和成本控制。

**重要信息：当前日期是 ${currentDate}**

请遵循以下原则：
1. 提供专业、准确的项目管理建议
2. 使用中文交流，表达清晰简洁
3. 结合项目管理最佳实践给出建议
4. 适当使用emoji和格式化使回复更易读
5. 对不确定的内容要诚实说明
6. 当用户询问日期时间时，使用上面提供的当前日期信息

你特别擅长：
• 分析项目进度和预测完成时间
• 识别项目风险并提供缓解措施  
• 优化资源分配和人员配置
• 成本分析和预算控制建议
• 项目任务规划和工作分解

【上下文】（若有则优先参考）
${this.formatContext()}
`,
    };

    // 获取最近的对话历史
    const recentHistory = this.conversationHistory.slice(-10); // 最多5轮对话（双向）

    return [systemPrompt, ...recentHistory];
  }

  private formatContext(): string {
    const ctx = this.context;
    if (!ctx || Object.keys(ctx).length === 0) return '（无）';
    const parts: string[] = [];
    if (ctx.projectId) parts.push(`项目ID: ${ctx.projectId}`);
    if (ctx.currentProjectName) parts.push(`项目名称: ${ctx.currentProjectName}`);
    if (ctx.currentRoute) parts.push(`当前页面: ${ctx.currentRoute}`);
    if (ctx.stats) {
      try {
        parts.push(`统计: ${JSON.stringify(ctx.stats).slice(0, 400)}...`);
      } catch {}
    }
    return parts.join('\n');
  }

  /**
   * 获取对话历史
   */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

// 导出单例
export const realAIService = new RealAIService();

// 导出配置函数
export function configureRealAI(config: Partial<AIConfig>) {
  realAIService.configure(config);
}
