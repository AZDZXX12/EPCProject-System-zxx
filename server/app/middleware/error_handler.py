"""
全局错误处理中间件
"""
import logging
import traceback
from typing import Union
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """全局错误处理中间件"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except HTTPException as exc:
            # FastAPI HTTP异常
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "error": True,
                    "message": exc.detail,
                    "status_code": exc.status_code,
                    "path": str(request.url.path)
                }
            )
        except ValidationError as exc:
            # Pydantic验证错误
            logger.error(f"Validation error: {exc}")
            return JSONResponse(
                status_code=422,
                content={
                    "error": True,
                    "message": "数据验证失败",
                    "details": exc.errors(),
                    "status_code": 422,
                    "path": str(request.url.path)
                }
            )
        except SQLAlchemyError as exc:
            # 数据库错误
            logger.error(f"Database error: {exc}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": True,
                    "message": "数据库操作失败",
                    "status_code": 500,
                    "path": str(request.url.path)
                }
            )
        except Exception as exc:
            # 其他未预期的错误
            logger.error(f"Unexpected error: {exc}")
            logger.error(traceback.format_exc())
            return JSONResponse(
                status_code=500,
                content={
                    "error": True,
                    "message": "服务器内部错误",
                    "status_code": 500,
                    "path": str(request.url.path)
                }
            )
