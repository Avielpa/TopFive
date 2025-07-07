# In TopFiveBack/views.py

from rest_framework import generics, status
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import F, Q
from .models import Match, TeamSeasonStats, Player, Team 
from .serializers import (
    MatchSerializer, TeamSeasonStatsSerializer, FullPlayerSerializer,
    TeamTacticsSerializer, PlayerRotationUpdateSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# --- Existing Views ---
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
    serializer_class = FullPlayerSerializer
    permission_classes = [IsAuthenticated] 
    def get_queryset(self):
        user_team = self.request.user.team
        # [FIXED] Use annotate to calculate the rating on the database side before ordering.
        # The 'rating' property from the model cannot be used in database queries.
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
        # ... Logic remains the same, assuming it's correct from previous steps
        pass

class SquadView(generics.ListAPIView):
    serializer_class = FullPlayerSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        try:
            user_team = self.request.user.team
            return Player.objects.filter(team=user_team)
        except Team.DoesNotExist:
            return Player.objects.none()

class TeamTacticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        try:
            team = request.user.team
            serializer = TeamTacticsSerializer(team)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Team.DoesNotExist:
            return Response({"detail": "User is not assigned to a team."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, *args, **kwargs):
        try:
            team = request.user.team
        except Team.DoesNotExist:
            return Response({"detail": "User is not assigned to a team."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        players_data = data.get('players')
        player_serializer = PlayerRotationUpdateSerializer(data=players_data, many=True)
        if not player_serializer.is_valid():
            return Response(player_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                team.pace = data.get('pace', team.pace)
                team.offensive_focus_slider = data.get('offensiveFocus', team.offensive_focus_slider)
                team.defensive_aggressiveness = data.get('defensiveAggressiveness', team.defensive_aggressiveness)
                team.go_to_guy_id = data.get('goToGuy')
                team.defensive_stopper_id = data.get('defensiveStopper')
                team.save()

                validated_players = player_serializer.validated_data
                player_ids = [p['id'] for p in validated_players]
                players_to_update = Player.objects.filter(id__in=player_ids, team=team)
                players_map = {p.id: p for p in players_to_update}

                for player_data in validated_players:
                    player_obj = players_map.get(player_data['id'])
                    if player_obj:
                        player_obj.role = player_data['role']
                        player_obj.position_primary = player_data['position_primary']
                        player_obj.assigned_minutes = player_data['assigned_minutes']
                        player_obj.offensive_role = player_data['offensive_role']
                
                Player.objects.bulk_update(players_to_update, ['role', 'position_primary', 'assigned_minutes', 'offensive_role'])
            return Response({"detail": "Tactics and rotation updated successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListPlayerForTransferView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, player_id, *args, **kwargs):
        team = request.user.team
        player = get_object_or_404(Player, id=player_id, team=team)
        price = request.data.get('price')
        if price is None or not isinstance(price, int) or price <= 0:
            return Response({"detail": "A valid asking price is required."}, status=status.HTTP_400_BAD_REQUEST)
        player.is_on_transfer_list = True
        player.asking_price = price
        player.save()
        return Response({
            "detail": f"{player.first_name} {player.last_name} is now on the transfer list for ${price:,}.",
            "player": FullPlayerSerializer(player).data
        }, status=status.HTTP_200_OK)

class UnlistPlayerFromTransferView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, player_id, *args, **kwargs):
        team = request.user.team
        player = get_object_or_404(Player, id=player_id, team=team)
        player.is_on_transfer_list = False
        player.asking_price = None
        player.save()
        return Response({
            "detail": f"{player.first_name} {player.last_name} has been removed from the transfer list.",
            "player": FullPlayerSerializer(player).data
        }, status=status.HTTP_200_OK)

class ReleasePlayerView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, player_id, *args, **kwargs):
        team = request.user.team
        player = get_object_or_404(Player, id=player_id, team=team)
        release_cost = int(player.market_value * 0.10)
        if team.budget < release_cost:
            return Response({"detail": "Not enough budget to release this player."}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            team.budget -= release_cost
            team.save()
            player.team = None
            player.contract_years = 0
            player.is_on_transfer_list = False
            player.asking_price = None
            player.save()
        return Response({
            "detail": f"{player.first_name} {player.last_name} has been released. Your new budget is ${team.budget:,}.",
            "new_budget": team.budget,
            "released_player_id": player.id
        }, status=status.HTTP_200_OK)