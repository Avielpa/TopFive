# file: TopFiveBack/serializers.py
from rest_framework import serializers
from .models import Match, TeamSeasonStats, Player, Team

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
    # --- חדש: הוספת שם הקבוצה הנוכחית של השחקן ---
    # זה יעזור לנו להציג מי המוכר, או להראות "Free Agent" אם אין קבוצה
    team_name = serializers.CharField(source='team.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Player
        fields = ['id', 'first_name', 'last_name', 'age', 'position_primary', 'rating', 'market_value', 'team_name']

# New Serializer for the TeamSeasonStats model, formatted for league standings.
class TeamSeasonStatsSerializer(serializers.ModelSerializer):
    # Fetch the team name from the related Team object for easy display.
    team_name = serializers.CharField(source='team.name', read_only=True)
    # Include the calculated properties from the model.
    win_percentage = serializers.FloatField(read_only=True)
    points_difference = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamSeasonStats
        fields = [
            'team_name', 'games_played', 'wins', 'losses', 
            'points_for', 'points_against', 'points_difference', 
            'win_percentage'
        ]
        
class FullPlayerSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True, allow_null=True)

    class Meta:
        model = Player
        # --- התיקון כאן: הוספת 'team_name' לרשימת השדות ---
        fields = [
            'id', 'first_name', 'last_name', 'age', 'position_primary', 'rating',
            'team_name', 'contract_years', 'market_value', 'height', 'weight',
            'shooting_2p', 'shooting_3p', 'free_throws', 'rebound_def',
            'rebound_off', 'passing', 'blocking', 'defense', 'game_iq',
            'speed', 'jumping', 'strength', 'stamina', 'fitness', 'is_injured'
        ]

# serializers.py
from rest_framework import serializers
from .models import TeamLineup, Player

class PlayerMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'first_name', 'last_name', 'rating', 'position_primary']

class TeamLineupSerializer(serializers.ModelSerializer):
    pg = PlayerMiniSerializer(read_only=True)
    sg = PlayerMiniSerializer(read_only=True)
    sf = PlayerMiniSerializer(read_only=True)
    pf = PlayerMiniSerializer(read_only=True)
    c = PlayerMiniSerializer(read_only=True)

    pg_id = serializers.IntegerField(write_only=True, required=False)
    sg_id = serializers.IntegerField(write_only=True, required=False)
    sf_id = serializers.IntegerField(write_only=True, required=False)
    pf_id = serializers.IntegerField(write_only=True, required=False)
    c_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = TeamLineup
        fields = ['pg', 'sg', 'sf', 'pf', 'c', 'pg_id', 'sg_id', 'sf_id', 'pf_id', 'c_id']
