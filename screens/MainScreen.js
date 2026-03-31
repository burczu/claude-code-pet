import { useEffect, useReducer } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import CalcButton from '../components/CalcButton';
import ScientificPanel from '../components/ScientificPanel';
import { ACTIONS, calculatorReducer, initialState } from '../calculator/reducer';
import { formatNumber } from '../calculator/formatNumber';
import { THEMES } from '../theme/colors';
import { useSettings } from '../store/SettingsContext';
import { pushHistory } from '../services/historyService';

const GAP = 12;
const COLS = 4;

const BUTTONS = [
  { label: 'AC',  type: 'function', action: { type: ACTIONS.CLEAR } },
  { label: '+/-', type: 'function', action: { type: ACTIONS.ADD_DIGIT, digit: '-' } },
  { label: '%',   type: 'function', action: { type: ACTIONS.PERCENT } },
  { label: '÷',   type: 'operator', action: { type: ACTIONS.CHOOSE_OPERATION, operator: '÷' } },

  { label: '7', type: 'number', action: { type: ACTIONS.ADD_DIGIT, digit: '7' } },
  { label: '8', type: 'number', action: { type: ACTIONS.ADD_DIGIT, digit: '8' } },
  { label: '9', type: 'number', action: { type: ACTIONS.ADD_DIGIT, digit: '9' } },
  { label: '×', type: 'operator', action: { type: ACTIONS.CHOOSE_OPERATION, operator: '×' } },

  { label: '4', type: 'number', action: { type: ACTIONS.ADD_DIGIT, digit: '4' } },
  { label: '5', type: 'number', action: { type: ACTIONS.ADD_DIGIT, digit: '5' } },
  { label: '6', type: 'number', action: { type: ACTIONS.ADD_DIGIT, digit: '6' } },
  { label: '-', type: 'operator', action: { type: ACTIONS.CHOOSE_OPERATION, operator: '-' } },

  { label: '1', type: 'number', action: { type: ACTIONS.ADD_DIGIT, digit: '1' } },
  { label: '2', type: 'number', action: { type: ACTIONS.ADD_DIGIT, digit: '2' } },
  { label: '3', type: 'number', action: { type: ACTIONS.ADD_DIGIT, digit: '3' } },
  { label: '+', type: 'operator', action: { type: ACTIONS.CHOOSE_OPERATION, operator: '+' } },

  { label: '0', type: 'number', wide: true, action: { type: ACTIONS.ADD_DIGIT, digit: '0' } },
  { label: '.', type: 'number', action: { type: ACTIONS.ADD_DIGIT, digit: '.' } },
  { label: '=', type: 'operator', action: { type: ACTIONS.EVALUATE } },
];

export default function MainScreen() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const { width, height } = useWindowDimensions();
  const { resolvedScheme, settings } = useSettings();
  const route = useRoute();

  useEffect(() => {
    const value = route.params?.initialValue;
    if (value) {
      dispatch({ type: ACTIONS.CLEAR });
      String(value).split('').forEach((digit) => {
        dispatch({ type: ACTIONS.ADD_DIGIT, digit });
      });
    }
  }, [route.params?.initialValue]);
  const theme = THEMES[resolvedScheme];
  const isLandscape = width > height;

  const calcWidth = isLandscape ? width * 0.65 : width;
  const buttonSize = (calcWidth - GAP * (COLS + 1)) / COLS;
  const sciButtonSize = isLandscape ? (width * 0.35 - GAP * 3) / 2 : 0;

  useEffect(() => {
    if (!state.overwrite || state.operator !== null || state.previous !== null) return;
    if (state.current === '0' || state.current === 'Error') return;
    pushHistory('', state.current);
  }, [state.current, state.overwrite]);

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 40 && Math.abs(e.translationY) < 40) {
        dispatch({ type: ACTIONS.DELETE_DIGIT });
      }
    });

  const expressionText = state.previous && state.operator
    ? `${formatNumber(state.previous)} ${state.operator}`
    : '';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={styles.row}>
        {isLandscape && (
          <ScientificPanel
            dispatch={dispatch}
            buttonSize={sciButtonSize}
            theme={theme}
          />
        )}

        <View style={{ flex: 1 }}>
          <GestureDetector gesture={swipe}>
            <View style={styles.display}>
              <Text style={[styles.expression, { color: theme.expressionText }]} numberOfLines={1}>
                {expressionText}
              </Text>
              <Text
                style={[styles.current, { color: theme.currentText }]}
                adjustsFontSizeToFit
                numberOfLines={1}
                minimumFontScale={0.4}
              >
                {formatNumber(state.current)}
              </Text>
            </View>
          </GestureDetector>

          <View style={[styles.grid, { padding: GAP, gap: GAP }]}>
            {BUTTONS.map((btn, index) => (
              <CalcButton
                key={index}
                label={btn.label}
                type={btn.type}
                wide={btn.wide}
                buttonSize={buttonSize}
                theme={theme}
                hapticsEnabled={settings.hapticsEnabled}
                onPress={() => dispatch(btn.action)}
              />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: { flex: 1, flexDirection: 'row', alignItems: 'flex-end' },
  display: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  expression: { fontSize: 24, marginBottom: 4 },
  current: {
    fontSize: 80,
    fontWeight: '200',
    width: '100%',
    textAlign: 'right',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});