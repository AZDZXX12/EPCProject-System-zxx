import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  List, 
  Tag, 
  Progress, 
  Tooltip, 
  Tabs,
  Alert,
  Space,
  Spin,
  Badge,
  Avatar,
  Typography,
  Divider,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  RobotOutlined,
  SendOutlined,
  BulbOutlined,
  WarningOutlined,
  RocketOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  HistoryOutlined,
  StarOutlined,
  FireOutlined,
  TrophyOutlined,
  DashboardOutlined,
  ProjectOutlined,
  FileTextOutlined,
  BarChartOutlined,
  MessageOutlined,
  ApiOutlined,
  CalculatorOutlined
} from '@ant-design/icons';
import { 
  aiAssistant, 
  AITaskSuggestion, 
  AIRiskAssessment,
  AIProgressPrediction,
  AIResourceOptimization
} from '../../services/AIAssistant';
import { realAIService } from '../../services/RealAIService';
import { useLocation } from 'react-router-dom';
import { useProjectOptional } from '../../contexts/ProjectContext';
import './AIAssistantPanel.css';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any;
}

interface AIAssistantPanelProps {
  projectId?: string;
  onTaskCreate?: (task: AITaskSuggestion) => void;
  onRiskIdentified?: (risks: AIRiskAssessment[]) => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  projectId,
  onTaskCreate,
  onRiskIdentified
}) => {
  const location = useLocation();
  const projectCtx = useProjectOptional();
  const currentProject = projectCtx?.currentProject;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [predictions, setPredictions] = useState<AIProgressPrediction | null>(null);
  const [risks, setRisks] = useState<AIRiskAssessment[]>([]);
  const [optimization, setOptimization] = useState<AIResourceOptimization | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 新增状态
  const [aiProvider, setAiProvider] = useState('groq');
  const [apiKey, setApiKey] = useState('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');
  const [model, setModel] = useState('llama-3.1-8b-instant');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [exportFormat, setExportFormat] = useState('markdown');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalTokens: 0,
    avgResponseTime: 0,
    errorRate: 0
  });

  // 配置AI提供商（从本地或环境变量），并设置欢迎信息
  useEffect(() => {
    const currentCfg = realAIService.getConfig ? realAIService.getConfig() : undefined;
    if (currentCfg && currentCfg.apiKey && currentCfg.provider !== 'local') {
      // 已有在线提供商配置，避免面板重复覆盖
      const welcomeMsg: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `👋 您好！我是您的AI项目助手。\n\n已检测到在线模型：${currentCfg.provider} / ${currentCfg.model || '默认模型'}`,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
      loadInitialSuggestions();
      if (projectId) loadProjectInsights();
      return;
    }
    const lsProvider = (localStorage.getItem('ai.provider') || '').trim();
    const lsApiKey = (localStorage.getItem('ai.apiKey') || '').trim();
    const lsModel = (localStorage.getItem('ai.model') || '').trim();

    const envGroq = (process.env.REACT_APP_GROQ_API_KEY || '').trim();
    const envDeepseek = (process.env.REACT_APP_DEEPSEEK_API_KEY || '').trim();
    const envSilicon = (process.env.REACT_APP_SILICONFLOW_API_KEY || '').trim();
    const envProvider = (process.env.REACT_APP_AI_PROVIDER || '').trim().toLowerCase();
    const envModel = (process.env.REACT_APP_AI_MODEL || '').trim();
    const envApiKey = (process.env.REACT_APP_AI_API_KEY || '').trim();

    let provider: any = 'local';
    let apiKey = '';
    let model = '';
    const strictFlag = (localStorage.getItem('ai.strict') || '1').trim();
    const strict = !(strictFlag === '0' || strictFlag.toLowerCase() === 'false');

    if (envProvider && envApiKey) {
      // 通用环境变量优先
      provider = envProvider as any;
      apiKey = envApiKey;
      if (envModel) {
        model = envModel;
      } else {
        // 根据provider选择合理的默认模型
        if (envProvider === 'groq') model = 'llama-3.1-8b-instant';
        else if (envProvider === 'deepseek') model = 'deepseek-chat';
        else if (envProvider === 'siliconflow') model = 'Qwen/Qwen2.5-7B-Instruct';
        else if (envProvider === 'qwen') model = 'qwen-turbo';
        else if (envProvider === 'yi') model = 'yi-lightning';
      }
    } else if (envDeepseek) {
      provider = 'deepseek';
      apiKey = envDeepseek;
      model = 'deepseek-chat';
    } else if (envSilicon) {
      provider = 'siliconflow';
      apiKey = envSilicon;
      model = 'Qwen/Qwen2.5-7B-Instruct';
    } else if (envGroq) {
      provider = 'groq';
      apiKey = envGroq;
      model = 'llama-3.1-8b-instant';
    } else if (lsProvider && lsApiKey && lsProvider !== 'local') {
      provider = lsProvider as any;
      apiKey = lsApiKey;
      model = lsModel;
    } else {
      provider = 'local';
    }

    realAIService.configure({ provider, apiKey, model, strict });

    // 添加欢迎消息
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `👋 您好！我是您的AI项目助手。

我已根据您的环境自动选择最合适的AI提供商：${provider}
• 模型：${model || '内置本地智能'}
• 说明：如需切换，请在浏览器localStorage设置 ai.provider/ai.apiKey/ai.model

我擅长：
• 🎯 智能分析项目进度和预测完成时间
• ⚠️ 实时识别项目风险并提供解决方案
• 💡 提供资源优化和效率提升建议
• ✅ 自动创建和分解复杂任务
• 📊 生成数据洞察和可视化报告

请告诉我您需要什么帮助，或选择下方的快捷命令开始！`,
      timestamp: new Date()
    };
    setMessages([welcomeMsg]);
    
    // 初始化时获取智能建议
    loadInitialSuggestions();
    if (projectId) {
      loadProjectInsights();
    }
  }, [projectId]);

  // 将业务上下文喂给AI以增强“聪明度”
  useEffect(() => {
    const pid = projectId || currentProject?.id;
    realAIService.setContext({
      projectId: pid,
      currentProjectName: currentProject?.name,
      currentRoute: location.pathname,
    });
  }, [projectId, currentProject?.id, currentProject?.name, location.pathname]);

  useEffect(() => {
    // 自动滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadInitialSuggestions = async () => {
    const contextSuggestions = await aiAssistant.getSmartSuggestions('general');
    setSuggestions(contextSuggestions);
  };

  const loadProjectInsights = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // 并行加载所有AI分析
      const [progressPred, riskAssess, resourceOpt] = await Promise.all([
        aiAssistant.predictProjectProgress(projectId),
        aiAssistant.identifyRisks(projectId),
        aiAssistant.optimizeResources(projectId)
      ]);

      setPredictions(progressPred);
      setRisks(riskAssess);
      setOptimization(resourceOpt);

      if (onRiskIdentified && riskAssess.length > 0) {
        onRiskIdentified(riskAssess);
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setLoading(true);

    try {
      // 使用真正的AI服务进行对话
      const response = await realAIService.chat(userInput);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        data: response
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 学习用户行为
      aiAssistant.learnFromUserAction('chat', { input: userInput, response: response.message });

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '抱歉，AI响应失败了。请稍后再试或检查网络连接。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    // 直接发送消息，不依赖state更新
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: action,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await realAIService.chat(action);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        data: response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '抱歉，AI响应失败了。请稍后再试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderRiskLevel = (level: string) => {
    const colors: Record<string, string> = {
      critical: 'red',
      high: 'orange',
      medium: 'gold',
      low: 'green'
    };
    return <Tag color={colors[level]}>{level.toUpperCase()}</Tag>;
  };

  const renderChatTab = () => (
    <div className="ai-chat-container">
      <div className="messages-list">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            <Avatar 
              icon={message.type === 'assistant' ? <RobotOutlined /> : null}
              className={`avatar-${message.type}`}
            >
              {message.type === 'user' ? 'U' : null}
            </Avatar>
            <div className="message-content">
              <Text>{message.content}</Text>
              {message.data && (
                <Card size="small" className="task-suggestion-card">
                  <Space direction="vertical" className="full-width">
                    <Text strong>{message.data.title}</Text>
                    <Text type="secondary">{message.data.description}</Text>
                    <Space>
                      <Tag color={message.data.priority === 'high' ? 'red' : message.data.priority === 'medium' ? 'orange' : 'green'}>
                        {message.data.priority === 'high' ? '高' : message.data.priority === 'medium' ? '中' : '低'}优先级
                      </Tag>
                      <Tag icon={<ClockCircleOutlined />}>
                        {message.data.estimatedDuration}h
                      </Tag>
                      <Tag>
                        置信度: {(message.data.confidence * 100).toFixed(0)}%
                      </Tag>
                    </Space>
                    {onTaskCreate && (
                      <Button 
                        type="primary" 
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => onTaskCreate(message.data)}
                      >
                        创建任务
                      </Button>
                    )}
                  </Space>
                </Card>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <div className="message-content">
              <Spin size="small" /> 思考中...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        <Text type="secondary">快速操作：</Text>
        <Space wrap>
          <Button size="small" onClick={() => handleQuickAction('创建一个系统测试的高优先级任务')}>
            系统测试
          </Button>
          <Button size="small" onClick={() => handleQuickAction('安排设计评审会议')}>
            设计评审
          </Button>
          <Button size="small" onClick={() => handleQuickAction('分析当前项目风险')}>
            风险分析
          </Button>
        </Space>
      </div>

      <div className="input-area">
        <TextArea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={e => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="用自然语言描述任务... (例如：'创建一个紧急任务修复登录问题')"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          loading={loading}
          disabled={!inputValue.trim()}
        >
          发送
        </Button>
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="ai-insights-container">
      {loading ? (
        <div className="ai-loading-container">
          <Spin size="large" />
          <Text className="loading-text">正在分析项目数据...</Text>
        </div>
      ) : (
        <Space direction="vertical" className="full-width" size="large">
          {/* Progress Prediction */}
          {predictions && (
            <Card 
              title={
                <Space>
                  <LineChartOutlined />
                  <span>📈 进度预测</span>
                </Space>
              }
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="预计完成时间"
                    value={predictions.predictedCompletionDate.toLocaleDateString()}
                    prefix={<CalendarOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="预测置信度"
                    value={predictions?.confidenceLevel ? Math.round(predictions.confidenceLevel * 100) : 85}
                    suffix="%"
                    prefix={<ThunderboltOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Progress
                    type="circle"
                    percent={predictions?.confidenceLevel ? Math.round(predictions.confidenceLevel * 100) : 85}
                    size={80}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </Col>
              </Row>
              
              <Divider />
              
              <Title level={5}>⚠️ 进度瓶颈</Title>
              <List
                size="small"
                dataSource={predictions.bottlenecks}
                renderItem={item => (
                  <List.Item>
                    <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    {item}
                  </List.Item>
                )}
              />
              
              <Title level={5} style={{ marginTop: 16 }}>💡 改进建议</Title>
              <List
                size="small"
                dataSource={predictions.recommendations}
                renderItem={item => (
                  <List.Item>
                    <BulbOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    {item}
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Resource Optimization */}
          {optimization && (
            <Card 
              title={
                <Space>
                  <TeamOutlined />
                  <span>👥 资源优化</span>
                </Space>
              }
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="当前利用率"
                    value={optimization.currentUtilization}
                    suffix="%"
                    valueStyle={{ color: optimization.currentUtilization > 80 ? '#cf1322' : '#3f8600' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="潜在节省"
                    value={optimization.costSavings}
                    prefix="￥"
                    precision={0}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="效率提升"
                    value={optimization.efficiencyGain}
                    suffix="%"
                    prefix={<RocketOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Progress
                    type="dashboard"
                    percent={optimization.currentUtilization}
                    size={80}
                  />
                </Col>
              </Row>
              
              {optimization.efficiencyGain > 0 && (
                <Alert
                  message="🚀 优化机会"
                  description={`重新分配资源可以将效率提升 ${optimization.efficiencyGain}%，节省成本 ￥${optimization.costSavings.toLocaleString()}`}
                  type="success"
                  showIcon
                  className="optimization-alert"
                />
              )}
            </Card>
          )}
        </Space>
      )}
    </div>
  );

  const renderRisksTab = () => (
    <div className="ai-risks-container">
      {loading ? (
        <div className="ai-loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <List
          dataSource={risks}
          renderItem={(risk: AIRiskAssessment) => (
            <Card 
              size="small" 
              className="risk-card"
              title={
                <Space>
                  <WarningOutlined className={`risk-icon-${risk.riskLevel}`} />
                  <span>{risk.riskType}</span>
                  {renderRiskLevel(risk.riskLevel)}
                </Space>
              }
            >
              <Space direction="vertical" className="full-width">
                <Paragraph>{risk.description}</Paragraph>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">发生概率</Text>
                    <Progress 
                      percent={risk.probability * 100} 
                      size="small"
                      strokeColor={risk.probability > 0.7 ? '#ff4d4f' : '#faad14'}
                    />
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">影响程度</Text>
                    <Progress 
                      percent={risk.impact * 100} 
                      size="small"
                      strokeColor={risk.impact > 0.7 ? '#ff4d4f' : '#faad14'}
                    />
                  </Col>
                </Row>
                
                <Alert
                  message="🛡️ 缓解策略"
                  description={risk.mitigation}
                  type="info"
                  showIcon
                  icon={<SafetyOutlined />}
                />
              </Space>
            </Card>
          )}
        />
      )}
    </div>
  );

  const renderSuggestionsTab = () => (
    <div className="ai-suggestions-container">
      <Card title="💡 AI智能建议">
        <List
          dataSource={suggestions}
          renderItem={(suggestion: string) => (
            <List.Item>
              <Space>
                <BulbOutlined className="suggestion-icon" />
                <Text>{suggestion}</Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>
      
      <Card title="⚡ 快捷模板" className="quick-templates-card">
        <Space direction="vertical" className="full-width">
          <Button 
            block 
            onClick={() => handleQuickAction('创建下一迭代的迭代规划任务')}
          >
            📋 迭代规划模板
          </Button>
          <Button 
            block 
            onClick={() => handleQuickAction('生成本周的工作报告')}
          >
            📊 周报模板
          </Button>
          <Button 
            block 
            onClick={() => handleQuickAction('设置质量保障检查清单')}
          >
            ✅ 质量检查清单
          </Button>
          <Button 
            block 
            onClick={() => handleQuickAction('创建部署准备任务')}
          >
            🚀 部署准备
          </Button>
        </Space>
      </Card>
    </div>
  );

  return (
    <Card 
      className="ai-assistant-panel"
      title={
        <Space>
          <RobotOutlined className="ai-icon-large" />
          <Title level={4} className="ai-title">智能助手</Title>
          <Badge status="processing" text="在线" />
        </Space>
      }
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'chat',
            label: (
              <span>
                <RobotOutlined />
                智能对话
              </span>
            ),
            children: renderChatTab()
          },
          {
            key: 'insights',
            label: (
              <span>
                <LineChartOutlined />
                项目洞察
              </span>
            ),
            children: renderInsightsTab()
          },
          {
            key: 'risks',
            label: (
              <span>
                <WarningOutlined />
                风险识别
                {risks.length > 0 && (
                  <Badge count={risks.length} className="risk-badge" />
                )}
              </span>
            ),
            children: renderRisksTab()
          },
          {
            key: 'suggestions',
            label: (
              <span>
                <BulbOutlined />
                智能建议
              </span>
            ),
            children: renderSuggestionsTab()
          }
        ]}
      />
    </Card>
  );
};

// 补充缺失的图标导入
const CalendarOutlined = () => <ClockCircleOutlined />;

export default AIAssistantPanel;
