import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import CalcButton from '../components/CalcButton';
import ScientificPanel from '../components/ScientificPanel';
import { ACTIONS, CalculatorAction, calculatorReducer, initialState } from '../calculator/reducer';
import { formatNumber } from '../calculator/formatNumber';
import { useSettings } from '../store/SettingsContext';
import { pushHistory } from '../services/historyService';
import { ThemedText, useTheme } from '../theme/restyleTheme';

const GAP = 12;
const COLS = 4;
const ROWS = 5;
const SCI_COLS_LANDSCAPE = 4;
const SCI_COLS_PORTRAIT = 6;
const SCI_PANEL_WIDTH_RATIO = 0.45;
const TAB_BAR_HEIGHT_ESTIMATE = 83;
const PORTRAIT_SCI_DISPLAY_HEIGHT = 60;
const PORTRAIT_SCI_SHARED_HEIGHT_MIN = 18;
const SCIENTIFIC_ROW_GAP_EXTRA = 6;
const PORTRAIT_SCI_PADDING = 12;
const SWIPE_THRESHOLD_X = 40;
const SWIPE_THRESHOLD_Y = 40;

const BUTTONS = [
  { label: 'AC', type: 'function' as const, action: { type: ACTIONS.CLEAR } },
  {
    label: '+/-',
    type: 'function' as const,
    action: { type: ACTIONS.ADD_DIGIT, digit: '-' },
  },
  { label: '%', type: 'function' as const, action: { type: ACTIONS.PERCENT } },
  {
    label: '÷',
    type: 'operator' as const,
    action: { type: ACTIONS.CHOOSE_OPERATION, operator: '÷' as const },
  },

  { label: '7', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '7' } },
  { label: '8', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '8' } },
  { label: '9', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '9' } },
  {
    label: '×',
    type: 'operator' as const,
    action: { type: ACTIONS.CHOOSE_OPERATION, operator: '×' as const },
  },

  { label: '4', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '4' } },
  { label: '5', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '5' } },
  { label: '6', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '6' } },
  {
    label: '-',
    type: 'operator' as const,
    action: { type: ACTIONS.CHOOSE_OPERATION, operator: '-' as const },
  },

  { label: '1', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '1' } },
  { label: '2', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '2' } },
  { label: '3', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '3' } },
  {
    label: '+',
    type: 'operator' as const,
    action: { type: ACTIONS.CHOOSE_OPERATION, operator: '+' as const },
  },

  {
    label: '0',
    type: 'number' as const,
    wide: true,
    action: { type: ACTIONS.ADD_DIGIT, digit: '0' },
  },
  { label: '.', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '.' } },
  { label: '=', type: 'operator' as const, action: { type: ACTIONS.EVALUATE } },
] satisfies Array<{
  label: string;
  type: 'number' | 'operator' | 'function';
  wide?: boolean;
  action: CalculatorAction;
}>;

