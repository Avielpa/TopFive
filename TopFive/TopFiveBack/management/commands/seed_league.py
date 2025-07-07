# In file: TopFiveBack/management/commands/seed_league.py

import random
from django.core.management.base import BaseCommand
from faker import Faker
from TopFiveBack.models import League, Team, Player, TeamSeasonStats
from django.db import transaction

class Command(BaseCommand):
    help = 'Seeds the database with a full league, teams, players, and initial stats.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Deleting old data...'))
        Player.objects.all().delete()
        TeamSeasonStats.objects.all().delete()
        Team.objects.all().delete()
        League.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Old data deleted. Starting to seed new data...'))
        fake = Faker()

        # --- 1. Create a League ---
        league = League.objects.create(name="TopFive Super League",
                                       level=1,
                                       current_season_year=1,
                                       status='PRE_SEASON')
        self.stdout.write(f"Created League: {league.name}")
        
        # --- 2. Create 10 Teams for the League ---
        teams = []
        for i in range(10):
            team_name = f"{fake.city()} {random.choice(['Hawks', 'Lions', 'Eagles', 'Sharks', 'Bulls', 'Rockets', 'Giants'])}"
            team = Team.objects.create(
                name=team_name,
                league=league,
                coach_name=fake.name(),
                arena_name=f"{fake.city()} Arena",
                home_jersey_color=random.choice(['#FFFFFF', '#FFD700', '#ADD8E6']), # Using hex colors
                away_jersey_color=random.choice(['#000000', '#00008B', '#FF0000']), # Using hex colors
                budget=1000000
            )
            teams.append(team)
            self.stdout.write(f"  - Created Team: {team.name}")

            TeamSeasonStats.objects.create(
                team=team,
                league=league,
                season=league.current_season_year
            )
            self.stdout.write(f"    - Initialized stats for {team.name} for season {league.current_season_year}")

        # --- 3. Create Balanced Rosters for each Team ---
        for team in teams:
            self.stdout.write(f"      - Generating balanced roster for {team.name}...")
            self.create_balanced_roster(team, fake)
        
        self.stdout.write(self.style.SUCCESS('Database seeding complete!'))

    def create_balanced_roster(self, team, fake):
        """
        Creates a balanced 12-player roster for a team.
        - 2 players for each position (PG, SG, SF, PF, C).
        - One player per position is assigned as a STARTER, the other as BENCH.
        - Two additional players are added as RESERVES.
        """
        positions = [Player.POINT_GUARD, Player.SHOOTING_GUARD, Player.SMALL_FORWARD, Player.POWER_FORWARD, Player.CENTER]
        created_players = []

        # Create 2 players for each of the 5 main positions
        for pos in positions:
            # Create two players for the current position
            player1 = self.create_player_for_position(team, fake, pos, Player.STARTER)
            player2 = self.create_player_for_position(team, fake, pos, Player.BENCH)
            created_players.extend([player1, player2])

        # Create 2 additional reserve players with random positions
        for _ in range(2):
            pos = random.choice(positions)
            reserve_player = self.create_player_for_position(team, fake, pos, Player.RESERVE)
            created_players.append(reserve_player)
            
        # Set Go-To Guy and Defensive Stopper for the team from the created starters
        starters = [p for p in created_players if p.role == Player.STARTER]
        if starters:
            team.go_to_guy = random.choice(starters)
            team.defensive_stopper = random.choice(starters)
            team.save()


    def create_player_for_position(self, team, fake, primary_position, role):
        """Helper function to create a single player with specific attributes."""
        if primary_position == Player.POINT_GUARD:
            height = round(random.uniform(1.80, 1.94), 2)
            weight = round(random.uniform(78, 92), 1)
        elif primary_position == Player.SHOOTING_GUARD:
            height = round(random.uniform(1.90, 2.01), 2)
            weight = round(random.uniform(88, 102), 1)
        elif primary_position == Player.SMALL_FORWARD:
            height = round(random.uniform(1.98, 2.06), 2)
            weight = round(random.uniform(98, 110), 1)
        elif primary_position == Player.POWER_FORWARD:
            height = round(random.uniform(2.03, 2.10), 2)
            weight = round(random.uniform(108, 122), 1)
        else:  # Center
            height = round(random.uniform(2.08, 2.20), 2)
            weight = round(random.uniform(115, 130), 1)

        player = Player.objects.create(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            age=random.randint(18, 36),
            position_primary=primary_position,
            team=team,
            role=role, # Assign the specified role
            height=height,
            weight=weight,
            shooting_2p=random.randint(60, 99),
            shooting_3p=random.randint(60, 99),
            free_throws=random.randint(60, 99),
            rebound_def=random.randint(60, 99),
            rebound_off=random.randint(60, 99),
            passing=random.randint(60, 99),
            blocking=random.randint(60, 99),
            defense=random.randint(60, 99),
            game_iq=random.randint(60, 99),
            speed=random.randint(60, 99),
            jumping=random.randint(60, 99),
            strength=random.randint(60, 99),
            stamina=random.randint(60, 99),
            contract_years=random.randint(1, 4),
            # assigned_minutes and offensive_role will use their default values
        )
        return player