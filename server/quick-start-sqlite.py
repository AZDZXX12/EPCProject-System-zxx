"""
EPC Project Management System - SQLite Persistent Version
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
import os
from datetime import datetime
from contextlib import contextmanager

app = FastAPI(title="EPC Project Management System", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://epc-frontend.onrender.com",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite database configuration
DB_PATH = os.path.join(os.path.dirname(__file__), "data", "epc_system.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_database():
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
        
        conn.commit()
        print("[OK] Database initialized")

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
async def get_projects():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects ORDER BY created_at DESC")
        projects = [dict(row) for row in cursor.fetchall()]
        return projects

@app.post("/api/v1/projects/")
async def create_project(project: Project):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Generate project ID
        if not project.id:
            project.id = f"PROJ-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        cursor.execute("""
            INSERT INTO projects (id, name, description, status, progress, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (project.id, project.name, project.description, project.status, 
              project.progress, project.start_date, project.end_date))
        
        return {"message": "Project created", "id": project.id}

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
async def get_tasks(project_id: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        
        if project_id:
            cursor.execute("SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC", (project_id,))
        else:
            cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC")
        
        tasks = [dict(row) for row in cursor.fetchall()]
        return tasks

@app.post("/api/v1/tasks/")
async def create_task(task: Task):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Generate task ID
            if not task.id:
                task.id = f"TASK-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            
            print(f"[DEBUG] Creating task: {task.id}, name: {task.name}, project: {task.project_id}")
            
            # 🔧 使用 INSERT OR REPLACE 避免 UNIQUE 冲突
            cursor.execute("""
                INSERT OR REPLACE INTO tasks (id, name, description, start_date, end_date, progress, 
                                 assignee, priority, status, project_id, parent_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                        COALESCE((SELECT created_at FROM tasks WHERE id = ?), CURRENT_TIMESTAMP))
            """, (task.id, task.name, task.description, task.start_date, task.end_date,
                  task.progress, task.assignee, task.priority, task.status, 
                  task.project_id, task.parent_id, task.id))
            
            print(f"[DEBUG] Task created/updated successfully: {task.id}")
            return {"message": "Task created", "id": task.id}
    except Exception as e:
        print(f"[ERROR] Failed to create task: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")

@app.put("/api/v1/tasks/{task_id}")
async def update_task(task_id: str, task: Task):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            print(f"[DEBUG] Updating task: {task_id}, name: {task.name}")
            
            cursor.execute("""
                UPDATE tasks 
                SET name=?, description=?, start_date=?, end_date=?, progress=?,
                    assignee=?, priority=?, status=?, project_id=?, parent_id=?
                WHERE id=?
            """, (task.name, task.description, task.start_date, task.end_date, 
                  task.progress, task.assignee, task.priority, task.status,
                  task.project_id, task.parent_id, task_id))
            
            if cursor.rowcount == 0:
                print(f"[DEBUG] Task not found: {task_id}")
                raise HTTPException(status_code=404, detail="Task not found")
            
            print(f"[DEBUG] Task updated successfully: {task_id}")
            return {"message": "Task updated", "id": task_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to update task: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")

@app.delete("/api/v1/tasks/{task_id}")
async def delete_task(task_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"message": "Task deleted"}

# Construction Logs (Empty implementation)
@app.get("/api/v1/construction-logs/")
async def get_construction_logs():
    return []

# Mock Login API
@app.post("/api/v1/auth/login/")
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
async def get_csrf_token():
    return {
        "csrf_token": "dev-csrf-token-" + datetime.now().strftime('%Y%m%d%H%M%S')
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print("=" * 50)
    print("Starting EPC System - SQLite Version")
    print(f"Backend: http://0.0.0.0:{port}")
    print(f"API Docs: http://0.0.0.0:{port}/docs")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=port)
