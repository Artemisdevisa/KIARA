from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Datos adicionales', {'fields': ('telefono', 'rol')}),
    )
    list_display = ['username', 'email', 'rol', 'is_active']
    list_filter = ['rol', 'is_active']
