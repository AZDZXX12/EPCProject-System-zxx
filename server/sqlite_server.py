"""
EPC项目管理系统 - SQLite数据库后端
优化版本：支持静态文件服务、健康检查、性能监控
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from pathlib import Path
import uvicorn
import logging
import time
import os

# 导入数据库模块
from database import db

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="EPC项目管理系统 (SQLite版)",
    version="2.0.0",
    description="支持真实数据持久化的企业级后端"
)

# 添加Gzip压缩中间件
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS配置 - 生产环境应限制具体域名
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 性能监控中间件
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # 记录慢查询
    if process_time > 1.0:
        logger.warning(f"Slow request: {request.method} {request.url} - {process_time:.2f}s")
    
    return response


# ==================== 静态文件服务 ====================

# 挂载静态文件目录（前端构建产物）
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
    logger.info(f"✅ Static files mounted: {STATIC_DIR}")
else:
    logger.warning(f"⚠️ Static directory not found: {STATIC_DIR}")


# ==================== 数据模型 ====================

class Project(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = ""
    status: Optional[str] = "planning"
    progress: Optional[float] = 0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = 0
    spent: Optional[float] = 0


class Task(BaseModel):
    id: Optional[str] = None
    project_id: str
    name: str
    description: Optional[str] = ""
    status: Optional[str] = "pending"
    priority: Optional[str] = "medium"
    progress: Optional[float] = 0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    assignee: Optional[str] = ""
    dependencies: Optional[List[str]] = None
    
    model_config = {"from_attributes": True}


class Device(BaseModel):
    id: Optional[str] = None
    project_id: Optional[str] = None
    name: str
    type: Optional[str] = ""
    model: Optional[str] = ""
    manufacturer: Optional[str] = ""
    quantity: Optional[int] = 1
    unit_price: Optional[float] = 0
    total_price: Optional[float] = 0
    status: Optional[str] = "pending"
    supplier: Optional[str] = ""
    delivery_date: Optional[str] = None


# ==================== 健康检查 ====================

@app.get("/health")
async def health_check():
    """健康检查端点 - 用于容器编排和监控"""
    try:
        # 检查数据库连接
        db_info = db.get_database_info()
        return {
            "status": "healthy",
            "database": "sqlite",
            "version": "2.0.0",
            "timestamp": datetime.now().isoformat(),
            "db_status": "connected",
            "db_tables": db_info.get("table_counts", {})
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")


# ==================== 根路径 ====================

@app.get("/")
async def root():
    """根路径 - 返回前端应用或API信息"""
    # 如果存在前端构建产物，返回index.html
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    
    # 否则返回API信息
    db_info = db.get_database_info()
    return {
        "message": "EPC项目管理系统 API (SQLite版)",
        "version": "2.0.0",
        "status": "运行中",
        "database": db_info,
        "docs": "/docs",
        "health": "/health"
    }


# ==================== 认证 API (简化版) ====================

@app.get("/api/v1/auth/csrf/")
async def get_csrf():
    """获取CSRF Token（简化版，返回固定token）"""
    return {"csrf_token": "demo-csrf-token-12345"}


@app.post("/api/v1/auth/login/")
async def login(credentials: dict):
    """登录（简化版，接受任何凭据）"""
    return {
        "success": True,
        "token": "demo-token-12345",
        "user": {
            "id": "USER-001",
            "username": credentials.get("username", "admin"),
            "role": "admin"
        }
    }


@app.get("/api/v1/construction-logs/")
async def get_construction_logs(project_id: Optional[str] = None):
    """获取施工日志（临时返回空数组）"""
    return []


# ==================== 项目 API ====================

@app.get("/api/v1/projects/")
async def get_projects():
    """获取所有项目"""
    try:
        projects = db.get_all_projects()
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目列表失败: {str(e)}")


@app.get("/api/v1/projects/{project_id}")
async def get_project(project_id: str):
    """获取单个项目"""
    project = db.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"项目 {project_id} 不存在")
    return project


@app.post("/api/v1/projects/")
async def create_project(project: Project):
    """创建新项目"""
    try:
        # 生成ID
        if not project.id:
            project.id = f"PROJ-{int(datetime.now().timestamp() * 1000)}"
        
        project_data = project.dict()
        new_project = db.create_project(project_data)
        return new_project
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建项目失败: {str(e)}")


@app.put("/api/v1/projects/{project_id}")
async def update_project(project_id: str, project: Project):
    """更新项目"""
    try:
        existing = db.get_project_by_id(project_id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"项目 {project_id} 不存在")
        
        project_data = project.dict()
        updated_project = db.update_project(project_id, project_data)
        return updated_project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新项目失败: {str(e)}")


@app.delete("/api/v1/projects/{project_id}")
async def delete_project(project_id: str):
    """删除项目"""
    try:
        success = db.delete_project(project_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"项目 {project_id} 不存在")
        return {"success": True, "message": f"项目 {project_id} 已删除"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除项目失败: {str(e)}")


# ==================== 任务 API ====================

@app.get("/api/v1/tasks/")
async def get_tasks(project_id: Optional[str] = None):
    """获取任务列表（可选按项目过滤）"""
    try:
        tasks = db.get_all_tasks(project_id)
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取任务列表失败: {str(e)}")


@app.get("/api/v1/tasks/{task_id}")
async def get_task(task_id: str):
    """获取单个任务"""
    task = db.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"任务 {task_id} 不存在")
    return task


@app.post("/api/v1/tasks/")
async def create_task(task: Task):
    """创建新任务"""
    try:
        # 生成ID
        if not task.id:
            task.id = f"TASK-{int(datetime.now().timestamp() * 1000)}"
        
        # 兼容 Pydantic V1 和 V2
        try:
            task_data = task.model_dump()  # Pydantic V2
        except AttributeError:
            task_data = task.dict()  # Pydantic V1
        
        # 确保dependencies正确处理
        if task_data.get('dependencies') is None:
            task_data['dependencies'] = []
        
        new_task = db.create_task(task_data)
        logger.info(f"成功创建任务: {task_data['id']}")
        return new_task
    except Exception as e:
        logger.error(f"创建任务失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"创建任务失败: {str(e)}")


@app.put("/api/v1/tasks/{task_id}")
async def update_task(task_id: str, task: Task):
    """更新任务"""
    try:
        # 检查任务是否存在
        existing = db.get_task_by_id(task_id)
        if not existing:
            logger.warning(f"尝试更新不存在的任务: {task_id}")
            raise HTTPException(status_code=404, detail=f"任务 {task_id} 不存在")
        
        # 兼容 Pydantic V1 和 V2
        try:
            task_data = task.model_dump()  # Pydantic V2
        except AttributeError:
            task_data = task.dict()  # Pydantic V1
        
        # 确保dependencies正确处理
        if task_data.get('dependencies') is None:
            task_data['dependencies'] = []
        
        updated_task = db.update_task(task_id, task_data)
        logger.info(f"成功更新任务: {task_id}")
        return updated_task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新任务失败 {task_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"更新任务失败: {str(e)}")


@app.delete("/api/v1/tasks/{task_id}")
async def delete_task(task_id: str):
    """删除任务"""
    try:
        success = db.delete_task(task_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"任务 {task_id} 不存在")
        return {"success": True, "message": f"任务 {task_id} 已删除"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除任务失败: {str(e)}")


# ==================== 设备 API ====================

@app.get("/api/v1/devices/")
async def get_devices(project_id: Optional[str] = None):
    """获取设备列表（可选按项目过滤）"""
    try:
        devices = db.get_all_devices(project_id)
        return devices
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取设备列表失败: {str(e)}")


@app.get("/api/v1/devices/{device_id}")
async def get_device(device_id: str):
    """获取单个设备"""
    device = db.get_device_by_id(device_id)
    if not device:
        raise HTTPException(status_code=404, detail=f"设备 {device_id} 不存在")
    return device


@app.post("/api/v1/devices/")
async def create_device(device: Device):
    """创建新设备"""
    try:
        # 生成ID
        if not device.id:
            device.id = f"DEV-{int(datetime.now().timestamp() * 1000)}"
        
        device_data = device.dict()
        new_device = db.create_device(device_data)
        return new_device
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建设备失败: {str(e)}")


@app.put("/api/v1/devices/{device_id}")
async def update_device(device_id: str, device: Device):
    """更新设备"""
    try:
        existing = db.get_device_by_id(device_id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"设备 {device_id} 不存在")
        
        device_data = device.dict()
        updated_device = db.update_device(device_id, device_data)
        return updated_device
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新设备失败: {str(e)}")


@app.delete("/api/v1/devices/{device_id}")
async def delete_device(device_id: str):
    """删除设备"""
    try:
        success = db.delete_device(device_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"设备 {device_id} 不存在")
        return {"success": True, "message": f"设备 {device_id} 已删除"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除设备失败: {str(e)}")


# ==================== 数据库管理 API ====================

@app.get("/api/v1/database/info")
async def get_database_info():
    """获取数据库信息"""
    try:
        info = db.get_database_info()
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取数据库信息失败: {str(e)}")


@app.post("/api/v1/database/backup")
async def backup_database():
    """数据库备份"""
    try:
        backup_file = db.backup_database()
        return {
            "success": True,
            "message": "数据库备份成功",
            "backup_file": backup_file
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"数据库备份失败: {str(e)}")


# ==================== 启动服务 ====================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print("=" * 60)
    print("🚀 EPC项目管理系统 - SQLite数据库版")
    print("=" * 60)
    print(f"📊 数据库: {db.db_path}")
    print(f"🌐 API文档: http://0.0.0.0:{port}/docs")
    print(f"❤️  健康检查: http://0.0.0.0:{port}/health")
    if STATIC_DIR.exists():
        print(f"📁 静态文件: {STATIC_DIR}")
    print("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
