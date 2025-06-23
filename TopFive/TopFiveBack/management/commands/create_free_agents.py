# In file: TopFiveBack/management/commands/create_free_agents.py

import random
from django.core.management.base import BaseCommand
from faker import Faker

from TopFiveBack.models import Player

class Command(BaseCommand):
    help = 'Creates 100 free agent players and adds them to the database without deleting existing data.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting to create 100 free agents...'))

        fake = Faker()

        for i in range(100):
            self.create_random_free_agent(fake)
            self.stdout.write('.', ending='')
        
        self.stdout.write(self.style.SUCCESS('\nSuccessfully created 100 free agents!'))

    def create_random_free_agent(self, fake):
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
            # The 'team' parameter is simply omitted, creating a free agent.
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            age=random.randint(18, 36),
            position_primary=primary_position,
            position_secondary=secondary_position,
            height=height,
            weight=weight,
            
            # Skills are created as floats
            shooting_2p=round(random.uniform(60.0, 99.9), 1),
            shooting_3p=round(random.uniform(60.0, 99.9), 1),
            free_throws=round(random.uniform(60.0, 99.9), 1),
            rebound_def=round(random.uniform(60.0, 99.9), 1),
            rebound_off=round(random.uniform(60.0, 99.9), 1),
            passing=round(random.uniform(60.0, 99.9), 1),
            blocking=round(random.uniform(60.0, 99.9), 1),
            defense=round(random.uniform(60.0, 99.9), 1),
            game_iq=round(random.uniform(60.0, 99.9), 1),
            speed=round(random.uniform(60.0, 99.9), 1),
            jumping=round(random.uniform(60.0, 99.9), 1),
            strength=round(random.uniform(60.0, 99.9), 1),
            stamina=round(random.uniform(60.0, 99.9), 1),
            
            # Contract and status details
            contract_years=0, # Free agents have no contract
            is_injured=False,
            injury_duration=0,
            is_retired=False
        )
        