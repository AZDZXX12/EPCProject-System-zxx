"""
EPC Project Management System - SQLite Persistent Version
优化版本：添加缓存、连接池和性能优化
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
import os
from datetime import datetime
from contextlib import contextmanager
from functools import lru_cache

app = FastAPI(
    title="EPC Project Management System", 
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# GZip压缩中间件 - 提升响应速度
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 🔧 CORS配置优化 - 支持本地开发和生产部署
# 从环境变量读取允许的源，如果没有则使用默认值
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "").split(",") if os.environ.get("ALLOWED_ORIGINS") else [
    "https://epc-frontend.onrender.com",
    "https://chemical-frontend.onrender.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

# 移除空字符串
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # 明确指定允许的源（不使用通配符*）
    allow_credentials=True,  # 允许携带凭证
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # 预检请求缓存时间
)

# SQLite database configuration
DB_PATH = os.path.join(os.path.dirname(__file__), "data", "epc_system.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

@contextmanager
def get_db():
    """优化的数据库连接管理"""
    conn = sqlite3.connect(
        DB_PATH,
        timeout=10.0,  # 增加超时时间
        check_same_thread=False,  # 允许多线程访问
        isolation_level='DEFERRED'  # 延迟事务以提高并发性
    )
    conn.row_factory = sqlite3.Row
    # 性能优化设置
    conn.execute("PRAGMA journal_mode=WAL")  # WAL模式提升并发性能
    conn.execute("PRAGMA synchronous=NORMAL")  # 平衡性能和安全
    conn.execute("PRAGMA cache_size=10000")  # 增加缓存大小
    conn.execute("PRAGMA temp_store=MEMORY")  # 使用内存存储临时数据
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_database():
    """初始化数据库并创建索引以提升查询性能"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Projects table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'in_progress',
                progress INTEGER DEFAULT 0,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tasks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                progress INTEGER DEFAULT 0,
                assignee TEXT,
                priority TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'pending',
                project_id TEXT,
                parent_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id)
            )
        """)
        
        # Devices table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT NOT NULL,
                location TEXT NOT NULL,
                project_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id)
            )
        """)
        
        # Construction Logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS construction_logs (
                id TEXT PRIMARY KEY,
                log_id TEXT,
                date TEXT NOT NULL,
                task_id TEXT,
                task_name TEXT NOT NULL,
                weather TEXT NOT NULL,
                temperature TEXT NOT NULL,
                work_content TEXT NOT NULL,
                worker_count INTEGER NOT NULL,
                equipment_used TEXT,
                material_used TEXT,
                progress_today REAL NOT NULL,
                issues TEXT,
                safety_check TEXT,
                photos TEXT,
                reporter TEXT NOT NULL,
                project_id TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
            )
        """)
        
        # 创建索引以提升查询性能
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_devices_project ON devices(project_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status)")
        
        # 施工日志索引
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_project ON construction_logs(project_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_task ON construction_logs(task_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_date ON construction_logs(date DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_created ON construction_logs(created_at DESC)")
        
        conn.commit()
        print("[OK] Database initialized with performance optimizations")

# Initialize database on startup
init_database()

# Data Models
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
    assignee: Optional[str] = None
    priority: str = "medium"
    status: str = "pending"
    project_id: Optional[str] = None
    parent_id: Optional[str] = None

class Device(BaseModel):
    id: Optional[int] = None
    device_id: str
    name: str
    type: str
    status: str
    location: str
    project_id: Optional[str] = None

# API Endpoints

@app.get("/")
async def root():
    return {"message": "EPC Project Management System - SQLite Version", "status": "running"}

# 🔧 认证API
@app.post("/api/v1/auth/login/")
@app.post("/api/v1/auth/login")
async def login(credentials: dict):
    """简单的登录验证 - 开发环境使用"""
    username = credentials.get("username")
    password = credentials.get("password")
    
    # 简单验证：admin/admin123
    if username == "admin" and password == "admin123":
        return {
            "success": True,
            "username": username,
            "token": "dev-token-12345",
            "message": "登录成功"
        }
    else:
        raise HTTPException(status_code=401, detail="用户名或密码错误")

@app.get("/api/v1/auth/csrf/")
@app.get("/api/v1/auth/csrf")
async def get_csrf_token():
    """获取CSRF令牌"""
    return {"csrf_token": "dev-csrf-token"}

@app.post("/api/v1/auth/logout/")
@app.post("/api/v1/auth/logout")
async def logout():
    """登出"""
    return {"success": True, "message": "登出成功"}

@app.get("/api/v1/auth/user/")
@app.get("/api/v1/auth/user")
async def get_current_user():
    """获取当前用户信息"""
    return {"username": "admin", "role": "admin"}

@app.get("/api/v1/database/info")
async def get_database_info():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get project count
        cursor.execute("SELECT COUNT(*) as count FROM projects")
        project_count = cursor.fetchone()['count']
        
        # Get task count
        cursor.execute("SELECT COUNT(*) as count FROM tasks")
        task_count = cursor.fetchone()['count']
        
        # Get device count
        cursor.execute("SELECT COUNT(*) as count FROM devices")
        device_count = cursor.fetchone()['count']
        
        return {
            "database": "SQLite",
            "path": DB_PATH,
            "projects": project_count,
            "tasks": task_count,
            "devices": device_count
        }

@app.post("/api/v1/database/backup")
async def backup_database():
    import shutil
    backup_path = f"server/data/backup/epc_system_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    os.makedirs(os.path.dirname(backup_path), exist_ok=True)
    shutil.copy2(DB_PATH, backup_path)
    return {"message": "Database backup created", "path": backup_path}

# Project APIs
@app.get("/api/v1/projects/")
@app.get("/api/v1/projects")  # 🔧 添加不带斜杠的路由，避免CORS重定向问题
async def get_projects():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects ORDER BY created_at DESC")
        projects = [dict(row) for row in cursor.fetchall()]
        return projects

@app.post("/api/v1/projects/")
@app.post("/api/v1/projects")
async def create_project(project: Project):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            if not project.id:
                project.id = f"PROJ-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            
            cursor.execute("""
                INSERT OR REPLACE INTO projects (id, name, description, status, progress, start_date, end_date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (project.id, project.name, project.description, project.status, 
                  project.progress, project.start_date, project.end_date))
            
            return {"message": "Project created", "id": project.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")

@app.get("/api/v1/projects/{project_id}")
async def get_project(project_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        project = cursor.fetchone()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return dict(project)

@app.put("/api/v1/projects/{project_id}")
async def update_project(project_id: str, project: Project):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE projects 
            SET name=?, description=?, status=?, progress=?, start_date=?, end_date=?
            WHERE id=?
        """, (project.name, project.description, project.status, project.progress,
              project.start_date, project.end_date, project_id))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return {"message": "Project updated"}

@app.delete("/api/v1/projects/{project_id}")
async def delete_project(project_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Also delete related tasks
        cursor.execute("DELETE FROM tasks WHERE project_id = ?", (project_id,))
        
        return {"message": "Project deleted"}

# Task APIs
@app.get("/api/v1/tasks/")
@app.get("/api/v1/tasks")  # 🔧 避免CORS重定向问题
async def get_tasks(project_id: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        
        if project_id:
            cursor.execute("SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC", (project_id,))
        else:
            cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC")
        
        tasks = [dict(row) for row in cursor.fetchall()]
        return tasks

@app.get("/api/v1/tasks/{task_id}")
async def get_task(task_id: str):
    """获取单个任务"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        task = cursor.fetchone()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return dict(task)

@app.post("/api/v1/tasks/")
@app.post("/api/v1/tasks")
async def create_task(task: Task):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            if not task.id:
                task.id = f"TASK-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            
            cursor.execute("""
                INSERT OR REPLACE INTO tasks (id, name, description, start_date, end_date, progress, 
                                 assignee, priority, status, project_id, parent_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                        COALESCE((SELECT created_at FROM tasks WHERE id = ?), CURRENT_TIMESTAMP))
            """, (task.id, task.name, task.description, task.start_date, task.end_date,
                  task.progress, task.assignee, task.priority, task.status, 
                  task.project_id, task.parent_id, task.id))
            
            return {"message": "Task created", "id": task.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")

@app.put("/api/v1/tasks/{task_id}")
async def update_task(task_id: str, task: Task):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE tasks 
                SET name=?, description=?, start_date=?, end_date=?, progress=?,
                    assignee=?, priority=?, status=?, project_id=?, parent_id=?
                WHERE id=?
            """, (task.name, task.description, task.start_date, task.end_date, 
                  task.progress, task.assignee, task.priority, task.status,
                  task.project_id, task.parent_id, task_id))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Task not found")
            
            return {"message": "Task updated", "id": task_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")

@app.delete("/api/v1/tasks/{task_id}")
async def delete_task(task_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"message": "Task deleted"}

# ==================== Construction Logs API ====================
class ConstructionLogCreate(BaseModel):
    log_id: Optional[str] = None
    date: str
    task_id: Optional[str] = None
    task_name: str
    weather: str
    temperature: str
    work_content: str
    worker_count: int
    equipment_used: str = ""
    material_used: str = ""
    progress_today: float
    issues: str = "无"
    safety_check: str = "已完成"
    photos: List[str] = []
    reporter: str
    project_id: str

@app.get("/api/v1/construction-logs/")
@app.get("/api/v1/construction-logs")
async def get_construction_logs(project_id: Optional[str] = None):
    """获取施工日志列表"""
    with get_db() as conn:
        cursor = conn.cursor()
        if project_id:
            cursor.execute("""
                SELECT * FROM construction_logs 
                WHERE project_id = ? 
                ORDER BY date DESC, created_at DESC
            """, (project_id,))
        else:
            cursor.execute("SELECT * FROM construction_logs ORDER BY date DESC, created_at DESC")
        
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

@app.post("/api/v1/construction-logs/")
@app.post("/api/v1/construction-logs")
async def create_construction_log(log: ConstructionLogCreate):
    """创建施工日志"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            log_id = log.log_id or f"LOG-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
            cursor.execute("""
                INSERT INTO construction_logs (
                    id, log_id, date, task_id, task_name, weather, temperature,
                    work_content, worker_count, equipment_used, material_used,
                    progress_today, issues, safety_check, photos, reporter, project_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                log_id, log.log_id, log.date, log.task_id, log.task_name,
                log.weather, log.temperature, log.work_content, log.worker_count,
                log.equipment_used, log.material_used, log.progress_today,
                log.issues, log.safety_check, json.dumps(log.photos),
                log.reporter, log.project_id
            ))
            conn.commit()
            return {"message": "Construction log created", "id": log_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create log: {str(e)}")

@app.put("/api/v1/construction-logs/{log_id}")
async def update_construction_log(log_id: str, log: ConstructionLogCreate):
    """更新施工日志"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE construction_logs SET
                    date = ?, task_id = ?, task_name = ?, weather = ?,
                    temperature = ?, work_content = ?, worker_count = ?,
                    equipment_used = ?, material_used = ?, progress_today = ?,
                    issues = ?, safety_check = ?, photos = ?, reporter = ?,
                    project_id = ?, updated_at = ?
                WHERE id = ?
            """, (
                log.date, log.task_id, log.task_name, log.weather,
                log.temperature, log.work_content, log.worker_count,
                log.equipment_used, log.material_used, log.progress_today,
                log.issues, log.safety_check, json.dumps(log.photos),
                log.reporter, log.project_id,
                datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
                log_id
            ))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Log not found")
            
            conn.commit()
            return {"message": "Construction log updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update log: {str(e)}")

@app.delete("/api/v1/construction-logs/{log_id}")
async def delete_construction_log(log_id: str):
    """删除施工日志"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM construction_logs WHERE id = ?", (log_id,))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Log not found")
            
            conn.commit()
            return {"message": "Construction log deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete log: {str(e)}")

# Mock Login API
@app.post("/api/v1/auth/login/")
@app.post("/api/v1/auth/login")  # 🔧 添加不带斜杠的路由
async def login(credentials: dict):
    return {
        "access_token": "dev-access-token",
        "token_type": "bearer",
        "user": {
            "id": "user-001",
            "username": credentials.get("username", "admin"),
            "email": "admin@epc.com",
            "role": "admin"
        }
    }

# Device APIs
@app.get("/api/v1/devices/")
@app.get("/api/v1/devices")  # 🔧 避免CORS重定向问题
async def get_devices(project_id: Optional[str] = None):
    """获取设备列表"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        if project_id:
            cursor.execute("SELECT * FROM devices WHERE project_id = ? ORDER BY created_at DESC", (project_id,))
        else:
            cursor.execute("SELECT * FROM devices ORDER BY created_at DESC")
        
        devices = [dict(row) for row in cursor.fetchall()]
        return devices

@app.post("/api/v1/devices/")
@app.post("/api/v1/devices")  # 🔧 避免CORS重定向问题
async def create_device(device: dict):
    """创建设备"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 生成设备ID
        project_id = device.get('project_id', 'PROJ-001')
        cursor.execute("SELECT COUNT(*) as count FROM devices WHERE project_id = ?", (project_id,))
        count = cursor.fetchone()['count']
        device_id = f"{project_id}-DEV-{count + 1:03d}"
        
        cursor.execute("""
            INSERT INTO devices (device_id, name, type, status, location, project_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            device_id,
            device.get('name', ''),
            device.get('type', ''),
            device.get('status', 'planned'),
            device.get('location', ''),
            project_id
        ))
        
        return {
            "id": cursor.lastrowid,
            "device_id": device_id,
            "message": "Device created"
        }

@app.get("/api/v1/devices/{device_id}")
async def get_device(device_id: str):
    """获取单个设备"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM devices WHERE device_id = ?", (device_id,))
        device = cursor.fetchone()
        
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        return dict(device)

@app.put("/api/v1/devices/{device_id}")
async def update_device(device_id: str, device: dict):
    """更新设备"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE devices 
            SET name=?, type=?, status=?, location=?
            WHERE device_id=?
        """, (
            device.get('name', ''),
            device.get('type', ''),
            device.get('status', ''),
            device.get('location', ''),
            device_id
        ))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Device not found")
        
        return {"message": "Device updated"}

@app.delete("/api/v1/devices/{device_id}")
async def delete_device(device_id: str):
    """删除设备"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM devices WHERE device_id = ?", (device_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Device not found")
        
        return {"message": "Device deleted"}

# Mock CSRF API
@app.get("/api/v1/auth/csrf/")
@app.get("/api/v1/auth/csrf")  # 🔧 添加不带斜杠的路由
async def get_csrf_token():
    return {
        "csrf_token": "dev-csrf-token-" + datetime.now().strftime('%Y%m%d%H%M%S')
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print("=" * 50)
    print("EPC System - v2.0 Optimized")
    print(f"Backend: http://0.0.0.0:{port}")
    print(f"API Docs: http://0.0.0.0:{port}/docs")
    print("=" * 50)
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        log_level="warning"  # 减少日志输出
    )
