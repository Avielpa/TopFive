from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random

from TopFiveBack.models import League, Match


class Command(BaseCommand):
    help = "Create a round-robin schedule for each league"

    def handle(self, *args, **kwargs):
        print("==> create_schedule command is running...")

        leagues = League.objects.all().order_by('-id')
        for league in leagues:
            self.stdout.write(f"Creating schedule for league: {league.name}")
            self.create_schedule_for_league(league)

    def create_schedule_for_league(self, league):
        teams = list(league.teams.all())
        num_teams = len(teams)

        if num_teams < 2 or num_teams % 2 != 0:
            self.stdout.write(self.style.ERROR(
                f"League {league.name} must have even number of teams >= 2. Currently: {num_teams}"
            ))
            return

        base_date = timezone.now() + timedelta(days=10)
        days_between_rounds = 3

        random.shuffle(teams)

        rounds = []
        num_rounds = num_teams - 1
        half = num_teams // 2

        # שלב 1: צור זוגות למחזורי הליגה
        for round_index in range(num_rounds):
            round_matches = []
            for i in range(half):
                home = teams[i]
                away = teams[num_teams - 1 - i]
                round_matches.append((home, away))
            rounds.append(round_matches)
            teams = [teams[0]] + [teams[-1]] + teams[1:-1]

        current_round = 1
        current_date = base_date
        first_rounds = []

        # שלב 2: צור סיבוב ראשון עם איזון רנדומלי של בית/חוץ
        for round_matches in rounds:
            balanced_round = []
            home_count = 0
            away_count = 0

            for home, away in round_matches:
                if home_count >= 5:
                    balanced_round.append((away, home))
                    away_count += 1
                elif away_count >= 5:
                    balanced_round.append((home, away))
                    home_count += 1
                else:
                    if random.choice([True, False]):
                        balanced_round.append((home, away))
                        home_count += 1
                    else:
                        balanced_round.append((away, home))
                        away_count += 1

            first_rounds.append(balanced_round)

            for home, away in balanced_round:
                Match.objects.create(
                    league=league,
                    home_team=home,
                    away_team=away,
                    match_date=current_date,
                    match_round=current_round,
                    home_team_score=0,
                    away_team_score=0,
                    completed=False,
                    current_quarter=1,
                    game_clock=timedelta(minutes=10),
                    possession_team=None
                )
            current_round += 1
            current_date += timedelta(days=days_between_rounds)

        # שלב 3: צור סיבוב שני – היפוך בית/חוץ
        for round_matches in first_rounds:
            for home, away in round_matches:
                Match.objects.create(
                    league=league,
                    home_team=away,  # היפוך
                    away_team=home,
                    match_date=current_date,
                    match_round=current_round,
                    home_team_score=0,
                    away_team_score=0,
                    completed=False,
                    current_quarter=1,
                    game_clock=timedelta(minutes=10),
                    possession_team=None
                )
            current_round += 1
            current_date += timedelta(days=days_between_rounds)

        self.stdout.write(self.style.SUCCESS(f"✅ Schedule created for league: {league.name}"))
