from rest_framework import serializers
from api.models import User, PracticeTemplate, DayPlan, UserPractice, Slot, Rating

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class PracticeTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeTemplate
        fields = '__all__'

class UserPracticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPractice
        fields = '__all__'

class DayPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = DayPlan
        fields = '__all__'

class SlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slot
        fields = '__all__'

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'
        
