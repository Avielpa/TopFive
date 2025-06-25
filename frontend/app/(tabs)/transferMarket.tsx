// ==============================================================================
// File: frontend/app/(tabs)/transferMarket.tsx (Updated)
// ==============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Player } from '../../types/entities';
import { getTransferList, buyPlayer } from '../../services/apiService';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

const PlayerRow = ({ item, onBuy }: { item: Player, onBuy: (player: Player) => void }) => (
    <View style={styles.playerCard}>
        <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{item.first_name} {item.last_name}</Text>
            <Text style={styles.playerDetails}>Age: {item.age} | Pos: {item.position_primary}</Text>
            <Text style={styles.teamName}>{item.team_name || 'Free Agent'}</Text>
        </View>
        <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Feather name="star" size={18} color="#FFA726" />
        </View>
        <View style={styles.buyContainer}>
            <Text style={styles.priceText}>{formatCurrency(item.market_value)}</Text>
            <TouchableOpacity style={styles.signButton} onPress={() => onBuy(item)}>
                <Text style={styles.signButtonText}>{item.team_name ? 'Buy' : 'Sign'}</Text>
            </TouchableOpacity>
        </View>
    </View>
);

export default function TransferMarketScreen() {
    const { isLoading: isAuthLoading, userInfo, updateUserInfo } = useAuth();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    
    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const data = await getTransferList();
            setPlayers(data);
        } catch (error) {
            console.error(error)
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthLoading) {
            fetchPlayers();
        }
    }, [isAuthLoading]);

    const handleBuyPlayer = (player: Player) => {
        Alert.alert(
            `Confirm Purchase`,
            `Are you sure you want to ${player.team_name ? 'buy' : 'sign'} ${player.first_name} ${player.last_name} for ${formatCurrency(player.market_value)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            const result = await buyPlayer(player.id);
                            Alert.alert('Success', result.detail);
                            // רענון הרשימה והתקציב
                            fetchPlayers(); 
                            // --- FIXED: updateUserInfo is now available and used correctly ---
                            if (userInfo && result.new_budget !== undefined) {
                                updateUserInfo({ budget: result.new_budget });
                            }
                        } catch (error: any) {
                            Alert.alert('Transaction Failed', error.detail || 'An unknown error occurred.');
                        }
                    },
                },
            ]
        );
    };

    if (isAuthLoading || loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FFA726" />
                <Text style={styles.loadingText}>Loading Transfer Market...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Transfer Market</Text>
            <FlatList
                data={players}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <PlayerRow item={item} onBuy={handleBuyPlayer} />}
                contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 40 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
    loadingText: { marginTop: 10, color: '#94A3B8', fontSize: 16 },
    playerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 15, borderRadius: 12, marginBottom: 10 },
    playerInfo: { flex: 1 },
    playerName: { color: '#F1F5F9', fontSize: 18, fontWeight: 'bold' },
    playerDetails: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
    teamName: { color: '#64748B', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15 },
    ratingText: { color: '#FFA726', fontSize: 20, fontWeight: 'bold', marginRight: 6 },
    buyContainer: { alignItems: 'center' },
    priceText: { color: '#FFFFFF', fontSize: 14, marginBottom: 6 },
    signButton: { backgroundColor: '#FFA726', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8 },
    signButtonText: { color: '#1E293B', fontWeight: 'bold', fontSize: 14 },
});
