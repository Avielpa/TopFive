// ==============================================================================
// File: frontend/app/(tabs)/leagueTable.tsx (WITH DETAILED LOGGING)
// Description: Added console.log to see the state received from AuthContext.
// ==============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { TeamStanding } from '../../types/entities';
import { getLeagueStandings } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';


const StandingsHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.7, textAlign: 'center' }]}>#</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 3, textAlign: 'left' }]}>Team</Text>
        <Text style={[styles.cell, styles.headerCell]}>W</Text>
        <Text style={[styles.cell, styles.headerCell]}>L</Text>
        <Text style={[styles.cell, styles.headerCell]}>%</Text>
        <Text style={[styles.cell, styles.headerCell]}>+/-</Text>
    </View>
);


const StandingsRow = ({ item, index }: { item: TeamStanding, index: number }) => (
    <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
        <Text style={[styles.cell, { flex: 0.7, fontWeight: 'bold' }]}>{index + 1}</Text>
        <Text style={[styles.cell, { flex: 3, textAlign: 'left' }]} numberOfLines={1}>{item.team_name}</Text>
        <Text style={styles.cell}>{item.wins}</Text>
        <Text style={styles.cell}>{item.losses}</Text>
        <Text style={styles.cell}>{item.win_percentage.toFixed(1)}</Text>
        <Text style={[styles.cell, item.points_difference >= 0 ? styles.positiveDiff : styles.negativeDiff]}>
            {item.points_difference > 0 ? `+${item.points_difference}` : item.points_difference}
        </Text>
    </View>
);


export default function LeagueScreen() {
    const { userInfo, isLoading: isAuthLoading } = useAuth();
    const [standings, setStandings] = useState<TeamStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // הדפסה ראשונה: לבדוק מה המצב שקיבלנו מה-Context
    console.log('[LeagueScreen] Rendering. Auth loading:', isAuthLoading, 'User Info:', userInfo);

    useEffect(() => {
        console.log('[LeagueScreen] useEffect triggered. Auth loading:', isAuthLoading, 'User Info league_id:', userInfo?.league_id);

        const fetchStandings = async () => {
            if (userInfo?.league_id) {
                console.log(`[LeagueScreen] Has league ID (${userInfo.league_id}). Fetching standings...`);
                try {
                    setLoading(true);
                    const data = await getLeagueStandings(userInfo.league_id);
                    console.log('[LeagueScreen] Successfully fetched standings data.');
                    setStandings(data);
                    setError(null);
                } catch (err) {
                    setError('Failed to load league standings.');
                    console.error('[LeagueScreen] Error fetching standings:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                 console.log('[LeagueScreen] No league ID found in user info. Skipping fetch.');
            }
        };

        if (!isAuthLoading) {
            fetchStandings();
        } else {
            console.log('[LeagueScreen] Auth is still loading, waiting to fetch.');
        }
    }, [userInfo, isAuthLoading]);

    if (isAuthLoading || loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#FFA726" />
                <Text style={styles.loadingText}>Loading Standings...</Text>
            </View>
        );
    }
    if (error) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>{userInfo?.league_name || 'League Standings'}</Text>
            <View style={styles.tableContainer}>
                <StandingsHeader />
                <FlatList
                    data={standings}
                    keyExtractor={(item) => item.team_name}
                    renderItem={({ item, index }) => <StandingsRow item={item} index={index} />}
                    contentContainerStyle={{ paddingBottom: 140 }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 40 },
    center: { justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
    tableContainer: { marginHorizontal: 10, borderWidth: 1, borderColor: '#334155', borderRadius: 8, overflow: 'hidden' },
    row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155', alignItems: 'center' },
    headerRow: { backgroundColor: '#1E293B', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: '#FFA726' },
    evenRow: { backgroundColor: '#1E293B' },
    oddRow: { backgroundColor: 'transparent' },
    cell: { color: '#CBD5E1', textAlign: 'center', flex: 1, fontSize: 14, paddingHorizontal: 2 },
    headerCell: { color: '#FFA726', fontWeight: 'bold', fontSize: 15 },
    positiveDiff: { color: '#4ADE80', fontWeight: 'bold' },
    negativeDiff: { color: '#F87171', fontWeight: 'bold' },
    loadingText: { marginTop: 10, color: '#94A3B8', fontSize: 16 },
    errorText: { color: '#F87171', fontSize: 18 },
});
