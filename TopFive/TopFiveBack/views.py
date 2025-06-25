# file: TopFiveBack/views.py (הגרסה המתוקנת המלאה)

from rest_framework import generics, status
from django.db.models import F, Q
from .models import Match, TeamSeasonStats, Player, Team 
from .serializers import MatchSerializer, TeamSeasonStatsSerializer, PlayerSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class MatchListByLeague(generics.ListAPIView):
    serializer_class = MatchSerializer

    def get_queryset(self):
        league_id = self.kwargs.get('league_id')
        return Match.objects.filter(league_id=league_id).order_by('match_date')

class MatchListAll(generics.ListAPIView):
    serializer_class = MatchSerializer

    def get_queryset(self):
        return Match.objects.all().order_by('match_date')
    
class LeagueStandingsView(generics.ListAPIView):
    serializer_class = TeamSeasonStatsSerializer

    def get_queryset(self):
        # The view returns team stats for the league specified in the URL.
        league_id = self.kwargs['league_id']
        # The default ordering (by wins, then points) is handled by the model's Meta class.
        return TeamSeasonStats.objects.filter(league_id=league_id)

class TransferMarketListView(generics.ListAPIView):
    """
    This view now returns all players who are either free agents (team is null)
    or have been put on the transfer list by their current team.
    It excludes players from the user's own team.
    """
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated] # אבטחת נקודת הקצה
    
    def get_queryset(self):
        user_team = self.request.user.team
        
        # שימוש ב-Q object כדי לבנות שאילתה מורכבת
        return Player.objects.filter(
            Q(team__isnull=True) | Q(is_on_transfer_list=True)
        ).exclude(
            team=user_team # לא להציג את השחקנים של הקבוצה שלי
        ).annotate(
            calculated_rating=(
                (F('shooting_2p') + F('shooting_3p') + F('free_throws') + 
                 F('rebound_def') + F('rebound_off') + F('passing') + 
                 F('blocking') + F('defense') + F('game_iq') + 
                 F('speed') + F('jumping') + F('strength') + F('stamina')) / 13.0
            )
        ).order_by('-calculated_rating')

class BuyPlayerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, player_id):
        try:
            player_to_buy = Player.objects.get(id=player_id)
            buying_team = request.user.team
        except Player.DoesNotExist:
            return Response({'detail': 'Player not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Team.DoesNotExist:
            return Response({'detail': 'User is not assigned to a team.'}, status=status.HTTP_400_BAD_REQUEST)

        # בדיקות לוגיות לפני הרכישה
        if player_to_buy.team == buying_team:
            return Response({'detail': 'Cannot buy your own player.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if buying_team.budget < player_to_buy.market_value:
            return Response({'detail': 'Your team does not have enough budget to sign this player.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- ביצוע העסקה ---
        selling_team = player_to_buy.team
        
        # 1. העברת הכסף
        buying_team.budget -= player_to_buy.market_value
        if selling_team:
            selling_team.budget += player_to_buy.market_value
            selling_team.save()
        buying_team.save()

        # 2. העברת השחקן
        player_to_buy.team = buying_team
        player_to_buy.is_on_transfer_list = False # השחקן יורד מרשימת ההעברות
        player_to_buy.save()

        return Response({
            'detail': f'Success! {player_to_buy.first_name} {player_to_buy.last_name} is now part of {buying_team.name}.',
            'new_budget': buying_team.budget
        }, status=status.HTTP_200_OK)
