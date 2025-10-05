from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PracticeTemplateViewSet, DayPlanViewSet, SlotViewSet, RatingViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import get_users, get_user, register_user, login_user, logout_user
from drf_yasg import openapi
from drf_yasg.views import get_schema_view as swagger_get_schema_view
from rest_framework.permissions import AllowAny
from ai_agent.views import generate_practices_view

schema_view = swagger_get_schema_view(
    openapi.Info(
        title="Blog API",
        default_version="1.0.0",
        description="API documentation of Blog",
    ),
    permission_classes=[AllowAny,],
    public=True,
)

router = DefaultRouter()
router.register(r'practices', PracticeTemplateViewSet, basename='practice')
router.register(r'day_plan', DayPlanViewSet, basename='day_plan')
router.register(r'slots', SlotViewSet, basename='slot')
router.register(r'ratings', RatingViewSet, basename='rating')

urlpatterns = [
    path('swagger/schema/',
         schema_view.with_ui('swagger', cache_timeout=0), name="swagger-schema"),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/', get_users, name='get-users'),
    path('users/<uuid:pk>/', get_user, name='get-user'),
    path('users/registration/', register_user, name='register-user'),
    path('users/login/', login_user, name='login-user'),
    path('users/logout/', logout_user, name='logout-user'),
    path('practices/generate/', generate_practices_view, name='generate-practices'),
] + router.urls
