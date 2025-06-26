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

<<<<<<< HEAD
export interface Match {
  id: any;
  is_finished: any;
  match_date: string;           // תאריך המשחק
  match_round: number;          // סיבוב
  home_team_name: string;       // שם הקבוצה הביתית
  away_team_name: string;       // שם הקבוצה האורחת
  home_team_score: number;      // נקודות קבוצה ביתית
  away_team_score: number;      // נקודות קבוצה אורחת
  completed: boolean;           // האם המשחק הסתיים
}
=======
export interface FullPlayer extends Player {
    height: number;
    weight: number;
    contract_years: number;
    fitness: number;
    is_injured: boolean;
    shooting_2p: number;
    shooting_3p: number;
    free_throws: number;
    rebound_def: number;
    rebound_off: number;
    passing: number;
    blocking: number;
    defense: number;
    game_iq: number;
    speed: number;
    jumping: number;
    strength: number;
    stamina: number;
}

>>>>>>> d688e1e2245718ffcda3e4100ddac92707a6179f
