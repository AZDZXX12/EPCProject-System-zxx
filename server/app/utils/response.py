"""
统一响应格式工具
"""
from typing import Any, Optional, Dict, List
from fastapi.responses import JSONResponse
from pydantic import BaseModel

class ApiResponse(BaseModel):
    """API响应模型"""
    success: bool = True
    message: str = "操作成功"
    data: Optional[Any] = None
    code: int = 200
    timestamp: Optional[int] = None
    
    class Config:
        json_encoders = {
            # 可以添加自定义编码器
        }

class PaginatedResponse(BaseModel):
    """分页响应模型"""
    success: bool = True
    message: str = "获取成功"
    data: List[Any] = []
    pagination: Dict[str, Any] = {}
    code: int = 200

def success_response(
    data: Any = None,
    message: str = "操作成功",
    code: int = 200
) -> JSONResponse:
    """成功响应"""
    import time
    return JSONResponse(
        status_code=code,
        content={
            "success": True,
            "message": message,
            "data": data,
            "code": code,
            "timestamp": int(time.time() * 1000)
        }
    )

def error_response(
    message: str = "操作失败",
    code: int = 400,
    details: Any = None
) -> JSONResponse:
    """错误响应"""
    import time
    content = {
        "success": False,
        "message": message,
        "code": code,
        "timestamp": int(time.time() * 1000)
    }
    if details:
        content["details"] = details
    
    return JSONResponse(
        status_code=code,
        content=content
    )

def paginated_response(
    data: List[Any],
    total: int,
    page: int = 1,
    page_size: int = 20,
    message: str = "获取成功"
) -> JSONResponse:
    """分页响应"""
    import time
    import math
    
    total_pages = math.ceil(total / page_size) if page_size > 0 else 0
    
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": message,
            "data": data,
            "pagination": {
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            },
            "code": 200,
            "timestamp": int(time.time() * 1000)
        }
    )
