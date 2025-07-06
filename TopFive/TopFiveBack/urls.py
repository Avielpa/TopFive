# In TopFiveBack/urls.py
from django.urls import path
from .views import (
    MatchListAll, MatchListByLeague, 
    LeagueStandingsView, TransferMarketListView, BuyPlayerView, SquadView,
    TeamTacticsView # Import the new view
)

urlpatterns = [
    path('matches/<int:league_id>/', MatchListByLeague.as_view(), name='match-list-by-league'),
    path('matches/', MatchListAll.as_view(), name='match-list-all'),
    path('leagues/<int:league_id>/standings/', LeagueStandingsView.as_view(), name='league-standings'),
    path('players/transfer-market/', TransferMarketListView.as_view(), name='transfer-market-list'),
    path('players/<int:player_id>/buy/', BuyPlayerView.as_view(), name='buy-player'),
    path('team/squad/', SquadView.as_view(), name='team-squad'),
    
    # [NEW] URL for getting and updating team tactics and rotation
    path('team/tactics/', TeamTacticsView.as_view(), name='team-tactics'),
]
