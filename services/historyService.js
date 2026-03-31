import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@calc_history';
const MAX_ITEMS = 50;

export async function pushHistory(equation, result) {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  const history = raw ? JSON.parse(raw) : [];
  history.unshift({
    id: `${Date.now()}-${Math.random()}`,
    equation,
    result,
    timestamp: Date.now(),
  });
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_ITEMS)));
}

export async function getHistory() {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearHistory() {
  await AsyncStorage.removeItem(HISTORY_KEY);
}