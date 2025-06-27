# file: TopFiveBack/views.py (הגרסה המתוקנת המלאה)

from rest_framework import generics, status
from django.db.models import F, Q
from .models import Match, TeamSeasonStats, Player, Team 
from .serializers import MatchSerializer, TeamSeasonStatsSerializer, PlayerSerializer, FullPlayerSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import TeamLineup, Player
from .serializers import TeamLineupSerializer
from rest_framework.decorators import api_view


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
    

class SquadView(generics.ListAPIView):
    """
    This view returns all players belonging to the currently authenticated user's team.
    """
    serializer_class = FullPlayerSerializer # Use the new detailed serializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            # Get the team associated with the requesting user
            user_team = self.request.user.team
            return Player.objects.filter(team=user_team)
        except Team.DoesNotExist:
            # If user for some reason has no team, return an empty list
            return Player.objects.none()




class TeamLineupView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        team = request.user.team
        lineup, _ = TeamLineup.objects.get_or_create(team=team)
        serializer = TeamLineupSerializer(lineup)
        return Response(serializer.data)

    def post(self, request):
        team = request.user.team
        lineup, _ = TeamLineup.objects.get_or_create(team=team)

        for pos in ['pg', 'sg', 'sf', 'pf', 'c']:
            player_id = request.data.get(f'{pos}_id')
            if player_id:
                try:
                    player = Player.objects.get(id=player_id, team=team)
                    setattr(lineup, pos, player)
                except Player.DoesNotExist:
                    return Response({'error': f'Invalid player for position {pos.upper()}'}, status=400)

        lineup.save()
        serializer = TeamLineupSerializer(lineup)
        return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['GET'])
def team_lineup(request):
    try:
        team = request.user.team
        lineup = TeamLineup.objects.get(team=team)

        data = {
            'pg': FullPlayerSerializer(lineup.pg).data if lineup.pg else None,
            'sg': FullPlayerSerializer(lineup.sg).data if lineup.sg else None,
            'sf': FullPlayerSerializer(lineup.sf).data if lineup.sf else None,
            'pf': FullPlayerSerializer(lineup.pf).data if lineup.pf else None,
            'c': FullPlayerSerializer(lineup.c).data if lineup.c else None,
        }
        return Response(data)
    except TeamLineup.DoesNotExist:
        return Response({"detail": "Lineup not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def team_bench(request):
    try:
        team = request.user.team
        lineup = TeamLineup.objects.get(team=team)

        bench_players = Player.objects.filter(team=team).exclude(
            id__in=[
                lineup.pg.id if lineup.pg else None,
                lineup.sg.id if lineup.sg else None,
                lineup.sf.id if lineup.sf else None,
                lineup.pf.id if lineup.pf else None,
                lineup.c.id if lineup.c else None
            ]
        )

        serializer = FullPlayerSerializer(bench_players, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
