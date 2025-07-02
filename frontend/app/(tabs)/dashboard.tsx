<<<<<<< HEAD
// In frontend/app/(tabs)/dashboard.tsx

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
    const { userInfo, isLoading, logout } = useAuth();
    const router = useRouter();
=======
    // // ==============================================================================
    // // File: frontend/app/(tabs)/dashboard.tsx (WITH "ESCAPE HATCH" LOGIC)
    // // Description: This screen now handles incomplete user data gracefully,
    // //              providing a way for the user to log out if their account
    // //              is not fully configured.
    // // ==============================================================================

    // import React, { useEffect, useState } from 'react';
    // import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator } from 'react-native';
    // import { useAuth } from '../../context/AuthContext';
    // import * as ScreenOrientation from 'expo-screen-orientation';
    // import { getMatches } from '@/services/apiService';
    // import { Match } from '@/types/entities';

    // // הנחה: טיפוסי Match ו-UserInfo מיובאים מתיקייה אחרת.
    // // לדוגמה:
    // // import { Match } from '@/types/Match';
    // // import { UserInfo } from '@/types/UserInfo';

    // export default function DashboardScreen() {
    //     const { userInfo, isLoading, logout } = useAuth();
    //     const [matchesLoading, setMatchesLoading] = useState(true); 
    //     const [matches, setMatches] = useState<Match[]>([]); 
    //     const [nextMatch, setNextMatch] = useState<Match | null>(null); 

    //     // Effect לנעילת ופתיחת כיוון המסך
    //     useEffect(() => {
    //         ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    //         return () => {
    //             ScreenOrientation.unlockAsync();
    //         };
    //     }, []); 

    //     // Effect לטעינת וסינון המשחקים של הקבוצה
    //     useEffect(() => {
    //         const fetchAndProcessTeamMatches = async () => {
    //             if (userInfo?.league_id && userInfo?.team_name) { 
    //                 console.log("Fetching and processing matches for team:", userInfo.team_id);
    //                 try {
    //                     setMatchesLoading(true);
    //                     const allLeagueMatches = (await getMatches(userInfo.league_id)) || []; 
                        
    //                     const teamRelatedMatches = allLeagueMatches.filter(match => {
    //                         return match.home_team_name === userInfo.team_name || match.away_team_name === userInfo.team_name;
    //                     });
                        
    //                     // וודא שאתה מעדכן את ה-state עם מערך Match[]
    //                     setMatches(teamRelatedMatches); 

    //                     const now = new Date();
    //                     let closestUpcomingMatch: Match | null = null;
    //                     let minDiff = Infinity; 

    //                     matches.map(match => {
    //                         const matchDateTime = new Date(match.match_date);

    //                         if (matchDateTime > now) { 
    //                             const diff = matchDateTime.getTime() - now.getTime();
    //                             if (diff < minDiff) {
    //                                 minDiff = diff;
    //                                 closestUpcomingMatch = match;
    //                                 console.log(match)
    //                             }
    //                         }
    //                     });
    //                     setNextMatch(closestUpcomingMatch); 
                        
    //                 } catch (error) {
    //                     console.error("Failed to fetch or process team matches:", error);
    //                     // במקרה של שגיאה, נאתחל את matches ומצבי הטעינה
    //                     setMatches([]); 
    //                     setNextMatch(null);
    //                 } finally {
    //                     setMatchesLoading(false); 
    //                 }
    //             } else {
    //                 // אם אין מידע משתמש חיוני, אין מה לטעון ואין משחקים
    //                 setMatches([]);
    //                 setNextMatch(null);
    //                 setMatchesLoading(false); 
    //             }
    //         };

    //         if (!isLoading && userInfo) {
    //             fetchAndProcessTeamMatches();
    //         }
    //     }, [userInfo, isLoading]); 

    //     // הצגת מסך טעינה ראשוני מ-AuthContext
    //     if (isLoading) {
    //         return (
    //             <View style={styles.loaderContainer}>
    //                 <ActivityIndicator size="large" color="#FFA726" />
    //             </View>
    //         );
    //     }

    //     // בדיקה אם פרטי המשתמש אינם מלאים לאחר הטעינה
    //     if (!userInfo || !userInfo.team_id || !userInfo.league_id) {
    //         return (
    //             <View style={styles.errorContainer}>
    //                 <Text style={styles.errorHeader}>Account Configuration Incomplete</Text>
    //                 <Text style={styles.errorText}>
    //                     Your user account '{userInfo?.username}' is not assigned to a team and league.
    //                     Please log out and either create a new user or ask an administrator to assign your user to a team.
    //                 </Text>
    //                 <View style={styles.logoutButton}>
    //                     <Button title="Logout" onPress={logout} color="#FFA726" />
    //                 </View>
    //             </View>
    //         );
    //     }

    //     // רק אם הטעינה הסתיימה והנתונים מלאים, נציג את מסך הבית
    //     return (
    //         <ScrollView style={styles.container}>
    //             <View style={styles.headerRow}>
    //                 <Text style={styles.header}>Welcome, Coach {userInfo.username}!</Text>
    //                 <View style={styles.logoutButton}>
    //                     <Button title="Logout" onPress={logout} color="#FFA726" />
    //                 </View>
    //             </View>
    //             <Text style={styles.subHeader}>Here is your team's current status:</Text>

    //             <View style={styles.card}>
    //                 <Text style={styles.teamName}>{userInfo.team_name}</Text>
    //                 <View style={styles.statsRow}>
    //                     <View>
    //                         <Text style={styles.statLabel}>League</Text>
    //                         <Text style={styles.statValue}>{userInfo.league_name}</Text>
    //                     </View>
    //                     <View style={styles.ratingContainer}>
    //                         <Text style={styles.statLabel}>Overall</Text>
    //                         <Text style={[styles.statValue, {color: '#FFA726', fontSize: 28}]}>{userInfo?.overall_rating}</Text>
    //                     </View>
    //                 </View>
    //             </View>

    //             {/* בלוק "המשחק הבא" */}
    //             <Text style={styles.subHeader}>Next Game:</Text>
    //             {matchesLoading ? (
    //                 <View style={styles.card}>
    //                     <ActivityIndicator size="small" color="#FFA726" />
    //                     <Text style={styles.loadingText}>Loading next game...</Text>
    //                 </View>
    //             ) : nextMatch ? (
    //                 <View style={styles.card}>
    //                     <Text style={styles.nextMatchHeader}>Upcoming Match</Text>
    //                     <Text style={styles.matchDetail}>
    //                         <Text style={styles.matchLabel}>Date:</Text> {nextMatch.match_date} 
    //                     </Text>
    //                     <Text style={styles.matchDetail}>
    //                         <Text style={styles.matchLabel}>Teams:</Text> {nextMatch.home_team_name} vs. {nextMatch.away_team_name}
    //                     </Text>

    //                 </View>
    //             ) : (
    //                 <View style={styles.card}>
    //                     <Text style={styles.noMatchText}>No upcoming games found for your team.</Text>
    //                 </View>
    //             )}

    //         </ScrollView>
    //     );
    // }

    // const styles = StyleSheet.create({
    //     container: { 
    //         flex: 1, 
    //         backgroundColor: '#0F172A', 
    //         paddingHorizontal: 40,
    //         paddingVertical: 20,
    //     },
    //     loaderContainer: {
    //         flex: 1,
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //         backgroundColor: '#0F172A',
    //     },
    //     errorContainer: {
    //         flex: 1,
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //         backgroundColor: '#0F172A',
    //         padding: 20,
    //     },
    //     errorHeader: {
    //         fontSize: 24,
    //         fontWeight: 'bold',
    //         color: '#F87171',
    //         textAlign: 'center',
    //         marginBottom: 15,
    //     },
    //     errorText: { 
    //         color: '#CBD5E1', 
    //         fontSize: 16,
    //         textAlign: 'center',
    //         lineHeight: 24,
    //         marginBottom: 30,
    //     },
    //     headerRow: {
    //         flexDirection: 'row',
    //         justifyContent: 'space-between',
    //         alignItems: 'center',
    //         marginBottom: 5,
    //     },
    //     header: { 
    //         fontSize: 30, 
    //         color: '#FFFFFF', 
    //         fontWeight: 'bold', 
    //     },
    //     logoutButton: {},
    //     subHeader: { 
    //         fontSize: 16, 
    //         color: '#94A3B8', 
    //         marginBottom: 20 
    //     },
    //     card: { 
    //         backgroundColor: '#1E293B', 
    //         borderRadius: 12, 
    //         padding: 20, 
    //         marginBottom: 20,
    //         borderWidth: 1,
    //         borderColor: '#334155',
    //     },
    //     teamName: { 
    //         fontSize: 24, 
    //         color: '#FFFFFF', 
    //         fontWeight: 'bold', 
    //         marginBottom: 20 
    //     },
    //     statsRow: { 
    //         flexDirection: 'row', 
    //         justifyContent: 'space-between', 
    //         alignItems: 'center'
    //     },
    //     statLabel: { 
    //         fontSize: 18, 
    //         color: '#94A3B8' 
    //     },
    //     statValue: { 
    //         fontSize: 22, 
    //         color: '#FFFFFF', 
    //         fontWeight: 'bold' 
    //     },
    //     ratingContainer: {
    //         alignItems: 'flex-end',
    //     },
    //     loadingText: {
    //         color: '#CBD5E1',
    //         marginTop: 10,
    //         textAlign: 'center',
    //     },
    //     nextMatchHeader: {
    //         fontSize: 20,
    //         fontWeight: 'bold',
    //         color: '#FFFFFF',
    //         marginBottom: 15,
    //     },
    //     matchDetail: {
    //         fontSize: 16,
    //         color: '#CBD5E1',
    //         marginBottom: 5,
    //     },
    //     matchLabel: {
    //         fontWeight: 'bold',
    //         color: '#FFA726', 
    //     },
    //     noMatchText: {
    //         fontSize: 16,
    //         color: '#94A3B8',
    //         textAlign: 'center',
    //     },
    // });




