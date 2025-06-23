# file: TopFiveBack/urls.py
from django.urls import path
from TopFiveBack.views import MatchListByLeague

urlpatterns = [
    path('api/matches/<int:league_id>/', MatchListByLeague.as_view(), name='match-list-by-league'),
]
