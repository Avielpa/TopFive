import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SquadViewType } from './squad.types';

interface ViewToggleProps {
    activeView: SquadViewType;
    setActiveView: (view: SquadViewType) => void;
}

export const ViewToggle = ({ activeView, setActiveView }: ViewToggleProps) => (
    <View style={styles.viewToggleContainer}>
        <TouchableOpacity onPress={() => setActiveView('overview')} style={[styles.toggleButton, activeView === 'overview' && styles.toggleButtonActive]}>
            <Text style={[styles.toggleButtonText, activeView === 'overview' && styles.toggleButtonTextActive]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveView('skills')} style={[styles.toggleButton, activeView === 'skills' && styles.toggleButtonActive]}>
            <Text style={[styles.toggleButtonText, activeView === 'skills' && styles.toggleButtonTextActive]}>Skills</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveView('stats')} style={[styles.toggleButton, activeView === 'stats' && styles.toggleButtonActive]}>
            <Text style={[styles.toggleButtonText, activeView === 'stats' && styles.toggleButtonTextActive]}>Stats</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    viewToggleContainer: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 8, padding: 2, borderWidth: 1, borderColor: '#334155' },
    toggleButton: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6 },
    toggleButtonActive: { backgroundColor: '#FFA726' },
    toggleButtonText: { color: '#CBD5E1', fontWeight: '600', fontSize: 13 },
    toggleButtonTextActive: { color: '#1E293B' },
});
