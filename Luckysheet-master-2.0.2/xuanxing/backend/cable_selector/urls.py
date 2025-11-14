"""
URL configuration for cable_selector project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('cables.urls')),
    path('api/selections/', include('selections.urls')),  # 选型历史记录API
]

