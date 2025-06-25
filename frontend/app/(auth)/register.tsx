// ==============================================================================
// File: frontend/app/(auth)/register.tsx
// Location: The user registration screen.
// ==============================================================================

import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, 
    Alert, ScrollView, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { RegisterDetails } from '../../types/authTypes'; // Import the new type

export default function RegisterScreen() {
    const router = useRouter();
    const { registerAndAssignTeam } = useAuth();

    // State for all form fields
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [teamName, setTeamName] = useState('');
    const [arenaName, setArenaName] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
    const [secondaryColor, setSecondaryColor] = useState('#000000');
    const [loading, setLoading] = useState(false);

    const JERSEY_COLORS = [
        '#FFFFFF', '#000000', '#D92D20', '#1C64F2', '#047857',
        '#FBBF24', '#FFA500', '#800080', '#A52A2A', '#808080'
    ];

    async function handleRegister() {
        if (!username || !email || !password || !teamName || !arenaName) {
            Alert.alert('Missing Information', 'Please fill all the fields.');
            return;
        }
        
        setLoading(true);

        const details: RegisterDetails = {
            username,
            email,
            password,
            teamName,
            arenaName,
            primaryColor,
            secondaryColor,
        };

        try {
            await registerAndAssignTeam(details);
            Alert.alert(
                'Welcome, Coach!', 
                'Your account and team have been created successfully. Please login to continue.',
                // --- MINOR FIX ---
                // Using the full, unambiguous path is safer with expo-router.
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
            );
        } catch (error) {
            console.error("--- REGISTRATION FAILED ---");
            let errorMessage = "An unknown error occurred. See console for details.";

            if (axios.isAxiosError(error) && error.response) {
                const serverData = error.response.data;
                console.log("Server Error Response:", JSON.stringify(serverData, null, 2));

                if (serverData && typeof serverData === 'object') {
                    // Extract the first error message from the server response
                    const errorKey = Object.keys(serverData)[0];
                    if (errorKey) {
                        errorMessage = `${errorKey.replace('_', ' ')}: ${serverData[errorKey][0]}`;
                    } else {
                        errorMessage = "An unexpected error format was received from the server."
                    }
                }
            } else if (error instanceof Error) {
                console.log("Generic Error:", error.message);
                errorMessage = error.message;
            } else {
                console.log("Unknown error type:", error);
            }

            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    }

    // The rest of the component's JSX remains the same...
    // I am omitting the JSX and styles for brevity as they were correct.
    return (
      <ScrollView style={styles.background} contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
              <Text style={styles.headerTitle}>Create Your Legacy</Text>
              <Text style={styles.subHeader}>Fill in your details to start your career.</Text>
              
              <Text style={styles.sectionTitle}>Account Details</Text>
              <View style={styles.inputContainer}>
                  <Feather name="user" size={20} color="#94A3B8" style={styles.icon} />
                  <TextInput placeholder="Username" style={styles.input} value={username} onChangeText={setUsername} placeholderTextColor="#94A3B8" autoCapitalize="none" />
              </View>
              <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color="#94A3B8" style={styles.icon} />
                  <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholderTextColor="#94A3B8" autoCapitalize="none" />
              </View>
              <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color="#94A3B8" style={styles.icon} />
                  <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#94A3B8" />
              </View>
              
              <Text style={styles.sectionTitle}>Team Identity</Text>
              <View style={styles.inputContainer}>
                  <Feather name="shield" size={20} color="#94A3B8" style={styles.icon} />
                  <TextInput placeholder="Your Team Name" style={styles.input} value={teamName} onChangeText={setTeamName} placeholderTextColor="#94A3B8" />
              </View>
              <View style={styles.inputContainer}>
                  <Feather name="home" size={20} color="#94A3B8" style={styles.icon} />
                  <TextInput placeholder="Your Arena Name" style={styles.input} value={arenaName} onChangeText={setArenaName} placeholderTextColor="#94A3B8" />
              </View>

              <Text style={styles.colorLabel}>Primary Jersey Color</Text>
              <View style={styles.colorContainer}>
                  {JERSEY_COLORS.map(color => (
                      <TouchableOpacity 
                          key={`primary-${color}`} 
                          style={[styles.colorSwatch, { backgroundColor: color, borderWidth: primaryColor === color ? 2 : 0 }]} 
                          onPress={() => setPrimaryColor(color)} 
                      />
                  ))}
              </View>

              <Text style={styles.colorLabel}>Secondary Jersey Color</Text>
              <View style={styles.colorContainer}>
                  {JERSEY_COLORS.map(color => (
                      <TouchableOpacity 
                          key={`secondary-${color}`} 
                          style={[styles.colorSwatch, { backgroundColor: color, borderWidth: secondaryColor === color ? 2 : 0 }]} 
                          onPress={() => setSecondaryColor(color)} 
                      />
                  ))}
              </View>

              <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                     {loading ? <ActivityIndicator color="#1E293B" /> : <Text style={styles.buttonText}>REGISTER & START CAREER</Text>}
              </TouchableOpacity>

               <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.linkText}>Back to Login</Text>
              </TouchableOpacity>
          </View>
      </ScrollView>
    );
}

// Styles are unchanged
const styles = StyleSheet.create({
    background: { flex: 1, backgroundColor: '#0F172A' },
    scrollContainer: { flexGrow: 1, justifyContent: 'center' },
    container: { padding: 20, paddingBottom: 40 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
    subHeader: { fontSize: 16, color: '#94A3B8', textAlign: 'center', marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFA726', marginTop: 20, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 5 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 8, marginBottom: 12, paddingHorizontal: 12 },
    icon: { marginRight: 10 },
    input: { flex: 1, height: 50, color: '#F1F5F9', fontSize: 16 },
    colorLabel: { color: '#94A3B8', fontSize: 14, marginTop: 15, marginBottom: 10, fontWeight: '500' },
    colorContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10, gap: 10 },
    colorSwatch: { width: 40, height: 40, borderRadius: 20, borderColor: '#FFA726' },
    button: { backgroundColor: '#FFA726', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 20 },
    buttonText: { color: '#1E293B', fontSize: 16, fontWeight: 'bold' },
    linkText: { color: '#FFA726', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
});



