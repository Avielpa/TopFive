// ==============================================================================
// File: frontend/services/authService.ts (Updated)
// Description: This service now uses the central 'api' instance for its requests,
//              ensuring all calls (except login/register) are authenticated.
// ==============================================================================

import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// --- שינוי 1: ייבוא ה-instance המרכזי במקום axios ---
import api from './api'; 
import { LoginResponse, RegisterDetails } from '../types/authTypes';

/**
 * Sends login credentials. Uses the central 'api' instance.
 * The interceptor will NOT attach a token here, because we don't have one yet.
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
        // --- שינוי 2: שימוש ב-api.post והנתיב הוא יחסי ---
        // הבקשה נשלחת ל- '.../api' + '/auth/login/'
        const response = await api.post<LoginResponse>('/auth/login/', {
            username,
            password,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Login failed:', error.response?.data || error.message);
            throw error.response?.data || { detail: 'Login failed' };
        } else {
            console.error('An unexpected error occurred during login:', error);
            throw { detail: 'An unexpected error occurred' };
        }
    }
};

/**
 * Sends new user and team details for registration.
 */
export const registerAndAssignTeam = async (details: RegisterDetails) => {
    try {
        // --- שינוי 3: שימוש ב-api.post גם כאן ---
        const response = await api.post('/auth/register/', {
            username: details.username,
            email: details.email,
            password: details.password,
            team_name: details.teamName,
            arena_name: details.arenaName,
            primary_color: details.primaryColor,
            secondary_color: details.secondaryColor
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Registration failed:', error.response?.data || error.message);
            throw error.response?.data || { detail: 'Registration failed' };
        } else {
            console.error('An unexpected error occurred during registration:', error);
            throw { detail: 'An unexpected error occurred' };
        }
    }
};

/**
 * Clears all user-related data from local storage upon logout.
 */
export const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userInfo');
};