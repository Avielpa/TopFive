# ==============================================================================
# File: TopFive/accounts/serializers.py (Corrected Version)
# ==============================================================================
from rest_framework import serializers
from django.contrib.auth.models import User
from TopFiveBack.models import Team
from django.db import transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterAndAssignTeamSerializer(serializers.Serializer):
    """
    Serializer that handles the complex process of registration, finding a team, and assignment.
    This version includes the fix for the AttributeError on response generation.
    """
    # User fields are read/write
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    
    # Password is write-only for security
    password = serializers.CharField(write_only=True)
    
    team_name = serializers.CharField(max_length=100, write_only=True)
    arena_name = serializers.CharField(max_length=100, write_only=True)
    primary_color = serializers.CharField(max_length=50, write_only=True)
    secondary_color = serializers.CharField(max_length=50, write_only=True)

    def create(self, validated_data):
        """
        Creates a new user and assigns them to an available team in a single, safe transaction.
        This method remains the same as the previous robust version.
        """
        try:
            with transaction.atomic():
                # --- Validation Step ---
                if User.objects.filter(username__iexact=validated_data['username']).exists():
                    raise serializers.ValidationError({"username": "A user with that username already exists."})
                
                if User.objects.filter(email__iexact=validated_data['email']).exists():
                    raise serializers.ValidationError({"email": "This email address is already in use."})
                
                if Team.objects.filter(name__iexact=validated_data['team_name']).exists():
                    raise serializers.ValidationError({"team_name": "A team with this name already exists."})

                # --- User Creation Step ---
                user = User.objects.create_user(
                    username=validated_data['username'],
                    email=validated_data['email'],
                    password=validated_data['password']
                )

                # --- Team Assignment Step ---
                available_team = Team.objects.select_for_update().filter(user__isnull=True).order_by('league__level', '?').first()
                
                if not available_team:
                    raise serializers.ValidationError({"error": "Sorry, no teams are available at the moment. Please contact admin."})

                # Update the team with the new user's information
                available_team.user = user
                available_team.name = validated_data['team_name']
                available_team.coach_name = user.username
                available_team.arena_name = validated_data['arena_name']
                available_team.home_jersey_color = validated_data['primary_color']
                available_team.away_jersey_color = validated_data['secondary_color']
                available_team.titles = 0
                available_team.save()

                return user
        except Exception as e:
            raise serializers.ValidationError({"error": f"An unexpected error occurred: {str(e)}"})

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # קבל את התגובה הדיפולטיבית (שמכילה access ו-refresh tokens)
        data = super().validate(attrs)

        # הוסף את המידע המותאם אישית שלנו לתגובה
        # אחרי ש-super().validate() רץ, המשתמש זמין לנו דרך self.user
        user = self.user
        try:
            # אנחנו משתמשים ב-user.team כדי למצוא את הקבוצה המשויכת למשתמש
            # זה עובד בזכות ה-OneToOneField שהגדרנו במודל Team
            team = user.team 
            data['user_info'] = {
                'id': user.id,
                'username': user.username,
                'team_id': team.id,
                'team_name': team.name,
                'league_id': team.league.id, 
                'league_name': team.league.name,
                'overall_rating' : team.overall_rating
            }
        except AttributeError: # יקרה אם למשתמש אין קבוצה משויכת
             data['user_info'] = {
                'id': user.id,
                'username': user.username,
                'team_id': None,
                'team_name': None,
                'league_id': None,
                'league_name': None,
            }

        return data