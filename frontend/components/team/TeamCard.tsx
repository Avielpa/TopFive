import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Alert,
  Platform, // ייבוא Platform לטיפול ספציפי בפלטפורמות
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TeamStanding, FullPlayer } from '../../types/entities';
import { getTeamSquad } from '../../services/apiService';

const { width, height } = Dimensions.get('window');

interface TeamCardModalProps {
  isVisible: boolean;
  onClose: () => void;
  teamId: number;
  teamStanding: TeamStanding;
}

// קומפוננטה עזר לשורת נגן בודדת
interface PlayerRowProps {
  player: FullPlayer;
}

const PlayerRow: React.FC<PlayerRowProps> = React.memo(({ player }) => {
  return (
    <View style={styles.playerRow}>
      <Text style={styles.playerName}>{player.first_name.charAt(0)}. {player.last_name}</Text>
      <Text style={styles.playerDetails}>{player.position_primary} | {player.age} yrs</Text>
      <View style={styles.playerRatingContainer}>
        <Text style={styles.playerRatingText}>OVR:</Text>
        <Text style={styles.playerRatingValue}>{player.rating}</Text>
      </View>
      <Text style={styles.playerStatus}>
        {player.is_injured ? (
          <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Injured</Text>
        ) : (
          <Text style={{ color: '#10B981' }}>Healthy</Text>
        )}
      </Text>
    </View>
  );
});

const TeamCardModal: React.FC<TeamCardModalProps> = ({ isVisible, onClose, teamId, teamStanding }) => {
  const [squadPlayers, setSquadPlayers] = useState<FullPlayer[]>([]);
  const [loadingSquad, setLoadingSquad] = useState(true);

  const fetchSquad = useCallback(async () => {
    if (!teamId) return;
    setLoadingSquad(true);
    try {
      const data = await getTeamSquad(teamId);
      // מיון השחקנים לפי דירוג (rating) בסדר יורד
      const sortedPlayers = data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setSquadPlayers(sortedPlayers);
    } catch (error) {
      console.error(`Failed to fetch squad for team ${teamId}:`, error);
      Alert.alert('Error', 'Failed to load team squad. Please try again later.');
      setSquadPlayers([]);
    } finally {
      setLoadingSquad(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (isVisible && teamId) {
      fetchSquad();
    } else if (!isVisible) {
      setSquadPlayers([]);
      setLoadingSquad(true);
    }
  }, [isVisible, teamId, fetchSquad]);

  if (!teamStanding) {
    return null;
  }

  return (
    <Modal
      animationType="fade" // שינוי אנימציה ל-fade
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.centeredView}>
        <LinearGradient
          colors={['#1E293B', '#0F172A']} // צבעי רקע כהים ועמוקים
          style={styles.modalView}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Close Team Details">
            <MaterialIcons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Team Header */}
            <View style={styles.teamHeader}>
              <Text style={styles.teamName}>{teamStanding.team_name}</Text>
              <Text style={styles.teamLeague}>League Standing</Text>
            </View>

            {/* Basic Team Stats - שופר עם גבולות והפרדות */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="emoji-events" size={24} color="#FBBF24" />
                <Text style={styles.statValue}>{teamStanding.wins}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialIcons name="cancel" size={24} color="#EF4444" />
                <Text style={styles.statValue}>{teamStanding.losses}</Text>
                <Text style={styles.statLabel}>Losses</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={24} color="#A78BFA" />
                <Text style={styles.statValue}>{teamStanding.win_percentage?.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Win %</Text>
              </View>
            </View>

            {/* Offensive/Defensive Stats */}
            <View style={styles.detailedStatsContainer}>
              <View style={styles.detailedStatRow}>
                <FontAwesome5 name="basketball-ball" size={18} color="#3B82F6" />
                <Text style={styles.detailedStatLabel}>Points For (PF):</Text>
                <Text style={styles.detailedStatValue}>{teamStanding.points_for}</Text>
              </View>
              <View style={styles.detailedStatRow}>
                <MaterialIcons name="shield" size={18} color="#059669" />
                <Text style={styles.detailedStatLabel}>Points Against (PA):</Text>
                <Text style={styles.detailedStatValue}>{teamStanding.points_against}</Text>
              </View>
              <View style={styles.detailedStatRow}>
                <MaterialIcons name="balance" size={18} color="#F97316" />
                <Text style={styles.detailedStatLabel}>Point Diff:</Text>
                <Text style={styles.detailedStatValue}>{teamStanding.points_difference}</Text>
              </View>
            </View>

            {/* Squad List */}
            <Text style={styles.squadTitle}>Squad Roster</Text>
            {loadingSquad ? (
              <ActivityIndicator size="large" color="#FBBF24" style={{ marginTop: 20 }} />
            ) : squadPlayers.length > 0 ? (
              <View style={styles.squadList}>
                {squadPlayers.map(player => (
                  <PlayerRow key={player.id} player={player} />
                ))}
              </View>
            ) : (
              <Text style={styles.noPlayersText}>No players found for this team.</Text>
            )}

          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalView: {
    width: width * 0.9,
    maxHeight: height * 0.9, // שימוש ב-maxHeight במקום height קבוע
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6, // הגדלת הצל כדי לתת עומק
    },
    shadowOpacity: 0.4, // הגדלת שקיפות הצל
    shadowRadius: 8,
    elevation: 12, // הגדלת הגובה באנדרואיד
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20, // התאמה לאייפון ולגבהים שונים
    right: 20,
    zIndex: 1,
    padding: 5,
  },
  scrollContent: {
    paddingTop: 30, // מרווח מהכפתור X
    paddingBottom: 20,
  },
  teamHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  teamName: {
    fontSize: 32, // הגדלת גודל כותרת הקבוצה
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // הוספת צל קל לטקסט
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  teamLeague: {
    fontSize: 18, // הגדלת גודל כותרת ליגה
    color: '#CBD5E1',
    marginTop: 5,
    fontStyle: 'italic', // הוספת נטייה
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center', // יישור אנכי של האייקונים והטקסטים
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, // פינות מעוגלות יותר
    paddingVertical: 15, // ריווח פנימי גדול יותר
    marginHorizontal: 0, // הסרת המרווחים האופקיים אם רוצים שיתאים לרוחב
    borderWidth: 1, // הוספת מסגרת עדינה
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1, // יאפשר לכל פריט לתפוס חלק שווה מהשטח
  },
  statValue: {
    fontSize: 22, // גודל ערך הסטט
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12, // גודל תווית הסטט
    color: '#CBD5E1',
    marginTop: 4,
    textTransform: 'uppercase', // הפיכת הטקסט לאותיות גדולות
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  detailedStatsContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 25,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  detailedStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between', // פיזור הנתונים
  },
  detailedStatLabel: {
    fontSize: 15,
    color: '#E2E8F0',
    marginLeft: 10,
    flex: 1, // יאפשר לתווית לתפוס את מירב השטח
  },
  detailedStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  squadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  squadList: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  playerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 2.5, // הגדלת רוחב שם השחקן
  },
  playerDetails: {
    fontSize: 13,
    color: '#E2E8F0',
    flex: 1.5,
    textAlign: 'center',
  },
  playerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end', // יישור לימין
  },
  playerRatingText: {
    fontSize: 12,
    color: '#CBD5E1',
    marginRight: 2,
  },
  playerRatingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FBBF24', // צבע זהב לדירוג
  },
  playerStatus: {
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
  noPlayersText: {
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
    fontStyle: 'italic',
  },
});

export default TeamCardModal;