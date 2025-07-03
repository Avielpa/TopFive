// ==============================================================================
// File: frontend/services/apiService.ts (FINAL & COMPLETE VERSION)
// Description: A dedicated service for all non-authentication API calls related to game logic.
//              This service utilizes the central 'api' instance from './api' to ensure
//              all requests are automatically authenticated and handled by the interceptors.
// ==============================================================================
import axios, { AxiosError } from 'axios';
import api from './api'; // Ensure this points to your configured axios instance (frontend/services/api.ts)
import { Player, TeamStanding, FullPlayer, Match } from '../types/entities'; // Make sure '../types/entities' is up-to-date as provided previously

// --- Game-related API Calls ---

/**
 * Fetches league standings for a given league ID.
 * @param leagueId The ID of the league to fetch standings for.
 * @returns A promise that resolves to an array of TeamStanding objects.
 */
export const getLeagueStandings = async (leagueId: number): Promise<TeamStanding[]> => {
    try {
        const response = await api.get<TeamStanding[]>(`/leagues/${leagueId}/standings/`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error fetching standings for league ${leagueId}:`, error.response?.data || error.message);
            throw error.response?.data || new Error(error.message); // Re-throw with more detail
        } else {
            console.error('An unexpected error occurred while fetching standings:', error);
            throw error; // Re-throw to be handled by the component
        }
    }
};

/**
 * Fetches the list of players available on the transfer market.
 * This includes free agents and players listed by other teams.
 * @returns A promise that resolves to an array of Player objects (which now includes full details).
 */
export const getTransferList = async (): Promise<Player[]> => {
    try {
        // This will now correctly map to the new, more comprehensive Player interface
        const response = await api.get<Player[]>('/players/transfer-market/');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching transfer list:', error.response?.data || error.message);
            throw error.response?.data || new Error(error.message); // Re-throw with more detail
        } else {
            console.error('An unexpected error occurred while fetching transfer list:', error);
            throw error; // Re-throw to be handled by the component
        }
    }
};

/**
 * Initiates a player purchase transaction.
 * @param playerId The ID of the player to buy.
 * @param contractYears The number of years for the player's contract (1-5).
 * @returns A promise that resolves to the transaction result (e.g., success message, new budget, bought player ID).
 */
export const buyPlayer = async (playerId: number, contractYears: number) => { // Added contractYears parameter
    try {
        const response = await api.post(`/players/${playerId}/buy/`, { contract_years: contractYears }); // Send contract_years in request body
        return response.data; // Will return success message, updated budget, and player_id
    } catch (error: any) { // Use 'any' for error to access .response safely
        if (axios.isAxiosError(error)) {
            console.error('Error buying player:', error.response?.data || error.message);
            throw error.response?.data || new Error(error.message); // Re-throw with more detail
        } else {
            console.error('An unexpected error occurred while buying player:', error);
            throw error;
        }
    }
};

/**
 * Fetches the squad (roster) of the currently authenticated user's team.
 * @returns A promise that resolves to an array of FullPlayer objects.
 */
export const getSquad = async (): Promise<FullPlayer[]> => {
    try {
        const response = await api.get<FullPlayer[]>('/team/squad/');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching squad:', error.response?.data || error.message);
            throw error.response?.data || new Error(error.message);
        } else {
            console.error('An unexpected error occurred while fetching squad:', error);
            throw error;
        }
    }
};

/**
 * Fetches matches for a specific league.
 * @param leagueID The ID of the league to fetch matches for.
 * @returns A promise that resolves to an array of Match objects, or undefined on error.
 */
export const getMatches = async (leagueID: number): Promise<Match[] | undefined> => {
    try {
        const response = await api.get<Match[]>(`matches/${leagueID}/`);
        return response.data;
    } catch (err) {
        console.error("Error Fetching Matches:", err);
        if (axios.isAxiosError(err)) {
            console.error("Axios Error Details:", err.response?.data || err.message);
            // You can choose to re-throw here if you want calling components to catch it
            // throw err.response?.data || new Error(err.message); 
        }
        return undefined; // Or [] if you prefer an empty array on error
    }
};

// Add any other API calls related to game logic here...
// For example:
// export const updateTeamTactics = async (tacticsData: any) => { ... };
// export const trainPlayer = async (playerId: number, trainingType: string) => { ... };