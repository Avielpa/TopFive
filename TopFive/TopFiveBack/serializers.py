# file: TopFiveBack/serializers.py (UPDATED)
from rest_framework import serializers
from .models import Match, TeamSeasonStats, Player # וודא שכל המודלים מיובאים

class MatchSerializer(serializers.ModelSerializer):
    home_team_name = serializers.CharField(source='home_team.name', read_only=True)
    away_team_name = serializers.CharField(source='away_team.name', read_only=True)
    league_name = serializers.CharField(source='league.name', read_only=True)
    

    class Meta:
        model = Match
        fields = [
            'league',
            'league_name',
            'home_team',
            'home_team_name',
            'away_team',
            'away_team_name',
            'match_date',
            'match_round',
            'home_team_score',
            'away_team_score',
            'completed',
        ]


class PlayerSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Player
        fields = ['id', 'first_name', 'last_name', 'age', 'position_primary', 'rating', 'market_value', 'team_name']

class TeamSeasonStatsSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    win_percentage = serializers.FloatField(read_only=True)
    points_difference = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamSeasonStats
        fields = [
            'team_name', 'games_played', 'wins', 'losses', 
            'points_for', 'points_against', 'points_difference', 
            'win_percentage',
        ]
        
class FullPlayerSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True, allow_null=True)
    market_value = serializers.IntegerField(read_only=True) # וודא שזה Read-Only כי הוא מחושב במודל
    
    class Meta:
        model = Player
        fields = [
            'id', 'first_name', 'last_name', 'age', 'position_primary', 'rating',
            'team_name', 'contract_years', 'market_value', 'height', 'weight',
            'shooting_2p', 'shooting_3p', 'free_throws', 'rebound_def',
            'rebound_off', 'passing', 'blocking', 'defense', 'game_iq',
            'speed', 'jumping', 'strength', 'stamina', 'fitness', 'is_injured',
            # גם role ו-offensive_role אם אתה רוצה שהם יהיו זמינים כאן:
            # 'role', 'offensive_role', 'assigned_minutes', 
        ]