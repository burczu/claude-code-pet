import { memo, useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Clock } from 'lucide-react-native';
import { useSettings } from '../store/SettingsContext';
import { clearHistory, getHistory } from '../services/historyService';
import { THEMES } from '../theme/colors';

const HistoryItem = memo(function HistoryItem({ item, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: theme.historyBg }]}
      onPress={() => onPress(item.result)}
      activeOpacity={0.6}
    >
      {item.equation ? (
        <Text style={[styles.equation, { color: theme.historySubText }]} numberOfLines={1}>
          {item.equation}
        </Text>
      ) : null}
      <Text style={[styles.result, { color: theme.historyText }]}>{item.result}</Text>
      <Text style={[styles.date, { color: theme.historySubText }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
});

export default function SettingsScreen() {
  const [history, setHistory] = useState([]);
  const { resolvedScheme } = useSettings();
  const theme = THEMES[resolvedScheme];
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, [])
  );

  function handleClearAll() {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => clearHistory().then(() => setHistory([])),
        },
      ]
    );
  }

  function handleItemPress(result) {
    navigation.navigate('Home', { initialValue: result });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 16 },
          history.length === 0 && styles.listEmpty,
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Clock size={20} color={theme.historySubText} style={styles.headerIcon} />
              <Text style={[styles.title, { color: theme.historyText }]}>History</Text>
            </View>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={styles.clearBtn}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Clock size={48} color={theme.historySubText} />
            <Text style={[styles.emptyText, { color: theme.historySubText }]}>
              No calculations yet
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
        )}
        renderItem={({ item }) => (
          <HistoryItem item={item} onPress={handleItemPress} theme={theme} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { flexGrow: 1 },
  listEmpty: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: { marginTop: 2 },
  title: { fontSize: 28, fontWeight: 'bold' },
  clearBtn: { fontSize: 16, color: '#ff3b30' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16 },
  item: { paddingHorizontal: 20, paddingVertical: 14 },
  equation: { fontSize: 14, marginBottom: 2 },
  result: { fontSize: 26, fontWeight: '300' },
  date: { fontSize: 13, marginTop: 4 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 20 },
});