/**
 * 语音输入工具
 * 提供语音识别、语音转文字功能
 */

import { message } from 'antd';
import { logger } from './EnhancedLogger';

/**
 * 语音识别选项
 */
export interface VoiceRecognitionOptions {
  lang?: string; // 语言代码，如 'zh-CN', 'en-US'
  continuous?: boolean; // 是否连续识别
  interimResults?: boolean; // 是否返回临时结果
  maxAlternatives?: number; // 最大候选数
}

/**
 * 语音识别结果
 */
export interface VoiceRecognitionResult {
  transcript: string; // 识别文本
  confidence: number; // 置信度 0-1
  isFinal: boolean; // 是否为最终结果
}

/**
 * 语音输入类
 */
export class VoiceInput {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback?: (result: VoiceRecognitionResult) => void;
  private onErrorCallback?: (error: Error) => void;
  private onEndCallback?: () => void;

  constructor() {
    this.initRecognition();
  }

  /**
   * 初始化语音识别
   */
  private initRecognition() {
    // 检查浏览器支持
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      logger.warn('[语音输入] 浏览器不支持语音识别');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.setupEventHandlers();
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers() {
    if (!this.recognition) return;

    // 识别结果
    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const result = event.results[last];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      logger.info('[语音识别] 结果', { transcript, confidence, isFinal });

      if (this.onResultCallback) {
        this.onResultCallback({
          transcript,
          confidence,
          isFinal,
        });
      }
    };

    // 识别错误
    this.recognition.onerror = (event: any) => {
      const errorMessages: Record<string, string> = {
        'no-speech': '未检测到语音',
        'audio-capture': '无法捕获音频',
        'not-allowed': '未授权使用麦克风',
        'network': '网络错误',
        'aborted': '识别已中止',
      };

      const errorMessage = errorMessages[event.error] || `识别错误: ${event.error}`;
      logger.error('[语音识别] 错误', event.error);

      if (this.onErrorCallback) {
        this.onErrorCallback(new Error(errorMessage));
      } else {
        message.error(errorMessage);
      }

      this.isListening = false;
    };

    // 识别结束
    this.recognition.onend = () => {
      logger.info('[语音识别] 结束');
      this.isListening = false;

      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    // 识别开始
    this.recognition.onstart = () => {
      logger.info('[语音识别] 开始');
      this.isListening = true;
    };
  }

  /**
   * 开始识别
   */
  start(options: VoiceRecognitionOptions = {}) {
    if (!this.recognition) {
      message.error('浏览器不支持语音识别');
      return;
    }

    if (this.isListening) {
      logger.warn('[语音识别] 已在识别中');
      return;
    }

    // 设置选项
    this.recognition.lang = options.lang || 'zh-CN';
    this.recognition.continuous = options.continuous ?? false;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.maxAlternatives = options.maxAlternatives || 1;

    try {
      this.recognition.start();
      message.info('开始语音识别，请说话...');
    } catch (error) {
      logger.error('[语音识别] 启动失败', error);
      message.error('启动语音识别失败');
    }
  }

  /**
   * 停止识别
   */
  stop() {
    if (!this.recognition || !this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
    } catch (error) {
      logger.error('[语音识别] 停止失败', error);
    }
  }

  /**
   * 中止识别
   */
  abort() {
    if (!this.recognition) {
      return;
    }

    try {
      this.recognition.abort();
      this.isListening = false;
    } catch (error) {
      logger.error('[语音识别] 中止失败', error);
    }
  }

  /**
   * 设置结果回调
   */
  onResult(callback: (result: VoiceRecognitionResult) => void) {
    this.onResultCallback = callback;
  }

  /**
   * 设置错误回调
   */
  onError(callback: (error: Error) => void) {
    this.onErrorCallback = callback;
  }

  /**
   * 设置结束回调
   */
  onEnd(callback: () => void) {
    this.onEndCallback = callback;
  }

  /**
   * 检查是否正在识别
   */
  isRecognizing(): boolean {
    return this.isListening;
  }

  /**
   * 检查浏览器支持
   */
  static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }
}

/**
 * 创建语音输入实例
 */
export const createVoiceInput = (): VoiceInput => {
  return new VoiceInput();
};

/**
 * 快速语音转文字
 */
export const voiceToText = (
  options: VoiceRecognitionOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const voice = new VoiceInput();

    voice.onResult((result) => {
      if (result.isFinal) {
        voice.stop();
        resolve(result.transcript);
      }
    });

    voice.onError((error) => {
      reject(error);
    });

    voice.start(options);
  });
};

export default VoiceInput;
