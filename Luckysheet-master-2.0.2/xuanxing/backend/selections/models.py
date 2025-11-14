from django.db import models
from django.utils import timezone


class Whitelist(models.Model):
    """手机号白名单模型 - 用于存储授权的手机号"""
    
    phone = models.CharField(max_length=11, unique=True, verbose_name="手机号")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="添加时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    updated_by = models.CharField(max_length=11, blank=True, verbose_name="操作人")
    
    class Meta:
        db_table = 'phone_whitelist'
        verbose_name = '白名单'
        verbose_name_plural = '白名单'
        ordering = ['phone']
    
    def __str__(self):
        return self.phone


class SelectionRecord(models.Model):
    """选型历史记录模型"""
    
    # 基本信息
    project_name = models.CharField(max_length=200, verbose_name="项目名称")
    selection_type = models.CharField(
        max_length=50, 
        choices=[
            ('fan', '风机选型'),
            ('cable', '电缆选型'),
            ('motor', '电机选型'),
            ('other', '其他'),
        ],
        default='fan',
        verbose_name="选型类型"
    )
    
    # 时间信息
    created_at = models.DateTimeField(default=timezone.now, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    
    # Excel文件存储（Base64编码）
    excel_filename = models.CharField(max_length=255, blank=True, null=True, verbose_name="Excel文件名")
    excel_content = models.TextField(blank=True, null=True, verbose_name="Excel文件内容(Base64)")
    excel_size = models.IntegerField(default=0, verbose_name="Excel文件大小(字节)")
    
    # PDF文件存储（Base64编码）
    pdf_filename = models.CharField(max_length=255, blank=True, null=True, verbose_name="PDF文件名")
    pdf_content = models.TextField(blank=True, null=True, verbose_name="PDF文件内容(Base64)")
    pdf_size = models.IntegerField(default=0, verbose_name="PDF文件大小(字节)")
    
    # 用户备注
    notes = models.TextField(blank=True, verbose_name="备注")
    
    # 用户手机号（用于关联用户）
    phone = models.CharField(max_length=11, blank=True, verbose_name="用户手机号")
    
    class Meta:
        db_table = 'selection_records'
        verbose_name = '选型记录'
        verbose_name_plural = '选型记录'
        ordering = ['-created_at']  # 按创建时间倒序
        indexes = [
            models.Index(fields=['project_name']),
            models.Index(fields=['selection_type']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.project_name} - {self.get_selection_type_display()} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"

