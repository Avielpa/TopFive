from django.core.management.base import BaseCommand
from django.utils import timezone
from itertools import combinations
from datetime import timedelta
import random

from TopFiveBack.models import League, Match

class Command(BaseCommand):
    help = "Create a round-robin schedule for each league"

    def handle(self, *args, **kwargs):
        print("==> create_schedule command is running...")

        leagues = League.objects.all()
        print("Creating leagues")
        for league in leagues:
            self.stdout.write(f"Creating schedule for league: {league.name}")
            self.create_schedule_for_league(league)

    def create_schedule_for_league(self, league):
        print("im here")
        teams = list(league.teams.all())
        num_teams = len(teams)

        if num_teams < 2:
            self.stdout.write(f"League {league.name} has less than 2 teams. Skipping...")
            return

        match_date = timezone.now() + timedelta(days=1)
        days_between_rounds = 3

        pairings = list(combinations(teams, 2))
        random.shuffle(pairings)

        round_num = 1
        for home, away in pairings:
            try:
                Match.objects.create(
                    league=league,
                    home_team=home,
                    away_team=away,
                    match_date=match_date,
                    match_round=round_num,
                    home_team_score=0,
                    away_team_score=0,
                    completed=False,
                    current_quarter=1,
                    game_clock=timedelta(minutes=10),
                    possession_team=None
                )
                round_num += 1
                match_date += timedelta(days=days_between_rounds)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating match: {e}"))

        match_date += timedelta(days=5)  # מרווח בין הסיבובים

        for home, away in pairings:
            try:
                Match.objects.create(
                    league=league,
                    home_team=away,  # הפוך
                    away_team=home,
                    match_date=match_date,
                    match_round=round_num,
                    home_team_score=0,
                    away_team_score=0,
                    completed=False,
                    current_quarter=1,
                    game_clock=timedelta(minutes=10),
                    possession_team=None
                )
                round_num += 1
                match_date += timedelta(days=days_between_rounds)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating match: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Schedule created for league: {league.name}"))
