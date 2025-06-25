export interface TeamStanding {
    team_name: string;
    games_played: number;
    wins: number;
    losses: number;
    points_for: number;
    points_against: number;
    points_difference: number;
    win_percentage: number;
}

export interface Player {
    id: number;
    first_name: string;
    last_name: string;
    age: number;
    position_primary: string;
    rating: number;
    market_value: number;
    team_name: string | null;
}