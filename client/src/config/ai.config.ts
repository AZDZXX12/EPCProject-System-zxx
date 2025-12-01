/**
 * AI服务配置
 * 支持多种AI提供商：DeepSeek、OpenAI、Claude等
 */

export interface AIProviderConfig {
  provider: 'deepseek' | 'openai' | 'claude' | 'huggingface' | 'local';
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
}

// DeepSeek配置（推荐：国内可用，性价比高）
export const DEEPSEEK_CONFIG: AIProviderConfig = {
  provider: 'deepseek',
  apiKey: process.env.REACT_APP_DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  maxTokens: 2000,
  temperature: 0.7,
  enabled: !!process.env.REACT_APP_DEEPSEEK_API_KEY,
};

// OpenAI配置
export const OPENAI_CONFIG: AIProviderConfig = {
  provider: 'openai',
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4-turbo-preview',
  maxTokens: 2000,
  temperature: 0.7,
  enabled: !!process.env.REACT_APP_OPENAI_API_KEY,
};

// Claude配置
export const CLAUDE_CONFIG: AIProviderConfig = {
  provider: 'claude',
  apiKey: process.env.REACT_APP_CLAUDE_API_KEY || '',
  baseURL: 'https://api.anthropic.com/v1',
  model: 'claude-3-sonnet-20240229',
  maxTokens: 2000,
  temperature: 0.7,
  enabled: !!process.env.REACT_APP_CLAUDE_API_KEY,
};

// Hugging Face免费配置（无需API Key）
export const HUGGINGFACE_CONFIG: AIProviderConfig = {
  provider: 'huggingface',
  apiKey: '', // 免费使用
  baseURL: 'https://api-inference.huggingface.co/models',
  model: 'facebook/bart-large-mnli',
  maxTokens: 1000,
  temperature: 0.7,
  enabled: true, // 始终可用
};

// 本地模拟配置（降级方案）
export const LOCAL_CONFIG: AIProviderConfig = {
  provider: 'local',
  apiKey: '',
  baseURL: '',
  model: 'local-rules-based',
  maxTokens: 0,
  temperature: 0,
  enabled: true, // 始终可用作为降级
};

/**
 * 获取当前激活的AI配置
 * 优先级：DeepSeek > OpenAI > Claude > HuggingFace > Local
 */
export function getActiveAIConfig(): AIProviderConfig {
  if (DEEPSEEK_CONFIG.enabled) return DEEPSEEK_CONFIG;
  if (OPENAI_CONFIG.enabled) return OPENAI_CONFIG;
  if (CLAUDE_CONFIG.enabled) return CLAUDE_CONFIG;
  if (HUGGINGFACE_CONFIG.enabled) return HUGGINGFACE_CONFIG;
  return LOCAL_CONFIG;
}

/**
 * AI功能开关
 */
export const AI_FEATURES = {
  // 自然语言任务解析
  taskParsing: true,
  // 进度预测
  progressPrediction: true,
  // 风险识别
  riskIdentification: true,
  // 资源优化
  resourceOptimization: true,
  // 智能对话
  chat: true,
  // 自动建议
  autoSuggestions: true,
};

/**
 * 提示词模板
 */
export const PROMPTS = {
  taskParsing: `你是一个专业的项目管理助手。请解析以下任务描述，提取关键信息。

任务描述：{{input}}

请以JSON格式返回，包含以下字段：
{
  "title": "简洁的任务标题（不超过50字）",
  "description": "详细的任务描述",
  "priority": "high/medium/low（根据紧急程度判断）",
  "estimatedDuration": 预计工时（小时数，整数）,
  "suggestedAssignee": "建议的负责人角色（如：前端工程师、后端工程师等）",
  "dependencies": ["依赖的任务或前置条件"],
  "tags": ["相关标签"]
}

注意：
1. 如果描述中包含"紧急"、"重要"等词，优先级设为high
2. 工时估算要合理，简单任务4-8小时，中等任务16-24小时，复杂任务40+小时
3. 只返回JSON，不要其他说明文字`,

  progressPrediction: `你是一个项目进度预测专家。请分析以下项目数据，预测完成时间。

项目数据：
{{projectData}}

请以JSON格式返回：
{
  "predictedCompletionDate": "预计完成日期（YYYY-MM-DD）",
  "confidenceLevel": 置信度（0-1之间的小数）,
  "bottlenecks": ["识别出的瓶颈问题"],
  "recommendations": ["加速项目的建议"],
  "riskFactors": ["主要风险因素"]
}`,

  riskIdentification: `你是一个项目风险管理专家。请识别以下项目的潜在风险。

项目信息：
{{projectData}}

请以JSON数组格式返回风险列表：
[
  {
    "riskLevel": "critical/high/medium/low",
    "riskType": "风险类型（如：进度风险、资源风险、技术风险等）",
    "description": "风险描述",
    "mitigation": "缓解措施",
    "probability": 发生概率（0-1）,
    "impact": 影响程度（0-1）
  }
]`,

  resourceOptimization: `你是一个资源优化专家。请分析当前资源分配，提供优化建议。

当前资源分配：
{{resourceData}}

请以JSON格式返回：
{
  "currentUtilization": 当前利用率（百分比）,
  "issues": ["发现的问题"],
  "optimizationSuggestions": ["优化建议"],
  "expectedImprovement": "预期改善效果描述",
  "costSavings": 预计节省成本（数字）
}`,

  chat: `你是一个专业的EPC项目管理助手，精通工程项目管理、进度控制、资源优化等领域。

请根据用户的问题，提供专业、准确、实用的建议。回答要：
1. 简洁明了，直击要点
2. 提供可执行的具体建议
3. 必要时给出数据支持
4. 使用专业术语但保持易懂

用户问题：{{userMessage}}`,
};

/**
 * 错误消息
 */
export const AI_ERROR_MESSAGES = {
  NO_API_KEY: '未配置AI API密钥，请在环境变量中设置',
  API_ERROR: 'AI服务调用失败，已降级到本地处理',
  RATE_LIMIT: 'AI服务请求过于频繁，请稍后再试',
  INVALID_RESPONSE: 'AI返回数据格式错误',
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
};

export default {
  DEEPSEEK_CONFIG,
  OPENAI_CONFIG,
  CLAUDE_CONFIG,
  HUGGINGFACE_CONFIG,
  LOCAL_CONFIG,
  getActiveAIConfig,
  AI_FEATURES,
  PROMPTS,
  AI_ERROR_MESSAGES,
};
