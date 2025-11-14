from rest_framework import serializers
from django.utils import timezone
from .models import SelectionRecord, Whitelist


class SelectionRecordSerializer(serializers.ModelSerializer):
    """选型记录序列化器（完整版，包含文件内容）"""
    
    class Meta:
        model = SelectionRecord
        fields = [
            'id',
            'project_name',
            'selection_type',
            'created_at',
            'updated_at',
            'excel_filename',
            'excel_content',
            'excel_size',
            'pdf_filename',
            'pdf_content',
            'pdf_size',
            'notes',
            'phone',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """自定义输出格式"""
        data = super().to_representation(instance)
        # 🔥 修复：转换为本地时区（Asia/Shanghai）后再格式化
        data['created_at'] = timezone.localtime(instance.created_at).strftime('%Y-%m-%d %H:%M:%S')
        data['updated_at'] = timezone.localtime(instance.updated_at).strftime('%Y-%m-%d %H:%M:%S')
        return data


class SelectionRecordListSerializer(serializers.ModelSerializer):
    """选型记录列表序列化器（不包含文件内容，提高列表加载速度）"""
    
    has_excel = serializers.SerializerMethodField()
    has_pdf = serializers.SerializerMethodField()
    
    class Meta:
        model = SelectionRecord
        fields = [
            'id',
            'project_name',
            'selection_type',
            'created_at',
            'updated_at',
            'excel_filename',
            'excel_size',
            'pdf_filename',
            'pdf_size',
            'has_excel',
            'has_pdf',
            'notes',
            'phone',
        ]
        read_only_fields = fields
    
    def get_has_excel(self, obj):
        """检查是否有Excel文件"""
        return bool(obj.excel_content)
    
    def get_has_pdf(self, obj):
        """检查是否有PDF文件"""
        return bool(obj.pdf_content)
    
    def to_representation(self, instance):
        """自定义输出格式"""
        data = super().to_representation(instance)
        # 🔥 修复：转换为本地时区（Asia/Shanghai）后再格式化
        data['created_at'] = timezone.localtime(instance.created_at).strftime('%Y-%m-%d %H:%M:%S')
        data['updated_at'] = timezone.localtime(instance.updated_at).strftime('%Y-%m-%d %H:%M:%S')
        return data


class WhitelistSerializer(serializers.ModelSerializer):
    """白名单序列化器"""
    
    class Meta:
        model = Whitelist
        fields = ['id', 'phone', 'created_at', 'updated_at', 'updated_by']
        read_only_fields = ['id', 'created_at', 'updated_at']

