  // app/login.tsx
  import React, { useState } from 'react';
  import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
  import { useRouter } from 'expo-router';
  import { login } from '../services/authService';

  export default function LoginScreen() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin() {
      try {
        await login(username, password);
        router.push('/');
      } catch (error: any) {
        Alert.alert('Login Failed', error.error || 'Unknown error');
      }
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button title="Login" onPress={handleLogin} />

        <Text style={styles.link} onPress={() => router.push('/')}>
          Don't have an account? Register here
        </Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 26, marginBottom: 20 },
    input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 },
    link: { marginTop: 10, color: 'blue', textAlign: 'center' },
  });
