"""
设备管理 API
提供设备的CRUD操作
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..core.database import get_db
from ..models.device import Device
from ..schemas.device import DeviceCreate, DeviceUpdate, DeviceResponse

router = APIRouter()


@router.get("/", response_model=List[DeviceResponse])
def get_devices(
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    获取设备列表
    
    参数:
    - project_id: 项目ID（可选）
    - status: 设备状态（可选）
    - skip: 跳过记录数
    - limit: 返回记录数
    """
    query = db.query(Device)
    
    if project_id:
        query = query.filter(Device.project_id == project_id)
    
    if status:
        query = query.filter(Device.status == status)
    
    devices = query.offset(skip).limit(limit).all()
    return devices


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(device_id: str, db: Session = Depends(get_db)):
    """获取单个设备详情"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="设备不存在")
    return device


@router.post("/", response_model=DeviceResponse, status_code=201)
def create_device(device: DeviceCreate, db: Session = Depends(get_db)):
    """创建新设备"""
    # 生成设备ID
    device_count = db.query(Device).filter(
        Device.project_id == device.project_id
    ).count()
    device_id = f"{device.project_id}-DEV-{device_count + 1:03d}"
    
    db_device = Device(
        id=device_id,
        **device.dict()
    )
    
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device


@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(
    device_id: str, 
    device: DeviceUpdate, 
    db: Session = Depends(get_db)
):
    """更新设备信息"""
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=404, detail="设备不存在")
    
    # 更新字段
    update_data = device.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_device, field, value)
    
    db_device.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_device)
    return db_device


@router.delete("/{device_id}")
def delete_device(device_id: str, db: Session = Depends(get_db)):
    """删除设备"""
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=404, detail="设备不存在")
    
    db.delete(db_device)
    db.commit()
    return {"message": "设备已删除", "device_id": device_id}


@router.get("/stats/summary")
def get_device_stats(
    project_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    获取设备统计信息
    
    返回:
    - 总设备数
    - 各状态设备数量
    - 设备类型分布
    """
    query = db.query(Device)
    
    if project_id:
        query = query.filter(Device.project_id == project_id)
    
    devices = query.all()
    
    # 统计各状态数量
    status_counts = {}
    type_counts = {}
    
    for device in devices:
        # 状态统计
        status = device.status or 'unknown'
        status_counts[status] = status_counts.get(status, 0) + 1
        
        # 类型统计
        device_type = device.type or 'unknown'
        type_counts[device_type] = type_counts.get(device_type, 0) + 1
    
    return {
        "total": len(devices),
        "status_distribution": status_counts,
        "type_distribution": type_counts,
        "project_id": project_id
    }

