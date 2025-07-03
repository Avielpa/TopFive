// ==============================================================================
// File: frontend/types/entities.ts (UPDATED - Critical for Frontend-Backend Sync)
// Description: Defines interfaces for various entities used across the frontend.
// ==============================================================================

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

// **UPDATED PLAYER INTERFACE**
// This 'Player' interface now includes all the fields that 'FullPlayerSerializer'
// on the backend sends for transfer market players.
export interface Player {
    health_status: string;
    id: number;
    first_name: string;
    last_name: string;
    age: number;
    position_primary: string;
    rating: number;
    market_value: number;
    team_name: string | null;
    contract_years: number; 
    fitness: number;       
    is_injured: boolean;   
    height: number;        
    weight: number;        
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


export interface FullPlayer extends Player {
    // If there are truly fields *only* relevant to the FullPlayer context
    // and *not* required for the transfer market list, put them here.
    // Based on your current FullPlayerSerializer, all fields are now in 'Player'.
    // If you add a 'photo' field to the Player model and FullPlayerSerializer:
    // photo: string; // example of a field only relevant for FullPlayer detail
    // For now, it's just an alias if no unique fields.
}


export interface Match {
    id: number; // Changed from any to number for type safety
    is_finished: boolean; // Changed from any to boolean
    match_date: string;           // תאריך המשחק
    match_round: number;          // סיבוב
    home_team_name: string;       // שם הקבוצה הביתית
    away_team_name: string;       // שם הקבוצה האורחת
    home_team_score: number;      // נקודות קבוצה ביתית
    away_team_score: number;      // נקודות קבוצה אורחת
    completed: boolean;           // האם המשחק הסתיים
}