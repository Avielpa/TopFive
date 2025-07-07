# In TopFiveBack/urls.py
from django.urls import path
from .views import (
<<<<<<< HEAD
    MatchListAll,
    MatchListByLeague,
    LeagueStandingsView,
    TeamSquadView,
    TransferMarketListView,
    BuyPlayerView,
    SquadView,
    TeamStandingDetailView, # ייבוא ה-View החדש לסטטיסטיקת קבוצה בודדת
=======
    MatchListAll, MatchListByLeague, 
    LeagueStandingsView, TransferMarketListView, BuyPlayerView, SquadView,
<<<<<<< HEAD
    TeamTacticsView,ListPlayerForTransferView, UnlistPlayerFromTransferView, ReleasePlayerView # Import the new view
=======
    TeamTacticsView # Import the new view
>>>>>>> 2800fea9912c810915cea59ee79383166dd2080d
>>>>>>> d3a291052eeaceb0eb526c6f8e638ba97ffb5dbe
)

urlpatterns = [
    # Match related URLs
    path('matches/<int:league_id>/', MatchListByLeague.as_view(), name='match-list-by-league'),
    path('matches/', MatchListAll.as_view(), name='match-list-all'),

    # League related URLs
    path('leagues/<int:league_id>/standings/', LeagueStandingsView.as_view(), name='league-standings'),

    # Player related URLs
    path('players/transfer-market/', TransferMarketListView.as_view(), name='transfer-market-list'),
    path('players/<int:player_id>/buy/', BuyPlayerView.as_view(), name='buy-player'),
<<<<<<< HEAD

    # Team related URLs
    path('teams/<int:team_id>/squad/', TeamSquadView.as_view(), name='team-squad-by-id'), # סגל קבוצה ספציפית
    path('team/squad/', SquadView.as_view(), name='team-squad'), # סגל הקבוצה של המשתמש (אם רלוונטי)
    path('team/matches/<int:team_id>/', MatchListByLeague.as_view(), name='team-matches'), # משחקי קבוצה ספציפית

    # New: Team Standing by ID URL
    # זה הנתיב שפונקציית getTeamStandingById ב-frontend מצפה לו.
    # ודא ש-TeamStandingDetailView מחזיר אובייקט TeamStanding יחיד (לא רשימה).
    path('teams/<int:team_id>/standing/', TeamStandingDetailView.as_view(), name='team-standing-detail'),
]
=======
    path('team/squad/', SquadView.as_view(), name='team-squad'),
    path('team/tactics/', TeamTacticsView.as_view(), name='team-tactics'),
    path('players/<int:player_id>/list-transfer/', ListPlayerForTransferView.as_view(), name='player-list-transfer'),
    path('players/<int:player_id>/unlist-transfer/', UnlistPlayerFromTransferView.as_view(), name='player-unlist-transfer'),
    path('players/<int:player_id>/release/', ReleasePlayerView.as_view(), name='player-release'),

]
>>>>>>> 2800fea9912c810915cea59ee79383166dd2080d
