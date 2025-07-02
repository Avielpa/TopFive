// In frontend/app/(tabs)/manageLineup.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Feather } from '@expo/vector-icons';

// --- הגדרת טיפוסים (Types) ---
type OffensiveRole = 'PRIMARY' | 'SECONDARY' | 'ROLE' | 'DND';
type PlayerRole = 'STARTER' | 'BENCH' | 'RESERVE';
type KeyRole = 'goToGuy' | 'defensiveStopper';

type PlayerType = {
    id: number;
    name: string;
    pos: string;
    rating: number;
    role: PlayerRole;
    minutes: number;
    offensive_role: OffensiveRole;
};

// --- נתונים מדומים (Mock Data) ---
const MOCK_PLAYERS: PlayerType[] = [
    { id: 1, name: 'S. Cohen', pos: 'PG', rating: 95, role: 'STARTER', minutes: 34, offensive_role: 'PRIMARY' },
    { id: 2, name: 'K. Levi', pos: 'SG', rating: 94, role: 'STARTER', minutes: 32, offensive_role: 'SECONDARY' },
    { id: 3, name: 'L. Davidson', pos: 'SF', rating: 96, role: 'STARTER', minutes: 25, offensive_role: 'PRIMARY' },
    { id: 4, name: 'G. Mizrahi', pos: 'PF', rating: 97, role: 'STARTER', minutes: 26, offensive_role: 'SECONDARY' },
    { id: 5, name: 'N. Avraham', pos: 'C', rating: 98, role: 'STARTER', minutes: 28, offensive_role: 'ROLE' },
    { id: 6, name: 'G. Levy', pos: 'PG', rating: 78, role: 'BENCH', minutes: 14, offensive_role: 'ROLE' },
    { id: 7, name: 'D. Peretz', pos: 'SG', rating: 80, role: 'BENCH', minutes: 16, offensive_role: 'SECONDARY' },
    { id: 8, name: 'A. Friedman', pos: 'SF', rating: 75, role: 'BENCH', minutes: 13, offensive_role: 'DND' },
    { id: 9, name: 'O. Katz', pos: 'PF', rating: 76, role: 'BENCH', minutes: 12, offensive_role: 'ROLE' },
    { id: 10, name: 'Y. Atias', pos: 'C', rating: 79, role: 'BENCH', minutes: 10, offensive_role: 'ROLE' },
    { id: 11, name: 'B. Dahan', pos: 'SG', rating: 72, role: 'RESERVE', minutes: 0, offensive_role: 'DND' },
    { id: 12, name: 'T. Ohana', pos: 'C', rating: 71, role: 'RESERVE', minutes: 0, offensive_role: 'DND' },
];

const OFFENSIVE_ROLES: { key: OffensiveRole, label: string }[] = [
    { key: 'PRIMARY', label: '1st Opt' }, { key: 'SECONDARY', label: '2nd Opt' },
    { key: 'ROLE', label: 'Role' }, { key: 'DND', label: 'DND' }
];

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

// --- הגדרת טיפוסי Props עבור קומפוננטות העזר ---
type RotationPlayerProps = {
    player: PlayerType;
    onMinutesChange: (playerId: number, minutes: number) => void;
    onRoleChange: (playerId: number, role: OffensiveRole) => void;
    onInitiateSwap: (player: PlayerType) => void; // Prop חדש לפתיחת מודל ההחלפה
    maxMinutes: number;
};

type TacticalSliderProps = {
    label: string;
    value: number;
    onValueChange: (value: number) => void;
};

type KeyPlayerSelectorProps = {
    label: string;
    players: PlayerType[];
    selectedId: number | null;
    onSelect: () => void;
};

type PositionalStrengthChartProps = {
    players: PlayerType[];
};


