import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { getSquad } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

// Import refactored components
import { SquadFullPlayer, SortKey, SortConfig, SquadViewType } from '../components/squad/squad.types';
import { ViewToggle } from '../components/squad/ViewToggle';
import { SortableHeader } from '../components/squad/SquadHeader';
import { OverviewRow, SkillsRow, StatsRow } from '../components/squad/SquadRow';
import { PlayerActionsModal } from '../components/squad/PlayerActionsModal';

// Mock Data for Stats
const generateMockStats = (players: SquadFullPlayer[]) => {
    return players.map(p => ({
        id: p.id, pts: parseFloat((Math.random() * 25).toFixed(1)), ast: parseFloat((Math.random() * 8).toFixed(1)),
        reb: parseFloat((Math.random() * 10).toFixed(1)), stl: parseFloat((Math.random() * 2).toFixed(1)),
        blk: parseFloat((Math.random() * 1.5).toFixed(1)), fg_pct: parseFloat((40 + Math.random() * 15).toFixed(1)),
        three_p_pct: parseFloat((30 + Math.random() * 15).toFixed(1)),
    }));
};

const SquadScreen = () => {
    const { isLoading: isAuthLoading, updateUserInfo, userInfo } = useAuth();
    const [players, setPlayers] = useState<SquadFullPlayer[]>([]);
    const [mockStats, setMockStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<SquadViewType>('overview');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'rating', direction: 'desc' });
    
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<SquadFullPlayer | null>(null);

    const headerScrollViewRef = useRef<ScrollView>(null);
    const rowScrollViewRefs = useRef<{[key: number]: ScrollView | null}>({});
    const [viewToggleWidth, setViewToggleWidth] = useState(0);

    const fetchSquadData = async () => {
        if (isAuthLoading) return;
        setLoading(true);
        try {
            const data = await getSquad();
            const typedData = data as SquadFullPlayer[];
            setPlayers(typedData);
            setMockStats(generateMockStats(typedData));
        } catch (error) {
            console.error("Failed to fetch squad", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSquadData();
    }, [isAuthLoading]);

    const handlePlayerUpdate = (updatedPlayer: SquadFullPlayer) => {
        setPlayers(currentPlayers => 
            currentPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
        );
    };

    const handlePlayerRelease = (releasedPlayerId: number, newBudgetX: number) => {
        setPlayers(currentPlayers => 
            currentPlayers.filter(p => p.id !== releasedPlayerId)
        );
        if (userInfo) {
            updateUserInfo({ budget: newBudgetX });
        }
    };

    const openPlayerModal = (player: SquadFullPlayer) => {
        setSelectedPlayer(player);
        setModalVisible(true);
    };
    
    const sortedPlayers = useMemo(() => {
        if (!sortConfig) return players;
        const key = sortConfig.key;
        const direction = sortConfig.direction;

        return [...players].sort((a, b) => {
            let aVal: any;
            let bVal: any;

            if (key.startsWith('stats_')) {
                const statKey = key.substring(6);
                aVal = mockStats.find(s => s.id === a.id)?.[statKey] ?? 0;
                bVal = mockStats.find(s => s.id === b.id)?.[statKey] ?? 0;
            } else {
                aVal = a[key as keyof SquadFullPlayer];
                bVal = b[key as keyof SquadFullPlayer];
            }

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [players, sortConfig, mockStats]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const getHeaders = () => {
        // [FIXED] Explicitly type the baseHeaders array to ensure correct type for sortKey
        const baseHeaders: { title: string; sortKey: SortKey; style: object }[] = [
            { title: "Player", sortKey: "last_name", style: styles.fixedCellPlayer },
            { title: "Pos", sortKey: "position_primary", style: styles.fixedCell },
            { title: "Rat", sortKey: "rating", style: styles.fixedCell },
        ];
        
        let scrollableHeaders: { title: string, sortKey: SortKey, style?: object }[] = [];

        if (activeView === 'overview') {
            scrollableHeaders = [
                { title: "Status", sortKey: "is_injured", style: {width: 70} },
                { title: "T-List", sortKey: "is_on_transfer_list", style: {width: 70} },
                { title: "Value", sortKey: "market_value", style: {width: 90} },
                { title: "Fitness", sortKey: "fitness", style: {width: 80} },
                { title: "Age", sortKey: "age", style: {width: 50} },
                { title: "Yrs", sortKey: "contract_years", style: {width: 50} },
            ];
        } else if (activeView === 'skills') {
            scrollableHeaders = [
                { title: "2P", sortKey: "shooting_2p", style: {width: 60} },
                { title: "3P", sortKey: "shooting_3p", style: {width: 60} },
                { title: "FT", sortKey: "free_throws", style: {width: 60} },
                { title: "Pass", sortKey: "passing", style: {width: 60} },
                { title: "Def R", sortKey: "rebound_def", style: {width: 60} },
                { title: "Off R", sortKey: "rebound_off", style: {width: 60} },
                { title: "Block", sortKey: "blocking", style: {width: 60} },
                { title: "Defense", sortKey: "defense", style: {width: 70} },
                { title: "IQ", sortKey: "game_iq", style: {width: 60} },
                { title: "Speed", sortKey: "speed", style: {width: 60} },
                { title: "Jump", sortKey: "jumping", style: {width: 60} },
                { title: "Str", sortKey: "strength", style: {width: 60} },
                { title: "Stam", sortKey: "stamina", style: {width: 60} },
            ];
        } else if (activeView === 'stats') {
             scrollableHeaders = [
                { title: "PTS", sortKey: "stats_pts", style: {width: 80} },
                { title: "REB", sortKey: "stats_reb", style: {width: 80} },
                { title: "AST", sortKey: "stats_ast", style: {width: 80} },
                { title: "STL", sortKey: "stats_stl", style: {width: 80} },
                { title: "BLK", sortKey: "stats_blk", style: {width: 80} },
                { title: "FG%", sortKey: "stats_fg_pct", style: {width: 80} },
                { title: "3P%", sortKey: "stats_three_p_pct", style: {width: 80} },
            ];
        }
        return { baseHeaders, scrollableHeaders };
    };

    const renderHeader = () => {
        const { baseHeaders, scrollableHeaders } = getHeaders();
        return (
            <View style={styles.headerRow}>
                {baseHeaders.map((h) => <SortableHeader key={h.sortKey} {...h} requestSort={requestSort} sortConfig={sortConfig} />)}
                <View style={{flex: 1}}>
                    <ScrollView
                        ref={headerScrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        contentContainerStyle={styles.scrollableContainer}
                        onScroll={(e) => {
                            const scrollX = e.nativeEvent.contentOffset.x;
                            Object.values(rowScrollViewRefs.current).forEach(ref => {
                                ref?.scrollTo({ x: scrollX, animated: false });
                            });
                        }}
                    >
                        <View style={styles.scrollablePart}>
                            {scrollableHeaders.map((h) => <SortableHeader key={h.sortKey} {...h} requestSort={requestSort} sortConfig={sortConfig} />)}
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    };

    const renderPlayerRow = ({ item }: { item: SquadFullPlayer }) => {
        const playerStats = mockStats.find(s => s.id === item.id) || {};
        return (
            <TouchableOpacity onPress={() => openPlayerModal(item)}>
                <View style={styles.playerRow}>
                    <View style={styles.fixedCellPlayer}>
                        <Text style={styles.playerNameText} numberOfLines={1}>{`${item.first_name.charAt(0)}. ${item.last_name}`}</Text>
                    </View>
                    <Text style={styles.fixedCell}>{item.position_primary}</Text>
                    <Text style={[styles.fixedCell, styles.ratingCell]}>{item.rating}</Text>
                    
                    <View style={{flex: 1}}>
                        <ScrollView
                            ref={ref => { rowScrollViewRefs.current[item.id] = ref; }}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            scrollEnabled={false}
                            contentContainerStyle={styles.scrollableContainer}
                        >
                            <View style={styles.scrollablePart}>
                                {activeView === 'overview' && <OverviewRow player={item} />}
                                {activeView === 'skills' && <SkillsRow player={item} />}
                                {activeView === 'stats' && <StatsRow stats={playerStats} />}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isAuthLoading || loading) {
        return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#FFA726" /><Text style={styles.loadingText}>Loading Squad...</Text></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <View 
                    style={styles.leftAction}
                    onLayout={(event) => {
                        const { width } = event.nativeEvent.layout;
                        if (width > 0 && viewToggleWidth === 0) {
                            setViewToggleWidth(width);
                        }
                    }}
                >
                    <ViewToggle activeView={activeView} setActiveView={setActiveView} />
                </View>
                <Text style={styles.title}>Team Squad</Text>
                <View style={[styles.rightAction, {width: viewToggleWidth}]} />
            </View>
            <View style={styles.tableContainer}>
                {renderHeader()}
                <FlatList
                    data={sortedPlayers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPlayerRow}
                    contentContainerStyle={{ paddingBottom: 120 }}
                />
            </View>

            <PlayerActionsModal
                player={selectedPlayer}
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onPlayerUpdate={handlePlayerUpdate}
                onPlayerRelease={handlePlayerRelease}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 20, paddingBottom: 15 },
    leftAction: {},
    rightAction: {},
    title: { flex: 1, fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
    loadingText: { marginTop: 10, color: '#94A3B8', fontSize: 16 },
    tableContainer: { flex: 1, marginHorizontal: 10 },
    headerRow: { flexDirection: 'row', backgroundColor: '#1E293B', paddingLeft: 10, borderTopWidth: 1, borderTopColor: '#334155', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
    playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155', paddingLeft: 10 },
    fixedCellPlayer: { width: 120, justifyContent: 'center', paddingVertical: 14 },
    playerNameText: { color: '#F1F5F9', fontSize: 14, fontWeight: '500' },
    fixedCell: { width: 45, color: '#CBD5E1', textAlign: 'center', fontSize: 14, paddingVertical: 14 },
    ratingCell: { fontWeight: 'bold', color: '#FFA726' },
    scrollableContainer: { flexGrow: 1 },
    scrollablePart: { flexDirection: 'row', flexGrow: 1, justifyContent: 'space-around' },
});

export default SquadScreen;