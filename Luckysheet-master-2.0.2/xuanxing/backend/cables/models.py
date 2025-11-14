from django.db import models


class CableSpec(models.Model):
    """电缆规格模型"""
    
    type = models.CharField(max_length=50, verbose_name='型号')
    core_count = models.IntegerField(verbose_name='芯数')
    cross_section = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        verbose_name='截面积(mm²)'
    )
    current_rating = models.DecimalField(
        max_digits=7, 
        decimal_places=2, 
        verbose_name='载流量(A)'
    )
    rated_voltage = models.IntegerField(verbose_name='额定电压(V)')
    max_temp = models.IntegerField(verbose_name='最高工作温度(℃)')
    insulation_material = models.CharField(
        max_length=50, 
        verbose_name='绝缘材料',
        default='XLPE'
    )
    shield_type = models.CharField(
        max_length=20, 
        verbose_name='屏蔽类型',
        default='copper'
    )
    price_per_meter = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name='单价(元/米)'
    )
    voltage_drop_coef = models.DecimalField(
        max_digits=10, 
        decimal_places=6, 
        verbose_name='电压降系数(mV/(A·km))',
        default=0.727
    )
    
    class Meta:
        db_table = 'cable_specs'
        verbose_name = '电缆规格'
        verbose_name_plural = '电缆规格'
        ordering = ['cross_section']
    
    def __str__(self):
        return f"{self.type} - {self.cross_section}mm²"

