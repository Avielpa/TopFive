# file: TopFiveBack/urls.py
from django.urls import path
from TopFiveBack.views import MatchListAll, MatchListByLeague

urlpatterns = [
    path('matches/<int:league_id>/', MatchListByLeague.as_view(), name='match-list-by-league'),
    path('matches/', MatchListAll.as_view(), name='match-list-all'),

]
