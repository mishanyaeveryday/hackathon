from django.contrib import admin
from django.contrib import admin
from .models import User,PracticeTemplate, UserPractice, DayPlan, Slot, Rating
# Register your models here.
admin.site.register(User)
admin.site.register(PracticeTemplate)
admin.site.register(UserPractice)
admin.site.register(DayPlan)
admin.site.register(Slot)
admin.site.register(Rating)
