import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SortKey, SortConfig } from './squad.types';

interface SortableHeaderProps {
    title: string;
    sortKey: SortKey;
    requestSort: (key: SortKey) => void;
    sortConfig: SortConfig;
    style?: object;
}

export const SortableHeader = ({ title, sortKey, requestSort, sortConfig, style }: SortableHeaderProps) => {
    const iconName = sortConfig?.direction === 'asc' ? 'chevron-up' : 'chevron-down';
    const isActive = sortConfig?.key === sortKey;

    return (
        <TouchableOpacity style={[styles.headerCell, style]} onPress={() => requestSort(sortKey)}>
            <Text style={styles.headerText}>{title}</Text>
            {isActive && <Feather name={iconName} size={14} color="#FFA726" />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    headerCell: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
    headerText: { color: '#FFA726', fontWeight: 'bold', fontSize: 14, marginRight: 4 },
});
