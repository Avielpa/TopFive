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
