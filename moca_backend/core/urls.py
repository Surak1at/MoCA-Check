# core/urls.py
from django.urls import path
from .views import (
    RegisterView, LoginView, MyResultsView, ForgotPasswordView,
    ResetPasswordView, SubmitResultView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('my-results/', MyResultsView.as_view()),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('my-results/', MyResultsView.as_view(), name='my-results'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordView.as_view(), name='reset-password'),
    path('submit-result/', SubmitResultView.as_view(), name='submit-result'),  # ✅ สำคัญ
]
