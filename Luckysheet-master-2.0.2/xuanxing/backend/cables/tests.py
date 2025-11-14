from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import CableSpec
from .calculators import (
    get_temp_correction,
    get_grouping_correction,
    calculate_voltage_drop
)


class CableCalculatorTestCase(TestCase):
    """电缆计算器单元测试"""
    
    def setUp(self):
        """创建测试数据"""
        self.cable = CableSpec.objects.create(
            type='YJV-0.6/1kV',
            core_count=4,
            cross_section=25.00,
            current_rating=115.00,
            rated_voltage=380,
            max_temp=90,
            insulation_material='XLPE',
            shield_type='copper',
            price_per_meter=42.50,
            voltage_drop_coef=0.727
        )
    
    def test_temp_correction_normal(self):
        """测试常温温度校正"""
        k = get_temp_correction(30)
        self.assertAlmostEqual(k, 1.0, places=2)
    
    def test_temp_correction_high_temp(self):
        """测试高温环境温度校正"""
        k = get_temp_correction(40)
        self.assertAlmostEqual(k, 0.91, places=2)
    
    def test_grouping_correction_tray(self):
        """测试桥架敷设校正系数"""
        k = get_grouping_correction('tray')
        self.assertEqual(k, 0.95)
    
    def test_grouping_correction_conduit(self):
        """测试管道敷设校正系数"""
        k = get_grouping_correction('conduit')
        self.assertEqual(k, 0.80)
    
    def test_voltage_drop_calculation(self):
        """测试电压降计算"""
        voltage_drop = calculate_voltage_drop(
            current=100,
            cable=self.cable,
            length=50,
            voltage=380
        )
        # 电压降应该在合理范围内
        self.assertGreater(voltage_drop, 0)
        self.assertLess(voltage_drop, 10)


class CableAPITestCase(APITestCase):
    """电缆API接口测试"""
    
    def setUp(self):
        """创建测试数据"""
        CableSpec.objects.create(
            type='YJV-0.6/1kV',
            core_count=4,
            cross_section=25.00,
            current_rating=115.00,
            rated_voltage=380,
            max_temp=90,
            insulation_material='XLPE',
            shield_type='copper',
            price_per_meter=42.50,
            voltage_drop_coef=0.727
        )
        CableSpec.objects.create(
            type='YJV-0.6/1kV',
            core_count=4,
            cross_section=35.00,
            current_rating=145.00,
            rated_voltage=380,
            max_temp=90,
            insulation_material='XLPE',
            shield_type='copper',
            price_per_meter=58.00,
            voltage_drop_coef=0.524
        )
    
    def test_calculate_cable_success(self):
        """测试成功计算电缆"""
        data = {
            'voltage': 380,
            'current': 100,
            'length': 50,
            'ambient_temp': 30,
            'installation': 'tray'
        }
        
        response = self.client.post('/api/calculate/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreater(len(response.data), 0)
        
        # 检查返回数据结构
        first_result = response.data[0]
        self.assertIn('type', first_result)
        self.assertIn('cross_section', first_result)
        self.assertIn('voltage_drop', first_result)
    
    def test_calculate_cable_invalid_data(self):
        """测试无效输入数据"""
        data = {
            'voltage': 999,  # 无效电压
            'current': 100,
            'length': 50,
            'ambient_temp': 30,
            'installation': 'tray'
        }
        
        response = self.client.post('/api/calculate/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_cable_specs(self):
        """测试获取电缆规格列表"""
        response = self.client.get('/api/cables/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

