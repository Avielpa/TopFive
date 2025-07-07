// ==============================================================================
// File: frontend/app/(tabs)/leagueTable.tsx (WITH TEAM CARD MODAL INTEGRATION)
// Description: League standings table with added functionality to open TeamCardModal.
// ==============================================================================
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity, // ✅ ייבוא TouchableOpacity
  Alert, // ✅ ייבוא Alert לטיפול בשגיאות / הודעות
} from 'react-native';
import { TeamStanding } from '../../types/entities';
import { getLeagueStandings } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

// ✅ ייבוא קומפוננטת המודאל החדשה
import TeamCardModal from '../../components/team/TeamCard';

// --- StandingsHeader קומפוננטה (ללא שינוי מהותי) ---
const StandingsHeader = () => (
  <View style={[styles.row, styles.headerRow]}>
    <Text style={[styles.cell, styles.headerCell, { flex: 0.7, textAlign: 'center' }]}>#</Text>
    <Text style={[styles.cell, styles.headerCell, { flex: 3 }]}>Team</Text>
    <Text style={[styles.cell, styles.headerCell]}>W</Text>
    <Text style={[styles.cell, styles.headerCell]}>L</Text>
    <Text style={[styles.cell, styles.headerCell]}>%</Text>
    <Text style={[styles.cell, styles.headerCell]}>+/-</Text>
  </View>
);

// --- StandingsRow קומפוננטה (עם TouchableOpacity) ---
// ✅ הוספנו Prop חדש: onTeamPress
interface StandingsRowProps {
  item: TeamStanding;
  index: number;
  onTeamPress: (team: TeamStanding) => void; // פונקציה שתופעל בלחיצה
}

const StandingsRow: React.FC<StandingsRowProps> = ({ item, index, onTeamPress }) => (
  <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
    <Text style={[styles.cell, { flex: 0.7, fontWeight: 'bold' }]}>{index + 1}</Text>
    {/* ✅ עוטפים את שם הקבוצה ב-TouchableOpacity */}
    <TouchableOpacity
      style={{ flex: 3, paddingVertical: 2 }} // סגנון עזר כדי שהלחיצה תהיה נוחה
      onPress={() => onTeamPress(item)} // מעבירים את כל אובייקט ה-TeamStanding
    >
      <Text style={[styles.cell, styles.teamNameCell]} numberOfLines={1}>{item.team_name}</Text>
    </TouchableOpacity>
    <Text style={styles.cell}>{item.wins}</Text>
    <Text style={styles.cell}>{item.losses}</Text>
    <Text style={styles.cell}>{item.win_percentage.toFixed(1)}</Text>
    <Text style={[styles.cell, item.points_difference >= 0 ? styles.positiveDiff : styles.negativeDiff]}>
      {item.points_difference > 0 ? `+${item.points_difference}` : item.points_difference}
    </Text>
  </View>
);

// --- LeagueScreen קומפוננטה (עם לוגיקת המודאל) ---
export default function LeagueScreen() {
  const { userInfo, isLoading: isAuthLoading } = useAuth();
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ סטייטים חדשים לניהול המודאל
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedTeamStanding, setSelectedTeamStanding] = useState<TeamStanding | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      if (userInfo?.league_id) {
        try {
          setLoading(true);
          const data = await getLeagueStandings(userInfo.league_id);
          // ✅ חשוב: ודא שה-data מגיע עם team_id עבור כל TeamStanding
          setStandings(data);
          setError(null);
        } catch (err) {
          setError('Failed to load league standings.');
          console.error('[LeagueScreen] Error fetching standings:', err);
          Alert.alert('Error', 'Could not load league standings. Please check your connection.');
        } finally {
          setLoading(false);
        }
      } else {
        // אם אין league_id, יש לסיים את הטעינה
        setLoading(false);
        setError('No league ID found for the current user. Cannot display standings.');
      }
    };

    if (!isAuthLoading) {
      fetchStandings();
    }
  }, [userInfo, isAuthLoading]);

  // ✅ פונקציה לטיפול בלחיצה על שם קבוצה בטבלה
  const handleTeamPress = (team: TeamStanding) => {
    if (team.team_id) { // וודא שיש team_id זמין
      setSelectedTeamId(team.team_id);
      setSelectedTeamStanding(team);
      setIsTeamModalVisible(true);
    } else {
      Alert.alert('Error', 'Team ID not available for this team.');
      console.warn('Attempted to open TeamCardModal for a team without an ID:', team);
    }
  };

  // ✅ פונקציה לסגירת המודאל
  const handleCloseTeamModal = () => {
    setIsTeamModalVisible(false);
    setSelectedTeamId(null);
    setSelectedTeamStanding(null);
  };

  if (isAuthLoading || loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFA726" />
        <Text style={styles.loadingText}>Loading Standings...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{userInfo?.league_name || 'League Standings'}</Text>
      <View style={styles.tableContainer}>
        <StandingsHeader />
        <FlatList
          data={standings}
          keyExtractor={(item) => item.team_name.toString()} // השתמש ב-team_name כ-key אם הוא ייחודי
          renderItem={({ item, index }) => (
            <StandingsRow
              item={item}
              index={index}
              onTeamPress={handleTeamPress} // העבר את הפונקציה ל-StandingsRow
            />
          )}
          contentContainerStyle={{ paddingBottom: 140 }}
        />
      </View>

      {/* ✅ Team Card Modal - הצגה מותנית */}
      {isTeamModalVisible && selectedTeamId && selectedTeamStanding && (
        <TeamCardModal
          isVisible={isTeamModalVisible}
          onClose={handleCloseTeamModal}
          teamId={selectedTeamId}
          teamStanding={selectedTeamStanding}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 40 },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
  tableContainer: { marginHorizontal: 10, borderWidth: 1, borderColor: '#334155', borderRadius: 8, overflow: 'hidden' },
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155', alignItems: 'center' },
  headerRow: { backgroundColor: '#1E293B', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: '#FFA726' },
  evenRow: { backgroundColor: '#1E293B' },
  oddRow: { backgroundColor: 'transparent' },
  cell: { color: '#CBD5E1', textAlign: 'center', flex: 1, fontSize: 14, paddingHorizontal: 2 },
  headerCell: { color: '#FFA726', fontWeight: 'bold', fontSize: 15 },
  teamNameCell: { // ✅ סגנון חדש לשם הקבוצה שניתן ללחוץ עליו
    color: '#8be9fd', // צבע מעט שונה כדי להראות שזה לחיץ
    fontWeight: 'bold',
    textAlign: 'left', // יישור לשמאל בתוך ה-flex: 3
    paddingLeft: 10, // מרווח מהשוליים
  },
  positiveDiff: { color: '#4ADE80', fontWeight: 'bold' },
  negativeDiff: { color: '#F87171', fontWeight: 'bold' },
  loadingText: { marginTop: 10, color: '#94A3B8', fontSize: 16 },
  errorText: { color: '#F87171', fontSize: 18 },
});




























