import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ProgressBar from './ProgressBar'; // ✅ ייבוא ProgressBar

const { width } = Dimensions.get('window');

interface TeamStatusCardProps {
  morale: number;
  fitness: number;
  vibe: number;
}

const TeamStatusCard: React.FC<TeamStatusCardProps> = ({ morale, fitness, vibe }) => {
  return (
    <LinearGradient colors={['#10B981', '#059669']} style={[styles.card, styles.moraleCard]}>
      <View style={styles.cardHeader}>
        <Ionicons name="heart" size={16} color="#FFF" />
        <Text style={styles.cardTitle}>Team Status</Text>
      </View>
      <View style={styles.moraleContent}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Morale:</Text>
          <View style={styles.statusBarWrapper}>
            <ProgressBar progress={morale} color="#FBBF24" />
            <Text style={styles.statusValue}>{morale}%</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Fitness:</Text>
          <View style={styles.statusBarWrapper}>
            <ProgressBar progress={fitness} color="#3B82F6" />
            <Text style={styles.statusValue}>{fitness}%</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Vibe:</Text>
          <View style={styles.statusBarWrapper}>
            <ProgressBar progress={vibe} color="#10B981" />
            <Text style={styles.statusValue}>{vibe}%</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 8,
    padding: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  moraleCard: {
    flex: 0.7,
    minHeight: 75,
    marginLeft: 2,
  },
  moraleContent: {
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 0,
  },
  statusRow: {
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 9,
    color: '#E2E8F0',
    fontWeight: '500',
    marginBottom: 0,
  },
  statusBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  statusValue: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default TeamStatusCard;