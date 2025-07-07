// ==============================================================================
// File: frontend/services/apiService.ts
// Description: A dedicated service for all non-authentication API calls related to game logic.
//              This service utilizes the central 'api' instance from './api' to ensure
//              all requests are automatically authenticated and handled by the interceptors.
// ==============================================================================
import axios, { AxiosError } from 'axios';
import api from './api'; // ודא שזה מצביע ל-axios instance המוגדר שלך (frontend/services/api.ts)
import { Player, TeamStanding, FullPlayer, Match } from '../types/entities'; // ודא שהטיפוסים עדכניים

/**
 * מטפל בשגיאות Axios באופן מרכזי ומחזיר את פרטי השגיאה.
 * @param error אובייקט השגיאה.
 * @param message הודעה לוג מותאמת אישית.
 * @returns הודעת שגיאה מפורטת או אובייקט השגיאה המקורי.
 */
const handleApiError = (error: unknown, message: string): Error => {
  if (axios.isAxiosError(error)) {
    console.error(`${message}:`, error.response?.data || error.message);
    // לזרוק שגיאה עם הנתונים מהשרת אם קיימים, אחרת הודעת השגיאה של Axios
    throw error.response?.data || new Error(error.message);
  } else {
    console.error(`שגיאה בלתי צפויה: ${message}:`, error);
    throw error; // לזרוק שגיאות לא צפויות גם כן
  }
};

/**
 * שולף את טבלת הליגה עבור ID ליגה נתון.
 * @param leagueId ה-ID של הליגה עבורה יש לשלוף את הטבלה.
 * @returns Promise שמחזיר מערך של אובייקטי TeamStanding.
 */
export const getLeagueStandings = async (leagueId: number): Promise<TeamStanding[]> => {
  try {
    const response = await api.get<TeamStanding[]>(`/leagues/${leagueId}/standings/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, `שגיאה בשליפת טבלת הליגה עבור ליגה ${leagueId}`);
  }
};

/**
 * שולף את רשימת השחקנים הזמינים בשוק ההעברות.
 * זה כולל שחקנים חופשיים ושחקנים המוצעים על ידי קבוצות אחרות.
 * @returns Promise שמחזיר מערך של אובייקטי Player (כולל פרטים מלאים כעת).
 */
export const getTransferList = async (): Promise<Player[]> => {
  try {
    const response = await api.get<Player[]>('/players/transfer-market/');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'שגיאה בשליפת רשימת ההעברות');
  }
};

/**
 * יוזם עסקת רכישת שחקן.
 * @param playerId ה-ID של השחקן לרכישה.
 * @param contractYears מספר שנות החוזה של השחקן (1-5).
 * @returns Promise שמחזיר את תוצאת העסקה (לדוגמה, הודעת הצלחה, תקציב מעודכן, ID של השחקן שנרכש).
 */
export const buyPlayer = async (playerId: number, contractYears: number) => {
  try {
    const response = await api.post(`/players/${playerId}/buy/`, { contract_years: contractYears });
    return response.data;
  } catch (error) {
    throw handleApiError(error, `שגיאה ברכישת שחקן ${playerId}`);
  }
};

/**
 * שולף את הסגל (הרוסטר) של הקבוצה של המשתמש המאומת.
 * @returns Promise שמחזיר מערך של אובייקטי FullPlayer.
 */
export const getSquad = async (): Promise<FullPlayer[]> => {
  try {
    const response = await api.get<FullPlayer[]>('/team/squad/');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'שגיאה בשליפת סגל הקבוצה');
  }
};

/**
 * שולף משחקים עבור ליגה ספציפית.
 * @param leagueID ה-ID של הליגה עבורה יש לשלוף משחקים.
 * @returns Promise שמחזיר מערך של אובייקטי Match, או undefined במקרה של שגיאה.
 */
export const getMatches = async (leagueID: number): Promise<Match[] | undefined> => {
  try {
    const response = await api.get<Match[]>(`matches/${leagueID}/`);
    return response.data;
  } catch (error) {
    // עבור שגיאות בשליפת משחקים, אנו מחזירים undefined במקום לזרוק שגיאה
    // כדי לא לשבור את ה-UI שמציג לוח זמנים של משחקים.
    console.error(`שגיאה בשליפת משחקים עבור ליגה ${leagueID}:`, (error as AxiosError).response?.data || (error as Error).message);
    return undefined;
  }
};

/**
 * שולף את הסגל (הרוסטר) של קבוצה ספציפית לפי ה-ID שלה.
 * @param teamId ה-ID של הקבוצה עבורה יש לשלוף את הסגל.
 * @returns Promise שמחזיר מערך של אובייקטי FullPlayer.
 */
export const getTeamSquad = async (teamId: number): Promise<FullPlayer[]> => {
  try {
    const response = await api.get<FullPlayer[]>(`/teams/${teamId}/squad/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, `שגיאה בשליפת סגל עבור קבוצה ${teamId}`);
  }
};

/**
 * שולף את הסטטיסטיקות העונתיות (TeamStanding) עבור קבוצה ספציפית לפי ה-ID שלה.
 * @param teamId ה-ID של הקבוצה עבורה יש לשלוף את הסטנדינג.
 * @returns Promise שמחזיר אובייקט TeamStanding יחיד.
 */
export const getTeamStandingById = async (teamId: number): Promise<TeamStanding> => {
    try {
        // הנתיב /api/teams/{teamId}/standing/ מניח שיש לך View ב-Backend
        // שמחזיר אובייקט TeamStanding יחיד עבור ה-ID הנתון.
        const response = await api.get<TeamStanding>(`/teams/${teamId}/standing/`);
        return response.data;
    } catch (error) {
        throw handleApiError(error, `שגיאה בשליפת סטנדינג עבור קבוצה ${teamId}`);
    }
};
