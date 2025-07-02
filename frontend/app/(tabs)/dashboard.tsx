// In frontend/app/(tabs)/dashboard.tsx

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
    const { userInfo, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        return () => {
            ScreenOrientation.unlockAsync();
        }
    }, []); 
    
    // בזמן שה-AuthContext טוען את המידע הראשוני מהאחסון, נציג מסך טעינה
    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FFA726" />
            </View>
        );
    }

    // --- התיקון המרכזי: "דלת היציאה" ---
    // לאחר סיום הטעינה, נבדוק אם פרטי המשתמש אינם מלאים
    if (!userInfo || !userInfo.team_id || !userInfo.league_id) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorHeader}>Account Configuration Incomplete</Text>
                <Text style={styles.errorText}>
                    Your user account '{userInfo?.username}' is not assigned to a team and league.
                    Please log out and either create a new user or ask an administrator to assign your user to a team.
                </Text>
                <View style={styles.logoutButton}>
                    <Button title="Logout" onPress={logout} color="#FFA726" />
                </View>
            </View>
        );
    }

    // רק אם הטעינה הסתיימה והנתונים מלאים, נציג את מסך הבית
    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>Welcome, Coach {userInfo.username}!</Text>
                <View style={styles.logoutButton}>
                    <Button title="Logout" onPress={logout} color="#FFA726" />
                </View>
            </View>
            <Text style={styles.subHeader}>Here is your team's current status:</Text>

            <View style={styles.card}>
                <Text style={styles.teamName}>{userInfo.team_name}</Text>
                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.statLabel}>League</Text>
                        <Text style={styles.statValue}>{userInfo.league_name}</Text>
                    </View>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.statLabel}>Overall</Text>
                        <Text style={[styles.statValue, {color: '#FFA726', fontSize: 28}]}>82</Text>
                    </View>
                </View>
            </View>
            <View style={styles.card}>
                 <View style={styles.rosterHeaderContainer}>
                    <Text style={styles.rosterHeader}>Starting Lineup</Text>
                    <TouchableOpacity 
                        style={styles.manageButton}
                        onPress={() => router.push('/manageLineup')}
                    >
                        <Text style={styles.manageButtonText}>Manage Lineup</Text>
                    </TouchableOpacity>
                 </View>
                 {/* ... רשימת השחקנים ... */}
            </View>
            <Button title="Logout" onPress={logout} color="#FFA726" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#0F172A', 
        paddingHorizontal: 40,
        paddingVertical: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        padding: 20,
    },
    errorHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F87171',
        textAlign: 'center',
        marginBottom: 15,
    },
    errorText: { 
        color: '#CBD5E1', 
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    //------------------------------------
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    header: { 
        fontSize: 30, 
        color: '#FFFFFF', 
        fontWeight: 'bold', 
    },
    logoutButton: {},
    subHeader: { 
        fontSize: 16, 
        color: '#94A3B8', 
        marginBottom: 20 
    },
    card: { 
        backgroundColor: '#1E293B', 
        borderRadius: 12, 
        padding: 20, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    teamName: { 
        fontSize: 24, 
        color: '#FFFFFF', 
        fontWeight: 'bold', 
        marginBottom: 20 
    },
    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center'
    },
    statLabel: { 
        fontSize: 18, 
        color: '#94A3B8' 
    },
    statValue: { 
        fontSize: 22, 
        color: '#FFFFFF', 
        fontWeight: 'bold' 
    },
    ratingContainer: {
        alignItems: 'flex-end',
    },
    rosterHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    rosterHeader: { 
        fontSize: 20, 
        color: '#FFFFFF', 
        fontWeight: 'bold', 
    },
    manageButton: {
        backgroundColor: '#334155',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    manageButtonText: {
        color: '#F1F5F9',
        fontWeight: '600',
    },
});
