from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework.response import Response

from api.models import User, PracticeTemplate, UserPractice, DayPlan, Slot, Rating
from api.serializers import (UserSerializer, PracticeTemplateSerializer,
                UserPracticeSerializer, UserPracticeFromTemplateSerializer, DayPlanSerializer,SlotSerializer, RatingSerializer)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, permissions

# Create your views here.

User = get_user_model()


@api_view(['GET'])
def get_users(request):
    users = User.objects.all()
    if not users.exists():
        return Response({'detail': "Users not found!"}, status=status.HTTP_404_NOT_FOUND)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'detail': "User not found!"}, status=status.HTTP_404_NOT_FOUND)
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not username or not email or not password:
        return Response({'error': 'Username, email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already taken.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username, password=password, email=email)

    return Response({'message': 'User registered successfully.'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def logout_user(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'error': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)


class PracticeTemplateViewSet(viewsets.ModelViewSet):
    queryset = PracticeTemplate.objects.all().order_by('-created_at')
    serializer_class = PracticeTemplateSerializer

    def get_permissions(self):
        """Only admin ability"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

class UserPracticeViewSet(viewsets.ModelViewSet):
    queryset = UserPractice.objects.all()
    serializer_class = UserPracticeSerializer

    def get_queryset(self):
        return UserPractice.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='from-template')
    def add_practice_from_templates(self, request):
        serializer = UserPracticeFromTemplateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        practice = serializer.save()
        return Response(UserPracticeSerializer(practice).data, status=status.HTTP_201_CREATED)
    
class DayPlanViewSet(viewsets.ModelViewSet):
    queryset = DayPlan.objects.all()
    serializer_class = DayPlanSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return DayPlan.objects.all()
        return DayPlan.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
class SlotViewSet(viewsets.ModelViewSet):
    queryset = Slot.objects.all()
    serializer_class = SlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Slot.objects.filter(user=self.request.user)
        day_plan_id = self.request.query_params.get('day_plan')
        return qs.filter(day_plan_id=day_plan_id) if day_plan_id else qs

    def perform_create(self, serializer):
        day_plan = serializer.validated_data['day_plan']
        if day_plan.user != self.request.user:
            raise PermissionDenied("Day plan does not belong to the current user")
        serializer.save(user=self.request.user) 

    @action(detail=True, methods=['patch'])
    def start(self, request, pk=None):
        slot = self.get_object()
        slot.status = 'IN_PROGRESS'
        slot.started_at_utc = timezone.now()
        slot.save()
        return Response(SlotSerializer(slot).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def finish(self, request, pk=None):
        slot = self.get_object()
        slot.status = 'DONE'
        slot.ended_at_utc = timezone.now()
        slot.save()
        return Response(SlotSerializer(slot).data, status=status.HTTP_200_OK)
    
class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Rating.objects.filter(slot__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(rated_at_utc=timezone.now())


