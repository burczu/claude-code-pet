import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
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
import { ThemedText, useTheme } from '../theme/restyleTheme';
import HistoryItemRow from '../components/HistoryItemRow';
import SectionCard from '../components/SectionCard';
import SettingRow from '../components/SettingRow';

const MIN_PRECISION = 0;
const MAX_PRECISION = 10;
const PRECISION_STEP = 1;
const COLOR_DOT_SIZE = 28;
const SLIDER_WIDTH = 140;
const SLIDER_HEIGHT = 36;
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

const THEME_OPTIONS: Array<{ label: string; value: Settings['theme'] }> = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];


export default function SettingsScreen() {
  const [history, setHistory] = useState<HistoryItemData[]>([]);
  const { settings, updateSetting } = useSettings();
  const { colors } = useTheme();
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
        <ThemedText
          variant="sectionTitle"
          style={{
            color: colors.historySubText,
            marginTop: 4,
            marginBottom: 6,
            marginHorizontal: 20,
          }}
        >
          APPEARANCE
        </ThemedText>
        <SectionCard>
          <SettingRow icon={<Sun size={18} color={settings.accentColor} />} label="Theme">
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
                  <ThemedText
                    variant="segmentText"
                    style={{ color: settings.theme === opt.value ? '#fff' : colors.historyText }}
                  >
                    {opt.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </SettingRow>

          <SettingRow icon={<Palette size={18} color={settings.accentColor} />} label="Accent" last>
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
        <ThemedText
          variant="sectionTitle"
          style={{
            color: colors.historySubText,
            marginTop: 24,
            marginBottom: 6,
            marginHorizontal: 20,
          }}
        >
          BEHAVIOUR
        </ThemedText>
        <SectionCard>
          <SettingRow icon={<Vibrate size={18} color={settings.accentColor} />} label="Haptics">
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(v) => updateSetting('hapticsEnabled', v)}
              trackColor={{ true: settings.accentColor }}
            />
          </SettingRow>

          <SettingRow
            icon={<FlaskConical size={18} color={settings.accentColor} />}
            label="Scientific Mode"
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
              maximumTrackTintColor={colors.separator}
              thumbTintColor={settings.accentColor}
            />
          </SettingRow>
        </SectionCard>

        {/* ── More ── */}
        <ThemedText
          variant="sectionTitle"
          style={{
            color: colors.historySubText,
            marginTop: 24,
            marginBottom: 6,
            marginHorizontal: 20,
          }}
        >
          MORE
        </ThemedText>
        <SectionCard>
          <SettingRow
            icon={
              <Share2
                size={18}
                color={history.length === 0 ? colors.separator : settings.accentColor}
              />
            }
            label="Share History"
            onPress={
              history.length > 0
                ? () => {
                    handleShareHistory();
                  }
                : undefined
            }
          >
            <ChevronRight
              size={18}
              color={history.length === 0 ? colors.separator : colors.historySubText}
            />
          </SettingRow>

          <SettingRow
            icon={<Star size={18} color={settings.accentColor} />}
            label="Rate App"
            onPress={() => Linking.openURL('https://apps.apple.com')}
          >
            <ChevronRight size={18} color={colors.historySubText} />
          </SettingRow>

          <SettingRow
            icon={<Info size={18} color={settings.accentColor} />}
            label="About"
            last
            onPress={() =>
              Alert.alert('Calculator', 'Version 1.0.0\nBuilt with Expo & React Native')
            }
          >
            <ChevronRight size={18} color={colors.historySubText} />
          </SettingRow>
        </SectionCard>

        {/* ── History header ── */}
        <View style={styles.historyHeader}>
          <View style={styles.rowLeft}>
            <Clock size={18} color={settings.accentColor} />
            <ThemedText
              variant="sectionTitle"
              style={{ color: colors.historySubText, marginTop: 0, marginLeft: 8 }}
            >
              HISTORY
            </ThemedText>
          </View>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <ThemedText variant="clearBtn">Clear All</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    ),
    [settings, colors, history.length, updateSetting, handleShareHistory, handleClearAll],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={history}
        keyExtractor={(item, index) => item.id ?? String(index)}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText variant="emptyText" style={{ color: colors.historySubText }}>
              No calculations yet
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
        )}
        renderItem={({ item }) => (
          <HistoryItemRow item={item} onPress={handleItemPress} precision={settings.precision} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  slider: { width: SLIDER_WIDTH, height: SLIDER_HEIGHT },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 6,
  },
  empty: { alignItems: 'center', paddingVertical: 24 },
  historyItem: { paddingHorizontal: 20, paddingVertical: 14 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 20 },
});
