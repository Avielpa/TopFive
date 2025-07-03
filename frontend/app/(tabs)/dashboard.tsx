import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import { getMatches } from '@/services/apiService';
import { Match } from '@/types/entities';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

const backgroundImage = require('../../assets/basketball-court.png');

export default function DashboardScreen() {
  const { userInfo, isLoading, logout } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    const fetchAndProcessTeamMatches = async () => {
      if (!userInfo?.league_id || !userInfo?.team_name) {
        setMatches([]);
        setNextMatch(null);
        return;
      }

      try {
        const allLeagueMatches = await getMatches(userInfo.league_id) ?? [];

        const teamMatches = allLeagueMatches.filter(match =>
          match.home_team_name === userInfo.team_name || match.away_team_name === userInfo.team_name
        );

        setMatches(teamMatches);

        const now = new Date();
        let closest: Match | null = null;
        let minDiff = Infinity;

        teamMatches.forEach(match => {
          const matchDate = new Date(match.match_date);
          if (matchDate > now) {
            const diff = matchDate.getTime() - now.getTime();
            if (diff < minDiff) {
              minDiff = diff;
              closest = match;
            }
          }
        });

        setNextMatch(closest);
      } catch (error) {
        console.error("Failed to fetch or process team matches:", error);
        setMatches([]);
        setNextMatch(null);
      }
    };

    if (!isLoading && userInfo) {
      fetchAndProcessTeamMatches();
    }
  }, [userInfo, isLoading]);

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFA726" />
      </View>
    );
  }

  if (!userInfo?.team_id || !userInfo?.league_id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          There is no team belong this account
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      {/* כפתור logout בצד ימין למעלה */}
      {userInfo && (
        <TouchableOpacity onPress={confirmLogout} style={styles.logoutButton}>
          <FontAwesome name="sign-out" size={16} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}

      <View style={styles.container}>
        <View style={styles.leftPanel}>
          <Text style={styles.header}>Welcome, Coach {userInfo.username}!</Text>

          <View style={styles.teamCard}>
            <FontAwesome name="shield" size={28} color="#FFA726" />
            <Text style={styles.teamName}>{userInfo.team_name}</Text>
            <Text style={styles.subText}>League: <Text style={styles.highlight}>{userInfo.league_name}</Text></Text>

            <View style={styles.ratingCircle}>
              <Text style={styles.ratingValue}>{userInfo.overall_rating}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: `/match/[id]`,
              params: { id: String(nextMatch?.id), match: JSON.stringify(nextMatch) },
            })
          }
        >
          <View style={styles.rightPanel}>
            <Text style={styles.sectionTitle}>Next Game</Text>
            {nextMatch ? (
              <View style={styles.matchCard}>
                <Text style={styles.matchTeams}>
                  {nextMatch.home_team_name} vs {nextMatch.away_team_name}
                </Text>
                <Text style={styles.matchDate}>
                  {new Date(nextMatch.match_date).toLocaleDateString('he-IL', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </Text>
                <Text style={styles.matchTime}>
                  {new Date(nextMatch.match_date).toLocaleTimeString('he-IL', {
                    hour: '2-digit', minute: '2-digit', hour12: false
                  })}
                </Text>
              </View>
            ) : (
              <Text style={styles.noMatchText}>No upcoming matches found.</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 40,
  },
  leftPanel: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 30,
  },
  rightPanel: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 30,
    borderLeftWidth: 2,
    borderLeftColor: '#334155',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 20,
  },
  errorText: {
    color: '#F87171',
    fontSize: 18,
    textAlign: 'center',
  },
  header: {
    fontSize: 28,
    color: '#FBBF24',
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 20,
  },
  teamCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  teamName: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 10,
  },
  subText: {
    color: '#CBD5E1',
    fontSize: 16,
    marginTop: 5,
  },
  highlight: {
    color: '#FFA726',
    fontWeight: 'bold',
  },
  ratingCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFA726',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 20,
  },
  matchCard: {
    backgroundColor: '#334155',
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  matchTeams: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  matchDate: {
    color: '#CBD5E1',
    fontSize: 16,
    marginBottom: 5,
  },
  matchTime: {
    color: '#FFA726',
    fontSize: 16,
  },
  noMatchText: {
    fontSize: 18,
    color: '#94A3B8',
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
