// ==============================================================================
// File: frontend/app/(tabs)/squad.tsx (FIXED)
// Description: The new screen to display and manage the team's squad.
// ==============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { FullPlayer } from '../../types/entities';
import { getSquad } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { Feather } from '@expo/vector-icons';

type SortKey = keyof FullPlayer;
type SortDirection = 'asc' | 'desc';

const SquadScreen = () => {
    const { isLoading: isAuthLoading } = useAuth();
    const [players, setPlayers] = useState<FullPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({
        key: 'rating',
        direction: 'desc',
    });

    useEffect(() => {
        if (!isAuthLoading) {
            const fetchSquad = async () => {
                setLoading(true);
                try {
                    const data = await getSquad();
                    setPlayers(data);
                } catch (error) {
                    console.error("Failed to fetch squad", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchSquad();
        }
    }, [isAuthLoading]);

    const sortedPlayers = useMemo(() => {
        if (!sortConfig) return players;

        return [...players].sort((a, b) => {
            const key = sortConfig.key;
            const direction = sortConfig.direction;

            const aVal = a[key];
            const bVal = b[key];

            if (aVal == null || bVal == null) return 0;

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [players, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const renderHeader = () => (
        <View style={styles.headerRow}>
            <SortableHeader title="Player" sortKey="last_name" requestSort={requestSort} sortConfig={sortConfig} style={{ flex: 3 }} />
            <SortableHeader title="Pos" sortKey="position_primary" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader title="Age" sortKey="age" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader title="Rat" sortKey="rating" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader title="Yrs" sortKey="contract_years" requestSort={requestSort} sortConfig={sortConfig} />
        </View>
    );

    const renderPlayerRow = ({ item }: { item: FullPlayer }) => (
        <TouchableOpacity onPress={() => console.log('Player pressed:', item.id)}>
            <View style={styles.playerRow}>
                <Text style={[styles.cell, { flex: 3, textAlign: 'left' }]}>{`${item.first_name.charAt(0)}. ${item.last_name}`}</Text>
                <Text style={styles.cell}>{item.position_primary}</Text>
                <Text style={styles.cell}>{item.age}</Text>
                <Text style={[styles.cell, styles.ratingCell]}>{item.rating}</Text>
                <Text style={styles.cell}>{item.contract_years}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isAuthLoading || loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FFA726" />
                <Text style={styles.loadingText}>Loading Squad...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Team Squad</Text>
            <View style={styles.tableContainer}>
                {renderHeader()}
                <FlatList
                    data={sortedPlayers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPlayerRow}
                />
            </View>
        </SafeAreaView>
    );
};

const SortableHeader = ({ title, sortKey, requestSort, sortConfig, style }: any) => {
    const iconName = sortConfig?.direction === 'asc' ? 'chevron-up' : 'chevron-down';
    const isActive = sortConfig?.key === sortKey;

    return (
        <TouchableOpacity style={[styles.headerCell, style]} onPress={() => requestSort(sortKey)}>
            <Text style={styles.headerText}>{title}</Text>
            {isActive && <Feather name={iconName} size={16} color="#FFA726" />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 40 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
    loadingText: { marginTop: 10, color: '#94A3B8', fontSize: 16 },
    tableContainer: { marginHorizontal: 10 },
    headerRow: { flexDirection: 'row', backgroundColor: '#1E293B', paddingVertical: 14, paddingHorizontal: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
    headerCell: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
    headerText: { color: '#FFA726', fontWeight: 'bold', fontSize: 15, marginRight: 4 },
    playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#334155', backgroundColor: '#1E293B' },
    cell: { color: '#CBD5E1', textAlign: 'center', flex: 1, fontSize: 14 },
    ratingCell: { fontWeight: 'bold', color: '#FFA726' },
});

export default SquadScreen;

