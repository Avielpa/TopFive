// ==============================================================================
// File: frontend/types/authTypes.ts (Updated and Combined)
// Description: Centralized type definitions for authentication-related data.
// ==============================================================================

// 1. מבנה פרטי המשתמש המלאים שאנחנו מקבלים מהשרת (חדש)
export interface UserInfo {
    id: number;
    username: string;
    team_id: number | null;
    team_name: string | null;
    league_id: number | null;
    league_name: string | null;
    budget: number | null;
    overall_rating: number | null;
}

// 2. המבנה המדויק של התגובה מה-API של ההתחברות (חדש)
export interface LoginResponse {
    access: string;
    refresh: string;
    user_info: UserInfo;
}

// 3. המבנה של פרטי ההרשמה (מהקובץ הקיים שלך - ללא שינוי)
export interface RegisterDetails {
    username: string;
    email: string;
    password: string;
    teamName: string;
    arenaName: string;
    primaryColor: string;
    secondaryColor: string;
}