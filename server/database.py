"""
SQLite数据库管理模块
提供数据库连接和操作的统一接口
"""
import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Any

# 数据库文件路径
DB_DIR = Path(__file__).parent / "data"
DB_FILE = DB_DIR / "epc_system.db"

# 确保数据目录存在
DB_DIR.mkdir(exist_ok=True)


class Database:
    """SQLite数据库管理类"""
    
    def __init__(self, db_path: str = str(DB_FILE)):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """获取数据库连接"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # 返回字典格式
        return conn
    
    def init_database(self):
        """初始化数据库表结构"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # 创建项目表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'planning',
                progress REAL DEFAULT 0,
                start_date TEXT,
                end_date TEXT,
                budget REAL,
                spent REAL DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 创建任务表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'pending',
                priority TEXT DEFAULT 'medium',
                progress REAL DEFAULT 0,
                start_date TEXT,
                end_date TEXT,
                assignee TEXT,
                dependencies TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        """)
        
        # 创建设备表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS devices (
                id TEXT PRIMARY KEY,
                project_id TEXT,
                name TEXT NOT NULL,
                type TEXT,
                model TEXT,
                manufacturer TEXT,
                quantity INTEGER DEFAULT 1,
                unit_price REAL,
                total_price REAL,
                status TEXT DEFAULT 'pending',
                supplier TEXT,
                delivery_date TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
            )
        """)
        
        # 创建索引以提高查询性能
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_devices_project ON devices(project_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)")
        
        conn.commit()
        conn.close()
        # 避免emoji导致GBK编码错误
        print(f"[OK] Database initialized: {self.db_path}")
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict]:
        """执行查询并返回结果"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    
    def execute_update(self, query: str, params: tuple = ()) -> int:
        """执行更新/插入/删除操作"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        affected_rows = cursor.rowcount
        conn.close()
        return affected_rows
    
    # ==================== 项目 CRUD ====================
    
    def get_all_projects(self) -> List[Dict]:
        """获取所有项目"""
        return self.execute_query("SELECT * FROM projects ORDER BY created_at DESC")
    
    def get_project_by_id(self, project_id: str) -> Optional[Dict]:
        """根据ID获取项目"""
        results = self.execute_query("SELECT * FROM projects WHERE id = ?", (project_id,))
        return results[0] if results else None
    
    def create_project(self, project_data: Dict) -> Dict:
        """创建新项目"""
        now = datetime.now().isoformat()
        query = """
            INSERT INTO projects (id, name, description, status, progress, start_date, end_date, budget, spent, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = (
            project_data['id'],
            project_data['name'],
            project_data.get('description', ''),
            project_data.get('status', 'planning'),
            project_data.get('progress', 0),
            project_data.get('start_date'),
            project_data.get('end_date'),
            project_data.get('budget', 0),
            project_data.get('spent', 0),
            now,
            now
        )
        self.execute_update(query, params)
        return self.get_project_by_id(project_data['id'])
    
    def update_project(self, project_id: str, project_data: Dict) -> Optional[Dict]:
        """更新项目"""
        now = datetime.now().isoformat()
        query = """
            UPDATE projects 
            SET name = ?, description = ?, status = ?, progress = ?, 
                start_date = ?, end_date = ?, budget = ?, spent = ?, updated_at = ?
            WHERE id = ?
        """
        params = (
            project_data.get('name'),
            project_data.get('description', ''),
            project_data.get('status', 'planning'),
            project_data.get('progress', 0),
            project_data.get('start_date'),
            project_data.get('end_date'),
            project_data.get('budget', 0),
            project_data.get('spent', 0),
            now,
            project_id
        )
        self.execute_update(query, params)
        return self.get_project_by_id(project_id)
    
    def delete_project(self, project_id: str) -> bool:
        """删除项目（会级联删除相关任务）"""
        affected = self.execute_update("DELETE FROM projects WHERE id = ?", (project_id,))
        return affected > 0
    
    # ==================== 任务 CRUD ====================
    
    def get_all_tasks(self, project_id: Optional[str] = None) -> List[Dict]:
        """获取任务列表（可选按项目ID过滤）"""
        if project_id:
            return self.execute_query(
                "SELECT * FROM tasks WHERE project_id = ? ORDER BY start_date",
                (project_id,)
            )
        return self.execute_query("SELECT * FROM tasks ORDER BY start_date")
    
    def get_task_by_id(self, task_id: str) -> Optional[Dict]:
        """根据ID获取任务"""
        results = self.execute_query("SELECT * FROM tasks WHERE id = ?", (task_id,))
        if results:
            task = results[0]
            # 将dependencies从JSON字符串转换为列表
            if task.get('dependencies'):
                try:
                    task['dependencies'] = json.loads(task['dependencies'])
                except:
                    task['dependencies'] = []
            return task
        return None
    
    def create_task(self, task_data: Dict) -> Dict:
        """创建新任务"""
        now = datetime.now().isoformat()
        
        # 处理dependencies（转换为JSON字符串）
        dependencies = task_data.get('dependencies', [])
        if isinstance(dependencies, list):
            dependencies = json.dumps(dependencies)
        
        query = """
            INSERT INTO tasks (id, project_id, name, description, status, priority, progress, 
                             start_date, end_date, assignee, dependencies, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = (
            task_data['id'],
            task_data['project_id'],
            task_data['name'],
            task_data.get('description', ''),
            task_data.get('status', 'pending'),
            task_data.get('priority', 'medium'),
            task_data.get('progress', 0),
            task_data.get('start_date'),
            task_data.get('end_date'),
            task_data.get('assignee', ''),
            dependencies,
            now,
            now
        )
        self.execute_update(query, params)
        return self.get_task_by_id(task_data['id'])
    
    def update_task(self, task_id: str, task_data: Dict) -> Optional[Dict]:
        """更新任务"""
        now = datetime.now().isoformat()
        
        # 处理dependencies
        dependencies = task_data.get('dependencies', [])
        if isinstance(dependencies, list):
            dependencies = json.dumps(dependencies)
        
        query = """
            UPDATE tasks 
            SET name = ?, description = ?, status = ?, priority = ?, progress = ?,
                start_date = ?, end_date = ?, assignee = ?, dependencies = ?, updated_at = ?
            WHERE id = ?
        """
        params = (
            task_data.get('name'),
            task_data.get('description', ''),
            task_data.get('status', 'pending'),
            task_data.get('priority', 'medium'),
            task_data.get('progress', 0),
            task_data.get('start_date'),
            task_data.get('end_date'),
            task_data.get('assignee', ''),
            dependencies,
            now,
            task_id
        )
        self.execute_update(query, params)
        return self.get_task_by_id(task_id)
    
    def delete_task(self, task_id: str) -> bool:
        """删除任务"""
        affected = self.execute_update("DELETE FROM tasks WHERE id = ?", (task_id,))
        return affected > 0
    
    # ==================== 设备 CRUD ====================
    
    def get_all_devices(self, project_id: Optional[str] = None) -> List[Dict]:
        """获取设备列表（可选按项目ID过滤）"""
        if project_id:
            return self.execute_query(
                "SELECT * FROM devices WHERE project_id = ? ORDER BY created_at DESC",
                (project_id,)
            )
        return self.execute_query("SELECT * FROM devices ORDER BY created_at DESC")
    
    def get_device_by_id(self, device_id: str) -> Optional[Dict]:
        """根据ID获取设备"""
        results = self.execute_query("SELECT * FROM devices WHERE id = ?", (device_id,))
        return results[0] if results else None
    
    def create_device(self, device_data: Dict) -> Dict:
        """创建新设备"""
        now = datetime.now().isoformat()
        query = """
            INSERT INTO devices (id, project_id, name, type, model, manufacturer, quantity, 
                               unit_price, total_price, status, supplier, delivery_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = (
            device_data['id'],
            device_data.get('project_id'),
            device_data['name'],
            device_data.get('type', ''),
            device_data.get('model', ''),
            device_data.get('manufacturer', ''),
            device_data.get('quantity', 1),
            device_data.get('unit_price', 0),
            device_data.get('total_price', 0),
            device_data.get('status', 'pending'),
            device_data.get('supplier', ''),
            device_data.get('delivery_date'),
            now,
            now
        )
        self.execute_update(query, params)
        return self.get_device_by_id(device_data['id'])
    
    def update_device(self, device_id: str, device_data: Dict) -> Optional[Dict]:
        """更新设备"""
        now = datetime.now().isoformat()
        query = """
            UPDATE devices 
            SET name = ?, type = ?, model = ?, manufacturer = ?, quantity = ?,
                unit_price = ?, total_price = ?, status = ?, supplier = ?, 
                delivery_date = ?, updated_at = ?
            WHERE id = ?
        """
        params = (
            device_data.get('name'),
            device_data.get('type', ''),
            device_data.get('model', ''),
            device_data.get('manufacturer', ''),
            device_data.get('quantity', 1),
            device_data.get('unit_price', 0),
            device_data.get('total_price', 0),
            device_data.get('status', 'pending'),
            device_data.get('supplier', ''),
            device_data.get('delivery_date'),
            now,
            device_id
        )
        self.execute_update(query, params)
        return self.get_device_by_id(device_id)
    
    def delete_device(self, device_id: str) -> bool:
        """删除设备"""
        affected = self.execute_update("DELETE FROM devices WHERE id = ?", (device_id,))
        return affected > 0
    
    # ==================== 数据库管理 ====================
    
    def get_database_info(self) -> Dict[str, Any]:
        """获取数据库信息"""
        file_size = Path(self.db_path).stat().st_size / (1024 * 1024)  # MB
        
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # 获取各表的记录数
        cursor.execute("SELECT COUNT(*) FROM projects")
        projects_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tasks")
        tasks_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM devices")
        devices_count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "path": self.db_path,
            "size_mb": round(file_size, 2),
            "tables": ["projects", "tasks", "devices"],
            "table_counts": {
                "projects": projects_count,
                "tasks": tasks_count,
                "devices": devices_count
            },
            "backup_dir": str(DB_DIR / "backup"),
            "mode": "sqlite",
            "status": "运行中"
        }
    
    def backup_database(self) -> str:
        """备份数据库"""
        backup_dir = DB_DIR / "backup"
        backup_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = backup_dir / f"epc_system_backup_{timestamp}.db"
        
        # 复制数据库文件
        import shutil
        shutil.copy2(self.db_path, backup_file)
        
        return str(backup_file)


# 全局数据库实例
db = Database()


if __name__ == "__main__":
    # 测试数据库
    print("[TEST] Testing SQLite database...")
    
    # 获取数据库信息
    info = db.get_database_info()
    print(f"[INFO] Database info: {json.dumps(info, indent=2, ensure_ascii=False)}")
    
    print("[OK] Database test completed!")

