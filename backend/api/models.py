from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
# Create your models here.

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    def __str__(self):
        return self.username

class PracticeTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    default_duration_sec = models.PositiveIntegerField(default=600)  
    video = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class UserPractice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_practices")
    template = models.ForeignKey(PracticeTemplate, on_delete=models.CASCADE, related_name="user_practices")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.custom_title or self.template.title


class DayPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="day_plans")
    local_date = models.DateField()
    timezone = models.CharField(max_length=64, default="UTC")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "local_date")
        ordering = ["-local_date"]
        constraints = [
        models.UniqueConstraint(fields=['user','local_date'], name='uniq_user_date')
    ]

    def __str__(self):
        return f"{self.user} — {self.local_date}"


class Slot(models.Model):

    class Variant(models.TextChoices):
        DO = "DO"
        CONTROL = "CONTROL"

    class Status(models.TextChoices):
        PLANNED = "PLANNED"
        IN_PROGRESS = "IN_PROGRESS"
        DONE = "DONE"
        MISSED = "MISSED"
        CANCELLED = "CANCELLED"

    class TimeOfDay(models.TextChoices):
        MORNING = "MORNING"
        AFTERNOON = "AFTERNOON"
        EVENING = "EVENING"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="slots")
    day_plan = models.ForeignKey(DayPlan, on_delete=models.CASCADE, related_name="slots")
    user_practice = models.ForeignKey(UserPractice, on_delete=models.SET_NULL, null=True, related_name="slots")

    variant = models.CharField(max_length=10, choices=Variant.choices, default=Variant.DO)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PLANNED)
    time_of_day = models.CharField(max_length=15, choices=TimeOfDay.choices)

    scheduled_at_utc = models.DateTimeField()
    started_at_utc = models.DateTimeField(null=True, blank=True)
    ended_at_utc = models.DateTimeField(null=True, blank=True)

    duration_sec_snapshot = models.PositiveIntegerField(null=True, blank=True)
    display_payload = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_at_utc"]

    def __str__(self):
        return f"{self.user} — {self.time_of_day} — {self.status}"


class Rating(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slot = models.OneToOneField(Slot, on_delete=models.CASCADE, related_name="rating")

    mood = models.PositiveSmallIntegerField(default=0)
    ease = models.PositiveSmallIntegerField(default=0)
    satisfaction = models.PositiveSmallIntegerField(default=0)
    nervousness = models.PositiveSmallIntegerField(default=0)

    rated_at_utc = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rating for {self.slot_id} ({self.mood}/{self.satisfaction})"


