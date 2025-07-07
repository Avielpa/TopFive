# file: TopFiveBack/views.py (UPDATED & CLEANED)

from django.shortcuts import get_object_or_404
from django.http import Http404 # נדרש עבור 404 בהיעדר אובייקט
from rest_framework import generics, status
from django.db import transaction
from django.db.models import F, Q
from .models import Match, TeamSeasonStats, Player, Team
from .serializers import MatchSerializer, TeamSeasonStatsSerializer, PlayerSerializer, FullPlayerSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


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

class BuyPlayerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, player_id):
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
    """
    Returns all players belonging to the currently authenticated user's team.
    """
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