"""
API端点测试
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# 添加父目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from quick_start_sqlite import app

client = TestClient(app)


class TestHealthCheck:
    """健康检查测试"""
    
    def test_health_check(self):
        """测试健康检查端点"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data


class TestProjects:
    """项目API测试"""
    
    def test_get_projects(self):
        """测试获取项目列表"""
        response = client.get("/api/projects")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_project(self):
        """测试创建项目"""
        project_data = {
            "id": "TEST-001",
            "name": "测试项目",
            "description": "这是一个测试项目",
            "start_date": "2024-01-01",
            "end_date": "2024-12-31",
            "status": "in_progress",
            "progress": 0
        }
        response = client.post("/api/projects", json=project_data)
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["name"] == project_data["name"]
    
    def test_get_project_by_id(self):
        """测试获取单个项目"""
        # 先创建一个项目
        project_data = {
            "id": "TEST-002",
            "name": "测试项目2",
            "description": "测试描述",
            "start_date": "2024-01-01",
            "end_date": "2024-12-31"
        }
        client.post("/api/projects", json=project_data)
        
        # 获取项目
        response = client.get(f"/api/projects/{project_data['id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == project_data["id"]
    
    def test_update_project(self):
        """测试更新项目"""
        # 先创建项目
        project_id = "TEST-003"
        project_data = {
            "id": project_id,
            "name": "原始名称",
            "description": "原始描述",
            "start_date": "2024-01-01",
            "end_date": "2024-12-31"
        }
        client.post("/api/projects", json=project_data)
        
        # 更新项目
        update_data = {
            "name": "更新后的名称",
            "description": "更新后的描述",
            "progress": 50
        }
        response = client.put(f"/api/projects/{project_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["progress"] == update_data["progress"]
    
    def test_delete_project(self):
        """测试删除项目"""
        # 先创建项目
        project_id = "TEST-004"
        project_data = {
            "id": project_id,
            "name": "待删除项目",
            "start_date": "2024-01-01",
            "end_date": "2024-12-31"
        }
        client.post("/api/projects", json=project_data)
        
        # 删除项目
        response = client.delete(f"/api/projects/{project_id}")
        assert response.status_code == 200
        
        # 验证已删除
        get_response = client.get(f"/api/projects/{project_id}")
        assert get_response.status_code == 404


class TestTasks:
    """任务API测试"""
    
    def test_get_tasks(self):
        """测试获取任务列表"""
        response = client.get("/api/tasks")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_task(self):
        """测试创建任务"""
        task_data = {
            "id": "TASK-001",
            "text": "测试任务",
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "progress": 0,
            "project_id": "TEST-001"
        }
        response = client.post("/api/tasks", json=task_data)
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["text"] == task_data["text"]
    
    def test_update_task(self):
        """测试更新任务"""
        task_id = "TASK-002"
        # 创建任务
        task_data = {
            "id": task_id,
            "text": "原始任务",
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "progress": 0
        }
        client.post("/api/tasks", json=task_data)
        
        # 更新任务
        update_data = {
            "text": "更新后的任务",
            "progress": 75
        }
        response = client.put(f"/api/tasks/{task_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["progress"] == update_data["progress"]


class TestDevices:
    """设备API测试"""
    
    def test_get_devices(self):
        """测试获取设备列表"""
        response = client.get("/api/devices")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_device(self):
        """测试创建设备"""
        device_data = {
            "id": "DEV-001",
            "name": "测试设备",
            "type": "pump",
            "status": "available",
            "project_id": "TEST-001"
        }
        response = client.post("/api/devices", json=device_data)
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["name"] == device_data["name"]


class TestErrorHandling:
    """错误处理测试"""
    
    def test_404_not_found(self):
        """测试404错误"""
        response = client.get("/api/projects/NON-EXISTENT")
        assert response.status_code == 404
    
    def test_invalid_data(self):
        """测试无效数据"""
        invalid_data = {
            "name": "缺少必需字段"
            # 缺少start_date和end_date
        }
        response = client.post("/api/projects", json=invalid_data)
        assert response.status_code in [400, 422]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
