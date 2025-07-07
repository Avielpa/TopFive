import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Match } from '../../types/entities'; // ודא ייבוא נכון
import { router } from 'expo-router'; // ודא ייבוא נכון

const { width } = Dimensions.get('window'); // במידה ו-width רלוונטי כאן

interface NextMatchCardProps {
  nextMatch: Match | null;
  teamName: string;
}

const NextMatchCard: React.FC<NextMatchCardProps> = ({ nextMatch, teamName }) => {
  const navigateToMatchDetails = () => {
    if (nextMatch) {
      router.push({
        pathname: `/match/[id]`,
        params: { id: String(nextMatch.id), match: JSON.stringify(nextMatch) },
      });
    }
  };

  return (
    <>
      {nextMatch ? (
        <TouchableOpacity style={[styles.card, styles.nextMatchCard]} onPress={navigateToMatchDetails}>
          <LinearGradient colors={['#DC2626', '#EF4444']} style={styles.cardGradientContent}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="event" size={16} color="#FFF" />
              <Text style={styles.cardTitle}>Next Match</Text>
            </View>
            <View style={styles.matchContent}>
              <Text style={styles.matchOpponent} numberOfLines={1} ellipsizeMode='tail'>
                vs. {nextMatch.home_team_name === teamName ? nextMatch.away_team_name : nextMatch.home_team_name}
              </Text>
              <Text style={styles.matchTimeLocation}>
                {new Date(nextMatch.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' at '}
                {new Date(nextMatch.match_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                {nextMatch.home_team_name === teamName ? ' (Home)' : ' (Away)'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <LinearGradient colors={['#DC2626', '#EF4444']} style={[styles.card, styles.nextMatchCard]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="event" size={16} color="#FFF" />
            <Text style={styles.cardTitle}>Next Match</Text>
          </View>
          <Text style={styles.noMatchText}>No matches scheduled.</Text>
        </LinearGradient>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'space-between',
  },
  cardGradientContent: {
    flex: 1,
    borderRadius: 8,
    padding: 7,
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
  nextMatchCard: {
    flex: 0.8,
    minHeight: 75,
    marginRight: 2,
  },
  matchContent: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 0,
  },
  matchOpponent: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 1,
    textAlign: 'left',
  },
  matchTimeLocation: {
    fontSize: 9,
    color: '#FEF3C7',
    marginBottom: 4,
    textAlign: 'left',
    fontStyle: 'italic',
  },
  noMatchText: {
    fontSize: 10,
    color: '#FEF3C7',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default NextMatchCard;