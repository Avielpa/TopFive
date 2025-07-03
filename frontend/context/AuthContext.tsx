// ==============================================================================
// File: frontend/context/AuthContext.tsx (FIXED AND READY FOR API.TS INTEGRATION)
// ==============================================================================

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import { RegisterDetails, UserInfo, LoginResponse } from '../types/authTypes';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    authenticated: boolean;
    userInfo: UserInfo | null;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    login: (username: string, password: string) => Promise<void>;
    registerAndAssignTeam: (details: RegisterDetails) => Promise<any>;
    logout: () => Promise<void>; // <--- שינוי: פונקציית logout היא כעת Promise<void>
    updateUserInfo: (newInfo: Partial<UserInfo>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [authState, setAuthState] = useState<AuthState>({
        accessToken: null,
        refreshToken: null,
        authenticated: false,
        userInfo: null,
        isLoading: true,
    });

    useEffect(() => {
        const loadUserFromStorage = async () => {
            console.log('[AuthContext] Attempting to load user from storage...');
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                const storedUserInfo = await AsyncStorage.getItem('userInfo');

                console.log(`[AuthContext] Found Access Token: ${!!accessToken}`);
                console.log(`[AuthContext] Found User Info in storage: ${!!storedUserInfo}`);

                if (accessToken && storedUserInfo) {
                    const parsedUserInfo: UserInfo = JSON.parse(storedUserInfo);
                    console.log('[AuthContext] Successfully parsed user info:', parsedUserInfo);
                    setAuthState({
                        accessToken,
                        refreshToken: await AsyncStorage.getItem('refreshToken'),
                        authenticated: true,
                        userInfo: parsedUserInfo,
                        isLoading: false,
                    });
                    console.log('[AuthContext] State updated. User is AUTHENTICATED.');
                } else {
                    console.log('[AuthContext] No token/user found. Setting user as unauthenticated.');
                    setAuthState(prevState => ({ ...prevState, authenticated: false, isLoading: false }));
                }
            } catch (e) {
                console.error('[AuthContext] Error loading from storage. Setting user as unauthenticated.', e);
                setAuthState(prevState => ({ ...prevState, authenticated: false, isLoading: false }));
            }
        };
        loadUserFromStorage();
    }, []);

    const login = async (username: string, password: string) => {
        console.log('[AuthContext] Attempting login...');
        const data = await authService.login(username, password);
        console.log('[AuthContext] Login successful. Received data:', data);
        
        await AsyncStorage.setItem('accessToken', data.access);
        await AsyncStorage.setItem('refreshToken', data.refresh);
        await AsyncStorage.setItem('userInfo', JSON.stringify(data.user_info));

        setAuthState({
            accessToken: data.access,
            refreshToken: data.refresh,
            authenticated: true,
            userInfo: data.user_info,
            isLoading: false,
        });
        console.log('[AuthContext] State updated after login.');
    };
    
    // <--- שינוי כאן: הפונקציה logout היא כעת async וקוראת ל-authService.logout()
    const logout = async () => {
        console.log('[AuthContext] Logging out...');
        try {
            await authService.logout(); // <--- קריאה לשירות ה-authService כדי להודיע לשרת
            console.log('[AuthContext] authService.logout() completed.');
        } catch (error) {
            console.error('[AuthContext] Error during authService.logout:', error);
            // אפשר להתעלם משגיאות ב-logout עצמו אם המטרה היא רק לנקות צד לקוח
        }
        
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('userInfo');
        
        setAuthState({
            accessToken: null,
            refreshToken: null,
            authenticated: false,
            userInfo: null,
            isLoading: false,
        });
        console.log('[AuthContext] State cleared after logout.');
        // router.replace('/(auth)/login'); // <--- אפשר להוסיף ניתוב לדף ההתחברות כאן, אך עדיף ב-_layout.tsx
    };

    const updateUserInfo = async (newInfo: Partial<UserInfo>) => {
        if (!authState.userInfo) return;

        const updatedUserInfo: UserInfo = {
            ...authState.userInfo,
            ...newInfo,
        };

        setAuthState(prevState => ({
            ...prevState,
            userInfo: updatedUserInfo,
        }));

        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    };

    const value: AuthContextType = {
        ...authState,
        login,
        logout,
        updateUserInfo,
        registerAndAssignTeam: authService.registerAndAssignTeam,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}