export default function MainScreen() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const { width, height } = useWindowDimensions();
  const { settings } = useSettings();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [container, setContainer] = useState({ width: 0, height: 0 });

  const onLayout = useCallback((evt: LayoutChangeEvent) => {
    const { width: w, height: h } = evt.nativeEvent.layout;
    setContainer((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
  }, []);

  useEffect(() => {
    const value = (route.params as { initialValue?: string } | undefined)?.initialValue;
    if (value) {
      dispatch({ type: ACTIONS.CLEAR });
      String(value)
        .split('')
        .forEach((digit) => {
          dispatch({ type: ACTIONS.ADD_DIGIT, digit });
        });
    }
  }, [(route.params as { initialValue?: string } | undefined)?.initialValue]);

  const { colors } = useTheme();

  const isLandscape = width > height;
  const showScientific = settings.scientificMode;

  // Use measured container size (accounts for tab bar, safe areas, nav chrome).
  // Fall back to window-based estimate before first layout fires.
  const cw = container.width || width - insets.left - insets.right;
  const ch = container.height || height - insets.top - insets.bottom - TAB_BAR_HEIGHT_ESTIMATE;

  const sciPanelRatio = isLandscape && showScientific ? SCI_PANEL_WIDTH_RATIO : 0;
  const calcWidth = isLandscape && showScientific ? cw * (1 - sciPanelRatio) : cw;

  // Width-based: how wide each button can be given the column count
  const buttonSize = (calcWidth - GAP * (COLS + 1)) / COLS;

  // Portrait scientific: share available height equally across all 10 rows (5 sci + 5 basic)
  const portraitSciSharedHeight =
    !isLandscape && showScientific && ch > 0
      ? Math.max(
          (ch -
            PORTRAIT_SCI_DISPLAY_HEIGHT -
            (ROWS - 1) * GAP -
            2 * GAP -
            (ROWS - 1) * SCIENTIFIC_ROW_GAP_EXTRA -
            PORTRAIT_SCI_PADDING) /
            (ROWS + ROWS),
          PORTRAIT_SCI_SHARED_HEIGHT_MIN,
        )
      : null;

  // Height-based: how tall each button can be to fit all rows
  const buttonHeight = isLandscape
    ? (ch - 72 - 12 - GAP * (ROWS + 1)) / ROWS // 12 = paddingTop on row, 72 = display reserve
    : (portraitSciSharedHeight ?? buttonSize);

  // Landscape: scientific panel on the left at 45% width
  const sciButtonSize =
    isLandscape && showScientific
      ? (cw * sciPanelRatio - GAP * (SCI_COLS_LANDSCAPE + 1)) / SCI_COLS_LANDSCAPE
      : 0;

  // Portrait: 6-col panel, paddingHorizontal=12 each side, row gap = buttonSize*0.12
  // Solve: 6*bs + 5*(bs*0.12) + 24 = cw → bs = (cw-24)/6.6
  const sciPortraitButtonSize =
    !isLandscape && showScientific
      ? (cw - 24) / (SCI_COLS_PORTRAIT + (SCI_COLS_PORTRAIT - 1) * 0.12)
      : 0;
  const sciPortraitButtonHeight = portraitSciSharedHeight ?? 0;

  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!state.overwrite || state.tokens.length > 0) return;
    if (state.current === '0' || state.current === 'Error') return;
    if (historyTimer.current) clearTimeout(historyTimer.current);
    historyTimer.current = setTimeout(() => pushHistory('', state.current), 500);
    return () => {
      if (historyTimer.current) clearTimeout(historyTimer.current);
    };
  }, [state.current, state.overwrite]);

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .onEnd((evt) => {
      if (Math.abs(evt.translationX) > SWIPE_THRESHOLD_X && Math.abs(evt.translationY) < SWIPE_THRESHOLD_Y) {
        dispatch({ type: ACTIONS.DELETE_DIGIT });
      }
    });

  const expressionText = useMemo(
    () =>
      state.tokens
        .map((t) => (t.type === 'number' ? formatNumber(t.value, settings.precision) : t.value))
        .join(' '),
    [state.tokens, settings.precision],
  );

  const buttonHandlers = useMemo(
    () => BUTTONS.map((btn) => () => dispatch(btn.action)),
    [dispatch],
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={[styles.row, isLandscape && styles.rowLandscape]} onLayout={onLayout}>
        {isLandscape && showScientific && (
          <ScientificPanel
            orientation="landscape"
            dispatch={dispatch}
            buttonSize={sciButtonSize}
            buttonHeight={buttonHeight}
            angleMode={state.angleMode}
            memory={state.memory}
          />
        )}

        <View style={{ flex: 1, alignSelf: 'stretch' }}>
          <GestureDetector gesture={swipe}>
            <View
              style={[
                styles.display,
                isLandscape && styles.displayLandscape,
                !isLandscape && showScientific && { flex: 0, height: PORTRAIT_SCI_DISPLAY_HEIGHT },
              ]}
            >
              <View style={[styles.indicators, isLandscape && styles.indicatorsLandscape]}>
                {state.memory !== '0' && (
                  <ThemedText
                    variant={isLandscape ? 'indicatorLandscape' : 'indicator'}
                    style={{ color: colors.expressionText }}
                  >
                    M
                  </ThemedText>
                )}
                {showScientific && state.angleMode === 'rad' && (
                  <ThemedText
                    variant={isLandscape ? 'indicatorLandscape' : 'indicator'}
                    style={{ color: colors.expressionText }}
                  >
                    RAD
                  </ThemedText>
                )}
              </View>
              <ThemedText
                variant={isLandscape ? 'expressionLandscape' : 'expression'}
                style={{ color: colors.expressionText }}
                numberOfLines={1}
              >
                {expressionText}
              </ThemedText>
              <ThemedText
                variant={isLandscape ? 'currentLandscape' : 'current'}
                style={[styles.currentBase, { color: colors.currentText }]}
                adjustsFontSizeToFit
                numberOfLines={1}
                minimumFontScale={0.4}
              >
                {formatNumber(state.current, settings.precision)}
              </ThemedText>
            </View>
          </GestureDetector>

          {!isLandscape && showScientific && (
            <ScientificPanel
              orientation="portrait"
              dispatch={dispatch}
              buttonSize={sciPortraitButtonSize}
              buttonHeight={sciPortraitButtonHeight}
              angleMode={state.angleMode}
              memory={state.memory}
            />
          )}

          <View
            style={[
              styles.grid,
              { padding: GAP, gap: GAP },
              !isLandscape && showScientific && { paddingBottom: GAP / 2 },
            ]}
          >
            {BUTTONS.map((btn, index) => (
              <CalcButton
                key={btn.label}
                label={btn.label}
                type={btn.type}
                wide={btn.wide}
                buttonSize={buttonSize}
                buttonHeight={buttonHeight}
                hapticsEnabled={settings.hapticsEnabled}
                onPress={buttonHandlers[index]!}
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
  currentBase: { width: '100%', textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});