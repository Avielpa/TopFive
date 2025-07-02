# In TopFiveBack/models.py
from datetime import timedelta
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
    # Team tactics
    # 1. זהות קבוצתית (Team DNA)
    pace = models.PositiveIntegerField(default=3, verbose_name="Pace (1-5)")
    OFFENSIVE_FOCUS_CHOICES = [('INSIDE', 'Inside Focus'), ('OUTSIDE', 'Outside Focus')]
    offensive_focus = models.CharField(max_length=10, choices=OFFENSIVE_FOCUS_CHOICES, default='OUTSIDE')
    defensive_aggressiveness = models.PositiveIntegerField(default=3, verbose_name="Aggressiveness (1-5)")

    go_to_guy = models.ForeignKey(
        'Player', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='+',
        verbose_name="Go-To Guy"
    )
    defensive_stopper = models.ForeignKey(
        'Player', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='+',
        verbose_name="Defensive Stopper"
    )
    
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
        
        starters, bench, reserves = ordered_players[:5], ordered_players[5:10], ordered_players[10:]
        
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
            
        if total_weight == 0: return 0
        return round(weighted_sum / total_weight)

    class Meta:
        verbose_name = "Team"
        verbose_name_plural = "Teams"
        ordering = ['name']

class TeamSeasonStats(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="season_stats")
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name="season_stats")
    season = models.PositiveIntegerField(default=2025, verbose_name="Season Year")

    games_played = models.PositiveIntegerField(default=0)
    wins = models.PositiveIntegerField(default=0)
    losses = models.PositiveIntegerField(default=0)
    points_for = models.PositiveIntegerField(default=0, verbose_name="Points Scored")
    points_against = models.PositiveIntegerField(default=0, verbose_name="Points Conceded")
    
    @property
    def win_percentage(self):
        """Calculates the win percentage. Returns 0 if no games were played."""
        if self.games_played == 0:
            return 0.0
        return round((self.wins / self.games_played) * 100, 1)

    @property
    def points_difference(self):
        """Calculates the total points difference."""
        return self.points_for - self.points_against

    def __str__(self):
        return f"{self.team.name} ({self.season}) - W: {self.wins}, L: {self.losses}"

    class Meta:
        verbose_name = "Team Season Stats"
        verbose_name_plural = "Team Season Stats"
        # Ensures that a team can only have one stats record per season in a given league
        unique_together = ('team', 'league', 'season')
        ordering = ['-wins', '-points_for'] # Default ordering for standings


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
    position_secondary = models.CharField(max_length=2, choices=POSITION_CHOICES, null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="players", verbose_name="Team")
    height = models.FloatField(verbose_name="Height (meters)")
    weight = models.FloatField(verbose_name="Weight (kg)")
    
    shooting_2p = models.FloatField(default=60.0)
    shooting_3p = models.FloatField(default=60.0)
    free_throws = models.FloatField(default=60.0)
    rebound_def = models.FloatField(default=60.0)
    rebound_off = models.FloatField(default=60.0)
    passing = models.FloatField(default=60.0)
    blocking = models.FloatField(default=60.0)
    defense = models.FloatField(default=60.0)
    game_iq = models.FloatField(default=60.0)
    speed = models.FloatField(default=60.0)
    jumping = models.FloatField(default=60.0)
    strength = models.FloatField(default=60.0)
    stamina = models.FloatField(default=60.0)
    
    fitness = models.PositiveIntegerField(default=100)
    is_injured = models.BooleanField(default=False)
    injury_duration = models.PositiveIntegerField(default=0)
    is_retired = models.BooleanField(default=False)
    contract_years = models.PositiveIntegerField(default=1)
    is_on_transfer_list = models.BooleanField(
        default=False, 
        verbose_name="On Transfer List",
        help_text="If checked, this player will appear on the transfer market even if they have a team."
    )

    STARTER = 'STARTER'
    BENCH = 'BENCH'
    RESERVE = 'RESERVE'

    ROLE_CHOICES = [
        (STARTER, 'Starter'),
        (BENCH, 'Bench'),
        (RESERVE, 'Reserve'),
    ]

    role = models.CharField(
        max_length=10, 
        choices=[('STARTER', 'Starter'), ('BENCH', 'Bench'), ('RESERVE', 'Reserve')], 
        default='RESERVE',
        verbose_name="Player Role"
    )

    PRIMARY_SCORER = 'PRIMARY'
    SECONDARY_SCORER = 'SECONDARY'
    ROLE_PLAYER = 'ROLE'
    DO_NOT_SHOOT = 'DND' # Do Not Dare to shoot :)
    
    OFFENSIVE_ROLE_CHOICES = [
        (PRIMARY_SCORER, 'First Option'),
        (SECONDARY_SCORER, 'Second Option'),
        (ROLE_PLAYER, 'Role Player'),
        (DO_NOT_SHOOT, 'Don\'t Shoot'),
    ]

    offensive_role = models.CharField(
        max_length=10, 
        choices=OFFENSIVE_ROLE_CHOICES, 
        default=ROLE_PLAYER,
        verbose_name="Offensive Role"
    )

    assigned_minutes = models.PositiveIntegerField(
        default=0,
        verbose_name="Assigned Minutes"
    )
    
    @property
    def rating(self):
        skills = [
            self.shooting_2p, self.shooting_3p, self.free_throws, self.rebound_def, 
            self.rebound_off, self.passing, self.blocking, self.defense, 
            self.game_iq, self.speed, self.jumping, self.strength, self.stamina
        ]
        return round(sum(skills) / len(skills)) if skills else 0
    
    @property
    def market_value(self):
        base_value = (self.rating / 55) ** 4.5 * 650000
        if self.age <= 27:
            age_factor = 1 + ((27 - self.age) * 0.06)
        else:
            age_factor = max(0.2, 1 - ((self.age - 27) * 0.09))
        if self.contract_years == 0:
            contract_factor = 1.0
        else:
            contract_factor = 1 + (self.contract_years * 0.15)
        final_value = base_value * age_factor * contract_factor
        return round(final_value / 1000) * 1000 / 3
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} (Rating: {self.rating})"

    class Meta:
        verbose_name = "Player"
        verbose_name_plural = "Players"
        ordering = ['last_name', 'first_name']


class Match(models.Model):
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='matches')
    home_team = models.ForeignKey(Team, related_name='home_matches', on_delete=models.CASCADE)
    away_team = models.ForeignKey(Team, related_name='away_matches', on_delete=models.CASCADE)
    match_date = models.DateTimeField()
    match_round = models.IntegerField()

    home_team_score = models.IntegerField(default=0)
    away_team_score = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)

    current_quarter = models.IntegerField(default=1)
    game_clock = models.DurationField(default=timedelta(minutes=10))
    possession_team = models.ForeignKey(
        Team, null=True, blank=True, on_delete=models.SET_NULL, related_name='possession_matches'
    )

    class Meta:
        ordering = ['match_date']
    
    def __str__(self):
        return f"{self.home_team} vs {self.away_team} (Round {self.match_round})"
    