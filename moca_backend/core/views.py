# core/views.py

# 🔹 Django / DRF Imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from uuid import uuid4
from django.conf import settings

# 🔹 Models & Serializers
from .models import AssessmentSession
from .serializers import RegisterSerializer

User = get_user_model()

# -----------------------------------
# 🔐 Register / Login
# -----------------------------------

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'ลงทะเบียนสำเร็จ'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(request, email=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'detail': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'}, status=status.HTTP_401_UNAUTHORIZED)

# -----------------------------------
# 📁 Forgot / Reset Password
# -----------------------------------

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        user = User.objects.filter(email=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_link = f"http://localhost:3000/reset-password/{uid}/{token}"
            send_mail(
                'ลืมรหัสผ่าน - MoCA Check',
                f'กดที่ลิงก์นี้เพื่อรีเซ็ตรหัสผ่านของคุณ:\n{reset_link}',
                'noreply@moca-check.com',
                [email],
            )
        return Response({'message': 'หากมีบัญชีนี้ จะได้รับอีเมลรีเซ็ตรหัสผ่าน'})

class ResetPasswordView(APIView):
    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError):
            return Response({'error': 'ไม่พบผู้ใช้'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Token ไม่ถูกต้องหรือหมดอายุ'}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get('password')
        if not new_password or len(new_password) < 6:
            return Response({'error': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว'}, status=status.HTTP_200_OK)

# -----------------------------------
# 🧾 My Results (with Pagination)
# -----------------------------------

class SessionPagination(PageNumberPagination):
    page_size = 5

class MyResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = AssessmentSession.objects.filter(user=request.user).order_by('-created_at')
        paginator = SessionPagination()
        result_page = paginator.paginate_queryset(sessions, request)
        data = [
            {
                'pdf_url': s.pdf_url,
                'created_at': s.created_at.strftime('%Y-%m-%d %H:%M')
            } for s in result_page
        ]
        return paginator.get_paginated_response(data)

class SubmitResultView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        pdf_file = request.FILES.get('pdf')
        total_score = request.data.get('total_score')
        mis_score = request.data.get('mis_score')

        if not pdf_file:
            return Response({'error': 'ไม่พบไฟล์ PDF'}, status=400)

        # บันทึกไฟล์
        filename = f'{user.id}_{uuid4().hex}.pdf'
        path = default_storage.save(f'results/{filename}', pdf_file)

        # สร้าง session
        session = AssessmentSession.objects.create(
            user=user,
            pdf_url=request.build_absolute_uri(settings.MEDIA_URL + f'results/{filename}')
        )

        return Response({'message': 'บันทึกผลสำเร็จ', 'pdf_url': session.pdf_url})
    
class SubmitResultView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        print("🧾 FILES:", request.FILES)
        print("📊 DATA:", request.data)
        print("🙋‍♂️ USER:", request.user)
        user = request.user
        pdf_file = request.FILES.get('pdf')

        if not pdf_file:
            return Response({'error': 'ไม่พบไฟล์ PDF'}, status=400)

        filename = f'{user.id}_{uuid4().hex}.pdf'
        path = default_storage.save(f'results/{filename}', pdf_file)

        session = AssessmentSession.objects.create(
            user=user,
            pdf_url=request.build_absolute_uri(settings.MEDIA_URL + f'results/{filename}')
        )

        return Response({'message': 'บันทึกผลสำเร็จ', 'pdf_url': session.pdf_url})