# ==============================================================================
# File: TopFiveBack/admin.py (Fixed and Merged)
# Description: This version combines your existing admin configurations with
#              the new, sortable calculated market value.
# ==============================================================================
from django.contrib import admin
from .models import League, Team, Player, Match, TeamSeasonStats
from django.db.models import F, Case, When, Value, FloatField
from django.db.models.functions import Power, Greatest

# פילטר טווח דירוגים (ללא שינוי)
class RatingRangeFilter(admin.SimpleListFilter):
    title = 'Player Rating'
    parameter_name = 'rating_range'

    def lookups(self, request, model_admin):
        return (
            ('90+', 'Elite (90+)'),
            ('80-89', 'All-Star (80-89)'),
            ('70-79', 'Starter (70-79)'),
            ('60-69', 'Bench Player (60-69)'),
        )

    def queryset(self, request, queryset):
        # ודא שה-queryset כבר מכיל את calculated_rating
        if self.value() == '90+':
            return queryset.filter(calculated_rating__gte=90)
        if self.value() == '80-89':
            return queryset.filter(calculated_rating__gte=80, calculated_rating__lt=90)
        if self.value() == '70-79':
            return queryset.filter(calculated_rating__gte=70, calculated_rating__lt=80)
        if self.value() == '60-69':
            return queryset.filter(calculated_rating__gte=60, calculated_rating__lt=70)
        return queryset

# תצוגות Inline (ללא שינוי)
class PlayerInline(admin.TabularInline):
    model = Player
    fields = ('first_name', 'last_name', 'position_primary', 'age', 'rating')
    readonly_fields = ('first_name', 'last_name', 'position_primary', 'age', 'rating')
    show_change_link = True
    extra = 0
    can_delete = False

class TeamInline(admin.TabularInline):
    model = Team
    fields = ('name', 'coach_name', 'get_overall_rating', 'get_player_count')
    readonly_fields = ('name', 'coach_name', 'get_overall_rating', 'get_player_count')
    show_change_link = True
    extra = 0
    can_delete = False

    def get_overall_rating(self, obj):
        return obj.overall_rating
    get_overall_rating.short_description = 'Overall Rating'

    def get_player_count(self, obj):
        return obj.players.count()
    get_player_count.short_description = 'Number of Players'


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    # --- תיקון: הוספת שווי השוק לתצוגה ---
    list_display = ('full_name', 'team', 'position_primary', 'age', 'rating_display', 'market_value_display', 'contract_years')
    list_filter = ('team', 'position_primary', 'is_injured', RatingRangeFilter)
    search_fields = ('first_name', 'last_name', 'team__name')
    list_per_page = 20
    
    @admin.display(description='Full Name', ordering=('last_name', 'first_name'))
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    @admin.display(description='Rating', ordering='calculated_rating') 
    def rating_display(self, obj):
        # ודא שהשדה המחושב קיים לפני גישה אליו
        return round(obj.calculated_rating) if hasattr(obj, 'calculated_rating') else 'N/A'

    # --- תיקון: מתודה נפרדת לשווי שוק ---
    @admin.display(description='Market Value ($)', ordering='calculated_market_value') 
    def market_value_display(self, obj):
        return f"{obj.calculated_market_value:,.0f}" if hasattr(obj, 'calculated_market_value') else "N/A"
    
    # --- תיקון: מתודת get_queryset אחת שכוללת את שני החישובים ---
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        
        # חישוב דירוג
        rating_calc = (
            (F('shooting_2p') + F('shooting_3p') + F('free_throws') + F('rebound_def') + 
             F('rebound_off') + F('passing') + F('blocking') + F('defense') + 
             F('game_iq') + F('speed') + F('jumping') + F('strength') + F('stamina')) / 13.0
        )
        
        # חישוב שווי שוק (מבוסס על הנוסחה שקבענו)
        base_value_calc = Power(rating_calc / 55.0, 4.5) * 650000
        age_factor_calc = Greatest(
            Case(
                When(age__lte=27, then=Value(1.0) + (Value(27.0) - F('age')) * Value(0.06)),
                default=Value(1.0) - (F('age') - Value(27.0)) * Value(0.09),
                output_field=FloatField()
            ),
            Value(0.2)
        )
        contract_factor_calc = Case(
            When(contract_years=0, then=Value(1.0)),
            default=Value(1.0) + (F('contract_years') * Value(0.15)),
            output_field=FloatField()
        )
        
        # הוספת שני השדות המחושבים ל-queryset
        return queryset.annotate(
            calculated_rating=rating_calc,
            calculated_market_value=(
                base_value_calc * age_factor_calc * contract_factor_calc / 3.0
            )
        )

# הגדרות Admin אחרות (ללא שינוי)
@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'league', 'coach_name', 'get_overall_rating', 'get_player_count')
    list_filter = ('league',)
    search_fields = ('name', 'coach_name')
    inlines = [PlayerInline]

    @admin.display(description='Overall Rating')
    def get_overall_rating(self, obj):
        return obj.overall_rating

    def get_player_count(self, obj):
        return obj.players.count()
    get_player_count.short_description = 'Number of Players'

@admin.register(League)
class LeagueAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'status', 'current_season_year')
    list_filter = ('level', 'status')
    inlines = [TeamInline]

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = [
        'league', 'match_round', 'match_date',
        'home_team', 'away_team',
        'home_team_score', 'away_team_score',
        'completed', 'current_quarter', 'possession_team'
    ]
    list_filter = ['league', 'completed', 'match_round']
    search_fields = ['home_team__name', 'away_team__name']
    ordering = ['match_date']

@admin.register(TeamSeasonStats)
class TeamSeasonStatsAdmin(admin.ModelAdmin):
    list_display = ('id', 'team', 'league', 'season', 'wins', 'losses')
    list_filter = ('league', 'season')
    search_fields = ('team__name',)
