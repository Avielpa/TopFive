// File: frontend/app/index.tsx
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext'; // ייבוא ה-AuthContext

export default function AppEntryPoint() {
  const { authenticated, isLoading } = useAuth(); // השתמש ב-useAuth כאן

  // אם ה-AuthContext עדיין בטעינה, הצג אנימציית טעינה.
  // הלוגים שלך מראים שהמצב הזה עובר.
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFA726" />
      </View>
    );
  }

  // לאחר סיום הטעינה (isLoading = false):
  // אם המשתמש מאומת (authenticated = true), הפנה ישירות למסך ה-dashboard
  // בתוך קבוצת הטאבים.
  if (authenticated) {
    return <Redirect href="/(tabs)/dashboard" />; // <--- זה הנתיב החשוב
  } else {
    // אם המשתמש לא מאומת (authenticated = false), הפנה למסך ההתחברות.
    return <Redirect href="/(auth)/login" />;
  }
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});