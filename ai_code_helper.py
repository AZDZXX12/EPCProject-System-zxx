#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI代码助手 - 使用Gemini API读取和修改本地代码
支持多种AI提供商：Gemini、OpenAI、Anthropic等
"""

import os
import sys
import json
import requests
from pathlib import Path

# ==================== 配置区域 ====================
# 请在这里填入你的API Key
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"  # 从 https://makersuite.google.com/app/apikey 获取
OPENAI_API_KEY = ""  # 可选
ANTHROPIC_API_KEY = ""  # 可选

# 选择AI提供商: 'gemini', 'openai', 'anthropic'
AI_PROVIDER = "gemini"

# Gemini API配置
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

# 项目根目录（默认为脚本所在目录）
PROJECT_ROOT = Path(__file__).parent
# ==================================================


class AICodeHelper:
    """AI代码助手类"""
    
    def __init__(self, provider="gemini"):
        self.provider = provider
        self.api_key = self._get_api_key()
        
    def _get_api_key(self):
        """获取对应提供商的API Key"""
        if self.provider == "gemini":
            return GEMINI_API_KEY
        elif self.provider == "openai":
            return OPENAI_API_KEY
        elif self.provider == "anthropic":
            return ANTHROPIC_API_KEY
        else:
            raise ValueError(f"不支持的AI提供商: {self.provider}")
    
    def read_file(self, file_path):
        """读取文件内容"""
        try:
            full_path = PROJECT_ROOT / file_path
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            print(f"✅ 成功读取文件: {file_path}")
            print(f"📄 文件大小: {len(content)} 字符")
            return content
        except Exception as e:
            print(f"❌ 读取文件失败: {e}")
            return None
    
    def write_file(self, file_path, content):
        """写入文件内容"""
        try:
            full_path = PROJECT_ROOT / file_path
            # 备份原文件
            if full_path.exists():
                backup_path = str(full_path) + ".backup"
                with open(full_path, 'r', encoding='utf-8') as f:
                    backup_content = f.read()
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(backup_content)
                print(f"💾 已备份原文件到: {backup_path}")
            
            # 写入新内容
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ 成功写入文件: {file_path}")
            return True
        except Exception as e:
            print(f"❌ 写入文件失败: {e}")
            return False
    
    def call_gemini_api(self, prompt):
        """调用Gemini API"""
        try:
            url = f"{GEMINI_API_URL}?key={self.api_key}"
            
            headers = {
                "Content-Type": "application/json"
            }
            
            data = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 8000,
                }
            }
            
            print("🤖 正在调用Gemini API...")
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and len(result['candidates']) > 0:
                    text = result['candidates'][0]['content']['parts'][0]['text']
                    print("✅ API调用成功")
                    return text
                else:
                    print("❌ API返回格式错误")
                    return None
            else:
                print(f"❌ API调用失败: {response.status_code}")
                print(f"错误信息: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ API调用异常: {e}")
            return None
    
    def analyze_code(self, file_path):
        """分析代码文件"""
        content = self.read_file(file_path)
        if not content:
            return
        
        prompt = f"""请分析以下代码文件：

文件路径: {file_path}

代码内容:
```
{content}
```

请提供：
1. 代码功能概述
2. 主要组件/函数说明
3. 潜在问题或改进建议
4. 代码质量评分（1-10分）
"""
        
        result = self.call_gemini_api(prompt)
        if result:
            print("\n" + "="*60)
            print("📊 代码分析结果:")
            print("="*60)
            print(result)
            print("="*60 + "\n")
    
    def modify_code(self, file_path, instruction):
        """根据指令修改代码"""
        content = self.read_file(file_path)
        if not content:
            return
        
        prompt = f"""请根据以下指令修改代码：

文件路径: {file_path}

当前代码:
```
{content}
```

修改指令: {instruction}

请直接返回修改后的完整代码，不要添加任何解释或markdown标记。
"""
        
        result = self.call_gemini_api(prompt)
        if result:
            # 清理可能的markdown代码块标记
            result = result.strip()
            if result.startswith("```"):
                lines = result.split("\n")
                result = "\n".join(lines[1:-1]) if len(lines) > 2 else result
            
            print("\n" + "="*60)
            print("📝 修改后的代码:")
            print("="*60)
            print(result[:500] + "..." if len(result) > 500 else result)
            print("="*60 + "\n")
            
            # 询问是否保存
            save = input("是否保存修改后的代码？(y/n): ").strip().lower()
            if save == 'y':
                if self.write_file(file_path, result):
                    print("✅ 代码已成功修改并保存！")
                else:
                    print("❌ 保存失败")
            else:
                print("❌ 已取消保存")
    
    def chat_about_code(self, file_path, question):
        """关于代码的问答"""
        content = self.read_file(file_path)
        if not content:
            return
        
        prompt = f"""关于以下代码文件：

文件路径: {file_path}

代码内容:
```
{content}
```

问题: {question}

请详细回答。
"""
        
        result = self.call_gemini_api(prompt)
        if result:
            print("\n" + "="*60)
            print("💬 AI回答:")
            print("="*60)
            print(result)
            print("="*60 + "\n")


def print_menu():
    """打印菜单"""
    print("\n" + "="*60)
    print("🤖 AI代码助手 - 使用Gemini API")
    print("="*60)
    print("1. 分析代码文件")
    print("2. 修改代码文件")
    print("3. 关于代码的问答")
    print("4. 读取文件内容")
    print("5. 退出")
    print("="*60)


def main():
    """主函数"""
    # 检查API Key
    if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        print("❌ 错误: 请先在脚本中配置你的Gemini API Key")
        print("📝 获取地址: https://makersuite.google.com/app/apikey")
        return
    
    helper = AICodeHelper(provider=AI_PROVIDER)
    
    print(f"✅ AI代码助手已启动")
    print(f"📁 项目根目录: {PROJECT_ROOT}")
    print(f"🤖 使用AI提供商: {AI_PROVIDER.upper()}")
    
    while True:
        print_menu()
        choice = input("请选择功能 (1-5): ").strip()
        
        if choice == "1":
            file_path = input("请输入文件路径（相对于项目根目录）: ").strip()
            helper.analyze_code(file_path)
            
        elif choice == "2":
            file_path = input("请输入文件路径（相对于项目根目录）: ").strip()
            instruction = input("请输入修改指令: ").strip()
            helper.modify_code(file_path, instruction)
            
        elif choice == "3":
            file_path = input("请输入文件路径（相对于项目根目录）: ").strip()
            question = input("请输入你的问题: ").strip()
            helper.chat_about_code(file_path, question)
            
        elif choice == "4":
            file_path = input("请输入文件路径（相对于项目根目录）: ").strip()
            content = helper.read_file(file_path)
            if content:
                print("\n" + "="*60)
                print("📄 文件内容:")
                print("="*60)
                print(content)
                print("="*60 + "\n")
                
        elif choice == "5":
            print("👋 再见！")
            break
            
        else:
            print("❌ 无效选择，请重试")


if __name__ == "__main__":
    main()
