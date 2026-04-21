import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Palette, Sun } from 'lucide-react-native';

import { Settings } from '../../store/SettingsContext';
import { ThemedText, useTheme } from '../../theme/restyleTheme';
import SectionCard from '../SectionCard';
import SettingRow from '../SettingRow';

const COLOR_DOT_SIZE = 28;
const SEGMENT_BORDER_RADIUS = 8;

const ACCENT_COLORS = [
  '#ff9f0a',
  '#ff3b30',
  '#34c759',
  '#007aff',
  '#af52de',
  '#ff2d55',
  '#5ac8fa',
  '#ff6b00',
];

const THEME_VALUES: Settings['theme'][] = ['light', 'dark', 'system'];

interface AppearanceSectionProps {
  theme: Settings['theme'];
  accentColor: string;
  onThemeChange: (value: Settings['theme']) => void;
  onAccentChange: (value: string) => void;
}

export default function AppearanceSection({
  theme,
  accentColor,
  onThemeChange,
  onAccentChange,
}: AppearanceSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <ThemedText
        variant="sectionTitle"
        style={{
          color: colors.historySubText,
          marginTop: 4,
          marginBottom: 6,
          marginHorizontal: 20,
        }}
      >
        {t('settings.appearance')}
      </ThemedText>
      <SectionCard>
        <SettingRow icon={<Sun size={18} color={accentColor} />} label={t('settings.theme')}>
          <View style={styles.segmented}>
            {THEME_VALUES.map((value) => (
              <Pressable
                key={value}
                onPress={() => onThemeChange(value)}
                style={[styles.segment, theme === value && { backgroundColor: accentColor }]}
              >
                <ThemedText
                  variant="segmentText"
                  style={{ color: theme === value ? '#fff' : colors.historyText }}
                >
                  {t(`settings.themeOptions.${value}`)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </SettingRow>

        <SettingRow
          icon={<Palette size={18} color={accentColor} />}
          label={t('settings.accent')}
          last
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
            {ACCENT_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => onAccentChange(color)}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  accentColor === color && styles.colorDotSelected,
                ]}
              />
            ))}
          </ScrollView>
        </SettingRow>
      </SectionCard>
    </>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    borderRadius: SEGMENT_BORDER_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  segment: { paddingHorizontal: 10, paddingVertical: 5 },
  colorScroll: { maxHeight: COLOR_DOT_SIZE + 8 },
  colorDot: {
    width: COLOR_DOT_SIZE,
    height: COLOR_DOT_SIZE,
    borderRadius: COLOR_DOT_SIZE / 2,
    marginHorizontal: 4,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
