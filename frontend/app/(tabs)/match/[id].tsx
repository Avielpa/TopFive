// File: app/screens/match/[id].tsx

import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Match } from '../../../types/entities';

const backgroundImage = require('../../../assets/half_court.png');
const courtImage = require('../../../assets/basketball-court.png');

export default function MatchDetail() {
  const { match: matchParam } = useLocalSearchParams();

  if (!matchParam || typeof matchParam !== 'string') {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'white' }}>Match not found</Text>
      </View>
    );
  }

  let match: Match;

  try {
    match = JSON.parse(matchParam);
  } catch (e) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'white' }}>Failed to load match</Text>
      </View>
    );
  }

  const matchDate = new Date(match.match_date);

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        {/* פרטי המשחק */}
        <View style={styles.topSection}>
          <Text style={styles.title}>MATCH DETAILS</Text>
          <Text style={styles.subtitle}>
            {matchDate.toLocaleDateString('he-IL')} • Round {match.match_round}
          </Text>

          <View style={styles.scoreRow}>
            <View style={styles.teamBox}>
              <Text style={styles.teamName}>{match.home_team_name}</Text>
              <Text style={styles.score}>{match.home_team_score}</Text>
            </View>

            <Text style={styles.vs}>VS</Text>

            <View style={styles.teamBox}>
              <Text style={styles.teamName}>{match.away_team_name}</Text>
              <Text style={styles.score}>{match.away_team_score}</Text>
            </View>
          </View>

          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Match Status:</Text>
            <Text style={styles.statusValue}>
              {match.completed ? 'Finished' : 'Upcoming'}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Image source={courtImage} style={styles.courtImage} resizeMode="contain" />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.8)',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  topSection: {
    flex: 1.2,
    alignItems: 'center',
  },
  bottomSection: {
    flex: 1.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFA726',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  teamBox: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 5,
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FBBF24',
  },
  finalLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  vs: {
    fontSize: 24,
    color: '#FFFFFF',
    alignSelf: 'center',
  },
  statusBox: {
    marginTop: 10,
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
  },
  statusLabel: {
    color: '#94A3B8',
    fontSize: 16,
  },
  statusValue: {
    color: '#38BDF8',
    fontSize: 20,
    fontWeight: 'bold',
  },
  courtImage: {
    width: '200%',
    height: '100%',
  },
});
