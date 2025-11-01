"""
SQLite 数据库管理器
用于桌面应用的本地数据存储
"""
import sqlite3
from pathlib import Path
import os
import shutil
from datetime import datetime
from typing import Optional, List, Dict, Any


class SQLiteManager:
    """SQLite数据库管理器"""
    
    def __init__(self, db_name: str = "epc_data.db"):
        """初始化数据库管理器"""
        # 获取用户数据目录
        self.base_dir = self._get_app_data_dir()
        self.db_path = self.base_dir / 'database' / db_name
        self.backup_dir = self.base_dir / 'backup'
        
        # 创建必要的目录
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # 初始化数据库
        self.init_database()
        
        print(f"✅ 数据库已初始化: {self.db_path}")
    
    def _get_app_data_dir(self) -> Path:
        """获取应用数据目录"""
        if os.name == 'nt':  # Windows
            base = Path(os.environ.get('APPDATA', ''))
        elif os.name == 'posix':
            if 'darwin' in os.sys.platform:  # macOS
                base = Path.home() / 'Library' / 'Application Support'
            else:  # Linux
                base = Path.home() / '.config'
        else:
            base = Path.home() / '.epc-management'
        
        return base / 'EPC项目管理系统'
    
    def get_connection(self) -> sqlite3.Connection:
        """获取数据库连接"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row  # 使查询结果可以像字典一样访问
        return conn
    
    def init_database(self):
        """初始化数据库表结构"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # 创建projects表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    status TEXT DEFAULT 'planning',
                    progress INTEGER DEFAULT 0,
                    budget REAL,
                    start_date TEXT,
                    end_date TEXT,
                    manager TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 创建tasks表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    name TEXT NOT NULL,
                    description TEXT,
                    start_date TEXT,
                    end_date TEXT,
                    progress REAL DEFAULT 0,
                    status TEXT DEFAULT 'pending',
                    assignee TEXT,
                    priority TEXT DEFAULT 'medium',
                    dependencies TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                )
            ''')
            
            # 创建devices表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS devices (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    name TEXT NOT NULL,
                    type TEXT,
                    model TEXT,
                    quantity INTEGER DEFAULT 1,
                    unit_price REAL,
                    total_price REAL,
                    supplier TEXT,
                    status TEXT DEFAULT 'planned',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                )
            ''')
            
            # 创建documents表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    name TEXT NOT NULL,
                    type TEXT,
                    file_path TEXT,
                    size INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                )
            ''')
            
            # 创建users表（用于权限管理）
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            print("✅ 数据库表结构初始化完成")
            
        except Exception as e:
            print(f"❌ 数据库初始化失败: {e}")
            conn.rollback()
        finally:
            conn.close()
    
    def backup_database(self) -> str:
        """备份数据库"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = self.backup_dir / f"epc_data_{timestamp}.db"
        
        try:
            shutil.copy2(self.db_path, backup_path)
            print(f"✅ 数据库已备份至: {backup_path}")
            
            # 清理旧备份（保留最近30个）
            self._cleanup_old_backups(keep=30)
            
            return str(backup_path)
        except Exception as e:
            print(f"❌ 数据库备份失败: {e}")
            raise
    
    def _cleanup_old_backups(self, keep: int = 30):
        """清理旧备份文件"""
        backups = sorted(self.backup_dir.glob("epc_data_*.db"))
        if len(backups) > keep:
            for backup in backups[:-keep]:
                backup.unlink()
                print(f"🗑️  删除旧备份: {backup.name}")
    
    def restore_database(self, backup_path: str):
        """从备份恢复数据库"""
        try:
            shutil.copy2(backup_path, self.db_path)
            print(f"✅ 数据库已从备份恢复: {backup_path}")
        except Exception as e:
            print(f"❌ 数据库恢复失败: {e}")
            raise
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """执行查询并返回结果"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()
    
    def execute_update(self, query: str, params: tuple = ()) -> int:
        """执行更新/插入/删除操作"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(query, params)
            conn.commit()
            return cursor.rowcount
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def get_database_info(self) -> Dict[str, Any]:
        """获取数据库信息"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # 获取所有表名
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            
            # 获取每个表的行数
            table_counts = {}
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                table_counts[table] = cursor.fetchone()[0]
            
            # 获取数据库文件大小
            db_size = self.db_path.stat().st_size / (1024 * 1024)  # MB
            
            return {
                "path": str(self.db_path),
                "size_mb": round(db_size, 2),
                "tables": tables,
                "table_counts": table_counts,
                "backup_dir": str(self.backup_dir)
            }
        finally:
            conn.close()


# 全局数据库实例
db_manager = SQLiteManager()


