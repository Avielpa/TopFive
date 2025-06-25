// ==============================================================================
// File: frontend/services/league_schedule.js
// Location: Service for fetching game schedule data.
// ==============================================================================
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:8000/api';

export const getAllMatches = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/matches/`);
        return response.data;
    } catch (error) {
        // --- MINOR FIX ---
        // Corrected a typo ("natches" -> "matches") and properly included the error object in the log.
        console.error('Failed to get matches', error);
        throw error;
    }
}