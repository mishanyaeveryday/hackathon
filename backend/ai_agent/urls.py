from django.urls import path
from ai_agent.views import generate_practices_view


urlpatterns = [path('practices/generate/', generate_practices_view, name='generate-practices')]
