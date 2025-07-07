# In TopFiveBack/urls.py
from django.urls import path
from .views import (
    MatchListAll, MatchListByLeague, 
    LeagueStandingsView, TransferMarketListView, BuyPlayerView, SquadView,
    TeamTacticsView,ListPlayerForTransferView, UnlistPlayerFromTransferView, ReleasePlayerView # Import the new view
)

urlpatterns = [
    path('matches/<int:league_id>/', MatchListByLeague.as_view(), name='match-list-by-league'),
    path('matches/', MatchListAll.as_view(), name='match-list-all'),
    path('leagues/<int:league_id>/standings/', LeagueStandingsView.as_view(), name='league-standings'),
    path('players/transfer-market/', TransferMarketListView.as_view(), name='transfer-market-list'),
    path('players/<int:player_id>/buy/', BuyPlayerView.as_view(), name='buy-player'),
    path('team/squad/', SquadView.as_view(), name='team-squad'),
    path('team/tactics/', TeamTacticsView.as_view(), name='team-tactics'),
    path('players/<int:player_id>/list-transfer/', ListPlayerForTransferView.as_view(), name='player-list-transfer'),
    path('players/<int:player_id>/unlist-transfer/', UnlistPlayerFromTransferView.as_view(), name='player-unlist-transfer'),
    path('players/<int:player_id>/release/', ReleasePlayerView.as_view(), name='player-release'),

]
