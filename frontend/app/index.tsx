import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from './services/authService';
import { useFocusEffect } from 'expo-router';


export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

//useFocusEffect - Work every time the focus on this screen
useFocusEffect(
  useCallback(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        setIsLoggedIn(true);
        Alert.alert("You are homo")

        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername){
          setUsername(storedUsername);
          console.log(username);
        }

        else{
          setIsLoggedIn(false);
          setUsername('');
        }
      }
    };

    checkLoginStatus();
  }, [])
);


  async function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            await logout();
            setIsLoggedIn(false);
            router.replace('/');
            Alert.alert("You are not homo anymore")
          },
        },
      ],
      { cancelable: true }
    );
  }


return (
  
  <ImageBackground source={require('../assets/logo.png')} resizeMode="cover" style={styles.backgroundImage}>

  {isLoggedIn ? (
    <>
      <Text style={styles.welcomeTitle}>
        Welcome, Coach {username} 👋
      </Text>

      <View style={styles.menu}>
        {/* My Team, League, etc */}
      </View>

      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <Text style={styles.menuText}>Log Out</Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      <Text style={styles.welcomeTitle}>Top Five: Basketball Manager 🏀</Text>

      <View style={styles.guestBox}>
        <Text style={styles.guestText}>Join thousands of managers worldwide</Text>

        <TouchableOpacity style={styles.guestButton} onPress={() => router.push('/login')}>
          <Text style={styles.menuText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestButton} onPress={() => router.push('/register')}>
          <Text style={styles.menuText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.guestButton} onPress={() => router.push('/screens/matches/leagueScheduleScreen')}>
          <Text style={styles.menuText}>Matches</Text>
        </TouchableOpacity>
      </View>
    </>
  )}

</ImageBackground>

);}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    paddingTop: 50,
  },
  welcomeTitle: {
    fontSize: 22,
    color: '#FFA726',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  menu: {
    width: '80%',
    gap: 16,
  },
  menuItem: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  menuText: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backgroundImage: {
  flex: 1,
  resizeMode: 'cover',
  justifyContent: 'center',
  alignItems: 'center',
},

guestBox: {
  backgroundColor: 'rgba(30, 41, 59, 0.85)',
  padding: 20,
  borderRadius: 12,
  marginTop: 30,
  alignItems: 'center',
},
guestText: {
  color: '#F1F5F9',
  fontSize: 16,
  marginBottom: 10,
  textAlign: 'center',
},
guestButton: {
  backgroundColor: '#FFA726',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8,
  marginTop: 10,
},



});
