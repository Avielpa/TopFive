# file: TopFiveBack/urls.py
from django.urls import path
from TopFiveBack.views import MatchListAll, MatchListByLeague
from .views import (
    MatchListAll, MatchListByLeague, 
    LeagueStandingsView, TransferMarketListView, BuyPlayerView # Import new views
)

urlpatterns = [
    path('matches/<int:league_id>/', MatchListByLeague.as_view(), name='match-list-by-league'),
    path('matches/', MatchListAll.as_view(), name='match-list-all'),
    path('leagues/<int:league_id>/standings/', LeagueStandingsView.as_view(), name='league-standings'),
    # --- נתיבים מעודכנים וחדשים ---
    path('players/transfer-market/', TransferMarketListView.as_view(), name='transfer-market-list'),
    path('players/<int:player_id>/buy/', BuyPlayerView.as_view(), name='buy-player'),
]
