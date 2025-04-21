# core/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, full_name=None, **extra_fields):
        if not email:
            raise ValueError('ต้องกรอกอีเมล')
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, full_name=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, full_name, **extra_fields)


class User(AbstractUser):
    username = None  # ❌ ปิดการใช้งาน username
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class AssessmentSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pdf_url = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.id} by {self.user.email}"
