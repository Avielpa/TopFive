import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '@/context/SettingContext';

const { width, height } = Dimensions.get('window');

const TEXT_SIZE = height * 0.018;

const labels = {
  English: {
    settings: 'Settings',
    music: 'Music Volume',
    sfx: 'SFX Volume',
    mute: 'Mute All',
    graphics: 'Graphics Quality',
    fps: 'FPS Limit',
    sim: 'Simulation Speed',
    dark: 'Dark Mode',
    notif: 'Notifications',
    lang: 'Language',
    reset: 'Reset All to Default',
  },
  Hebrew: {
    settings: 'הגדרות',
    music: 'עוצמת מוזיקה',
    sfx: 'צלילי משחק',
    mute: 'השתק הכל',
    graphics: 'איכות גרפית',
    fps: 'מגבלת FPS',
    sim: 'מהירות סימולציה',
    dark: 'מצב כהה',
    notif: 'התראות',
    lang: 'שפה',
    reset: 'איפוס כל ההגדרות',
  },
};

export default function Settings() {
  const {
    theme, language,
    musicVolume, sfxVolume, muteAllSound,
    graphicQuality, fpsLimit, simulationSpeed,
    darkMode, popupNotifications,
    setTheme, setLanguage,
    setMusicVolume, setSfxVolume, setMuteAllSound,
    setGraphicQuality, setFpsLimit, setSimulationSpeed,
    setPopupNotifications, setDarkMode,
    resetAllSettings
  } = useSettings();

  const lang = labels[language];

  const renderOption = <T extends string>(
    title: string, icon: React.ReactNode,
    value: T, options: readonly T[],
    setter: (val: T) => void
  ) => (
    <View style={s.row}>
      <View style={s.iconLabel}>{icon}<Text style={s.label}>{title}</Text></View>
      <View style={s.btnRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[s.optBtn, value === opt && s.optActive]}
            onPress={() => setter(opt)}
          >
            <Text style={[s.optText, value === opt && s.optTextActive]}>
              {opt.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[s.container, theme === 'dark' ? { backgroundColor: '#0F172A' } : { backgroundColor: '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>{lang.settings}</Text>

        {/* Music Volume */}
        <View style={s.row}>
          <View style={s.iconLabel}>
            <Feather name="music" size={18} color="#FBBF24" />
            <Text style={s.label}>{lang.music}</Text>
          </View>
          <View style={s.sliderCont}>
            <Slider
              value={musicVolume}
              onValueChange={setMusicVolume}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              minimumTrackTintColor="#FBBF24"
              thumbTintColor="#FFA726"
              style={{ width: 120 }}
            />
            <Text style={s.sliderVal}>{Math.round(musicVolume * 100)}%</Text>
          </View>
        </View>

        {/* SFX Volume */}
        <View style={s.row}>
          <View style={s.iconLabel}>
            <Feather name="volume-2" size={18} color="#60A5FA" />
            <Text style={s.label}>{lang.sfx}</Text>
          </View>
          <View style={s.sliderCont}>
            <Slider
              value={sfxVolume}
              onValueChange={setSfxVolume}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              minimumTrackTintColor="#60A5FA"
              thumbTintColor="#38BDF8"
              style={{ width: 120 }}
            />
            <Text style={s.sliderVal}>{Math.round(sfxVolume * 100)}%</Text>
          </View>
        </View>

        {/* Mute All */}
        <View style={s.row}>
          <View style={s.iconLabel}>
            <Feather name="speaker" size={18} color="#EF4444" />
            <Text style={s.label}>{lang.mute}</Text>
          </View>
          <Switch
            value={muteAllSound}
            onValueChange={setMuteAllSound}
            thumbColor={muteAllSound ? '#EF4444' : '#A5F3FC'}
            trackColor={{ true: '#F87171', false: '#94A3B8' }}
          />
        </View>

        {/* Graphic Quality */}
        {renderOption(lang.graphics, <Ionicons name="speedometer" size={18} color="#FBBF24" />, graphicQuality, ['low', 'medium', 'high'], setGraphicQuality)}

        {/* FPS Limit */}
        {renderOption(lang.fps, <Feather name="cpu" size={18} color="#A78BFA" />, fpsLimit, ['30', '60', 'unlimited'], setFpsLimit)}

        {/* Simulation Speed */}
        {renderOption(lang.sim, <MaterialIcons name="fast-forward" size={18} color="#60A5FA" />, simulationSpeed, ['normal', 'fast', 'very_fast'], setSimulationSpeed)}

        {/* Popup Notifications */}
        <View style={s.row}>
          <View style={s.iconLabel}>
            <Feather name="bell" size={18} color="#FACC15" />
            <Text style={s.label}>{lang.notif}</Text>
          </View>
          <Switch
            value={popupNotifications}
            onValueChange={setPopupNotifications}
            thumbColor={popupNotifications ? '#FACC15' : '#64748B'}
            trackColor={{ true: '#FEF08A', false: '#CBD5E1' }}
          />
        </View>

        {/* Dark Mode */}
        <View style={s.row}>
          <View style={s.iconLabel}>
            <Feather name="moon" size={18} color="#60A5FA" />
            <Text style={s.label}>{lang.dark}</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={(val) => {
              setDarkMode(val);
              setTheme(val ? 'dark' : 'light');
            }}
            thumbColor={darkMode ? '#60A5FA' : '#D1D5DB'}
            trackColor={{ true: '#BFDBFE', false: '#E5E7EB' }}
          />
        </View>

        {/* Language */}
        {renderOption(lang.lang, <Feather name="globe" size={18} color="#FBBF24" />, language, ['English', 'Hebrew'], setLanguage)}

        {/* Reset Button */}
        <TouchableOpacity style={s.resetBtn} onPress={resetAllSettings}>
          <Text style={s.resetText}>{lang.reset}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 50 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FBBF24', marginBottom: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: TEXT_SIZE,
    color: '#E2E8F0',
  },
  sliderCont: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderVal: {
    color: '#CBD5E1',
    marginLeft: 8,
    fontSize: 13,
    width: 40,
    textAlign: 'right',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  optBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#334155',
    borderRadius: 6,
  },
  optActive: {
    backgroundColor: '#FFA726',
  },
  optText: {
    color: '#E2E8F0',
    fontSize: 12,
  },
  optTextActive: {
    fontWeight: 'bold',
    color: '#1E293B',
  },
  resetBtn: {
    marginTop: 30,
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
