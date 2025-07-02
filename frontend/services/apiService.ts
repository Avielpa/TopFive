// ==============================================================================
// File: frontend/services/apiService.ts (Updated)
// Description: A dedicated service for all non-authentication API calls.
//              This version now uses the central 'api' instance to ensure
//              all requests are authenticated automatically.
// ==============================================================================
import axios, { AxiosError } from 'axios';
import api from './api';
import { Player, TeamStanding, FullPlayer, Match } from '../types/entities';
// services/apiService.ts

// --- שינוי 2: אין יותר צורך ב-API_URL מקומי ---
// const API_URL = 'http://10.0.2.2:8000/api';

export const getLeagueStandings = async (leagueId: number): Promise<TeamStanding[]> => {
    try {
        // --- שינוי 3: שימוש ב-api.get עם נתיב יחסי ---
        const response = await api.get<TeamStanding[]>(`/leagues/${leagueId}/standings/`);
        return response.data;
    } catch (error) {
        // שימוש בטיפול שגיאות בטוח
        if (axios.isAxiosError(error)) {
            console.error(`Error fetching standings for league ${leagueId}:`, error.response?.data || error.message);
        } else {
            console.error('An unexpected error occurred while fetching standings:', error);
        }
        throw error; // Re-throw to be handled by the component
    }
};

export const getTransferList = async (): Promise<Player[]> => {
    try {
        const response = await api.get<Player[]>('/players/transfer-market/');
        return response.data;
    } catch (error) {
        // שימוש בטיפול שגיאות בטוח
        if (axios.isAxiosError(error)) {
            console.error('Error fetching free agents:', error.response?.data || error.message);
        } else {
            console.error('An unexpected error occurred while fetching free agents:', error);
        }
        throw error; // Re-throw to be handled by the component
    }
};

export const buyPlayer = async (playerId: number) => {
    try {
        const response = await api.post(`/players/${playerId}/buy/`);
        return response.data; // יחזיר הודעת הצלחה ותקציב מעודכן
    } catch (error) {
        // ... (טיפול בשגיאות)
    }
};


export const getSquad = async (): Promise<FullPlayer[]> => {
    try {
        const response = await api.get<FullPlayer[]>('/team/squad/');
        return response.data;
    } catch (error) {
        console.error('Error fetching squad:', error);
        throw error;
    }
};

export const getMatches = async (leagueID:number)=> {
    try{
        const response = await api.get<Match[]>(`matches/${leagueID}/`);
        return response.data
    }catch (err){
        console.error("Error Fetch Matches");
    }
}




