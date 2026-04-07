import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const SETTINGS_KEY = '@calc_settings';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  hapticsEnabled: boolean;
  precision: number;
  scientificMode: boolean;
}

interface SettingsContextValue {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  resolvedScheme: NonNullable<ColorSchemeName>;
  ready: boolean;
}

const DEFAULTS: Settings = {
  theme: 'system',
  accentColor: '#ff9f0a',
  hapticsEnabled: true,
  precision: 10,
  scientificMode: false,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [systemScheme, setSystemScheme] = useState<NonNullable<ColorSchemeName>>(
    Appearance.getColorScheme() ?? 'light',
  );
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

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? 'light');
    });
    return () => sub.remove();
  }, []);

  const updateSetting = useCallback(async <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ): Promise<void> => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resolvedScheme: NonNullable<ColorSchemeName> =
    settings.theme === 'system' ? systemScheme : settings.theme;

  const ctxValue = useMemo(
    () => ({ settings, updateSetting, resolvedScheme, ready }),
    [settings, updateSetting, resolvedScheme, ready],
  );

  return (
    <SettingsContext.Provider value={ctxValue}>{ready ? children : null}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}