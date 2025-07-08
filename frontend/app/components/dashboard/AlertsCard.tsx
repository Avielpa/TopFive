import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FullPlayer } from '../../../types/entities'; // ודא ייבוא נכון

const { width } = Dimensions.get('window');

interface AlertsCardProps {
  squadPlayers: FullPlayer[];
}

const AlertsCard: React.FC<AlertsCardProps> = ({ squadPlayers }) => {
  const getInjuredPlayersCount = () => {
    return squadPlayers.filter(player => player.is_injured).length;
  };

  const expiringContractsCount = squadPlayers.filter(p => p.contract_years <= 1).length;

  return (
    <LinearGradient colors={['#F97316', '#FB923C']} style={[styles.card, styles.alertsCard]}>
      <View style={styles.cardHeader}>
        <Ionicons name="notifications" size={16} color="#FFF" />
        <Text style={styles.cardTitle}>Alerts</Text>
      </View>
      <View style={styles.notificationContent}>
        {getInjuredPlayersCount() > 0 && (
          <View style={styles.notificationItem}>
            <View style={[styles.notificationDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.notificationText} numberOfLines={1} ellipsizeMode='tail'>
              {getInjuredPlayersCount()} player(s) injured!
            </Text>
          </View>
        )}
        {expiringContractsCount > 0 && (
          <View style={styles.notificationItem}>
            <View style={[styles.notificationDot, { backgroundColor: '#FBBF24' }]} />
            <Text style={styles.notificationText} numberOfLines={1} ellipsizeMode='tail'>
              {expiringContractsCount} contract(s) expiring soon!
            </Text>
          </View>
        )}
        {/* הודעות התראה נוספות מדומות */}
        <View style={styles.notificationItem}>
          <View style={[styles.notificationDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.notificationText} numberOfLines={1} ellipsizeMode='tail'>New scout report available.</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 8,
    padding: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  alertsCard: {
    flex: 1,
    minHeight: 75,
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  notificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
    marginTop: 2,
  },
  notificationText: {
    fontSize: 8,
    color: '#FFF',
    flex: 1,
    lineHeight: 10,
  },
});

export default AlertsCard;