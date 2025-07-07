import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // ערך בין 0 ל-100
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color }) => {
  return (
    <View style={styles.statusBar}>
      <View style={[styles.statusFill, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2.5,
    overflow: 'hidden',
    marginRight: 4,
  },
  statusFill: {
    height: '100%',
    borderRadius: 2.5,
  },
});

export default ProgressBar;