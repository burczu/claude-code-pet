import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const SETTINGS_KEY = '@calc_settings';

const DEFAULTS = {
  theme: 'system',       // 'light' | 'dark' | 'system'
  accentColor: '#ff9f0a',
  hapticsEnabled: true,
  precision: 10,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      })
      .finally(() => {
        setReady(true);
        SplashScreen.hideAsync();
      });
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    const next = (prev) => {
      const updated = { ...prev, [key]: value };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    };
    setSettings(next);
  }, []);

  const resolvedScheme = settings.theme === 'system'
    ? (Appearance.getColorScheme() ?? 'light')
    : settings.theme;

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resolvedScheme, ready }}>
      {ready ? children : null}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}