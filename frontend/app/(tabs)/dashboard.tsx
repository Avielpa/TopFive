import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground, Alert, Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import { getMatches, getLeagueStandings, getSquad } from '../../services/apiService';
import { Match, TeamStanding, FullPlayer } from '../../types/entities';
import { LinearGradient } from 'expo-linear-gradient';

// ייבוא הקומפוננטות החדשות
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import NextMatchCard from '../../components/dashboard/NextMatchCard';
import TeamStatusCard from '../../components/dashboard/TeamStatusCard';
import FinancialSummaryCard from '../../components/dashboard/FinancialSummaryCard';
import TeamStatsCard from '../../components/dashboard/TeamStatsCard';
import AlertsCard from '../../components/dashboard/AlertsCard';

const backgroundImage = require('../../assets/basketball-court.png');
const { width, height } = Dimensions.get('window');

export default function DashboardScreen() {
  const { userInfo, isLoading, logout } = useAuth();
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStanding | null>(null);
  const [squadPlayers, setSquadPlayers] = useState<FullPlayer[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // Lock to landscape right
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    return () => {
      // Unlock on component unmount
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!userInfo?.league_id || !userInfo?.team_id || !userInfo?.team_name) {
      setLoadingData(false);
      return;
    }

    try {
      // Fetch Next Match
      const allMatches = await getMatches(userInfo.league_id);
      const filteredMatches = (allMatches ?? []).filter(
        m => m.home_team_name === userInfo.team_name || m.away_team_name === userInfo.team_name
      );

      const now = new Date();
      const closestMatch: Match | null = filteredMatches.reduce((prev: Match | null, curr: Match) => {
        const currDate = new Date(curr.match_date);
        const prevDate = prev ? new Date(prev.match_date) : new Date(0); 

        const currDiff = currDate.getTime() - now.getTime();
        const prevDiff = prev ? prevDate.getTime() - now.getTime() : Infinity;

        if (currDiff > 0 && currDiff < prevDiff) {
          return curr;
        } else if (prevDiff > 0) {
          return prev;
        } else {
          return currDiff > 0 ? curr : null;
        }
      }, null);
      setNextMatch(closestMatch);

      // Fetch Team Season Stats
      const standings = await getLeagueStandings(userInfo.league_id);
      const myTeamStanding = standings.find(s => s.team_name === userInfo.team_name);
      setTeamStats(myTeamStanding || null);

      // Fetch Squad Players
      const squad = await getSquad();
      setSquadPlayers(squad);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data. Please try again.");
    } finally {
      setLoadingData(false);
    }
  }, [userInfo]);

  useEffect(() => {
    if (!isLoading && userInfo) {
      fetchData();
    }
  }, [userInfo, isLoading, fetchData]);

  const confirmLogout = () =>
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);

  // פונקציות עזר לחישוב נתונים מתוך שחקני הסגל
  // הן נשארות כאן כי הן משתמשות ב-squadPlayers ו-teamStats שמנוהלים בסטייט של הדשבורד הראשי
  const getTeamMorale = useCallback(() => {
    if (squadPlayers.length === 0) return 0;
    const totalFitness = squadPlayers.reduce((sum, player) => sum + player.fitness, 0);
    return Math.round(totalFitness / squadPlayers.length);
  }, [squadPlayers]);

  const getTeamFitness = useCallback(() => {
    return getTeamMorale(); // לצורך הדוגמה, נשתמש באותו מדד כמו מורל
  }, [getTeamMorale]);

  const getTeamVibe = useCallback(() => {
    if (teamStats) {
      const winRate = teamStats.win_percentage;
      if (winRate > 70) return 90;
      if (winRate > 50) return 75;
      return 60;
    }
    return 70;
  }, [teamStats]);


  if (isLoading || loadingData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading Dashboard Data...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <LinearGradient colors={['#0f172aee', '#1e293bcc', '#0f172aee']} style={styles.overlay}>

        {/* Header Bar */}
        <DashboardHeader
          teamName={userInfo?.team_name || 'N/A'}
          leagueName={userInfo?.league_name || 'N/A'}
          overallRating={userInfo?.overall_rating || 'N/A'}
          onLogout={confirmLogout}
        />

        {/* Main Dashboard Grid */}
        <View style={styles.dashboardGrid}>

          {/* Row 1: Next Match & Team Status */}
          <View style={styles.gridRow}>
            <NextMatchCard nextMatch={nextMatch} teamName={userInfo?.team_name || 'N/A'} />
            <TeamStatusCard
              morale={getTeamMorale()}
              fitness={getTeamFitness()}
              vibe={getTeamVibe()}
            />
          </View>

          {/* Row 2: Financial Overview, Team Stats & Alerts */}
          <View style={styles.gridRow}>
            <FinancialSummaryCard budget={userInfo?.budget || 0} />
            <TeamStatsCard teamStats={teamStats} squadPlayers={squadPlayers} />
            <AlertsCard squadPlayers={squadPlayers} />
          </View>

        </View>

      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 3,
    paddingBottom: 3,
    justifyContent: 'flex-start',
  },
  dashboardGrid: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 0,
  },
  gridRow: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 2,
    justifyContent: 'space-between',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 14,
  },
});