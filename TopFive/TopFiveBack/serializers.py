# In TopFiveBack/serializers.py
from rest_framework import serializers
from .models import Match, TeamSeasonStats, Player, Team

# --- Existing Serializers ---
class MatchSerializer(serializers.ModelSerializer):
    home_team_name = serializers.CharField(source='home_team.name', read_only=True)
    away_team_name = serializers.CharField(source='away_team.name', read_only=True)
    league_name = serializers.CharField(source='league.name', read_only=True)
    
    class Meta:
        model = Match
        fields = [
            'league', 'league_name', 'home_team', 'home_team_name', 'away_team', 'away_team_name',
            'match_date', 'match_round', 'home_team_score', 'away_team_score', 'completed',
        ]


class PlayerSerializer(serializers.ModelSerializer):
    # שדה ה-rating הזה עדיין מתייחס ל-@property 'rating' במודל
    rating = serializers.IntegerField(read_only=True) 
    team_name = serializers.CharField(source='team.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Player
        fields = ['id', 'first_name', 'last_name', 'age', 'position_primary', 'rating', 'market_value', 'team_name']

class TeamSeasonStatsSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    win_percentage = serializers.FloatField(read_only=True)
    points_difference = serializers.IntegerField(read_only=True)
    team_id = serializers.IntegerField(source='team.id', read_only=True) 

    class Meta:
        model = TeamSeasonStats
        fields = [
            'team_id',
            'team_name', 'games_played', 'wins', 'losses', 
            'points_for', 'points_against', 'points_difference', 
            'win_percentage',
        ]
    
    # שיפור קריאות: הוספת ייצוג סטרינג עבור אובייקט TeamSeasonStats.
    # זה לא משפיע על ה-API, אבל שימושי לדיבוג ולאינטראקציה עם הדאטהבייס.
    def __str__(self):
        return f"{self.team_name} - Season Stats"
        
class FullPlayerSerializer(serializers.ModelSerializer):
    # שדה ה-rating הזה מתייחס ל-@property 'rating' במודל Player
    rating = serializers.IntegerField(read_only=True)
    # **חדש: שדה עבור הדירוג המחושב באמצעות annotate**
    # זה יאפשר לך להציג את הערך שחושב ב-QuerySet (ה-calculated_rating)
    calculated_rating = serializers.IntegerField(read_only=True) 

    team_name = serializers.CharField(source='team.name', read_only=True, allow_null=True)
    market_value = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Player
        fields = [
            'id', 'first_name', 'last_name', 'age', 'position_primary', 
            'rating', # ה-rating מה-@property במודל
            'calculated_rating', # ה-rating המחושב בשאילתה דרך annotate
            'team_name', 'contract_years', 'market_value', 'height', 'weight',
            'shooting_2p', 'shooting_3p', 'free_throws', 'rebound_def',
            'rebound_off', 'passing', 'blocking', 'defense', 'game_iq',
            'speed', 'jumping', 'strength', 'stamina', 'fitness', 'is_injured',
            'role', 'offensive_role', 'assigned_minutes','is_on_transfer_list', 
            'asking_price', 
        ]

        

# --- [NEW] Serializers for Tactics & Rotation Screen ---

class PlayerRotationSerializer(serializers.ModelSerializer):
    """
    Serializer for reading player data for the rotation screen.
    Matches the structure expected by the frontend.
    """
    name = serializers.SerializerMethodField()
    pos = serializers.CharField(source='position_primary', read_only=True)
    minutes = serializers.IntegerField(source='assigned_minutes', read_only=True)

    class Meta:
        model = Player
        fields = ('id', 'name', 'pos', 'rating', 'role', 'minutes', 'offensive_role')

    def get_name(self, obj):
        return f"{obj.first_name[0]}. {obj.last_name}"

class TeamTacticsSerializer(serializers.ModelSerializer):
    """
    Serializer for GETTING the full tactics and rotation data for a team.
    """
    players = PlayerRotationSerializer(many=True, read_only=True)
    # Rename fields to match frontend's camelCase convention
    offensiveFocus = serializers.IntegerField(source='offensive_focus_slider')
    defensiveAggressiveness = serializers.IntegerField(source='defensive_aggressiveness')
    goToGuy = serializers.PrimaryKeyRelatedField(source='go_to_guy', read_only=True)
    defensiveStopper = serializers.PrimaryKeyRelatedField(source='defensive_stopper', read_only=True)
    teamColor = serializers.CharField(source='home_jersey_color', read_only=True)

    class Meta:
        model = Team
        fields = (
            'pace', 'offensiveFocus', 'defensiveAggressiveness',
            'goToGuy', 'defensiveStopper', 'players', 'teamColor'
        )

class PlayerRotationUpdateSerializer(serializers.Serializer):
    """
    Serializer for VALIDATING the player data sent from the client during an update.
    """
    id = serializers.IntegerField()
    role = serializers.ChoiceField(choices=Player.ROLE_CHOICES)
    pos = serializers.ChoiceField(choices=Player.POSITION_CHOICES, source='position_primary')
    minutes = serializers.IntegerField(min_value=0, max_value=48, source='assigned_minutes')
    offensive_role = serializers.ChoiceField(choices=Player.OFFENSIVE_ROLE_CHOICES)