import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground, TouchableOpacity } from 'react-native';
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
>>>>>>> b0300763b8152c9e9c47583679e8393e5cc42d6c

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

  if (isLoading) {
    return (
<<<<<<< HEAD
        <ScrollView style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>Welcome, Coach {userInfo.username}!</Text>
                <View style={styles.logoutButton}>
                    <Button title="Logout" onPress={logout} color="#FFA726" />
                </View>
            </View>
            <Text style={styles.subHeader}>Here is your team's current status:</Text>

            <View style={styles.card}>
                <Text style={styles.teamName}>{userInfo.team_name}</Text>
                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.statLabel}>League</Text>
                        <Text style={styles.statValue}>{userInfo.league_name}</Text>
                    </View>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.statLabel}>Overall</Text>
                        <Text style={[styles.statValue, {color: '#FFA726', fontSize: 28}]}>82</Text>
                    </View>
                </View>
            </View>
            <View style={styles.card}>
                 <View style={styles.rosterHeaderContainer}>
                    <Text style={styles.rosterHeader}>Starting Lineup</Text>
                    <TouchableOpacity 
                        style={styles.manageButton}
                        onPress={() => router.push('/manageLineup')}
                    >
                        <Text style={styles.manageButtonText}>Manage Lineup</Text>
                    </TouchableOpacity>
                 </View>
                 {/* ... רשימת השחקנים ... */}
            </View>
            <Button title="Logout" onPress={logout} color="#FFA726" />
        </ScrollView>
