from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SelectionRecordViewSet, whitelist_view

router = DefaultRouter()
router.register(r'records', SelectionRecordViewSet, basename='selection-record')

urlpatterns = [
    path('', include(router.urls)),
    path('whitelist/', whitelist_view, name='whitelist'),
]

