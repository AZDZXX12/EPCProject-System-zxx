"""
EPC项目管理系统 - 快速启动后端
最小化依赖版本
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime

app = FastAPI(title="EPC项目管理系统", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 简单的内存数据存储
projects_db = []
tasks_db = []
devices_db = []

# 数据模型
class Project(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = ""
    status: str = "in_progress"
    progress: int = 0
    start_date: str
    end_date: str

class Task(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = ""
    start_date: str
    end_date: str
    progress: int = 0
    assignee: str = ""
    priority: str = "medium"
    status: str = "pending"
    project_id: Optional[str] = None

class Device(BaseModel):
    id: Optional[int] = None
    device_id: str
    name: str
    type: str
    status: str
    location: str
    project_id: Optional[str] = None

# API路由
@app.get("/")
async def root():
    return {"message": "EPC项目管理系统 API", "status": "运行中", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/v1/auth/csrf/")
async def csrf():
    return {"csrf_token": "dev-token"}

# Projects API
@app.get("/api/v1/projects/")
async def get_projects():
    return projects_db

@app.post("/api/v1/projects/")
async def create_project(project: Project):
    project.id = f"PROJ-{len(projects_db) + 1:03d}"
    projects_db.append(project.model_dump())
    return project

# Tasks API
@app.get("/api/v1/tasks/")
async def get_tasks(project_id: Optional[str] = None):
    if project_id:
        return [t for t in tasks_db if t.get("project_id") == project_id]
    return tasks_db

@app.get("/api/v1/tasks/{task_id}")
async def get_task(task_id: str):
    """获取单个任务详情"""
    for task in tasks_db:
        if task.get("id") == task_id:
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.post("/api/v1/tasks/")
async def create_task(task: Task):
    task.id = f"TASK-{len(tasks_db) + 1:03d}"
    tasks_db.append(task.model_dump())
    return task

@app.put("/api/v1/tasks/{task_id}")
async def update_task(task_id: str, task: Task):
    for i, t in enumerate(tasks_db):
        if t["id"] == task_id:
            task.id = task_id
            tasks_db[i] = task.model_dump()
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/api/v1/tasks/{task_id}")
async def delete_task(task_id: str):
    for i, t in enumerate(tasks_db):
        if t["id"] == task_id:
            tasks_db.pop(i)
            return {"message": "Task deleted"}
    raise HTTPException(status_code=404, detail="Task not found")

# Devices API
@app.get("/api/v1/devices/")
async def get_devices():
    return devices_db

@app.post("/api/v1/devices/")
async def create_device(device: Device):
    device.id = len(devices_db) + 1
    devices_db.append(device.model_dump())
    return device

# Construction Logs (空实现)
@app.get("/api/v1/construction-logs/")
async def get_construction_logs():
    return []

# Database Management API
@app.get("/api/v1/database/info")
async def get_database_info():
    """获取数据库信息"""
    return {
        "path": "内存数据库 (Memory DB)",
        "size_mb": 0.0,
        "tables": ["projects", "tasks", "devices"],
        "table_counts": {
            "projects": len(projects_db),
            "tasks": len(tasks_db),
            "devices": len(devices_db)
        },
        "backup_dir": "N/A (内存模式)",
        "mode": "memory",
        "status": "运行中"
    }

@app.post("/api/v1/database/backup")
async def backup_database():
    """数据库备份（内存模式不支持）"""
    return {
        "success": False,
        "message": "内存模式不支持备份功能",
        "backup_file": None
    }

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("EPC项目管理系统后端启动中...")
    print("=" * 50)
    print("地址: http://localhost:8000")
    print("文档: http://localhost:8000/docs")
    print("模式: 内存数据库")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