// --- קומפוננטות עזר עם טיפוסים מוגדרים ---
const RotationPlayer = ({ player, onMinutesChange, onRoleChange, onInitiateSwap, maxMinutes }: RotationPlayerProps) => {
    const [displayMinutes, setDisplayMinutes] = useState(player.minutes);

    return (
        <View style={styles.playerCard}>
            <View style={styles.playerInfo}>
                <View>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerDetails}>{player.pos} | Rating: {player.rating}</Text>
                </View>
                {/* כפתור החלפה חדש */}
                <TouchableOpacity onPress={() => onInitiateSwap(player)} style={styles.swapButton}>
                    <Feather name="repeat" size={18} color="#94A3B8" />
                </TouchableOpacity>
            </View>
            <View style={styles.playerControls}>
                <View style={styles.sliderContainer}>
                    <Slider
                        style={{ flex: 1, height: 40 }}
                        minimumValue={0}
                        maximumValue={Math.min(40, maxMinutes)}
                        step={1}
                        value={player.minutes}
                        onValueChange={setDisplayMinutes}
                        onSlidingComplete={(value) => onMinutesChange(player.id, value)}
                        minimumTrackTintColor="#FFA726"
                        maximumTrackTintColor="#334155"
                        thumbTintColor="#FFA726"
                    />
                    <Text style={styles.minutesText}>{Math.round(displayMinutes)}</Text>
                </View>
                <View style={styles.offensiveRoleSelector}>
                    {OFFENSIVE_ROLES.map(role => (
                        <TouchableOpacity key={role.key}
                            style={[styles.roleButton, player.offensive_role === role.key && styles.roleButtonActive]}
                            onPress={() => onRoleChange(player.id, role.key)}>
                            <Text style={[styles.roleButtonText, player.offensive_role === role.key && styles.roleButtonTextActive]}>{role.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

const TacticalSlider = ({ label, value, onValueChange }: TacticalSliderProps) => (
    <View style={styles.tacticalSlider}>
        <Text style={styles.tacticalLabel}>{label}</Text>
        <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={1} maximumValue={5} step={1} value={value}
            onValueChange={onValueChange}
            minimumTrackTintColor="#FFA726" maximumTrackTintColor="#334155" thumbTintColor="#FFA726"
        />
        <Text style={styles.tacticalValue}>{value}</Text>
    </View>
);

const KeyPlayerSelector = ({ label, players, selectedId, onSelect }: KeyPlayerSelectorProps) => (
    <View style={styles.keyPlayerContainer}>
        <Text style={styles.tacticalLabel}>{label}</Text>
        <TouchableOpacity style={styles.keyPlayerSelector} onPress={onSelect}>
            <Text style={styles.keyPlayerName}>{players.find(p => p.id === selectedId)?.name || 'Not Selected'}</Text>
            <Feather name="chevron-down" size={16} color="#94A3B8" />
        </TouchableOpacity>
    </View>
);

const PositionalStrengthChart = ({ players }: PositionalStrengthChartProps) => {
    const chartData = useMemo(() => {
        return POSITIONS.map(pos => {
            const posPlayers = players.filter(p => p.pos === pos && p.minutes > 0);
            if (posPlayers.length === 0) {
                return { pos, rating: 0, totalMinutes: 0 };
            }
            const totalMinutes = posPlayers.reduce((sum, p) => sum + p.minutes, 0);
            const weightedRating = posPlayers.reduce((sum, p) => sum + (p.rating * p.minutes), 0);
            return { pos, rating: Math.round(weightedRating / totalMinutes), totalMinutes };
        });
    }, [players]);

    const maxRating = Math.max(...chartData.map(d => d.rating), 70);

    return (
        <View style={styles.chartContainer}>
            {chartData.map(data => (
                <View key={data.pos} style={styles.barWrapper}>
                    <View style={[styles.bar, { height: `${(data.rating / maxRating) * 100}%` }]}>
                        <Text style={styles.barMinutesText}>{data.totalMinutes > 0 ? data.totalMinutes : ''}</Text>
                    </View>
                    <Text style={styles.barLabel}>{data.pos}</Text>
                </View>
            ))}
        </View>
    );
};

// --- קומפוננטה ראשית ---
export default function ManageLineupScreen() {
    const router = useRouter();
    const [players, setPlayers] = useState<PlayerType[]>(MOCK_PLAYERS);

    const [tactics, setTactics] = useState({
        pace: 3,
        offensiveFocus: 3,
        defensiveAggressiveness: 3,
        goToGuy: 3,
        defensiveStopper: 4,
    });

    // State for Key Player Modal
    const [keyPlayerModalVisible, setKeyPlayerModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<KeyRole | null>(null);

    // State for Swap Player Modal
    const [swapModalVisible, setSwapModalVisible] = useState(false);
    const [playerToSwap, setPlayerToSwap] = useState<PlayerType | null>(null);

    const totalMinutes = useMemo(() => players.reduce((sum, p) => sum + p.minutes, 0), [players]);
    // 48 min game * 5 positions = 240 total minutes to be distributed
    const remainingMinutes = 240 - totalMinutes;

    const handleMinutesChange = useCallback((playerId: number, minutes: number) => {
        const roundedMinutes = Math.round(minutes);
        setPlayers(current => current.map(p => p.id === playerId ? { ...p, minutes: roundedMinutes } : p));
    }, []);

    const handleOffensiveRoleChange = useCallback((playerId: number, offensive_role: OffensiveRole) => {
        setPlayers(current => current.map(p => p.id === playerId ? { ...p, offensive_role } : p));
    }, []);

    // --- Key Player Logic ---
    const openKeyPlayerModal = (role: KeyRole) => {
        setEditingRole(role);
        setKeyPlayerModalVisible(true);
    };

    const handleSelectKeyPlayer = (playerId: number) => {
        if (editingRole) {
            setTactics(prev => ({ ...prev, [editingRole]: playerId }));
        }
        setKeyPlayerModalVisible(false);
        setEditingRole(null);
    };

    // --- Swap Player Logic ---
    const openSwapModal = useCallback((player: PlayerType) => {
        setPlayerToSwap(player);
        setSwapModalVisible(true);
    }, []);

    const handleSwapPlayer = useCallback((targetPlayerId: number) => {
        if (!playerToSwap) return;

        setPlayers(currentPlayers => {
            const newPlayers = currentPlayers.map(p => {
                // The player initiating the swap gets the target's role
                if (p.id === playerToSwap.id) {
                    const targetPlayer = currentPlayers.find(tp => tp.id === targetPlayerId);
                    return { ...p, role: targetPlayer?.role || p.role };
                }
                // The target player gets the initiator's role
                if (p.id === targetPlayerId) {
                    return { ...p, role: playerToSwap.role };
                }
                return p;
            });
            return newPlayers;
        });

        setSwapModalVisible(false);
        setPlayerToSwap(null);
    }, [playerToSwap]);


    const handleSaveChanges = () => { /* ... */ };

    const starters = useMemo(() => players.filter(p => p.role === 'STARTER').sort((a, b) => POSITIONS.indexOf(a.pos) - POSITIONS.indexOf(b.pos)), [players]);
    const bench = useMemo(() => players.filter(p => p.role === 'BENCH').sort((a, b) => b.rating - a.rating), [players]);
    const reserves = useMemo(() => players.filter(p => p.role === 'RESERVE').sort((a, b) => b.rating - a.rating), [players]);

    // Players available for swapping in the modal
    const swappablePlayers = playerToSwap?.role === 'STARTER' ? [...bench, ...reserves] : starters;

    return (
        <View style={styles.screen}>
            <Stack.Screen options={{ headerShown: true, title: 'Tactics & Rotation', headerStyle: { backgroundColor: '#1E293B' }, headerTintColor: '#FFFFFF', headerTitleStyle: { fontWeight: 'bold' }, headerRight: () => (<TouchableOpacity onPress={handleSaveChanges} style={styles.headerButton}><Text style={styles.headerButtonText}>Save</Text></TouchableOpacity>) }} />

            {/* Modal for selecting Go-To Guy / Defensive Stopper */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={keyPlayerModalVisible}
                onRequestClose={() => setKeyPlayerModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select {editingRole === 'goToGuy' ? 'Go-To Guy' : 'Defensive Stopper'}</Text>
                        <ScrollView>
                            {players.map(p => (
                                <TouchableOpacity key={p.id} style={styles.modalPlayerRow} onPress={() => handleSelectKeyPlayer(p.id)}>
                                    <Text style={styles.modalPlayerName}>{p.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setKeyPlayerModalVisible(false)}>
                            <Text style={styles.modalCloseButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for swapping players */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={swapModalVisible}
                onRequestClose={() => setSwapModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Swap {playerToSwap?.name} with...</Text>
                        <ScrollView>
                            {swappablePlayers.map(p => (
                                <TouchableOpacity key={p.id} style={styles.modalPlayerRow} onPress={() => handleSwapPlayer(p.id)}>
                                    <Text style={styles.modalPlayerName}>{p.name} ({p.pos} | {p.rating})</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSwapModalVisible(false)}>
                            <Text style={styles.modalCloseButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.mainContainer}>
                <View style={styles.leftColumn}>
                    <Text style={styles.columnHeader}>Tactical Center</Text>
                    <ScrollView>
                        <View style={styles.tacticsCard}>
                            <Text style={styles.sectionHeader}>Team DNA</Text>
                            <TacticalSlider label="Pace" value={tactics.pace} onValueChange={v => setTactics(t => ({ ...t, pace: v }))} />
                            <TacticalSlider label="Off. Focus" value={tactics.offensiveFocus} onValueChange={v => setTactics(t => ({ ...t, offensiveFocus: v }))} />
                            <TacticalSlider label="Def. Aggression" value={tactics.defensiveAggressiveness} onValueChange={v => setTactics(t => ({ ...t, defensiveAggressiveness: v }))} />
                        </View>
                        <View style={styles.tacticsCard}>
                            <Text style={styles.sectionHeader}>Key Player Roles</Text>
                            <KeyPlayerSelector label="Go-To Guy" players={players} selectedId={tactics.goToGuy} onSelect={() => openKeyPlayerModal('goToGuy')} />
                            <KeyPlayerSelector label="Defensive Stopper" players={players} selectedId={tactics.defensiveStopper} onSelect={() => openKeyPlayerModal('defensiveStopper')} />
                        </View>
                        <View style={styles.tacticsCard}>
                            <Text style={styles.sectionHeader}>Positional Strength</Text>
                            <PositionalStrengthChart players={players} />
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.rightColumn}>
                    <View style={styles.summaryBar}>
                        <Text style={styles.summaryText}>Total Minutes:</Text>
                        <Text style={[styles.summaryText, { color: totalMinutes === 240 ? '#4ADE80' : '#F87171' }]}>{totalMinutes} / 240</Text>
                    </View>
                    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                        {/* --- STARTERS SECTION --- */}
                        <View style={styles.rotationSection}>
                            <Text style={styles.positionHeader}>STARTERS ({starters.length})</Text>
                            {starters.map(player =>
                                <RotationPlayer
                                    key={player.id}
                                    player={player}
                                    onMinutesChange={handleMinutesChange}
                                    onRoleChange={handleOffensiveRoleChange}
                                    onInitiateSwap={openSwapModal}
                                    maxMinutes={player.minutes + remainingMinutes}
                                />
                            )}
                        </View>

                        {/* --- BENCH SECTION --- */}
                        <View style={styles.rotationSection}>
                            <Text style={styles.positionHeader}>BENCH ({bench.length})</Text>
                            {bench.map(player =>
                                <RotationPlayer
                                    key={player.id}
                                    player={player}
                                    onMinutesChange={handleMinutesChange}
                                    onRoleChange={handleOffensiveRoleChange}
                                    onInitiateSwap={openSwapModal}
                                    maxMinutes={player.minutes + remainingMinutes}
                                />
                            )}
                        </View>

                        {/* --- RESERVES SECTION --- */}
                        {reserves.length > 0 && (
                            <View style={styles.rotationSection}>
                                <Text style={styles.positionHeader}>RESERVES ({reserves.length})</Text>
                                {reserves.map(player =>
                                    <RotationPlayer
                                        key={player.id}
                                        player={player}
                                        onMinutesChange={handleMinutesChange}
                                        onRoleChange={handleOffensiveRoleChange}
                                        onInitiateSwap={openSwapModal}
                                        maxMinutes={player.minutes + remainingMinutes}
                                    />
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#0F172A', flexDirection: 'row' },
    mainContainer: { flex: 1, flexDirection: 'row' },
    leftColumn: { width: '40%', backgroundColor: '#1E293B', padding: 10, borderRightWidth: 2, borderRightColor: '#334155' },
    rightColumn: { width: '60%' },
    columnHeader: { fontSize: 20, fontWeight: 'bold', color: '#FFA726', textAlign: 'center', marginBottom: 15 },
    tacticsCard: { padding: 15, backgroundColor: '#334155', borderRadius: 8, marginBottom: 15 },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#F1F5F9', marginBottom: 10 },
    tacticalSlider: { marginBottom: 5 },
    tacticalLabel: { color: '#CBD5E1', fontSize: 14 },
    tacticalValue: { color: '#FFA726', fontSize: 14, fontWeight: 'bold', position: 'absolute', right: 0, top: 10 },
    keyPlayerContainer: { marginBottom: 10 },
    keyPlayerSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: 10, borderRadius: 6 },
    keyPlayerName: { color: '#FFFFFF', fontSize: 14 },
    chartContainer: { flexDirection: 'row', height: 120, justifyContent: 'space-around', alignItems: 'flex-end', marginTop: 10 },
    barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
    bar: { width: '50%', backgroundColor: '#FFA726', borderRadius: 4, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 4 },
    barLabel: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
    barMinutesText: { color: '#1E293B', fontSize: 10, fontWeight: 'bold' },
    summaryBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#1E293B' },
    summaryText: { color: '#CBD5E1', fontSize: 16, fontWeight: 'bold' },
    rotationSection: { paddingHorizontal: 15, paddingTop: 15 },
    positionHeader: { color: '#FFA726', fontSize: 16, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
    playerCard: { backgroundColor: '#1E293B', borderRadius: 8, padding: 15, marginBottom: 12 },
    playerInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    playerName: { color: '#F1F5F9', fontSize: 18, fontWeight: 'bold' },
    playerDetails: { color: '#94A3B8', fontSize: 14 },
    swapButton: { padding: 5 }, // Style for the new swap button
    playerControls: { marginTop: 5 },
    sliderContainer: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    minutesText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', width: 30, textAlign: 'right' },
    offensiveRoleSelector: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    roleButton: { borderWidth: 1, borderColor: '#334155', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 8 },
    roleButtonActive: { backgroundColor: '#FFA726', borderColor: '#FFA726' },
    roleButtonText: { color: '#94A3B8', fontSize: 12 },
    roleButtonTextActive: { color: '#1E293B', fontWeight: 'bold' },
    headerButton: { flexDirection: 'row', alignItems: 'center', marginRight: 15, backgroundColor: '#FFA726', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    headerButtonText: { color: '#1E293B', fontWeight: 'bold', fontSize: 14 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: { backgroundColor: '#1E293B', borderRadius: 12, padding: 20, width: '80%', maxHeight: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFA726', marginBottom: 15, textAlign: 'center' },
    modalPlayerRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
    modalPlayerName: { color: '#FFFFFF', fontSize: 16, textAlign: 'center' },
    modalCloseButton: { marginTop: 20, backgroundColor: '#334155', padding: 12, borderRadius: 8 },
    modalCloseButtonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold' },
});
