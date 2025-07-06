// In frontend/app/(tabs)/manageLineup.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ImageBackground, DimensionValue, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Feather } from '@expo/vector-icons';
import { useTeamTactics, PlayerType, TacticsType } from '../hooks/useTeamTactics'; // ייבוא ה-Hook והטיפוסים

// --- הגדרות קבועות ---
const OFFENSIVE_ROLES_CONFIG: { key: PlayerType['offensive_role'], label: string }[] = [
    { key: 'PRIMARY', label: '1st' }, { key: 'SECONDARY', label: '2nd' },
    { key: 'ROLE', label: 'Role' }, { key: 'DND', label: 'DND' }
];

type KeyRole = 'goToGuy' | 'defensiveStopper';


const RotationPlayer = ({ player, onMinutesChange, onRoleChange, onInitiateSwap, maxMinutes }: {
    player: PlayerType;
    onMinutesChange: (playerId: number, minutes: number) => void;
    onRoleChange: (playerId: number, role: PlayerType['offensive_role']) => void;
    onInitiateSwap: (player: PlayerType) => void;
    maxMinutes: number;
}) => {
    const [displayMinutes, setDisplayMinutes] = useState(player.minutes);

    return (
        <View style={styles.playerCard}>
            <View style={styles.playerTopRow}>
                <View style={styles.playerInfo}>
                    <Text style={styles.playerName} numberOfLines={1} ellipsizeMode='tail'>
                        {player.name}
                        <Text style={styles.playerDetails}>  {player.pos} | {player.rating}</Text>
                    </Text>
                </View>
                <View style={styles.offensiveRoleSelector}>
                    {OFFENSIVE_ROLES_CONFIG.map(role => (
                        <TouchableOpacity key={role.key}
                            style={[styles.roleButton, player.offensive_role === role.key && styles.roleButtonActive]}
                            onPress={() => onRoleChange(player.id, role.key)}>
                            <Text style={[styles.roleButtonText, player.offensive_role === role.key && styles.roleButtonTextActive]}>{role.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity onPress={() => onInitiateSwap(player)} style={styles.swapButton}>
                    <Feather name="repeat" size={15} color="#94A3B8" />
                </TouchableOpacity>
            </View>
            <View style={styles.sliderContainer}>
                <Slider
                    style={{ flex: 1, height: 20 }}
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
        </View>
    );
};

const CourtView = ({ starters, teamColor }: { starters: PlayerType[], teamColor: string }) => {
    const PLAYER_POSITIONS: { [key: string]: { top: DimensionValue, left: DimensionValue } } = {
        'PG': { top: '10%', left: '42%' }, 'SG': { top: '25%', left: '75%' },
        'SF': { top: '25%', left: '10%' }, 'PF': { top: '60%', left: '65%' },
        'C': { top: '60%', left: '20%' },
    };
    return (
        <View style={styles.courtContainer}>
            <ImageBackground source={require('../../assets/half_court.png')} style={styles.courtImage} resizeMode="contain">
                {starters.map(player => {
                    const positionStyle = PLAYER_POSITIONS[player.pos] || { top: '50%', left: '45%' };
                    return (
                        <View key={player.id} style={[styles.playerMarker, positionStyle]}>
                            <View style={[styles.playerMarkerDot, { backgroundColor: teamColor }]} />
                            <Text style={styles.playerMarkerText}>{player.name}</Text>
                        </View>
                    );
                })}
            </ImageBackground>
        </View>
    );
};

// ... (שאר קומפוננטות העזר נשארות כאן)
const TacticalSlider = ({ label, value, onValueChange }: {label: string, value: number, onValueChange: (v: number) => void}) => (
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

const KeyPlayerSelector = ({ label, players, selectedId, onSelect }: {label: string, players: PlayerType[], selectedId: number | null, onSelect: () => void}) => (
    <View style={styles.keyPlayerContainer}>
        <Text style={styles.tacticalLabel}>{label}</Text>
        <TouchableOpacity style={styles.keyPlayerSelector} onPress={onSelect}>
            <Text style={styles.keyPlayerName}>{players.find(p => p.id === selectedId)?.name || 'Not Selected'}</Text>
            <Feather name="chevron-down" size={16} color="#94A3B8" />
        </TouchableOpacity>
    </View>
);

const PositionalStrengthChart = ({ players }: {players: PlayerType[]}) => {
    const chartData = useMemo(() => {
        const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];
        return POSITIONS.map(pos => {
            const posPlayers = players.filter(p => p.pos === pos && p.minutes > 0);
            if (posPlayers.length === 0) return { pos, rating: 0, totalMinutes: 0 };
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


// --- הקומפוננטה הראשית (שכתוב מלא) ---
export default function ManageLineupScreen() {
    // שימוש ב-Hook החדש לניהול כל המצב והלוגיקה
    const {
        players, tactics, teamColor, isLoading, error,
        setPlayers, setTactics,
        starters, bench, reserves, totalMinutes, remainingMinutes,
        saveTactics,
    } = useTeamTactics();

    // State מקומי עבור המודאלים בלבד
    const [keyPlayerModalVisible, setKeyPlayerModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<KeyRole | null>(null);
    const [swapModalVisible, setSwapModalVisible] = useState(false);
    const [playerToSwap, setPlayerToSwap] = useState<PlayerType | null>(null);

    // --- פונקציות לניהול שינויים במצב (מעדכנות את המצב ב-Hook) ---
    const handleMinutesChange = useCallback((playerId: number, minutes: number) => {
        const roundedMinutes = Math.round(minutes);
        setPlayers(current => current.map(p => p.id === playerId ? { ...p, minutes: roundedMinutes } : p));
    }, [setPlayers]);

    const handleOffensiveRoleChange = useCallback((playerId: number, offensive_role: PlayerType['offensive_role']) => {
        setPlayers(current => current.map(p => p.id === playerId ? { ...p, offensive_role } : p));
    }, [setPlayers]);

    const handleSwapPlayer = useCallback((targetPlayerId: number) => {
        if (!playerToSwap) return;
        setPlayers(currentPlayers => {
            const newPlayers = [...currentPlayers];
            const playerAIndex = newPlayers.findIndex(p => p.id === playerToSwap.id);
            const playerBIndex = newPlayers.findIndex(p => p.id === targetPlayerId);

            if (playerAIndex > -1 && playerBIndex > -1) {
                const playerA = newPlayers[playerAIndex];
                const playerB = newPlayers[playerBIndex];
                // החלפת תפקיד ועמדה
                [playerA.role, playerB.role] = [playerB.role, playerA.role];
                [playerA.pos, playerB.pos] = [playerB.pos, playerA.pos];
            }
            return newPlayers;
        });
        setSwapModalVisible(false);
        setPlayerToSwap(null);
    }, [playerToSwap, setPlayers]);

    const openSwapModal = useCallback((player: PlayerType) => {
        setPlayerToSwap(player);
        setSwapModalVisible(true);
    }, []);

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

    // --- תצוגת טעינה ושגיאה ---
    if (isLoading && players.length === 0) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#FFA726" /></View>;
    }

    if (error) {
        return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;
    }

    const swappablePlayers = playerToSwap?.role === 'STARTER' ? [...bench, ...reserves] : starters;

    return (
        <View style={styles.screen}>
            <Stack.Screen 
                options={{ 
                    headerShown: true, title: 'Tactics & Rotation', 
                    headerStyle: { backgroundColor: '#1E293B' }, headerTintColor: '#FFFFFF', 
                    headerTitleStyle: { fontWeight: 'bold', fontSize: 18 }, 
                    headerRight: () => (
                        <TouchableOpacity onPress={saveTactics} style={styles.headerButton} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#1E293B" /> : <Text style={styles.headerButtonText}>Save</Text>}
                        </TouchableOpacity>
                    ) 
                }} 
            />
            
            {/* Modals */}
            <Modal animationType="slide" transparent={true} visible={keyPlayerModalVisible} onRequestClose={() => setKeyPlayerModalVisible(false)}>
                <View style={styles.modalOverlay}><View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select {editingRole === 'goToGuy' ? 'Go-To Guy' : 'Defensive Stopper'}</Text>
                    <ScrollView>{players.map(p => (<TouchableOpacity key={p.id} style={styles.modalPlayerRow} onPress={() => handleSelectKeyPlayer(p.id)}><Text style={styles.modalPlayerName}>{p.name}</Text></TouchableOpacity>))}</ScrollView>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setKeyPlayerModalVisible(false)}><Text style={styles.modalCloseButtonText}>Cancel</Text></TouchableOpacity>
                </View></View>
            </Modal>
            <Modal animationType="slide" transparent={true} visible={swapModalVisible} onRequestClose={() => setSwapModalVisible(false)}>
                 <View style={styles.modalOverlay}><View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Swap {playerToSwap?.name} with...</Text>
                    <ScrollView>{swappablePlayers.map(p => (<TouchableOpacity key={p.id} style={styles.modalPlayerRow} onPress={() => handleSwapPlayer(p.id)}><Text style={styles.modalPlayerName}>{p.name} ({p.pos} | {p.rating})</Text></TouchableOpacity>))}</ScrollView>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSwapModalVisible(false)}><Text style={styles.modalCloseButtonText}>Cancel</Text></TouchableOpacity>
                </View></View>
            </Modal>

            {/* Main Layout */}
            <View style={styles.mainContainer}>
                <View style={styles.leftColumn}>
                    <Text style={styles.columnHeader}>Tactical Center</Text>
                    <ScrollView>
                        <View style={styles.tacticsCard}>
                            <Text style={styles.sectionHeader}>Starting Lineup</Text>
                            <CourtView starters={starters} teamColor={teamColor} />
                        </View>
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
                        <Text style={styles.columnHeaderRight}>Rotation & Minutes</Text>
                        <View style={styles.minutesTracker}>
                            <Text style={styles.summaryText}>Total:</Text>
                            <Text style={[styles.summaryText, { color: totalMinutes === 240 ? '#4ADE80' : '#F87171' }]}>{totalMinutes} / 240</Text>
                        </View>
                    </View>
                    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                        <View style={styles.rotationSection}>
                            <Text style={styles.positionHeader}>STARTERS ({starters.length})</Text>
                            {starters.map(player => <RotationPlayer key={player.id} player={player} onMinutesChange={handleMinutesChange} onRoleChange={handleOffensiveRoleChange} onInitiateSwap={openSwapModal} maxMinutes={player.minutes + remainingMinutes} /> )}
                        </View>
                        <View style={styles.rotationSection}>
                            <Text style={styles.positionHeader}>BENCH ({bench.length})</Text>
                            {bench.map(player => <RotationPlayer key={player.id} player={player} onMinutesChange={handleMinutesChange} onRoleChange={handleOffensiveRoleChange} onInitiateSwap={openSwapModal} maxMinutes={player.minutes + remainingMinutes} /> )}
                        </View>
                        {reserves.length > 0 && (
                            <View style={styles.rotationSection}>
                                <Text style={styles.positionHeader}>RESERVES ({reserves.length})</Text>
                                {reserves.map(player => <RotationPlayer key={player.id} player={player} onMinutesChange={handleMinutesChange} onRoleChange={handleOffensiveRoleChange} onInitiateSwap={openSwapModal} maxMinutes={player.minutes + remainingMinutes} /> )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

// --- סגנונות (Styles) ---
// הסגנונות נשארים זהים, בתוספת סגנון למצב טעינה ושגיאה
const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
    errorText: { color: '#F87171', fontSize: 16, textAlign: 'center' },
    screen: { flex: 1, backgroundColor: '#0F172A', flexDirection: 'row' },
    mainContainer: { flex: 1, flexDirection: 'row' },
    leftColumn: { width: '40%', backgroundColor: '#1E293B', padding: 10, borderRightWidth: 2, borderRightColor: '#334155' },
    rightColumn: { width: '60%' },
    columnHeader: { fontSize: 16, fontWeight: 'bold', color: '#FFA726', textAlign: 'center', marginBottom: 10 },
    columnHeaderRight: { fontSize: 16, fontWeight: 'bold', color: '#FFA726' },
    tacticsCard: { padding: 12, backgroundColor: '#334155', borderRadius: 8, marginBottom: 12 },
    sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#F1F5F9', marginBottom: 10 },
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
    summaryBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#1E293B' },
    minutesTracker: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    summaryText: { color: '#CBD5E1', fontSize: 13, fontWeight: 'bold' },
    rotationSection: { paddingHorizontal: 10, paddingTop: 10 },
    positionHeader: { color: '#FFA726', fontSize: 14, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase' },
    playerCard: { backgroundColor: '#1E293B', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, marginBottom: 5 },
    playerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    playerInfo: { flex: 1, marginRight: 4 },
    playerName: { color: '#F1F5F9', fontSize: 14, fontWeight: 'bold' },
    playerDetails: { color: '#94A3B8', fontSize: 11, fontWeight: 'normal' },
    swapButton: { paddingLeft: 4 },
    sliderContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    minutesText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', width: 24, textAlign: 'right' },
    offensiveRoleSelector: { flexDirection: 'row', alignItems: 'center' },
    roleButton: { borderWidth: 1, borderColor: '#334155', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 5, marginHorizontal: 1.5 },
    roleButtonActive: { backgroundColor: '#FFA726', borderColor: '#FFA726' },
    roleButtonText: { color: '#94A3B8', fontSize: 10 },
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
    courtContainer: { height: 250, marginTop: 10, marginBottom: 10, backgroundColor: '#0F172A', borderRadius: 8, overflow: 'hidden' },
    courtImage: { flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    playerMarker: { position: 'absolute', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.7)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 12 },
    playerMarkerDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    playerMarkerText: { color: '#F1F5F9', fontSize: 12, fontWeight: 'bold' },
});
