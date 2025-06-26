import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { getAllMatches } from '@/services/league_schedule';
import { Match } from '@/types/entities';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

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
  const { userInfo, isLoading: isAuthLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [sections, setSections] = useState<MatchesByRound>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && userInfo?.team_name) {
      getAllMatches()
        .then(data => {
          const teamMatches = data.filter(
            (            match: { home_team_name: string | null; away_team_name: string | null; }) =>
              match.home_team_name === userInfo.team_name ||
              match.away_team_name === userInfo.team_name
          );
          setMatches(teamMatches);
          setSections(groupMatchesByRound(teamMatches));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [userInfo, isAuthLoading]);

  if (loading || isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA726" />
        <Text style={styles.loadingText}>Loading matches</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{userInfo?.team_name}</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => <MatchItem match={item} userTeam={userInfo?.team_name || ''} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function MatchItem({ match, userTeam }: { match: Match; userTeam: string }) {
  const isHome = match.home_team_name === userTeam;
  const opponent = isHome ? match.away_team_name : match.home_team_name;
  const isFinished = match.is_finished;
  const result =
    isFinished ? `${match.home_team_score} - ${match.away_team_score}` : 'soon';
  const dateStr = format(new Date(match.match_date), 'dd/MM/yyyy');
  const locationIcon = isHome ? '🏠' : '✈️';

  return (
    <View style={styles.matchCard}>
      <View style={styles.matchRow}>
        <Text style={styles.date}>{dateStr}</Text>
        <Text style={styles.opponent}>
          {match.home_team_name}
          <Text style={{fontSize:18, fontWeight:'bold',color:'#FFA726'}}> vs </Text>
           {opponent}
        </Text>
        <Text style={styles.location}>{locationIcon} {isHome ? 'home' : 'away'}</Text>
        <Text style={[styles.result, isFinished ? styles.finished : styles.upcoming]}>
          {result}
        </Text>
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFA726',
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  matchCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
  },
  opponent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 2,
    textAlign: 'center',
  },
  location: {
    fontSize: 14,
    color: '#38BDF8',
    flex: 1.2,
    textAlign: 'right',
  },
  result: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  finished: {
    color: '#4ADE80', // ירוק
  },
  upcoming: {
    color: '#FACC15', // צהוב
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#94A3B8',
    fontSize: 16,
  },
});
