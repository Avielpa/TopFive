import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

interface DashboardHeaderProps {
  teamName: string;
  leagueName: string;
  overallRating: number | string;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ teamName, leagueName, overallRating, onLogout }) => {
  return (
    <SafeAreaView style={styles.header}>
      <View style={styles.userInfo}>
        <Text style={styles.teamNameHeader}>
          {teamName} | {leagueName} | OVR: {overallRating}
        </Text>
      </View>
      <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
        <LinearGradient colors={['#FBBF24', '#F59E0B']} style={styles.logoutGradient}>
          <FontAwesome name="sign-out" size={16} color="#1E293B" />
          <Text style={styles.logoutText}>Logout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 0,
    height: 38,
    width: '100%',
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  teamNameHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  logoutButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  logoutGradient: {
    padding: 7,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#1E293B',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default DashboardHeader;