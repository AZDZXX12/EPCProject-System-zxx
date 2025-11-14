"""
电缆计算引擎
基于IEC 60287-1-1和IEC 60364-5-52标准
"""
import math
from typing import List, Dict
from .models import CableSpec


def get_temp_correction(ambient_temp: int) -> float:
    """
    获取温度校正系数
    基于IEC 60512标准
    """
    base_temp = 30
    max_temp = 90
    return math.sqrt((max_temp - ambient_temp) / (max_temp - base_temp))


def get_grouping_correction(installation: str) -> float:
    """
    获取敷设方式校正系数
    基于IEC 60364-5-52标准
    """
    corrections = {
        'tray': 0.95,        # 桥架敷设
        'conduit': 0.80,     # 管道敷设
        'direct_burial': 1.0  # 直埋敷设
    }
    return corrections.get(installation, 1.0)


def calculate_voltage_drop(
    current: float, 
    cable: CableSpec, 
    length: float,
    voltage: int
) -> float:
    """
    计算三相平衡线路电压降(%)
    公式：ΔU% = (√3 × I × L × R × cosφ) / (10 × U) × 100
    
    Args:
        current: 负载电流(A)
        cable: 电缆规格对象
        length: 线路长度(m)
        voltage: 额定电压(V)
    
    Returns:
        电压降百分比
    """
    # 电阻 (Ω/km)
    resistance = float(cable.voltage_drop_coef) / float(cable.cross_section)
    
    # 电抗 (典型值 Ω/km)
    reactance = 0.08
    
    # 功率因数
    power_factor = 0.85
    sin_phi = math.sqrt(1 - power_factor ** 2)
    
    # 长度转换为km
    length_km = length / 1000
    
    # 电压降计算
    u_drop = (
        math.sqrt(3) * current * length_km * 
        (resistance * power_factor + reactance * sin_phi)
    ) / voltage * 100
    
    return round(u_drop, 2)


def calculate_cross_section(request_data: Dict) -> List[Dict]:
    """
    基于IEC 60287-1-1标准计算最小截面积
    
    Args:
        request_data: 包含voltage, current, length, ambient_temp, installation
    
    Returns:
        推荐电缆列表
    """
    voltage = request_data['voltage']
    current = request_data['current']
    length = request_data['length']
    ambient_temp = request_data['ambient_temp']
    installation = request_data['installation']
    
    # 从数据库加载符合条件的电缆规格
    cables = CableSpec.objects.filter(
        rated_voltage__gte=voltage,
        max_temp__gte=ambient_temp + 30
    ).order_by('cross_section')
    
    # 计算校正系数
    k1 = get_temp_correction(ambient_temp)
    k2 = get_grouping_correction(installation)
    
    valid_cables = []
    
    for cable in cables:
        # 校正后的载流量
        corrected_current = float(cable.current_rating) * k1 * k2
        
        # 检查是否满足载流量要求
        if corrected_current >= current:
            # 计算电压降
            voltage_drop = calculate_voltage_drop(
                current, 
                cable, 
                length,
                voltage
            )
            
            # 根据绝缘材料选择颜色
            insulation_colors = {
                'XLPE': '#2E8B57',
                'PVC': '#4169E1',
                'EPR': '#8B4513',
            }
            
            valid_cables.append({
                'type': cable.type,
                'cross_section': float(cable.cross_section),
                'price_per_meter': float(cable.price_per_meter),
                'voltage_drop': voltage_drop,
                'current_rating': corrected_current,
                'insulation_material': cable.insulation_material,
                'shield_type': cable.shield_type,
                'insulationColor': insulation_colors.get(
                    cable.insulation_material, 
                    '#2E8B57'
                )
            })
    
    # 按截面积排序，返回最多10个方案
    return sorted(valid_cables, key=lambda x: x['cross_section'])[:10]

