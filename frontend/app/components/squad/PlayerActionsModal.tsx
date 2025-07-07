import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { listPlayerForTransfer, unlistPlayerFromTransfer, releasePlayer } from '../../../services/apiService';
import { SquadFullPlayer } from './squad.types';

interface PlayerActionsModalProps {
    player: SquadFullPlayer | null;
    isVisible: boolean;
    onClose: () => void;
    onPlayerUpdate: (player: SquadFullPlayer) => void;
    onPlayerRelease: (playerId: number, newBudget: number) => void;
}

const InfoPill = ({ label, value }: { label: string, value: string | number }) => (
    <View style={styles.infoPill}>
        <Text style={styles.infoPillLabel}>{label}</Text>
        <Text style={styles.infoPillValue}>{value}</Text>
    </View>
);

export const PlayerActionsModal = ({ player, isVisible, onClose, onPlayerUpdate, onPlayerRelease }: PlayerActionsModalProps) => {
    const [price, setPrice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<'main' | 'list' | 'release'>('main');

    useEffect(() => {
        if (isVisible && player) {
            setView('main'); // Reset to main view every time modal opens
            setPrice(player.asking_price?.toString() || '');
        }
    }, [isVisible, player]);

    if (!player) return null;

    const handleListForTransfer = async () => {
        const numericPrice = parseInt(price, 10);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            Alert.alert("Invalid Price", "Please enter a valid asking price.");
            return;
        }
        setIsLoading(true);
        try {
            const { player: updatedPlayer } = await listPlayerForTransfer(player.id, numericPrice);
            onPlayerUpdate(updatedPlayer as SquadFullPlayer);
            onClose();
        } catch (error) {
            console.error("Failed to list player:", error);
            Alert.alert("Error", "Could not list player for transfer.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlistFromTransfer = async () => {
        setIsLoading(true);
        try {
            const { player: updatedPlayer } = await unlistPlayerFromTransfer(player.id);
            onPlayerUpdate(updatedPlayer as SquadFullPlayer);
            onClose();
        } catch (error) {
            console.error("Failed to unlist player:", error);
            Alert.alert("Error", "Could not unlist player from transfer.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRelease = async () => {
        setIsLoading(true);
        try {
            const response = await releasePlayer(player.id) as { released_player_id: number; new_budget: number; };
            onPlayerRelease(response.released_player_id, response.new_budget);
            onClose();
        } catch (error) {
            console.error("Failed to release player:", error);
            Alert.alert("Error", "Could not release player.");
        } finally {
            setIsLoading(false);
        }
    };

    const releaseCost = (player.market_value * 0.10).toLocaleString();

    const renderMainView = () => (
        <View style={styles.actionsContainer}>
            {player.is_on_transfer_list ? (
                <ActionButton icon="times-circle" text="Unlist" color="#F59E0B" onPress={handleUnlistFromTransfer} />
            ) : (
                <ActionButton icon="exchange-alt" text="List" color="#38BDF8" onPress={() => setView('list')} />
            )}
            <ActionButton icon="shield-alt" text="Captain" disabled={true} />
            <ActionButton icon="dumbbell" text="Train" disabled={true} />
            <ActionButton icon="trash-alt" text="Release" color="#DC2626" onPress={() => setView('release')} />
        </View>
    );

    const renderListView = () => (
        <View>
            <Text style={styles.subHeader}>List for Transfer</Text>
            <View style={styles.listActionRow}>
                <TextInput
                    style={styles.priceInput}
                    placeholder="Asking Price ($)"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                />
                <TouchableOpacity style={[styles.listActionButton, styles.listCancelButton]} onPress={() => setView('main')} disabled={isLoading}>
                    <Feather name="x" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.listActionButton, styles.listConfirmButton, !price && styles.disabledButton]} onPress={handleListForTransfer} disabled={isLoading || !price}>
                    {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="check" size={20} color="#fff" />}
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderReleaseView = () => (
        <View>
            <Text style={styles.subHeader}>Release Player</Text>
            <Text style={styles.confirmText}>Are you sure? This will cost ${releaseCost} and is irreversible.</Text>
            <View style={styles.confirmButtonRow}>
                <TouchableOpacity style={[styles.modalConfirmButton, styles.cancelButton]} onPress={() => setView('main')}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalConfirmButton, styles.releaseButton]} onPress={handleRelease} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalButtonText}>Release</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <TouchableOpacity activeOpacity={1} style={styles.modalContentWrapper} onPress={() => { /* Prevents modal from closing when content is pressed */ }}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Feather name="x" size={22} color="#94A3B8" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{player.first_name} {player.last_name}</Text>
                        
                        <View style={styles.infoContainer}>
                            <InfoPill label="Pos" value={player.position_primary} />
                            <InfoPill label="Age" value={player.age} />
                            <InfoPill label="Rating" value={player.rating} />
                            <InfoPill label="Value" value={`$${(player.market_value / 1000000).toFixed(2)}M`} />
                        </View>
                        <View style={styles.separator} />

                        {view === 'main' && renderMainView()}
                        {view === 'list' && renderListView()}
                        {view === 'release' && renderReleaseView()}
                    </View>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const ActionButton = ({ icon, text, onPress, color = '#CBD5E1', disabled = false }: any) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} disabled={disabled}>
        <View style={[styles.iconContainer, { backgroundColor: disabled ? '#334155' : color }]}>
            <FontAwesome5 name={icon} size={18} color={disabled ? '#64748B' : '#FFFFFF'} />
        </View>
        <Text style={[styles.actionButtonText, { color: disabled ? '#64748B' : '#E2E8F0' }]}>{text}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    
modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)'
},
    modalContentWrapper: {
        width: '90%',
        maxWidth: 400,
    },
    modalContent: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    closeButton: { position: 'absolute', top: 12, right: 12, padding: 5, zIndex: 1 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#F1F5F9', textAlign: 'center', marginBottom: 15 },
    infoContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
    infoPill: { alignItems: 'center' },
    infoPillLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 2 },
    infoPillValue: { color: '#F1F5F9', fontSize: 16, fontWeight: 'bold' },
    separator: { height: 1, backgroundColor: '#334155', marginVertical: 10, marginBottom: 20 },
    actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10 },
    actionButton: { alignItems: 'center', width: 60 },
    iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
    actionButtonText: { fontSize: 12, fontWeight: '600' },
    subHeader: { fontSize: 18, fontWeight: 'bold', color: '#F1F5F9', textAlign: 'center', marginBottom: 15 },
    
    listActionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    priceInput: { flex: 1, backgroundColor: '#334155', color: '#FFFFFF', borderRadius: 10, padding: 12, fontSize: 16 },
    listActionButton: { width: 46, height: 46, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    listConfirmButton: { backgroundColor: '#16A34A' }, // Green
    listCancelButton: { backgroundColor: '#DC2626' }, // Red

    confirmButtonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
    modalConfirmButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    modalButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    cancelButton: { backgroundColor: '#475569' },
    releaseButton: { backgroundColor: '#DC2626' },
    disabledButton: { opacity: 0.6 },
    confirmText: { color: '#CBD5E1', fontSize: 16, textAlign: 'center', marginBottom: 4 },
    confirmCostText: { color: '#F87171', fontSize: 14, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
});
