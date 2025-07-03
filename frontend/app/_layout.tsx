// ==============================================================================
// File: frontend/app/_layout.tsx (FINAL VERSION - INTEGRATED WITH API.TS)
// ==============================================================================

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { setOnSignOut } from '../services/api'; // <--- ייבוא הפונקציה setOnSignOut

const InitialLayout = () => {
    const { authenticated, isLoading, logout } = useAuth(); // <--- וודא ש-logout מיובא
    const segments = useSegments();
    const router = useRouter(); 

    useEffect(() => {
        // הגדרת פונקציית ה-signOut עבור ה-interceptor ברגע שהיא זמינה
        // וודא שזה מוגדר פעם אחת ולא בכל רינדור מיותר
        if (logout) { // לוודא שפונקציית ה-logout זמינה מהקונטקסט
            setOnSignOut(logout);
            console.log('[_layout.tsx] AuthContext logout function passed to API interceptor.');
        }
    }, [logout]); // תלוי ב-logout כדי להתעדכן אם הפונקציה משתנה (לא סביר, אבל תקין)

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (authenticated && inAuthGroup) {
            router.replace('/(tabs)/dashboard');
        } 
        else if (!authenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        }
    }, [authenticated, isLoading, segments]); 
    
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
                <ActivityIndicator size="large" color="#FFA726" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" /> 
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
};

export default function RootLayout() {
    return (
        <AuthProvider>
            <InitialLayout />
        </AuthProvider>
    );
}