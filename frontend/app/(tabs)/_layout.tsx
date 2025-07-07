// // File: frontend/app/(tabs)/_layout.tsx
// import { Tabs } from 'expo-router';
// import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { View, Text, StyleSheet } from 'react-native';
// import { useAuth } from '../../context/AuthContext';
// import React from 'react';

// export default function TabsLayout() {
//   const { userInfo } = useAuth();

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <View style={{ flex: 1}}>
//         {/* ✅ Top HUD Bar */}
//         {userInfo && (
//           <View style={styles.hudContainer}>
//             <View style={styles.hudItem}>
//               <Feather name="dollar-sign" size={16} color="#FFA726" />
//               <Text style={styles.hudText}>
//                 {userInfo.budget?.toLocaleString()}$
//               </Text>
//             </View>
//             <View style={styles.hudItem}>
//               <Feather name="zap" size={16} color="#60A5FA" />
//               <Text style={styles.hudText}>
//                 {userInfo.overall_rating || '--'}
//               </Text>
//             </View>
//             <View style={styles.hudItem}>
//               <Feather name="award" size={16} color="#FACC15" />
//               <Text style={styles.hudText}>
//                 {userInfo.league_name || 'No League'}
//               </Text>
//             </View>
//             <View style={styles.hudItem}>
//               <Feather name="user" size={16} color="#A78BFA" />
//               <Text style={styles.hudText}>
//                 {userInfo.username}
//               </Text>
//             </View>
//           </View>
//         )}

//         {/* Tab Navigation */}
//         <Tabs
//           screenOptions={{
//             headerShown: false,
//             tabBarShowLabel: false,
//             tabBarActiveTintColor: '#FFA726',
//             tabBarInactiveTintColor: '#64748B',
//             tabBarStyle: {
//               backgroundColor: '#1E293B',
//               borderTopColor: '#334155',
//               height: 48,
//               paddingTop: 4,
//               paddingBottom: 4,
//             },
//             tabBarItemStyle: {
//               marginHorizontal: 4,
//             },
//           }}
//         >
//           <Tabs.Screen
//             name="dashboard"
//             options={{
//               tabBarIcon: ({ color, size }) => <Feather name="home" size={22} color={color} />,
//             }}
//           />
//           <Tabs.Screen
//             name="squad"
//             options={{
//               tabBarIcon: ({ color, size }) => <AntDesign name="team" size={22} color={color} />,
//             }}
//           />
//           <Tabs.Screen
//             name="leagueTable"
//             options={{
//               tabBarIcon: ({ color, size }) => <Feather name="trello" size={22} color={color} />,
//             }}
//           />
//           <Tabs.Screen
//             name="transferMarket"
//             options={{
//               tabBarIcon: ({ color, size }) => <Feather name="shopping-cart" size={22} color={color} />,
//             }}
//           />
//           <Tabs.Screen
//             name="leagueScheduleScreen"
//             options={{
//               tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="basketball" size={22} color={color} />,
//             }}
//           />
//           <Tabs.Screen
//             name="match/[id]"
//             options={{ href: null, headerShown: false }}
//           />
//           <Tabs.Screen
//             name="manageLineup"
//             options={{ href: null, headerShown: false }}
//           />
//         </Tabs>
//       </View>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   hudContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#0F172A',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#334155',
//   },
//   hudItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   hudText: {
//     color: '#E2E8F0',
//     fontSize: 13,
//     fontWeight: '600',
//   },
// });













