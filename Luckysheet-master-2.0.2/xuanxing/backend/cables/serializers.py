from rest_framework import serializers
from .models import CableSpec


class CableSpecSerializer(serializers.ModelSerializer):
    """电缆规格序列化器"""
    
    class Meta:
        model = CableSpec
        fields = '__all__'


class CableCalculationRequestSerializer(serializers.Serializer):
    """电缆计算请求序列化器"""
    
    voltage = serializers.ChoiceField(choices=[220, 380, 600])
    current = serializers.FloatField(min_value=0)
    length = serializers.FloatField(min_value=0)
    ambient_temp = serializers.ChoiceField(choices=[20, 30, 40])
    installation = serializers.ChoiceField(
        choices=['tray', 'conduit', 'direct_burial']
    )


class CableResultSerializer(serializers.Serializer):
    """电缆计算结果序列化器"""
    
    type = serializers.CharField()
    cross_section = serializers.FloatField()
    price_per_meter = serializers.FloatField()
    voltage_drop = serializers.FloatField()
    current_rating = serializers.FloatField()
    insulation_material = serializers.CharField()
    shield_type = serializers.CharField()
    insulationColor = serializers.CharField(required=False)

