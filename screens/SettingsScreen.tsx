import { useCallback, useState } from 'react';
import { Alert, FlatList, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSettings } from '../store/SettingsContext';
import { clearHistory, getHistory, HistoryItem as HistoryItemData } from '../services/historyService';
import { ThemedText, useTheme } from '../theme/restyleTheme';
import HistoryItemRow from '../components/HistoryItemRow';
import AppearanceSection from '../components/settings/AppearanceSection';
import BehaviourSection from '../components/settings/BehaviourSection';
import MoreSection from '../components/settings/MoreSection';
import HistoryHeader from '../components/settings/HistoryHeader';

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

  const listHeader = (
    <View>
      <AppearanceSection
        theme={settings.theme}
        accentColor={settings.accentColor}
        onThemeChange={(v) => updateSetting('theme', v)}
        onAccentChange={(v) => updateSetting('accentColor', v)}
      />
      <BehaviourSection
        accentColor={settings.accentColor}
        hapticsEnabled={settings.hapticsEnabled}
        scientificMode={settings.scientificMode}
        precision={settings.precision}
        onHapticsChange={(v) => updateSetting('hapticsEnabled', v)}
        onScientificModeChange={(v) => updateSetting('scientificMode', v)}
        onPrecisionChange={(v) => updateSetting('precision', v)}
      />
      <MoreSection
        accentColor={settings.accentColor}
        hasHistory={history.length > 0}
        onShareHistory={handleShareHistory}
      />
      <HistoryHeader
        accentColor={settings.accentColor}
        hasHistory={history.length > 0}
        onClearAll={handleClearAll}
      />
    </View>
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
  empty: { alignItems: 'center', paddingVertical: 24 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 20 },
});