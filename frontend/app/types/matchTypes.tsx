export interface Match {
  match_date: string;           // תאריך המשחק
  match_round: number;          // סיבוב
  home_team_name: string;       // שם הקבוצה הביתית
  away_team_name: string;       // שם הקבוצה האורחת
  home_team_score: number;      // נקודות קבוצה ביתית
  away_team_score: number;      // נקודות קבוצה אורחת
  completed: boolean;           // האם המשחק הסתיים
}
