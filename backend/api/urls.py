from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PracticeTemplateViewSet, UserPracticeViewSet, DayPlanViewSet, SlotViewSet, RatingViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import get_users, get_user, register_user, login_user, logout_user

router = DefaultRouter()
router.register(r'practices', PracticeTemplateViewSet, basename='practice')
router.register(r'user_practices', UserPracticeViewSet, basename='user_practice')
router.register(r'day_plan', DayPlanViewSet, basename='day_plan')
router.register(r'slots', SlotViewSet, basename='slot')
router.register(r'ratings', RatingViewSet, basename='rating')

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/', get_users, name='get-users'),
    path('users/<uuid:pk>/', get_user, name='get-user'),
    path('users/registration/', register_user, name='register-user'),
    path('users/login/', login_user, name='login-user'),
    path('users/logout/', logout_user, name='logout-user'),
] + router.urls