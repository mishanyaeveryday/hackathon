# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.models import PracticeTemplate
from api.serializers import PracticeTemplateSerializer
from .ai_client import PracticeGenerator

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_practices_view(request):
    user_input = request.data.get("message", "")

    if not user_input:
        return Response({"error": "message field is required"}, status=status.HTTP_400_BAD_REQUEST)

    generator = PracticeGenerator()
    practices = generator.generate_practices(user_input)

    created = []
    for p in practices:
        obj = PracticeTemplate.objects.create(
            user=request.user,
            title=p.get("title", "Untitled"),
            description=p.get("description", ""),
            default_duration_sec=p.get("default_duration_sec", 60),
        )
        created.append(obj)

    serializer = PracticeTemplateSerializer(created, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
