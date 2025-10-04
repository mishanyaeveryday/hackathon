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
    template = PracticeTemplateSerializer(read_only=True)
    class Meta:
        model = UserPractice
        fields = '__all__'

class UserPracticeFromTemplateSerializer(serializers.Serializer):
    template_id = serializers.UUIDField()

    def create(self, validated_data):
        template = PracticeTemplate.objects.get(id=validated_data['template_id'])
        return UserPractice.objects.create(
            user=self.context['request'].user,
            template=template,
            is_active=True
        )
class DayPlanSerializer(serializers.ModelSerializer):
      user = serializers.HiddenField(default=serializers.CurrentUserDefault())
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

        
