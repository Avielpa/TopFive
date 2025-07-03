// ==============================================================================
// File: frontend/components/FilterControls.tsx (FIXED SCROLLING & BUTTON VISIBILITY)
// Description: Advanced filter controls with added scroll functionality for content,
//              ensuring buttons are always visible at the bottom, and maintaining
//              the original compact design. Position selection logic remains removed.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Switch,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
    StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface FilterControlsProps {
    initialFilterMinRating: string;
    initialFilterMaxAge: string;
    initialFilterMaxContractYears: string;
    initialFilterMinFitness: string;
    initialFilterShowHealthyOnly: boolean;

    onApplyFilters: (filters: {
        minRating: string;
        maxAge: string;
        maxContractYears: string;
        minFitness: string;
        showHealthyOnly: boolean;
    }) => void;
    onClose?: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
    initialFilterMinRating,
    initialFilterMaxAge,
    initialFilterMaxContractYears,
    initialFilterMinFitness,
    initialFilterShowHealthyOnly,
    onApplyFilters,
    onClose,
}) => {
    const [minRating, setMinRating] = useState(initialFilterMinRating);
    const [maxAge, setMaxAge] = useState(initialFilterMaxAge);
    const [maxContractYears, setMaxContractYears] = useState(initialFilterMaxContractYears);
    const [minFitness, setMinFitness] = useState(initialFilterMinFitness);
    const [showHealthyOnly, setShowHealthyOnly] = useState(initialFilterShowHealthyOnly);

    useEffect(() => {
        setMinRating(initialFilterMinRating);
        setMaxAge(initialFilterMaxAge);
        setMaxContractYears(initialFilterMaxContractYears);
        setMinFitness(initialFilterMinFitness);
        setShowHealthyOnly(initialFilterShowHealthyOnly);
    }, [
        initialFilterMinRating,
        initialFilterMaxAge,
        initialFilterMaxContractYears,
        initialFilterMinFitness,
        initialFilterShowHealthyOnly,
    ]);

    const handleApply = () => {
        onApplyFilters({
            minRating,
            maxAge,
            maxContractYears,
            minFitness,
            showHealthyOnly,
        });
    };

    const handleClearAll = () => {
        setMinRating('');
        setMaxAge('');
        setMaxContractYears('');
        setMinFitness('');
        setShowHealthyOnly(false);
        onApplyFilters({
            minRating: '',
            maxAge: '',
            maxContractYears: '',
            minFitness: '',
            showHealthyOnly: false,
        });
    };

    // Calculate dynamic height for the scrollable content area
    // We need to subtract the height of the header, the button row, and any vertical margins/paddings
    const { height: screenHeight } = Dimensions.get('window');
    // Approximate heights for static elements (adjust if needed based on your actual styling)
    const HEADER_HEIGHT = 40; // Approx height of title + close button row
    const BUTTON_ROW_HEIGHT = 50; // Approx height of Apply/Reset buttons row
    const VERTICAL_MARGINS_PADDINGS = 40; // Total vertical margin/padding for the container itself (10 top, 10 bottom padding, 10 top, 10 bottom margin)

    // Calculate available height for the ScrollView
    const maxScrollViewHeight = screenHeight * 0.5 - HEADER_HEIGHT - BUTTON_ROW_HEIGHT - VERTICAL_MARGINS_PADDINGS;
    // Using 50% of screen height as a base for the modal, then subtract static elements.
    // This value (0.5) can be adjusted to make the overall filter box larger or smaller.
    // If 0.5 is too small, try 0.6 or 0.7. The key is to leave enough space for the buttons.

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>⚙️ Advanced Filters</Text>
                {onClose && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* ScrollView for the filter inputs */}
            <ScrollView style={{ maxHeight: maxScrollViewHeight }}>
                <View style={styles.scrollContent}>
                    {[{
                        label: 'Min Rating', value: minRating, setter: setMinRating, placeholder: 'e.g. 70', keyboardType: 'numeric'
                    }, {
                        label: 'Max Age', value: maxAge, setter: setMaxAge, placeholder: 'e.g. 30', keyboardType: 'numeric'
                    }, {
                        label: 'Max Contract', value: maxContractYears, setter: setMaxContractYears, placeholder: 'e.g. 2', keyboardType: 'numeric'
                    }, {
                        label: 'Min Fitness', value: minFitness, setter: setMinFitness, placeholder: 'e.g. 85', keyboardType: 'numeric'
                    }].map((item, idx) => (
                        <View key={idx} style={styles.inputRow}>
                            <Text style={styles.label}>{item.label}</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType={item.keyboardType as any}
                                placeholder={item.placeholder}
                                placeholderTextColor="#94A3B8"
                                value={item.value}
                                onChangeText={item.setter}
                            />
                        </View>
                    ))}

                    {/* Show Healthy Only Switch */}
                    <View style={styles.inputRow}>
                        <Text style={styles.label}>Show Healthy Only</Text>
                        <Switch
                            trackColor={{ false: '#6B7280', true: '#34D399' }}
                            thumbColor={showHealthyOnly ? '#10B981' : '#F3F4F6'}
                            onValueChange={setShowHealthyOnly}
                            value={showHealthyOnly}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Fixed button row at the bottom */}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClearAll}>
                    <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.applyButton]} onPress={handleApply}>
                    <Text style={styles.buttonText}>Apply</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        borderRadius: 12,
        marginHorizontal: 12,
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        // Added flex: 1 to allow container to take available space,
        // or ensure it resizes based on its children and max height of ScrollView.
        // It's crucial for the layout to allow the ScrollView to constrain its height.
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FBBF24',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        // Height needs to be consistent for maxScrollViewHeight calculation
        height: 40, // Explicit height for consistent calculation
    },
    closeButton: {
        padding: 4,
        backgroundColor: '#EF4444',
        borderRadius: 6,
    },
    // Removed scrollContent: { paddingVertical: 6 } from here
    // The paddingVertical should be on the ScrollView directly, or removed if the
    // maxHeight takes care of the internal spacing. I've moved it to the ScrollView component directly.
    scrollContent: {
        // This style is now applied to a View *inside* the ScrollView,
        // which helps manage the internal padding for the scrollable items.
        paddingVertical: 6,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        color: '#E5E7EB',
        flex: 1,
    },
    input: {
        flex: 1,
        backgroundColor: '#0F172A',
        color: '#F9FAFB',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        fontSize: 14,
        marginLeft: 8,
        height: 35,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        // Height needs to be consistent for maxScrollViewHeight calculation
        height: 30, // Explicit height for consistent calculation
    },
    button: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        marginHorizontal: 3,
        alignItems: 'center',
    },
    applyButton: {
        backgroundColor: '#22C55E',
    },
    clearButton: {
        backgroundColor: '#EF4444',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 10,
    },
});

export default FilterControls;