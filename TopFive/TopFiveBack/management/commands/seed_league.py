# In file: TopFiveBack/management/commands/seed_league.py

import random
from django.core.management.base import BaseCommand
from faker import Faker

# This import line is now corrected to your app's name: TopFiveBack
from TopFiveBack.models import League, Team, Player

class Command(BaseCommand):
    help = 'Seeds the database with a full league, teams, and players.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Deleting old data...'))
        # Delete existing data to start fresh
        Player.objects.all().delete()
        Team.objects.all().delete()
        League.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Old data deleted. Starting to seed new data...'))

        # Initialize Faker
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
            # Generate a cool team name using Faker
            team_name = f"{fake.city()} {random.choice(['Hawks', 'Lions', 'Eagles', 'Sharks', 'Bulls', 'Rockets', 'Giants'])}"
            team = Team.objects.create(
                name=team_name,
                league=league,
                coach_name=fake.name(),
                arena_name=f"{fake.city()} Arena",
                home_jersey_color=random.choice(['White', 'Yellow', 'Light Blue']),
                away_jersey_color=random.choice(['Black', 'Dark Blue', 'Red']),
                budget=1000000
            )
            teams.append(team)
            self.stdout.write(f"  - Created Team: {team.name}")

        # --- 3. Create 12 Players for each Team ---
        for team in teams:
            self.stdout.write(f"    - Generating players for {team.name}...")
            for _ in range(12):
                self.create_random_player(team, fake)
        
        self.stdout.write(self.style.SUCCESS('Database seeding complete!'))

    def create_random_player(self, team, fake):        
        primary_position = random.choice([Player.POINT_GUARD, Player.SHOOTING_GUARD, Player.SMALL_FORWARD, Player.POWER_FORWARD, Player.CENTER])
        
        secondary_position = None
        if random.random() < 0.3:
            possible_secondary = [p[0] for p in Player.POSITION_CHOICES if p[0] != primary_position]
            secondary_position = random.choice(possible_secondary)

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

        Player.objects.create(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            age=random.randint(18, 36),
            position_primary=primary_position,
            position_secondary=secondary_position,
            team=team,
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
            is_injured=False,                    
            injury_duration=0,                   
            is_retired=False
        )

        