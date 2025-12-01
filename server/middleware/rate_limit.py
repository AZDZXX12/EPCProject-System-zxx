"""
速率限制中间件 - 防止API滥用
"""
from fastapi import Request, HTTPException
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Tuple

# 存储请求记录: {ip: [(timestamp, count)]}
_request_records: Dict[str, list] = defaultdict(list)

class RateLimiter:
    """速率限制器"""
    
    def __init__(self, requests: int = 100, window: int = 60):
        """
        Args:
            requests: 时间窗口内允许的请求数
            window: 时间窗口（秒）
        """
        self.requests = requests
        self.window = window
    
    async def check_rate_limit(self, request: Request) -> bool:
        """
        检查是否超过速率限制
        
        Returns:
            True: 允许请求
            False: 超过限制
        """
        client_ip = self._get_client_ip(request)
        now = datetime.now()
        
        # 清理过期记录
        self._cleanup_old_records(client_ip, now)
        
        # 检查当前请求数
        current_requests = len(_request_records[client_ip])
        
        if current_requests >= self.requests:
            return False
        
        # 记录本次请求
        _request_records[client_ip].append(now)
        return True
    
    def _get_client_ip(self, request: Request) -> str:
        """获取客户端IP"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _cleanup_old_records(self, client_ip: str, now: datetime):
        """清理过期的请求记录"""
        cutoff_time = now - timedelta(seconds=self.window)
        _request_records[client_ip] = [
            ts for ts in _request_records[client_ip] 
            if ts > cutoff_time
        ]
    
    def get_remaining_requests(self, request: Request) -> Tuple[int, int]:
        """
        获取剩余请求数
        
        Returns:
            (remaining, reset_time_seconds)
        """
        client_ip = self._get_client_ip(request)
        now = datetime.now()
        self._cleanup_old_records(client_ip, now)
        
        current = len(_request_records[client_ip])
        remaining = max(0, self.requests - current)
        
        # 计算重置时间
        if _request_records[client_ip]:
            oldest = min(_request_records[client_ip])
            reset_time = int((oldest + timedelta(seconds=self.window) - now).total_seconds())
        else:
            reset_time = 0
        
        return remaining, reset_time


# 全局速率限制器实例
default_limiter = RateLimiter(requests=100, window=60)
strict_limiter = RateLimiter(requests=10, window=60)


async def rate_limit_middleware(request: Request, limiter: RateLimiter = default_limiter):
    """速率限制中间件"""
    if not await limiter.check_rate_limit(request):
        remaining, reset = limiter.get_remaining_requests(request)
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Try again in {reset} seconds.",
            headers={
                "X-RateLimit-Limit": str(limiter.requests),
                "X-RateLimit-Remaining": str(remaining),
                "X-RateLimit-Reset": str(reset),
                "Retry-After": str(reset)
            }
        )


def get_rate_limit_stats() -> dict:
    """获取速率限制统计"""
    total_ips = len(_request_records)
    total_requests = sum(len(records) for records in _request_records.values())
    
    return {
        "tracked_ips": total_ips,
        "total_requests": total_requests,
        "average_requests_per_ip": total_requests / total_ips if total_ips > 0 else 0
    }
