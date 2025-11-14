from django.contrib import admin
from .models import CableSpec


@admin.register(CableSpec)
class CableSpecAdmin(admin.ModelAdmin):
    list_display = [
        'type', 
        'cross_section', 
        'current_rating', 
        'rated_voltage',
        'price_per_meter'
    ]
    list_filter = ['rated_voltage', 'insulation_material', 'core_count']
    search_fields = ['type', 'insulation_material']
    ordering = ['cross_section']

