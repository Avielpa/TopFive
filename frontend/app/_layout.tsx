// In frontend/app/_layout.tsx

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// זוהי קומפוננטת הליבה של הניווט. היא רצה "בתוך" ה-AuthProvider
// ויש לה גישה לכל המידע מה-Context.
const InitialLayout = () => {
  // שימוש ב-hook המותאם אישית שלנו כדי לקבל את מצב האימות
  const { authenticated, isLoading } = useAuth();
  
  // Hooks של Expo Router
  const segments = useSegments(); // מחזיר את מקטעי ה-URL הנוכחיים (למשל, ['(auth)', 'login'])
  const router = useRouter();   // מאפשר לנו לנווט בין מסכים באופן פרוגרמטי

  // ה-useEffect הזה הוא ה"שומר בשער". הוא רץ בכל פעם שמצב האימות או הניווט משתנה.
  useEffect(() => {
    // אם אנחנו עדיין בודקים את הסטטוס הראשוני, לא לעשות כלום
    if (isLoading) return;

    // בודק אם המשתמש נמצא כרגע בקבוצת המסכים של האורחים
    const inAuthGroup = segments[0] === '(auth)';

    // תנאי 1: אם המשתמש מחובר (authenticated) אבל עדיין נמצא במסכי האורח...
    if (authenticated && inAuthGroup) {
      // ...שלח אותו מיד למסך הראשי של המשחק (ה-Dashboard)
      router.replace('/(tabs)/dashboard');
    } 
    // תנאי 2: אם המשתמש *לא* מחובר אבל נמצא במסכי המשחק...
    else if (!authenticated && !inAuthGroup) {
      // ...שלח אותו מיד חזרה למסך ההתחברות
      router.replace('/(auth)/login');
    }

  }, [authenticated, isLoading, segments]); // התלות במשתנים אלו מבטיחה שהבדיקה תרוץ מחדש כשהם משתנים
  
  // בזמן שה-AuthContext בודק את ה-AsyncStorage, נציג סימן טעינה
  if (isLoading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
            <ActivityIndicator size="large" color="#FFA726" />
        </View>
    );
  }

  // לאחר סיום הטעינה, נציג את השלד הראשי של האפליקציה
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" /> 
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};


// זוהי קומפוננטת השורש של כל האפליקציה
export default function RootLayout() {
  return (
    // "עוטפים" את כל האפליקציה ב-AuthProvider כדי שהמידע על המשתמש
    // יהיה זמין בכל מקום, לכל הקומפוננטות.
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}

