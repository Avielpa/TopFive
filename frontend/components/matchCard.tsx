import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Match } from '../types/entities';

interface Props {
  match: Match;
}

export default function MatchCard({ match }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Date: {new Date(match.match_date).toLocaleDateString()}</Text>
      <Text style={styles.text}>{match.home_team_name} vs {match.away_team_name}</Text>
      {match.completed ? (
        <Text style={styles.text}>Score: {match.home_team_score} - {match.away_team_score}</Text>
      ) : (
        <Text style={styles.text}>Upcoming</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a237e',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  }
});
