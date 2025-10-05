from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from api.models import User, PracticeTemplate,  DayPlan, Slot, Rating
from api.serializers import (UserSerializer, PracticeTemplateSerializer,
                             DayPlanSerializer, SlotSerializer, RatingSerializer)
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, permissions
import random
from datetime import timedelta

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
    serializer_class = PracticeTemplateSerializer

    def get_permissions(self):
        """Only admin ability for modifications"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return PracticeTemplate.objects.all().order_by('-created_at')

        # Для обычного пользователя
        selected_only = self.request.query_params.get(
            "selected_only", "false").lower() == "true"
        qs = PracticeTemplate.objects.filter(user=user)
        if selected_only:
            qs = qs.filter(is_selected=True)
        return qs.order_by('-created_at')


class DayPlanViewSet(viewsets.ModelViewSet):
    queryset = DayPlan.objects.all()
    serializer_class = DayPlanSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [p() for p in permission_classes]

    def get_queryset(self):
        qs = DayPlan.objects.filter(user=self.request.user)
        local_date = self.request.query_params.get('local_date')
        if local_date:
            qs = qs.filter(local_date=local_date)
        return qs.order_by('-local_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        local_date = request.data.get('local_date')
        timezone = request.data.get('timezone')
        if not local_date or not timezone:
            return Response({'detail': 'local_date and timezone are required'}, status=status.HTTP_400_BAD_REQUEST)

        obj, created = DayPlan.objects.get_or_create(
            user=request.user,
            local_date=local_date,
            defaults={'timezone': timezone}
        )
        if not created and obj.timezone != timezone:
            obj.timezone = timezone
            obj.save(update_fields=['timezone'])

        ser = self.get_serializer(obj)
        return Response(ser.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def get_queryset(self):
        qs = DayPlan.objects.filter(user=self.request.user)
        ld = self.request.query_params.get('local_date')
        if ld:
            qs = qs.filter(local_date=ld)
        return qs.order_by('-local_date')


class SlotViewSet(viewsets.ModelViewSet):
    queryset = Slot.objects.all()
    serializer_class = SlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Slot.objects.filter(user=self.request.user)
        day_plan_id = self.request.query_params.get('day_plan')
        return qs.filter(day_plan_id=day_plan_id) if day_plan_id else qs

    def create(self, request, *args, **kwargs):
        day_plan_id = request.data.get('day_plan')
        if not day_plan_id:
            return Response(
                {"detail": "Field 'day_plan' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            day_plan = DayPlan.objects.get(id=day_plan_id, user=request.user)
        except DayPlan.DoesNotExist:
            raise PermissionDenied(
                "Day plan does not belong to the current user")

        selected_practices = list(
            PracticeTemplate.objects.filter(
                user=request.user, is_selected=True)
        )

        if not selected_practices:
            return Response(
                {"detail": "No selected practices found for user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        random.shuffle(selected_practices)
        selected_practices = selected_practices[:6]

        created_slots = []
        for i, practice in enumerate(selected_practices):
            slot = Slot.objects.create(
                user=request.user,
                day_plan=day_plan,
                user_practice=practice,
                time_of_day=random.choice(['MORNING', 'AFTERNOON', 'EVENING']),
                scheduled_at_utc=timezone.now() + timedelta(hours=i)
            )
            created_slots.append(slot)

        serializer = self.get_serializer(created_slots, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
