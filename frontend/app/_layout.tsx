// // ==============================================================================
// // File: frontend/app/_layout.tsx (FINAL VERSION - INTEGRATED WITH API.TS)
// // ==============================================================================

// import React, { useEffect } from 'react';
// import { Stack, useRouter, useSegments } from 'expo-router';
// import { AuthProvider, useAuth } from '../context/AuthContext';
// import { ActivityIndicator, View } from 'react-native';
// import { setOnSignOut } from '../services/api'; // <--- ייבוא הפונקציה setOnSignOut

// const InitialLayout = () => {
//     const { authenticated, isLoading, logout } = useAuth(); // <--- וודא ש-logout מיובא
//     const segments = useSegments();
//     const router = useRouter(); 

//     useEffect(() => {
//         if (logout) { 
//             setOnSignOut(logout);
//             console.log('[_layout.tsx] AuthContext logout function passed to API interceptor.');
//         }
//     }, [logout]);

//     useEffect(() => {
//         if (isLoading) return;

//         const inAuthGroup = segments[0] === '(auth)';

//         if (authenticated && inAuthGroup) {
//             router.replace('/(tabs)/dashboard');
//         } 
//         else if (!authenticated && !inAuthGroup) {
//             router.replace('/(auth)/login');
//         }
//     }, [authenticated, isLoading, segments]); 
    
//     if (isLoading) {
//         return (
//             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
//                 <ActivityIndicator size="large" color="#FFA726" />
//             </View>
//         );
//     }

//     return (
//         <Stack screenOptions={{ headerShown: false }}>
//             <Stack.Screen name="(auth)" /> 
//             <Stack.Screen name="(tabs)" />
//         </Stack>
//     );
// };

// export default function RootLayout() {
//     return (
//         <AuthProvider>
//             <InitialLayout />
//         </AuthProvider>
//     );
// }



// ==============================================================================
// File: frontend/app/_layout.tsx (FINAL VERSION - INTEGRATED WITH API.TS)
// ==============================================================================

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SettingsProvider, useSettings } from '../context/SettingContext';
import { ActivityIndicator, View, I18nManager, Text } from 'react-native'; // ✅ הוספת Text
import { setOnSignOut } from '../services/api';

// רכיב SetupRTL אחראי להגדרת ה-RTL ברגע שהשפה נטענת
function SetupRTL() {
  const { language } = useSettings();

  useEffect(() => {
    const isHebrew = language === 'Hebrew';
    if (I18nManager.isRTL !== isHebrew) {
      I18nManager.allowRTL(isHebrew);
      I18nManager.forceRTL(isHebrew);
    }
  }, [language]);

  return null;
}

const InitialLayout = () => {
    const { authenticated, isLoading, logout } = useAuth();
    const segments = useSegments();
    const router = useRouter(); 

    useEffect(() => {
        if (logout) { 
            setOnSignOut(logout);
            console.log('[_layout.tsx] AuthContext logout function passed to API interceptor.');
        }
    }, [logout]);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (authenticated && inAuthGroup) {
            router.replace('/(tabs)/dashboard');
        } 
        else if (!authenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        }
    }, [authenticated, isLoading, segments, router]);
    
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
                <ActivityIndicator size="large" color="#FFA726" />
                {/* ✅ הוספת רכיב Text סביב מחרוזת הטקסט.
                  מומלץ להוסיף גם סטייל כדי שהטקסט יהיה גלוי (לדוגמה, צבע לבן).
                */}
                <Text style={{ color: '#E2E8F0', marginTop: 10 }}>Loading...</Text> 
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
            <SettingsProvider>
                <SetupRTL />
                <InitialLayout />
            </SettingsProvider>
        </AuthProvider>
    );
}