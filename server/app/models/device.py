"""
设备数据模型
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from sqlalchemy.sql import func
from ..core.database import Base


class Device(Base):
    """设备表"""
    __tablename__ = "devices"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String)  # 设备类型
    model = Column(String)  # 设备型号
    specification = Column(Text)  # 规格参数
    manufacturer = Column(String)  # 制造商
    supplier = Column(String)  # 供应商
    quantity = Column(Integer, default=1)  # 数量
    unit = Column(String, default='台')  # 单位
    unit_price = Column(Float)  # 单价
    total_price = Column(Float)  # 总价
    status = Column(String, default='planned')  # 状态: planned, ordered, arrived, installing, installed
    location = Column(String)  # 安装位置
    purchase_date = Column(DateTime)  # 采购日期
    arrival_date = Column(DateTime)  # 到货日期
    installation_date = Column(DateTime)  # 安装日期
    warranty_period = Column(Integer)  # 质保期（月）
    notes = Column(Text)  # 备注
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Device {self.id}: {self.name}>"
