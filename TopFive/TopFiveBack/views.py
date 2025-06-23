# file: TopFiveBack/views.py
from rest_framework import generics
from TopFiveBack.models import Match
from TopFiveBack.serializers import MatchSerializer

class MatchListByLeague(generics.ListAPIView):
    serializer_class = MatchSerializer

    def get_queryset(self):
        league_id = self.kwargs.get('league_id')
        return Match.objects.filter(league_id=league_id).order_by('match_date')
