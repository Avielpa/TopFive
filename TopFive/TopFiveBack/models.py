# In TopFiveBack/models.py
import random
from django.db import models
from django.contrib.auth.models import User

class League(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="League Name")
    level = models.PositiveIntegerField(default=1, verbose_name="League Level")
    current_season_year = models.PositiveIntegerField(default=2025, verbose_name="Current Season Year")
    STATUS_CHOICES = [
        ('PRE_SEASON', 'Pre-Season'),
        ('REGULAR_SEASON', 'Regular Season'),
        ('PLAYOFFS', 'Playoffs'),
        ('OFF_SEASON', 'Off-Season'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PRE_SEASON')

    def __str__(self):
        return f"{self.name} (Level {self.level})"

    class Meta:
        verbose_name = "League"
        verbose_name_plural = "Leagues"
        ordering = ['level', 'name']

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Team Name")
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name="teams", verbose_name="League")
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Manager (User)")
    coach_name = models.CharField(max_length=100, verbose_name="Coach Name")
    arena_name = models.CharField(max_length=100, verbose_name="Arena Name")
    home_jersey_color = models.CharField(max_length=50, verbose_name="Home Jersey Color")
    away_jersey_color = models.CharField(max_length=50, verbose_name="Away Jersey Color")
    titles = models.PositiveIntegerField(default=0, verbose_name="Championships")
    budget = models.PositiveIntegerField(default=1000000, verbose_name="Budget (in $)")
        
    def __str__(self):
        return self.name

    @property
    def is_available(self):
        return self.user is None

    @property
    def overall_rating(self):
        all_players = self.players.all()
        if not all_players.exists():
            return 0

        all_players_list = list(all_players) 
        ordered_players = sorted(all_players_list, key=lambda p: p.rating, reverse=True)        
        starters = ordered_players[:5]
        bench = ordered_players[5:10]
        reserves = ordered_players[10:]

        starters_avg = sum(p.rating for p in starters) / len(starters) if starters else 0
        bench_avg = sum(p.rating for p in bench) / len(bench) if bench else 0
        reserves_avg = sum(p.rating for p in reserves) / len(reserves) if reserves else 0

        starters_weight, bench_weight, reserves_weight = 0.60, 0.30, 0.10
        total_weight, weighted_sum = 0, 0

        if starters:
            weighted_sum += starters_avg * starters_weight
            total_weight += starters_weight
        if bench:
            weighted_sum += bench_avg * bench_weight
            total_weight += bench_weight
        if reserves:
            weighted_sum += reserves_avg * reserves_weight
            total_weight += reserves_weight

        if total_weight == 0:
            return 0

        final_rating = weighted_sum / total_weight
        return round(final_rating)

    class Meta:
        verbose_name = "Team"
        verbose_name_plural = "Teams"
        ordering = ['name']

class Player(models.Model):
    POINT_GUARD, SHOOTING_GUARD, SMALL_FORWARD, POWER_FORWARD, CENTER = 'PG', 'SG', 'SF', 'PF', 'C'
    POSITION_CHOICES = [
        (POINT_GUARD, 'Point Guard'), (SHOOTING_GUARD, 'Shooting Guard'),
        (SMALL_FORWARD, 'Small Forward'), (POWER_FORWARD, 'Power Forward'),
        (CENTER, 'Center'),
    ]

    first_name = models.CharField(max_length=50, verbose_name="First Name")
    last_name = models.CharField(max_length=50, verbose_name="Last Name")
    age = models.IntegerField(verbose_name="Age")
    position_primary = models.CharField(max_length=2, choices=POSITION_CHOICES, verbose_name="Primary Position")
    position_secondary = models.CharField(max_length=2, choices=POSITION_CHOICES, null=True, blank=True, verbose_name="Secondary Position")
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="players", verbose_name="Team")
    height = models.FloatField(verbose_name="Height (meters)")
    weight = models.FloatField(verbose_name="Weight (kg)")
    
    # Basic Skills (range 60.0-100.0)
    shooting_2p = models.FloatField(default=60.0, verbose_name="2-Point Shooting")
    shooting_3p = models.FloatField(default=60.0, verbose_name="3-Point Shooting")
    free_throws = models.FloatField(default=60.0, verbose_name="Free Throws")
    rebound_def = models.FloatField(default=60.0, verbose_name="Defensive Rebound")
    rebound_off = models.FloatField(default=60.0, verbose_name="Offensive Rebound")
    passing = models.FloatField(default=60.0, verbose_name="Passing")
    blocking = models.FloatField(default=60.0, verbose_name="Blocking")
    defense = models.FloatField(default=60.0, verbose_name="Defense")
    game_iq = models.FloatField(default=60.0, verbose_name="Game IQ")
    
    # Athletic Skills
    speed = models.FloatField(default=60.0, verbose_name="Speed")
    jumping = models.FloatField(default=60.0, verbose_name="Jumping")
    strength = models.FloatField(default=60.0, verbose_name="Strength")
    stamina = models.FloatField(default=60.0, verbose_name="Stamina")
    fitness = models.PositiveIntegerField(default=100, verbose_name="Fitness")

    # Player Status
    is_injured = models.BooleanField(default=False, verbose_name="Is Injured")
    injury_duration = models.PositiveIntegerField(default=0, verbose_name="Injury Duration (days)")
    is_retired = models.BooleanField(default=False, verbose_name="Is Retired")
    contract_years = models.PositiveIntegerField(default=1, verbose_name="Contract Years")

    @property
    def rating(self):
        skills = [
            self.shooting_2p, self.shooting_3p, self.free_throws,
            self.rebound_def, self.rebound_off, self.passing,
            self.blocking, self.defense, self.game_iq, self.speed,
            self.jumping, self.strength, self.stamina
        ]
        return round(sum(skills) / len(skills)) if skills else 0

    @property
    def position_numeric(self):
        mapping = {self.POINT_GUARD: 1, self.SHOOTING_GUARD: 2, self.SMALL_FORWARD: 3, self.POWER_FORWARD: 4, self.CENTER: 5}
        return mapping.get(self.position_primary, 0)

    def __str__(self):
        return f"{self.first_name} {self.last_name} (Rating: {self.rating})"

    class Meta:
        verbose_name = "Player"
        verbose_name_plural = "Players"
        ordering = ['last_name', 'first_name']