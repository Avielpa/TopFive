// In frontend/app/(auth)/login.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  Alert, 
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Feather } from '@expo/vector-icons';

// נשתמש בתמונת רקע כדי ליצור אווירה
const BG_IMAGE = require('../../assets/logo.png');

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth(); // שימוש ב-hook שלנו כדי לקבל את פונקציית ההתחברות

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // משתנה מצב לניהול מסך טעינה

    async function handleLogin() {
        // בדיקת קלט בסיסית
        if (!username || !password) {
            Alert.alert('Missing Information', 'Please enter both username and password.');
            return;
        }
        
        setLoading(true); // הצג סימן טעינה
        try {
            await login(username, password);
            // אין צורך לנווט מכאן. ה-layout הראשי יזהה את השינוי
            // במצב ה-authenticated וינווט אוטומטית ל-dashboard.
        } catch (error: any) {
            Alert.alert('Login Failed', error.detail || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false); // הסתר סימן טעינה, בין אם הצלחנו או נכשלנו
        }
    }

    return (
        <ImageBackground source={BG_IMAGE} style={styles.background}>
            {/* שכבת כיסוי כהה כדי שהטקסט יהיה קריא */}
            <View style={styles.overlay}>
                {/* מאפשר לסגור את המקלדת בלחיצה מחוץ לשדות הקלט */}
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <Text style={styles.headerTitle}>TopFive</Text>
                        <Text style={styles.subHeader}>BECOME A LEGEND</Text>

                        {/* שדה שם משתמש */}
                        <View style={styles.inputContainer}>
                            <Feather name="user" size={20} color="#94A3B8" style={styles.icon} />
                            <TextInput
                                placeholder="Username"
                                placeholderTextColor="#94A3B8"
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* שדה סיסמה */}
                        <View style={styles.inputContainer}>
                            <Feather name="lock" size={20} color="#94A3B8" style={styles.icon} />
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="#94A3B8"
                                style={styles.input}
                                secureTextEntry // מסתיר את הטקסט
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        {/* כפתור התחברות */}
                        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#1E293B" />
                            ) : (
                                <Text style={styles.buttonText}>LOGIN</Text>
                            )}
                        </TouchableOpacity>

                        {/* קישור להרשמה */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account?</Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                                <Text style={styles.linkText}> Register Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </ImageBackground>
    );
}

// עיצוב הקומפוננטה באמצעות StyleSheet
const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        justifyContent: 'center',
    },
    container: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.9)', // רקע חצי שקוף
        borderRadius: 12,
        padding: 24,
        paddingVertical: 40,
        borderWidth: 1,
        borderColor: '#334155',
    },
    headerTitle: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'sans-serif-condensed', // דוגמה לפונט
        letterSpacing: 2,
    },
    subHeader: {
        fontSize: 14,
        color: '#FFA726',
        textAlign: 'center',
        marginBottom: 40,
        fontWeight: '600',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#334155',
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#F1F5F9',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#FFA726',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    linkText: {
        color: '#FFA726',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
