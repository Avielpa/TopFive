// In frontend/app/(auth)/_layout.tsx

import { Stack } from 'expo-router';

// קובץ זה מגדיר את הניווט הפנימי של כל המסכים שבתוך תיקיית (auth).
export default function AuthLayout() {
  return (
    // אנו משתמשים ב-Stack Navigator כדי לאפשר מעבר "קדימה" ו"אחורה" בין מסכים.
    // ההגדרה screenOptions={{ headerShown: false }} מסתירה את הכותרת העליונה
    // הדיפולטיבית של הניווט. זה קריטי עבורנו, כי אנחנו רוצים לעצב
    // את מסכי ההתחברות וההרשמה שלנו עם עיצוב מלא וייחודי, ללא הפרעות.
    <Stack screenOptions={{ headerShown: false }} />
  );
}