=======
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFA726" />
      </View>
>>>>>>> b0300763b8152c9e9c47583679e8393e5cc42d6c
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
      <View style={styles.container}>

        {/* שמאל: מידע על הקבוצה */}
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
<<<<<<< HEAD
    container: { 
        flex: 1, 
        backgroundColor: '#0F172A', 
        paddingHorizontal: 40,
        paddingVertical: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        padding: 20,
    },
    errorHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F87171',
        textAlign: 'center',
        marginBottom: 15,
    },
    errorText: { 
        color: '#CBD5E1', 
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    //------------------------------------
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    header: { 
        fontSize: 30, 
        color: '#FFFFFF', 
        fontWeight: 'bold', 
    },
    logoutButton: {},
    subHeader: { 
        fontSize: 16, 
        color: '#94A3B8', 
        marginBottom: 20 
    },
    card: { 
        backgroundColor: '#1E293B', 
        borderRadius: 12, 
        padding: 20, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    teamName: { 
        fontSize: 24, 
        color: '#FFFFFF', 
        fontWeight: 'bold', 
        marginBottom: 20 
    },
    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center'
    },
    statLabel: { 
        fontSize: 18, 
        color: '#94A3B8' 
    },
    statValue: { 
        fontSize: 22, 
        color: '#FFFFFF', 
        fontWeight: 'bold' 
    },
    ratingContainer: {
        alignItems: 'flex-end',
    },
    rosterHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    rosterHeader: { 
        fontSize: 20, 
        color: '#FFFFFF', 
        fontWeight: 'bold', 
    },
    manageButton: {
        backgroundColor: '#334155',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    manageButtonText: {
        color: '#F1F5F9',
        fontWeight: '600',
    },
=======
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
>>>>>>> b0300763b8152c9e9c47583679e8393e5cc42d6c
});
