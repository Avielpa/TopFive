import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { getAllMatches } from '@/services/league_schedule';
import { Match } from '@/types/matchTypes';
// Update the path below to the correct location of MatchCard, for example:
// Update the path below to the correct location of MatchCard, for example:
// import MatchCard from '../components/matchCard';
// Or, if your alias should be '@/components/matchCard', use:
import MatchCard from '@/components/matchCard';
// Or, if your alias should be '@/components/matchCard', use:
 // import MatchCard from '@/components/matchCard';

type MatchesByRound = {
  title: string;
  data: Match[];
}[];

function groupMatchesByRound(matches: Match[]): MatchesByRound {
  const grouped = matches.reduce((acc, match) => {
    const round = match.match_round;
    let section = acc.find(s => s.title === `Round ${round}`);
    if (!section) {
      section = { title: `Round ${round}`, data: [] };
      acc.push(section);
    }
    section.data.push(match);
    return acc;
  }, [] as MatchesByRound);

  grouped.sort((a, b) => {
    const roundA = Number(a.title.split(' ')[1]);
    const roundB = Number(b.title.split(' ')[1]);
    return roundA - roundB;
  });

  return grouped;
}

export default function LeagueScheduleScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sections, setSections] = useState<MatchesByRound>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllMatches()
      .then(data => {
        setMatches(data);
        setSections(groupMatchesByRound(data));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>טוען משחקים...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ליגת הכדורסל 🏀</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.home_team_name + index}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <MatchCard match={item} />
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: '#dbeafe',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 14,
    marginBottom: 6,
    color: '#1e40af',
  },
  cardContainer: {
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#334155',
  },
});
