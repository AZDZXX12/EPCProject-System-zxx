from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CableSpec
from .serializers import (
    CableSpecSerializer,
    CableCalculationRequestSerializer,
    CableResultSerializer
)
from .calculators import calculate_cross_section


class CableSpecViewSet(viewsets.ReadOnlyModelViewSet):
    """电缆规格视图集"""
    
    queryset = CableSpec.objects.all()
    serializer_class = CableSpecSerializer


@api_view(['POST'])
def calculate_cable(request):
    """
    电缆选型计算API
    
    POST /api/calculate/
    {
        "voltage": 380,
        "current": 100,
        "length": 50,
        "ambient_temp": 30,
        "installation": "tray"
    }
    """
    serializer = CableCalculationRequestSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        results = calculate_cross_section(serializer.validated_data)
        
        if not results:
            return Response(
                {
                    'error': '未找到符合要求的电缆规格，请调整参数'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        result_serializer = CableResultSerializer(results, many=True)
        return Response(result_serializer.data)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

