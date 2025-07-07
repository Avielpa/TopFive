// File: frontend/context/SettingContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// טיפוסים
type Theme = 'light' | 'dark';
type Language = 'English' | 'Hebrew';
type GraphicQuality = 'low' | 'medium' | 'high';
type FpsLimit = '30' | '60' | 'unlimited';
type SimulationSpeed = 'normal' | 'fast' | 'very_fast';

// ברירת מחדל
const defaultSettings = {
  theme: 'dark' as Theme,
  language: 'English' as Language,
  darkMode: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  muteAllSound: false,
  graphicQuality: 'medium' as GraphicQuality,
  fpsLimit: '60' as FpsLimit,
  simulationSpeed: 'normal' as SimulationSpeed,
  popupNotifications: true,
};

interface SettingsContextType {
  theme: Theme;
  language: Language;
  darkMode: boolean;
  musicVolume: number;
  sfxVolume: number;
  muteAllSound: boolean;
  graphicQuality: GraphicQuality;
  fpsLimit: FpsLimit;
  simulationSpeed: SimulationSpeed;
  popupNotifications: boolean;

  setTheme: (value: Theme) => void;
  setLanguage: (value: Language) => void;
  setDarkMode: (value: boolean) => void;
  setMusicVolume: (value: number) => void;
  setSfxVolume: (value: number) => void;
  setMuteAllSound: (value: boolean) => void;
  setGraphicQuality: (value: GraphicQuality) => void;
  setFpsLimit: (value: FpsLimit) => void;
  setSimulationSpeed: (value: SimulationSpeed) => void;
  setPopupNotifications: (value: boolean) => void;

  resetAllSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(defaultSettings.theme);
  const [language, setLanguage] = useState<Language>(defaultSettings.language);
  const [darkMode, setDarkMode] = useState(defaultSettings.darkMode);
  const [musicVolume, setMusicVolume] = useState(defaultSettings.musicVolume);
  const [sfxVolume, setSfxVolume] = useState(defaultSettings.sfxVolume);
  const [muteAllSound, setMuteAllSound] = useState(defaultSettings.muteAllSound);
  const [graphicQuality, setGraphicQuality] = useState<GraphicQuality>(defaultSettings.graphicQuality);
  const [fpsLimit, setFpsLimit] = useState<FpsLimit>(defaultSettings.fpsLimit);
  const [simulationSpeed, setSimulationSpeed] = useState<SimulationSpeed>(defaultSettings.simulationSpeed);
  const [popupNotifications, setPopupNotifications] = useState(defaultSettings.popupNotifications);

  // טען הגדרות מהאחסון
  useEffect(() => {
    const loadSetting = async <T,>(key: string, setter: (v: T) => void, fallback: T) => {
      try {
        const json = await AsyncStorage.getItem(key);
        if (json !== null) setter(JSON.parse(json));
        else setter(fallback);
      } catch (e) {
        setter(fallback);
      }
    };

    loadSetting<Theme>('theme', setTheme, defaultSettings.theme);
    loadSetting<Language>('language', setLanguage, defaultSettings.language);
    loadSetting<boolean>('darkMode', setDarkMode, defaultSettings.darkMode);
    loadSetting<number>('musicVolume', setMusicVolume, defaultSettings.musicVolume);
    loadSetting<number>('sfxVolume', setSfxVolume, defaultSettings.sfxVolume);
    loadSetting<boolean>('muteAllSound', setMuteAllSound, defaultSettings.muteAllSound);
    loadSetting<GraphicQuality>('graphicQuality', setGraphicQuality, defaultSettings.graphicQuality);
    loadSetting<FpsLimit>('fpsLimit', setFpsLimit, defaultSettings.fpsLimit);
    loadSetting<SimulationSpeed>('simulationSpeed', setSimulationSpeed, defaultSettings.simulationSpeed);
    loadSetting<boolean>('popupNotifications', setPopupNotifications, defaultSettings.popupNotifications);
  }, []);

  // שמירה
  useEffect(() => { AsyncStorage.setItem('theme', JSON.stringify(theme)); }, [theme]);
  useEffect(() => { AsyncStorage.setItem('language', JSON.stringify(language)); }, [language]);
  useEffect(() => { AsyncStorage.setItem('darkMode', JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => { AsyncStorage.setItem('musicVolume', JSON.stringify(musicVolume)); }, [musicVolume]);
  useEffect(() => { AsyncStorage.setItem('sfxVolume', JSON.stringify(sfxVolume)); }, [sfxVolume]);
  useEffect(() => { AsyncStorage.setItem('muteAllSound', JSON.stringify(muteAllSound)); }, [muteAllSound]);
  useEffect(() => { AsyncStorage.setItem('graphicQuality', JSON.stringify(graphicQuality)); }, [graphicQuality]);
  useEffect(() => { AsyncStorage.setItem('fpsLimit', JSON.stringify(fpsLimit)); }, [fpsLimit]);
  useEffect(() => { AsyncStorage.setItem('simulationSpeed', JSON.stringify(simulationSpeed)); }, [simulationSpeed]);
  useEffect(() => { AsyncStorage.setItem('popupNotifications', JSON.stringify(popupNotifications)); }, [popupNotifications]);

  const resetAllSettings = async () => {
    await AsyncStorage.clear();
    setTheme(defaultSettings.theme);
    setLanguage(defaultSettings.language);
    setDarkMode(defaultSettings.darkMode);
    setMusicVolume(defaultSettings.musicVolume);
    setSfxVolume(defaultSettings.sfxVolume);
    setMuteAllSound(defaultSettings.muteAllSound);
    setGraphicQuality(defaultSettings.graphicQuality);
    setFpsLimit(defaultSettings.fpsLimit);
    setSimulationSpeed(defaultSettings.simulationSpeed);
    setPopupNotifications(defaultSettings.popupNotifications);
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        language,
        darkMode,
        musicVolume,
        sfxVolume,
        muteAllSound,
        graphicQuality,
        fpsLimit,
        simulationSpeed,
        popupNotifications,
        setTheme,
        setLanguage,
        setDarkMode,
        setMusicVolume,
        setSfxVolume,
        setMuteAllSound,
        setGraphicQuality,
        setFpsLimit,
        setSimulationSpeed,
        setPopupNotifications,
        resetAllSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// שימוש
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
