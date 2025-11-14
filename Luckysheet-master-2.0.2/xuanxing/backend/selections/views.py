from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.http import HttpResponse
from .models import SelectionRecord, Whitelist
from .serializers import SelectionRecordSerializer, SelectionRecordListSerializer, WhitelistSerializer
import base64


class SelectionRecordViewSet(viewsets.ModelViewSet):
    """选型记录ViewSet"""
    
    queryset = SelectionRecord.objects.all()
    serializer_class = SelectionRecordSerializer
    
    def get_serializer_class(self):
        """根据action选择不同的序列化器"""
        if self.action == 'list':
            return SelectionRecordListSerializer
        return SelectionRecordSerializer
    
    def list(self, request, *args, **kwargs):
        """获取选型记录列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 支持按手机号筛选
        phone = request.query_params.get('phone', None)
        if phone:
            queryset = queryset.filter(phone=phone)
        
        # 支持按类型筛选
        selection_type = request.query_params.get('type', None)
        if selection_type:
            queryset = queryset.filter(selection_type=selection_type)
        
        # 支持搜索
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(project_name__icontains=search)
        
        # 分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """创建选型记录"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'id': serializer.data['id'],
                'message': '保存成功',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def destroy(self, request, *args, **kwargs):
        """删除选型记录"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': '删除成功'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'])
    def download_excel(self, request, pk=None):
        """下载Excel文件"""
        record = self.get_object()
        
        if not record.excel_content:
            return Response(
                {'error': 'Excel文件不存在'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            # 解码base64 Excel内容
            excel_data = base64.b64decode(record.excel_content)
            
            # 返回Excel文件
            response = HttpResponse(
                excel_data, 
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            filename = record.excel_filename or f'{record.project_name}.xlsx'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response(
                {'error': f'Excel下载失败: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """下载PDF文件"""
        record = self.get_object()
        
        if not record.pdf_content:
            return Response(
                {'error': 'PDF文件不存在'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            # 解码base64 PDF内容
            pdf_data = base64.b64decode(record.pdf_content)
            
            # 返回PDF文件
            response = HttpResponse(pdf_data, content_type='application/pdf')
            filename = record.pdf_filename or f'{record.project_name}.pdf'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response(
                {'error': f'PDF下载失败: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """获取统计信息"""
        # 支持按手机号筛选
        phone = request.query_params.get('phone', None)
        if phone:
            queryset = SelectionRecord.objects.filter(phone=phone)
        else:
            queryset = SelectionRecord.objects.all()
        
        total = queryset.count()
        fan_count = queryset.filter(selection_type='fan').count()
        cable_count = queryset.filter(selection_type='cable').count()
        motor_count = queryset.filter(selection_type='motor').count()
        
        return Response({
            'total_records': total,
            'fan_records': fan_count,
            'cable_records': cable_count,
            'motor_records': motor_count,
        })


@api_view(['GET', 'POST'])
def whitelist_view(request):
    """白名单API - 获取和更新白名单"""
    
    if request.method == 'GET':
        # 获取所有白名单手机号
        whitelist = Whitelist.objects.all().values_list('phone', flat=True)
        whitelist_list = list(whitelist)
        
        # 如果没有白名单，返回默认管理员
        if not whitelist_list:
            default_admin = '18968563368'
            Whitelist.objects.get_or_create(phone=default_admin)
            whitelist_list = [default_admin]
        
        return Response({
            'whitelist': whitelist_list
        })
    
    elif request.method == 'POST':
        # 更新整个白名单
        whitelist_data = request.data.get('whitelist', [])
        updated_by = request.data.get('updated_by', 'unknown')
        
        # 确保默认管理员始终在白名单中
        if '18968563368' not in whitelist_data:
            whitelist_data.append('18968563368')
        
        # 删除数据库中不在新白名单里的号码（除了默认管理员）
        Whitelist.objects.exclude(phone__in=whitelist_data).delete()
        
        # 添加新号码
        for phone in whitelist_data:
            Whitelist.objects.update_or_create(
                phone=phone,
                defaults={'updated_by': updated_by}
            )
        
        return Response({
            'message': '白名单更新成功',
            'whitelist': whitelist_data
        })

