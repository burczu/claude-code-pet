import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const onLayout = useCallback((e) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setContainer((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
  }, []);

  useEffect(() => {
    const value = route.params?.initialValue;
    if (value) {
      dispatch({ type: ACTIONS.CLEAR });
      String(value).split('').forEach((digit) => {
        dispatch({ type: ACTIONS.ADD_DIGIT, digit });
      });
    }
  }, [route.params?.initialValue]);
  const theme = useMemo(
    () => ({ ...THEMES[resolvedScheme], operatorBtn: settings.accentColor }),
    [resolvedScheme, settings.accentColor]
  );
  const isLandscape = width > height;

  const SCI_COLS = 4;
  const ROWS = 5;
  // Use measured container size (accounts for tab bar, safe areas, nav chrome).
  // Fall back to window-based estimate before first layout fires.
  const cw = container.width  || (width  - insets.left - insets.right);
  const ch = container.height || (height - insets.top  - insets.bottom - 83); // 83 ≈ tab bar

  const sciPanelRatio = isLandscape ? 0.45 : 0;
  const calcWidth = isLandscape ? cw * (1 - sciPanelRatio) : cw;

  // Width-based: how wide each button can be given the column count
  const buttonSize = (calcWidth - GAP * (COLS + 1)) / COLS;
  // Height-based: how tall each button can be to fit all rows (48px reserved for display)
  const buttonHeight = isLandscape
    ? (ch - 72 - 12 - GAP * (ROWS + 1)) / ROWS  // 12 = paddingTop on row, 72 = display reserve
    : buttonSize;

  const sciButtonSize = isLandscape
    ? (cw * sciPanelRatio - GAP * (SCI_COLS + 1)) / SCI_COLS
    : 0;

  const historyTimer = useRef(null);
  useEffect(() => {
    if (!state.overwrite || state.operator !== null || state.previous !== null) return;
    if (state.current === '0' || state.current === 'Error') return;
    clearTimeout(historyTimer.current);
    historyTimer.current = setTimeout(() => pushHistory('', state.current), 500);
    return () => clearTimeout(historyTimer.current);
  }, [state.current, state.overwrite]);

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 40 && Math.abs(e.translationY) < 40) {
        dispatch({ type: ACTIONS.DELETE_DIGIT });
      }
    });

  const expressionText = useMemo(
    () => state.previous && state.operator
      ? `${formatNumber(state.previous, settings.precision)} ${state.operator}`
      : '',
    [state.previous, state.operator, settings.precision]
  );

  const buttonHandlers = useMemo(
    () => BUTTONS.map((btn) => () => dispatch(btn.action)),
    [dispatch]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={[styles.row, isLandscape && styles.rowLandscape]} onLayout={onLayout}>
        {isLandscape && (
          <ScientificPanel
            dispatch={dispatch}
            buttonSize={sciButtonSize}
            buttonHeight={buttonHeight}
            theme={theme}
            angleMode={state.angleMode}
            memory={state.memory}
          />
        )}

        <View style={{ flex: 1 }}>
          <GestureDetector gesture={swipe}>
            <View style={[styles.display, isLandscape && styles.displayLandscape]}>
              <View style={[styles.indicators, isLandscape && styles.indicatorsLandscape]}>
                {state.memory !== '0' && (
                  <Text style={[styles.indicator, { color: theme.expressionText }, isLandscape && styles.indicatorLandscape]}>M</Text>
                )}
                {isLandscape && state.angleMode === 'rad' && (
                  <Text style={[styles.indicator, { color: theme.expressionText }, styles.indicatorLandscape]}>RAD</Text>
                )}
              </View>
              <Text style={[styles.expression, { color: theme.expressionText }, isLandscape && styles.expressionLandscape]} numberOfLines={1}>
                {expressionText}
              </Text>
              <Text
                style={[styles.current, { color: theme.currentText }, isLandscape && styles.currentLandscape]}
                adjustsFontSizeToFit
                numberOfLines={1}
                minimumFontScale={0.4}
              >
                {formatNumber(state.current, settings.precision)}
              </Text>
            </View>
          </GestureDetector>

          <View style={[styles.grid, { padding: GAP, gap: GAP }]}>
            {BUTTONS.map((btn, index) => (
              <CalcButton
                key={btn.label}
                label={btn.label}
                type={btn.type}
                wide={btn.wide}
                buttonSize={buttonSize}
                buttonHeight={buttonHeight}
                theme={theme}
                hapticsEnabled={settings.hapticsEnabled}
                onPress={buttonHandlers[index]}
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
  rowLandscape: { paddingTop: 12 },
  display: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  displayLandscape: {
    paddingBottom: 2,
    overflow: 'hidden',
  },
  indicators: { flexDirection: 'row', gap: 8, alignSelf: 'flex-end', marginBottom: 2 },
  indicatorsLandscape: { marginBottom: 0 },
  indicator: { fontSize: 13, fontWeight: '500' },
  indicatorLandscape: { fontSize: 11 },
  expression: { fontSize: 24, marginBottom: 4 },
  expressionLandscape: { fontSize: 17, marginBottom: 0 },
  current: {
    fontSize: 80,
    fontWeight: '200',
    width: '100%',
    textAlign: 'right',
  },
  currentLandscape: { fontSize: 38, lineHeight: 38 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});