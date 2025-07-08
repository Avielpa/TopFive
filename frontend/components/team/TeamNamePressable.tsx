// src/components/TeamNamePressable.tsx
import React, { useState, useCallback } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import TeamCardModal from './TeamCard'; // ודא נתיב נכון
import { TeamStanding } from '../../types/entities'; // ודא נתיב נכון
import { getTeamStandingById } from '../../services/apiService'; // פונקציה חדשה שצריך ליצור ב-apiService

interface TeamNamePressableProps {
  teamId: number;
  teamName: string;
  textStyle?: object; // לאפשר קבלת סגנונות טקסט מבחוץ
  // אופציונלי: יכול לקבל גם את הסטנדינג הראשוני אם כבר זמין (למשל מטבלת הליגה)
  // זה יחסוך קריאת API נוספת לטעינת הסטנדינג הבסיסי
  initialTeamStanding?: TeamStanding;
}

const TeamNamePressable: React.FC<TeamNamePressableProps> = ({
  teamId,
  teamName,
  textStyle,
  initialTeamStanding,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [teamStandingData, setTeamStandingData] = useState<TeamStanding | null>(initialTeamStanding || null);
  const [isLoadingStanding, setIsLoadingStanding] = useState(!initialTeamStanding); // אם אין נתונים התחלתיים, טען אותם

  const handleOpenModal = useCallback(async () => {
    // אם כבר יש לנו נתוני סטנדינג עדכניים, או שהם הועברו כ-prop, אל תטען מחדש
    if (teamStandingData && !isLoadingStanding) {
      setIsModalVisible(true);
      return;
    }

    // אם אין נתוני סטנדינג, טען אותם לפני פתיחת המודאל
    setIsLoadingStanding(true);
    try {
      const data = await getTeamStandingById(teamId); // פונקציה חדשה שאנחנו צריכים ליצור
      setTeamStandingData(data);
      setIsModalVisible(true);
    } catch (error) {
      console.error(`Failed to fetch team standing for team ${teamId}:`, error);
      Alert.alert('Error', 'Failed to load team details. Please try again later.');
    } finally {
      setIsLoadingStanding(false);
    }
  }, [teamId, teamStandingData, isLoadingStanding, initialTeamStanding]);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  return (
    <>
      <TouchableOpacity
        onPress={handleOpenModal}
        disabled={isLoadingStanding} // נטרל לחיצה בזמן טעינה
        style={styles.touchable}
        accessibilityLabel={`View details for ${teamName}`}
      >
        {isLoadingStanding && !teamStandingData ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={[styles.defaultTextStyle, textStyle]}>{teamName}</Text>
        )}
      </TouchableOpacity>

      {teamStandingData && (
        <TeamCardModal
          isVisible={isModalVisible}
          onClose={handleCloseModal}
          teamId={teamId}
          teamStanding={teamStandingData}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  touchable: {
    // סגנונות בסיסיים ללחיץ, אפשר להוסיף פה ריפוד קטן אם רוצים
  },
  defaultTextStyle: {
    color: '#3B82F6', // צבע כחול סטנדרטי לקישורים
    fontWeight: 'bold',
    textDecorationLine: 'underline', // קו תחתון כדי לסמן שזה לחיץ
  },
});

export default TeamNamePressable;