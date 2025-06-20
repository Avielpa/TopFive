import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../services/authService';
import { useFocusEffect } from 'expo-router';


export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

useFocusEffect(
  useCallback(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
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
            router.replace('/login');
          },
        },
      ],
      { cancelable: true }
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Top Five</Text>

      {!isLoggedIn ? (
        <>
          <TouchableOpacity style={styles.buttonStyle} onPress={() => router.push('/register')}>
            <Text style={styles.buttonText}>Don't Have Account? Register</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonStyle} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.buttonStyle} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
  buttonStyle: {
    backgroundColor: 'orange',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    opacity: 1,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
