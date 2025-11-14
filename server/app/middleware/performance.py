"""
性能监控中间件
"""
import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class PerformanceMiddleware(BaseHTTPMiddleware):
    """性能监控中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 记录请求开始时间
        start_time = time.time()
        
        # 记录请求信息
        method = request.method
        url = str(request.url)
        client_ip = request.client.host if request.client else "unknown"
        
        # 执行请求
        response = await call_next(request)
        
        # 计算处理时间
        process_time = time.time() - start_time
        
        # 添加性能头部
        response.headers["X-Process-Time"] = str(process_time)
        
        # 记录慢查询
        if process_time > 1.0:  # 超过1秒的请求
            logger.warning(
                f"Slow request: {method} {url} - {process_time:.2f}s - IP: {client_ip}"
            )
        
        # 记录请求日志
        logger.info(
            f"{method} {url} - {response.status_code} - {process_time:.3f}s - IP: {client_ip}"
        )
        
        return response
