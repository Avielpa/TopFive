# In accounts/views.py
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

# ייבא את שני ה-Serializers
from .serializers import RegisterAndAssignTeamSerializer, MyTokenObtainPairSerializer

# View חדש להתחברות שישתמש בסריאלייזר המותאם אישית
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# ה-View הקיים שלך להרשמה
class RegisterAndAssignTeamView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterAndAssignTeamSerializer
    permission_classes = [AllowAny]