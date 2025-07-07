import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TeamStanding, FullPlayer } from '@/types/entities'; // ודא ייבוא נכון

const { width } = Dimensions.get('window');

interface TeamStatsCardProps {
  teamStats: TeamStanding | null;
  squadPlayers: FullPlayer[];
}

const TeamStatsCard: React.FC<TeamStatsCardProps> = ({ teamStats, squadPlayers }) => {
  const getTopScorer = () => {
    if (squadPlayers.length === 0) return 'N/A';
    const top = squadPlayers.reduce((prev, current) => (prev.shooting_2p + prev.shooting_3p > current.shooting_2p + current.shooting_3p ? prev : current));
    return `${top.first_name} ${top.last_name}`;
  };

  const getInjuredPlayersCount = () => {
    return squadPlayers.filter(player => player.is_injured).length;
  };

  return (
    <LinearGradient colors={['#0891B2', '#06B6D4']} style={[styles.card, styles.statsCard]}>
      <View style={styles.cardHeader}>
        <Ionicons name="stats-chart" size={16} color="#FFF" />
        <Text style={styles.cardTitle}>Team Stats</Text>
      </View>
      <View style={styles.statsContent}>
        <View style={styles.statItemRow}>
          <Text style={styles.statLabel}>Wins:</Text>
          <Text style={styles.statValue}>{teamStats?.wins ?? 0}</Text>
        </View>
        <View style={styles.statItemRow}>
          <Text style={styles.statLabel}>Losses:</Text>
          <Text style={styles.statValue}>{teamStats?.losses ?? 0}</Text>
        </View>
        <View style={styles.statItemRow}>
          <Text style={styles.statLabel}>Win %:</Text>
          <Text style={styles.statValue}>{teamStats?.win_percentage ?? 0}%</Text>
        </View>
        <View style={styles.statItemRow}>
          <Text style={styles.statLabel}>Top Scorer:</Text>
          <Text style={styles.statValue} numberOfLines={1} ellipsizeMode='tail'>{getTopScorer()}</Text>
        </View>
        <View style={styles.statItemRow}>
          <Text style={styles.statLabel}>Injured:</Text>
          <Text style={[styles.statValue, { color: getInjuredPlayersCount() > 0 ? '#FEF3C7' : '#10B981' }]}>
            {getInjuredPlayersCount()}
          </Text>
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
  statsCard: {
    flex: 1,
    minHeight: 75,
  },
  statsContent: {
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 0,
  },
  statItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 9,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default TeamStatsCard;