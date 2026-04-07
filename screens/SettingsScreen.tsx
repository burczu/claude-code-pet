import { memo, useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import {
  ChevronRight,
  Clock,
  FlaskConical,
  Hash,
  Info,
  Palette,
  Share2,
  Star,
  Sun,
  Vibrate,
} from 'lucide-react-native';
import { useSettings, Settings } from '../store/SettingsContext';
import { clearHistory, getHistory, HistoryItem as HistoryItemData } from '../services/historyService';
import { THEMES, Theme } from '../theme/colors';
import { formatNumber } from '../calculator/formatNumber';

const MIN_PRECISION = 0;
const MAX_PRECISION = 10;
const PRECISION_STEP = 1;

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

const THEME_OPTIONS: Array<{ label: string; value: Settings['theme'] }> = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

interface HistoryItemProps {
  item: HistoryItemData;
  onPress: (result: string) => void;
  theme: Theme;
  precision: number;
}

const HistoryItemRow = memo(function HistoryItemRow({
  item,
  onPress,
  theme,
  precision,
}: HistoryItemProps) {
  const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : '';

  return (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.historyBg }]}
      onPress={() => onPress(item.result)}
      activeOpacity={0.6}
    >
      {item.equation ? (
        <Text style={[styles.equation, { color: theme.historySubText }]} numberOfLines={1}>
          {item.equation}
        </Text>
      ) : null}
      <Text style={[styles.historyResult, { color: theme.historyText }]}>
        {formatNumber(item.result, precision)}
      </Text>
      <Text style={[styles.date, { color: theme.historySubText }]}>{dateStr}</Text>
    </TouchableOpacity>
  );
});

interface SectionCardProps {
  children: React.ReactNode;
  theme: Theme;
}

const SectionCard = memo(function SectionCard({ children, theme }: SectionCardProps) {
  return <View style={[styles.card, { backgroundColor: theme.historyBg }]}>{children}</View>;
});

interface SettingRowProps {
  icon?: React.ReactNode;
  label: string;
  children?: React.ReactNode;
  theme: Theme;
  last?: boolean | undefined;
  onPress?: (() => void) | undefined;
}

const SettingRow = memo(function SettingRow({
  icon,
  label,
  children,
  theme,
  last = false,
  onPress,
}: SettingRowProps) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      activeOpacity={0.6}
      style={[
        styles.row,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.separator,
        },
      ]}
    >
      <View style={styles.rowLeft}>
        {icon}
        <Text style={[styles.rowLabel, { color: theme.historyText }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>{children}</View>
    </Container>
  );
});

