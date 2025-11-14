from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CableSpecViewSet, calculate_cable

router = DefaultRouter()
router.register(r'cables', CableSpecViewSet, basename='cable')

urlpatterns = [
    path('', include(router.urls)),
    path('calculate/', calculate_cable, name='calculate'),
]

