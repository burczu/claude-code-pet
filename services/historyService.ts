import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@calc_history';
const MAX_ITEMS = 50;

export interface HistoryItem {
  id: string;
  equation: string;
  result: string;
  timestamp: number;
}

export async function pushHistory(equation: string, result: string): Promise<void> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  const history: HistoryItem[] = raw ? JSON.parse(raw) : [];
  history.unshift({
    id: `${Date.now()}-${Math.random()}`,
    equation,
    result,
    timestamp: Date.now(),
  });
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_ITEMS)));
}

export async function getHistory(): Promise<HistoryItem[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}