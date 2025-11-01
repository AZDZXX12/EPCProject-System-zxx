"""
设备数据Schema
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DeviceBase(BaseModel):
    """设备基础Schema"""
    project_id: str
    name: str
    type: Optional[str] = None
    model: Optional[str] = None
    specification: Optional[str] = None
    manufacturer: Optional[str] = None
    supplier: Optional[str] = None
    quantity: Optional[int] = 1
    unit: Optional[str] = '台'
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    status: Optional[str] = 'planned'
    location: Optional[str] = None
    purchase_date: Optional[datetime] = None
    arrival_date: Optional[datetime] = None
    installation_date: Optional[datetime] = None
    warranty_period: Optional[int] = None
    notes: Optional[str] = None


class DeviceCreate(DeviceBase):
    """创建设备Schema"""
    pass


class DeviceUpdate(BaseModel):
    """更新设备Schema"""
    name: Optional[str] = None
    type: Optional[str] = None
    model: Optional[str] = None
    specification: Optional[str] = None
    manufacturer: Optional[str] = None
    supplier: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    status: Optional[str] = None
    location: Optional[str] = None
    purchase_date: Optional[datetime] = None
    arrival_date: Optional[datetime] = None
    installation_date: Optional[datetime] = None
    warranty_period: Optional[int] = None
    notes: Optional[str] = None


class DeviceResponse(DeviceBase):
    """设备响应Schema"""
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