export default function SettingsScreen() {
  const [history, setHistory] = useState<HistoryItemData[]>([]);
  const { resolvedScheme, settings, updateSetting } = useSettings();
  const theme = THEMES[resolvedScheme];
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getHistory().then((items) => {
        if (!cancelled) setHistory(items);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleClearAll = useCallback(() => {
    Alert.alert('Clear History', 'Are you sure you want to delete all history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: () => clearHistory().then(() => setHistory([])),
      },
    ]);
  }, []);

  const handleItemPress = useCallback(
    (result: string) => {
      // @ts-expect-error — untyped navigator params
      navigation.navigate('Home', { initialValue: result });
    },
    [navigation],
  );

  const handleShareHistory = useCallback(async () => {
    if (history.length === 0) return;
    const text = history
      .map((item) => {
        const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : '';
        return `${item.result}  —  ${dateStr}`;
      })
      .join('\n');
    Share.share({ message: `My Calculator History:\n\n${text}` });
  }, [history]);

  const listHeader = useMemo(
    () => (
      <View>
        {/* ── Appearance ── */}
        <Text style={[styles.sectionTitle, { color: theme.historySubText, marginTop: 4 }]}>
          APPEARANCE
        </Text>
        <SectionCard theme={theme}>
          <SettingRow
            icon={<Sun size={18} color={settings.accentColor} />}
            label="Theme"
            theme={theme}
          >
            <View style={styles.segmented}>
              {THEME_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => updateSetting('theme', opt.value)}
                  style={[
                    styles.segment,
                    settings.theme === opt.value && { backgroundColor: settings.accentColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: settings.theme === opt.value ? '#fff' : theme.historyText },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </SettingRow>

          <SettingRow
            icon={<Palette size={18} color={settings.accentColor} />}
            label="Accent"
            theme={theme}
            last
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.colorScroll}
            >
              {ACCENT_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => updateSetting('accentColor', color)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    settings.accentColor === color && styles.colorDotSelected,
                  ]}
                />
              ))}
            </ScrollView>
          </SettingRow>
        </SectionCard>

        {/* ── Behaviour ── */}
        <Text style={[styles.sectionTitle, { color: theme.historySubText }]}>BEHAVIOUR</Text>
        <SectionCard theme={theme}>
          <SettingRow
            icon={<Vibrate size={18} color={settings.accentColor} />}
            label="Haptics"
            theme={theme}
          >
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(v) => updateSetting('hapticsEnabled', v)}
              trackColor={{ true: settings.accentColor }}
            />
          </SettingRow>

          <SettingRow
            icon={<FlaskConical size={18} color={settings.accentColor} />}
            label="Scientific Mode"
            theme={theme}
          >
            <Switch
              value={settings.scientificMode}
              onValueChange={(v) => updateSetting('scientificMode', v)}
              trackColor={{ true: settings.accentColor }}
            />
          </SettingRow>

          <SettingRow
            icon={<Hash size={18} color={settings.accentColor} />}
            label={`Precision: ${settings.precision}`}
            theme={theme}
            last
          >
            <Slider
              style={styles.slider}
              minimumValue={MIN_PRECISION}
              maximumValue={MAX_PRECISION}
              step={PRECISION_STEP}
              value={settings.precision}
              onValueChange={(v) => updateSetting('precision', v)}
              minimumTrackTintColor={settings.accentColor}
              maximumTrackTintColor={theme.separator}
              thumbTintColor={settings.accentColor}
            />
          </SettingRow>
        </SectionCard>

        {/* ── More ── */}
        <Text style={[styles.sectionTitle, { color: theme.historySubText }]}>MORE</Text>
        <SectionCard theme={theme}>
          <SettingRow
            icon={
              <Share2
                size={18}
                color={history.length === 0 ? theme.separator : settings.accentColor}
              />
            }
            label="Share History"
            theme={theme}
            onPress={history.length > 0 ? () => { handleShareHistory(); } : undefined}
          >
            <ChevronRight
              size={18}
              color={history.length === 0 ? theme.separator : theme.historySubText}
            />
          </SettingRow>

          <SettingRow
            icon={<Star size={18} color={settings.accentColor} />}
            label="Rate App"
            theme={theme}
            onPress={() => Linking.openURL('https://apps.apple.com')}
          >
            <ChevronRight size={18} color={theme.historySubText} />
          </SettingRow>

          <SettingRow
            icon={<Info size={18} color={settings.accentColor} />}
            label="About"
            theme={theme}
            last
            onPress={() =>
              Alert.alert('Calculator', 'Version 1.0.0\nBuilt with Expo & React Native')
            }
          >
            <ChevronRight size={18} color={theme.historySubText} />
          </SettingRow>
        </SectionCard>

        {/* ── History header ── */}
        <View style={styles.historyHeader}>
          <View style={styles.rowLeft}>
            <Clock size={18} color={settings.accentColor} />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.historySubText, marginTop: 0, marginLeft: 8 },
              ]}
            >
              HISTORY
            </Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearBtn}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    ),
    [settings, theme, history.length, updateSetting, handleShareHistory, handleClearAll],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <FlatList
        data={history}
        keyExtractor={(item, index) => item.id ?? String(index)}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.historySubText }]}>
              No calculations yet
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
        )}
        renderItem={({ item }) => (
          <HistoryItemRow
            item={item}
            onPress={handleItemPress}
            theme={theme}
            precision={settings.precision}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 6,
    marginHorizontal: 20,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowRight: { alignItems: 'flex-end' },
  rowLabel: { fontSize: 16 },
  segmented: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  segment: { paddingHorizontal: 10, paddingVertical: 5 },
  segmentText: { fontSize: 13 },
  colorScroll: { maxHeight: 36 },
  colorDot: { width: 28, height: 28, borderRadius: 14, marginHorizontal: 4 },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  slider: { width: 140, height: 36 },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 6,
  },
  clearBtn: { fontSize: 14, color: '#ff3b30' },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 15 },
  historyItem: { paddingHorizontal: 20, paddingVertical: 14 },
  equation: { fontSize: 14, marginBottom: 2 },
  historyResult: { fontSize: 26, fontWeight: '300' },
  date: { fontSize: 13, marginTop: 4 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 20 },
});