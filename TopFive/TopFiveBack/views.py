# file: TopFiveBack/views.py (UPDATED & CLEANED)
# In TopFiveBack/views.py

from django.shortcuts import get_object_or_404
from django.http import Http404 # נדרש עבור 404 בהיעדר אובייקט
from rest_framework import generics, status
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import F, Q
from .models import Match, TeamSeasonStats, Player, Team
from .serializers import MatchSerializer, TeamSeasonStatsSerializer, PlayerSerializer, FullPlayerSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

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
        # סדר לפי תאריך משחק (וסדר עולה)
        return Match.objects.filter(league_id=league_id).order_by('match_date')

class MatchListAll(generics.ListAPIView):
    serializer_class = MatchSerializer
    def get_queryset(self):
        # סדר לפי תאריך משחק (וסדר עולה)
        return Match.objects.all().order_by('match_date')

class LeagueStandingsView(generics.ListAPIView):
    serializer_class = TeamSeasonStatsSerializer
    def get_queryset(self):
        league_id = self.kwargs['league_id']
        # **תיקון: מיון לפי שדות קיימים (ניצחונות ונקודות זכות) במקום 'rank'**
        # זה עקבי עם הגדרות ה-Meta Class במודל TeamSeasonStats
        return TeamSeasonStats.objects.filter(league=league_id).order_by('-wins', '-points_for')

