# In TopFiveBack/admin.py (FINAL ROBUST VERSION)
from django.contrib import admin
from .models import League, Team, Player

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
    list_display = ('full_name', 'team', 'position_primary', 'position_secondary', 'age', 'rating', 'contract_years', 'is_injured', 'fitness')
    list_filter = ('team', 'position_primary', 'position_secondary', 'age', 'is_injured')
    search_fields = ('first_name', 'last_name', 'team__name')
    list_per_page = 20

    @admin.display(description='Full Name', ordering=('last_name', 'first_name'))
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'league', 'coach_name', 'get_overall_rating', 'get_player_count')
    list_filter = ('league',)
    search_fields = ('name', 'coach_name')
    inlines = [PlayerInline]

    @admin.display(description='Overall Rating', ordering='name') 
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