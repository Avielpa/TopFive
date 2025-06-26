// ==============================================================================
// File: frontend/app/(tabs)/_layout.tsx (Updated)
// Description: Adding the new tabs to the main navigation bar.
// ==============================================================================
import { Tabs } from 'expo-router';
import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFA726',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="squad" 
        options={{
          title: 'Squad',
          tabBarIcon: ({ color, size }) => <AntDesign name="team" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leagueTable" // This will render the league.tsx file
        options={{
          title: 'League',
          tabBarIcon: ({ color, size }) => <Feather name="trello" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transferMarket" // שם הקובץ החדש
        options={{
          title: 'Transfers', // שם חדש לטאב
          tabBarIcon: ({ color, size }) => <Feather name="shopping-cart" size={size} color={color} />, // אייקון חדש
        }}
      />
      <Tabs.Screen
        name="leagueScheduleScreen" 
        options={{
          title: 'Schedule', 
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="basketball" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}