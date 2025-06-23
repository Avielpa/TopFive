# In TopFiveBack/admin.py
from django.contrib import admin
from django.db.models import F
from .models import League, Team, Player


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
        if self.value() == '90+':
            return queryset.filter(calculated_rating__gte=90)
        if self.value() == '80-89':
            return queryset.filter(calculated_rating__gte=80, calculated_rating__lt=90)
        if self.value() == '70-79':
            return queryset.filter(calculated_rating__gte=70, calculated_rating__lt=80)
        if self.value() == '60-69':
            return queryset.filter(calculated_rating__gte=60, calculated_rating__lt=70)
        return queryset
    

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
    list_display = ('full_name', 'team', 'position_primary', 'age', 'rating_display', 'contract_years')
    list_filter = ('team', 'position_primary', 'is_injured', RatingRangeFilter)
    search_fields = ('first_name', 'last_name', 'team__name')
    list_per_page = 20
    
    @admin.display(description='Full Name', ordering=('last_name', 'first_name'))
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    @admin.display(description='Rating', ordering='calculated_rating') 
    def rating_display(self, obj):
        return round(obj.calculated_rating)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(
            calculated_rating=(
                (F('shooting_2p') + F('shooting_3p') + F('free_throws') + F('rebound_def') + F('rebound_off') + F('passing') + F('blocking') + F('defense') + F('game_iq') + F('speed') + F('jumping') + F('strength') + F('stamina')) / 13.0
            )
        )

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