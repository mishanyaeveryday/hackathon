from django.urls import path
from api.views import get_users, get_user, register_user, login_user, logout_user
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/', get_users, name='get-users'),
    path('users/<uuid:pk>/', get_user, name='get-user'),
    path('users/registration/', register_user, name='register-user'),
    path('users/login/', login_user, name='login-user'),
    path('users/logout/', logout_user, name='logout-user'),
]
