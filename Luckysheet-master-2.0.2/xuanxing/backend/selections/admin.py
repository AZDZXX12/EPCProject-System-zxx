from django.contrib import admin
from .models import SelectionRecord


@admin.register(SelectionRecord)
class SelectionRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'project_name', 'selection_type', 'created_at', 'notes']
    list_filter = ['selection_type', 'created_at']
    search_fields = ['project_name', 'notes']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('基本信息', {
            'fields': ('project_name', 'selection_type', 'notes')
        }),
        ('数据', {
            'fields': ('input_params', 'result_data')
        }),
        ('PDF文件', {
            'fields': ('pdf_filename', 'pdf_content'),
            'classes': ('collapse',)
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

