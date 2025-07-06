# In TopFiveBack/views.py

from rest_framework import generics, status
from django.db import transaction
from django.db.models import F, Q
from .models import Match, TeamSeasonStats, Player, Team 
from .serializers import (
    MatchSerializer, TeamSeasonStatsSerializer, FullPlayerSerializer,
    TeamTacticsSerializer, PlayerRotationUpdateSerializer # Import new serializers
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
        return Player.objects.filter(
            Q(team__isnull=True) | Q(is_on_transfer_list=True)
        ).exclude(
            team=user_team 
        ).order_by('-rating') # Simplified ordering

class BuyPlayerView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, player_id):
        # ... (logic remains the same)
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

# --- [NEW] View for Tactics & Rotation ---

class TeamTacticsView(APIView):
    """
    Handles getting and updating a team's tactics and player rotations.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Returns the complete tactical data for the user's team.
        """
        try:
            team = request.user.team
            serializer = TeamTacticsSerializer(team)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Team.DoesNotExist:
            return Response({"detail": "User is not assigned to a team."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, *args, **kwargs):
        """
        Updates the team's tactics and player rotation data.
        """
        try:
            team = request.user.team
        except Team.DoesNotExist:
            return Response({"detail": "User is not assigned to a team."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        players_data = data.get('players')

        # Validate incoming players data
        player_serializer = PlayerRotationUpdateSerializer(data=players_data, many=True)
        if not player_serializer.is_valid():
            return Response(player_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # 1. Update Team-level tactics
                team.pace = data.get('pace', team.pace)
                team.offensive_focus_slider = data.get('offensiveFocus', team.offensive_focus_slider)
                team.defensive_aggressiveness = data.get('defensiveAggressiveness', team.defensive_aggressiveness)
                
                # Update key players
                go_to_guy_id = data.get('goToGuy')
                defensive_stopper_id = data.get('defensiveStopper')
                team.go_to_guy_id = go_to_guy_id if go_to_guy_id else None
                team.defensive_stopper_id = defensive_stopper_id if defensive_stopper_id else None
                
                team.save()

                # 2. Update Player-level rotation data
                validated_players = player_serializer.validated_data
                player_ids = [p['id'] for p in validated_players]
                
                # Fetch all relevant players in a single query
                players_to_update = Player.objects.filter(id__in=player_ids, team=team)
                players_map = {p.id: p for p in players_to_update}

                for player_data in validated_players:
                    player_obj = players_map.get(player_data['id'])
                    if player_obj:
                        player_obj.role = player_data['role']
                        player_obj.position_primary = player_data['position_primary']
                        player_obj.assigned_minutes = player_data['assigned_minutes']
                        player_obj.offensive_role = player_data['offensive_role']
                
                # Bulk update the players
                Player.objects.bulk_update(
                    players_to_update, 
                    ['role', 'position_primary', 'assigned_minutes', 'offensive_role']
                )

            return Response({"detail": "Tactics and rotation updated successfully."}, status=status.HTTP_200_OK)

        except Exception as e:
            # Catch any other exceptions during the transaction
            return Response({"detail": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
