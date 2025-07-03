# file: TopFiveBack/views.py (UPDATED)

from rest_framework import generics, status
from django.db import transaction
from django.db.models import F, Q
from .models import Match, TeamSeasonStats, Player, Team 
from .serializers import MatchSerializer, TeamSeasonStatsSerializer, PlayerSerializer, FullPlayerSerializer 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status



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
        league_id = self.kwargs['league_id']
        return TeamSeasonStats.objects.filter(league_id=league_id)

class TransferMarketListView(generics.ListAPIView):
    """
    This view now returns all players who are either free agents (team is null)
    or have been put on the transfer list by their current team.
    It excludes players from the user's own team.
    """
    serializer_class = FullPlayerSerializer # *** Changed to FullPlayerSerializer ***
    permission_classes = [IsAuthenticated] 
    
    def get_queryset(self):
        user_team = self.request.user.team
        
        return Player.objects.filter(
            Q(team__isnull=True) | Q(is_on_transfer_list=True)
        ).exclude(
            team=user_team 
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

        # Retrieve contract_years from the request data
        contract_years = request.data.get('contract_years') # Get contract_years from request body
        if not contract_years:
            return Response({'detail': 'Contract years not provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            contract_years = int(contract_years)
            if not (1 <= contract_years <= 5): # Validate contract years range
                return Response({'detail': 'Contract years must be between 1 and 5.'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'detail': 'Invalid contract years format.'}, status=status.HTTP_400_BAD_REQUEST)


        # בדיקות לוגיות לפני הרכישה
        if player_to_buy.team == buying_team:
            return Response({'detail': 'Cannot buy your own player.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add squad size check
        MAX_SQUAD_SIZE = 15 # Define your max squad size
        if buying_team.players.count() >= MAX_SQUAD_SIZE:
            return Response({'detail': f'Your squad is full. Max {MAX_SQUAD_SIZE} players allowed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Allow buying players already on a team only if they are explicitly on the transfer list
        if player_to_buy.team and not player_to_buy.is_on_transfer_list:
            return Response({"detail": "This player is not currently on the transfer list."}, status=status.HTTP_400_BAD_REQUEST)

        if buying_team.budget < player_to_buy.market_value:
            return Response({'detail': 'Your team does not have enough budget to sign this player.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- ביצוע העסקה ---
        selling_team = player_to_buy.team # זה יהיה null אם השחקן הוא Free Agent
        
        try:
            with transaction.atomic(): # שימוש בטרנזקציה אטומית
                # 1. העברת הכסף
                buying_team.budget -= player_to_buy.market_value
                buying_team.save()

                if selling_team: # אם השחקן נמכר מקבוצה אחרת
                    selling_team.budget += player_to_buy.market_value
                    selling_team.save()

                # 2. העברת השחקן ועדכון שנות חוזה
                player_to_buy.team = buying_team
                player_to_buy.is_on_transfer_list = False # השחקן יורד מרשימת ההעברות
                player_to_buy.contract_years = contract_years # Update contract years here
                player_to_buy.save()

                return Response({
                    'detail': f'Success! {player_to_buy.first_name} {player_to_buy.last_name} is now part of {buying_team.name}.',
                    'new_budget': buying_team.budget,
                    'player_id': player_to_buy.id, # Send player ID back for removal from frontend list
                }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': f'Transaction failed due to an unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SquadView(generics.ListAPIView):
    """
    This view returns all players belonging to the currently authenticated user's team.
    """
    serializer_class = FullPlayerSerializer # Use the new detailed serializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            user_team = self.request.user.team
            return Player.objects.filter(team=user_team)
        except Team.DoesNotExist:
            return Player.objects.none()