import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface FinancialSummaryCardProps {
  budget: number;
}

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({ budget }) => {
  // הכנסות והוצאות נשארים מדומים בינתיים כיוון שאין API ייעודי
  const income = Math.floor(Math.random() * 50000) + 25000;
  const expenses = Math.floor(Math.random() * 30000) + 15000;

  return (
    <LinearGradient colors={['#059669', '#10B981']} style={[styles.card, styles.financialSummaryCard]}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="account-balance-wallet" size={16} color="#FFF" />
        <Text style={styles.cardTitle}>Financials</Text>
      </View>
      <View style={styles.financialContent}>
        <View style={styles.financialItem}>
          <Text style={styles.financialLabel}>Budget:</Text>
          <Text style={styles.financialValue}>${budget.toLocaleString()}</Text>
        </View>
        <View style={styles.financialItem}>
          <Text style={styles.financialLabel}>Income (M):</Text>
          <Text style={styles.financialValue}>+${income.toLocaleString()}</Text>
        </View>
        <View style={styles.financialItem}>
          <Text style={styles.financialLabel}>Expenses (M):</Text>
          <Text style={styles.financialValue}>-${expenses.toLocaleString()}</Text>
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
  financialSummaryCard: {
    flex: 1,
    minHeight: 75,
  },
  financialContent: {
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 0,
  },
  financialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  financialLabel: {
    fontSize: 9,
    color: '#E2E8F0',
  },
  financialValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default FinancialSummaryCard;