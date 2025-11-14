"""
安全中间件
"""
import re
import time
from typing import Dict, Set
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    """安全中间件"""
    
    def __init__(self, app, rate_limit: int = 100, time_window: int = 60):
        super().__init__(app)
        self.rate_limit = rate_limit  # 每分钟最大请求数
        self.time_window = time_window  # 时间窗口（秒）
        self.request_counts: Dict[str, list] = {}  # IP -> [timestamps]
        
        # 危险路径模式
        self.dangerous_patterns = [
            r'\.\./',  # 路径遍历
            r'<script',  # XSS
            r'javascript:',  # XSS
            r'eval\(',  # 代码注入
            r'exec\(',  # 代码注入
            r'union.*select',  # SQL注入
            r'drop.*table',  # SQL注入
        ]
        
        # 编译正则表达式
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.dangerous_patterns]
    
    async def dispatch(self, request: Request, call_next):
        # 获取客户端IP
        client_ip = self.get_client_ip(request)
        
        # 速率限制检查
        if not self.check_rate_limit(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(status_code=429, detail="请求过于频繁，请稍后再试")
        
        # 安全检查
        if not self.security_check(request):
            logger.warning(f"Security threat detected from IP: {client_ip}, URL: {request.url}")
            raise HTTPException(status_code=400, detail="请求包含不安全内容")
        
        # 执行请求
        response = await call_next(request)
        
        # 添加安全头部
        response = self.add_security_headers(response)
        
        return response
    
    def get_client_ip(self, request: Request) -> str:
        """获取客户端真实IP"""
        # 检查代理头部
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        real_ip = request.headers.get('X-Real-IP')
        if real_ip:
            return real_ip
        
        # 默认使用客户端IP
        return request.client.host if request.client else 'unknown'
    
    def check_rate_limit(self, client_ip: str) -> bool:
        """检查速率限制"""
        current_time = time.time()
        
        # 获取该IP的请求记录
        if client_ip not in self.request_counts:
            self.request_counts[client_ip] = []
        
        requests = self.request_counts[client_ip]
        
        # 清理过期的请求记录
        requests[:] = [req_time for req_time in requests if current_time - req_time < self.time_window]
        
        # 检查是否超过限制
        if len(requests) >= self.rate_limit:
            return False
        
        # 添加当前请求
        requests.append(current_time)
        return True
    
    def security_check(self, request: Request) -> bool:
        """安全检查"""
        # 检查URL路径
        path = str(request.url.path)
        for pattern in self.compiled_patterns:
            if pattern.search(path):
                return False
        
        # 检查查询参数
        query = str(request.url.query)
        for pattern in self.compiled_patterns:
            if pattern.search(query):
                return False
        
        # 检查User-Agent（防止恶意爬虫）
        user_agent = request.headers.get('User-Agent', '')
        if not user_agent or len(user_agent) > 500:
            return False
        
        return True
    
    def add_security_headers(self, response: Response) -> Response:
        """添加安全头部"""
        # 防止XSS攻击
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # HTTPS相关（生产环境）
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # 内容安全策略
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self' https: wss:"
        )
        
        # 隐藏服务器信息
        response.headers['Server'] = 'EPC-Server'
        
        return response
