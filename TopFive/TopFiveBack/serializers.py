# file: TopFiveBack/serializers.py
from rest_framework import serializers
from TopFiveBack.models import Match

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
