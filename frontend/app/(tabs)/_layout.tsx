// File: frontend/app/(tabs)/_layout.tsx (Updated)
import { Tabs } from 'expo-router';
import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabsLayout() {
  return (
<<<<<<< HEAD
    <GestureHandlerRootView style = {{flex:1}}>
=======
    <GestureHandlerRootView style={{ flex: 1 }}>
>>>>>>> b0300763b8152c9e9c47583679e8393e5cc42d6c
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
<<<<<<< HEAD
          name="squad" 
          options={{
            title: 'Squad',
            tabBarIcon: ({ color, size }) => <AntDesign name="team" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
=======
>>>>>>> b0300763b8152c9e9c47583679e8393e5cc42d6c
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
<<<<<<< HEAD
          name="leagueScheduleScreen" 
          options={{
            title: 'Schedule', 
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="basketball" size={size} color={color} />,
          }}
        />
=======
          name="leagueScheduleScreen"
          options={{
            title: 'Schedule',
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="basketball" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="match/[id]"
          options={{
            href: null,
            headerShown: false, 
          }}
        />
>>>>>>> b0300763b8152c9e9c47583679e8393e5cc42d6c
      </Tabs>
    </GestureHandlerRootView>
  );
}