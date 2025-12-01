"""
缓存中间件 - 提升API响应速度
"""
from functools import wraps
from typing import Optional, Callable
import json
import hashlib
from datetime import datetime, timedelta

# 简单内存缓存
_cache_store = {}
_cache_ttl = {}

def cache_response(ttl_seconds: int = 300):
    """
    缓存装饰器
    
    Args:
        ttl_seconds: 缓存过期时间（秒）
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 生成缓存键
            cache_key = _generate_cache_key(func.__name__, args, kwargs)
            
            # 检查缓存
            cached_data = _get_from_cache(cache_key)
            if cached_data is not None:
                return cached_data
            
            # 执行函数
            result = await func(*args, **kwargs)
            
            # 存入缓存
            _set_to_cache(cache_key, result, ttl_seconds)
            
            return result
        return wrapper
    return decorator


def _generate_cache_key(func_name: str, args: tuple, kwargs: dict) -> str:
    """生成缓存键"""
    key_data = {
        'func': func_name,
        'args': str(args),
        'kwargs': str(sorted(kwargs.items()))
    }
    key_string = json.dumps(key_data, sort_keys=True)
    return hashlib.md5(key_string.encode()).hexdigest()


def _get_from_cache(key: str) -> Optional[any]:
    """从缓存获取数据"""
    if key in _cache_store:
        # 检查是否过期
        if key in _cache_ttl and datetime.now() < _cache_ttl[key]:
            return _cache_store[key]
        else:
            # 清理过期缓存
            _cache_store.pop(key, None)
            _cache_ttl.pop(key, None)
    return None


def _set_to_cache(key: str, value: any, ttl_seconds: int):
    """设置缓存"""
    _cache_store[key] = value
    _cache_ttl[key] = datetime.now() + timedelta(seconds=ttl_seconds)


def clear_cache(pattern: Optional[str] = None):
    """清理缓存"""
    if pattern is None:
        _cache_store.clear()
        _cache_ttl.clear()
    else:
        # 清理匹配的缓存
        keys_to_remove = [k for k in _cache_store.keys() if pattern in k]
        for key in keys_to_remove:
            _cache_store.pop(key, None)
            _cache_ttl.pop(key, None)


def get_cache_stats() -> dict:
    """获取缓存统计"""
    now = datetime.now()
    valid_count = sum(1 for k, v in _cache_ttl.items() if v > now)
    
    return {
        'total_keys': len(_cache_store),
        'valid_keys': valid_count,
        'expired_keys': len(_cache_store) - valid_count,
        'memory_usage_estimate': len(str(_cache_store))
    }