class TransferMarketListView(generics.ListAPIView):
    """
    Returns all players who are either free agents (team is null)
    or have been put on the transfer list by their current team.
    It excludes players from the user's own team.
    Players are ordered by their calculated rating in descending order.
    """
    serializer_class = FullPlayerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # ודא שהמשתמש אכן משויך לקבוצה
        if not hasattr(user, 'team') or user.team is None:
            # אם למשתמש אין קבוצה, אל תחזיר שחקנים לשוק ההעברות שלו
            return Player.objects.none()

        user_team = user.team

        return Player.objects.filter(
            Q(team__isnull=True) | Q(is_on_transfer_list=True)
        ).exclude(
            team=user_team
        ).annotate(
            # **תיקון: שינוי שם מ-'rating' ל-'calculated_rating' כדי למנוע התנגשות עם ה-@property**
            calculated_rating=(
                (F('shooting_2p') + F('shooting_3p') + F('free_throws') +
                 F('rebound_def') + F('rebound_off') + F('passing') +
                 F('blocking') + F('defense') + F('game_iq') +
                 F('speed') + F('jumping') + F('strength') + F('stamina')) / 13.0
            )
        ).order_by('-calculated_rating') # **תיקון: מיון לפי השם החדש**
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

        # ודא שהמשתמש מאומת ומשויך לקבוצה
        if not hasattr(request.user, 'team') or request.user.team is None:
            return Response({'detail': 'User is not assigned to a team.'}, status=status.HTTP_400_BAD_REQUEST)

        buying_team = request.user.team

        try:
            player_to_buy = get_object_or_404(Player, id=player_id)
        except Http404:
            return Response({'detail': 'Player not found.'}, status=status.HTTP_404_NOT_FOUND)

        contract_years = request.data.get('contract_years')
        if not contract_years:
            return Response({'detail': 'Contract years not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            contract_years = int(contract_years)
            if not (1 <= contract_years <= 5):
                return Response({'detail': 'Contract years must be between 1 and 5.'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'detail': 'Invalid contract years format.'}, status=status.HTTP_400_BAD_REQUEST)

        # בדיקות לוגיות לפני הרכישה
        if player_to_buy.team == buying_team:
            return Response({'detail': 'Cannot buy your own player.'}, status=status.HTTP_400_BAD_REQUEST)

        MAX_SQUAD_SIZE = 15 # הגדר את גודל הסגל המקסימלי
        if buying_team.players.count() >= MAX_SQUAD_SIZE:
            return Response({'detail': f'Your squad is full. Max {MAX_SQUAD_SIZE} players allowed.'}, status=status.HTTP_400_BAD_REQUEST)

        if player_to_buy.team and not player_to_buy.is_on_transfer_list:
            return Response({"detail": "This player is not currently on the transfer list."}, status=status.HTTP_400_BAD_REQUEST)

        if buying_team.budget < player_to_buy.market_value:
            return Response({'detail': 'Your team does not have enough budget to sign this player.'}, status=status.HTTP_400_BAD_REQUEST)

        selling_team = player_to_buy.team # זה יהיה null אם השחקן הוא Free Agent

        try:
            with transaction.atomic(): # שימוש בטרנזקציה אטומית כדי להבטיח עקביות נתונים
                # 1. העברת הכסף
                buying_team.budget -= player_to_buy.market_value
                buying_team.save()

                if selling_team: # אם השחקן נמכר מקבוצה אחרת, הוסף כסף לקבוצה המוכרת
                    selling_team.budget += player_to_buy.market_value
                    selling_team.save()

                # 2. העברת השחקן ועדכון שנות חוזה
                player_to_buy.team = buying_team
                player_to_buy.is_on_transfer_list = False # השחקן יורד מרשימת ההעברות
                player_to_buy.contract_years = contract_years # עדכן את שנות החוזה
                player_to_buy.save()

                return Response({
                    'detail': f'Success! {player_to_buy.first_name} {player_to_buy.last_name} is now part of {buying_team.name}.',
                    'new_budget': buying_team.budget,
                    'player_id': player_to_buy.id,
                }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': f'Transaction failed due to an unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class SquadView(generics.ListAPIView):
    serializer_class = FullPlayerSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        # ודא שלמשתמש יש קבוצה משויכת
        if not hasattr(user, 'team') or user.team is None:
            return Player.objects.none() # החזר QuerySet ריק אם אין קבוצה

        user_team = user.team
        # **תיקון: שינוי שם מ-'rating' ל-'calculated_rating' כדי למנוע התנגשות עם ה-@property**
        return Player.objects.filter(team=user_team).annotate(
            calculated_rating=(
                (F('shooting_2p') + F('shooting_3p') + F('free_throws') +
                 F('rebound_def') + F('rebound_off') + F('passing') +
                 F('blocking') + F('defense') + F('game_iq') +
                 F('speed') + F('jumping') + F('strength') + F('stamina')) / 13.0
            )
        )

class TeamSquadView(generics.ListAPIView): # שינוי ל-ListAPIView
    """
    API endpoint to retrieve the squad (roster) for a specific team by its ID.
    Requires authentication.
    """
    serializer_class = FullPlayerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        team_id = self.kwargs['team_id']
        # ודא שהקבוצה אכן קיימת
        team = get_object_or_404(Team, id=team_id)

        # שלוף את כל השחקנים המשויכים לקבוצה זו
        # וחשב את הדירוג תוך כדי
        squad_players = Player.objects.filter(team=team).annotate(
            # **תיקון: שינוי שם מ-'rating' ל-'calculated_rating' כדי למנוע התנגשות עם ה-@property**
            calculated_rating=(
                (F('shooting_2p') + F('shooting_3p') + F('free_throws') +
                 F('rebound_def') + F('rebound_off') + F('passing') +
                 F('blocking') + F('defense') + F('game_iq') +
                 F('speed') + F('jumping') + F('strength') + F('stamina')) / 13.0
            )
        )
        return squad_players


## ה-View החדש והחשוב: `TeamStandingDetailView`

class TeamStandingDetailView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve the season statistics (TeamSeasonStats) for a specific team.
    This view returns a single TeamSeasonStats object for the given team_id.
    Requires authentication.
    """
    queryset = TeamSeasonStats.objects.all()
    serializer_class = TeamSeasonStatsSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'team_id' # השדה ב-URL שישמש לחיפוש

    def get_object(self):
        # ה-team_id מגיע מתוך ה-URL דרך kwargs
        team_id = self.kwargs[self.lookup_field] # עדיף להשתמש ב-self.lookup_field

        try:
            # נסה למצוא את ה-TeamSeasonStats עבור הקבוצה הספציפית
            # אנו מניחים שיש רק אובייקט אחד של TeamSeasonStats לכל קבוצה לעונה נתונה.
            # אם יש מספר אובייקטים, תצטרך להוסיף לוגיקה לבחור את הנכון (למשל, העונה הנוכחית).
            obj = self.get_queryset().get(team__id=team_id)
            return obj
        except TeamSeasonStats.DoesNotExist:
            # אם האובייקט לא נמצא, Django מעלה DoesNotExist, ואנו ממירים זאת ל-Http404
            raise Http404("Team standing for this team not found.")
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

