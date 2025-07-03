// ==========================================
// TransferMarket.tsx - FINAL FIX EDITION 🚀 (UPDATED WITH SIGN LOGIC)
// Description: טבלת שחקנים עם עיצוב משוחזר, סליידר ערך בשורת החיפוש העליונה,
//              ו-FilterControls מתוקן ומשולב כראוי.
//              **FIXED: Players not showing, Value not showing**
//              **ADDED: Player Sign Logic with Contract Years Selection**
// ==========================================

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert, // Import Alert for confirmation dialogs
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Player } from '../../types/entities';
import { getTransferList, buyPlayer } from '../../services/apiService'; // buyPlayer now expects contractYears
import { useAuth } from '../../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import FilterControls from '../../components/FilterControls';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const TransferMarketScreen = () => {
    const { isLoading: isAuthLoading, userInfo, updateUserInfo } = useAuth();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [sortKey, setSortKey] = useState<'rating' | 'age' | 'position_primary' | 'first_name' | 'last_name' | 'market_value' | 'fitness' | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const [maxValueFilter, setMaxValueFilter] = useState(2000000);
    const MAX_SLIDER_VALUE = 10000000;

    const [appliedMinRating, setAppliedMinRating] = useState('');
    const [appliedMaxAge, setAppliedMaxAge] = useState('');
    const [appliedMaxContractYears, setAppliedMaxContractYears] = useState('');
    const [appliedMinFitness, setAppliedMinFitness] = useState('');
    const [appliedShowHealthyOnly, setAppliedShowHealthyOnly] = useState(false);

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            const data = await getTransferList();
            const processedPlayers = data.map(player => ({
                ...player,
                value: typeof player.market_value === 'number' ? player.market_value : 0
            }));
            setPlayers(processedPlayers);
        } catch (e) {
            console.error('Error fetching players:', e);
            setPlayers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthLoading) {
            fetchPlayers();
        }
    }, [isAuthLoading]);

    const handleSort = (key: 'rating' | 'age' | 'position_primary' | 'first_name' | 'last_name' | 'market_value' | 'fitness') => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const handleApplyAdvancedFilters = (filters: {
        minRating: string;
        maxAge: string;
        maxContractYears: string;
        minFitness: string;
        showHealthyOnly: boolean;
    }) => {
        setAppliedMinRating(filters.minRating);
        setAppliedMaxAge(filters.maxAge);
        setAppliedMaxContractYears(filters.maxContractYears);
        setAppliedMinFitness(filters.minFitness);
        setAppliedShowHealthyOnly(filters.showHealthyOnly);
        setShowFilters(false);
    };

    const filteredAndSortedPlayers = useMemo(() => {
        let currentPlayers = [...players];

        currentPlayers = currentPlayers.filter(p => {
            return (p.market_value <= maxValueFilter);
        });

        currentPlayers = currentPlayers.filter(p => {
            if (appliedMinRating && p.rating < parseInt(appliedMinRating)) return false;
            if (appliedMaxAge && p.age > parseInt(appliedMaxAge)) return false;
            if (appliedMaxContractYears && typeof p.contract_years === 'number' && p.contract_years > parseInt(appliedMaxContractYears)) return false;
            if (appliedMinFitness && p.fitness < parseInt(appliedMinFitness)) return false;
            if (appliedShowHealthyOnly && p.health_status !== 'Healthy') return false;
            return true;
        });

        currentPlayers = currentPlayers.filter(p => {
            const q = search.toLowerCase();
            return (
                (p.first_name && p.first_name.toLowerCase().includes(q)) ||
                (p.last_name && p.last_name.toLowerCase().includes(q)) ||
                (p.team_name && p.team_name.toLowerCase().includes(q))
            );
        });

        if (sortKey) {
            currentPlayers.sort((a, b) => {
                const aVal = a[sortKey];
                const bVal = b[sortKey];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
                }
                return 0;
            });
        }
        return currentPlayers;
    }, [
        search,
        players,
        sortKey,
        sortDir,
        maxValueFilter,
        appliedMinRating,
        appliedMaxAge,
        appliedMaxContractYears,
        appliedMinFitness,
        appliedShowHealthyOnly,
    ]);

    // --- NEW: handleSignPlayer function ---
    const handleSignPlayer = useCallback(async (player: Player) => {
        if (!userInfo || !userInfo.budget) {
            Alert.alert("Error", "Your team budget information is not available. Please try logging in again.");
            return;
        }

        Alert.alert(
            "Sign Player",
            `Do you want to sign ${player.first_name} ${player.last_name} for $${player.market_value.toLocaleString()}?`,
            [
                {
                    text: "No",
                    style: "cancel",
                    onPress: () => console.log("Sign cancelled"),
                },
                {
                    text: "Yes",
                    onPress: () => {
                        // Prompt for contract years
                        Alert.alert(
                            "Contract Length",
                            "How many years do you want to offer?",
                            [
                                {
                                    text: "1 Year",
                                    onPress: () => confirmSign(player, 1),
                                },
                                {
                                    text: "2 Years",
                                    onPress: () => confirmSign(player, 2),
                                },
                                {
                                    text: "3 Years",
                                    onPress: () => confirmSign(player, 3),
                                },
                                {
                                    text: "4 Years",
                                    onPress: () => confirmSign(player, 4),
                                },
                                {
                                    text: "5 Years",
                                    onPress: () => confirmSign(player, 5),
                                },
                                {
                                    text: "Cancel",
                                    style: "cancel",
                                    onPress: () => console.log("Contract years selection cancelled"),
                                },
                            ]
                        );
                    },
                },
            ]
        );
    }, [userInfo, updateUserInfo, fetchPlayers, players]); // Added players and fetchPlayers to dependencies

    // Helper function to actually perform the sign action after contract years are chosen
    const confirmSign = useCallback(async (player: Player, contractYears: number) => {
        try {
            setLoading(true); // Show loading indicator during API call
            const result = await buyPlayer(player.id, contractYears); // Call the updated buyPlayer
            
            // Update user's budget in AuthContext
            updateUserInfo({ budget: result.new_budget });

            // Remove the signed player from the local players list
            setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== result.player_id));
            
            Alert.alert("Success", result.detail);
        } catch (error: any) {
            const errorMessage = error.detail || "Failed to sign player. Please try again.";
            Alert.alert("Error", errorMessage);
            console.error("Signing failed:", error);
        } finally {
            setLoading(false); // Hide loading indicator
        }
    }, [updateUserInfo, setPlayers]);


    const renderHeader = () => (
        <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => handleSort('first_name')} style={styles.colNameHead}><Text style={styles.colText}>PLAYER NAME</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('age')} style={styles.colHead}><Text style={styles.colText}>AGE</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('position_primary')} style={styles.colHead}><Text style={styles.colText}>POS</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('rating')} style={styles.colHead}><Text style={styles.colText}>OVR</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('fitness')} style={styles.colHead}><Text style={styles.colText}>FIT</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('market_value')} style={styles.colHead}><Text style={styles.colText}>VALUE</Text></TouchableOpacity>
            <View style={styles.colActionHead}><Text style={styles.colText}>ACTION</Text></View>
        </View>
    );

    const renderItem = useCallback(({ item }: { item: Player }) => (
        <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.playerRow}
        >
            <View style={styles.colNameData}>
                <Text style={styles.nameText}>{item.first_name} {item.last_name}</Text>
                {item.contract_years !== undefined && item.contract_years !== null && item.contract_years > 0 ? (
                    <Text style={styles.teamText}>Con: {item.contract_years} Yrs</Text>
                ) : (
                    <Text style={styles.teamText}>Free Agent</Text>
                )}
            </View>
            <View style={styles.colData}><Text style={styles.dataText}>{item.age}</Text></View>
            <View style={styles.colData}><Text style={styles.dataText}>{item.position_primary}</Text></View>
            <View style={styles.colData}><Text style={[styles.dataText, { color: '#FBBF24' }]}>{item.rating}⭐</Text></View>
            <View style={styles.colData}>
                <Text style={[styles.dataText, { color: item.fitness > 80 ? '#32CD32' : (item.fitness > 60 ? '#FFD700' : '#FF4500') }]}>
                    {item.fitness}%💚
                </Text>
            </View>
            <View style={styles.colData}>
                <Text style={styles.dataText}>${Number(item.market_value).toLocaleString()}</Text>
            </View>
            <View style={styles.colActionData}>
                {/* Changed onPress to call handleSignPlayer */}
                <TouchableOpacity style={styles.signButton} onPress={() => handleSignPlayer(item)}>
                    <Text style={styles.signButtonText}>Sign</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    ), [handleSignPlayer]); // Added handleSignPlayer as dependency

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.background}>
                <Text style={styles.title}>🏟️ Transfer Market</Text>

                <View style={styles.mainHeaderRow}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search name/team..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={setSearch}
                    />
                    <View style={styles.sliderAndTextContainer}>
                        <Slider
                            style={styles.priceSlider}
                            minimumValue={0}
                            maximumValue={MAX_SLIDER_VALUE}
                            step={10000}
                            value={maxValueFilter}
                            onValueChange={setMaxValueFilter}
                            minimumTrackTintColor="#FACC15"
                            maximumTrackTintColor="#CBD5E1"
                            thumbTintColor="#FACC15"
                        />
                        <Text style={styles.sliderValueText}>${maxValueFilter.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterToggle}>
                        <Text style={styles.filterToggleText}>Advanced Search</Text>
                        <Feather name={showFilters ? 'chevron-up' : 'chevron-down'} size={20} color="#FACC15" />
                    </TouchableOpacity>
                </View>

                {showFilters && (
                    <FilterControls
                        initialFilterMinRating={appliedMinRating}
                        initialFilterMaxAge={appliedMaxAge}
                        initialFilterMaxContractYears={appliedMaxContractYears}
                        initialFilterMinFitness={appliedMinFitness}
                        initialFilterShowHealthyOnly={appliedShowHealthyOnly}
                        onApplyFilters={handleApplyAdvancedFilters}
                        onClose={() => setShowFilters(false)}
                    />
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#FBBF24" style={styles.loadingIndicator} />
                ) : (
                    <FlatList
                        data={filteredAndSortedPlayers}
                        keyExtractor={item => item.id.toString()}
                        ListHeaderComponent={renderHeader}
                        renderItem={renderItem}
                        contentContainerStyle={styles.flatListContent}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyListContainer}>
                                <Text style={styles.emptyListText}>No players found matching your criteria.</Text>
                                <Text style={styles.emptyListSubText}>Try adjusting your filters or search terms.</Text>
                            </View>
                        )}
                    />
                )}
            </LinearGradient>
        </SafeAreaView>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    background: { flex: 1, padding: 12 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#FBBF24', textAlign: 'center', marginBottom: 16 },

    mainHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 8,
        borderRadius: 12,
        marginBottom: 12,
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
    },
    searchInput: {
        flex: 1,
        minWidth: 90,
        color: '#F1F5F9',
        fontSize: 14,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#0F172A',
        borderRadius: 10,
        marginRight: 8,
        height: 40,
    },
    sliderAndTextContainer: {
        flex: 1.2,
        minWidth: 120,
        marginRight: 8,
        backgroundColor: '#0F172A',
        borderRadius: 10,
        justifyContent: 'center',
        paddingVertical: 4,
        height: 40,
    },
    priceSlider: {
        width: '100%',
        height: 20,
    },
    sliderValueText: {
        color: '#FACC15',
        fontSize: 10,
        textAlign: 'center',
        marginTop: -2,
    },
    filterToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        height: 40,
    },
    filterToggleText: {
        color: '#F1F5F9',
        fontSize: 12,
        marginRight: 4,
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        paddingHorizontal: 6,
    },
    colNameHead: { flex: 2, alignItems: 'flex-start', paddingLeft: 8 },
    colHead: { flex: 1, alignItems: 'center' },
    colActionHead: { flex: 1.2, alignItems: 'center' },
    colText: { fontSize: 11, color: '#CBD5E1', fontWeight: 'bold' },

    playerRow: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 6,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        paddingHorizontal: 6,
    },
    colNameData: { flex: 2, alignItems: 'flex-start', paddingLeft: 8 },
    colData: { flex: 1, alignItems: 'center' },
    colActionData: { flex: 1.2, alignItems: 'center' },

    nameText: { color: '#F1F5F9', fontWeight: 'bold', fontSize: 15 },
    teamText: { color: '#94A3B8', fontSize: 11, fontStyle: 'italic', marginTop: 2 },
    dataText: { color: '#E2E8F0', fontSize: 14 },

    signButton: {
        backgroundColor: '#FACC15',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        minWidth: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signButtonText: { color: '#1E293B', fontWeight: 'bold', fontSize: 13 },
    loadingIndicator: { marginTop: 50 },
    flatListContent: { paddingBottom: 100 },

    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
    emptyListText: {
        color: '#CBD5E1',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyListSubText: {
        color: '#94A3B8',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default TransferMarketScreen;