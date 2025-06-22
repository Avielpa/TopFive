# In file: TopFiveBack/management/commands/add_league.py

import random
from django.core.management.base import BaseCommand
from faker import Faker
from django.db import IntegrityError

from TopFiveBack.models import League, Team, Player

class Command(BaseCommand):
    help = 'Adds a new, complete league to the existing database without deleting any data.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting to add a new league...'))

        fake = Faker()

        # --- 1. Create a NEW League with a unique name ---
        # Check how many leagues already exist to create a unique name and level
        league_count = League.objects.count()
        new_league_name = f"TopFive Division {league_count + 1}"
        new_level = league_count + 1

        league = League.objects.create(
            name=new_league_name,
            level=new_level,
            current_season_year=1,
            status='PRE_SEASON'
        )
        self.stdout.write(f"Created League: {league.name} (Level: {league.level})")

        # --- 2. Create 10 Teams for the new League ---
        teams_created_count = 0
        while teams_created_count < 10:
            # Generate a potential team name
            team_name = f"{fake.city()} {random.choice(['Blazers', 'Warriors', 'Suns', 'Kings', 'Wizards', 'Spurs', 'Heat'])}"
            
            # Ensure the team name is unique before creating
            if not Team.objects.filter(name=team_name).exists():
                team = Team.objects.create(
                    name=team_name,
                    league=league,
                    coach_name=fake.name(),
                    arena_name=f"{fake.city()} Arena",
                    home_jersey_color=random.choice(['White', 'Yellow', 'Light Blue']),
                    away_jersey_color=random.choice(['Black', 'Dark Blue', 'Red']),
                    budget=random.randint(25000000, 50000000)
                )
                self.stdout.write(f"  - Created Team: {team.name}")
                
                # --- 3. Create 12 Players for each newly created Team ---
                self.stdout.write(f"    - Generating players for {team.name}...")
                for _ in range(12):
                    self.create_random_player(team, fake)

                teams_created_count += 1
            else:
                self.stdout.write(self.style.WARNING(f"Team name '{team_name}' already exists. Trying another..."))

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully added a new league "{league.name}" with {teams_created_count} teams!'))

    def create_random_player(self, team, fake):
        # This helper function is identical to the one in the previous script
        primary_position = random.choice([Player.POINT_GUARD, Player.SHOOTING_GUARD, Player.SMALL_FORWARD, Player.POWER_FORWARD, Player.CENTER])
        
        secondary_position = None
        if random.random() < 0.3:
            possible_secondary = [p[0] for p in Player.POSITION_CHOICES if p[0] != primary_position]
            secondary_position = random.choice(possible_secondary)

        if primary_position == Player.POINT_GUARD:
            height, weight = round(random.uniform(1.80, 1.94), 2), round(random.uniform(78, 92), 1)
        elif primary_position == Player.SHOOTING_GUARD:
            height, weight = round(random.uniform(1.90, 2.01), 2), round(random.uniform(88, 102), 1)
        elif primary_position == Player.SMALL_FORWARD:
            height, weight = round(random.uniform(1.98, 2.06), 2), round(random.uniform(98, 110), 1)
        elif primary_position == Player.POWER_FORWARD:
            height, weight = round(random.uniform(2.03, 2.10), 2), round(random.uniform(108, 122), 1)
        else:
            height, weight = round(random.uniform(2.08, 2.20), 2), round(random.uniform(115, 130), 1)

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