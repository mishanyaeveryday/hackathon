from rest_framework import serializers
from api.models import User, PracticeTemplate, DayPlan,Slot, Rating

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class PracticeTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeTemplate
        fields = '__all__'

class DayPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = DayPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class SlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slot
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'started_at_utc', 'ended_at_utc']

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'
        read_only_fields = ['id', 'rated_at_utc']

        