// File: frontend/app/(tabs)/_layout.tsx
import { Tabs, router } from 'expo-router';
import { AntDesign, Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'; // ✅ הוסר I18nManager כי הוא עבר ל-Root Layout
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingContext';
import React, { useEffect, useState } from 'react';
import { getSquad, getLeagueStandings } from '@/services/apiService';
import { FullPlayer, TeamStanding } from '@/types/entities';

const { width, height } = Dimensions.get('window');
const ICON_SIZE = height * 0.025;
const TEXT_SIZE = height * 0.02;

const translations = {
  English: {
    ovr: 'OVR',
    rank: 'Rank',
    notifications: 'Notifications',
    settings: 'Settings',
  },
  Hebrew: {
    ovr: 'דירוג',
    rank: 'מיקום',
    notifications: 'התראות',
    settings: 'הגדרות',
  },
};

export default function TabsLayout() {
  const { userInfo } = useAuth();
  const { theme, language } = useSettings(); // ✅ עכשיו בטוח לשימוש

  const [notificationCount, setNotificationCount] = useState(0);
  const [currentLeagueRank, setCurrentLeagueRank] = useState('-- / --');
  const currentSeasonGameDay = "Gameday 25"; 

  const colors = {
    background: theme === 'dark' ? '#0F172A' : '#F8FAFC',
    text: theme === 'dark' ? '#E2E8F0' : '#1E293B',
    icon: '#FFA726',
  };

  // אובייקט התרגומים תלוי עכשיו בשפת ההגדרות
  const t = translations[language];

  // אין צורך ב-useEffect ל-I18nManager כאן, הוא עבר ל-Root Layout

  useEffect(() => {
    const fetchDataForHUD = async () => {
      if (userInfo) {
        try {
          const squad: FullPlayer[] = await getSquad();
          let count = 0;
          if (squad.some(p => p.is_injured)) count++;
          if (squad.some(p => p.contract_years <= 1)) count++;
          setNotificationCount(count);

          if (userInfo.league_id && userInfo.team_name) {
            const standings: TeamStanding[] = await getLeagueStandings(userInfo.league_id);
            standings.sort((a, b) => b.win_percentage - a.win_percentage);
            const myTeamIndex = standings.findIndex(s => s.team_name === userInfo.team_name);
            setCurrentLeagueRank(myTeamIndex !== -1 ? `${myTeamIndex + 1} / ${standings.length}` : '-- / --');
          }
        } catch (error) {
          console.error("Failed to fetch HUD data:", error);
          setNotificationCount(0);
          setCurrentLeagueRank('-- / --');
        }
      }
    };

    fetchDataForHUD();
    const interval = setInterval(fetchDataForHUD, 60000);
    return () => clearInterval(interval);
  }, [userInfo]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* הוסרו AuthProvider ו-SettingsProvider - הם נמצאים ב-Root Layout */}
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* HUD Top Bar */}
        {userInfo && (
          <View style={[styles.hudContainer, { backgroundColor: colors.background, borderBottomColor: '#334155' }]}>
            <View style={styles.hudItem}>
              <Feather name="dollar-sign" size={ICON_SIZE} color={colors.icon} />
              <Text style={[styles.hudText, { color: colors.text }]}>
                {userInfo.budget?.toLocaleString()}$
              </Text>
            </View>
            <View style={styles.hudItem}>
              <Feather name="zap" size={ICON_SIZE} color="#60A5FA" />
              <Text style={[styles.hudText, { color: colors.text }]}>
                {t.ovr}: {userInfo.overall_rating || '--'}
              </Text>
            </View>
            <View style={styles.hudItem}>
              <Feather name="award" size={ICON_SIZE} color="#FACC15" />
              <Text style={[styles.hudText, { color: colors.text }]}>
                {t.rank}: {currentLeagueRank}
              </Text>
            </View>
            <View style={styles.hudItem}>
              <Feather name="calendar" size={ICON_SIZE} color="#A78BFA" />
              <Text style={[styles.hudText, { color: colors.text }]}>
                {currentSeasonGameDay}
              </Text>
            </View>
            <TouchableOpacity style={styles.hudItem} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={ICON_SIZE} color={colors.text} />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.hudItem} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={ICON_SIZE} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Tabs Navigation */}
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: '#FFA726',
            tabBarInactiveTintColor: '#64748B',
            tabBarStyle: {
              backgroundColor: colors.background,
              borderTopColor: '#334155',
              height: height * 0.065,
              paddingTop: 4,
              paddingBottom: 4,
            },
            tabBarItemStyle: { marginHorizontal: 4 },
          }}
        >
          <Tabs.Screen name="dashboard" options={{ tabBarIcon: ({ color }) => <Feather name="home" size={ICON_SIZE + 3} color={color} /> }} />
          <Tabs.Screen name="squad" options={{ tabBarIcon: ({ color }) => <AntDesign name="team" size={ICON_SIZE + 3} color={color} /> }} />
          <Tabs.Screen name="leagueTable" options={{ tabBarIcon: ({ color }) => <Feather name="trello" size={ICON_SIZE + 3} color={color} /> }} />
          <Tabs.Screen name="transferMarket" options={{ tabBarIcon: ({ color }) => <Feather name="shopping-cart" size={ICON_SIZE + 3} color={color} /> }} />
          <Tabs.Screen name="leagueScheduleScreen" options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="basketball" size={ICON_SIZE + 3} color={color} /> }} />
          <Tabs.Screen name="match/[id]" options={{ href: null, headerShown: false }} />
          <Tabs.Screen name="manageLineup" options={{ href: null, headerShown: false }} />
          <Tabs.Screen name="settings" options={{ href: null, headerShown: false }} />
        </Tabs>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  hudContainer: {
    flexDirection: 'row',
    paddingVertical: height * 0.012,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    height: height * 0.06,
  },
  hudItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 4,
  },
  hudText: {
    fontSize: TEXT_SIZE,
    fontWeight: '600',
  },
  notificationBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 4,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: height * 0.015,
    fontWeight: 'bold',
  },
});