import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from '../theme/colors';

const HISTORY_KEY = '@calc_history';

export default function SettingsScreen() {
  const [history, setHistory] = useState([]);
  const colorScheme = useColorScheme();
  const theme = THEMES[colorScheme === 'dark' ? 'dark' : 'light'];

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
        setHistory(raw ? JSON.parse(raw) : []);
      });
    }, [])
  );

  function clearHistory() {
    AsyncStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.historyText }]}>History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory}>
            <Text style={styles.clear}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.historySubText }]}>
            No calculations yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, i) => String(i)}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.separator }]} />
          )}
          renderItem={({ item }) => (
            <View style={[styles.item, { backgroundColor: theme.historyBg }]}>
              <Text style={[styles.result, { color: theme.historyText }]}>{item.result}</Text>
              <Text style={[styles.date, { color: theme.historySubText }]}>
                {new Date(item.date).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  clear: {
    fontSize: 16,
    color: '#ff3b30',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  result: {
    fontSize: 22,
    fontWeight: '300',
  },
  date: {
    fontSize: 13,
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 20,
  },
});